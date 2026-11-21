import WorkClient from "./work-client";
import { getPublicProjects } from "@/lib/projects/public-content";

export default function WorkPage() {
  return <WorkClient projects={getPublicProjects()} />;
}
