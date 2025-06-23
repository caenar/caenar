import { IconSizes } from "@/lib/constants";
import {
  LayoutBlock,
  LayoutGroup,
  ProjectLayout,
} from "@/lib/types/project-layout";
import { DynamicIcon, IconName } from "lucide-react/dynamic";

export function RenderLayout({ layout }: { layout: ProjectLayout }) {
  return (
    <div className="mx-[23vw] pt-16 pb-32">
      {layout.map((block, i) => renderBlock(block, `root-${i}-`))}
    </div>
  );
}

function isLayoutGroup(block: LayoutBlock): block is LayoutGroup {
  return (
    block.type === "section" || block.type === "grid" || block.type === "stack"
  );
}

function Heading({
  as: Tag = "h2",
  children,
  className,
}: {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  children: React.ReactNode;
  className?: string;
}) {
  return <Tag className={className}>{children}</Tag>;
}

function renderBlock(block: LayoutBlock, keyPrefix = ""): React.ReactNode {
  console.log(block);

  if (isLayoutGroup(block)) {
    const wrapperClass =
      block.type === "grid"
        ? "grid grid-cols-1 md:grid-cols-2 gap-8"
        : block.type === "stack"
          ? "flex flex-col gap-4"
          : "mb-12"; // section

    return (
      <div className={`${wrapperClass}`} key={keyPrefix + block.type}>
        {block.items.map((child, idx) =>
          renderBlock(child, `${keyPrefix}${idx}-`),
        )}
      </div>
    );
  }

  switch (block.type) {
    case "heading":
      return block.icon ? (
        <Heading
          as={`h${block.level}`}
          key={keyPrefix + `h${block.level}`}
          className="icon-label"
        >
          {block.icon && (
            <DynamicIcon
              name={block.icon as IconName}
              color="white"
              size={IconSizes.MEDIUM}
            />
          )}
          {block.content}
        </Heading>
      ) : (
        <Heading as={`h${block.level}`} key={keyPrefix + `h${block.level}`}>
          {block.content}
        </Heading>
      );

    case "text":
      return (
        <p key={keyPrefix + "text"} className="text-base leading-relaxed">
          {block.content}
        </p>
      );

    case "link":
      return (
        <a
          key={keyPrefix + "link"}
          href={block.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          {block.label}
        </a>
      );

    case "icon-label": {
      const content = (
        <span className="inline-flex items-center gap-2 text-sm font-medium">
          {block.icon && (
            <DynamicIcon
              name={block.icon as IconName}
              color="white"
              size={IconSizes.SMALL}
            />
          )}
          {block.label}
        </span>
      );
      return block.href ? (
        <a
          key={keyPrefix + "icon-label"}
          href={block.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {content}
        </a>
      ) : (
        <div key={keyPrefix + "icon-label"}>{content}</div>
      );
    }
    default:
      return null;
  }
}
