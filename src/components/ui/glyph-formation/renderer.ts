import type { FormationState } from "./types";

type FormationRenderer = {
  setAtlas(image: HTMLCanvasElement): void;
  render(state: FormationState, opts: {
    width: number;
    height: number;
    cellWidth: number;
    cellHeight: number;
    color: [number, number, number];
    count: number;
    opacity?: number;
    /** 0-1 bottom-to-top reveal progress; 1 = fully revealed. */
    revealProgress?: number;
  }): void;
  dispose(): void;
};

const VERT = `
attribute vec2 a_pos;
attribute vec2 a_uv;
attribute float a_alpha;
attribute float a_glow;
uniform vec2 u_size;
varying vec2 v_uv;
varying float v_alpha;
varying float v_glow;
void main() {
  vec2 clip = vec2((a_pos.x / u_size.x) * 2.0 - 1.0, 1.0 - (a_pos.y / u_size.y) * 2.0);
  gl_Position = vec4(clip, 0.0, 1.0);
  v_uv = a_uv;
  v_alpha = a_alpha;
  v_glow = a_glow;
}
`;

const FRAG = `
precision mediump float;
uniform sampler2D u_atlas;
uniform vec3 u_color;
uniform float u_opacity;
varying vec2 v_uv;
varying float v_alpha;
varying float v_glow;
void main() {
  float ink = texture2D(u_atlas, v_uv).a;
  if (ink <= 0.01 || v_alpha <= 0.01) discard;
  float glow = v_glow;
  vec3 col = u_color * (0.85 + 0.5 * glow);
  float alpha = clamp(ink * v_alpha * u_opacity * (0.9 + 0.6 * glow), 0.0, 1.0);
  gl_FragColor = vec4(col * alpha, alpha);
}
`;

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0 || 1)));
  return t * t * (3 - 2 * t);
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function createFormationRenderer(gl: WebGLRenderingContext): FormationRenderer | null {
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  const aPos = gl.getAttribLocation(program, "a_pos");
  const aUv = gl.getAttribLocation(program, "a_uv");
  const aAlpha = gl.getAttribLocation(program, "a_alpha");
  const aGlow = gl.getAttribLocation(program, "a_glow");
  const uSize = gl.getUniformLocation(program, "u_size");
  const uAtlas = gl.getUniformLocation(program, "u_atlas");
  const uColor = gl.getUniformLocation(program, "u_color");
  const uOpacity = gl.getUniformLocation(program, "u_opacity");

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  // Each vertex: x,y,u,v,alpha,glow = 6 floats
  const stride = 6 * 4;

  const atlasTexture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));

  // Preallocate; grow as needed.
  let data = new Float32Array(6 * 6 * 1024); // 1024 quads initial

  function ensure(capFloats: number) {
    if (data.length >= capFloats) return;
    let next = data.length;
    while (next < capFloats) next *= 2;
    data = new Float32Array(next);
  }

  function pushQuad(
    out: Float32Array,
    o: number,
    x0: number, y0: number, x1: number, y1: number,
    u0: number, v0: number, u1: number, v1: number,
    alpha: number, glow: number,
  ) {
    // two triangles: 0-1-2, 2-1-3
    // v0 top-left, v1 top-right, v2 bottom-left, v3 bottom-right
    const verts = [
      x0, y0, u0, v0, alpha, glow,
      x1, y0, u1, v0, alpha, glow,
      x0, y1, u0, v1, alpha, glow,
      x0, y1, u0, v1, alpha, glow,
      x1, y0, u1, v0, alpha, glow,
      x1, y1, u1, v1, alpha, glow,
    ];
    out.set(verts, o);
    return o + verts.length;
  }

  return {
    setAtlas(image: HTMLCanvasElement) {
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    },
    render(state, opts) {
      const { width, height, cellWidth, cellHeight, color, count } = opts;
      const revealProgress = opts.revealProgress ?? 1;
      // Count quads: trails + glyphs + convergence sparkle (simple)
      let quadCount = 0;
      for (const g of state.glyphs) quadCount += g.trail.length + 1;
      ensure(quadCount * 6 * 6);

      let o = 0;
      const halfW = cellWidth / 2;
      const halfH = cellHeight / 2;
      const fill = 1.0; // one glyph per cell; no forced overlap

      // Trails first (behind)
      for (const g of state.glyphs) {
        for (let i = 0; i < g.trail.length; i++) {
          const t = g.trail[i]!;
          const p = (i + 1) / g.trail.length;
          const a = t.alpha * p * 0.35;
          if (a <= 0.01) continue;
          const size = 0.35 + 0.25 * p;
          const hw = halfW * size;
          const hh = halfH * size;
          const u0 = g.charIndex / count;
          const u1 = (g.charIndex + 1) / count;
          o = pushQuad(data, o, t.x - hw, t.y - hh, t.x + hw, t.y + hh, u0, 0, u1, 1, a, 0.6);
        }
      }

      // Glyphs
      for (const g of state.glyphs) {
        if (g.alpha <= 0.01) continue;
        const fromBottom = 1 - Math.min(1, Math.max(0, g.dy / height));
        const reveal =
          revealProgress >= 1
            ? 1
            : 1 - smoothstep(revealProgress - 0.12, revealProgress, fromBottom);
        const alpha = g.alpha * reveal;
        if (alpha <= 0.01) continue;
        const ci = g.displayCharIndex ?? g.charIndex;
        const u0 = ci / count;
        const u1 = (ci + 1) / count;
        const gw = halfW * fill * g.size;
        const gh = halfH * fill * g.size;
        o = pushQuad(data, o, g.x - gw, g.y - gh, g.x + gw, g.y + gh, u0, 0, u1, 1, alpha, g.glow);
      }

      if (o === 0) return;

      gl.useProgram(program);
      gl.viewport(0, 0, width, height);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data.subarray(0, o), gl.DYNAMIC_DRAW);

      gl.enableVertexAttribArray(aPos);
      gl.enableVertexAttribArray(aUv);
      gl.enableVertexAttribArray(aAlpha);
      gl.enableVertexAttribArray(aGlow);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, stride, 0);
      gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, stride, 8);
      gl.vertexAttribPointer(aAlpha, 1, gl.FLOAT, false, stride, 16);
      gl.vertexAttribPointer(aGlow, 1, gl.FLOAT, false, stride, 20);

      gl.uniform2f(uSize, width, height);
      gl.uniform3f(uColor, color[0], color[1], color[2]);
      gl.uniform1f(uOpacity, opts.opacity ?? 1);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
      gl.uniform1i(uAtlas, 2);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.TRIANGLES, 0, o / 6);

      gl.disable(gl.BLEND);
      gl.disableVertexAttribArray(aPos);
      gl.disableVertexAttribArray(aUv);
      gl.disableVertexAttribArray(aAlpha);
      gl.disableVertexAttribArray(aGlow);
      gl.activeTexture(gl.TEXTURE0);
    },
    dispose() {
      gl.deleteBuffer(buffer);
      gl.deleteTexture(atlasTexture);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    },
  };
}
