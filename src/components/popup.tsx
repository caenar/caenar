"use client";

import { usePopup } from "@/context/PopupContext";

export default function Popup() {
  const { isOpen, title, content, closePopup } = usePopup();

  if (!isOpen) return null;

  return (
    <div className="bg-red h-full w-full">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="mt-4">{content}</div>
        <button
          onClick={closePopup}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}
