interface fetchProps {
  id?: string;
  single?: boolean;
}

export async function fetchProjects({ id, single = false }: fetchProps) {
  let url = "/api/projects";

  if (single) {
    url = `/api/projects/${id}`;
  }

  const res = await fetch(url);
  return await res.json();
}
