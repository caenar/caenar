"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useProjectFilter } from "@/lib/stores/use-project-filter.store";
import { AnimatePresence, motion } from "motion/react";
import { fetchProjects } from "./action";
import type { Project, Tag } from "@/lib/types";

import ProjectCard from "@/components/project-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject } from "@/lib/stores/use-project";

export default function Project() {
  const { projects, setProjects } = useProject();
  const [localProjects, setLocalProjects] = useState(projects || []);
  const [loading, setLoading] = useState(false);
  const { filter, setFilter } = useProjectFilter();

  const filteredProjects = localProjects.filter((project: Project) => {
    if (filter === "all") return true;
    return project.tags.map((tag: Tag) => tag.name).includes(filter);
  });

  useEffect(() => {
    async function load() {
      if (!projects) {
        try {
          setLoading(true);
          const data = await fetchProjects();
          setProjects(data);
          setLocalProjects(data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    }

    load();
  }, []);

  return (
    <section className="content">
      <h2 className="mb-5">Projects</h2>
      <div className="flex gap-1.5 mb-10">
        {["all", "programming", "design"].map((type: string) => (
          <button
            key={type}
            onClick={() => {
              setTimeout(() => {
                setFilter(type);
              }, 300);
            }}
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

      <div className="grid grid-cols-4 gap-4">
        {loading && (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[450px] w-full" />
            ))}
          </>
        )}
        <AnimatePresence mode="wait">
          {filteredProjects.map((project: Project, index) => {
            return (
              <motion.div
                initial={{ opacity: 0, y: "60px" }}
                animate={{ opacity: 1, y: "0px" }}
                exit={{
                  opacity: 0,
                  y: "60px",
                  transition: {
                    ease: [0, 0.55, 0.27, 1.01],
                    duration: 0.3,
                    delay: 0 + index / 14,
                  },
                }}
                transition={{
                  duration: 1,
                  ease: [0, 0.71, 0.2, 1.01],
                  delay: 0 + index / 14,
                }}
                key={`${filter}-${project.id}`}
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
        </AnimatePresence>
      </div>
    </section>
  );
}
