"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TbCircleFilled } from "react-icons/tb";
import { supabase } from "@/lib/supabase";

type Tag = {
  id: number;
  name: string;
};

export type ProjectCardProps = {
  title: string;
  desc: string;
  tags: Tag[];
  height?: number;
};

export default function ProjectCard({
  title,
  desc,
  tags,
  height = 350,
}: ProjectCardProps) {
  const [imageLink, setImageLink] = useState<string | null>(null);

  useEffect(() => {
    const { data } = supabase.storage
      .from("images")
      .getPublicUrl(title.toLowerCase().replace(" ", "-"));
    setImageLink(data.publicUrl + ".png");
  }, [title]);

  return (
    <Link href={`/projects/${title.toLocaleLowerCase().replace(" ", "-")}`}>
      <div className="card h-full flex flex-col gap-5">
        <div className="w-full h-fit rounded-md px-4 pt-4">
          {imageLink && (
            <Image
              src={imageLink}
              width={1000}
              height={1000}
              style={{
                width: "100%",
                height: height ? `${height}px` : "350px",
                objectFit: "cover",
                borderRadius: "inherit",
              }}
              alt={`Image of ${title} project`}
            />
          )}
        </div>
        <div className="flex flex-col justify-between">
          <div className="grid gap-1 px-4">
            <h3 className="font-bold">{title}</h3>
            <p className="text-background-200">{desc}</p>
          </div>
          <div className="line my-4"></div>
          <ul className="flex flex-row flex-wrap px-4 pb-5 gap-x-2 items-center">
            {tags &&
              tags.map((tag: Tag, index: number) => {
                return (
                  <React.Fragment key={index}>
                    <li>{tag.name}</li>
                    {index !== tags.length - 1 && <TbCircleFilled size={5} />}
                  </React.Fragment>
                );
              })}
          </ul>
        </div>
      </div>
    </Link>
  );
}
