"use client";

import React, { useEffect, useState } from "react";
import { fetchProjects } from "@/lib/fetch-data";

import type { Project, Tag } from "@/lib/types";
import ProjectCard from "@/components/project-card";
import { useProjectFilter } from "@/lib/stores/use-project-filter.store";
import { motion } from "motion/react";
import Link from "next/link";

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

  const { filter, setFilter } = useProjectFilter();
  const filteredProjects = projects.filter((project: Project) => {
    if (filter === "all") return true;
    return project.tags.map((tag: Tag) => tag.name).includes(filter);
  });

  return (
    <section className="content">
      <h2 className="mb-5">Projects</h2>
      <div className="flex gap-1.5 mb-10">
        {["all", "programming", "design"].map((type: string) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={
              filter === type
                ? "filter-button !border-transparent !bg-white !text-background-400"
                : "filter-button"
            }
          >
            {type[0].toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {loading && <span>Loading projects..</span>}

      <div className="grid grid-cols-4 gap-4">
        {filteredProjects.map((project: Project, index) => {
          return (
            <motion.div
              initial={{ opacity: 0, y: "50px" }}
              animate={{ opacity: 1, y: "0px" }}
              transition={{
                duration: 1,
                ease: [0, 0.71, 0.2, 1.01],
              }}
              key={index}
            >
              <Link
                href={`/projects/${project.title.toLocaleLowerCase().replace(" ", "-")}`}
              >
                <ProjectCard
                  title={project.title}
                  desc={project?.desc}
                  images={project?.project_image}
                  tags={project.tags}
                />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
