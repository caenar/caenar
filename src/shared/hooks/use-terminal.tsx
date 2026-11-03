import React, { JSX } from "react";

function whoami(args?: string[]): JSX.Element {
  if (args?.includes("-ps")) {
    return (
      <p>
        <span className="text-pink-200">Frontend</span>: HTML/CSS,
        JavaScript/TypeScript, Tailwind, Sass, Angular, Astro, React, Next.js,
        Flutter
        <br />
        <span className="text-pink-200">Backend</span>: Node.js, Express.js,
        NestJS, REST API, WebSockets, PostgreSQL, MongoDB, Prisma, Mongoose
        <br />
        <span className="text-pink-200">Technologies</span>: Git/GitHub, Docker,
        Jira
        <br />
        <span className="text-pink-200">Deployment</span>: Vercel, Netlify,
        Render, Neon, Supabase
        <br />
      </p>
    );
  } else if (args?.includes("-ds")) {
    return (
      <p>
        Figma, Webflow, Wix
        <br />
        Photoshop, Premiere Pro, After Effects, Illustrator
        <br />
        Davinci Resolve, Topaz Labs
        <br />
      </p>
    );
  } else if (args?.includes("-v")) {
    return <p>At first I was a graphic designer</p>;
  } else if (args?.includes("-m")) {
    return (
      <p>
        The phrase “amor fati” is Latin for “love of one’s fate.” It describes
        the attitude whereby one not only accepts everything that happens in
        life, including adversity and loss, but actually loves it.
      </p>
    );
  } else if (args?.length === 0) {
    return (
      <p>
        My name is Caenar Arteta
        <br />
        I'm currently 20 years old
        <br />
        based in Legazpi City, PH
      </p>
    );
  } else {
    return <p>Invalid flag: {args}</p>;
  }
}

function clear() {
  return console.log("uwu");
}

function help(): JSX.Element {
  type Command = {
    name: string;
    flags: { alias: string; desc: string }[];
  };

  const commands: Command[] = [
    {
      name: "whoami",
      flags: [
        { alias: "", desc: "A short description about me" },
        { alias: "-v", desc: "The verbose version" },
        { alias: "-ps", desc: "Programming skills" },
        { alias: "-ds", desc: "Design skills" },
        { alias: "-m", desc: "Mantra in life" },
      ],
    },
    {
      name: "clear",
      flags: [{ alias: "", desc: "Clear terminal history" }],
    },
    {
      name: "help",
      flags: [{ alias: "", desc: "Display this output" }],
    },
  ];

  return (
    <>
      {commands.map((cmd, index) => (
        <div key={index} className="flex flex-col">
          {/* 1. Command Name */}
          <p className="font-semibold text-violet-300">{cmd.name}</p>

          {/* 2. Command description / Flags container */}
          <div className="flex flex-col ml-4">
            {cmd.flags.length > 0 ? (
              cmd.flags.map((flag, flagIndex) => (
                <div key={flagIndex} className="flex gap-4 items-start">
                  {flag.alias ? (
                    <>
                      {/* Fixed width for the flag alias so it never stretches to 50% */}
                      <span className="opacity-50 w-[30px] shrink-0 font-mono">
                        {flag.alias}
                      </span>
                      <p className="break-words">{flag.desc}</p>
                    </>
                  ) : (
                    <p className="break-words opacity-90">{flag.desc}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="opacity-50 italic">No description available</p>
            )}
          </div>
        </div>
      ))}
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TERMINAL_COMMANDS: any = {
  whoami,
  clear,
  help,
};

export default TERMINAL_COMMANDS;
