"use client";

import { ConfirmData, Project, ProjectImage } from "@/lib/types";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { toast } from "sonner";
import { editProjectSchema } from "@/lib/schemas/project.schema";
import { deleteProject, editProject } from "@/app/projects/action";

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
  close,
  openConfirmPopup,
  closeConfirmPopup,
}: {
  project: Project;
  close: () => void;
  openConfirmPopup: (confirmData: ConfirmData) => void;
  closeConfirmPopup: () => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<File[]>([]);
  const [tagInput, setTagInput] = useState(
    project.tags.map((t) => t.name).join(", "),
  );

  const [existingImages, setExistingImages] = useState<ProjectImage[]>(
    project.project_image.map((img) => ({
      id: img.id,
      image_url: img.image_url,
      order: img.order,
    })),
  );
  const [removedImageIds, setRemovedImageIds] = useState<ProjectImage[]>([]);

  const addFile = () => fileInput.current?.click();

  const removeNewImage = (index: number) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  const removeExistingImage = (img: ProjectImage) => {
    setExistingImages((prev) =>
      prev.filter((i) => parseInt(i.id, 10) !== parseInt(img.id, 10)),
    );
    setRemovedImageIds((prev) => [
      ...prev,
      { id: img.id, image_url: img.image_url, order: img.order },
    ]);
  };

  const form = useForm<z.infer<typeof editProjectSchema>>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      id: project.id ?? "",
      title: project.title ?? "",
      desc: project.desc ?? "",
    },
  });

  const confirmDelete = () => {
    openConfirmPopup({
      type: "delete",
      action: async () => {
        const result = await deleteProject(project.id);
        handleResult(result, {
          ok: (message: string) => {
            toast.success(message);
            closeConfirmPopup();
            close();
          },
          error: {
            validation: (details: string) => toast.warning(details),
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
    finalTags.forEach((tag) => formData.append("tags", tag));
    images.forEach((file) => formData.append("images", file));
    removedImageIds.forEach((img) =>
      formData.append(
        "removedImages",
        JSON.stringify({ id: img.id, image_url: img.image_url }),
      ),
    );
    existingImages.forEach((img) =>
      formData.append("existingImages", img.id.toString()),
    );

    const result = await editProject(formData);

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
        className="grid gap-5"
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
                <div key={index} className="flex items-center gap-2">
                  <Image
                    src={img.image_url}
                    alt={`img ${index}`}
                    width={40}
                    height={40}
                    style={{ objectFit: "cover" }}
                    className="rounded-md border"
                  />
                  <div className="w-[350px]">
                    <span className="block truncate break-all">
                      {img.image_url.split("/").pop()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img)}
                  >
                    <TbX className="text-pink-100" size={16} />
                  </button>
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
            multiple
            onChange={(e) => {
              if (!e.target.files) return;
              const newFiles = Array.from(e.target.files);
              setImages((prev) => [...prev, ...newFiles]);
            }}
          />
        </div>

        <div className="flex justify-between mt-5">
          <button
            type="button"
            className="danger-button icon-label"
            onClick={() => confirmDelete()}
          >
            <Trash size={18} />
            Delete
          </button>
          <div className="flex gap-4">
            <button type="button" onClick={close}>
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
