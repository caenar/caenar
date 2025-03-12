"use client";

import React, { useEffect } from "react";

export default function Project() {
  const fetchProjects = async () => {
    const res = await fetch("/api/projects");
    const data = await res.json();

    console.log("Data: ", data);
    return data;
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return <div></div>;
}
