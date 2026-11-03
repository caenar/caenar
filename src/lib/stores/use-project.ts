import { create } from "zustand";
import type { Project } from "@/lib/types";

interface ProjectStore {
  projects: Project[] | null;
  setProjects: (projects: Project[]) => void;
}

export const useProject = create<ProjectStore>((set) => ({
  projects: null,
  setProjects: (projects) => set({ projects }),
}));
