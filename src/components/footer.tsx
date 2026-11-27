import Link from "next/link";
import { Github, Facebook, Linkedin, ArrowUpRight } from "lucide-react";
import { IconSizes } from "@/lib/constants";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Work", href: "/work" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const SOCIALS = [
  { name: "GitHub", href: "https://www.github.com/caenar", icon: Github },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/stephaniearteta", icon: Linkedin },
  { name: "Facebook", href: "https://www.facebook.com/bobo.o.ng.bulaklak", icon: Facebook },
];

export default function Footer() {
  return (
    <footer className="relative border-background-400/60 border-t">
      <div className="px-4 sm:px-6 md:px-[8vw] lg:px-[15vw] py-12 sm:py-16">
        <div className="gap-10 md:gap-16 grid md:grid-cols-[1fr_auto_auto]">
          <div className="gap-4 grid max-w-md">
            <Link href="/" className="w-fit font-display font-semibold text-2xl tracking-tight">
              caenar<span className="text-violet-200">.</span>
            </Link>
            <p className="text-background-200 text-sm leading-relaxed">
              Graphic designer turned full-stack developer, building digital
              experiences with intention and a bit of chaos.
            </p>
            <a
              href="mailto:hello@caenar.dev"
              className="group inline-flex items-center gap-2 w-fit font-mono text-foreground-100/80 hover:text-violet-200 text-sm uppercase tracking-wide transition"
            >
              hello@caenar.dev
              <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>

          <div className="content-start gap-3 grid">
            <p className="font-mono text-background-200/70 text-xs uppercase tracking-[0.2em]">
              Navigate
            </p>
            <ul className="gap-2 grid">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-foreground-100/75 hover:text-violet-200 text-sm transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="content-start gap-3 grid">
            <p className="font-mono text-background-200/70 text-xs uppercase tracking-[0.2em]">
              Elsewhere
            </p>
            <ul className="gap-2 grid">
              {SOCIALS.map((social) => {
                const Icon = social.icon;
                return (
                  <li key={social.name}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-foreground-100/75 hover:text-violet-200 text-sm transition"
                    >
                      <Icon size={IconSizes.SMALL} />
                      {social.name}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3 mt-12 pt-6 border-background-400/40 border-t font-mono text-background-200/60 text-xs uppercase tracking-wide">
          <p>© {new Date().getFullYear()} Caenar Arteta</p>
          <p>Designed &amp; built with questionable sleep</p>
        </div>
      </div>
    </footer>
  );
}
