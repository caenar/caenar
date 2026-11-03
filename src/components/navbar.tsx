"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

  

  return (
    <nav
      className="z-40 fixed w-full px-[15vw] py-3 flex items-center justify-between backdrop-blur-md
  border-b border-[rgba(255,_255,_255,_0.151)]"
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
          const activeClass =
            href === pathname
              ? "flex place-items-center gap-2"
              : "transition hover:opacity-70 cursor-pointer";
          return (
            <li key={name} className={`${activeClass} uppercase !text-sm`}>
              {isActiveLink && <div className="box"></div>}
              <Link href={href} className="font-secondary">
                {name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
