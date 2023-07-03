import { useDB, useQuery } from "@vlcn.io/react";
import { useDbId } from "../../hooks/useDbId";
import { Expense } from "schema";
import { ListItemButton, ListItemText, Paper, Stack } from "@mui/material";
import { useParticipants } from "../../hooks/useParticipants";
import { useGlobalState } from "../../hooks/useGLobalState";
import Loading from "../Loading";

function ExpensesList() {
  const ctx = useDB(useDbId());
  const expenses = useQuery<
    Expense & { author_name: string; category_name: string }
  >(
    ctx,
    `
SELECT expenses.*, participants.name AS author_name, categories.name AS category_name
FROM expenses
JOIN participants ON participants.id = expenses.author_id
JOIN categories ON categories.id = expenses.category_id`
  );
  const participants = useParticipants();
  const setExpensesView = useGlobalState((state) => state.setExpensesView);

  if (participants.loading) {
    return <Loading text="Loading expenses list" />;
  }

  return (
    <Stack spacing={1}>
      {expenses.data.map((expense) => (
        <Paper key={expense.id}>
          <ListItemButton onClick={() => setExpensesView(expense.id)}>
            <ListItemText
              primary={expense.name}
              secondary={`by ${expense.author_name}`}
            />
            <ListItemText
              sx={{ textAlign: "end" }}
              primary={expense.amount.toFixed(2)}
              secondary={`in ${expense.category_name}`}
            />
          </ListItemButton>
        </Paper>
      ))}
    </Stack>
  );
}

export default ExpensesList;
