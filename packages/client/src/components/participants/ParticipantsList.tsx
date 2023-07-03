import { ListItemButton, ListItemText, Paper, Stack } from "@mui/material";
import Loading from "../Loading";
import { useGlobalState } from "../../hooks/useGLobalState";
import { useDB, useQuery } from "@vlcn.io/react";
import { useDbId } from "../../hooks/useDbId";
import { Participant } from "schema";

function ParticipantsList() {
  const setParticipantsView = useGlobalState(
    (state) => state.setParticipantsView
  );
  const ctx = useDB(useDbId());
  const participants = useQuery<Participant>(ctx, "SELECT * FROM participants");

  if (participants.loading) {
    return <Loading text="Loading participants list" />;
  }

  return (
    <Stack spacing={1}>
      {participants.data.map((participant) => (
        <Paper key={participant.id}>
          <ListItemButton onClick={() => setParticipantsView(participant.id)}>
            <ListItemText primary={participant.name} />
          </ListItemButton>
        </Paper>
      ))}
    </Stack>
  );
}

export default ParticipantsList;
