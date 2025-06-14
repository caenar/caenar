"use client";

import { Project } from "@/lib/types";
import { normalizeTags } from "@/lib/utils/normalize-tags";
import Image from "next/image";
import { useRef, useState } from "react";
import { TbPlus, TbX } from "react-icons/tb";

export default function EditProjectForm({
  project,
  close,
}: {
  project: Project;
  close: () => void;
}) {
  const [title, setTitle] = useState(project.title);
  const [desc, setDesc] = useState(project.desc);
  const [tags, setTags] = useState(normalizeTags(project.tags));
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const addFile = () => fileInput.current?.click();

  const removeFile = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !tags || !images) {
      alert("Fill all fields.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("desc", desc);
    formData.append("tags", tags);

    for (let i = 0; i < images?.length || 0; i++) {
      formData.append("images", images[i]);
    }

    setLoading(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        close();
      } else {
        console.error("Failed to upload project");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
          width={500}
          height={500}
          style={{ width: "30px", height: "30px", objectFit: "cover" }}
          className="rounded-lg border border-background-400"
        />
        <div className="flex justify-between items-center w-full gap-4">
          <h5 className="truncate max-w-[20rem]">{name}</h5>
          <button onClick={onRemove}>
            <TbX className="text-pink-100" size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-1.5"
      encType="multipart/form-data"
    >
      <div className="form-input">
        <label>Name</label>
        <input
          type="text"
          placeholder={project.title}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="form-input">
        <label>Description</label>
        <textarea
          rows={2}
          placeholder={project.desc}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        ></textarea>
      </div>
      <div className="form-input">
        <label>Tags (comma-separated)</label>
        <textarea
          placeholder={normalizeTags(project.tags)}
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        ></textarea>
      </div>
      <div className="form-input">
        <label>Images</label>
        <div className="uploads-container">
          {project.project_image.map((image, index) => (
            <ImageContainer
              key={index}
              name={`Image ${index}`}
              src={image.image_url}
              onRemove={() => removeFile(index)}
            />
          ))}
        </div>
        <div
          className="w-full secondary-button icon-label !gap-1 text-[14px] cursor-pointer"
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
          {loading ? "Uploading..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}
