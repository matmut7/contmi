import {
  Autocomplete,
  Button,
  CircularProgress,
  FormControl,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useDB, useQuery } from "@vlcn.io/react";
import { useState } from "react";
import { Category, Participant } from "schema";
import { useDbId } from "../../hooks/useDbId";
import { useLocalParticipant } from "../../hooks/useLocalParticipant";
import { validateNameString } from "../../utils/validators";
import { nanoid } from "nanoid";

function LoginParticipant() {
  const [value, setValue] = useState<string>("");
  const ctx = useDB(useDbId());
  const participants = useQuery<Participant>(ctx, "SELECT * FROM participants");
  const { setLocalParticipant } = useLocalParticipant();
  const [loading, setLoading] = useState<boolean>(false);
  const [nameIsValid, setNameIsValid] = useState<boolean>(false);

  function validateName(name: string) {
    setNameIsValid(validateNameString(name));
  }

  async function handleSubmit() {
    if (!nameIsValid) return;
    setLoading(true);
    const name = value;
    const existingParticipants = participants.data.filter(
      (participant) => participant.name === name
    );
    if (existingParticipants.length === 1) {
      setLocalParticipant(existingParticipants[0]);
    } else {
      const createdParticipant = (
        await ctx.db.execO<Participant>(
          "INSERT INTO participants (id, name) VALUES (?, ?) RETURNING *",
          [nanoid(), name]
        )
      )[0];
      const categories = await ctx.db.execO<Category>(
        "SELECT * FROM categories"
      );
      for (const category of categories) {
        ctx.db.exec(
          "INSERT INTO participant_category_coefficients (participant_id, category_id, coefficient) VALUES (?, ?, ?)",
          [createdParticipant.id, category.id, "1"]
        );
      }
      setLocalParticipant(createdParticipant);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter") {
      handleSubmit();
    }
  }

  if (participants.loading) {
    return (
      <>
        <Typography variant="subtitle1" gutterBottom>
          Loading existing participants
        </Typography>
        <CircularProgress />
      </>
    );
  }

  return (
    <FormControl fullWidth>
      <Stack spacing={2}>
        <Autocomplete
          id="participant-select"
          freeSolo
          autoFocus
          options={participants.data.map((participant) => participant.name)}
          renderInput={(params) => (
            <TextField
              {...params}
              error={!nameIsValid && value !== ""}
              autoFocus
              helperText={
                !nameIsValid &&
                value !== "" &&
                "Choose a name with only letters and whitespaces"
              }
              label="Who are you?"
            />
          )}
          onKeyDown={(event) => handleKeyDown(event)}
          inputValue={value}
          onInputChange={(_event, newValue) => {
            setValue(newValue);
            validateName(newValue);
          }}
        />
        <Button
          variant="contained"
          disabled={loading || !nameIsValid}
          onClick={handleSubmit}
        >
          {!loading ? "Continue" : <CircularProgress color="inherit" />}
        </Button>
      </Stack>
    </FormControl>
  );
}

export default LoginParticipant;
