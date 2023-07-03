import { Category, Expense, Participant } from "schema";
import { create } from "zustand";

export enum SettingsViewValues {
  Participants,
  Categories,
  Menu,
}

interface GlobalState {
  expensesView: Expense["id"] | null;
  setExpensesView: (value: GlobalState["expensesView"]) => void;
  participantsView: Participant["id"] | null;
  setParticipantsView: (value: GlobalState["participantsView"]) => void;
  categoriesView: Category["id"] | null;
  setCategoriesView: (value: GlobalState["categoriesView"]) => void;
  settingsView: SettingsViewValues;
  setSettingsView: (value: SettingsViewValues) => void;
}

export const useGlobalState = create<GlobalState>((set) => ({
  expensesView: null,
  setExpensesView: (value) => set({ expensesView: value }),
  participantsView: null,
  setParticipantsView: (value) => set({ participantsView: value }),
  categoriesView: null,
  setCategoriesView: (value) => set({ categoriesView: value }),
  settingsView: SettingsViewValues.Menu,
  setSettingsView: (value) => set({ settingsView: value }),
}));
