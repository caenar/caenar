import React, { JSX } from "react";

function whoami(args: string): JSX.Element {
  if (args.includes("-ps")) {
    return (
      <p>
        <span>Frontend</span>: HTML/CSS, Javascript/Typescript, Tailwind, Sass, Angular, Astro, React, Next.js, Flutter<br />
        <span>Backend</span>: Node.js, Express.js, NestJS, REST API, WebSockets, PostgreSQL, MongoDB, Prisma, Mongoose<br />
        <span>Technologies</span>: Git/Github, Docker, Jira<br />
        Deployment: Vercel, Netlify, Render, Neon, Supabase<br />
      </p>
    );
  } else if (args.includes("-ds")) {
    return (
      <p>
        Figma, Webflow, Wix<br />
        Photoshop, Premiere Pro, After Effects, Illustrator<br />
        Davinci Resolve, Topaz Labs<br />
      </p>
    );
  } else if (args.includes("-m")) {
    return (
      <p>
        Amor fati: love of one's fate
      </p>
    );
  } else {
    return (
      <p>
        My name is Caenar Arteta<br />
        I'm currently 20 years old<br />
        based in Legazpi City, PH
      </p>
    );
  }
}

function clear(setHistory: (arg0: never[]) => any): any {
  setHistory([])
}


function help() {
  const commands: Array<Object> = [
    { name: "whoami", flags: ["-ps", "-ds", "-m"] },
    { name: "clear", flags: [] },
    { name: "help", flags: [] }
  ]

  return (
    <div>
      {commands.map((cmd: any, index: number) => {
        return (
          <p key={index}>{cmd.name} {cmd.flags.map((f: string) => { return (<> <span>{f}</span><br /> </>) })}</p>
        )
      })}
    </div>
  );
}

const TERMINAL_COMMANDS: any = {
  whoami,
  clear,
  help
};

export default TERMINAL_COMMANDS;
