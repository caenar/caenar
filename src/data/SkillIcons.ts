import {
  TbBrandAdobeAfterEffect,
  TbBrandAdobeIllustrator,
  TbBrandAdobePhotoshop,
  TbBrandAdobePremier,
  TbBrandAngular,
  TbBrandBlender,
  TbBrandDocker,
  TbBrandFigma,
  TbBrandFlutter,
  TbBrandGit,
  TbBrandJavascript,
  TbBrandMongodb,
  TbBrandNextjs,
  TbBrandNodejs,
  TbBrandPhp,
  TbBrandPython,
  TbBrandReact,
  TbBrandSass,
  TbBrandTailwind,
  TbBrandTypescript,
  TbBrandVue,
} from "react-icons/tb";

import { IconType } from "react-icons";

export interface SkillIcon {
  icon: IconType;
  name: string;
}

export interface SkillProps {
  icons: SkillIcon[];
}

export const fullStackIcons: SkillIcon[] = [
  { icon: TbBrandReact, name: "React" },
  { icon: TbBrandAngular, name: "Angular" },
  { icon: TbBrandVue, name: "Vue" },
  { icon: TbBrandNextjs, name: "Next.js" },
  { icon: TbBrandFlutter, name: "Flutter" },
  { icon: TbBrandJavascript, name: "JavaScript" },
  { icon: TbBrandTypescript, name: "TypeScript" },
  { icon: TbBrandPython, name: "Python" },
  { icon: TbBrandPhp, name: "PHP" },
  { icon: TbBrandTailwind, name: "Tailwind" },
  { icon: TbBrandSass, name: "Sass" },
  { icon: TbBrandMongodb, name: "MongoDB" },
  { icon: TbBrandNodejs, name: "Node.js" },
  { icon: TbBrandDocker, name: "Docker" },
  { icon: TbBrandGit, name: "Git" },
];

export const graphicDesignIcons: SkillIcon[] = [
  { icon: TbBrandAdobePhotoshop, name: "Photoshop" },
  { icon: TbBrandAdobeIllustrator, name: "Illustrator" },
  { icon: TbBrandAdobePremier, name: "Premiere Pro" },
  { icon: TbBrandAdobeAfterEffect, name: "After Effects" },
  { icon: TbBrandBlender, name: "Blender" },
  { icon: TbBrandFigma, name: "Figma" },
];

// const SkillList = ({ icons }: SkillProps) => {
//   return (
//     <div className="flex flex-col gap-3">
//       <h1 className="font-secondary text-base">Technical Skills</h1>
//       <div className="flex flex-wrap gap-2">
//         {icons.map(({ icon: Icon, name }) => (
//           <div
//             key={name}
//             className="flex items-center gap-2 border border-background-200 px-3 py-1.5 rounded-md"
//           >
//             <Icon size={IconSizes.MEDIUM} />
//             <span>{name}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };
