import { useDB, useQuery } from "@vlcn.io/react";
import { useDbId } from "../../hooks/useDbId";
import { Participant } from "schema";
import { Box, Paper, Stack, Typography } from "@mui/material";
import Loading from "../Loading";

function BalanceView() {
  const ctx = useDB(useDbId());
  const participants = useQuery<Participant & { balance: number }>(
    ctx,
    // this is chatGPT's art obviously
    `
SELECT 
  p.*, 
  COALESCE(
    ROUND(
      SUM(
        CASE WHEN e.author_id = p.id THEN e.amount - (
          e.amount * pec.coefficient / totalCoefficients.total
        ) ELSE - e.amount * pec.coefficient / totalCoefficients.total END
      ), 
      2
    ), 
    0
  ) AS balance 
FROM 
  participants p 
  LEFT JOIN participant_expense_coefficients pec ON p.id = pec.participant_id 
  LEFT JOIN expenses e ON pec.expense_id = e.id 
  LEFT JOIN (
    SELECT 
      expense_id, 
      SUM(coefficient) AS total 
    FROM 
      participant_expense_coefficients 
    GROUP BY 
      expense_id
  ) AS totalCoefficients ON totalCoefficients.expense_id = e.id 
GROUP BY 
  p.id;
`
  );

  if (participants.loading) {
    return <Loading text="Loading participants" />;
  }

  if (participants.error) {
    console.error(participants.error);
    return <></>;
  }

  const maxBalance = participants.data.reduce((max, p) => {
    const abs = Math.abs(p.balance);
    return abs > max ? abs : max;
  }, 0);

  return (
    <Stack direction="column" spacing={2}>
      {participants.data.map((p) => {
        const isPositive = p.balance > 0;
        const isNull = p.balance === 0;
        const width = `${(Math.abs(p.balance) / maxBalance) * 50}%`;
        return (
          <Paper key={p.id}>
            <Stack alignItems="center">
              <Typography variant="h6">{p.name}</Typography>
              {!isNull && (
                <Box
                  sx={{
                    backgroundColor: isPositive ? "green" : "red",
                    transform: `translateX(${isPositive ? "+" : "-"}50%)`,
                  }}
                  width={width}
                  height="2rem"
                />
              )}
              <Typography
                color={isNull ? "grey" : isPositive ? "green" : "red"}
                variant="h5"
              >
                {p.balance}
              </Typography>
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );
}

export default BalanceView;
