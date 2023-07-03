import { Stack, Box, Button } from "@mui/material";
import { useGlobalState } from "../../hooks/useGLobalState";
import CategoriesList from "../categories/CategoriesList";
import CategoryDetails from "../categories/CategoryDetails";
import { useCategoryFormState } from "../../hooks/useCategoryFormState";
import { useDB, useQuery } from "@vlcn.io/react";
import { Participant } from "schema";
import { useDbId } from "../../hooks/useDbId";
import CategoryForm from "../categories/form/CategoryForm";

function CategoriesView() {
  const [categoriesView, setCategoriesView] = useGlobalState((state) => [
    state.categoriesView,
    state.setCategoriesView,
  ]);
  const [initFormData] = useCategoryFormState((state) => [state.initData]);
  const ctx = useDB(useDbId());
  const participants = useQuery<Participant>(ctx, "SELECT * FROM participants");

  if (participants.error) {
    console.error("Could not get all categories");
  }

  if (categoriesView === null) {
    return (
      <Stack height="100%">
        <Box sx={{ flexGrow: 1, overflowY: "scroll" }}>
          <CategoriesList />
        </Box>
        <Button
          variant="contained"
          onClick={() => {
            initFormData(participants.data);
            setCategoriesView("form");
          }}
        >
          Add new category
        </Button>
      </Stack>
    );
  }

  if (categoriesView === "form") {
    return <CategoryForm />;
  }

  return <CategoryDetails id={categoriesView} />;
}

export default CategoriesView;
