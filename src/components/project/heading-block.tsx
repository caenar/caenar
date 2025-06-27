import { IconSizes } from "@/lib/constants";
import { IconOptions } from "@/lib/types";
import { DynamicIcon, IconName } from "lucide-react/dynamic";

type HeadingProps = {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  icon?: IconOptions;
  content: string;
};

export default function Heading({
  as: Tag = "h2",
  icon,
  content,
}: HeadingProps) {
  return (
    <Tag className={`${icon ? "icon-label" : ""} mb-2`}>
      {icon && (
        <DynamicIcon
          name={icon.name as IconName}
          color={icon.color ?? "white"}
          size={icon.size ?? IconSizes.MEDIUM}
        />
      )}
      {content}
    </Tag>
  );
}
