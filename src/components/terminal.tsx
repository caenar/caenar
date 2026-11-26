"use client";

import {
  forwardRef,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  resolveCommand,
  type TerminalCommand,
} from "@/shared/terminal/commands";
import { cn } from "@/lib/utils";
import React from "react";

export type TerminalHandle = {
  typeAndRun: (command: string) => Promise<void>;
  run: (command: string) => void;
  clear: () => void;
  focus: () => void;
  hasUserInteracted: () => boolean;
};

type TerminalProps = {
  autoRunEnabled?: boolean;
  extraCommands?: TerminalCommand[];
  className?: string;
  onUserInteract?: () => void;
};

const Terminal = forwardRef<TerminalHandle, TerminalProps>(function Terminal(
  { autoRunEnabled = true, extraCommands, className, onUserInteract }: TerminalProps = {},
  ref,
) {
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
  const hasAutoRun = useRef(false);
  const userInteractedRef = useRef(false);
  const programmaticRef = useRef(false);
  const extraCommandsRef = useRef(extraCommands);
  extraCommandsRef.current = extraCommands;
  const onUserInteractRef = useRef(onUserInteract);
  onUserInteractRef.current = onUserInteract;

  const focusTerminal = () => {
    if (terminalInput.current) terminalInput.current.focus();
  };

  const syncCaret = (target?: HTMLInputElement | null) => {
    const input = target ?? terminalInput.current;
    if (!input) return;
    setCaretIndex(input.selectionStart ?? input.value.length);
  };

  const executeCommand = (rawValue: string) => {
    const value = rawValue;
    const args = value.trim().split(/\s+/);
    const command = args.shift()?.toLowerCase();
    if (!command) return;

    const extra = extraCommandsRef.current?.find((c) => c.name === command);
    const matched = extra ?? resolveCommand(command);

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
      if (terminalInput.current) terminalInput.current.value = "";
      setCaretIndex(0);
      setKeyIndex(0);
      return;
    }

    const result = matched.run(args, {
      navigate: (href) => router.push(href),
    }) ?? {
      type: "none" as const,
    };

    if (result.type === "clear") {
      setHistory([]);
      if (terminalInput.current) terminalInput.current.value = "";
      setCaretIndex(0);
      setKeyIndex(0);
      return;
    }

    if (result.type === "none") {
      if (terminalInput.current) terminalInput.current.value = "";
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

    if (terminalInput.current) terminalInput.current.value = "";
    setCaretIndex(0);
    setKeyIndex(0);
  };
  const executeCommandRef = useRef(executeCommand);
  executeCommandRef.current = executeCommand;

  const handleCommand = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!programmaticRef.current) {
      userInteractedRef.current = true;
      onUserInteractRef.current?.();
    }
    if (event.key === "Enter") {
      event.preventDefault();
      executeCommand(event.currentTarget.value);

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

  const autoRunEnabledRef = useRef(autoRunEnabled);
  autoRunEnabledRef.current = autoRunEnabled;
  const terminalVisibleRef = useRef(false);

  useEffect(() => {
    const el = terminalContainer.current;
    if (!el) return;

    const tryRun = () => {
      if (!terminalVisibleRef.current || !autoRunEnabledRef.current) return;
      if (hasAutoRun.current) return;
      if (terminalInput.current?.value) return;
      hasAutoRun.current = true;

      const commands = ["whoami"];
      let cmdIndex = 0;

      const runNextCommand = () => {
        if (cmdIndex >= commands.length) return;
        const command = commands[cmdIndex];
        let i = 0;

        const typeNext = () => {
          const input = terminalInput.current;
          if (!input) return;
          if (
            document.activeElement === input &&
            input.value !== command.slice(0, i)
          )
            return;
          i += 1;
          input.value = command.slice(0, i);
          setCaretIndex(i);
          if (i < command.length) {
            setTimeout(typeNext, 70 + Math.random() * 50);
          } else {
            setTimeout(() => {
              executeCommandRef.current(command);
              cmdIndex += 1;
              if (cmdIndex < commands.length) {
                setTimeout(runNextCommand, 700);
              }
            }, 300);
          }
        };

        typeNext();
      };

      setTimeout(runNextCommand, 450);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        terminalVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) tryRun();
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    tryRun();
    return () => observer.disconnect();
  }, [autoRunEnabled]);

  const typeAndRun = useCallback((command: string) => {
    return new Promise<void>((resolve) => {
      if (userInteractedRef.current) {
        resolve();
        return;
      }
      let i = 0;
      programmaticRef.current = true;
      const typeNext = () => {
        if (userInteractedRef.current) {
          programmaticRef.current = false;
          resolve();
          return;
        }
        const input = terminalInput.current;
        if (!input) {
          programmaticRef.current = false;
          resolve();
          return;
        }
        i += 1;
        input.value = command.slice(0, i);
        setCaretIndex(i);
        if (i < command.length) {
          setTimeout(typeNext, 55 + Math.random() * 40);
        } else {
          setTimeout(() => {
            executeCommandRef.current(command);
            programmaticRef.current = false;
            resolve();
          }, 220);
        }
      };
      setTimeout(typeNext, 150);
    });
  }, []);

  useImperativeHandle(ref, () => ({
    typeAndRun,
    run: (command: string) => executeCommandRef.current(command),
    clear: () => setHistory([]),
    focus: focusTerminal,
    hasUserInteracted: () => userInteractedRef.current,
  }), [typeAndRun]);

  return (
    <div
      className={cn(
        "terminal-scroll font-mono text-sm bg-background-100/60 backdrop-blur-3xl w-[95vw] sm:w-[70vw] md:w-[55vw] max-w-full h-[45vh] overflow-y-auto overflow-x-hidden card p-4",
        isInputFocused ? "overscroll-y-contain" : "overscroll-auto",
        className,
      )}
      ref={terminalContainer}
    >
      <pre className="mb-6 whitespace-pre leading-[1.35] overflow-x-hidden text-white/80">
        {`                         `}
        <span className="text-violet-200 font-semibold">caenar@fsociety</span>
        {`
`}
        <span className="text-cyan-300">{`      /\\           `}</span>
        <span className="text-white/25">{`─────────────`}</span>
        <span className="text-violet-300">●</span>
        <span className="text-white/25">{`──────────────`}</span>
        {`
`}
        <span className="text-cyan-300">{`     /  \\         `}</span>
        <span className="text-cyan-300">OS</span>
        {`  `}
        <span className="text-white/45">-&gt;</span>
        {` `}
        <span className="text-white/80">Linux 7.3.4-arch1-2</span>
        {`
`}
        <span className="text-cyan-300">{`    /    \\        `}</span>
        <span className="text-cyan-300">WM</span>
        {`  `}
        <span className="text-white/45">-&gt;</span>
        {` `}
        <span className="text-white/80">Hyprland 0.57.2 (Wayland)</span>
        {`
`}
        <span className="text-cyan-300">{`   /      \\       `}</span>
        <span className="text-cyan-300">SH</span>
        {`  `}
        <span className="text-white/45">-&gt;</span>
        {` `}
        <span className="text-white/80">zsh 5.9.2</span>
        {`
`}
        <span className="text-cyan-300">{`  /   ,,   \\      `}</span>
        <span className="text-cyan-300">TM</span>
        {`  `}
        <span className="text-white/45">-&gt;</span>
        {` `}
        <span className="text-white/80">alacritty 0.17.0</span>
        {`
`}
        <span className="text-cyan-300">{` /   |  |   \\     `}</span>
        <span className="text-cyan-300">ED</span>
        {`  `}
        <span className="text-white/45">-&gt;</span>
        {` `}
        <span className="text-white/80">Neovim</span>
        {`
`}
        <span className="text-cyan-300">{`/_-''    ''-_\\    `}</span>
        <span className="text-white/25">{`──────────────`}</span>
        <span className="text-violet-300">●</span>
        <span className="text-white/25">{`──────────────`}</span>
        {`
`}
        {`                     `}
        <span className="text-violet-300">●</span>
        {`  `}
        <span className="text-cyan-300">●</span>
        {`  `}
        <span className="text-violet-300">●</span>
        {`  `}
        <span className="text-cyan-300">●</span>
        {`  `}
        <span className="text-violet-300">●</span>
        {`  `}
        <span className="text-cyan-300">●</span>
        {`  `}
        <span className="text-violet-300">●</span>
        {`  `}
        <span className="text-cyan-300">●</span>
        {`
`}
      </pre>
      {history.map((entry, index) => (
        <React.Fragment key={index}>
          <div className="mb-3 text-sm">
            <p className="whitespace-nowrap">
              ╭─<span className="text-violet-100">[</span>~
              <span className="text-violet-100">]</span>
              <span className="hidden sm:inline">
                ─<span className="text-violet-100">[</span>caenar@fsociety
                <span className="text-violet-100">]</span>
              </span>
              ─<span className="text-violet-100">[</span>
              {entry.index}
              <span className="text-violet-200">]</span>
            </p>
            <p>
              ╰─
              <span className="text-violet-600">
                [
                <motion.span
                  className={`inline-block ${entry.isError ? "text-pink-500" : "text-violet-400"}`}
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
            className="flex flex-col gap-2 ml-2 mb-6 text-sm [&_p]:leading-[1.45rem]"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {entry.output}
          </motion.div>
        </React.Fragment>
      ))}

      <div className="text-sm cursor-text" onClick={focusTerminal}>
        <p className="whitespace-nowrap">
          ╭─<span className="text-violet-100">[</span>~
          <span className="text-violet-100">]</span>
          <span className="hidden sm:inline">
            ─<span className="text-violet-100">[</span>caenar@fsociety
            <span className="text-violet-100">]</span>
          </span>
          ─<span className="text-violet-100">[</span>
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
          <span className="text-violet-400">:)</span>
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
});

export default Terminal;
