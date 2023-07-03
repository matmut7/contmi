import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Participant } from "schema";

interface LocalParticipantState {
  localParticipant: Participant | null;
  setLocalParticipant: (value: Participant) => void;
  clearLocalParticipant: () => void;
}

export const useLocalParticipant = create(
  persist<LocalParticipantState>(
    (set) => ({
      localParticipant: null,
      setLocalParticipant: (value: Participant) =>
        set({ localParticipant: value }),
      clearLocalParticipant: () => {
        set({ localParticipant: null });
      },
    }),
    {
      name: "localParticipant",
    }
  )
);
