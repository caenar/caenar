import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FilterStore {
  filter: string;
  setFilter: (filter: string) => void;
}

export const useProjectFilter = create<FilterStore>()(
  persist(
    (set) => ({
      filter: "all",
      setFilter: (filter) => set({ filter }),
    }),
    {
      name: "project-filter",
    },
  ),
);
