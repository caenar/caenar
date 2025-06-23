import { LayoutBlock, ProjectLayout } from "@/lib/types/project-layout";

export function RenderLayout({
  layout,
}: {
  layout: ProjectLayout | undefined;
}) {
  if (!layout) {
    return <span>No layout given</span>;
  }

  console.log("Layout: ", layout);

  return <div>{render(layout)}</div>;
}

function render(layout: ProjectLayout, keyPrefix = ""): React.ReactNode {
  layout.items.map((block: LayoutBlock) => {
    renderBlock(block);
  });
}

function renderBlock(block: any, keyPrefix = ""): React.ReactNode {
  const wrapperClass =
    block.type === "grid" // grid
      ? "grid grid-cols-1 md:grid-cols-2 gap-8"
      : block.type === "stack" // stack
        ? "flex flex-col gap-4"
        : "mb-12"; // section;

  return (
    <div className={`${wrapperClass} mx-[10vw]`} key={keyPrefix + block.type}>
      {block.items.map((child, i) => renderBlock(child, `${keyPrefix}${i}-`))}
    </div>
  );

  // render the items
  // switch (blockType) {
  //   case "text":
  //     return (
  //       <p key={keyPrefix + "text"} className="text-base leading-relaxed">
  //         {block.content}
  //       </p>
  //     );
  //   case "link":
  //     return (
  //       <a
  //         key={keyPrefix + "link"}
  //         href={block.href}
  //         target="_blank"
  //         rel="noopener noreferrer"
  //         className="text-blue-600 underline"
  //       >
  //         {block.label}
  //       </a>
  //     );
  //   default:
  //     return null;
  // }
}
