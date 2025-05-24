"use client";

import { useRef, useState } from "react";
import { TbFileUpload } from "react-icons/tb";

export default function AddProject({ close }: { close: () => void }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  const fileInput = useRef<HTMLInputElement>(null);

  const addFile = () => {
    fileInput.current?.click();
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
        <input
          type="text"
          placeholder="Keep it short and concise"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
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
        <input
          ref={fileInput}
          type="file"
          hidden
          multiple
          onChange={(e) => setImages(e.target.files)}
        />
      </div>
      <div className="flex justify-end gap-4">
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
