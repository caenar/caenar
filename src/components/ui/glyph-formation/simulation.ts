import type { LogoTarget } from "./targets";
import {
  DEFAULT_FORMATION_CONFIG,
  type FormationState,
  type GlyphFormationConfig,
  type GlyphParticle,
} from "./types";

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function easeOutCubic(t: number) {
  const u = 1 - t;
  return 1 - u * u * u;
}

export function createFormation(
  targets: LogoTarget[],
  canvasWidth: number,
  canvasHeight: number,
  charCount: number,
  config: Partial<GlyphFormationConfig> = {},
  seed = 2026,
): FormationState {
  const cfg = { ...DEFAULT_FORMATION_CONFIG, ...config };
  const rand = mulberry32(seed);

  const glyphs: GlyphParticle[] = targets
    .slice(0, cfg.maxGlyphs)
    .map((t, i) => {
      // In-place formation: start at the destination, no travel path.
      const delay = rand() * cfg.staggerMs;
      const duration = cfg.travelMs + rand() * cfg.travelJitterMs;
      const rampLength = Math.max(1, cfg.rampLength || 10);
      const directionalBase = rampLength;
      let charIndex: number;
      const grad = t.gradient ?? 0;
      if (grad > 0.28) {
        const ang = t.gradAngle ?? 0;
        const deg = ((ang * 180) / Math.PI + 180) % 180;
        if (deg < 22.5 || deg > 157.5)
          charIndex = 3; // '-' horizontal stroke
        else if (deg < 67.5)
          charIndex = directionalBase; // '/'
        else if (deg < 112.5)
          charIndex = directionalBase + 2; // '|'
        else charIndex = directionalBase + 1; // '\'
      } else {
        const a = Math.max(0, Math.min(1, t.alpha));
        charIndex = Math.round(a * (rampLength - 1));
      }
      if (rand() < 0.12) charIndex = Math.max(0, charIndex - 1);
      charIndex = Math.max(0, Math.min(charCount - 1, charIndex));
      const jitterX = (rand() - 0.5) * 4;
      const jitterY = (rand() - 0.5) * 4;

      const scrambleMs =
        (cfg.scrambleMs ?? 380) + rand() * (cfg.scrambleJitterMs ?? 520);
      return {
        id: i,
        charIndex,
        displayCharIndex: Math.floor(rand() * Math.max(1, charCount)),
        scrambleMs,
        dx: t.x,
        dy: t.y,
        sx: t.x + jitterX,
        sy: t.y + jitterY,
        cx: t.x,
        cy: t.y,
        delay,
        duration,
        settled: 0,
        x: t.x + jitterX,
        y: t.y + jitterY,
        px: t.x + jitterX,
        py: t.y + jitterY,
        alpha: 0,
        glow: 0,
        size: t.size ?? 1,
        trail: [],
        idleElapsedMs: -(1500 + rand() * 7000),
        idleDurationMs: 3200 + rand() * 2400,
        idleRank: 0,
      };
    });

  // Seed-sprout spread: activate glyphs from a few random spots outward.
  if (glyphs.length > 0) {
    const seedCount = 50;
    const seeds: Array<{ x: number; y: number }> = [];
    for (let s = 0; s < seedCount; s++) {
      const sg = glyphs[Math.floor(rand() * glyphs.length)]!;
      seeds.push({ x: sg.dx, y: sg.dy });
    }
    const order = glyphs.map((g, i) => {
      let d = Infinity;
      for (const seed of seeds) {
        const dx = g.dx - seed.x;
        const dy = g.dy - seed.y;
        const dd = dx * dx + dy * dy;
        if (dd < d) d = dd;
      }
      return { i, d };
    });
    order.sort((a, b) => a.d - b.d);
    for (let rank = 0; rank < order.length; rank++) {
      glyphs[order[rank]!.i]!.idleRank = rank;
    }
  }

  return {
    phase: glyphs.length ? "forming" : "complete",
    elapsed: 0,
    charCount,
    glyphs,
    idleActiveCount: 0,
    idleSpreadMs: 0,
  };
}

export function completeFormation(state: FormationState): FormationState {
  for (const g of state.glyphs) {
    g.px = g.x;
    g.py = g.y;
    g.x = g.dx;
    g.y = g.dy;
    g.displayCharIndex = g.charIndex;
    g.settled = 1;
    g.alpha = 1;
    g.glow = 0.35;
    g.trail.length = 0;
    g.idleElapsedMs = -(1500 + Math.random() * 7000);
    g.idleDurationMs = 3200 + Math.random() * 2400;
  }
  state.phase = "complete";
  state.idleActiveCount = 0;
  state.idleSpreadMs = 0;
  return state;
}

