import { DBProvider } from "@vlcn.io/react";
import { StrictMode } from "react";
import { schema } from "schema/index";
import App from "./App";
import { endpoints } from "./database/endpoints";
import { useDbId } from "./hooks/useDbId";

function Root() {
  const dbid = useDbId();

  return (
    <DBProvider dbid={dbid} schema={schema} endpoints={endpoints}>
      <StrictMode>
        <App />
      </StrictMode>
    </DBProvider>
  );
}

export default Root;
