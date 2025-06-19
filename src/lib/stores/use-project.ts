import { create } from "zustand";

interface ProjectStore {
  projects: any[] | null;
  setProjects: (projects: any[]) => void;
}

export const useProject = create<ProjectStore>((set) => ({
  projects: null,
  setProjects: (projects) => set({ projects }),
}));
