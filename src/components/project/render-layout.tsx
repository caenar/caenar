import type {
  LayoutBlock,
  LayoutGroup,
  ProjectLayout,
} from "@/lib/types/project-layout";
import { ProjectImage } from "@/lib/types";

import IconLabel from "./icon-label-block";
import Separator from "./separator-block";
import Heading from "./heading-block";
import Text from "./text-block";
import Link from "./link-block";
import AccordionBlock from "./accordion-block";
import Gallery from "./gallery-block";

export function RenderLayout({
  images,
  layout,
}: {
  images: ProjectImage[];
  layout: ProjectLayout;
}) {
  console.log(layout);

  return (
    <section className="grid gap-24 mx-[25vw] pt-16">
      {layout.map((block, i) => renderBlock(images, block, `root-${i}-`))}
    </section>
  );
}

function isLayoutGroup(block: LayoutBlock): block is LayoutGroup {
  return (
    block.type === "section" || block.type === "grid" || block.type === "stack"
  );
}

function getLayoutGroupClasses(block: LayoutGroup): string {
  const cardClass = block.card ? "card justify-center p-6" : "";

  if (block.type === "grid") {
    const columns = block.gridOptions?.columns
      ? ""
      : "grid-cols-1 md:grid-cols-2";
    const gap = block.gridOptions?.gap
      ? `[gap:${block.gridOptions.gap}]`
      : "gap-8";
    const align = block.gridOptions?.align
      ? `items-${block.gridOptions.align}`
      : "";

    return `grid ${columns} ${gap} ${align} ${cardClass}`;
  }

  if (block.type === "stack") {
    return `flex flex-col gap-1 ${cardClass}`;
  }

  // default to section class
  return `mb-16 ${cardClass}`;
}

function getLayoutGroupStyle(block: LayoutGroup): React.CSSProperties {
  const style: React.CSSProperties = {};

  if (block.minWidth) style.minWidth = block.minWidth;

  if (block.minHeight) style.minHeight = block.minHeight;

  if (block.gridOptions?.columns)
    style.gridTemplateColumns = block.gridOptions.columns;

  return style;
}

function renderBlock(
  images: ProjectImage[],
  block: LayoutBlock,
  keyPrefix = "",
): React.ReactNode {
  if (isLayoutGroup(block)) {
    return (
      <div
        className={getLayoutGroupClasses(block)}
        style={getLayoutGroupStyle(block)}
        key={keyPrefix + block.type}
      >
        {block.items.map((child, idx) =>
          renderBlock(images, child, `${keyPrefix}${idx}-`),
        )}
      </div>
    );
  }

  switch (block.type) {
    case "heading":
      return (
        <Heading
          as={`h${block.level}`}
          key={keyPrefix + `h${block.level}`}
          icon={block.icon}
          content={block.content}
        />
      );

    case "separator":
      return (
        <Separator
          key={keyPrefix + "seperator"}
          direction={block.direction}
          spacing={block.spacing}
        />
      );

    case "text":
      return <Text key={keyPrefix + "text"} content={block.content} />;

    case "link":
      return (
        <Link key={keyPrefix + "link"} label={block.label} href={block.href} />
      );

    case "icon-label":
      return (
        <IconLabel
          key={keyPrefix + "icon-label"}
          label={block.label}
          href={block.href}
          icon={block.icon}
        />
      );

    case "accordion":
      return (
        <AccordionBlock key={keyPrefix + "accordion"} data={block.items} />
      );

    case "gallery":
      return (
        <Gallery
          key={keyPrefix + "gallery"}
          images={images}
          gridOptions={block.gridOptions}
          style={block.style}
          items={block.items}
        />
      );
  }
}
