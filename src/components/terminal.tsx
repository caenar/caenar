"use client";

import { KeyboardEvent, useRef, useState } from "react";

export default function Terminal() {
  const [history, setHistory] = useState<
    { command: string; output: JSX.Element; index: number }[]
  >([]);
  const termInput = useRef<HTMLInputElement>(null);

  function getOutput(command: string) {
    switch (command) {
      case "clear":
        setHistory([]);
      case "whoami":
        return (
          <p>
            My name is Caenar Arteta
            <br />
            I am currently 20 years old
            <br />
            based in Legazpi City, PH
          </p>
        );
      case "whoami --graphicdesign --skills":
        return (
          <p>
            Figma, Webflow, Wix
            <br />
            Photoshop, Premiere Pro, After Effects, Illustrator
            <br />
            Davinci Resolve, Topaz Labs
          </p>
        );
      case "whoami --programming --skills":
        return (
          <p>
            Frontend: HTML/CSS, Javascript/Typescript, Tailwind, Sass, Angular,
            Astro, React, Next.js, Flutter <br />
            Backend: Node.js, Express.js, NestJS, REST API, WebSockets,
            PostgreSQL, MongoDB, Prisma, Mongoose <br />
            Languages: Java, Python, PHP <br />
            Technologies: Git/Github, Docker, Jira <br />
            Deployment: Vercel, Netlify, Render, Neon, Supabase
          </p>
        );
      case "whoami --mantra":
        return <p>Amor fati, accept fate and embrace it.</p>;
      default:
        return <p>Command not found: {command}</p>;
    }
  }

  const focusTerminal = () => {
    if (termInput.current) termInput.current.focus();
  };

  const runCommand = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const command = event.currentTarget.value.trim();
      if (command === "") return;

      setHistory((prevState) => [
        ...prevState,
        {
          command,
          output: getOutput(command),
          index:
            prevState.length > 0
              ? prevState[prevState.length - 1].index + 1
              : 69,
        },
      ]);

      event.currentTarget.value = "";
    }
  };

  return (
    <div className="w-[40vw] card cursor-pointer" onClick={focusTerminal}>
      {history.map((entry, idx) => (
        <div key={idx}>
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
          ref={termInput}
          onKeyDown={runCommand}
          placeholder={
            history.length <= 0 ? "Run help to see available commands" : ""
          }
          autoFocus
        />
      </p>
    </div>
  );
}
