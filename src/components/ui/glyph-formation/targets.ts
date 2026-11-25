export type LogoTarget = {
  /** Destination center in canvas pixels (device pixels). */
  x: number;
  y: number;
  /** Grid cell index (column, row) in destination grid. */
  col: number;
  row: number;
  /** Normalized mask alpha at this target, 0..1. */
  alpha: number;
  /** Sobel gradient magnitude of the mask alpha at this cell, 0..1. */
  gradient?: number;
  /** Sobel gradient angle (radians) of the mask alpha at this cell. */
  gradAngle?: number;
  /** Render scale (1 = full cell, <1 = gap-filling filler glyph). */
  size?: number;
};

export type MaskRect = [number, number, number, number]; // [x, y, w, h] in canvas pixels

export type TargetGenerationInput = {
  mask: HTMLImageElement;
  canvasWidth: number;
  canvasHeight: number;
  cellWidth: number;
  cellHeight: number;
  /** Minimum distance between targets in grid-cell units. */
  minDistanceCells?: number;
  /** Alpha threshold (0..255) for a pixel to be considered inside the logo. */
  alphaThreshold?: number;
  /** Maximum targets to generate. */
  maxTargets?: number;
  seed?: number;
};

export type TargetGenerationResult = {
  targets: LogoTarget[];
  maskRect: MaskRect;
  channel: "r" | "g" | "b" | "a";
  threshold: number;
};

export function computeMaskRect(
  canvasWidth: number,
  canvasHeight: number,
  imageWidth: number,
  imageHeight: number,
): MaskRect {
  const scale = Math.max(canvasWidth / imageWidth, canvasHeight / imageHeight);
  const mw = imageWidth * scale;
  const mh = imageHeight * scale;
  const mx = (canvasWidth - mw) / 2;
  const my = canvasHeight - mh; // bottom anchored, matches existing shader
  return [mx, my, mw, mh];
}

function createRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    // mulberry32
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function detectSilhouetteChannel(data: Uint8ClampedArray): "r" | "g" | "b" | "a" {
  const counts = { r: 0, g: 0, b: 0, a: 0 };
  const maxes = { r: 0, g: 0, b: 0, a: 0 };
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    const a = data[i + 3]!;
    if (r > maxes.r) maxes.r = r;
    if (g > maxes.g) maxes.g = g;
    if (b > maxes.b) maxes.b = b;
    if (a > maxes.a) maxes.a = a;
    if (r > 16) counts.r++;
    if (g > 16) counts.g++;
    if (b > 16) counts.b++;
    if (a > 16) counts.a++;
  }
  // Prefer alpha when it carries meaningful silhouette data.
  if (maxes.a > 24 && counts.a > 0) return "a";
  const channels: Array<"r" | "g" | "b"> = ["r", "g", "b"];
  let best: "r" | "g" | "b" = "r";
  for (const c of channels) {
    if (counts[c] > counts[best]) best = c;
  }
  return best;
}

function sampleChannel(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
  channel: "r" | "g" | "b" | "a",
): number {
  const ix = Math.min(width - 1, Math.max(0, Math.round(x)));
  const iy = Math.min(height - 1, Math.max(0, Math.round(y)));
  const off = (iy * width + ix) * 4;
  const idx = channel === "r" ? 0 : channel === "g" ? 1 : channel === "b" ? 2 : 3;
  return data[off + idx] ?? 0;
}

