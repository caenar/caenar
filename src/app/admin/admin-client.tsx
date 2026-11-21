"use client";

import { useCallback, useState } from "react";
import { TbPlus } from "react-icons/tb";
import { toast } from "sonner";

import ProjectCard from "@/components/project-card";
import AddProjectForm from "@/components/ui/forms/add-project";
import EditProjectForm from "@/components/ui/forms/edit-project";
import { IconSizes } from "@/lib/constants";
import type { Project } from "@/lib/types";
import { handleResult } from "@/lib/utils/handle-result";
import { usePopup } from "@/shared/context/popup-context";

import { fetchAdminProjects } from "./action";

export default function AdminClient({
  initialProjects,
  initialError,
}: {
  initialProjects: Project[];
  initialError: string | null;
}) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const { openPopup, closePopup, openConfirmPopup, closeConfirmPopup } =
    usePopup();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchAdminProjects();
    handleResult(result, {
      ok: (data) => setProjects(data),
      error: {
        unauthorized: (details) => {
          setError(details);
          toast.error(details);
        },
      },
      fallback: (failure) => {
        const message =
          typeof failure.details === "string"
            ? failure.details
            : "Failed to load published projects.";
        setError(message);
        toast.error(message);
      },
    });
    setLoading(false);
  }, []);

  const openAddProjectPopup = () => {
    openPopup(
      "Add a project",
      <AddProjectForm
        closeAction={() => {
          void load();
          closePopup();
        }}
      />,
    );
  };

  const openEditProjectPopup = (project: Project) => {
    openPopup(
      "Edit project",
      <EditProjectForm
        project={project}
        closeAction={() => {
          void load();
          closePopup();
        }}
        openConfirmPopupAction={openConfirmPopup}
        closeConfirmPopupAction={closeConfirmPopup}
      />,
    );
  };

  return (
    <section className="pt-28 md:pt-[10rem] pb-16 md:py-36 px-4 sm:px-6 md:py-[10vw]">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2>Projects</h2>
        <button
          type="button"
          className="primary-button icon-label"
          onClick={openAddProjectPopup}
        >
          <TbPlus size={IconSizes.SMALL} />
          Add a project
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-7">
        {loading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-[400px] w-full skeleton" />
          ))
        ) : error ? (
          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
            <p className="opacity-60 mb-4">{error}</p>
            <button
              type="button"
              className="secondary-button"
              onClick={() => void load()}
            >
              Retry
            </button>
          </div>
        ) : projects.length > 0 ? (
          projects.map((project) => (
            <button
              type="button"
              key={project.id}
              className="cursor-pointer text-left"
              onClick={() => openEditProjectPopup(project)}
            >
              <ProjectCard
                title={project.title}
                desc={project.desc}
                images={project.project_image}
                tags={project.tags}
              />
            </button>
          ))
        ) : (
          <p className="opacity-60">No published projects yet.</p>
        )}
      </div>
    </section>
  );
}
