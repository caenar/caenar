"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const links = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Projects", href: "/projects" },
    { name: "Contact", href: "/contact" },
  ];

  const pathname = usePathname();

  return (
    <nav className="navbar">
      <div className="h-14 w-14 flex items-center content-center">
        <Image
          priority
          src="/logo.svg"
          alt="Caenar's pretty cool logo"
          className="invert"
          width={50}
          height={50}
        />
      </div>
      <ul className="flex gap-10">
        {links.map(({ name, href }) => {
          const isActiveLink = href === pathname;
          return (
            <li
              key={name}
              className={isActiveLink ? "flex place-items-center gap-2" : ""}
            >
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
