"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";

import ProjectCard from "@/components/project-card";
import { useProjectFilter } from "@/lib/stores/use-project-filter.store";
import type { Project } from "@/lib/types";

export default function WorkClient({ projects }: { projects: Project[] }) {
  const { filter, setFilter } = useProjectFilter();
  const filters = [
    "all",
    ...Array.from(
      new Set(
        projects.flatMap((project) =>
          project.tags.map((tag) => tag.name.trim().toLowerCase()),
        ),
      ),
    ).sort(),
  ];
  const activeFilter = filters.includes(filter) ? filter : "all";

  const filteredProjects = projects.filter((project) => {
    if (activeFilter === "all") return true;
    return project.tags.some(
      (tag) => tag.name.trim().toLowerCase() === activeFilter,
    );
  });

  return (
    <section className="content">
      <h2 className="mb-5">Projects</h2>
      <div className="flex flex-wrap gap-1.5 mb-10">
        {filters.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFilter(type)}
            className={
              activeFilter === type
                ? "filter-button !border-transparent !bg-white !text-background-400"
                : "filter-button"
            }
          >
            {type[0].toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="wait">
          {filteredProjects.map((project, index) => (
            <motion.div
              initial={{ opacity: 0, y: "60px" }}
              animate={{ opacity: 1, y: "0px" }}
              exit={{
                opacity: 0,
                y: "30px",
                transition: {
                  ease: [0, 0, 0.27, 1],
                  duration: 0.3,
                  delay: 0 + index / 32,
                },
              }}
              transition={{
                duration: 1,
                ease: [0, 0, 0.27, 1],
                delay: 0 + index / 18,
              }}
              key={`${activeFilter}-${project.id}`}
            >
              <Link href={`/work/${project.slug}`}>
                <ProjectCard
                  title={project.title}
                  desc={project.desc}
                  images={project.project_image}
                  tags={project.tags}
                />
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
