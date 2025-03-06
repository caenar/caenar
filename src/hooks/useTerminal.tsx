import React, { JSX } from "react";

function whoami(args: string): JSX.Element {
  if (args.includes("-ps")) {
    return (
      <p>
        <span>Frontend</span>: HTML/CSS, Javascript/Typescript, Tailwind, Sass,
        Angular, Astro, React, Next.js, Flutter
        <br />
        <span>Backend</span>: Node.js, Express.js, NestJS, REST API, WebSockets,
        PostgreSQL, MongoDB, Prisma, Mongoose
        <br />
        <span>Technologies</span>: Git/Github, Docker, Jira
        <br />
        Deployment: Vercel, Netlify, Render, Neon, Supabase
        <br />
      </p>
    );
  } else if (args.includes("-ds")) {
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
  } else if (args.includes("-m")) {
    return <p>Amor fati: love of one's fate</p>;
  } else {
    return (
      <p>
        My name is Caenar Arteta
        <br />
        I'm currently 20 years old
        <br />
        based in Legazpi City, PH
      </p>
    );
  }
}

function clear(setHistory: (arg0: never[]) => any): any {
  setHistory([]);
}

function help() {
  const commands: Array<object> = [
    {
      name: "whoami",
      flags: [
        { alias: "-v", desc: "Display a more verbose description of myself" },
        { alias: "-ps", desc: "Display programming skills" },
        { alias: "-ds", desc: "Display (graphic) design skills" },
        { alias: "-m", desc: "Display my mantra in life" },
      ],
    },
    { name: "clear", flags: [] },
    { name: "help", flags: [] },
  ];

  return (
    <>
      {commands.map((cmd, index) => (
        <div key={index} className="grid grid-cols-[20%_40%_40%]">
          <div>
            <p>{cmd.name}</p>
          </div>
          <div className="grid grid-cols-2">
            {cmd.flags.length > 0
              ? cmd.flags.map((flag, flagIndex) => (
                  <>
                    <p key={`alias-${flagIndex}`} className="opacity-50">
                      {flag.alias}
                    </p>
                    <p key={`desc-${flagIndex}`}>{flag.desc}</p>
                  </>
                ))
              : ""}
          </div>
        </div>
      ))}
    </>
  );
}

const TERMINAL_COMMANDS: any = {
  whoami,
  clear,
  help,
};

export default TERMINAL_COMMANDS;
