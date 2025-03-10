"use client";

import { JSX, KeyboardEvent, useEffect, useRef, useState } from "react";
import TERMINAL_COMMANDS from "@/hooks/useTerminal";

export default function Terminal() {
  const [history, setHistory] = useState<
    { command: string; output: JSX.Element | string; index: number }[]
  >([]);
  const [keyIndex, setKeyIndex] = useState(0);

  const terminalContainer = useRef<HTMLDivElement>(null);
  const terminalInput = useRef<HTMLInputElement>(null);

  const focusTerminal = () => {
    if (terminalInput.current) terminalInput.current.focus();
  };

  const handleCommand = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();

      const value = event.currentTarget.value;
      const args = value.trim().split(/\s+/); // get the flags only
      const command = args.shift()?.toLowerCase(); // type safety
      if (!command) return; // return if input empty

      const commandFunc = TERMINAL_COMMANDS[command]; // get appropriate function

      if (commandFunc.name === "clear") return setHistory([]);

      setHistory((prev) => {
        const newHistory = [
          ...prev,
          {
            command: value,
            output: commandFunc ? (
              commandFunc(args)
            ) : (
              <p>Command not found: {value}</p>
            ),
            index: prev.length,
          },
        ];
        return newHistory;
      });

      event.currentTarget.value = ""; // reset input
      setKeyIndex(0); // refresh history

      // handle arrow key up
    } else if (event.key === "ArrowUp") {
      if (history.length === 0) return;

      setKeyIndex((prev) => Math.min(prev + 1, history.length - 1));
      event.currentTarget.value =
        history[history.length - 1 - keyIndex].command;

      // handle arrow key down
    } else if (event.key === "ArrowDown") {
      if (history.length === 0) return;

      setKeyIndex((prev) => Math.max(prev - 1, 0));
      event.currentTarget.value =
        history[history.length - 1 - keyIndex].command;
    }
  };

  useEffect(() => {
    if (terminalContainer.current) {
      terminalContainer.current.scrollTop =
        terminalContainer.current.scrollHeight;
    }
  }, [history]);

  return (
    <div
      className="w-full h-[35vh] overflow-scroll card cursor-pointer"
      onClick={focusTerminal}
      ref={terminalContainer}
    >
      {history.map((entry, index) => (
        <div key={index}>
          <div className="terminal-input">
            <p>
              ╭─<span className="text-violet-100">[</span>~
              <span className="text-violet-100">]</span>─
              <span className="text-violet-100">[</span>caenar@fedora
              <span className="text-violet-100">]</span>─
              <span className="text-violet-100">[</span>0
              <span className="text-violet-100">]</span>─
              <span className="text-violet-100">[</span>
              {entry.index}
              <span className="text-violet-200">]</span>
            </p>
            <p>
              ╰─
              <span className="text-violet-600">
                [<span className="text-pink-300">:)</span>]
              </span>{" "}
              % {entry.command}
            </p>
          </div>
          <div className="grid gap-2 ml-4">{entry.output}</div>
        </div>
      ))}

      <div className="terminal-input">
        <p>
          ╭─<span className="text-violet-100">[</span>~
          <span className="text-violet-100">]</span>─
          <span className="text-violet-100">[</span>caenar@fedora
          <span className="text-violet-100">]</span>─
          <span className="text-violet-100">[</span>0
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
              history.length <= 0 ? "Type help to see available commands" : ""
            }
          />
        </p>
      </div>
    </div>
  );
}
