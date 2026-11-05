"use client";

import { JSX, KeyboardEvent, useEffect, useRef, useState } from "react";
import TERMINAL_COMMANDS from "@/shared/hooks/use-terminal";
import React from "react";

export default function Terminal() {
  const [history, setHistory] = useState<
    {
      command: string;
      output: JSX.Element | string;
      isError: boolean;
      index: number;
    }[]
  >([]);
  const [, setKeyIndex] = useState(0);

  const terminalContainer = useRef<HTMLDivElement>(null);
  const terminalInput = useRef<HTMLInputElement>(null);

  const focusTerminal = () => {
    if (terminalInput.current) terminalInput.current.focus();
  };

  const handleCommand = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();

      const value = event.currentTarget.value;
      const args = value.trim().split(/\s+/);
      const command = args.shift()?.toLowerCase();
      if (!command) return;

      const commandFunc = TERMINAL_COMMANDS[command];

      if (commandFunc?.name === "clear") {
        setHistory([]);
        event.currentTarget.value = "";
        return;
      }

      setHistory((prev) => [
        ...prev,
        {
          command: value,
          output: commandFunc ? (
            commandFunc(args)
          ) : (
            <p>Command not found: {value}</p>
          ),
          isError: !commandFunc,
          index: prev.length,
        },
      ]);

      event.currentTarget.value = "";
      setKeyIndex(0);

      // Handle Arrow Up (Older history)
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (history.length === 0) return;

      setKeyIndex((prev) => {
        const nextIndex = Math.min(prev + 1, history.length);
        const targetCommand = history[history.length - nextIndex]?.command;
        if (targetCommand !== undefined && event.currentTarget) {
          event.currentTarget.value = targetCommand;
        }
        return nextIndex;
      });

      // Handle Arrow Down (Newer history)
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (history.length === 0) return;

      setKeyIndex((prev) => {
        const nextIndex = Math.max(prev - 1, 0);
        if (nextIndex === 0) {
          if (event.currentTarget) event.currentTarget.value = "";
        } else {
          const targetCommand = history[history.length - nextIndex]?.command;
          if (targetCommand !== undefined && event.currentTarget) {
            event.currentTarget.value = targetCommand;
          }
        }
        return nextIndex;
      });
    }
  };

  // Auto-scroll to bottom on new history entry
  useEffect(() => {
    if (terminalContainer.current) {
      terminalContainer.current.scrollTop =
        terminalContainer.current.scrollHeight;
    }
  }, [history]);

  // Prevent scroll chaining
  useEffect(() => {
    const element = terminalContainer.current;
    if (!element) return;

    const handleWheel = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = element;

      // If the content isn't tall enough to scroll yet, do nothing and let the page scroll normally
      if (scrollHeight <= clientHeight) return;

      const isAtTop = scrollTop === 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight;

      if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
        e.preventDefault();
      }
    };

    return () => element.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div
      className="terminal-scroll bg-background-100/60 backdrop-blur-3xl w-[55vw] h-[40vh] overflow-y-auto overflow-x-hidden overscroll-y-contain card p-4 cursor-pointer"
      onClick={focusTerminal}
      ref={terminalContainer}
    >
      {history.map((entry, index) => (
        <React.Fragment key={index}>
          <div className="terminal-input mb-3">
            <p>
              ╭─<span className="text-violet-100">[</span>~
              <span className="text-violet-100">]</span>─
              <span className="text-violet-100">[</span>caenar@fsociety
              <span className="text-violet-100">]</span>─
              <span className="text-violet-100">[</span>
              {entry.index}
              <span className="text-violet-200">]</span>
            </p>
            <p>
              ╰─
              <span className="text-violet-600">
                [
                <span className={entry.isError ? "text-pink-500" : "text-green-500"}>
                  :{entry.isError ? "(" : ")"}
                </span>
                ]
              </span>{" "}
              % {entry.command}
            </p>
          </div>
          <div className="flex flex-col gap-2 ml-4 mb-3">{entry.output}</div>
        </React.Fragment>
      ))}

      <div className="terminal-input">
        <p>
          ╭─<span className="text-violet-100">[</span>~
          <span className="text-violet-100">]</span>─
          <span className="text-violet-100">[</span>caenar@fsociety
          <span className="text-violet-100">]</span>─
          <span className="text-violet-100">[</span>
          {history.length}
          <span className="text-violet-200">]</span>
        </p>
        <p>
          ╰─
          <span className="text-violet-600">[</span>
          <span>:)</span>
          <span className="text-violet-600">]</span> %{" "}
          <input
            className="bg-transparent border-transparent outline-none text-white w-[90%]"
            type="text"
            ref={terminalInput}
            onKeyDown={handleCommand}
            placeholder={
              history.length <= 0 ? `Type "help" to see available commands` : ""
            }
          />
        </p>
      </div>
    </div>
  );
}
