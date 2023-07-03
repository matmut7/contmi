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
  console.log("Start outbound stream");
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
          console.error(err);
          stream.close();
        }
      }
    );
  });

  req.on("close", () => {
    console.log("Close outbound stream");
    stream.close();
  });
});

app.listen(3000, () =>
  console.log(`Server listening at http://localhost:3000`)
);
