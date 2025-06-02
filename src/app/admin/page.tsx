"use client";

import React, { useEffect, useState } from "react";
import { usePopup } from "@/shared/context/popup-context";
import { fetchProjects } from "@/lib/fetch-data";

import AddProjectForm from "@/components/ui/forms/add-project";
import ProjectCard from "@/components/project-card";

import { IconSizes } from "@/lib/constants";
import { TbPlus } from "react-icons/tb";

export default function Admin() {
  const [projects, setProjects] = useState<Project[]>([]);
  const { openPopup, closePopup } = usePopup();

  type Tag = {
    id: number;
    name: string;
  };

  type Project = {
    title: string;
    desc: string;
    tags: Tag[];
  };

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await fetchProjects();
        setProjects(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadProjects();
    console.log(projects);
  }, []);

  const openAddProjectPopup = () => {
    openPopup("Add a project", <AddProjectForm close={() => closePopup()} />);
  };

  return (
    <section className="pt-[10rem]">
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
      <div className="grid mt-7 grid-cols-4">
        {projects.length !== 0 ? (
          <>
            {projects.map((project: Project) => {
              return (
                <ProjectCard
                  key={project.title}
                  title={project.title}
                  desc={project.desc}
                  tags={project.tags}
                />
              );
            })}
          </>
        ) : (
          <div>
            <p>No projects found</p>
          </div>
        )}
      </div>
    </section>
  );
}