const REST_GLOW = 0.35;

function tickIdleGlyph(g: GlyphParticle, deltaMs: number) {
  g.idleElapsedMs += deltaMs;
  if (g.idleElapsedMs >= g.idleDurationMs) {
    // Scramble finished: rest on the real char before the next burst.
    g.idleElapsedMs = -(4000 + Math.random() * 8000);
    g.idleDurationMs = 3200 + Math.random() * 2400;
  }
}

function applyIdleGlyph(g: GlyphParticle, count: number) {
  if (g.idleElapsedMs < 0) {
    g.displayCharIndex = g.charIndex;
    g.glow = REST_GLOW;
    return;
  }

  const d = g.idleDurationMs;
  const t = g.idleElapsedMs / d;
  const eased = 1 - (1 - t) * (1 - t) * (1 - t);
  // Few steps, long holds - subtle shimmer rather than rapid scrambling.
  const totalSteps = 2 + (g.id % 3);
  const step = Math.floor(eased * totalSteps);

  // Stay close to the glyph's own character for a subtle density shift.
  const offsets = [-2, -1, 1, 2];
  const offset = offsets[(g.id + step * 13) % offsets.length]!;
  const max = Math.max(1, count - 1);
  g.displayCharIndex = Math.min(max, Math.max(1, g.charIndex + offset));

  // Very small glow nudge that fades as the burst settles.
  g.glow = Math.max(g.glow, REST_GLOW + (1 - eased) * 0.04);
}

/** Advance the logo formation (settle/scramble + idle animation) by deltaMs. */
export function updateFormation(
  state: FormationState,
  deltaMs: number,
): FormationState {
  // Always advance the sprout spread, even during intro.
  state.idleSpreadMs += deltaMs;
  const spreadT = state.idleSpreadMs / 1000;
  const target = Math.min(
    state.glyphs.length,
    2500,
    Math.floor(50 * Math.exp(spreadT * 0.18)),
  );
  if (target > state.idleActiveCount) state.idleActiveCount = target;

  const count = Math.max(1, state.charCount);
  const active = state.idleActiveCount;
  for (const g of state.glyphs) {
    if (g.idleRank < active) tickIdleGlyph(g, deltaMs);
  }

  if (state.phase === "complete") {
    for (const g of state.glyphs) {
      if (g.idleRank < active) applyIdleGlyph(g, count);
      else {
        g.displayCharIndex = g.charIndex;
        g.glow = REST_GLOW;
      }
    }
    return state;
  }

  state.elapsed += deltaMs;
  let allSettled = true;

  for (const g of state.glyphs) {
    g.px = g.x;
    g.py = g.y;

    const local = state.elapsed - g.delay;
    if (local <= 0) {
      g.x = g.sx;
      g.y = g.sy;
      g.alpha = 0;
      g.glow = 0;
      g.settled = 0;
      g.trail.length = 0;
      allSettled = false;
      continue;
    }
    const t = clamp01(local / g.duration);
    const e = easeOutCubic(t);

    // Gentle settle from the tiny start jitter onto the exact destination.
    g.x = g.sx + (g.dx - g.sx) * e;
    g.y = g.sy + (g.dy - g.sy) * e;
    g.settled = t >= 1 ? 1 : 0;

    // Fade in from invisible to solid over the formation window.
    g.alpha = clamp01(e);
    // Violet glow pulses as it arrives, then settles to a restrained glow.
    const midGlow = Math.sin(Math.PI * t) * 0.6;
    g.glow = t >= 1 ? REST_GLOW : Math.max(0.15, midGlow);
    // Scramble: cycle through random chars, then settle to the final one.
    const scrambleProgress = clamp01(local / (g.scrambleMs || 400));
    if (scrambleProgress < 1) {
      const step = Math.floor(local / 40);
      g.displayCharIndex =
        (g.id * 31 + step * 17) % Math.max(1, state.charCount);
    } else if (g.idleRank < active) {
      applyIdleGlyph(g, count);
    } else {
      g.displayCharIndex = g.charIndex;
    }
    if (t < 1) {
      allSettled = false;
    } else {
      g.x = g.dx;
      g.y = g.dy;
      g.trail.length = 0;
      if (g.idleRank < active) applyIdleGlyph(g, count);
    }
  }

  if (allSettled && state.glyphs.length > 0) state.phase = "complete";
  return state;
}
