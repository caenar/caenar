import { IconSizes } from "@/utils/IconSizes";
import React from "react";
import {
  TbBrandAdobeAfterEffect,
  TbBrandAdobeIllustrator,
  TbBrandAdobePhotoshop,
  TbBrandAdobePremier,
  TbBrandAngular,
  TbBrandBlender,
  TbBrandDocker,
  TbBrandFacebook,
  TbBrandFigma,
  TbBrandFlutter,
  TbBrandGit,
  TbBrandGithub,
  TbBrandJavascript,
  TbBrandLinkedin,
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
import Tabs from "@/components/tabs";

export default function Home() {
  interface SkillIcons {
    icon: React.JSX.Element;
    name: string;
  }

  interface SkillProps {
    icons: SkillIcons[];
  }

  const fullStackIcons: SkillIcons[] = [
    { icon: <TbBrandReact size={IconSizes.MEDIUM} />, name: "React" },
    { icon: <TbBrandAngular size={IconSizes.MEDIUM} />, name: "Angular" },
    { icon: <TbBrandVue size={IconSizes.MEDIUM} />, name: "Vue" },
    { icon: <TbBrandNextjs size={IconSizes.MEDIUM} />, name: "Next.js" },
    { icon: <TbBrandFlutter size={IconSizes.MEDIUM} />, name: "Flutter" },
    { icon: <TbBrandJavascript size={IconSizes.MEDIUM} />, name: "Javascript" },
    { icon: <TbBrandTypescript size={IconSizes.MEDIUM} />, name: "Typescript" },
    { icon: <TbBrandPython size={IconSizes.MEDIUM} />, name: "Python" },
    { icon: <TbBrandPhp size={IconSizes.MEDIUM} />, name: "PHP" },
    { icon: <TbBrandTailwind size={IconSizes.MEDIUM} />, name: "Tailwind" },
    { icon: <TbBrandSass size={IconSizes.MEDIUM} />, name: "Sass" },
    { icon: <TbBrandMongodb size={IconSizes.MEDIUM} />, name: "MongoDB" },
    { icon: <TbBrandNodejs size={IconSizes.MEDIUM} />, name: "Node.js" },
    { icon: <TbBrandDocker size={IconSizes.MEDIUM} />, name: "Docker" },
    { icon: <TbBrandGit size={IconSizes.MEDIUM} />, name: "Git" },
  ];

  const graphicDesignIcons: SkillIcons[] = [
    {
      icon: <TbBrandAdobePhotoshop size={IconSizes.MEDIUM} />,
      name: "Photoshop",
    },
    {
      icon: <TbBrandAdobeIllustrator size={IconSizes.MEDIUM} />,
      name: "Illustrator",
    },
    {
      icon: <TbBrandAdobePremier size={IconSizes.MEDIUM} />,
      name: "Premiere Pro",
    },
    {
      icon: <TbBrandAdobeAfterEffect size={IconSizes.MEDIUM} />,
      name: "After Effects",
    },
    { icon: <TbBrandBlender size={IconSizes.MEDIUM} />, name: "Blender" },
    { icon: <TbBrandFigma size={IconSizes.MEDIUM} />, name: "Figma" },
  ];

  const SkillList = ({ icons }: SkillProps) => {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="font-secondary text-base">Technical Skills</h1>
        <div className="flex flex-wrap gap-2">
          {icons.map((icon) => {
            return (
              <div
                key={icon.name}
                className="flex gap-1 border border-background-200 px-3 py-1.5 rounded-md"
              >
                {icon.icon}
                <span>{icon.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const GraphicDesignInfo = () => {
    return (
      <div className="grid gap-10">
        <p>
          A little more lore about me is that before I played around Cinema 4D
          creating Minecraft renders, that era of mine sparked my love for
          graphic design, then the rest? Exploration.
        </p>
        <SkillList icons={graphicDesignIcons} />
      </div>
    );
  };

  const FullStackInfo = () => {
    return (
      <div className="grid gap-10">
        <p>
          When pandemic struck I used to create static websites on my phone, it
          was where I learned fundamental concepts on web development. When
          college started I was introduced to a broader aspect of programming,
          learning new languages and core concepts. That&apos;s when I my
          passion for programming started to spark, then I explored like I
          always do.
        </p>
        <SkillList icons={fullStackIcons} />
      </div>
    );
  };

  const tabs = [
    { label: "Full-Stack Developer", content: <FullStackInfo /> },
    { label: "Creative Designer", content: <GraphicDesignInfo /> },
  ];

  return (
    <>
      <section className="h-dvh flex items-center justify-center">
        <div className="flex flex-col gap-10 w-[650px]">
          <div className="grid gap-5">
            <h1 className="font-body">
              A creative designer that{" "}
              <span className="text-violet-200">fell in love</span> with
              programming
            </h1>
            <p className="text-background-200">
              From designing banners, posters, brands and even post-media
              production, now creating fully-fledged websites that can span
              across different operating systems.
            </p>
          </div>
          <div className="flex gap-5 items-center">
            <button type="button" className="primary-button">
              See my resume
            </button>
            <div className="flex gap-2">
              <a href="https://www.github.com/notansjwmember" target="_blank">
                <TbBrandGithub size={IconSizes.MEDIUM} />
              </a>
              <a
                href="https://www.facebook.com/bobo.o.ng.bulaklak"
                target="_blank"
              >
                <TbBrandFacebook size={IconSizes.MEDIUM} />
              </a>
              <a href="https://www.linkedin.com/in/caenarguen" target="_blank">
                <TbBrandLinkedin size={IconSizes.MEDIUM} />
              </a>
            </div>
          </div>
        </div>
      </section>
      <section className="h-dvh flex flex-col gap-10 items-center justify-center">
        <div className="w-[650px] grid gap-7">
          <h1 className="font-body">👋 About me</h1>
          <p className="text-lg">
            I haven&apos;t properly introduced myself so my name is Caenar
            Arteta, pronounced as kay-nar. I live in Legazpi City, Albay in the
            Philippines. Currently, I&apos;m a sophomore college student
            studying Information Technology.
          </p>
          <p>
            My skills today are a result of determination and passion, once I
            get into something I find interesting I pour myself in understanding
            more about it digging lower each time.
          </p>
          <div className="line"></div>
          <Tabs tabs={tabs} />
        </div>
      </section>
    </>
  );
}
