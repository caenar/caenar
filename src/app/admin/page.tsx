"use client";

import AddProject from "@/components/forms/addProject";
import ProjectCard from "@/components/projectCard";
import { IconSizes } from "@/constants/IconSizes";
import { usePopup } from "@/context/PopupContext";
import { fetchProjects } from "@/lib/fetchData";
import React, { useEffect, useState } from "react";
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
        const data = await fetchProjects({});
        setProjects(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadProjects();
    console.log(projects);
  }, []);

  const openAddProjectPopup = () => {
    openPopup("Add a project", <AddProject close={() => closePopup()} />);
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
