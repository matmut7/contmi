import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useCategoryFormState } from "../../../hooks/useCategoryFormState";
import Grid2 from "@mui/material/Unstable_Grid2";
import { shallow } from "zustand/shallow";
import CategoryFormParticipantItem from "./CategoryFormParticipantItem";
import { useGlobalState } from "../../../hooks/useGLobalState";
import { useDB } from "@vlcn.io/react";
import { useDbId } from "../../../hooks/useDbId";
import { Category } from "schema";
import { nanoid } from "nanoid";

function CategoryForm() {
  const [name, participantsIndexes, setData, validateForm, getData] =
    useCategoryFormState(
      (state) => [
        state.name,
        [...state.participants.keys()],
        state.setData,
        state.validateForm,
        state.getData,
      ],
      shallow
    );
  const setCategoriesView = useGlobalState((state) => state.setCategoriesView);
  const ctx = useDB(useDbId());

  async function handleSubmit() {
    if (validateForm()) {
      const { name, participants } = getData();
      const category = (
        await ctx.db.execO<Category>(
          "INSERT INTO categories (id, name) VALUES (?, ?) RETURNING *",
          [nanoid(), name]
        )
      )[0];
      for (const participant of participants) {
        ctx.db.exec(
          "INSERT INTO participant_category_coefficients (participant_id, category_id, coefficient) VALUES (?, ?, ?)",
          [participant.id, category.id, participant.coefficient]
        );
      }
      setCategoriesView(null);
    }
  }

  return (
    <Stack spacing={2} height="100%">
      <Typography variant="h5">Create a category</Typography>
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
            {participantsIndexes.map((index) => (
              <Grid2 key={index} xs={12} sm={6} md={4}>
                <CategoryFormParticipantItem index={index} />
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
          onClick={() => setCategoriesView(null)}
        >
          Cancel
        </Button>
        <Button
          sx={{ flexGrow: 1, flexBasis: 1 }}
          color="success"
          variant="contained"
          onClick={handleSubmit}
        >
          Create category
        </Button>
      </Stack>
    </Stack>
  );
}

export default CategoryForm;
