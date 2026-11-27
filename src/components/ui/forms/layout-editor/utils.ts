import type { LayoutBlock, ProjectLayout } from "@/lib/types/project-layout";
import type { BlockPath, EditorBlock } from "./types";

type GroupEditorBlock = EditorBlock & { items: EditorBlock[] };

function asGroup(block: EditorBlock): GroupEditorBlock | null {
  if (Array.isArray((block as unknown as { items?: unknown }).items)) {
    return block as GroupEditorBlock;
  }
  return null;
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function withIds(blocks: ProjectLayout): EditorBlock[] {
  return blocks.map((block) => {
    const items = (block as unknown as { items?: LayoutBlock[] }).items;
    if (Array.isArray(items)) {
      return { ...block, __id: uid(), items: withIds(items) } as EditorBlock;
    }
    return { ...block, __id: uid() } as EditorBlock;
  });
}

export function stripIds(blocks: EditorBlock[]): ProjectLayout {
  return blocks.map((block) => {
    const { __id: _id, ...rest } = block;
    void _id;
    const items = (rest as unknown as { items?: EditorBlock[] }).items;
    if (Array.isArray(items)) {
      (rest as unknown as { items: ProjectLayout }).items = stripIds(items);
    }
    return rest as unknown as LayoutBlock;
  });
}

export function cloneBlocks(blocks: EditorBlock[]): EditorBlock[] {
  return withIds(stripIds(blocks));
}

export function getAtPath(blocks: EditorBlock[], path: BlockPath): EditorBlock | null {
  let items: EditorBlock[] | undefined = blocks;
  let cur: EditorBlock | null = null;
  for (const idx of path) {
    if (!items || !items[idx]) return null;
    cur = items[idx];
    items = (cur as unknown as { items?: EditorBlock[] }).items;
  }
  return cur;
}

export function updateAtPath(
  blocks: EditorBlock[],
  path: BlockPath,
  updater: (b: EditorBlock) => EditorBlock,
): EditorBlock[] {
  if (path.length === 0) return blocks;
  const [head, ...rest] = path;
  return blocks.map((b, i) => {
    if (i !== head) return b;
    if (rest.length === 0) return updater(b);
    const group = asGroup(b);
    if (!group) return b;
    return { ...group, items: updateAtPath(group.items, rest, updater) } as EditorBlock;
  });
}

export function removeAtPath(blocks: EditorBlock[], path: BlockPath): EditorBlock[] {
  if (path.length === 0) return blocks;
  const [head, ...rest] = path;
  if (rest.length === 0) return blocks.filter((_, i) => i !== head);
  return blocks.map((b, i) => {
    if (i !== head) return b;
    const group = asGroup(b);
    if (!group) return b;
    return { ...group, items: removeAtPath(group.items, rest) } as EditorBlock;
  });
}

export function insertAtPath(
  blocks: EditorBlock[],
  parentPath: BlockPath,
  index: number,
  block: EditorBlock,
): EditorBlock[] {
  if (parentPath.length === 0) {
    const next = [...blocks];
    next.splice(Math.max(0, Math.min(index, next.length)), 0, block);
    return next;
  }
  const [head, ...rest] = parentPath;
  return blocks.map((b, i) => {
    if (i !== head) return b;
    const group = asGroup(b);
    if (!group) return b;
    return {
      ...group,
      items: insertAtPath(group.items, rest, index, block),
    } as EditorBlock;
  });
}

export function moveAtPath(blocks: EditorBlock[], path: BlockPath, dir: -1 | 1): EditorBlock[] {
  if (path.length === 0) return blocks;
  const parentPath = path.slice(0, -1);
  const idx = path[path.length - 1];
  const parent = parentPath.length === 0 ? null : getAtPath(blocks, parentPath);
  const parentItems = parentPath.length === 0 ? blocks : asGroup(parent as EditorBlock)?.items;
  if (!parentItems) return blocks;
  const nextIdx = idx + dir;
  if (nextIdx < 0 || nextIdx >= parentItems.length) return blocks;
  const item = parentItems[idx];
  const removed = removeAtPath(blocks, path);
  return insertAtPath(removed, parentPath, nextIdx, item);
}

export function pathEq(a: BlockPath | null, b: BlockPath | null) {
  if (!a || !b) return a === b;
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

export function isGroup(
  block: EditorBlock | LayoutBlock,
): block is (LayoutBlock & { items: LayoutBlock[]; type: "section" | "grid" | "stack" }) | (EditorBlock & { items: EditorBlock[]; type: "section" | "grid" | "stack" }) {
  return block.type === "section" || block.type === "grid" || block.type === "stack";
}

export function defaultBlock(type: LayoutBlock["type"]): EditorBlock {
  const base = { __id: uid() };
  switch (type) {
    case "heading":
      return { ...base, type: "heading", level: 2, content: "Heading" };
    case "text":
      return { ...base, type: "text", content: "Text content" };
    case "image":
      return { ...base, type: "image", from: "upload", order: 0 };
    case "gallery":
      return { ...base, type: "gallery", style: "default", items: [] };
    case "link":
      return { ...base, type: "link", href: "https://example.com", label: "Link" };
    case "icon-label":
      return { ...base, type: "icon-label", icon: { name: "TbLink", color: "#ffffff" }, label: "Label" };
    case "separator":
      return { ...base, type: "separator", direction: "x", spacing: 16 };
    case "accordion":
      return { ...base, type: "accordion", items: [{ heading: { content: "Item" }, body: { content: "Content" } }] };
    case "section":
      return { ...base, type: "section", items: [] };
    case "grid":
      return { ...base, type: "grid", items: [], gridOptions: { columns: "repeat(2, 1fr)", gap: "1rem" } };
    case "stack":
      return { ...base, type: "stack", items: [] };
  }
}

export function blockLabel(block: EditorBlock) {
  switch (block.type) {
    case "heading":
      return `Heading H${block.level}`;
    case "text":
      return "Text";
    case "image":
      return `Image (order ${block.order})`;
    case "gallery":
      return `Gallery (${block.items.length})`;
    case "link":
      return "Link";
    case "icon-label":
      return "Icon label";
    case "separator":
      return "Separator";
    case "accordion":
      return `Accordion (${block.items.length})`;
    case "section":
    case "grid":
    case "stack":
      return `${block.type[0].toUpperCase() + block.type.slice(1)} (${(block as unknown as { items?: unknown[] }).items?.length ?? 0})`;
  }
}

export function findPathById(blocks: EditorBlock[], id: string, path: BlockPath = []): BlockPath | null {
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const p = [...path, i];
    if (b.__id === id) return p;
    if (isGroup(b)) {
      const found = findPathById((b as unknown as GroupEditorBlock).items, id, p);
      if (found) return found;
    }
  }
  return null;
}

export function containsId(blocks: EditorBlock[], parentId: string, childId: string): boolean {
  const parentPath = findPathById(blocks, parentId);
  if (!parentPath) return false;
  const parent = getAtPath(blocks, parentPath);
  if (!parent || !isGroup(parent)) return false;
  return !!findPathById((parent as unknown as GroupEditorBlock).items, childId);
}
