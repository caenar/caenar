"use client";

import { usePopup } from "@/shared/context/popup-context";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";

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

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closePopup();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={backdropRef}
          tabIndex={-1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="z-50 h-full w-full fixed flex justify-center items-center bg-[rgba(0,0,0,0.4)] backdrop-blur-md"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              duration: 0.2,
              ease: [0, 0.71, 0.2, 1.01],
            }}
            className="min-w-[450px] bg-background-100 border border-background-400 p-4 rounded-lg"
          >
            <h2 className="text-2xl font-semibold">{title}</h2>
            <div className="mt-4">{content}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
