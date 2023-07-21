import worker from "@vlcn.io/direct-connect-browser/dedicated.worker.js?url";
import wasm from "@vlcn.io/crsqlite-wasm/crsqlite.wasm?url";

export const endpoints = {
  createOrMigrate: updatePort(
    new URL("/sync/create-or-migrate", window.location.origin)
  ),
  applyChanges: updatePort(new URL("/sync/changes", window.location.origin)),
  startOutboundStream: updatePort(
    new URL("/sync/start-outbound-stream", window.location.origin)
  ),
  // TODO production build won't work without this, isn't documented on Vulcan's repo
  worker: import.meta.env.DEV ? worker : undefined,
  wasm,
};

function updatePort(u: URL) {
  if (process.env.NODE_ENV !== "production") {
    u.port = "3000";
  }
  return u;
}
