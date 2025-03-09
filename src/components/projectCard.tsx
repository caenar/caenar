"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TbCircleFilled } from "react-icons/tb";
import { supabase } from "@/utils/supabase/client";

export interface ProjectCardProps {
  title: string;
  desc?: string;
  tags: string[];
}

export default function ProjectCard({ title, desc, tags }: ProjectCardProps) {
  const [imageLink, setImageLink] = useState<string | null>(null);

  useEffect(() => {
    const { data } = supabase.storage
      .from("images")
      .getPublicUrl(title.toLowerCase().replace(" ", "-"));
    setImageLink(data.publicUrl + ".png");
    console.log(data.publicUrl);
  }, [title]);

  return (
    <Link href={title.toLocaleLowerCase().replace(" ", "-")}>
      <div className="card h-full flex flex-col gap-7">
        <div className="w-full h-fit rounded-md">
          {imageLink && (
            <Image
              src={imageLink}
              width={500}
              height={500}
              style={{
                width: "100%",
                height: "500px",
                objectFit: "cover",
                borderRadius: "inherit",
              }}
              alt={`Image of ${title} project`}
            />
          )}
        </div>
        <div className="flex flex-col justify-between gap-4">
          <div className="grid gap-2">
            <h3 className="font-bold">{title}</h3>
            <p className="text-balance text-background-200 mb-1.5">{desc}</p>
          </div>
          <div className="line"></div>
          <div className="flex flex-row gap-2 items-center">
            {tags.map((tag: string, index: number) => {
              return (
                <React.Fragment key={index}>
                  <p>{tag.trim()}</p>
                  {index !== tags.length - 1 && (
                    <TbCircleFilled style={{ marginTop: "3px" }} size={6} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </Link>
  );
}
