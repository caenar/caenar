"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

import type { Project } from "@/lib/types/project";
import { cn } from "@/lib/utils";

function ProjectPreview({ project }: { project: Project }) {
  const cover =
    project.project_image?.find((img) => img?.role === "cover")?.image_url ||
    project.project_image?.find((img) => img?.order === 0)?.image_url ||
    project.project_image?.[0]?.image_url ||
    "/placeholder.svg";

  return (
    <div className="flex h-full flex-col gap-4 p-4 md:p-5">
      <div className="relative w-full overflow-hidden border border-background-400 bg-background-200/30 aspect-[16/9]">
        <Image
          src={cover}
          alt={`Preview of ${project.title}`}
          fill
          className="object-cover"
          sizes="(min-width: 768px) 45vw, 90vw"
        />
      </div>
      <div className="grid gap-2 min-w-0">
        <div className="flex items-end gap-3">
          <h3 className="text-lg md:text-xl font-semibold leading-tight truncate">
            {project.title}
          </h3>
          <p className="font-mono text-xs uppercase tracking-wider text-violet-100">
            {project.year ? `/ ${project.year}` : ""}
          </p>
        </div>
        <p className="font-text text-sm text-background-200 leading-relaxed line-clamp-3">
          {project.desc}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <div className="mt-auto flex flex-wrap gap-2">
          {(project.tags ?? []).slice(0, 4).map((tag) => (
            <span
              key={tag.id}
              className="badge border-background-400 !text-[12px] lowercase"
            >
              {tag.name}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 font-mono text-xs">
          <Link
            href={`/work/${project.slug}`}
            className="text-violet-100 hover:text-pink-200 transition-colors"
          >
            &gt; open project
          </Link>
          {project.live_link && (
            <a
              href={project.live_link}
              target="_blank"
              rel="noreferrer"
              className="text-white/50 hover:text-white/80 transition-colors"
            >
              live ↗
            </a>
          )}
          {project.code_link && (
            <a
              href={project.code_link}
              target="_blank"
              rel="noreferrer"
              className="text-white/50 hover:text-white/80 transition-colors"
            >
              code ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function WorkSplitPane({
  projects,
  onOpen,
}: {
  projects: Project[];
  onOpen: (slug: string) => void;
}) {
  const [selected, setSelected] = useState(0);
  const reduceMotion = useReducedMotion() ?? false;
  const containerRef = useRef<HTMLDivElement>(null);

  const clamp = useCallback(
    (n: number) => Math.max(0, Math.min(projects.length - 1, n)),
    [projects.length],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleKey = (e: KeyboardEvent) => {
      if (projects.length === 0) return;
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => clamp(s + 1));
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => clamp(s - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const p = projects[selected];
        if (p) onOpen(p.slug);
      }
    };
    el.addEventListener("keydown", handleKey);
    return () => el.removeEventListener("keydown", handleKey);
  }, [clamp, onOpen, projects, selected]);

  const active = projects[selected];

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="outline-none border border-background-400/60 overflow-hidden bg-background-100/30"
    >
      <div className="flex items-center justify-between border-b border-background-400/60 px-3 py-2 font-mono text-xs text-white/45">
        <span>~/work</span>
        <span className="hidden sm:inline">j/k navigate · enter open</span>
      </div>

      <div className="grid md:grid-cols-[minmax(0,0.4fr)_minmax(0,1.1fr)] min-h-[340px] md:min-h-[420px]">
        <div className="border-b md:border-b-0 md:border-r border-background-400/60 p-2 md:p-3 overflow-y-auto">
          <p className="px-2 py-1 text-xs font-mono uppercase tracking-wider text-white/35 mb-1">
            featured/
          </p>
          <ul className="grid gap-0.5">
            {projects.map((project, i) => {
              const isActive = i === selected;
              return (
                <li key={project.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(i)}
                    onDoubleClick={() => onOpen(project.slug)}
                    className={cn(
                      "flex justify-between items-center w-full px-3 py-1.5 border font-mono text-sm",
                      isActive
                        ? "bg-violet-950/50 border-transparent text-white"
                        : "border-transparent text-white/70 hover:bg-white/[0.03] hover:text-white/90",
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={cn(
                          isActive ? "bg-violet-100" : "bg-white/30",
                          "size-1",
                        )}
                      ></span>
                      <span className="truncate">
                        {project.title.toLowerCase().replace(/\s+/g, "-")}
                      </span>
                    </div>
                    <p
                      className={cn(
                        isActive ? "text-violet-100" : "text-white/30",
                        "pl-5 text-xs truncate",
                      )}
                    >
                      {project.industry ?? "project"}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
          <Link
            href="/work"
            className="block px-3 py-2 font-mono text-xs text-white/45 hover:text-violet-100 transition-colors"
          >
            cd /work — view all projects →
          </Link>
        </div>

        <div className="min-w-0">
          {active ? (
            <motion.div
              key={active.id}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full"
            >
              <ProjectPreview project={active} />
            </motion.div>
          ) : (
            <div className="p-4 text-sm text-white/40 font-mono">
              no projects
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-background-400/60 px-3 py-2 font-mono text-xs text-white/45">
        <div className="flex items-center gap-3">
          <span className="text-violet-100">0:home</span>
          <span className="text-white/70">1:work*</span>
        </div>
        <span>
          {selected + 1}/{projects.length}
        </span>
      </div>
    </div>
  );
}
