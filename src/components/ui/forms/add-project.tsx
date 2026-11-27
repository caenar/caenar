"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { toast } from "sonner";

import { addProjectSchema } from "@/lib/schemas/project.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleResult } from "@/lib/utils/handle-result";
import { addProject } from "@/app/admin/action";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "../textarea";
import { z } from "zod";
import Loader from "../loader";
import LayoutEditor from "./layout-editor";
import type { ProjectLayout } from "@/lib/types/project-layout";
import { ProjectLayoutSchema } from "@/lib/schemas/project-layout.schema";

export default function AddProjectForm({
  closeAction,
}: {
  closeAction: () => void;
}) {
  const [images, setImages] = useState<File[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [layout, setLayout] = useState<ProjectLayout>([]);
  const [layoutError, setLayoutError] = useState<string | null>(null);

  const removeFile = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const form = useForm<z.infer<typeof addProjectSchema>>({
    resolver: zodResolver(addProjectSchema),
    defaultValues: { title: "", desc: "" },
  });

  const [imagePreviews, setImagePreviews] = useState<
    { id: string; url: string; order: number; label: string }[]
  >([]);

  useEffect(() => {
    const next = images.map((file, i) => ({
      id: `new-${i}-${file.name}-${file.size}`,
      url: URL.createObjectURL(file),
      order: i,
      label: file.name,
    }));
    setImagePreviews(next);
    return () => {
      next.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [images]);

  const editorImages = useMemo(
    () =>
      imagePreviews.map((img) => ({
        id: img.id,
        image_url: img.url,
        order: img.order,
        alt: null,
        label: img.label,
      })),
    [imagePreviews],
  );

  const handleUploadFiles = (files: File[]) => {
    setImages((prev) => [...prev, ...files]);
  };

  const handleRemoveEditorImage = (id: string) => {
    const idx = imagePreviews.findIndex((p) => p.id === id);
    if (idx !== -1) removeFile(idx);
  };

  const handleSetCover = (id: string) => {
    const idx = imagePreviews.findIndex((p) => p.id === id);
    if (idx > 0) {
      setImages((prev) => {
        const next = [...prev];
        const [picked] = next.splice(idx, 1);
        next.unshift(picked);
        return next;
      });
    }
  };

  const generateDefaultLayout = () => {
    const desc = form.getValues("desc") || "Project description";
    const title = form.getValues("title") || "Project";
    const galleryItems = imagePreviews.map((img) => ({
      index: img.order,
      alt: `${title} project image`,
    }));
    const next: ProjectLayout = [{ type: "text", content: desc }];
    if (galleryItems.length > 0) {
      next.push({ type: "gallery", style: "default", items: galleryItems });
    }
    setLayout(next);
    setLayoutError(null);
  };

  async function onSubmit(values: z.infer<typeof addProjectSchema>) {
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
    formData.append("title", values.title);
    formData.append("desc", values.desc);
    if (layoutResult.data.length > 0) {
      formData.append("layout", JSON.stringify(layoutResult.data));
    }
    finalTags.forEach((tag) => formData.append("tags", tag));
    images.forEach((file) => formData.append("images", file));

    const result = await addProject(formData);

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="grid gap-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Title of the project"
                      {...field}
                    />
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
                    <Textarea
                      rows={3}
                      placeholder="Keep it short and concise"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Tags (separated by comma)</FormLabel>
              <FormControl>
                <Textarea
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="e.g. react, ui, web"
                />
              </FormControl>
            </FormItem>
          </div>

        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-medium">Layout & Images</label>
            <div className="flex items-center gap-3">
              <span className="text-xs opacity-50">Optional — default layout is used if empty</span>
              <button type="button" className="secondary-button text-xs !py-1 !px-2" onClick={generateDefaultLayout}>
                Generate default
              </button>
            </div>
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

        <div className="flex justify-end gap-4 mt-5">
          <button type="button" onClick={() => closeAction()}>
            Cancel
          </button>
          <button
            type="submit"
            className="primary-button"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? <Loader /> : "Add project"}
          </button>
        </div>
      </form>
    </Form>
  );
}