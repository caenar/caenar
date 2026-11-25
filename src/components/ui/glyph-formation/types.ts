export type GlyphFormationConfig = {
  /** Max glyphs to create. */
  maxGlyphs: number;
  /** Minimum distance between targets in grid-cell units. */
  minDistanceCells: number;
  /** Scatter radius around logo rect, in canvas pixels. */
  scatterRadius: number;
  /** Base travel duration in ms. */
  travelMs: number;
  /** Random extra travel duration in ms. */
  travelJitterMs: number;
  /** Max stagger delay in ms. */
  staggerMs: number;
  /** Trail points per glyph. */
  trailLength: number;
  /** Number of luminance-ramp characters at the start of the charset. */
  rampLength: number;
  /** Base scramble duration in ms (random chars before settling). */
  scrambleMs: number;
  /** Random extra scramble duration in ms. */
  scrambleJitterMs: number;
};

export const DEFAULT_FORMATION_CONFIG: GlyphFormationConfig = {
  maxGlyphs: 420,
  minDistanceCells: 1.35,
  scatterRadius: 220,
  travelMs: 1800,
  travelJitterMs: 900,
  staggerMs: 1400,
  trailLength: 10,
  rampLength: 50,
  scrambleMs: 0,
  scrambleJitterMs: 520,
};

export type TrailPoint = { x: number; y: number; alpha: number };

export type GlyphParticle = {
  id: number;
  charIndex: number;
  displayCharIndex: number;
  scrambleMs: number;
  // Destination in canvas pixels
  dx: number;
  dy: number;
  // Start position in canvas pixels
  sx: number;
  sy: number;
  // Quadratic bezier control point in canvas pixels
  cx: number;
  cy: number;
  delay: number; // ms
  duration: number; // ms
  // 0..1 settled amount for effects
  settled: number;
  // current position
  x: number;
  y: number;
  // previous position for trail
  px: number;
  py: number;
  alpha: number;
  glow: number;
  /** Base render scale; 1 = full cell. */
  size: number;
  trail: TrailPoint[];
  /** Elapsed time in the current idle cycle; negative = resting on charIndex. */
  idleElapsedMs: number;
  /** Duration of the scramble portion of the idle cycle (ms). */
  idleDurationMs: number;
  /** Activation order for the idle spread (0 = first). */
  idleRank: number;
};

export type FormationPhase = "idle" | "forming" | "complete";

export type FormationState = {
  phase: FormationPhase;
  elapsed: number; // ms since formation started
  charCount: number;
  glyphs: GlyphParticle[];
  /** How many glyphs are currently "infected" by the idle scramble. */
  idleActiveCount: number;
  /** Time since formation completed, drives the spread. */
  idleSpreadMs: number;
};
