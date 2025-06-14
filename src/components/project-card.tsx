"use client";

import { ProjectImage } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

type Tag = {
  id: number;
  name: string;
};

export type ProjectCardProps = {
  title: string;
  desc: string;
  images: ProjectImage[];
  tags: Tag[];
  height?: number;
};

export default function ProjectCard({
  title,
  desc,
  images,
  tags,
  height,
}: ProjectCardProps) {
  return (
    <Link href={`/projects/${title.toLocaleLowerCase().replace(" ", "-")}`}>
      <div className="card h-full flex flex-col gap-5">
        <div className="w-full h-fit rounded-md px-4 pt-4 ">
          {images && (
            <Image
              src={
                images.find((img: ProjectImage) => img?.order === 0)
                  ?.image_url || "/placeholder.jpg"
              }
              width={1000}
              height={1000}
              style={{
                width: "100%",
                height: height ? `${height}px` : "200px",
                objectFit: "cover",
                borderRadius: "inherit",
              }}
              className="border border-background-400"
              alt={`Image of ${title} project`}
            />
          )}
        </div>
        <div className="flex flex-col justify-between">
          <div className="grid gap-3 px-4">
            <h3 className="font-bold">{title}</h3>
            <p className="text-background-200 mb-2">{desc}</p>
          </div>
          <div className="line my-4"></div>
          <ul className="flex flex-row flex-wrap px-4 pb-5 gap-2 items-center">
            {tags &&
              tags.slice(0, 5).map((tag: Tag, index: number) => (
                <li
                  key={index}
                  className="badge border-background-400 !text-[14px] lowercase"
                >
                  {tag.name}
                </li>
              ))}
            {tags.length > 5 && (
              <li className="badge border-dashed border-background-400 !text-[14px] lowercase">
                +{tags.length - 5} more
              </li>
            )}
          </ul>
        </div>
      </div>
    </Link>
  );
}
