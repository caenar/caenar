"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

import Image from "next/image";
import { TbFileUpload, TbPlus, TbX } from "react-icons/tb";

import { addProjectSchema } from "@/lib/schemas/project.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleResult } from "@/lib/utils/handle-result";
import { toast } from "sonner";
import { addProject } from "@/app/projects/action";
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
import { Loader2 } from "lucide-react";

export default function AddProjectForm({ close }: { close: () => void }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<File[]>([]);
  const [tagInput, setTagInput] = useState("");

  const addFile = () => {
    fileInput.current?.click();
  };

  const removeFile = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const ImageContainer = ({
    name,
    src,
    onRemove,
  }: {
    name: string;
    src: string;
    onRemove: () => void;
  }) => {
    return (
      <div className="flex gap-2 w-full items-center">
        <Image
          src={src}
          alt="Picture"
          width={0}
          height={0}
          style={{ width: "40px", height: "40px", objectFit: "cover" }}
          className="rounded-lg border border-background-400"
        />
        <div className="flex justify-between items-center w-full gap-4">
          <h5 className="truncate max-w-[20rem]">{name}</h5>
          <button type="button" onClick={onRemove}>
            <TbX className="text-pink-100" size={20} />
          </button>
        </div>
      </div>
    );
  };

  const form = useForm<z.infer<typeof addProjectSchema>>({
    resolver: zodResolver(addProjectSchema),
    defaultValues: { title: "", desc: "" },
  });

  async function onSubmit(values: z.infer<typeof addProjectSchema>) {
    const finalTags = tagInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("desc", values.desc);
    finalTags.forEach((tag) => formData.append("tags", tag));
    images.forEach((file) => formData.append("images", file));

    const result = await addProject(formData);

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
                <Textarea placeholder="Keep it short and concise" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Tags (separated by comma)</FormLabel>
          <FormControl>
            <Input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g. react, ui, web"
            />
          </FormControl>
        </FormItem>

        <div className="form-input">
          <label>Images</label>
          {images.length !== 0 && (
            <div className="uploads-container">
              {images.map((image, index) => (
                <ImageContainer
                  key={index}
                  name={image.name}
                  src={URL.createObjectURL(image)}
                  onRemove={() => removeFile(index)}
                />
              ))}
            </div>
          )}
          {images.length !== 0 ? (
            <div
              className="w-full secondary-button icon-label !gap-1 text-[14px]"
              onClick={addFile}
            >
              <TbPlus size={16} />
              Add more
            </div>
          ) : (
            <div className="image-upload" onClick={addFile}>
              <div className="border border-background-400 rounded-full p-3">
                <TbFileUpload size={20} />
              </div>
              <span className="!text-center">
                Drag and drop images
                <br />
                or click this container
              </span>
            </div>
          )}
          <input
            ref={fileInput}
            type="file"
            hidden
            multiple
            onChange={(e) => {
              if (!e.target.files) return;
              const newFiles = Array.from(e.target.files);
              setImages((prev) => {
                const all = [...prev, ...newFiles];
                const unique = all.filter(
                  (f, i, arr) =>
                    arr.findIndex(
                      (x) => x.name === f.name && x.size === f.size,
                    ) === i,
                );
                return unique;
              });
            }}
          />
        </div>

        <div className="flex justify-end gap-4 mt-5">
          <button type="button" onClick={close}>
            Cancel
          </button>
          <button
            type="submit"
            className="primary-button"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <p className="icon-label">
                <Loader2 className="animate-spin" size={20} />
                Please wait
              </p>
            ) : (
              "Create Project"
            )}
          </button>
        </div>
      </form>
    </Form>
  );
}
