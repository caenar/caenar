"use client";

import * as React from "react";
import {
  cancelFrame,
  frame,
  MotionConfig,
  useInView,
  useReducedMotion,
} from "motion/react";

import { cn } from "@/lib/utils";
import { generateLogoTargets } from "@/components/ui/glyph-formation/targets";
import {
  createFormation,
  completeFormation,
  updateFormation,
} from "@/components/ui/glyph-formation/simulation";
import { createFormationRenderer } from "@/components/ui/glyph-formation/renderer";
import type { FormationState } from "@/components/ui/glyph-formation/types";

function usePageVisible() {
  const [visible, setVisible] = React.useState(
    typeof document === "undefined" ? true : !document.hidden,
  );

  React.useEffect(() => {
    const onChange = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);

  return visible;
}

const CHARACTERS = ".:-=+*#%/\\\\|";
// ASCII ramp used by the logo formation (luminance ramp + contour glyphs).
const FORMATION_CHARS = " .:-=+*#%/\\\\|";
const FORMATION_RAMP_LENGTH = 9;

const VERTEX = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT = `
precision highp float;
uniform sampler2D atlas;
uniform vec2 size;
uniform vec2 cell;
uniform float dpr;
uniform float count;
uniform float time;
uniform float rest;
uniform float haze;
uniform vec3 color;
uniform sampler2D logoMask;
uniform vec4 logoMaskRect;
uniform float hasLogoMask;
uniform float intro;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float smoothNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float clouds(vec2 p) {
  float v = 0.0;
  float a = 0.55;
  for (int i = 0; i < 4; i++) {
    v += a * smoothNoise(p);
    p = p * 2.02 + vec2(17.1, 9.4);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 pixel = vec2(gl_FragCoord.x, size.y - gl_FragCoord.y);
  vec2 index = floor(pixel / cell);
  vec2 point = (index + 0.5) * cell / dpr;

  vec2 center = size / dpr * 0.5;
  vec2 p = point - center;
  float r = length(p);
  float angle = time * 0.035 + r * 0.0008;
  float ca = cos(angle);
  float sa = sin(angle);
  vec2 vortex = vec2(ca * p.x - sa * p.y, sa * p.x + ca * p.y);
  mat2 turn = mat2(0.82, 0.57, -0.57, 0.82);
  vec2 q = turn * vortex;
  float blob = smoothNoise(vec2(q.x / 140.0, q.y / 80.0) + vec2(time * 0.015, 0.0)) * 0.62
    + smoothNoise(vec2(q.x / 62.0, q.y / 36.0) + vec2(3.7, time * 0.02)) * 0.38;
  float grain = smoothNoise(vec2(q.x / 30.0, q.y / 14.0) + vec2(time * 0.05, 7.3));
  float cloud = blob * (0.82 + 0.24 * grain);
  float mask = pow(smoothstep(0.47, 0.84, cloud), 2.6);

  vec2 sLocal = fract(pixel / cell);
  vec2 sIndex = floor(pixel / cell);
  float seed = hash(sIndex);
  float epoch = floor(time * 0.08 * (0.4 + seed) + seed * 97.0);
  float character = floor(hash(sIndex + epoch * 0.137) * count);
  float ink = pow(texture2D(atlas, vec2((character + sLocal.x) / count, sLocal.y)).a, 1.7);

  float yNorm = pixel.y / size.y;
  float scanEdge = intro * 1.25 - 0.1;
  float reveal = 1.0 - smoothstep(scanEdge - 0.1, scanEdge, yNorm);
  float scanBand = exp(-pow((yNorm - scanEdge) / 0.018, 2.0)) * smoothstep(0.0, 0.1, intro) * (1.0 - smoothstep(0.9, 1.0, intro));

  float hazeFade = smoothstep(0.0, 1.0, time / 2.0);
  float grey = ink * clamp(rest * intro + haze * hazeFade * mask, 0.0, 1.0);
  grey = grey * reveal + ink * scanBand * 0.18;
  gl_FragColor = vec4(color * grey, grey);
}
`;

type GlyphBackgroundProps = React.ComponentProps<"div"> & {
  glowColor?: string;
  fontSize?: number;
  maskSrc?: string;
  /** Vignette overlay strength over the glyph field, 0 = off. */
  vignette?: number;
};

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

function toRgb(color: string): [number, number, number] {
  const probe = document.createElement("canvas").getContext("2d");
  if (!probe) return [0.9, 0.9, 0.9];
  probe.fillStyle = color;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  return [r! / 255, g! / 255, b! / 255];
}

function drawAtlas(cellWidth: number, cellHeight: number, font: string) {
  const atlas = document.createElement("canvas");
  atlas.width = Math.ceil(cellWidth * CHARACTERS.length);
  atlas.height = Math.ceil(cellHeight);
  const context = atlas.getContext("2d")!;
  context.font = font;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "#fff";
  context.strokeStyle = "#fff";
  const strokeW = Math.max(0.27, (parseInt(font, 10) || 14) * 0.027);
  context.lineWidth = strokeW;
  for (let i = 0; i < CHARACTERS.length; i++) {
    context.strokeText(CHARACTERS[i]!, (i + 0.5) * cellWidth, cellHeight / 2);
    context.fillText(CHARACTERS[i]!, (i + 0.5) * cellWidth, cellHeight / 2);
  }
  return atlas;
}

type Frame = {
  width: number;
  height: number;
  dpr: number;
  cell: [number, number];
  time: number;
  color: [number, number, number];
  hasLogoMask: number;
  logoMaskRect: [number, number, number, number];
  intro: number;
};

function createRenderer(gl: WebGLRenderingContext) {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const logoTexture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, logoTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 0, 0]),
  );
  gl.activeTexture(gl.TEXTURE0);

  const at = (name: string) => gl.getUniformLocation(program, name);
  const uniforms = {
    atlas: at("atlas"),
    size: at("size"),
    cell: at("cell"),
    dpr: at("dpr"),
    count: at("count"),
    time: at("time"),
    rest: at("rest"),
    haze: at("haze"),
    color: at("color"),
    logoMask: at("logoMask"),
    hasLogoMask: at("hasLogoMask"),
    logoMaskRect: at("logoMaskRect"),
    intro: at("intro"),
  };
  gl.uniform1i(uniforms.atlas, 0);
  gl.uniform1i(uniforms.logoMask, 1);
  gl.uniform1f(uniforms.count, CHARACTERS.length);
  gl.uniform1f(uniforms.rest, 0.03);
  gl.uniform1f(uniforms.haze, 0.22);
  gl.uniform1f(uniforms.intro, 0);
  gl.uniform1f(uniforms.hasLogoMask, 0);
  gl.uniform4f(uniforms.logoMaskRect, 0, 0, 1, 1);

  return {
    atlas(image: HTMLCanvasElement) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image,
      );
    },
    logo(image: HTMLImageElement) {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, logoTexture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image,
      );
      gl.activeTexture(gl.TEXTURE0);
    },
    draw(frame: Frame) {
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      gl.viewport(0, 0, frame.width, frame.height);
      gl.uniform2f(uniforms.size, frame.width, frame.height);
      gl.uniform2f(uniforms.cell, ...frame.cell);
      gl.uniform1f(uniforms.dpr, frame.dpr);
      gl.uniform1f(uniforms.time, frame.time);
      gl.uniform3f(uniforms.color, ...frame.color);
      gl.uniform1f(uniforms.hasLogoMask, frame.hasLogoMask);
      gl.uniform4f(uniforms.logoMaskRect, ...frame.logoMaskRect);
      gl.uniform1f(uniforms.intro, frame.intro);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
  };
}

