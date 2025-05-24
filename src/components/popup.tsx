"use client";

import { usePopup } from "@/context/PopupContext";
import { useEffect, useRef } from "react";

export default function Popup() {
  const { isOpen, title, content, closePopup } = usePopup();
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      backdropRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closePopup();
      }
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, closePopup]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closePopup();
    }
  };

  return (
    <div
      ref={backdropRef}
      tabIndex={-1}
      className="h-full w-full fixed flex justify-center items-center backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-background-100 border border-background-400 p-4 rounded-lg">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <div className="mt-4">{content}</div>
      </div>
    </div>
  );
}
