"use client";

import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { resolveCommand } from "@/shared/terminal/commands";
import React from "react";

export default function Terminal() {
  const [history, setHistory] = useState<
    {
      command: string;
      output: ReactNode;
      isError: boolean;
      index: number;
    }[]
  >([]);
  const [, setKeyIndex] = useState(0);
  const [caretIndex, setCaretIndex] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const terminalContainer = useRef<HTMLDivElement>(null);
  const terminalInput = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const focusTerminal = () => {
    if (terminalInput.current) terminalInput.current.focus();
  };

  const syncCaret = (target?: HTMLInputElement | null) => {
    const input = target ?? terminalInput.current;
    if (!input) return;
    setCaretIndex(input.selectionStart ?? input.value.length);
  };

  const handleCommand = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();

      const value = event.currentTarget.value;
      const args = value.trim().split(/\s+/);
      const command = args.shift()?.toLowerCase();
      if (!command) return;

      const matched = resolveCommand(command);

      if (!matched) {
        setHistory((prev) => [
          ...prev,
          {
            command: value,
            output: <p className="text-pink-500">Command not found: {value}</p>,
            isError: true,
            index: prev.length,
          },
        ]);
        event.currentTarget.value = "";
        setCaretIndex(0);
        setKeyIndex(0);
        return;
      }

      const result = matched.run(args, { navigate: (href) => router.push(href) }) ?? {
        type: "none" as const,
      };

      if (result.type === "clear") {
        setHistory([]);
        event.currentTarget.value = "";
        setCaretIndex(0);
        setKeyIndex(0);
        return;
      }

      if (result.type === "none") {
        event.currentTarget.value = "";
        setCaretIndex(0);
        setKeyIndex(0);
        return;
      }

      setHistory((prev) => [
        ...prev,
        {
          command: value,
          output: result.node ?? null,
          isError: false,
          index: prev.length,
        },
      ]);

      event.currentTarget.value = "";
      setCaretIndex(0);
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
          const end = targetCommand.length;
          event.currentTarget.setSelectionRange(end, end);
          setCaretIndex(end);
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
          if (event.currentTarget) {
            event.currentTarget.value = "";
            event.currentTarget.setSelectionRange(0, 0);
            setCaretIndex(0);
          }
        } else {
          const targetCommand = history[history.length - nextIndex]?.command;
          if (targetCommand !== undefined && event.currentTarget) {
            event.currentTarget.value = targetCommand;
            const end = targetCommand.length;
            event.currentTarget.setSelectionRange(end, end);
            setCaretIndex(end);
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

    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => element.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div
      className={`terminal-scroll font-mono text-sm [&_p]:text-sm [&_input]:text-sm bg-background-100/60 backdrop-blur-3xl w-[55vw] h-[40vh] overflow-y-auto overflow-x-hidden ${
        isInputFocused ? "overscroll-y-contain" : "overscroll-auto"
      } card p-4 cursor-pointer`}
      onClick={focusTerminal}
      ref={terminalContainer}
    >
      {history.map((entry, index) => (
        <React.Fragment key={index}>
          <div className="mb-3">
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
                <motion.span
                  className={`inline-block ${entry.isError ? "text-pink-500" : "text-green-500"}`}
                  initial={{ opacity: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  :{entry.isError ? "(" : ")"}
                </motion.span>
                ]
              </span>{" "}
              % {entry.command}
            </p>
          </div>
          <motion.div
            className="flex flex-col gap-2 ml-4 mb-3"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {entry.output}
          </motion.div>
        </React.Fragment>
      ))}

      <div>
        <p>
          ╭─<span className="text-violet-100">[</span>~
          <span className="text-violet-100">]</span>─
          <span className="text-violet-100">[</span>caenar@fsociety
          <span className="text-violet-100">]</span>─
          <span className="text-violet-100">[</span>
          <span className="inline-flex overflow-hidden align-bottom">
            <motion.span
              key={history.length}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {history.length}
            </motion.span>
          </span>
          <span className="text-violet-200">]</span>
        </p>
        <p>
          ╰─
          <span className="text-violet-600">[</span>
          <span>:)</span>
          <span className="text-violet-600">]</span> %{" "}
          <span className="relative inline-block w-[90%] align-baseline">
            {isInputFocused && (
              <span
                aria-hidden
                className="terminal-caret pointer-events-none absolute left-0 top-[0.05em] h-[1.2em] w-[1ch] bg-violet-200 z-[1]"
                style={{ transform: `translateX(${caretIndex}ch)` }}
              />
            )}
            <input
              className="w-full bg-transparent border-transparent outline-none text-white caret-transparent placeholder:opacity-50"
              type="text"
              ref={terminalInput}
              onKeyDown={handleCommand}
              onKeyUp={(e) => syncCaret(e.currentTarget)}
              onInput={(e) => syncCaret(e.currentTarget)}
              onSelect={(e) => syncCaret(e.currentTarget)}
              onClick={(e) => syncCaret(e.currentTarget)}
              onFocus={(e) => {
                setIsInputFocused(true);
                syncCaret(e.currentTarget);
              }}
              onBlur={() => setIsInputFocused(false)}
              placeholder={`Type "help" to see available commands`}
            />
          </span>
        </p>
      </div>
    </div>
  );
}