function GlyphBackgroundContent({
  ref,
  glowColor,
  fontSize = 14,
  maskSrc,
  vignette = 0.6,
  className,
  children,
  ...props
}: GlyphBackgroundProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

  const inView = useInView(containerRef);
  const pageVisible = usePageVisible();
  const reduce = useReducedMotion() ?? false;
  const reduceRef = React.useRef(reduce);
  reduceRef.current = reduce;
  const playing = inView && pageVisible && !reduce;

  const drawRef = React.useRef<(time: number, looping?: boolean) => void>(
    () => { },
  );
  const timeRef = React.useRef(0);
  const resizeRef = React.useRef(() => { });
  const rendererRef = React.useRef<ReturnType<typeof createRenderer> | null>(
    null,
  );
  const maskImageRef = React.useRef<HTMLImageElement | null>(null);

  const options = { glowColor, fontSize };
  const optionsRef = React.useRef(options);
  React.useLayoutEffect(() => {
    optionsRef.current = options;
  });

  const formationRef = React.useRef<FormationState | null>(null);
  const formationRendererRef = React.useRef<ReturnType<
    typeof createFormationRenderer
  > | null>(null);
  const formationKeyRef = React.useRef<string>("");
  const introPlayedRef = React.useRef(false);
  const formationSizeRef = React.useRef({
    width: 0,
    height: 0,
    cellW: 8,
    cellH: 13,
  });
  const rebuildFormationRef = React.useRef<() => void>(() => { });
  const rebuildFormation = React.useCallback(() => {
    const mask = maskImageRef.current;
    const { width, height, cellW, cellH } = formationSizeRef.current;
    if (!mask || width === 0 || height === 0 || cellW === 0 || cellH === 0) {
      formationRef.current = null;
      formationKeyRef.current = "";
      return;
    }
    const key = `${mask.src}|${width}x${height}|${cellW}x${cellH}`;
    if (formationKeyRef.current === key && formationRef.current) return;
    const { targets } = generateLogoTargets({
      mask,
      canvasWidth: width,
      canvasHeight: height,
      cellWidth: cellW,
      cellHeight: cellH,
      minDistanceCells: 0.85,
      maxTargets: 12000,
      seed: 1337,
      alphaThreshold: 8,
    });
    const prev = formationRef.current;
    const formation = createFormation(
      targets,
      width,
      height,
      FORMATION_CHARS.length,
      {
        maxGlyphs: 12000,
        minDistanceCells: 0.85,
        rampLength: FORMATION_RAMP_LENGTH,
        scatterRadius: 100,
        travelMs: 2350,
        travelJitterMs: 1000,
        staggerMs: 2350,
        trailLength: 10,
      },
      2026,
    );
    if (reduce || introPlayedRef.current || prev) {
      completeFormation(formation);
      introPlayedRef.current = true;
    }
    formationRef.current = formation;
    formationKeyRef.current = key;
  }, [reduce]);
  rebuildFormationRef.current = rebuildFormation;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const gl = canvas.getContext("webgl", {
      premultipliedAlpha: true,
      preserveDrawingBuffer: true,
      antialias: false,
    });
    const renderer = gl ? createRenderer(gl) : null;
    if (!renderer || !gl) return;
    rendererRef.current = renderer;
    if (maskImageRef.current) renderer.logo(maskImageRef.current);
    const formationRenderer = createFormationRenderer(gl);
    formationRendererRef.current = formationRenderer;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let cell: [number, number] = [7, 13];
    let frames = 0;
    let colorKey = "";
    let color: [number, number, number] = [0.9, 0.9, 0.9];

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const { fontSize } = optionsRef.current;
      const font = `${fontSize * dpr}px "Google Sans Code", ui-monospace, SFMono-Regular, Consolas, monospace`;
      const measure = document.createElement("canvas").getContext("2d")!;
      measure.font = font;
      cell = [
        Math.round(measure.measureText("0").width),
        Math.round(fontSize * 1.38 * dpr),
      ];
      const atlas = drawAtlas(cell[0], cell[1], font);
      renderer.atlas(atlas);
      const asciiCanvas = document.createElement("canvas");
      asciiCanvas.width = Math.ceil(cell[0] * FORMATION_CHARS.length);
      asciiCanvas.height = Math.ceil(cell[1]);
      const actx = asciiCanvas.getContext("2d")!;
      actx.font = font;
      actx.textAlign = "center";
      actx.textBaseline = "middle";
      actx.fillStyle = "#fff";
      actx.strokeStyle = "#fff";
      const asciiStroke = Math.max(0.27, (parseInt(font, 10) || 14) * 0.027);
      actx.lineWidth = asciiStroke;
      for (let i = 0; i < FORMATION_CHARS.length; i++) {
        actx.strokeText(FORMATION_CHARS[i]!, (i + 0.5) * cell[0], cell[1] / 2);
        actx.fillText(FORMATION_CHARS[i]!, (i + 0.5) * cell[0], cell[1] / 2);
      }
      formationRenderer?.setAtlas(asciiCanvas);
      formationSizeRef.current = {
        width: canvas.width,
        height: canvas.height,
        cellW: cell[0],
        cellH: cell[1],
      };
      rebuildFormationRef.current();
    };

    const draw = (time: number, looping = false) => {
      if (width === 0 || height === 0) return;
      const { glowColor } = optionsRef.current;
      if (!looping || frames++ % 30 === 0) {
        const text = getComputedStyle(container).color || "#e5e5e5";
        const key = glowColor ?? text;
        if (key !== colorKey) {
          colorKey = key;
          color = toRgb(key);
        }
      }

      const seconds = time / 1000;
      const maskImage = maskImageRef.current;
      let hasLogoMask = 0;
      let logoMaskRect: [number, number, number, number] = [0, 0, 1, 1];
      if (maskImage) {
        const scale = Math.max(
          canvas.width / maskImage.naturalWidth,
          canvas.height / maskImage.naturalHeight,
        );
        const mw = maskImage.naturalWidth * scale;
        const mh = maskImage.naturalHeight * scale;
        const mx = (canvas.width - mw) / 2;
        const my = canvas.height - mh; // bottom anchored
        logoMaskRect = [mx, my, mw, mh];
        hasLogoMask = 1;
      }

      renderer.draw({
        width: canvas.width,
        height: canvas.height,
        dpr,
        cell,
        time: seconds,
        color,
        hasLogoMask,
        logoMaskRect,
        intro: reduceRef.current ? 1 : Math.min(1, timeRef.current / 1800),
      });

      const formation = formationRef.current;
      const formationRenderer = formationRendererRef.current;
      if (formation && formationRenderer) {
        const scrollT = Math.min(
          1,
          window.scrollY / Math.max(1, window.innerHeight * 0.3),
        );
        const revealProgress =
          reduceRef.current || introPlayedRef.current
            ? 1
            : Math.min(1, formation.elapsed / 2200);
        formationRenderer.render(formation, {
          width: canvas.width,
          height: canvas.height,
          cellWidth: cell[0],
          cellHeight: cell[1],
          color,
          count: FORMATION_CHARS.length,
          opacity: 1 - scrollT * 0.85,
          revealProgress,
        });
      }
    };

    drawRef.current = draw;
    resizeRef.current = resize;
    resize();
    draw(timeRef.current);
    const observer = new ResizeObserver(() => {
      resize();
      draw(timeRef.current);
    });
    observer.observe(container);
    return () => {
      observer.disconnect();
      drawRef.current = () => { };
      resizeRef.current = () => { };
      formationRendererRef.current?.dispose();
      formationRendererRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    resizeRef.current();
    drawRef.current(timeRef.current);
  }, [fontSize]);

  React.useEffect(() => {
    drawRef.current(timeRef.current);
  }, [glowColor]);

  React.useEffect(() => {
    if (!playing) return;
    const tick = ({ delta }: { delta: number }) => {
      const dt = Math.min(delta, 64);
      timeRef.current += dt;
      const formation = formationRef.current;
      if (formation) {
        updateFormation(formation, dt);
        if (formation.phase === "complete") introPlayedRef.current = true;
      }
      drawRef.current(timeRef.current, true);
    };
    frame.render(tick, true);
    return () => cancelFrame(tick);
  }, [playing]);

  React.useEffect(() => {
    if (!maskSrc) {
      maskImageRef.current = null;
      formationRef.current = null;
      formationKeyRef.current = "";
      drawRef.current(timeRef.current);
      return;
    }

    const img = new Image();
    img.decoding = "async";
    img.crossOrigin = "anonymous";
    img.src = maskSrc;
    img.onload = () => {
      maskImageRef.current = img;
      rendererRef.current?.logo(img);
      rebuildFormationRef.current();
      drawRef.current(timeRef.current);
    };
    img.onerror = () => {
      maskImageRef.current = null;
      formationRef.current = null;
      formationKeyRef.current = "";
      drawRef.current(timeRef.current);
    };
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [maskSrc]);

  return (
    <div
      ref={containerRef}
      data-slot="glyph-background"
      className={cn("relative size-full overflow-hidden", className)}
      {...props}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      />
      {/* Vignette: fades the glyph field (and the logo formation) into the
          page background at the edges. Masked so the center stays clear. */}
      {vignette > 0 && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-background-100"
          style={{
            maskImage:
              "radial-gradient(ellipse at center, transparent 0%, transparent 40%, black 90%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, transparent 0%, transparent 40%, black 90%)",
            opacity: vignette,
          }}
        />
      )}
      {children}
    </div>
  );
}

function GlyphBackground(props: GlyphBackgroundProps) {
  return (
    <MotionConfig reducedMotion="user">
      <GlyphBackgroundContent {...props} />
    </MotionConfig>
  );
}

export { GlyphBackground, type GlyphBackgroundProps };

export default GlyphBackground;
