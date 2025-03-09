import React from "react";
import Image from "next/image";
import Link from "next/link";

export interface ProjectCardProps {
  title: string;
  desc?: string;
  tags: string[];
}

export default function ProjectCard({ title, desc, tags }: ProjectCardProps) {
  return (
    <div className="card">
      <Link href={title.toLocaleLowerCase().replace(" ", "-")}>
        <div className="">
          <Image
            src={`/images/${title}`}
            width={200}
            height={350}
            alt={`Image of ${title} project`}
          />
        </div>
        <div>
          <div className="grid gap-2">
            <h3>{title}</h3>
            <p className="text-background-100">{desc}</p>
          </div>
          <div className="flex flex-row gap-3">
            {tags.map((tag) => {
              return <p key={tag}>{tag.trim()}</p>;
            })}
          </div>
        </div>
      </Link>
    </div>
  );
}
