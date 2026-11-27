/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
} from "@dnd-kit/core";
import { TbChevronDown, TbChevronUp, TbCopy, TbLayoutSidebarLeftCollapse, TbLayoutSidebarLeftExpand, TbPlus, TbTrash, TbX } from "react-icons/tb";

import type { LayoutBlock } from "@/lib/types/project-layout";
import { ProjectLayoutSchema } from "@/lib/schemas/project-layout.schema";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { BlockPath, EditorBlock, LayoutEditorProps } from "./types";
import {
  blockLabel,
  cloneBlocks,
  defaultBlock,
  findPathById,
  getAtPath,
  insertAtPath,
  isGroup,
  moveAtPath,
  removeAtPath,
  stripIds,
  updateAtPath,
  withIds,
} from "./utils";
import { BlockTree, BlockTreeOverlay } from "./tree";
import { BlockFields } from "./fields";
import { PreviewCanvas } from "./preview";

const BLOCK_OPTIONS: { type: LayoutBlock["type"]; label: string }[] = [
  { type: "heading", label: "Heading" },
  { type: "text", label: "Text" },
  { type: "image", label: "Image" },
  { type: "gallery", label: "Gallery" },
  { type: "link", label: "Link" },
  { type: "icon-label", label: "Icon label" },
  { type: "separator", label: "Separator" },
  { type: "accordion", label: "Accordion" },
  { type: "section", label: "Section" },
  { type: "grid", label: "Grid" },
  { type: "stack", label: "Stack" },
];

const collisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) return pointerCollisions;
  return closestCenter(args);
};

function isDescendantId(blocks: EditorBlock[], ancestorId: string, targetId: string): boolean {
  const ancestorPath = findPathById(blocks, ancestorId);
  if (!ancestorPath) return false;
  const ancestor = getAtPath(blocks, ancestorPath);
  if (!ancestor || !isGroup(ancestor)) return false;
  return !!findPathById((ancestor as any).items as EditorBlock[], targetId);
}

