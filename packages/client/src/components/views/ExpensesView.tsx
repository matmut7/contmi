import { Box, Button, Stack } from "@mui/material";
import { useGlobalState } from "../../hooks/useGLobalState";
import ExpenseDetails from "../expenses/ExpenseDetails";
import ExpensesList from "../expenses/ExpensesList";
import ExpenseForm from "../expenses/form/ExpenseForm";
import { useExpenseFormState } from "../../hooks/useExpenseFormState";
import { useLocalParticipant } from "../../hooks/useLocalParticipant";

function ExpensesView() {
  const { expensesView, setExpensesView } = useGlobalState(
    ({ expensesView, setExpensesView }) => ({ expensesView, setExpensesView })
  );
  const initFormData = useExpenseFormState((state) => state.initData);
  const localParticipant = useLocalParticipant(
    (state) => state.localParticipant
  );

  if (localParticipant === null) {
    console.error(
      "Could not get localParticipant from Expenses tabs",
      localParticipant
    );
    return;
  }

  if (expensesView === "form") {
    return <ExpenseForm />;
  }

  if (expensesView === null) {
    return (
      <Stack height="100%">
        <Box sx={{ flexGrow: 1, overflowY: "scroll" }}>
          <ExpensesList />
        </Box>
        <Button
          variant="contained"
          onClick={() => {
            initFormData(localParticipant);
            setExpensesView("form");
          }}
        >
          Add new expense
        </Button>
      </Stack>
    );
  }

  return <ExpenseDetails id={expensesView} />;
}

export default ExpensesView;
