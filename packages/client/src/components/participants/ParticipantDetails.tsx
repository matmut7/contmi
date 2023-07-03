import { useDB, useQuery } from "@vlcn.io/react";
import { useDbId } from "../../hooks/useDbId";
import Loading from "../Loading";
import { Category, Participant } from "schema";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import { useGlobalState } from "../../hooks/useGLobalState";

interface Props {
  id: Participant["id"];
}

function ParticipantDetails({ id }: Props) {
  const setParticipantsView = useGlobalState(
    (state) => state.setParticipantsView
  );
  const ctx = useDB(useDbId());
  const participant = useQuery<Participant>(
    ctx,
    `
SELECT *
FROM participants
WHERE participants.id = ?`,
    [id]
  );
  const categories = useQuery<Category & { coefficient: number }>(
    ctx,
    `
SELECT c.*, pcc.coefficient
FROM categories c
JOIN participant_category_coefficients pcc ON c.id = pcc.category_id
WHERE pcc.participant_id = ?;
`,
    [id]
  );

  async function handleDeleteParticipant() {
    const relatedExpenses = await ctx.db.execO(
      `SELECT * FROM expenses e
      JOIN participant_expense_coefficients pec ON e.id = pec.expense_id
      WHERE pec.participant_id = ?`,
      [id]
    );
    if (relatedExpenses.length !== 0) {
      console.error(
        "Could not remove a participant who is implied in expenses"
      );
      return;
    }
    ctx.db.exec("DELETE FROM participants WHERE id = ?", [id]);
    ctx.db.exec(
      "DELETE FROM participant_category_coefficients WHERE participant_id = ?",
      [id]
    );
    ctx.db.exec(
      "DELETE FROM participant_expense_coefficients WHERE participant_id = ?",
      [id]
    );
    setParticipantsView(null);
  }

  if (participant.loading || categories.loading) {
    return <Loading text="Loading participant details" />;
  }

  return (
    <Stack height="100%">
      <Box sx={{ flexGrow: 1, overflowY: "scroll" }}>
        <Stack sx={{ height: "100%" }} spacing={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h5">{participant.data[0].name}</Typography>
          </Paper>
          <Box sx={{ flexGrow: 1, overflowY: "scroll" }}>
            <Grid2 container spacing={1} disableEqualOverflow>
              {categories.data.map((category) => (
                <Grid2 key={category.id} xs={12} md={4}>
                  <Paper sx={{ p: 1 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography variant="h6">{category.name}</Typography>
                      <Box>coef: {category.coefficient}</Box>
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
          onClick={() => setParticipantsView(null)}
        >
          Back
        </Button>
        <Button
          variant="contained"
          color="error"
          sx={{ flexGrow: 1, flexBasis: 1 }}
          onClick={handleDeleteParticipant}
        >
          Delete
        </Button>
      </Stack>
    </Stack>
  );
}

export default ParticipantDetails;
