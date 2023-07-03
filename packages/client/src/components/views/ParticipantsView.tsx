import { Box, Button, Stack } from "@mui/material";
import { useGlobalState } from "../../hooks/useGLobalState";
import ParticipantsList from "../participants/ParticipantsList";
import ParticipantForm from "../participants/form/ParticipantForm";
import { useParticipantFormState } from "../../hooks/useParticipantFormState";
import { useDbId } from "../../hooks/useDbId";
import { useDB, useQuery } from "@vlcn.io/react";
import { Category } from "schema";
import ParticipantDetails from "../participants/ParticipantDetails";

function ParticipantsView() {
  const [participantsView, setParticipantsView] = useGlobalState((state) => [
    state.participantsView,
    state.setParticipantsView,
  ]);
  const [initFormData] = useParticipantFormState((state) => [state.initData]);
  const ctx = useDB(useDbId());
  const categories = useQuery<Category>(ctx, "SELECT * FROM categories");

  if (categories.error) {
    console.error("Could not get all categories");
  }

  if (participantsView === null) {
    return (
      <Stack height="100%">
        <Box sx={{ flexGrow: 1, overflowY: "scroll" }}>
          <ParticipantsList />
        </Box>
        <Button
          variant="contained"
          onClick={() => {
            initFormData(categories.data);
            setParticipantsView("form");
          }}
        >
          Add new participant
        </Button>
      </Stack>
    );
  }

  if (participantsView === "form") {
    return <ParticipantForm />;
  }

  return <ParticipantDetails id={participantsView} />;
}

export default ParticipantsView;
