import { Paper, Stack, Typography, TextField, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useExpenseFormState } from "../../../hooks/useExpenseFormState";
import { shallow } from "zustand/shallow";

interface Props {
  index: number;
}

function ParticipantFormItem({ index }: Props) {
  const setParticipant = useExpenseFormState((state) => state.setParticipant);
  const updateAmounts = useExpenseFormState((state) => state.updateAmounts);
  const removeParticipant = useExpenseFormState(
    (state) => state.removeParticipant
  );
  const participantData = useExpenseFormState(
    (state) => state.participants[index],
    shallow
  );

  return (
    <Paper sx={{ p: 2 }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        justifyContent="space-between"
      >
        <Stack direction="column" spacing={2}>
          <Typography variant="h6">{participantData.name}</Typography>
          <IconButton onClick={() => removeParticipant(index)}>
            <Close color="error" />
          </IconButton>
        </Stack>
        <Stack direction="column" spacing={2} alignItems="end">
          <TextField
            fullWidth
            label="coefficient"
            value={participantData.coefficient}
            onChange={(event) => {
              setParticipant(index, {
                ...participantData,
                coefficient: event.target.value,
              });
              updateAmounts();
            }}
          />
          <Typography>amount: {participantData.amount}</Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default ParticipantFormItem;
