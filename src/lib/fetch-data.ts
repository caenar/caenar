export async function fetchProjects(id: string | null = null): Promise<any> {
  const url = new URL(
    id ? `/api/projects/${id}` : "/api/projects",
    window.location.origin,
  );

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(
      `Failed to fetch projects${id ? `with ID ${id}` : "s"}: ${res.status}`,
    );
  }
  return res.json();
}
