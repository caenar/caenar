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
  const isHome = pathname === "/";
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

  const bgAlpha = useTransform(scrollY, [0, viewportHeight * 1.1], [0, 1]);
  const backgroundColor = useMotionTemplate`rgba(20, 20, 20, ${bgAlpha})`;
  const borderAlpha = useTransform(
    scrollY,
    [0, viewportHeight * 15],
    [0, 0.4],
  );
  const borderColor = useMotionTemplate`rgba(255, 255, 255, ${borderAlpha})`;

  // Home-only: reveal nav when scrolling reaches the terminal section.
  const [revealed, setRevealed] = useState(!isHome);
  const logoControls = useAnimationControls();
  const wrapperControls = useAnimationControls();
  const contentControls = useAnimationControls();
  const lastAnimatedRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (!isHome) {
      lastAnimatedRef.current = true;
      setRevealed(true);
      logoControls.set({ y: "0%" });
      wrapperControls.set({ left: "100%", x: "-100%", y: "-50%" });
      contentControls.set({ y: "0%" });
      return;
    }

    const isPastThreshold = window.scrollY > window.innerHeight * 0.92;
    lastAnimatedRef.current = isPastThreshold;
    setRevealed(isPastThreshold);
    if (isPastThreshold) {
      logoControls.set({ y: "0%" });
      wrapperControls.set({ left: "100%", x: "-100%", y: "-50%" });
      contentControls.set({ y: "0%" });
    } else {
      logoControls.set({ y: "120%" });
      wrapperControls.set({ left: "50%", x: "-50%", y: "-50%" });
      contentControls.set({ y: "0%" });
    }

    const onScroll = () => {
      const next = window.scrollY > window.innerHeight * 0.92;
      setRevealed((prev) => (prev === next ? prev : next));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome, logoControls, wrapperControls, contentControls]);

  useEffect(() => {
    if (!isHome) return;
    if (lastAnimatedRef.current === revealed) return;
    lastAnimatedRef.current = revealed;

    const easeOut = [0.16, 1, 0.3, 1] as const;
    const spring = { type: "spring" as const, stiffness: 280, damping: 28, mass: 0.8 };

    const run = async () => {
      if (revealed) {
        await contentControls.start({
          y: "-120%",
          transition: { duration: 0.22, ease: easeOut },
        });
        if (lastAnimatedRef.current !== true) return;
        contentControls.set({ y: "120%" });
        await wrapperControls.start({
          left: "100%",
          x: "-100%",
          y: "-50%",
          transition: spring,
        });
        if (lastAnimatedRef.current !== true) return;
        void logoControls.start({
          y: "0%",
          transition: { duration: 0.35, ease: easeOut },
        });
        await contentControls.start({
          y: "0%",
          transition: { duration: 0.3, ease: easeOut },
        });
        window.dispatchEvent(new Event("resize"));
      } else {
        void logoControls.start({
          y: "120%",
          transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
        });
        await contentControls.start({
          y: "120%",
          transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
        });
        if (lastAnimatedRef.current !== false) return;
        contentControls.set({ y: "-120%" });
        await wrapperControls.start({
          left: "50%",
          x: "-50%",
          y: "-50%",
          transition: spring,
        });
        if (lastAnimatedRef.current !== false) return;
        await contentControls.start({
          y: "0%",
          transition: { duration: 0.3, ease: easeOut },
        });
        window.dispatchEvent(new Event("resize"));
      }
    };

    void run();
  }, [revealed, isHome, logoControls, wrapperControls, contentControls]);

  const targetHref =
    hoveredHref ??
    NAV_LINKS.find(({ href }) => href === pathname)?.href ??
    null;

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
      if (
        typeof window !== "undefined" &&
        !window.matchMedia("(min-width: 768px)").matches
      ) {
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
      style={{ borderColor, backgroundColor }}
    >
      <div className="relative h-4">
        {/* Logo: absolute, no flex slot — reveals with clip mask on scroll */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 overflow-hidden">
          <motion.div
            animate={logoControls}
            initial={isHome ? { y: "120%" } : { y: "0%" }}
          >
            <Link href="/" onClick={() => setMobileOpen(false)}>
              <Image
                priority
                src="/logo.svg"
                alt="Caenar's pretty cool logo"
                className="invert"
                width={40}
                height={40}
              />
            </Link>
          </motion.div>
        </div>

        {/* Nav links: clipped container slides up, repositions, slides down */}
        <motion.div
          animate={wrapperControls}
          initial={
            isHome
              ? { left: "50%", x: "-50%", y: "-50%" }
              : { left: "100%", x: "-100%", y: "-50%" }
          }
          className="absolute top-1/2 -translate-y-1/2 overflow-hidden hidden md:block"
        >
          <motion.ul
            ref={listRef}
            animate={contentControls}
            initial={{ y: "0%" }}
            className="relative flex items-center gap-10"
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
        </motion.ul>
        </motion.div>

        <button
          type="button"
          className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-md border border-foreground-100/20 p-2 text-foreground-100"
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