export default function LayoutEditor({ value, onChange, images, onUploadFiles }: LayoutEditorProps) {
  const [blocks, setBlocks] = useState<EditorBlock[]>(() => withIds(value ?? []));
  const [selected, setSelected] = useState<BlockPath | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [leftOpen, setLeftOpen] = useState(false);
  const lastEmitted = useRef(JSON.stringify(value ?? []));
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    const incoming = JSON.stringify(value ?? []);
    if (incoming !== lastEmitted.current) {
      lastEmitted.current = incoming;
      setBlocks(withIds(value ?? []));
      setSelected(null);
    }
  }, [value]);

  const commit = (next: EditorBlock[]) => {
    const stripped = stripIds(next);
    lastEmitted.current = JSON.stringify(stripped);
    setBlocks(next);
    onChange(stripped);
  };

  const selectedBlock = selected ? getAtPath(blocks, selected) : null;

  const imageByOrder = useMemo(() => {
    const map = new Map<number, any>();
    for (const img of images) map.set(img.order, img);
    return map;
  }, [images]);

  const addBlock = (type: LayoutBlock["type"], parentPath: BlockPath | null = null) => {
    const block = defaultBlock(type);
    if (type === "gallery" && images.length > 0) {
      (block as any).items = images.map((img) => ({ index: img.order, alt: img.alt ?? img.label }));
    }
    if (type === "image" && images.length > 0) {
      (block as any).order = images[0].order;
    }
    if (parentPath) {
      const parent = getAtPath(blocks, parentPath);
      if (parent && isGroup(parent)) {
        const next = insertAtPath(blocks, parentPath, ((parent as any).items?.length ?? 0), block);
        commit(next);
        setSelected([...parentPath, ((parent as any).items?.length ?? 0)]);
        return;
      }
    }
    commit([...blocks, block]);
    setSelected([blocks.length]);
  };

  const updateSelected = (updater: (b: EditorBlock) => EditorBlock) => {
    if (!selected) return;
    commit(updateAtPath(blocks, selected, updater));
  };

  const removeSelected = () => {
    if (!selected) return;
    commit(removeAtPath(blocks, selected));
    setSelected(null);
  };

  const duplicateSelected = () => {
    if (!selected) return;
    const b = getAtPath(blocks, selected);
    if (!b) return;
    const copy = cloneBlocks([b])[0];
    const parentPath = selected.slice(0, -1);
    const idx = selected[selected.length - 1];
    commit(insertAtPath(blocks, parentPath, idx + 1, copy));
    setSelected([...parentPath, idx + 1]);
  };

  const moveSelected = (dir: -1 | 1) => {
    if (!selected) return;
    const parentPath = selected.slice(0, -1);
    const idx = selected[selected.length - 1];
    const next = moveAtPath(blocks, selected, dir);
    if (next !== blocks) {
      commit(next);
      setSelected([...parentPath, idx + dir]);
    }
  };

  const openAdvanced = () => {
    setJsonText(JSON.stringify(stripIds(blocks), null, 2));
    setJsonError(null);
    setAdvancedOpen(true);
  };

  const applyJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const validated = ProjectLayoutSchema.parse(parsed);
      const next = withIds(validated);
      commit(next);
      setSelected(null);
      setJsonError(null);
      setAdvancedOpen(false);
    } catch (e: any) {
      setJsonError(e?.message ?? "Invalid layout JSON");
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const activeBlockId = String(active.id);
    const overId = String(over.id);
    const from = findPathById(blocks, activeBlockId);
    if (!from) return;

    let destParentPath: BlockPath;
    let destIndex: number;

    if (overId.startsWith("container:")) {
      const containerKey = overId.replace("container:", "");
      if (containerKey === "root") {
        destParentPath = [];
        destIndex = blocks.length;
      } else {
        if (containerKey === activeBlockId) return;
        if (isDescendantId(blocks, activeBlockId, containerKey)) return;
        const groupPath = findPathById(blocks, containerKey);
        if (!groupPath) return;
        const group = getAtPath(blocks, groupPath);
        if (!group || !isGroup(group)) return;
        destParentPath = groupPath;
        destIndex = ((group as any).items?.length ?? 0);
      }
    } else {
      const to = findPathById(blocks, overId);
      if (!to) return;
      if (isDescendantId(blocks, activeBlockId, overId)) return;
      destParentPath = to.slice(0, -1);
      destIndex = to[to.length - 1];
    }

    const fromParent = from.slice(0, -1);
    const fromIndex = from[from.length - 1];
    const sameParent = fromParent.join(".") === destParentPath.join(".");
    if (sameParent && fromIndex === destIndex) return;

    const moving = getAtPath(blocks, from);
    if (!moving) return;

    let next = removeAtPath(blocks, from);
    let insertIndex = destIndex;
    if (sameParent && fromIndex < destIndex) insertIndex = destIndex - 1;
    next = insertAtPath(next, destParentPath, insertIndex, moving);
    commit(next);

    const movedPath = findPathById(next, activeBlockId);
    setSelected(movedPath);
  };

  const activeBlock = activeId ? getAtPath(blocks, findPathById(blocks, activeId) ?? []) : null;

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2 items-center">
        <Button type="button" variant="outline" size="sm" onClick={() => setLeftOpen((v) => !v)} className="gap-1">
          {leftOpen ? <TbLayoutSidebarLeftCollapse size={16} /> : <TbLayoutSidebarLeftExpand size={16} />}
          Outline
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="gap-1">
              <TbPlus size={14} /> Add block
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {BLOCK_OPTIONS.map((opt) => (
              <DropdownMenuItem key={opt.type} onClick={() => addBlock(opt.type, selected && selectedBlock && isGroup(selectedBlock) ? selected : null)}>
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {selected && selectedBlock && isGroup(selectedBlock) && (
          <Badge variant="secondary">Inserting into {selectedBlock.type}</Badge>
        )}
        <Button type="button" variant="ghost" size="sm" className="ml-auto" onClick={openAdvanced}>
          Advanced JSON
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className={`grid gap-4 ${leftOpen && selectedBlock ? "xl:grid-cols-[260px_minmax(0,1fr)_340px]" : leftOpen ? "xl:grid-cols-[260px_minmax(0,1fr)]" : selectedBlock ? "xl:grid-cols-[minmax(0,1fr)_340px]" : "grid-cols-1"}`}>
          {leftOpen && (
            <div className="border border-background-400 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-background-400">
                <p className="text-sm font-medium">Outline</p>
                <Button type="button" variant="ghost" size="sm" onClick={() => setSelected(null)}>Root</Button>
              </div>
              <ScrollArea className="h-[60vh] p-2">
                <RootDropZone>
                  <BlockTree blocks={blocks} path={[]} selected={selected} onSelect={setSelected} />
                  {blocks.length === 0 && <p className="text-sm opacity-50 p-2">No blocks yet.</p>}
                </RootDropZone>
              </ScrollArea>
            </div>
          )}

          <div className="border border-background-400 rounded-lg overflow-hidden bg-background-50/20 min-w-0">
            <div className="px-3 py-2 border-b border-background-400 flex items-center justify-between">
              <p className="text-sm font-medium">Live preview</p>
              <p className="text-xs opacity-50">Click a block to edit</p>
            </div>
            <ScrollArea className="h-[60vh] p-4">
              <PreviewCanvas blocks={blocks} images={images} selected={selected} onSelect={setSelected} />
              {blocks.length === 0 && (
                <div className="py-16 text-center opacity-50 text-sm">
                  <p>No blocks yet.</p>
                  <p>Use “Add block” to start building your layout.</p>
                </div>
              )}
            </ScrollArea>
          </div>

          {selectedBlock && (
            <div className="border border-background-400 rounded-lg overflow-hidden">
              <div className="px-3 py-2 border-b border-background-400 flex items-center justify-between gap-2">
                <p className="text-sm font-medium truncate">Inspector</p>
                <Button type="button" variant="ghost" size="icon" onClick={() => setSelected(null)}><TbX /></Button>
              </div>
              <ScrollArea className="h-[60vh] p-3">
                <div className="grid gap-3">
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => moveSelected(-1)}><TbChevronUp /> Up</Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => moveSelected(1)}><TbChevronDown /> Down</Button>
                    <Button type="button" variant="outline" size="sm" onClick={duplicateSelected}><TbCopy /> Dup</Button>
                    <Button type="button" variant="destructive" size="sm" onClick={removeSelected}><TbTrash /></Button>
                  </div>
                  <Badge variant="outline">{blockLabel(selectedBlock)}</Badge>
                  <BlockFields block={selectedBlock} images={images} imageByOrder={imageByOrder} onChange={updateSelected} onUploadFiles={onUploadFiles} />
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeBlock ? <BlockTreeOverlay block={activeBlock} /> : null}
        </DragOverlay>
      </DndContext>

      {advancedOpen && (
        <div className="border border-background-400 rounded-lg p-3 grid gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Advanced JSON</p>
            <Button type="button" variant="ghost" size="icon" onClick={() => setAdvancedOpen(false)}><TbX /></Button>
          </div>
          <Textarea
            rows={14}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="font-mono text-xs"
          />
          {jsonError && <p className="text-xs text-pink-100">{jsonError}</p>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setAdvancedOpen(false)}>Cancel</Button>
            <Button type="button" onClick={applyJson}>Apply JSON</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function RootDropZone({ children }: { children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: "container:root" });
  return (
    <div ref={setNodeRef} className={`min-h-[200px] rounded-md transition-colors ${isOver ? "bg-pink-100/5 ring-1 ring-pink-100/30" : ""}`}>
      {children}
    </div>
  );
}
