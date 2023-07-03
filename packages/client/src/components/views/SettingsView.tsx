import {
  Stack,
  Paper,
  ListItemButton,
  ListItemText,
  Button,
  Box,
} from "@mui/material";
import { SettingsViewValues, useGlobalState } from "../../hooks/useGLobalState";
import { useLocalParticipant } from "../../hooks/useLocalParticipant";
import ParticipantsView from "./ParticipantsView";
import CategoriesView from "./CategoriesView";

function SettingsView() {
  const [settingsView, setSettingsView] = useGlobalState((state) => [
    state.settingsView,
    state.setSettingsView,
  ]);
  const clearLocalParticipant = useLocalParticipant(
    (state) => state.clearLocalParticipant
  );

  if (settingsView === SettingsViewValues.Menu) {
    return (
      <Stack direction="column" spacing={2}>
        <Paper>
          <ListItemButton
            onClick={() => setSettingsView(SettingsViewValues.Participants)}
          >
            <ListItemText primary="Participants" />
          </ListItemButton>
        </Paper>
        <Paper>
          <ListItemButton
            onClick={() => setSettingsView(SettingsViewValues.Categories)}
          >
            <ListItemText primary="Categories" />
          </ListItemButton>
        </Paper>
        <Paper>
          <ListItemButton onClick={() => clearLocalParticipant()}>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </Paper>
      </Stack>
    );
  }

  return (
    <Stack height="100%" spacing={2} direction="column">
      <Box sx={{ flexGrow: 1, overflowY: "scroll" }}>
        {settingsView === SettingsViewValues.Participants ? (
          <ParticipantsView />
        ) : settingsView === SettingsViewValues.Categories ? (
          <CategoriesView />
        ) : (
          <></>
        )}
      </Box>
      <Button
        variant="outlined"
        onClick={() => setSettingsView(SettingsViewValues.Menu)}
      >
        Back to settings menu
      </Button>
    </Stack>
  );
}

export default SettingsView;
