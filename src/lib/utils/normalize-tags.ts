import { Tag } from "../types";

export function normalizeTags(tags: Tag[]) {
  return tags.map((tag) => tag.name.trim()).join(", ");
}
