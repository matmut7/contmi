import { create } from "zustand";
import { Category } from "schema";
import { safeNumber, validateNameString } from "../utils/validators";

type CategoryInParticipantForm = Category & {
  coefficient: string;
};

type ParsedCategoryInParticipantForm = Category & {
  coefficient: number;
};

interface ParticipantFormData {
  name: string;
  categories: CategoryInParticipantForm[];
}

interface ParsedParticipantFormData {
  name: string;
  categories: ParsedCategoryInParticipantForm[];
}

const initialParticipantFormData = {
  name: "",
  categories: [],
};

type ParticipantFormState = ParticipantFormData & {
  setData: (data: Partial<ParticipantFormData>) => void;
  setCategory: (index: number, category: CategoryInParticipantForm) => void;
  initData: (allCategories: Category[]) => void;
  getData: () => ParticipantFormData;
  getParsedData: () => ParsedParticipantFormData | null;
  validateForm: () => boolean;
};

export const useParticipantFormState = create<ParticipantFormState>(
  (set, get) => ({
    ...initialParticipantFormData,
    setData: (data) => set(data),
    setCategory: (index, category) => {
      const categories = get().categories;
      categories[index] = category;
      set({ categories });
    },
    initData: (allCategories) =>
      set({
        ...initialParticipantFormData,
        categories: allCategories.map((category) => ({
          ...category,
          coefficient: "1",
        })),
      }),
    getData: () => {
      const { name, categories } = get();
      return { name, categories };
    },
    getParsedData: () => {
      const data = get().getData();
      try {
        return {
          ...data,
          categories: data.categories.map((category) => ({
            ...category,
            coefficient: safeNumber(category.coefficient),
          })),
        };
      } catch {
        return null;
      }
    },
    validateForm: () => {
      return get().getParsedData() !== null && validateNameString(get().name);
    },
  })
);
