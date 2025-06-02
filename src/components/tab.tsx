"use client";

import { useState } from "react";

interface Tab {
  label: string;
  content: React.ReactNode;
}

interface TabProps {
  tabs: Tab[];
}

export default function Tab({ tabs }: TabProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="w-full">
      <div className="flex border-b gap-1 mb-5">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeIndex === index
                ? "border-b-2 border-blue text-blue"
                : "text-background-200 hover:bg-background-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{tabs[activeIndex].content}</div>
    </div>
  );
}
