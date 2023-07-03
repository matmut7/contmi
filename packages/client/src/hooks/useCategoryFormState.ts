import { create } from "zustand";
import { Category, Participant } from "schema";
import { safeNumber, validateNameString } from "../utils/validators";

type ParticipantInCategoryForm = Participant & {
  coefficient: string;
};

type ParsedParticipantInCategoryForm = Participant & {
  coefficient: number;
};

interface CategoryFormData {
  name: string;
  participants: ParticipantInCategoryForm[];
}

interface ParsedCategoryFormData {
  name: string;
  participants: ParsedParticipantInCategoryForm[];
}

const initialCategoryFormData = {
  name: "",
  participants: [],
};

type CategoryFormState = CategoryFormData & {
  setData: (data: Partial<CategoryFormData>) => void;
  setParticipant: (
    index: number,
    participant: ParticipantInCategoryForm
  ) => void;
  initData: (allParticipants: Category[]) => void;
  getData: () => CategoryFormData;
  getParsedData: () => ParsedCategoryFormData | null;
  validateForm: () => boolean;
};

export const useCategoryFormState = create<CategoryFormState>((set, get) => ({
  ...initialCategoryFormData,
  setData: (data) => set(data),
  setParticipant: (index, participant) => {
    const participants = get().participants;
    participants[index] = participant;
    set({ participants: participants });
  },
  initData: (allParticipants) =>
    set({
      ...initialCategoryFormData,
      participants: allParticipants.map((participant) => ({
        ...participant,
        coefficient: "1",
      })),
    }),
  getData: () => {
    const { name, participants } = get();
    return { name, participants };
  },
  getParsedData: () => {
    const data = get().getData();
    try {
      return {
        ...data,
        participants: data.participants.map((participant) => ({
          ...participant,
          coefficient: safeNumber(participant.coefficient),
        })),
      };
    } catch {
      return null;
    }
  },
  validateForm: () => {
    return get().getParsedData() !== null && validateNameString(get().name);
  },
}));
