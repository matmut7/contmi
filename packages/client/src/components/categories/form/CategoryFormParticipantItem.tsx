import { Paper, Stack, TextField, Typography } from "@mui/material";
import { useCategoryFormState } from "../../../hooks/useCategoryFormState";
import { shallow } from "zustand/shallow";

interface Props {
  index: number;
}

function CategoryFormParticipantItem({ index }: Props) {
  const [participantData, setParticipant] = useCategoryFormState(
    (state) => [state.participants[index], state.setParticipant],
    shallow
  );
  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="h5">{participantData.name}</Typography>
        <TextField
          fullWidth
          label="coefficient"
          value={participantData.coefficient}
          onChange={(event) =>
            setParticipant(index, {
              ...participantData,
              coefficient: event.target.value,
            })
          }
        />
      </Stack>
    </Paper>
  );
}

export default CategoryFormParticipantItem;
