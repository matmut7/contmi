import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
  } from "@mui/material";
  import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
  import { useDB, useQuery } from "@vlcn.io/react";
  import { Participant } from "schema";
  import { useState } from "react";
  import { useDbId } from "../../../hooks/useDbId";
  import ExpenseFormParticipantItem from "./ExpenseFormParticipantItem";
  import { useExpenseFormState } from "../../../hooks/useExpenseFormState";
  import { shallow } from "zustand/shallow";
  
  function ParticipantsList() {
    const setFormData = useExpenseFormState((state) => state.setData);
    const getFormData = useExpenseFormState((state) => state.getData);
    const updateAmounts = useExpenseFormState((state) => state.updateAmounts);
    const insertParticipant = useExpenseFormState(
      (state) => state.insertParticipant
    );
    const participantsIndexes = useExpenseFormState(
      (state) => [...state.participants.keys()],
      shallow
    );
    const [addParticipant, setAddParticipant] = useState<string>("");

    const ctx = useDB(useDbId());
    const participants = useQuery<Participant>(ctx, "SELECT * FROM participants");
  
    async function getCoefficientForParticipant(
      participantId: Participant["id"]
    ) {
      return (
        await ctx.db.execO<{ coefficient: string }>(
          `SELECT coefficient
           FROM participant_category_coefficients
           WHERE participant_id = ? AND category_id = ?`,
          [participantId, getFormData().categoryId]
        )
      )[0].coefficient;
    }
  
    async function handleInsertParticipant(id: number) {
      insertParticipant({
        ...participants.data[id],
        coefficient: await getCoefficientForParticipant(participants.data[id].id),
        amount: "",
      });
    }
  
    async function insertAllParticipants() {
      const allParticipants = await Promise.all(
        participants.data.map(async (participant) => ({
          ...participant,
          coefficient: await getCoefficientForParticipant(participant.id),
          amount: "",
        }))
      );
      setFormData({
        participants: allParticipants,
      });
      updateAmounts();
    }
  
  
    return (
    <Paper sx={{ p: 2, height: "100%", overflow: "scroll" }}>
        <Stack sx={{ flexGrow: 1 }} direction="column" spacing={2}>
        <FormControl>
            <InputLabel id="add-participant-label">Add participant</InputLabel>
            <Select
            label="Add participant"
            labelId="add-participant-label"
            onChange={(event) => {
                handleInsertParticipant(+event.target.value);
                updateAmounts();
                setAddParticipant("");
            }}
            value={addParticipant}
            >
            {participants.data.map((participant, index) => (
                <MenuItem key={index} value={index}>
                {participant.name}
                </MenuItem>
            ))}
            </Select>
        </FormControl>
        <Stack direction="row" justifyContent="center" spacing={2}>
            <Button variant="outlined" onClick={insertAllParticipants}>
            Insert all
            </Button>
            <Button
            variant="outlined"
            color="error"
            onClick={() => setFormData({ participants: [] })}
            >
            Remove all
            </Button>
        </Stack>
        <Box>
            <Grid2 container spacing={2}>
            {participantsIndexes.map((index) => (
                <Grid2 key={index} xs={12} sm={6} md={4}>
                <ExpenseFormParticipantItem index={index} />
                </Grid2>
            ))}
            </Grid2>
        </Box>
        </Stack>
    </Paper>
    );
  }
  
  export default ParticipantsList;
  