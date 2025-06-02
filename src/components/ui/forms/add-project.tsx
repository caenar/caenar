"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { TbFileUpload, TbPlus, TbX } from "react-icons/tb";

export default function AddProjectForm({ close }: { close: () => void }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const fileInput = useRef<HTMLInputElement>(null);

  const addFile = () => {
    fileInput.current?.click();
  };

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
          width={0}
          height={0}
          style={{ width: "40px", height: "40px", objectFit: "cover" }}
          className="rounded-lg border border-background-400"
        />
        <div className="flex justify-between items-center w-full gap-4">
          <h5 className="truncate max-w-[20rem]">{name}</h5>
          <button onClick={onRemove}>
            <TbX className="text-pink-100" size={20} />
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
          placeholder="Title of the project"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="form-input">
        <label>Description</label>
        <textarea
          rows={2}
          placeholder="Keep it short and concise"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        ></textarea>
      </div>
      <div className="form-input">
        <label>Tags (comma-separated)</label>
        <input
          type="text"
          placeholder="e.g. web, design, 3D"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>
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
          <button
            className="w-full secondary-button icon-label !gap-1 text-[14px]"
            type="button"
            onClick={addFile}
          >
            <TbPlus size={16} />
            Add more
          </button>
        ) : (
          <>
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
          </>
        )}
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
          {loading ? "Uploading..." : "Create Project"}
        </button>
      </div>
    </form>
  );
}
