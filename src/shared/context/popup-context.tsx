"use client";

import React, { createContext, ReactNode, useContext, useState } from "react";

type PopupContextType = {
  isOpen: boolean;
  title: string;
  content: ReactNode;
  openPopup: (title: string, content: ReactNode) => void;
  closePopup: () => void;
};

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export function PopupProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<ReactNode>(null);

  const []

  const openPopup = (title: string, content: ReactNode) => {
    setTitle(title);
    setContent(content);
    setIsOpen(true);
  };

  const closePopup = () => {
    setIsOpen(false);
  };

  return (
    <PopupContext.Provider
      value={{ isOpen, title, content, openPopup, closePopup }}
    >
      {children}
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error("usePopup() must be used within a PopupProvider");
  }
  return context;
}
