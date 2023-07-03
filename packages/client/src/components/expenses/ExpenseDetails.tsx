import { useDB, useQuery } from "@vlcn.io/react";
import { useDbId } from "../../hooks/useDbId";
import Loading from "../Loading";
import { Expense, Participant } from "schema";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import { useGlobalState } from "../../hooks/useGLobalState";

interface Props {
  id: Expense["id"];
}

function ExpenseDetails({ id }: Props) {
  const setExpensesView = useGlobalState((state) => state.setExpensesView);
  const ctx = useDB(useDbId());
  const expense = useQuery<
    Expense & { author_name: string; category_name: string }
  >(
    ctx,
    `
SELECT expenses.*, participants.name AS author_name, categories.name AS category_name
FROM expenses
JOIN participants ON participants.id = expenses.author_id
JOIN categories ON categories.id = expenses.category_id
WHERE expenses.id = ?`,
    [id]
  );
  const participants = useQuery<Participant & { coefficient: number }>(
    ctx,
    `
SELECT participants.*, participant_expense_coefficients.coefficient
FROM participants
JOIN participant_expense_coefficients ON participants.id = participant_expense_coefficients.participant_id
WHERE participant_expense_coefficients.expense_id = ?;
`,
    [id]
  );

  async function handleDelete() {
    ctx.db.exec("DELETE FROM expenses WHERE id = ?", [id]);
    ctx.db.exec(
      "DELETE FROM participant_expense_coefficients WHERE expense_id = ?",
      [id]
    );
    setExpensesView(null);
  }

  if (expense.loading || participants.loading) {
    return <Loading text="Loading expense details" />;
  }

  const totalParts = participants.data.reduce(
    (total, participant) => total + participant.coefficient,
    0
  );

  if (expense.error) {
    console.error(expense.error);
  }

  if (participants.error) {
    console.error(participants.error);
  }

  if (expense.data.length !== 1) {
    console.error("Multiple or no result for expense id", id, expense.data);
  }

  return (
    <Stack height="100%">
      <Box sx={{ flexGrow: 1, overflowY: "scroll" }}>
        <Stack sx={{ height: "100%" }} spacing={2}>
          <Paper sx={{ p: 2 }}>
            <Stack direction="column">
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h5">{expense.data[0].name}</Typography>
                <Typography variant="h5">{expense.data[0].amount}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle1">
                  in {expense.data[0].category_name}
                </Typography>
                <Typography variant="subtitle1">
                  by {expense.data[0].author_name}
                </Typography>
              </Stack>
            </Stack>
          </Paper>
          <Box sx={{ flexGrow: 1, overflowY: "scroll" }}>
            <Grid2 container spacing={1} disableEqualOverflow>
              {participants.data.map((participant) => (
                <Grid2 key={participant.id} xs={12} md={4}>
                  <Paper sx={{ p: 1 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography variant="h6">{participant.name}</Typography>
                      <Stack direction="column" alignItems="end">
                        <Box>coef: {participant.coefficient}</Box>
                        <Box>
                          value:{" "}
                          {(
                            (expense.data[0].amount / totalParts) *
                            participant.coefficient
                          ).toFixed(2)}
                        </Box>
                      </Stack>
                    </Stack>
                  </Paper>
                </Grid2>
              ))}
            </Grid2>
          </Box>
        </Stack>
      </Box>
      <Stack direction="row" justifyContent="space-evenly" spacing={2}>
        <Button
          variant="outlined"
          sx={{ flexGrow: 1, flexBasis: 1 }}
          onClick={() => setExpensesView(null)}
        >
          Back
        </Button>
        <Button
          variant="contained"
          color="error"
          sx={{ flexGrow: 1, flexBasis: 1 }}
          onClick={handleDelete}
        >
          Delete
        </Button>
      </Stack>
    </Stack>
  );
}

export default ExpenseDetails;
