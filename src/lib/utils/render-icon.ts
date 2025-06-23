import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react"; // Optional, for better typing

export function renderIcon(name: string): LucideIcon | null {
  const pascal = name
    .split(/[-_ ]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  const Icon = Icons[pascal as keyof typeof Icons];
  return typeof Icon === "function" ? Icon : null;
}
