import { IconSizes } from "@/lib/constants";
import type { IconOptions } from "@/lib/types";
import { DynamicIcon, IconName } from "lucide-react/dynamic";

type IconLabelProps = {
  label: string;
  href?: string;
  icon?: IconOptions;
  className?: string;
};

export default function Link({
  label,
  href,
  icon,
  className = "",
}: IconLabelProps) {
  const Tag = href ? "a" : "div";
  const style = !icon ? "text-violet-400 underline" : "";
  const anchorProps = href
    ? {
        href,
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : {};

  return (
    <Tag {...anchorProps} className={`icon-label ${style} ${className}`}>
      {icon && (
        <DynamicIcon
          name={icon.name as IconName}
          color={icon.color ?? "white"}
          size={icon.size ?? IconSizes.MEDIUM}
        />
      )}
      {label}
    </Tag>
  );
}
