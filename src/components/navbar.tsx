"use client";

import { motion, useScroll, useTransform, useMotionTemplate } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();

  const links = (
    [
      { name: "Home", href: "/" },
      { name: "Projects", href: "/projects" },
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" },
      process.env.NODE_ENV === "development" && {
        name: "Admin",
        href: "/admin",
      },
    ] as const
  ).filter((link): link is { name: string; href: string } => Boolean(link));

  const [viewportHeight, setViewportHeight] = useState(1);
  const { scrollY } = useScroll();

  useEffect(() => {
    setViewportHeight(window.innerHeight);

    const onResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const blur = useTransform(scrollY, [0, viewportHeight], [0, 12]);
  const borderAlpha = useTransform(scrollY, [0, viewportHeight], [0, 0.151]);
  const borderColor = useMotionTemplate`rgba(255, 255, 255, ${borderAlpha})`;
  const backdropFilter = useMotionTemplate`blur(${blur}px)`;

  return (
    <motion.nav
      className="z-40 fixed w-full px-[15vw] py-4 flex items-center justify-between border-b"
      style={{ borderColor, backdropFilter }}
    >
      <Link href="/">
        <Image
          priority
          src="/logo.svg"
          alt="Caenar's pretty cool logo"
          className="invert"
          width={35}
          height={35}
        />
      </Link>
      <ul className="flex gap-10">
        {links.map(({ name, href }) => {
          const isActiveLink = href === pathname;
          const activeClass = isActiveLink
            ? "flex place-items-center gap-2"
            : "transition hover:opacity-70 cursor-pointer";
          return (
            <li key={name} className={`${activeClass} uppercase text-xs`}>
              {isActiveLink && <div className="box"></div>}
              <Link href={href} className="font-mono">
                {name}
              </Link>
            </li>
          );
        })}
      </ul>
    </motion.nav>
  );
}
