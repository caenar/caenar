"use client";

export default function ProjectLayout({ project }: { project: any }) {
  return (
    <section className="m-[10vw]">
      <h1 className="text-2xl font-bold">{project.title}</h1>
      <p className="mt-2">{project.desc}</p>
    </section>
  );
}
