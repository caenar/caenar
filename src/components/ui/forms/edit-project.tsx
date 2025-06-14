"use client";

import { Project } from "@/lib/types";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { toast } from "sonner";
import { editProjectSchema } from "@/lib/schemas/project.schema";
import { editProject } from "@/app/projects/action";

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

export default function EditProjectForm({
  project,
  close,
}: {
  project: Project;
  close: () => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<File[]>([]);
  const [tagInput, setTagInput] = useState(
    project.tags.map((t) => t.name).join(", "),
  );
  const [loading, setLoading] = useState(false);

  const [existingImages, setExistingImages] = useState(
    project.project_image.map((img) => ({ id: img.id, url: img.image_url })),
  );

  const addFile = () => fileInput.current?.click();
  const removeNewImage = (index: number) =>
    setImages((prev) => prev.filter((_, i) => i !== index));
  const removeExistingImage = (id: number) =>
    setExistingImages((prev) =>
      prev.filter((img) => parseInt(img.id, 10) !== id),
    );

  const form = useForm<z.infer<typeof editProjectSchema>>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      id: project.id,
      title: project.title ?? "",
      desc: project.desc ?? "",
      tags: project.tags?.map((t) => t.name) ?? [],
      images: [],
    },
  });

  async function onSubmit(values: z.infer<typeof editProjectSchema>) {
    setLoading(true);

    const finalTags = tagInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const formData = new FormData();

    formData.append("title", values.title ?? "");
    formData.append("desc", values.desc ?? "");
    finalTags.forEach((tag) => formData.append("tags", tag));
    images.forEach((file) => formData.append("images", file));
    existingImages.forEach((img) =>
      formData.append("existingImages", img.id.toString()),
    );

    const result = await editProject(project.id, formData);

    setLoading(false);

    handleResult(result, {
      ok: (message: string) => {
        toast.success(message);
        close();
      },
      error: {
        validation: (details: string) => toast.warning(details),
      },
      fallback: () => toast.error("Something went wrong. Please try again."),
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-1.5"
        encType="multipart/form-data"
      >
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
                <Textarea placeholder="Description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Tags (comma-separated)</FormLabel>
          <FormControl>
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g. react, ui, backend"
            />
          </FormControl>
        </FormItem>

        <div className="form-input">
          <label>Existing Images</label>
          {existingImages.length > 0 && (
            <div className="uploads-container">
              {existingImages.map((img, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Image
                    src={img.url}
                    alt={`Image ${index}`}
                    width={40}
                    height={40}
                    style={{ objectFit: "cover" }}
                    className="rounded-md border"
                  />
                  <span className="truncate max-w-[10rem]">
                    {img.url.split("/").pop()}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeExistingImage(parseInt(img.id, 10))}
                  >
                    <TbX className="text-pink-100" size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-input">
          <label>New Images</label>
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
                  <span className="truncate max-w-[10rem]">{img.name}</span>
                  <button type="button" onClick={() => removeNewImage(index)}>
                    <TbX className="text-pink-100" size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div
            className="secondary-button icon-label !gap-1 text-[14px]"
            onClick={addFile}
          >
            <TbPlus size={16} />
            Add more
          </div>
          <input
            ref={fileInput}
            type="file"
            hidden
            multiple
            onChange={(e) => {
              if (!e.target.files) return;
              const newFiles = Array.from(e.target.files);
              setImages((prev) => [...prev, ...newFiles]);
            }}
          />
        </div>

        <div className="flex justify-end gap-4 mt-5">
          <button type="button" onClick={close}>
            Cancel
          </button>
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </Form>
  );
}
