"use client";

import { fetchProjects } from "@/lib/fetchData";
import React, { useEffect, useState } from "react";

export default function Admin() {
  const [projects, setProjects] = useState([]);

  type Tag = {
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
  }, []);

  const ProjectCard = ({ title, desc, tags }: Project) => {
    return (
      <div>
        <h3>{title}</h3>
        <p>{desc}</p>
        <div>
          {tags.map((tag: Tag, index: number) => {
            return <p key={index}>{tag.name}</p>;
          })}
        </div>
      </div>
    );
  };

  return (
    <section className="pt-[10rem]">
      <h2>Projects</h2>
      <div className="grid grid-cols-4">
        {projects ? (
          <>
            {projects.map((project: Project) => {
              <ProjectCard
                title={project.title}
                desc={project.desc}
                tags={project.tags}
              />;
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
