/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
"use client";

import { useRef } from "react";
import { TbUpload } from "react-icons/tb";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EditorBlock, EditorImage } from "./types";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-xs opacity-70">{children}</label>;
}

function UploadButton({ onUploadFiles, multiple, label = "Upload" }: { onUploadFiles?: (files: File[]) => void; multiple?: boolean; label?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  if (!onUploadFiles) return null;
  return (
    <>
      <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => ref.current?.click()}>
        <TbUpload size={14} /> {label}
      </Button>
      <input
        ref={ref}
        type="file"
        hidden
        accept="image/*"
        multiple={multiple}
        onChange={(e) => {
          if (!e.target.files) return;
          onUploadFiles(Array.from(e.target.files));
          e.currentTarget.value = "";
        }}
      />
    </>
  );
}

export function BlockFields({
  block,
  images,
  imageByOrder,
  onChange,
  onUploadFiles,
}: {
  block: EditorBlock;
  images: EditorImage[];
  imageByOrder: Map<number, EditorImage>;
  onChange: (updater: (b: EditorBlock) => EditorBlock) => void;
  onUploadFiles?: (files: File[]) => void;
}) {
  const set = (patch: any) => onChange((b) => ({ ...(b as any), ...patch }) as EditorBlock);

  switch (block.type) {
    case "heading":
      return (
        <div className="grid gap-2">
          <div>
            <FieldLabel>Level</FieldLabel>
            <Select value={String(block.level)} onValueChange={(v) => set({ level: Number(v) })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map((l) => <SelectItem key={l} value={String(l)}>H{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><FieldLabel>Content</FieldLabel><Input value={block.content} onChange={(e) => set({ content: e.target.value })} /></div>
          <IconFields icon={(block as any).icon} onChange={(icon) => set({ icon })} />
        </div>
      );
    case "text":
      return (
        <div className="grid gap-2">
          <div><FieldLabel>Content</FieldLabel><Textarea rows={5} value={block.content} onChange={(e) => set({ content: e.target.value })} /></div>
          <label className="flex gap-2 items-center text-xs">
            <Switch checked={!!(block as any).card} onCheckedChange={(checked) => set({ card: checked })} />
            Card style
          </label>
        </div>
      );
    case "image":
      return (
        <div className="grid gap-2">
          <div className="grid gap-2">
            <FieldLabel>Image</FieldLabel>
            <Select value={String(block.order)} onValueChange={(v) => set({ order: Number(v) })}>
              <SelectTrigger><SelectValue placeholder="Select image" /></SelectTrigger>
              <SelectContent>
                {images.length === 0 && <SelectItem value={String(block.order)}>No images available</SelectItem>}
                {images.map((img) => <SelectItem key={img.id} value={String(img.order)}>{img.label} (order {img.order})</SelectItem>)}
              </SelectContent>
            </Select>
            <UploadButton onUploadFiles={onUploadFiles} label="Upload image" />
          </div>
          <div><FieldLabel>Source label (from)</FieldLabel><Input value={(block as any).from ?? ""} onChange={(e) => set({ from: e.target.value })} /></div>
          {imageByOrder.get(block.order) && (
            <img src={imageByOrder.get(block.order)!.image_url} alt="" className="w-full max-h-40 object-cover rounded border border-background-400" />
          )}
        </div>
      );
    case "gallery":
      return (
        <div className="grid gap-2">
          <div>
            <FieldLabel>Style</FieldLabel>
            <Select value={block.style} onValueChange={(v) => set({ style: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="default">default</SelectItem>
                <SelectItem value="masonry">masonry</SelectItem>
                <SelectItem value="featured">featured</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <GridOptionsFields value={(block as any).gridOptions} onChange={(gridOptions) => set({ gridOptions })} />
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <FieldLabel>Items (select images)</FieldLabel>
              <UploadButton onUploadFiles={onUploadFiles} multiple label="Upload images" />
            </div>
            <div className="grid gap-2 max-h-64 overflow-auto border border-background-400 rounded p-2">
              {images.map((img) => {
                const idx = block.items.findIndex((it) => it.index === img.order);
                const checked = idx !== -1;
                return (
                  <div key={img.id} className="grid gap-1 border-b border-background-400/40 pb-2 last:border-b-0">
                    <label className="flex gap-2 items-center text-xs">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => {
                          const isChecked = !!v;
                          if (isChecked) set({ items: [...block.items, { index: img.order, alt: img.alt ?? img.label }] });
                          else set({ items: block.items.filter((it) => it.index !== img.order) });
                        }}
                      />
                      <img src={img.image_url} alt="" className="w-8 h-8 object-cover rounded" />
                      <span className="truncate">{img.label}</span>
                    </label>
                    {checked && (
                      <div className="grid gap-1 pl-6">
                        <Input placeholder="Alt text" value={block.items[idx]?.alt ?? ""} onChange={(e) => {
                          const next = [...block.items];
                          next[idx] = { ...next[idx], alt: e.target.value };
                          set({ items: next });
                        }} />
                        <Input placeholder="Description (optional)" value={block.items[idx]?.desc ?? ""} onChange={(e) => {
                          const next = [...block.items];
                          next[idx] = { ...next[idx], desc: e.target.value || undefined };
                          set({ items: next });
                        }} />
                      </div>
                    )}
                  </div>
                );
              })}
              {images.length === 0 && <p className="text-xs opacity-50">No images available.</p>}
            </div>
          </div>
        </div>
      );
    case "link":
      return (
        <div className="grid gap-2">
          <div><FieldLabel>Label</FieldLabel><Input value={block.label} onChange={(e) => set({ label: e.target.value })} /></div>
          <div><FieldLabel>Href</FieldLabel><Input value={block.href} onChange={(e) => set({ href: e.target.value })} /></div>
          <IconFields icon={(block as any).icon} onChange={(icon) => set({ icon })} />
        </div>
      );
    case "icon-label":
      return (
        <div className="grid gap-2">
          <div><FieldLabel>Label</FieldLabel><Input value={block.label} onChange={(e) => set({ label: e.target.value })} /></div>
          <div><FieldLabel>Href (optional)</FieldLabel><Input value={(block as any).href ?? ""} onChange={(e) => set({ href: e.target.value || undefined })} /></div>
          <IconFields icon={(block as any).icon} onChange={(icon) => set({ icon })} required />
        </div>
      );
    case "separator":
      return (
        <div className="grid gap-2">
          <div>
            <FieldLabel>Direction</FieldLabel>
            <Select value={block.direction} onValueChange={(v) => set({ direction: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="x">Horizontal (x)</SelectItem>
                <SelectItem value="y">Vertical (y)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><FieldLabel>Spacing</FieldLabel><Input type="number" value={block.spacing ?? 0} onChange={(e) => set({ spacing: Number(e.target.value) })} /></div>
        </div>
      );
    case "accordion":
      return (
        <div className="grid gap-2">
          <FieldLabel>Items</FieldLabel>
          {block.items.map((item, idx) => (
            <div key={idx} className="border border-background-400 rounded p-2 grid gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs opacity-60">Item {idx + 1}</span>
                <Button type="button" variant="ghost" size="sm" className="text-pink-100 h-auto px-2 py-1" onClick={() => set({ items: block.items.filter((_, i) => i !== idx) })}>Remove</Button>
              </div>
              <Input placeholder="Heading" value={item.heading.content} onChange={(e) => {
                const next = [...block.items];
                next[idx] = { ...item, heading: { ...item.heading, content: e.target.value } };
                set({ items: next });
              }} />
              <Textarea rows={3} placeholder="Body" value={item.body.content} onChange={(e) => {
                const next = [...block.items];
                next[idx] = { ...item, body: { content: e.target.value } };
                set({ items: next });
              }} />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set({ items: [...block.items, { heading: { content: "Heading" }, body: { content: "Content" } }] })}>+ Add item</Button>
        </div>
      );
    case "section":
    case "grid":
    case "stack":
      return (
        <div className="grid gap-2">
          <label className="flex gap-2 items-center text-xs">
            <Switch checked={!!(block as any).card} onCheckedChange={(checked) => set({ card: checked })} />
            Card style
          </label>
          {block.type === "grid" && <GridOptionsFields value={(block as any).gridOptions} onChange={(gridOptions) => set({ gridOptions })} />}
          <div><FieldLabel>Min width</FieldLabel><Input value={(block as any).minWidth ?? ""} onChange={(e) => set({ minWidth: e.target.value || undefined })} /></div>
          <div><FieldLabel>Min height</FieldLabel><Input value={(block as any).minHeight ?? ""} onChange={(e) => set({ minHeight: e.target.value || undefined })} /></div>
          <p className="text-xs opacity-50">Children: {(block as any).items?.length ?? 0}. Select this group and use Add block to insert inside it.</p>
        </div>
      );
  }
}

function IconFields({ icon, onChange, required }: { icon?: { name: string; color: string; size?: number }; onChange: (icon: any) => void; required?: boolean }) {
  const enabled = !!icon || required;
  return (
    <div className="grid gap-2 border border-background-400/40 rounded p-2">
      <label className="flex gap-2 items-center text-xs">
        <Switch
          checked={enabled}
          disabled={required}
          onCheckedChange={(checked) => onChange(checked ? { name: "TbLink", color: "#ffffff", size: 20 } : undefined)}
        />
        Icon {required ? "(required)" : "(optional)"}
      </label>
      {enabled && (
        <>
          <div><FieldLabel>Name</FieldLabel><Input value={icon?.name ?? ""} onChange={(e) => onChange({ ...icon, name: e.target.value, color: icon?.color ?? "#ffffff" })} /></div>
          <div><FieldLabel>Color</FieldLabel><Input value={icon?.color ?? "#ffffff"} onChange={(e) => onChange({ ...icon, name: icon?.name ?? "TbLink", color: e.target.value })} /></div>
          <div><FieldLabel>Size</FieldLabel><Input type="number" value={icon?.size ?? 20} onChange={(e) => onChange({ ...icon, name: icon?.name ?? "TbLink", color: icon?.color ?? "#ffffff", size: Number(e.target.value) || undefined })} /></div>
        </>
      )}
    </div>
  );
}

function GridOptionsFields({ value, onChange }: { value?: { columns?: string; gap?: string; align?: "start" | "center" | "end" | "stretch" }; onChange: (v: any) => void }) {
  return (
    <div className="grid gap-2 border border-background-400/40 rounded p-2">
      <FieldLabel>Grid options</FieldLabel>
      <div><FieldLabel>Columns</FieldLabel><Input value={value?.columns ?? ""} placeholder="repeat(2, 1fr)" onChange={(e) => onChange({ ...value, columns: e.target.value || undefined })} /></div>
      <div><FieldLabel>Gap</FieldLabel><Input value={value?.gap ?? ""} placeholder="1rem" onChange={(e) => onChange({ ...value, gap: e.target.value || undefined })} /></div>
      <div>
        <FieldLabel>Align</FieldLabel>
        <Select value={value?.align ?? "default"} onValueChange={(v) => onChange({ ...value, align: v === "default" ? undefined : v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="default">default</SelectItem>
            <SelectItem value="start">start</SelectItem>
            <SelectItem value="center">center</SelectItem>
            <SelectItem value="end">end</SelectItem>
            <SelectItem value="stretch">stretch</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
