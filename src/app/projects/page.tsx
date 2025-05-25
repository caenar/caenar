"use client";

import ProjectCard, { ProjectCardProps } from "@/components/projectCard";
import { fetchProjects } from "@/lib/fetchData";
import React, { useEffect, useState } from "react";

export default function Project() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        const data = await fetchProjects({});
        setProjects(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  return (
    <section className="content">
      <h1 className="mb-10">Projects</h1>
      {loading && <span>Loading projects..</span>}
      {projects.map((project: ProjectCardProps, index) => {
        return (
          <React.Fragment key={index}>
            <ProjectCard
              title={project.title}
              desc={project?.desc}
              tags={project.tags}
              height={500}
            />
          </React.Fragment>
        );
      })}
    </section>
  );
}
