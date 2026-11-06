"use client";

import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Work", href: "/work" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  ...(process.env.NODE_ENV === "development"
    ? [{ name: "Admin", href: "/admin" }]
    : []),
];

export default function Navbar() {
  const pathname = usePathname();
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const [indicatorReady, setIndicatorReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const listRef = useRef<HTMLUListElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});

  const [viewportHeight, setViewportHeight] = useState(1);
  const { scrollY } = useScroll();
  const indicatorControls = useAnimationControls();
  const hasPositionedRef = useRef(false);
  const prevTargetRef = useRef<string | null>(null);

  useEffect(() => {
    setViewportHeight(window.innerHeight);

    const onResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const blur = useTransform(scrollY, [0, viewportHeight * 5], [0, 12]);
  const borderAlpha = useTransform(scrollY, [0, viewportHeight * 15], [0, 0.151]);
  const borderColor = useMotionTemplate`rgba(255, 255, 255, ${borderAlpha})`;
  const backdropFilter = useMotionTemplate`blur(${blur}px)`;

  const targetHref =
    hoveredHref ?? NAV_LINKS.find(({ href }) => href === pathname)?.href ?? null;

  useEffect(() => {
    const getIndicatorPosition = (href: string) => {
      if (!listRef.current) return null;
      const item = itemRefs.current[href];
      if (!item) return null;
      const listRect = listRef.current.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      if (listRect.width === 0 || itemRect.width === 0) return null;
      return {
        x: itemRect.left - listRect.left,
        y: itemRect.top - listRect.top + itemRect.height / 2 - 3,
      };
    };

    if (!targetHref) {
      setIndicatorReady(false);
      hasPositionedRef.current = false;
      prevTargetRef.current = null;
      return;
    }

    const syncPosition = (animate: boolean) => {
      if (typeof window !== "undefined" && !window.matchMedia("(min-width: 768px)").matches) {
        setIndicatorReady(false);
        return;
      }
      const pos = getIndicatorPosition(targetHref);
      if (!pos) return;
      setIndicatorReady(true);

      if (!hasPositionedRef.current) {
        indicatorControls.set({ ...pos, scale: 1, opacity: 1 });
        hasPositionedRef.current = true;
        prevTargetRef.current = targetHref;
        return;
      }

      if (!animate || prevTargetRef.current === targetHref) {
        indicatorControls.set(pos);
        return;
      }

      prevTargetRef.current = targetHref;
      void indicatorControls.start({
        ...pos,
        scale: [1, 0.18, 1],
        transition: {
          x: { type: "spring", stiffness: 520, damping: 34, mass: 0.55 },
          y: { type: "spring", stiffness: 520, damping: 34, mass: 0.55 },
          scale: { duration: 0.26, times: [0, 0.35, 1], ease: "easeOut" },
        },
      });
    };

    syncPosition(true);
    const frame = requestAnimationFrame(() => syncPosition(false));

    const onLayout = () => syncPosition(false);
    window.addEventListener("resize", onLayout);
    const resizeObserver =
      typeof ResizeObserver !== "undefined" && listRef.current
        ? new ResizeObserver(onLayout)
        : null;
    resizeObserver?.observe(listRef.current as Element);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onLayout);
      resizeObserver?.disconnect();
    };
  }, [targetHref, indicatorControls]);

  return (
    <motion.nav
      className="z-40 fixed w-full px-4 sm:px-6 md:px-[15vw] py-4 border-b"
      style={{ borderColor, backdropFilter }}
    >
      <div className="flex items-center justify-between">
        <Link href="/" onClick={() => setMobileOpen(false)}>
          <Image
            priority
            src="/logo.svg"
            alt="Caenar's pretty cool logo"
            className="invert"
            width={30}
            height={30}
          />
        </Link>

        <ul
          ref={listRef}
          className="relative hidden md:flex gap-10"
          onMouseLeave={() => setHoveredHref(null)}
        >
          {indicatorReady && (
            <motion.div
              className="pointer-events-none absolute left-0 top-0 size-1.5 bg-violet-200"
              animate={indicatorControls}
              initial={false}
            />
          )}
          {NAV_LINKS.map(({ name, href }) => {
            const isActiveLink = href === pathname;
            return (
              <li
                key={name}
                ref={(el) => {
                  itemRefs.current[href] = el;
                }}
                className="flex items-center gap-2 uppercase text-xs select-none"
                onMouseEnter={() => setHoveredHref(href)}
              >
                <span className="size-1.5 shrink-0" aria-hidden />
                <Link
                  href={href}
                  className={`font-mono transition ${
                    isActiveLink ? "" : "hover:opacity-80"
                  }`}
                >
                  {name}
                </Link>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-md border border-foreground-100/20 p-2 text-foreground-100"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {mobileOpen && (
          <motion.div
            id="mobile-nav-menu"
            className="md:hidden mt-4 border-t border-white/10 pt-4"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map(({ name, href }) => {
                const isActiveLink = href === pathname;
                return (
                  <li key={name}>
                    <Link
                      href={href}
                      className={`block rounded-md px-3 py-3 font-mono text-xs uppercase transition ${
                        isActiveLink
                          ? "bg-white/10 text-foreground-100"
                          : "text-foreground-100/80 hover:bg-white/5 hover:text-foreground-100"
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
