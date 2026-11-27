/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ConfirmData, Project, ProjectImage } from "@/lib/types";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { deleteProject, editProject } from "@/app/admin/action";

import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormField,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "../textarea";
import { handleResult } from "@/lib/utils/handle-result";
import { Trash } from "lucide-react";
import Loader from "../loader";
import LayoutEditor from "./layout-editor";
import type { ProjectLayout } from "@/lib/types/project-layout";
import { ProjectLayoutSchema } from "@/lib/schemas/project-layout.schema";

const editProjectFormSchema = z.object({
  id: z.string().min(1, "Project ID is required"),
  title: z.string().trim().min(1, "Title is required"),
  desc: z.string().trim().min(1, "Description is required"),
});

function remapLayoutOrders(
  layout: ProjectLayout,
  orderMap: Map<number, number>,
  removedOrders: Set<number>,
): ProjectLayout {
  function remapBlock(block: any): any | null {
    if (block.type === "section" || block.type === "grid" || block.type === "stack") {
      const items = (block.items ?? []).flatMap((child: any) => {
        const remapped = remapBlock(child);
        return remapped ? [remapped] : [];
      });
      return { ...block, items };
    }
    if (block.type === "gallery") {
      const items = (block.items ?? []).flatMap((item: any) => {
        const next = orderMap.get(item.index);
        if (next !== undefined) return [{ ...item, index: next }];
        return removedOrders.has(item.index) ? [] : [item];
      });
      return { ...block, items };
    }
    if (block.type === "image") {
      const next = orderMap.get(block.order);
      if (next !== undefined) return { ...block, order: next };
      return removedOrders.has(block.order) ? null : block;
    }
    return block;
  }
  return layout.flatMap((block) => {
    const remapped = remapBlock(block);
    return remapped ? [remapped] : [];
  });
}

