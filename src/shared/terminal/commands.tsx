import { cn } from "@/lib/utils";
import React, { type ReactNode } from "react";

export type TerminalContext = {
  navigate: (href: string) => void;
};

export type CommandResult =
  | { type: "output"; node: ReactNode }
  | { type: "clear" }
  | { type: "navigate"; href: string; node?: ReactNode }
  | { type: "none" };

export type CommandFlag = {
  alias: string;
  desc: string;
};

export type TerminalCommand = {
  name: string;
  description: string;
  flags: CommandFlag[];
  hidden?: boolean;
  run: (args: string[], ctx: TerminalContext) => CommandResult | void;
};

function output(node: ReactNode): CommandResult {
  return { type: "output", node };
}

const isPureNumber = (name: string) => /^\d+$/.test(name);

const whoami: TerminalCommand = {
  name: "whoami",
  description: "A short description about me",
  flags: [
    { alias: "", desc: "A short description about me" },
    { alias: "-ts", desc: "Relevant technical skills" },
    { alias: "-cs", desc: "Relevant creative skills" },
    { alias: "-m", desc: "Personal mantra" },
  ],
  run(args) {
    if (args.includes("-ts")) {
      return output(
        <p>
          <span className="text-pink-200">Frontend</span>: Next.js, Expo,
          Flutter, TypeScript, Tailwind CSS <br />
          <span className="text-pink-200">Backend & Data</span>: Node.js, PHP,
          PostgreSQL, MongoDB, Prisma, REST APIs, WebSockets
          <br />
          <span className="text-pink-200">Engineering</span>: Domain-driven
          design, multi-tenant systems, authorization, abstraction
          <br />
          <span className="text-pink-200">Tools & Infrastracture</span>: Git,
          Docker, Linux, Neovim (btw), Supabase, Neon, Vercel
          <br />
          <span className="text-pink-200">AI & Development</span>: MCP,
          AI-assisted development, debugging, and code review, context
          engineering, coding agents
        </p>,
      );
    }
    if (args.includes("-cs")) {
      return output(
        <p>
          <span className="text-pink-200">Design</span>: Figma, Canva,
          Photoshop, Illustrator, Wix, Weebly
          <br />
          <span className="text-pink-200">Motion & Video</span>: After Effects,
          Premiere Pro, DaVinci Resolve
          <br />
          <span className="text-pink-200">3D & Rendering</span>: Blender,
          Cinema4D
          <br />
          <span className="text-pink-200">Tools</span>: Lightroom, Topaz Labs,
          iZotope RX <br />
        </p>,
      );
    }
    if (args.includes("-m")) {
      return output(
        <p>
          The phrase “amor fati” is Latin for “love of one’s fate.” It describes
          the attitude whereby one not only accepts everything that happens in
          life, including adversity and loss, but actually loves it.
        </p>,
      );
    }
    if (args.length === 0) {
      return output(
        <p>
          Hello! My name is Stephanie Arteta, though I go by the alias “caenar”
          which is pronounced as “kay-nar”. I&apos;m currently 22 years old and{" "}
          <span className="italic">still </span>studying at Divine Word College
          of Legazpi where I'm taking the course BSIT; majoring in Web
          Development.
        </p>,
      );
    }
    return output(<p>Invalid flag: {args.join(" ")}</p>);
  },
};

const cd: TerminalCommand = {
  name: "cd",
  description: "Navigate to a page",
  flags: [
    { alias: "", desc: "Navigate to a page (e.g. cd work)" },
    { alias: "work", desc: "See projects I've built" },
    { alias: "about", desc: "If you want to know more about me" },
    { alias: "contact", desc: "Want to share something?" },
  ],
  run(args, ctx) {
    const routes: Record<string, string> = {
      work: "/work",
      about: "/about",
      contact: "/contact",
    };
    const target = args[0]?.toLowerCase() ?? "~";

    if (target === "~") {
      const availableRoutes = Object.keys(routes).join(", ");
      return output(<p>cd: available routes: {availableRoutes}</p>);
    }

    const href = routes[target];
    if (!href) {
      return output(
        <p className="text-pink-500">cd: no such route: {target}</p>,
      );
    }
    ctx.navigate(href);
    return {
      type: "navigate",
      href,
      node: <p>Hang on, transporting you to {href}…</p>,
    };
  },
};

const nigga: TerminalCommand = {
  name: "nigga",
  description: "",
  flags: [{ alias: "", desc: "" }],
  hidden: true,
  run() {
    return output(<p>Watch your profanity</p>);
  },
};

const numberCommands: Record<
  string,
  (args: string[], ctx: TerminalContext) => CommandResult | void
> = {
  "67": () => output(<p>six seven 😭</p>),
  "69": () => output(<p>eyo... nasty...</p>),
  "360": () => output(<p>BHOP + 360 + no scope = MLG SHOT</p>),
  "420": () => output(<p>the original 67</p>),
  "1337": () => output(<p>only legends know</p>),
};

const clear: TerminalCommand = {
  name: "clear",
  description: "Clear terminal history",
  flags: [{ alias: "", desc: "Clear terminal history" }],
  run() {
    return { type: "clear" };
  },
};

const help: TerminalCommand = {
  name: "help",
  description: "Display this output",
  flags: [{ alias: "", desc: "Display this output" }],
  run() {
    return output(
      <>
        {commandList
          .filter((cmd) => !cmd.hidden)
          .map((cmd) => (
            <div key={cmd.name} className="flex flex-col">
              <p className="font-semibold text-violet-100">{cmd.name}</p>
              <div className="flex flex-col ml-4">
                {cmd.flags.length > 0 ? (
                  cmd.flags.map((flag, index) => (
                    <div
                      key={`${cmd.name}-${index}`}
                      className="flex gap-4 items-start"
                    >
                      {flag.alias ? (
                        <>
                          <span className="opacity-50 w-[80px] shrink-0 font-mono">
                            {flag.alias}
                          </span>
                          <p className="break-words">{flag.desc}</p>
                        </>
                      ) : (
                        <p
                          className={cn(
                            "break-words opacity-90",
                            cmd.flags.length > 1 && "mb-1",
                          )}
                        >
                          {flag.desc}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="opacity-50 italic">No description available</p>
                )}
              </div>
            </div>
          ))}
      </>,
    );
  },
};

export const commandList: TerminalCommand[] = [whoami, cd, clear, help, nigga];

const commandMap = new Map(commandList.map((cmd) => [cmd.name, cmd]));

export function getCommand(name: string): TerminalCommand | undefined {
  return commandMap.get(name);
}

export function resolveCommand(name: string): TerminalCommand | undefined {
  const command = commandMap.get(name);
  if (command) return command;
  if (!isPureNumber(name)) return undefined;

  const run = numberCommands[name];
  if (!run) return undefined;

  return {
    name,
    description: "Numeric command",
    flags: [],
    hidden: true,
    run: (args, ctx) => run(args, ctx) ?? { type: "none" },
  };
}
