"use client";

import React, { useEffect } from "react";

interface PageProps {
  params: {
    slug: string;
  }
}

export default function ProjectPage({params}: PageProps) {

  useEffect(() => {
    const data = getProjectBySlug(params.slug);
  });

  return <div>Project Page</div>;
}
