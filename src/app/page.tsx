import HomeClient from "./home-client";
import { getPublicProjects } from "@/lib/projects/public-content";

export default function Home() {
  return <HomeClient projects={getPublicProjects()} />;
}
