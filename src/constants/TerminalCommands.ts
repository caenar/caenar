export const COMMANDS = {
  whoami: (args: any) => {
    if (args.includes("-ds")) {
      return "Frontend: HTML/CSS, Javascript/Typescript, Tailwind, Sass, Angular, Astro, React, Next.js, Flutter\nBackend: Node.js, Express.js, NestJS, REST API, WebSockets, PostgreSQL, MongoDB, Prisma, Mongoose\nLanguages: Java, Python, PHP\nTechnologies: Git/Github, Docker, Jira\nDeployment: Vercel, Netlify, Render, Neon, Supabase";
    } else if (args.includes("-ps")) {
      return "Figma, Webflow, Wix\nPhotoshop, Premiere Pro, After Effects, Illustrator\nDavinci Resolve, Topaz Labs";
    } else if (args.includes("-m")) {
      return "Amor fati: love of one's fate";
    } else {
      return "My name is Caenar Arteta\nI'm currently 20 years old\nbased in Legazpi City, PH";
    }
  },
  clear: (setHistory: React.Dispatch<React.SetStateAction<string[]>>) =>
    setHistory([]),
};