export default function EditProjectForm({
  project,
  closeAction,
  openConfirmPopupAction,
  closeConfirmPopupAction,
}: {
  project: Project;
  closeAction: () => void;
  openConfirmPopupAction: (confirmData: ConfirmData) => void;
  closeConfirmPopupAction: () => void;
}) {
  const [images, setImages] = useState<File[]>([]);
  const [tagInput, setTagInput] = useState(
    project.tags.map((t) => t.name).join(", "),
  );
  const [layout, setLayout] = useState<ProjectLayout>(project.layout ?? []);
  const [layoutError, setLayoutError] = useState<string | null>(null);

  const [existingImages, setExistingImages] = useState<ProjectImage[]>(() => {
    const sorted = [...project.project_image].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
    const coverIndex = sorted.findIndex((image) => image.role === "cover");

    if (coverIndex > 0) {
      const [cover] = sorted.splice(coverIndex, 1);
      sorted.unshift(cover);
    }

    return sorted.map((img, index) => ({
      id: img.id,
      path: img.path,
      image_url: img.image_url,
      alt: img.alt,
      role: index === 0 ? ("cover" as const) : ("gallery" as const),
      order: index,
    }));
  });

  const removeNewImage = (index: number) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  const applyExistingImageChange = (nextImages: ProjectImage[]) => {
    setExistingImages((prev) => {
      const orderMap = new Map<number, number>();
      const removedOrders = new Set<number>();
      const nextById = new Map(nextImages.map((img) => [img.id, img]));
      for (const img of prev) {
        const next = nextById.get(img.id);
        if (next) orderMap.set(img.order, next.order);
        else removedOrders.add(img.order);
      }
      setLayout((currentLayout) => remapLayoutOrders(currentLayout, orderMap, removedOrders));
      return nextImages;
    });
  };

  const setAsCover = (imgId: string) => {
    const idx = existingImages.findIndex((i) => i.id === imgId);
    if (idx <= 0) return;
    const next = [...existingImages];
    const [picked] = next.splice(idx, 1);
    next.unshift(picked);
    applyExistingImageChange(
      next.map((img, index) => ({
        ...img,
        order: index,
        role: index === 0 ? ("cover" as const) : ("gallery" as const),
      })),
    );
  };

  const removeExistingImage = (img: ProjectImage) => {
    const next = existingImages
      .filter((i) => i.id !== img.id)
      .map((image, index) => ({
        ...image,
        order: index,
        role: index === 0 ? ("cover" as const) : ("gallery" as const),
      }));
    applyExistingImageChange(next);
  };

  const handleUploadFiles = (files: File[]) => {
    setImages((prev) => [...prev, ...files]);
  };

  const handleRemoveEditorImage = (id: string) => {
    const existing = existingImages.find((i) => i.id === id);
    if (existing) {
      removeExistingImage(existing);
      return;
    }
    const idx = newImagePreviews.findIndex((p) => p.id === id);
    if (idx !== -1) removeNewImage(idx);
  };

  const handleSetCover = (id: string) => {
    const existing = existingImages.find((i) => i.id === id);
    if (existing) {
      setAsCover(id);
      return;
    }
    const idx = newImagePreviews.findIndex((p) => p.id === id);
    if (idx > 0) {
      setImages((prev) => {
        const next = [...prev];
        const [picked] = next.splice(idx, 1);
        next.unshift(picked);
        return next;
      });
    }
  };

  const form = useForm<z.infer<typeof editProjectFormSchema>>({
    resolver: zodResolver(editProjectFormSchema),
    defaultValues: {
      id: project.id ?? "",
      title: project.title ?? "",
      desc: project.desc ?? "",
    },
  });

  const [newImagePreviews, setNewImagePreviews] = useState<
    { file: File; url: string; order: number; id: string; label: string }[]
  >([]);

  useEffect(() => {
    const next = images.map((file, i) => ({
      file,
      url: URL.createObjectURL(file),
      order: existingImages.length + i,
      id: `new-${i}-${file.name}-${file.size}`,
      label: file.name,
    }));
    setNewImagePreviews(next);
    return () => {
      next.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [images, existingImages.length]);

  const editorImages = useMemo(
    () => [
      ...existingImages.map((img) => ({
        id: img.id,
        image_url: img.image_url || "/placeholder.svg",
        order: img.order,
        alt: img.alt,
        label: img.path?.split("/").pop() || img.image_url.split("/").pop() || "image",
      })),
      ...newImagePreviews.map((img) => ({
        id: img.id,
        image_url: img.url,
        order: img.order,
        alt: null,
        label: img.label,
      })),
    ],
    [existingImages, newImagePreviews],
  );

  const confirmDelete = () => {
    openConfirmPopupAction({
      type: "delete",
      action: async () => {
        const result = await deleteProject(project.id);
        handleResult(result, {
          ok: (message: string) => {
            toast.success(message);
            closeConfirmPopupAction();
            closeAction();
          },
          error: {
            validation: (details: string) => toast.warning(details),
            conflict: (details: string) => toast.warning(details),
          },
          fallback: () =>
            toast.error("Something went wrong. Please try again."),
        });
      },
    });
  };

  async function onSubmit(values: z.infer<typeof editProjectFormSchema>) {
    const layoutResult = ProjectLayoutSchema.safeParse(layout);
    if (!layoutResult.success) {
      setLayoutError(layoutResult.error.issues[0]?.message ?? "Invalid layout");
      toast.warning("Layout is invalid. Check the layout editor.");
      return;
    }
    setLayoutError(null);

    const finalTags = tagInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const formData = new FormData();

    formData.append("projectId", project.id);
    formData.append("title", values.title ?? "");
    formData.append("desc", values.desc ?? "");
    formData.append("layout", JSON.stringify(layoutResult.data));
    finalTags.forEach((tag) => formData.append("tags", tag));
    images.forEach((file) => formData.append("images", file));
    existingImages.forEach((img) =>
      formData.append("existingImages", img.id.toString()),
    );

    const result = await editProject(formData);

    handleResult(result, {
      ok: (message: string) => {
        toast.success(message);
        closeAction();
      },
      error: {
        validation: (details: string) => toast.warning(details),
        conflict: (details: string) => toast.warning(details),
      },
      fallback: () => toast.error("Something went wrong. Please try again."),
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-5"
        encType="multipart/form-data"
      >
        <div className="grid grid-cols-1 gap-5">
          <div className="grid gap-3">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Project title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="desc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Tags (comma-separated)</FormLabel>
              <FormControl>
                <Textarea
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="e.g. react, ui, backend"
                />
              </FormControl>
            </FormItem>
          </div>

        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Layout & Images</label>
            <span className="text-xs opacity-50">Manage images and build layout visually</span>
          </div>
          <LayoutEditor
            value={layout}
            onChange={setLayout}
            images={editorImages}
            onUploadFiles={handleUploadFiles}
            onRemoveImage={handleRemoveEditorImage}
            onSetCover={handleSetCover}
          />
          {layoutError && <p className="text-xs text-pink-100">{layoutError}</p>}
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-5">
          <button
            type="button"
            className="danger-button icon-label"
            onClick={() => confirmDelete()}
          >
            <Trash size={18} />
            Delete
          </button>
          <div className="flex gap-4">
            <button type="button" onClick={() => closeAction()}>
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? <Loader /> : "Save changes"}
            </button>
          </div>
        </div>
      </form>
    </Form>
  );
}