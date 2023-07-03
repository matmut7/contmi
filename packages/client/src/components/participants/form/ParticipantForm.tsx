import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useParticipantFormState } from "../../../hooks/useParticipantFormState";
import Grid2 from "@mui/material/Unstable_Grid2";
import { shallow } from "zustand/shallow";
import ParticipantFormCategoryItem from "./ParticipantFormCategoryItem";
import { useGlobalState } from "../../../hooks/useGLobalState";
import { useDB } from "@vlcn.io/react";
import { useDbId } from "../../../hooks/useDbId";
import { Participant } from "schema";
import { nanoid } from "nanoid";

function ParticipantForm() {
  const [name, categoriesIndexes, setData, validateForm, getData] =
    useParticipantFormState(
      (state) => [
        state.name,
        [...state.categories.keys()],
        state.setData,
        state.validateForm,
        state.getData,
      ],
      shallow
    );
  const setParticipantsView = useGlobalState(
    (state) => state.setParticipantsView
  );
  const ctx = useDB(useDbId());

  async function handleSubmit() {
    if (validateForm()) {
      const { name, categories } = getData();
      const participant = (
        await ctx.db.execO<Participant>(
          "INSERT INTO participants (id, name) VALUES (?, ?) RETURNING *",
          [nanoid(), name]
        )
      )[0];
      for (const category of categories) {
        ctx.db.exec(
          "INSERT INTO participant_category_coefficients (participant_id, category_id, coefficient) VALUES (?, ?, ?)",
          [participant.id, category.id, category.coefficient]
        );
      }
      setParticipantsView(null);
    }
  }

  return (
    <Stack spacing={2} height="100%">
      <Typography variant="h5">Create a participant</Typography>
      <Paper sx={{ p: 2 }}>
        <TextField
          fullWidth
          label="Name"
          value={name}
          onChange={(event) => setData({ name: event.target.value })}
        />
      </Paper>
      <Paper sx={{ p: 2, height: "100%", overflowY: "scroll" }}>
        <Box>
          <Grid2 container spacing={2}>
            {categoriesIndexes.map((index) => (
              <Grid2 key={index} xs={12} sm={6} md={4}>
                <ParticipantFormCategoryItem index={index} />
              </Grid2>
            ))}
          </Grid2>
        </Box>
      </Paper>
      <Stack spacing={2} direction="row" justifyContent="space-evenly">
        <Button
          sx={{ flexGrow: 1, flexBasis: 1 }}
          variant="outlined"
          color="error"
          onClick={() => setParticipantsView(null)}
        >
          Cancel
        </Button>
        <Button
          sx={{ flexGrow: 1, flexBasis: 1 }}
          color="success"
          variant="contained"
          onClick={handleSubmit}
        >
          Create participant
        </Button>
      </Stack>
    </Stack>
  );
}

export default ParticipantForm;
