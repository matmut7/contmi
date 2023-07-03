import { useDB, useQuery } from "@vlcn.io/react";
import { useDbId } from "../../hooks/useDbId";
import { Category } from "schema";
import { ListItemButton, ListItemText, Paper, Stack } from "@mui/material";
import { useGlobalState } from "../../hooks/useGLobalState";

function CategoriesList() {
  const ctx = useDB(useDbId());
  const categories = useQuery<Category>(ctx, "SELECT * FROM categories");
  const setCategoriesView = useGlobalState((state) => state.setCategoriesView);

  return (
    <Stack spacing={1}>
      {categories.data.map((category) => (
        <Paper key={category.id}>
          <ListItemButton onClick={() => setCategoriesView(category.id)}>
            <ListItemText primary={category.name} />
          </ListItemButton>
        </Paper>
      ))}
    </Stack>
  );
}

export default CategoriesList;
