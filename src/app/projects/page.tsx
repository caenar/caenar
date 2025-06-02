"use client";

import React, { useEffect, useState } from "react";
import { fetchProjects } from "@/lib/fetch-data";

import ProjectCard from "@/components/project-card";
import type { Project } from "@/lib/types/project";

export default function Project() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        const data = await fetchProjects();
        setProjects(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  const filters = projects.reduce((acc, item) => {
    if (!acc.includes(item)) {
      acc.push(item);
    }
    return acc;
  }, []);

  console.log(filters);

  return (
    <section className="content">
      <h1 className="mb-10">Projects</h1>
      {loading && <span>Loading projects..</span>}
      <div className="grid grid-cols-4 gap-4">
        {projects.map((project: Project, index) => {
          return (
            <React.Fragment key={index}>
              <ProjectCard
                title={project.title}
                desc={project?.desc}
                tags={project.tags}
                height={300}
              />
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}
