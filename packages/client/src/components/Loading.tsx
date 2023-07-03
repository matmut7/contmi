import { Typography, CircularProgress, Box } from "@mui/material";

interface Props {
  text: string;
}

function Loading({ text }: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography variant="subtitle1" gutterBottom>
        {text}
      </Typography>
      <CircularProgress />
    </Box>
  );
}

export default Loading;
