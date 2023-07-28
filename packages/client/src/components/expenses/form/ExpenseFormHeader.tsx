import {
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import { useDB, useQuery } from "@vlcn.io/react";
import { Category, Participant } from "schema";
import { useDbId } from "../../../hooks/useDbId";
import Loading from "../../Loading";
import { useExpenseFormState } from "../../../hooks/useExpenseFormState";
import { shallow } from "zustand/shallow";

function ExpenseFormHeader() {
  const [name, amount, authorId, categoryId, setFormData, updateAmounts] =
    useExpenseFormState(
      ({ name, totalAmount, authorId, categoryId, setData, updateAmounts }) => [
        name,
        totalAmount,
        authorId,
        categoryId,
        setData,
        updateAmounts,
      ],
      shallow
    );

  const ctx = useDB(useDbId());
  const participants = useQuery<Participant>(ctx, "SELECT * FROM participants");
  const categories = useQuery<Category>(ctx, "SELECT * FROM categories");

  if (participants.loading || categories.loading) {
    return (
      <Box mt={4}>
        <Loading text="" />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Grid2 container spacing={2}>
        <Grid2 xs={12} md={6}>
          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(event) => setFormData({ name: event.target.value })}
          />
        </Grid2>
        <Grid2 xs={12} md={6}>
          <TextField
            label="Amount"
            fullWidth
            inputProps={{ inputMode: "numeric" }}
            onChange={(event) => {
              setFormData({ totalAmount: event.target.value });
              updateAmounts();
            }}
            value={amount}
          />
        </Grid2>
        <Grid2 xs={6} md={6}>
          <FormControl fullWidth>
            <InputLabel id="authorLabel">Author</InputLabel>
            <Select
              label="Author"
              labelId="authorLabel"
              onChange={(event) =>
                setFormData({
                  authorId: event.target.value,
                })
              }
              value={authorId}
            >
              {participants.data.map((participant) => (
                <MenuItem key={participant.id} value={participant.id}>
                  {participant.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid2>
        <Grid2 xs={6} md={6}>
          <FormControl fullWidth>
            <InputLabel id="categorylabel">Category</InputLabel>
            <Select
              label="Category"
              labelId="categoryId"
              value={categoryId}
              onChange={(event) =>
                setFormData({
                  categoryId: event.target.value,
                })
              }
            >
              {categories.data.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid2>
      </Grid2>
    </Paper>
  );
}

export default ExpenseFormHeader;
