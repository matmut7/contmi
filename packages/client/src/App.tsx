import {
  Container,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  CssBaseline,
} from "@mui/material";
import { Balance, Payments, Settings } from "@mui/icons-material";
import LoginParticipant from "./components/login/LoginParticipant";
import { useLocalParticipant } from "./hooks/useLocalParticipant";
import { useState } from "react";
import ExpensesView from "./components/views/ExpensesView.tsx";
import { useParticipants } from "./hooks/useParticipants";
import BalanceView from "./components/views/BalanceView.tsx";
import SettingsView from "./components/views/SettingsView.tsx";

function App() {
  const { localParticipant } = useLocalParticipant();
  const [navigationState, setNavigationState] = useState<number>(0);
  const participants = useParticipants();

  if (
    !localParticipant ||
    (participants.data &&
      !participants.data.some(
        (participant) => participant.id === localParticipant.id
      ))
  ) {
    return (
      <Container
        maxWidth="md"
        sx={{
          mt: "4rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <LoginParticipant />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" disableGutters>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          width: "100%",
        }}
      >
        <CssBaseline />
        <Box
          sx={{
            p: 1,
            flexGrow: 1,
            overflowY: "scroll",
          }}
        >
          {navigationState === 0 && <ExpensesView />}
          {navigationState === 1 && <BalanceView />}
          {navigationState === 2 && <SettingsView />}
        </Box>
        <BottomNavigation
          sx={{ flexShrink: 0 }}
          showLabels
          value={navigationState}
          onChange={(_event, newValue) => setNavigationState(newValue)}
        >
          <BottomNavigationAction label="Expenses" icon={<Payments />} />
          <BottomNavigationAction label="Balance" icon={<Balance />} />
          <BottomNavigationAction label="Settings" icon={<Settings />} />
        </BottomNavigation>
      </Box>
    </Container>
  );
}

export default App;
