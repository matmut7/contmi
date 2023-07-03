import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import { useDB, useQuery } from "@vlcn.io/react";
import { Expense, Participant } from "schema";
import { useState } from "react";
import { useDbId } from "../../../hooks/useDbId";
import Loading from "../../Loading";
import ExpenseFormParticipantItem from "./ExpenseFormParticipantItem";
import ExpenseFormHeader from "./ExpenseFormHeader";
import { useExpenseFormState } from "../../../hooks/useExpenseFormState";
import { shallow } from "zustand/shallow";
import { useGlobalState } from "../../../hooks/useGLobalState";
import { nanoid } from "nanoid";

function ExpenseCreationForm() {
  const setFormData = useExpenseFormState((state) => state.setData);
  const getFormData = useExpenseFormState((state) => state.getData);
  const updateAmounts = useExpenseFormState((state) => state.updateAmounts);
  const validateForm = useExpenseFormState((state) => state.validateForm);
  const insertParticipant = useExpenseFormState(
    (state) => state.insertParticipant
  );
  const participantsIndexes = useExpenseFormState(
    (state) => [...state.participants.keys()],
    shallow
  );
  const [addParticipant, setAddParticipant] = useState<string>("");

  const setExpensesView = useGlobalState((state) => state.setExpensesView);

  const ctx = useDB(useDbId());
  const participants = useQuery<Participant>(ctx, "SELECT * FROM participants");

  async function getCoefficientForParticipant(
    participantId: Participant["id"]
  ) {
    return (
      await ctx.db.execO<{ coefficient: string }>(
        `SELECT coefficient
         FROM participant_category_coefficients
         WHERE participant_id = ? AND category_id = ?`,
        [participantId, getFormData().categoryId]
      )
    )[0].coefficient;
  }

  async function handleInsertParticipant(id: number) {
    insertParticipant({
      ...participants.data[id],
      coefficient: await getCoefficientForParticipant(participants.data[id].id),
      amount: "",
    });
  }

  async function insertAllParticipants() {
    const allParticipants = await Promise.all(
      participants.data.map(async (participant) => ({
        ...participant,
        coefficient: await getCoefficientForParticipant(participant.id),
        amount: "",
      }))
    );
    setFormData({
      participants: allParticipants,
    });
    updateAmounts();
  }

  async function handleSubmit() {
    if (validateForm()) {
      const { name, participants, authorId, categoryId, totalAmount } =
        getFormData();
      const expense = (
        await ctx.db.execO<Expense>(
          "INSERT INTO expenses (id, name, author_id, amount, category_id) VALUES (?, ?, ?, ?, ?) RETURNING *",
          [nanoid(), name, authorId, totalAmount, categoryId]
        )
      )[0];
      for (const participant of participants) {
        await ctx.db.exec(
          "INSERT INTO participant_expense_coefficients (participant_id, expense_id, coefficient) VALUES (?, ?, ?)",
          [participant.id, expense.id, participant.coefficient]
        );
      }
      setExpensesView(null);
    }
  }

  if (participants.loading) {
    return (
      <Box mt={4}>
        <Loading text="" />
      </Box>
    );
  }

  return (
    <Stack spacing={2} height="100%">
      <Typography variant="h5">Create an expense</Typography>
      <ExpenseFormHeader />
      <Paper sx={{ p: 2, height: "100%", overflow: "scroll" }}>
        <Stack sx={{ flexGrow: 1 }} direction="column" spacing={2}>
          <FormControl>
            <InputLabel id="add-participant-label">Add participant</InputLabel>
            <Select
              label="Add participant"
              labelId="add-participant-label"
              onChange={(event) => {
                handleInsertParticipant(+event.target.value);
                updateAmounts();
                setAddParticipant("");
              }}
              value={addParticipant}
            >
              {participants.data.map((participant, index) => (
                <MenuItem key={index} value={index}>
                  {participant.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" justifyContent="center" spacing={2}>
            <Button variant="outlined" onClick={insertAllParticipants}>
              Insert all
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setFormData({ participants: [] })}
            >
              Remove all
            </Button>
          </Stack>
          <Box>
            <Grid2 container spacing={2}>
              {participantsIndexes.map((index) => (
                <Grid2 key={index} xs={12} sm={6} md={4}>
                  <ExpenseFormParticipantItem index={index} />
                </Grid2>
              ))}
            </Grid2>
          </Box>
        </Stack>
      </Paper>
      <Stack spacing={2} direction="row" justifyContent="space-evenly">
        <Button
          sx={{ flexGrow: 1, flexBasis: 1 }}
          variant="outlined"
          color="error"
          onClick={() => setExpensesView(null)}
        >
          Cancel
        </Button>
        <Button
          sx={{ flexGrow: 1, flexBasis: 1 }}
          color="success"
          variant="contained"
          onClick={handleSubmit}
        >
          Create expense
        </Button>
      </Stack>
    </Stack>
  );
}

export default ExpenseCreationForm;
