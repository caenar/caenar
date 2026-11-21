import { fetchAdminProjects } from "./action";
import AdminClient from "./admin-client";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const result = await fetchAdminProjects();
  const initialProjects = result.success ? result.data : [];
  const initialError = result.success
    ? null
    : typeof result.error.details === "string"
      ? result.error.details
      : "Failed to load published projects.";

  return (
    <AdminClient
      initialProjects={initialProjects}
      initialError={initialError}
    />
  );
}
