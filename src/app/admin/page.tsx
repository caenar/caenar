"use client";

import React, { useEffect, useState } from "react";
import { usePopup } from "@/shared/context/popup-context";

import AddProjectForm from "@/components/ui/forms/add-project";
import ProjectCard from "@/components/project-card";

import { IconSizes } from "@/lib/constants";
import { TbPlus } from "react-icons/tb";
import type { Project } from "@/lib/types";
import EditProjectForm from "@/components/ui/forms/edit-project";
import { fetchProjects } from "../projects/action";
import { useProject } from "@/lib/stores/use-project";
import { Skeleton } from "@/components/ui/skeleton";

export default function Admin() {
  const [projects, setProjects] = useState<Project[]>(
    useProject.getState().projects || [],
  );
  const { openPopup, closePopup, openConfirmPopup, closeConfirmPopup } =
    usePopup();

  const load = async () => {
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!useProject.getState().projects) load();
  }, []);

  const openAddProjectPopup = () => {
    openPopup(
      "Add a project",
      <AddProjectForm
        closeAction={() => {
          load();
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
          load();
          closePopup();
        }}
        openConfirmPopupAction={openConfirmPopup}
        closeConfirmPopupAction={closeConfirmPopup}
      />,
    );
  };

  return (
    <section className="pt-[10rem] py-36 mx-[10vw]">
      <div className="flex justify-between">
        <h2>Projects</h2>
        <button
          type="button"
          className="primary-button icon-label"
          onClick={() => openAddProjectPopup()}
        >
          <TbPlus size={IconSizes.SMALL} />
          Add a project
        </button>
      </div>
      <div className="grid grid-cols-4 gap-4 mt-7">
        {projects.length !== 0 ? (
          <>
            {projects.map((project: Project) => {
              return (
                <div
                  key={project.title}
                  className="cursor-pointer"
                  onClick={() => openEditProjectPopup(project)}
                >
                  <ProjectCard
                    title={project.title}
                    desc={project.desc}
                    images={project.project_image}
                    tags={project.tags}
                  />
                </div>
              );
            })}
          </>
        ) : (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[450px] w-full" />
            ))}
          </>
        )}
      </div>
    </section>
  );
}
