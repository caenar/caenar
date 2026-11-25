"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TbGripVertical } from "react-icons/tb";

import type { BlockPath, EditorBlock } from "./types";
import { blockLabel, isGroup, pathEq } from "./utils";

export function BlockTree({
  blocks,
  path,
  selected,
  onSelect,
}: {
  blocks: EditorBlock[];
  path: BlockPath;
  selected: BlockPath | null;
  onSelect: (p: BlockPath) => void;
}) {
  const containerId = path.length === 0 ? "container:root" : `container:${path.join("-")}`;
  // Droppable is handled by parent group row for nested; root handled in index if needed.
  return (
    <SortableContext items={blocks.map((b) => b.__id)} strategy={verticalListSortingStrategy}>
      <div className="grid gap-1" data-container={containerId}>
        {blocks.map((block, i) => (
          <SortableBlockRow
            key={block.__id}
            block={block}
            path={[...path, i]}
            selected={selected}
            onSelect={onSelect}
          />
        ))}
      </div>
    </SortableContext>
  );
}

function SortableBlockRow({
  block,
  path,
  selected,
  onSelect,
}: {
  block: EditorBlock;
  path: BlockPath;
  selected: BlockPath | null;
  onSelect: (p: BlockPath) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.__id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };
  const isSel = pathEq(selected, path);
  const group = isGroup(block);

  return (
    <div ref={setNodeRef} style={style} className="grid gap-1">
      <div className={`flex items-center gap-1 rounded border ${isSel ? "border-pink-100 bg-background-300" : "border-transparent hover:border-background-400 hover:bg-background-200"}`}>
        <button type="button" className="px-1 py-2 opacity-50 hover:opacity-100 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
          <TbGripVertical size={14} />
        </button>
        <button type="button" onClick={() => onSelect(path)} className="flex-1 text-left text-xs py-1 pr-2 truncate">
          <span className="opacity-50 mr-1">{path[path.length - 1] + 1}.</span>
          {blockLabel(block)}
        </button>
      </div>
      {group && <GroupChildren block={block} path={path} selected={selected} onSelect={onSelect} />}
    </div>
  );
}

function GroupChildren({
  block,
  path,
  selected,
  onSelect,
}: {
  block: EditorBlock;
  path: BlockPath;
  selected: BlockPath | null;
  onSelect: (p: BlockPath) => void;
}) {
  const items = (block as any).items as EditorBlock[];
  const { setNodeRef, isOver } = useDroppable({ id: `container:${block.__id}` });
  return (
    <div
      ref={setNodeRef}
      className={`ml-4 pl-2 border-l ${isOver ? "border-pink-100 bg-pink-100/5" : "border-background-400"} rounded-sm min-h-[28px]`}
    >
      <BlockTree blocks={items} path={path} selected={selected} onSelect={onSelect} />
      {items.length === 0 && (
        <p className="text-[11px] opacity-40 px-2 py-1">Drop blocks here</p>
      )}
    </div>
  );
}

export function BlockTreeOverlay({ block }: { block: EditorBlock }) {
  return (
    <div className="flex items-center gap-1 rounded border border-pink-100 bg-background-300 px-2 py-1 text-xs shadow-lg w-[220px]">
      <TbGripVertical size={14} className="opacity-50" />
      <span className="truncate">{blockLabel(block)}</span>
    </div>
  );
}
