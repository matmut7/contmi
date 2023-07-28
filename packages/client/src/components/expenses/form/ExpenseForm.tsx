import {
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import { useDB, useQuery } from "@vlcn.io/react";
import { Expense, Participant } from "schema";
import { useDbId } from "../../../hooks/useDbId";
import Loading from "../../Loading";
import ExpenseFormHeader from "./ExpenseFormHeader";
import { useExpenseFormState } from "../../../hooks/useExpenseFormState";
import { useGlobalState } from "../../../hooks/useGLobalState";
import { nanoid } from "nanoid";
import ParticipantsList from "./ExpenseFormParticipantList";

function ExpenseCreationForm() {
  const getFormData = useExpenseFormState((state) => state.getData);
  const validateForm = useExpenseFormState((state) => state.validateForm);

  const setExpensesView = useGlobalState((state) => state.setExpensesView);

  const ctx = useDB(useDbId());
  const participants = useQuery<Participant>(ctx, "SELECT * FROM participants");

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
      <ParticipantsList />
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
