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
            command: value.trim(),
            output: <p>Command not found: {value.trim()}</p>,
            index: history.length - 1 + 1,
          },
        ]);
      }

      event.currentTarget.value = ""; // reset input
      setKeyIndex(0); // refresh history
    } else if (event.key === "ArrowUp") {
      setKeyIndex((prev) => (prev < history.length - 1 ? prev + 1 : prev));
      event.currentTarget.value =
        history[history.length - 1 - keyIndex].command;
    } else if (event.key === "ArrowDown") {
      setKeyIndex((prev) => (prev > 1 ? prev - 1 : prev));
      event.currentTarget.value = history[history.length - keyIndex].command;
    }
  };

  useEffect(() => {
    console.log(keyIndex);
  }, [keyIndex]);

  useEffect(() => {
    if (terminalContainer.current) {
      terminalContainer.current.scrollTop =
        terminalContainer.current.scrollHeight;
    }
  }, [history]);

  return (
    <div
      className="w-[50vw] max-h-[50vh] overflow-scroll card cursor-pointer"
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
