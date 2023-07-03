import { Category, Participant } from "schema";
import { create } from "zustand";
import { safeNumber, validateNameString } from "../utils/validators";
import { debounce } from "lodash";

type ParticipantInExpenseForm = Participant & {
  coefficient: string;
  amount: string;
};

type ParsedParticipantInExpenseForm = Participant & {
  coefficient: number;
  amount: string;
};

interface ExpenseFormData {
  name: string;
  totalAmount: string;
  authorId: Participant["id"];
  categoryId: Category["id"];
  participants: ParticipantInExpenseForm[];
}

interface ParsedExpenseFormData {
  name: string;
  totalAmount: number;
  authorId: Participant["id"];
  categoryId: Category["id"];
  participants: ParsedParticipantInExpenseForm[];
}

const initialExpenseFormData: ExpenseFormData = {
  name: "",
  totalAmount: "",
  authorId: "",
  categoryId: "default",
  participants: [],
};

type ExpenseFormState = ExpenseFormData & {
  setData: (data: Partial<ExpenseFormData>) => void;
  initData: (localParticipant: Participant) => void;
  setParticipant: (key: number, participant: ParticipantInExpenseForm) => void;
  getData: () => ExpenseFormData;
  getParsedData: () => ParsedExpenseFormData | null;
  getTotalParts: (data?: ParsedExpenseFormData) => number | null;
  updateAmounts: () => void;
  insertParticipant: (participant: ParticipantInExpenseForm) => void;
  validateForm: () => boolean;
  removeParticipant: (key: number) => void;
};

export const useExpenseFormState = create<ExpenseFormState>((set, get) => ({
  ...initialExpenseFormData,
  setData: (data) => set(data),
  initData: (localParticipant) =>
    set({ ...initialExpenseFormData, authorId: localParticipant.id }),
  setParticipant: (index, participant) => {
    const participants = get().participants;
    participants[index] = participant;
    set({ participants });
  },
  getData: () => {
    const { name, totalAmount, authorId, categoryId, participants } = get();
    return { name, totalAmount, authorId, categoryId, participants };
  },
  getParsedData: () => {
    const data = get().getData();
    try {
      return {
        ...data,
        totalAmount: safeNumber(data.totalAmount),
        participants: data.participants.map((participant) => ({
          ...participant,
          coefficient: safeNumber(participant.coefficient),
        })),
      };
    } catch {
      return null;
    }
  },
  getTotalParts: (data?: ParsedExpenseFormData) => {
    const parsedData = data ? data : get().getParsedData();
    if (!parsedData) {
      return null;
    } else {
      return parsedData.participants.reduce(
        (total, participant) => total + participant.coefficient,
        0
      );
    }
  },
  updateAmounts: debounce(() => {
    const parsedData = get().getParsedData();
    if (parsedData) {
      const totalParts = get().getTotalParts(parsedData) as number;
      set({
        participants: parsedData.participants.map((participant) => ({
          ...participant,
          coefficient: String(participant.coefficient),
          amount: String(
            (
              (parsedData.totalAmount / totalParts) *
              participant.coefficient
            ).toFixed(2)
          ),
        })),
      });
    }
  }, 500),
  insertParticipant: (participant) => {
    const participants = get().participants;
    if (participants.some((p) => p.id === participant.id)) {
      return;
    }
    set({ participants: [participant, ...participants] });
  },
  removeParticipant: (key) =>
    set((state) => ({
      participants: state.participants.filter((_, index) => index !== key),
    })),
  validateForm: () => {
    return get().getParsedData() !== null && validateNameString(get().name);
  },
}));