export function generateLogoTargets(input: TargetGenerationInput): TargetGenerationResult {
  const {
    mask,
    canvasWidth,
    canvasHeight,
    cellWidth,
    cellHeight,
    minDistanceCells = 1.35,
    alphaThreshold = 24,
    maxTargets = 420,
    seed = 1337,
  } = input;

  const maskRect = computeMaskRect(canvasWidth, canvasHeight, mask.naturalWidth, mask.naturalHeight);
  const [mx, my, mw, mh] = maskRect;

  const sampleCanvas = document.createElement("canvas");
  sampleCanvas.width = mask.naturalWidth;
  sampleCanvas.height = mask.naturalHeight;
  const ctx = sampleCanvas.getContext("2d");
  if (!ctx) return { targets: [], maskRect, channel: "a", threshold: alphaThreshold };
  ctx.clearRect(0, 0, sampleCanvas.width, sampleCanvas.height);
  ctx.drawImage(mask, 0, 0);
  const imageData = ctx.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height);
  const { data, width: iw, height: ih } = imageData;
  const channel = detectSilhouetteChannel(data);

  const cols = Math.max(1, Math.floor(canvasWidth / cellWidth));
  const rows = Math.max(1, Math.floor(canvasHeight / cellHeight));

  // Sub-sample several points within each cell so a cell whose exact center
  // falls in a thin mask gap still produces a target if any part of the cell
  // is inside the logo silhouette. This fills internal holes without painting
  // a solid mask.
  const subPoints = [-0.45, 0.0, 0.45];
  const subOffsets: Array<[number, number]> = [];
  for (const dy of subPoints) {
    for (const dx of subPoints) {
      subOffsets.push([dx, dy]);
    }
  }

  // Sobel gradient of the silhouette channel at a mask-space point.
  const sobel = (px: number, py: number) => {
    const s = (dx: number, dy: number) => sampleChannel(data, iw, ih, px + dx, py + dy, channel) / 255;
    const gx = -s(-1, -1) - 2 * s(-1, 0) - s(-1, 1) + s(1, -1) + 2 * s(1, 0) + s(1, 1);
    const gy = -s(-1, -1) - 2 * s(0, -1) - s(1, -1) + s(-1, 1) + 2 * s(0, 1) + s(1, 1);
    return { mag: Math.hypot(gx, gy), ang: Math.atan2(gy, gx) };
  };

  type Candidate = LogoTarget & { weight: number };
  const candidates: Candidate[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = (col + 0.5) * cellWidth;
      const cy = (row + 0.5) * cellHeight;

      let inside = false;
      let bestAlpha = 0;
      for (const [dx, dy] of subOffsets) {
        const sx = cx + dx * cellWidth * 0.5;
        const sy = cy + dy * cellHeight * 0.5;
        const u = (sx - mx) / mw;
        const v = (sy - my) / mh;
        if (u < 0 || u > 1 || v < 0 || v > 1) continue;
        const mxSample = u * (iw - 1);
        const mySample = v * (ih - 1);
        const value = sampleChannel(data, iw, ih, mxSample, mySample, channel);
        if (value >= alphaThreshold) {
          inside = true;
          if (value > bestAlpha) bestAlpha = value;
        }
      }
      if (!inside) continue;

      // Gradient at the cell centre (in mask pixel space).
      const uc = (cx - mx) / mw;
      const vc = (cy - my) / mh;
      let grad = { mag: 0, ang: 0 };
      if (uc >= 0 && uc <= 1 && vc >= 0 && vc <= 1) {
        grad = sobel(uc * (iw - 1), vc * (ih - 1));
      }

      candidates.push({
        x: cx,
        y: cy,
        col,
        row,
        alpha: bestAlpha / 255,
        weight: bestAlpha / 255,
        gradient: Math.min(1, grad.mag),
        gradAngle: grad.ang,
      });
    }
  }

  if (candidates.length === 0) {
    return { targets: [], maskRect, channel, threshold: alphaThreshold };
  }

  // Deterministic shuffle for tie-breaking.
  const rand = createRng(seed);
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = candidates[i]!;
    candidates[i] = candidates[j]!;
    candidates[j] = tmp;
  }
  // Prefer stronger mask alpha, but keep deterministic order after shuffle.
  candidates.sort((a, b) => b.weight - a.weight);

  const minDist2 = minDistanceCells * minDistanceCells;
  const selected: LogoTarget[] = [];
  const occupied = new Set<string>();

  // Greedy Poisson-like selection over grid cells.
  for (const c of candidates) {
    if (selected.length >= maxTargets) break;
    const key = `${c.col}:${c.row}`;
    if (occupied.has(key)) continue;
    let ok = true;
    for (let i = selected.length - 1; i >= 0; i--) {
      const s = selected[i]!;
      const dx = c.col - s.col;
      const dy = c.row - s.row;
      if (dx * dx + dy * dy < minDist2) {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    selected.push({ x: c.x, y: c.y, col: c.col, row: c.row, alpha: c.alpha, gradient: c.gradient, gradAngle: c.gradAngle });
    occupied.add(key);
  }

  // ---- Gap-filling interleaved layer ----
  // For each selected cell whose 4 grid neighbours are also covered, add a
  // smaller glyph at the corner between them. This lands exactly in the
  // whitespace between the monospace lattice and reads as a compact, filled
  // texture without bolding or overlapping the primary glyphs.
  const selectedKeys = new Set(selected.map((s) => `${s.col}:${s.row}`));
  const fillerCornerKeys = new Set<string>();
  const fillers: LogoTarget[] = [];
  const fillerBudget = Math.max(0, maxTargets - selected.length);
  for (const s of selected) {
    if (fillers.length >= fillerBudget) break;
    // Place a filler at the bottom-right corner of this cell, but only if all
    // four cells sharing that corner are covered (so it never bleeds outside).
    const n00 = selectedKeys.has(`${s.col}:${s.row}`);
    const n10 = selectedKeys.has(`${s.col + 1}:${s.row}`);
    const n01 = selectedKeys.has(`${s.col}:${s.row + 1}`);
    const n11 = selectedKeys.has(`${s.col + 1}:${s.row + 1}`);
    if (!(n00 && n10 && n01 && n11)) continue;
    const cornerKey = `c:${s.col + 1}:${s.row + 1}`;
    if (fillerCornerKeys.has(cornerKey)) continue;
    fillerCornerKeys.add(cornerKey);
    fillers.push({
      x: (s.col + 1) * cellWidth,
      y: (s.row + 1) * cellHeight,
      col: s.col,
      row: s.row,
      alpha: (s.alpha || 1) * 0.36,
      size: 0.60,
      gradient: 0,
      gradAngle: 0,
    });
  }
  for (const f of fillers) {
    if (selected.length >= maxTargets) break;
    selected.push(f);
  }

  // If we were too strict, fill remaining slots with best remaining candidates.
  if (selected.length < Math.min(maxTargets, candidates.length)) {
    for (const c of candidates) {
      if (selected.length >= maxTargets) break;
      const key = `${c.col}:${c.row}`;
      if (occupied.has(key)) continue;
      let tooClose = false;
      for (let i = selected.length - 1; i >= 0; i--) {
        const s = selected[i]!;
        const dx = c.col - s.col;
        const dy = c.row - s.row;
        if (dx * dx + dy * dy < 0.75) { // only prevent exact overlap
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;
      selected.push({ x: c.x, y: c.y, col: c.col, row: c.row, alpha: c.alpha, gradient: c.gradient, gradAngle: c.gradAngle });
      occupied.add(key);
    }
  }

  // Stable output order for deterministic rendering/assignment.
  selected.sort((a, b) => (a.row - b.row) || (a.col - b.col) || (a.y - b.y) || (a.x - b.x));

  return { targets: selected, maskRect, channel, threshold: alphaThreshold };
}
