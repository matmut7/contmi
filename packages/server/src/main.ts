import {
  ApplyChangesMsg,
  CreateOrMigrateMsg,
  EstablishOutboundStreamMsg,
  JsonSerializer,
} from "@vlcn.io/direct-connect-common";
import {
  DBCache,
  DefaultConfig,
  FSNotify,
  ServiceDB,
  SyncService,
} from "@vlcn.io/direct-connect-nodejs";
import cors from "cors";
import express from "express";
import { cryb64 } from "@vlcn.io/direct-connect-nodejs";
import { schema } from "schema";
import logger from "pino-http";

async function migrate() {
  const svcDb = new ServiceDB(DefaultConfig, true);
  const db = svcDb.__internal_getDb();
  db.transaction(() => {
    db.prepare(
      "INSERT OR IGNORE INTO schema (namespace, name, version, content, active) VALUES (?, ?, ?, ?, ?);"
    ).run(
      schema.namespace,
      schema.name,
      cryb64(schema.content),
      schema.content,
      schema.active ? 1 : 0
    );
  })();
}

console.log("registering migrations");
migrate();

const app = express();
app.use(express.json());
app.use(cors());
app.use(logger());

const svcDb = new ServiceDB(DefaultConfig, true);
const dbCache = new DBCache(DefaultConfig, (name, version) => {
  return svcDb.getSchema("default", name, version);
});
const fsNotify = new FSNotify(DefaultConfig, dbCache);
const syncSvc = new SyncService(DefaultConfig, dbCache, svcDb, fsNotify);
const serializer = new JsonSerializer();

app.post("/sync/changes", async (req, res) => {
  const msg = serializer.decode(req.body) as ApplyChangesMsg;
  const ret = syncSvc.applyChanges(msg);
  res.json(serializer.encode(ret));
});

app.post("/sync/create-or-migrate", async (req, res) => {
  const msg = serializer.decode(req.body) as CreateOrMigrateMsg;
  const ret = syncSvc.createOrMigrateDatabase(msg);
  res.json(serializer.encode(ret));
});

app.get("/sync/start-outbound-stream", async (req, res) => {
  req.log.info("starting outbound stream");
  const msg = serializer.decode(
    JSON.parse(decodeURIComponent(req.query.msg as string))
  ) as EstablishOutboundStreamMsg;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const [stream, initialResponse] = syncSvc.startOutboundStream(msg);
  res.write(`data: ${JSON.stringify(serializer.encode(initialResponse))}\n\n`);

  stream.addListener((changes) => {
    res.write(
      `data: ${JSON.stringify(serializer.encode(changes))}\n\n`,
      (err) => {
        if (err != null) {
          req.log.error(err);
          stream.close();
        }
      }
    );
  });

  req.on("close", () => {
    req.log.info("close outbound stream");
    stream.close();
  });
});

app.listen(3000, () => console.log(`Server listening on port 3000`));
