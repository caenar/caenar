"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";

const SCRAMBLE_SOURCE =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";

function randomChar() {
  return SCRAMBLE_SOURCE[Math.floor(Math.random() * SCRAMBLE_SOURCE.length)];
}

// Headline-only: clustered glyph scramble with eased settling
export default function ScrambleText({
  text,
  className,
  delay = 0,
  speed = 0.065,
  highlight,
}: {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
  highlight?: { from: number; to: number };
}) {
  // Start with the final text so SSR/hydration match; the effect scrambles it.
  const [chars, setChars] = useState<string[]>(() => text.split(""));
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    clearTimers();

    const letters = text.split("");
    setChars(letters.map((c) => (c === " " ? " " : randomChar())));

    const nonSpaceCount = letters.filter((c) => c !== " ").length;
    const waveDuration = 0.55; // overall spread of the opening wave (seconds)
    const jitter = 0.18; // random offset per char (seconds), breaks linear order

    // Assign each char a "cluster" bucket so groups of nearby-ish positions
    // tend to activate together, but with jitter for an organic feel.
    const clusterCount = Math.max(3, Math.round(nonSpaceCount / 10));
    const clusterOffsets = Array.from(
      { length: clusterCount },
      () => (Math.random() - 0.5) * 0.12,
    );

    let nonSpaceIndex = 0;
    letters.forEach((target, i) => {
      if (target === " ") return; // keep spaces as real, breakable spaces

      const progress =
        nonSpaceCount > 1 ? nonSpaceIndex / (nonSpaceCount - 1) : 0;
      const cluster = Math.floor(progress * clusterCount);
      const clusterOffset =
        clusterOffsets[Math.min(cluster, clusterCount - 1)] ?? 0;
      const charJitter = (Math.random() - 0.5) * jitter;

      // Base wave + cluster nudge + per-char jitter = organic, clustered opening
      const startSec =
        delay + progress * waveDuration + clusterOffset + charJitter;
      const startMs = Math.max(0, startSec) * 1000;
      const scrambleMs = 380 + Math.random() * 520;
      const settleAt = startMs + scrambleMs;
      const baseDelay = speed * 1000; // fast-ish start
      const maxDelay = baseDelay * 3.5; // slows down near the end

      nonSpaceIndex++;

      const startTimer = setTimeout(() => {
        const begunAt = performance.now();

        const tick = () => {
          const elapsed = performance.now() - begunAt;
          const t = Math.min(elapsed / scrambleMs, 1);

          if (t >= 1) {
            setChars((prev) => {
              const next = [...prev];
              next[i] = target;
              return next;
            });
            return;
          }

          setChars((prev) => {
            const next = [...prev];
            next[i] = randomChar();
            return next;
          });

          // Ease-out: ticks get farther apart as we approach settling
          const eased = 1 - Math.pow(1 - t, 2);
          const nextDelay = baseDelay + (maxDelay - baseDelay) * eased;
          timersRef.current.push(setTimeout(tick, nextDelay));
        };

        tick();
      }, startMs);

      // Failsafe: ensure final char is set even if timing drifts
      const settleTimer = setTimeout(() => {
        setChars((prev) => {
          const next = [...prev];
          next[i] = target;
          return next;
        });
      }, settleAt + 120);

      timersRef.current.push(startTimer, settleTimer);
    });

    return clearTimers;
  }, [text, delay, speed, clearTimers]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">
        {text.split("").map((finalChar, i) => {
          // Real space -> breakable whitespace so the headline wraps naturally.
          if (finalChar === " ") {
            return <React.Fragment key={i}> </React.Fragment>;
          }

          const isHighlighted =
            highlight != null && i >= highlight.from && i < highlight.to;
          const current = chars[i] ?? finalChar;

          return (
            <span key={i} className="relative inline-block">
              {/* Invisible final glyph reserves its exact width + height.
                  This is what the layout is measured from, so it never changes. */}
              <span className="invisible">{finalChar}</span>

              {/* Scrambling glyph is absolutely positioned, so it can be any
                  width/height without affecting the layout. */}
              <motion.span
                className={`absolute left-0 top-0 w-full text-center ${
                  isHighlighted ? "text-violet-200" : ""
                }`}
                initial={{
                  opacity: 0,
                  y: 18,
                  rotateX: -45,
                  filter: "blur(3px)",
                }}
                animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
                transition={{
                  delay: delay + i * 0.025,
                  duration: 0.75,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
              >
                {current}
              </motion.span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
