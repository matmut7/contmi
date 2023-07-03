import { useDB, useQuery } from "@vlcn.io/react";
import { useDbId } from "../../hooks/useDbId";
import Loading from "../Loading";
import { Category, Participant } from "schema";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import { useGlobalState } from "../../hooks/useGLobalState";

interface Props {
  id: Category["id"];
}

function CategoryDetails({ id }: Props) {
  const setCategoriesView = useGlobalState((state) => state.setCategoriesView);
  const ctx = useDB(useDbId());
  const category = useQuery<Category>(
    ctx,
    `
SELECT *
FROM categories c
WHERE c.id = ?`,
    [id]
  );
  const participants = useQuery<Participant & { coefficient: number }>(
    ctx,
    `
SELECT p.*, pcc.coefficient
FROM participants p
JOIN participant_category_coefficients pcc ON pcc.participant_id = p.id
WHERE pcc.category_id = ?
`,
    [id]
  );

  async function handleDelete() {
    if (id === "default") {
      console.error("Could not delete the default category");
      return;
    }
    const relatedExpenses = await ctx.db.execO(
      `SELECT * FROM expenses e
      WHERE e.category_id = ?`,
      [id]
    );
    if (relatedExpenses.length !== 0) {
      console.error("Could not remove a category who is used by expenses");
      return;
    }
    ctx.db.exec("DELETE FROM categories WHERE id = ?", [id]);
    ctx.db.exec(
      "DELETE FROM participant_category_coefficients WHERE category_id = ?",
      [id]
    );
    setCategoriesView(null);
  }

  if (category.loading || participants.loading) {
    return <Loading text="Loading category details" />;
  }

  if (category.error) {
    console.error(category.error);
  }

  if (participants.error) {
    console.error(participants.error);
  }

  if (category.data.length !== 1) {
    console.error("Multiple or no result for category id", id, category.data);
  }

  return (
    <Stack height="100%">
      <Box sx={{ flexGrow: 1, overflowY: "scroll" }}>
        <Stack sx={{ height: "100%" }} spacing={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h5">{category.data[0].name}</Typography>
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
                      <Box>coef: {participant.coefficient}</Box>
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
          onClick={() => setCategoriesView(null)}
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

export default CategoryDetails;
