import { useDB, useQuery } from "@vlcn.io/react";
import { Participant } from "schema";
import { useDbId } from "./useDbId";

export function useParticipants() {
  const ctx = useDB(useDbId());
  const { data, error, loading } = useQuery<Participant>(
    ctx,
    "SELECT * FROM participants ORDER BY name ASC"
  );

  return { data, error, loading };
}
