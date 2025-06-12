"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const links = [
    { name: "Home", href: "/" },
    { name: "Projects", href: "/projects" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const pathname = usePathname();

  return (
    <nav className="navbar">
      <a href="/">
        <div className="h-12 w-12 flex items-center content-center">
          <Image
            priority
            src="/logo.svg"
            alt="Caenar's pretty cool logo"
            className="invert"
            width={45}
            height={45}
          />
        </div>
      </a>
      <ul className="flex gap-10">
        {links.map(({ name, href }) => {
          const isActiveLink = href === pathname;
          const activeClass =
            href === pathname
              ? "flex place-items-center gap-2"
              : "transition hover:opacity-70 cursor-pointer";
          return (
            <li key={name} className={`${activeClass} !text-base`}>
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
