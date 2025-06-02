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
        { alias: "", desc: "Display a short description about myself" },
        { alias: "-v", desc: "Display a verbose description of myself" },
        { alias: "-ps", desc: "Display programming skills" },
        { alias: "-ds", desc: "Display design skills" },
        { alias: "-m", desc: "Display my mantra in life" },
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
        <div key={index} className="grid grid-cols-[15%_85%]">
          <div>
            <p>{cmd.name}</p>
          </div>
          <div className="grid grid-cols-[5%_95%]">
            {cmd.flags.length > 0
              ? cmd.flags.map((flag, flagIndex) => (
                <React.Fragment key={flagIndex}>
                  <p className="opacity-50">{flag.alias}</p>
                  <p>{flag.desc}</p>
                </React.Fragment>
              ))
              : null}
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
