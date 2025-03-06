"use client";

import { JSX, KeyboardEvent, useRef, useState } from "react";
import TERMINAL_COMMANDS from "@/hooks/useTerminal";

export default function Terminal() {
  const [history, setHistory] = useState<
    { command: string; output: JSX.Element | string | any; index: number }[]
  >([]);
  const terminalContainer = useRef<HTMLInputElement>(null);

  const focusTerminal = () => {
    if (terminalContainer.current) terminalContainer.current.focus();
  };

  const handleCommand = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();

      const value = event.currentTarget.value;

      // get the flags
      const args = value.trim().split(/\s+/);
      // get the command
      const command = args.shift()?.toLowerCase();

      if (!command) return;

      const commandFunc = TERMINAL_COMMANDS[command];

      if (commandFunc) {
        if (command === "clear") {
          commandFunc(setHistory);
        } else {
          setHistory((prev) => [
            ...prev,
            {
              command: value.trim(),
              output: commandFunc(args),
              index: history.length - 1 + 1,
            },
          ]);
        }
      } else {
        setHistory((prev) => [
          ...prev,
          {
            command,
            output: `Command not found: ${command}`,
            index: history.length - 1 + 1,
          },
        ]);
      }

      // reset input
      event.currentTarget.value = "";
    }
  };

  return (
    <div
      className="w-[50vw] max-h-[50vh] overflow-scroll card cursor-pointer"
      onClick={focusTerminal}
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
                [<span className="text-violet-200">:)</span>]
              </span>{" "}
              % {entry.command}
            </p>
          </div>
          <div className="ml-4">{entry.output}</div>
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
            ref={terminalContainer}
            onKeyDown={handleCommand}
            placeholder={
              history.length <= 0 ? "Run help to see available commands" : ""
            }
            autoFocus
          />
        </p>
      </div>
    </div>
  );
}
