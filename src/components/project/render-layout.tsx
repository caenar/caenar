import { IconSizes } from "@/lib/constants";
import {
  LayoutBlock,
  LayoutGroup,
  ProjectLayout,
} from "@/lib/types/project-layout";
import { DynamicIcon, IconName } from "lucide-react/dynamic";

export function RenderLayout({ layout }: { layout: ProjectLayout }) {
  return (
    <div className="grid gap-16 mx-[25vw] pt-16 pb-32">
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
  return (
    <Tag className={`${className} uppercase font-mono mb-2`}>{children}</Tag>
  );
}

function renderBlock(block: LayoutBlock, keyPrefix = ""): React.ReactNode {
  console.log(block);

  if (isLayoutGroup(block)) {
    let wrapperClass = "";
    const cardClass = block.card ? "card justify-center p-7" : "";

    if (block.type === "grid") {
      // for grid types
      const columns = block.gridOptions?.columns
        ? ""
        : "grid-cols-1 md:grid-cols-2";

      const gap = block.gridOptions?.gap
        ? `[gap:${block.gridOptions.gap}]`
        : "gap-8";

      const align = block.gridOptions?.align
        ? `items-${block.gridOptions.align}`
        : "";

      wrapperClass = `grid ${columns} ${gap} ${align}`;
    } else if (block.type === "stack") {
      // for stack types
      wrapperClass = "flex flex-col gap-1";
    } else {
      // for section types
      wrapperClass = "mb-16";
    }

    const style: React.CSSProperties = {};

    if (block.type === "grid" && block.gridOptions?.columns) {
      style.gridTemplateColumns = block.gridOptions.columns;
    }

    if (block.minWidth) {
      style.minWidth = block.minWidth;
    }

    if (block.minHeight) {
      style.minHeight = block.minHeight;
    }

    return (
      <div
        className={`${wrapperClass} ${cardClass}`}
        style={style}
        key={keyPrefix + block.type}
      >
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
              name={block.icon.name as IconName}
              color={block.icon.color ?? "white"}
              size={block.icon.size ?? IconSizes.MEDIUM}
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
        <p key={keyPrefix + "text"} className="opacity-70 leading-loose">
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
              name={block.icon.name as IconName}
              color={block.icon.color ?? "white"}
              size={block.icon.size ?? IconSizes.MEDIUM}
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
