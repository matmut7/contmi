import { Paper, Stack, TextField, Typography } from "@mui/material";
import { useParticipantFormState } from "../../../hooks/useParticipantFormState";
import { shallow } from "zustand/shallow";

interface Props {
  index: number;
}

function ParticipantFormCategoryItem({ index }: Props) {
  const [categoryData, setCategory] = useParticipantFormState(
    (state) => [state.categories[index], state.setCategory],
    shallow
  );
  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="h5">{categoryData.name}</Typography>
        <TextField
          fullWidth
          label="coefficient"
          value={categoryData.coefficient}
          onChange={(event) =>
            setCategory(index, {
              ...categoryData,
              coefficient: event.target.value,
            })
          }
        />
      </Stack>
    </Paper>
  );
}

export default ParticipantFormCategoryItem;
