"use client";

import { ConfirmData, Project, ProjectImage } from "@/lib/types";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { toast } from "sonner";
import { editProjectSchema } from "@/lib/schemas/project.schema";
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
import { TbPlus, TbX } from "react-icons/tb";
import { handleResult } from "@/lib/utils/handle-result";
import { Trash } from "lucide-react";
import Loader from "../loader";

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
  const fileInput = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<File[]>([]);
  const [tagInput, setTagInput] = useState(
    project.tags.map((t) => t.name).join(", "),
  );

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
      role: index === 0 ? "cover" : "gallery",
      order: index,
    }));
  });

  const addFile = () => fileInput.current?.click();

  const removeNewImage = (index: number) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  const setAsCover = (imgId: string) => {
    setExistingImages((prev) => {
      const idx = prev.findIndex((i) => i.id === imgId);
      if (idx <= 0) return prev;
      const next = [...prev];
      const [picked] = next.splice(idx, 1);
      next.unshift(picked);
      return next.map((img, index) => ({
        ...img,
        order: index,
        role: index === 0 ? "cover" : "gallery",
      }));
    });
  };

  const removeExistingImage = (img: ProjectImage) => {
    setExistingImages((prev) =>
      prev
        .filter((i) => i.id !== img.id)
        .map((image, index) => ({
          ...image,
          order: index,
          role: index === 0 ? "cover" : "gallery",
        })),
    );
  };

  const form = useForm<z.infer<typeof editProjectSchema>>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      id: project.id ?? "",
      title: project.title ?? "",
      desc: project.desc ?? "",
      layout: JSON.stringify(project.layout, null, 2) ?? "",
    },
  });

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

  async function onSubmit(values: z.infer<typeof editProjectSchema>) {
    const finalTags = tagInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const formData = new FormData();

    formData.append("projectId", project.id);
    formData.append("title", values.title ?? "");
    formData.append("desc", values.desc ?? "");
    formData.append("layout", values.layout ?? "");
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
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
        encType="multipart/form-data"
      >
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

          <div className="form-input">
            <label>Existing Images</label>
            <div className="line my-1"></div>
            {existingImages.length > 0 && (
              <div className="uploads-container">
                {existingImages.map((img, index) => (
                  <div key={img.id} className="flex items-center gap-2">
                    <Image
                      src={img.image_url || "/placeholder.svg"}
                      alt={img.alt || `img ${index}`}
                      width={40}
                      height={40}
                      style={{ objectFit: "cover" }}
                      className="rounded-md border"
                    />
                    <div className="w-full min-w-0 max-w-[350px]">
                      <span className="block truncate break-all text-sm">
                        {img.path?.split("/").pop() || img.image_url.split("/").pop() || "image"}
                      </span>
                      {index === 0 && (
                        <span className="text-[11px] uppercase opacity-60">Cover</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {index !== 0 && (
                        <button
                          type="button"
                          className="text-xs opacity-70 hover:opacity-100"
                          onClick={() => setAsCover(img.id)}
                        >
                          Cover
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img)}
                      >
                        <TbX className="text-pink-100" size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-input">
            {images.length > 0 && (
              <div className="uploads-container">
                {images.map((img, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Image
                      src={URL.createObjectURL(img)}
                      alt={`New Image ${index}`}
                      width={40}
                      height={40}
                      style={{ objectFit: "cover" }}
                      className="rounded-md border"
                    />
                    <span className="truncate w-full">{img.name}</span>
                    <button type="button" onClick={() => removeNewImage(index)}>
                      <TbX className="text-pink-100" size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div
              className="secondary-button icon-label !gap-1 text-[14px] cursor-pointer"
              onClick={addFile}
            >
              <TbPlus size={16} />
              Add more images
            </div>
            <input
              ref={fileInput}
              type="file"
              hidden
              accept="image/*"
              multiple
              onChange={(e) => {
                if (!e.target.files) return;
                const newFiles = Array.from(e.target.files);
                setImages((prev) => [...prev, ...newFiles]);
              }}
            />
          </div>
        </div>
        <div className="grid">
          <FormField
            control={form.control}
            name="layout"
            render={({ field }) => (
              <FormItem className="h-full">
                <FormLabel>Layout</FormLabel>
                <FormControl>
                  <Textarea
                    className="h-full"
                    onWheel={(e) => e.stopPropagation()}
                    placeholder="Follow project layout type"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          ></FormField>
        </div>
        <div className="md:col-span-2 flex flex-col-reverse sm:flex-row justify-between gap-3 mt-5">
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
