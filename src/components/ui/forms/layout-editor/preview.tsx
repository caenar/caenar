/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
"use client";

import { useMemo } from "react";

import type { AccordionItem, GalleryItem } from "@/lib/types/project-layout";
import type { ProjectImage } from "@/lib/types";
import IconLabel from "@/components/project/icon-label-block";
import Separator from "@/components/project/separator-block";
import Heading from "@/components/project/heading-block";
import TextBlockView from "@/components/project/text-block";
import LinkBlockView from "@/components/project/link-block";
import AccordionBlockView from "@/components/project/accordion-block";
import Gallery from "@/components/project/gallery-block";
import type { BlockPath, EditorBlock, EditorImage } from "./types";
import { isGroup, pathEq } from "./utils";

function toProjectImages(images: EditorImage[]): ProjectImage[] {
  return images.map((img) => ({
    id: img.id,
    path: img.label,
    image_url: img.image_url,
    alt: img.alt ?? null,
    role: img.order === 0 ? "cover" : "gallery",
    order: img.order,
  }));
}

export function PreviewCanvas({
  blocks,
  images,
  selected,
  onSelect,
}: {
  blocks: EditorBlock[];
  images: EditorImage[];
  selected: BlockPath | null;
  onSelect: (p: BlockPath) => void;
}) {
  const projectImages = useMemo(() => toProjectImages(images), [images]);
  return (
    <div className="grid gap-3">
      {blocks.map((block, i) => (
        <PreviewBlock key={block.__id} block={block} path={[i]} selected={selected} onSelect={onSelect} images={projectImages} />
      ))}
      {blocks.length === 0 && <p className="text-sm opacity-50">Preview will appear here.</p>}
    </div>
  );
}

function PreviewBlock({
  block,
  path,
  selected,
  onSelect,
  images,
}: {
  block: EditorBlock;
  path: BlockPath;
  selected: BlockPath | null;
  onSelect: (p: BlockPath) => void;
  images: ProjectImage[];
}) {
  const isSel = pathEq(selected, path);
  const group = isGroup(block);
  return (
    <div
      className={`relative rounded-md border ${isSel ? "border-pink-100 ring-1 ring-pink-100/40" : "border-transparent hover:border-background-400"} p-1 cursor-pointer`}
      onClick={(e) => { e.stopPropagation(); onSelect(path); }}
    >
      <div className="absolute -top-2 left-2 text-[10px] px-1 rounded bg-background-300 opacity-70 z-10">{block.type}</div>
      <div className="pointer-events-none">
        {group ? (
          <div className="grid gap-2 p-2 min-h-[40px]">
            {(block as any).items?.length ? (block as any).items.map((child: EditorBlock, idx: number) => (
              <PreviewBlock key={child.__id} block={child} path={[...path, idx]} selected={selected} onSelect={onSelect} images={images} />
            )) : <p className="text-xs opacity-40 p-2">Empty {block.type} — add child blocks</p>}
          </div>
        ) : (
          <BlockPreview block={block} images={images} />
        )}
      </div>
    </div>
  );
}

function BlockPreview({ block, images }: { block: EditorBlock; images: ProjectImage[] }) {
  switch (block.type) {
    case "heading":
      return <Heading as={`h${block.level}`} icon={(block as any).icon} content={block.content} />;
    case "text":
      return <TextBlockView content={block.content} />;
    case "link":
      return <LinkBlockView label={block.label} href={block.href} />;
    case "icon-label":
      return <IconLabel label={block.label} href={(block as any).href} icon={(block as any).icon} />;
    case "separator":
      return <Separator direction={block.direction} spacing={block.spacing} />;
    case "accordion":
      return <AccordionBlockView data={block.items as AccordionItem[]} />;
    case "image": {
      const img = images.find((i) => i.order === block.order);
      if (!img) return <div className="text-xs opacity-50 p-3 border border-dashed border-background-400 rounded">Image order {block.order} not found</div>;
      return <img src={img.image_url || "/placeholder.svg"} alt={img.alt ?? "Project image"} className="w-full h-auto rounded-lg" />;
    }
    case "gallery":
      return <Gallery images={images} gridOptions={(block as any).gridOptions} style={block.style} items={block.items as GalleryItem[]} />;
    default:
      return <pre className="text-xs opacity-50">{(block as any).type}</pre>;
  }
}
