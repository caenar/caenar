"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { COMMANDS } from "@/constants/TerminalCommands";

export default function Terminal() {
  const [history, setHistory] = useState<
    { command: string; output: string; index: number }[]
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
      console.log(args);
      // get the command
      const command = args.shift()?.toLowerCase();

      if (command === "" || !command) return;

      const commandFunc = COMMANDS[command];

      if (commandFunc) {
        if (command === "clear") {
          commandFunc(setHistory);
        } else {
          setHistory((prev) => [
            ...prev,
            {
              command: value.trim(),
              output: commandFunc(args),
              index: history.length + 1,
            },
          ]);
        }
      } else {
        setHistory((prev) => [
          ...prev,
          {
            command,
            output: `Command not found: ${command}`,
            index: history.length + 1,
          },
        ]);
      }

      event.currentTarget.value = "";
    }
  };

  useEffect(() => {
    console.log(history);
  });

  return (
    <div className="w-[50vw] card cursor-pointer" onClick={focusTerminal}>
      {history.map((entry, index) => (
        <div key={index}>
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
          <div className="ml-4">{entry.output}</div>
        </div>
      ))}

      <p>
        ╭─<span className="text-violet-100">[</span>~
        <span className="text-violet-100">]</span>─
        <span className="text-violet-100">[</span>caenar@fedora
        <span className="text-violet-100">]</span>─
        <span className="text-violet-100">[</span>0
        <span className="text-violet-100">]</span>─
        <span className="text-violet-100">[</span>
        {history.length > 0 ? history[history.length - 1].index + 1 : 69}
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
  );
}
