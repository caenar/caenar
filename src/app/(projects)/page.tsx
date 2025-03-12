"use client";

import React, { useEffect } from "react";

export default function Project() {
  const fetchProjects = async () => {
    const res = await fetch("/api/projects");
    const data = await res.json();

    return data;
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return <div></div>;
}
