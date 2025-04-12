"use client";

import ProjectCard, { ProjectCardProps } from "@/components/projectCard";
import { fetchProjects } from "@/lib/fetchData";
import React, { useEffect, useState } from "react";

export default function Project() {
  const [projects, setProjects] = useState([]);

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
  }, []);

  return (
    <section className="content">
      <h1>Projects</h1>
      {projects.map((project: ProjectCardProps, index) => {
        return (
          <React.Fragment key={index}>
            <ProjectCard title={project.title} desc={project?.desc} />
          </React.Fragment>
        );
      })}
    </section>
  );
}
