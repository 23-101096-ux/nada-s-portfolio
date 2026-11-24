import { useEffect, useRef, useState } from "react";

/*
  PARTICLE PORTRAIT
  Turns your cut-out photo into ~120,000 tiny particles (WebGL).
  - When `play` becomes true the particles swirl in from a cloud and form the photo.
  - Moving the cursor over it pushes the particles apart in a swirl;
    they drift back and reform on their own.
  - If WebGL is missing or the person prefers reduced motion, the normal photo is shown.
*/

const MAX_PARTICLES = 120000;

// where YOU sit inside the hero. These use the real outline of the cut-out,
// so empty space inside nada.png does not matter.
const TOP_GAP = 0.13;      // empty space above the head, as a share of the hero height (desktop)
const TOP_GAP_PHONE = 0.22;
const CENTER_X = 0.5;      // 0.5 = middle of the screen. Lower = further left, higher = further right

/* ---------------- shaders ---------------- */
const VERT = `
attribute vec2 aPos;   // current position (css px)
attribute vec2 aHome;  // where this particle belongs
attribute vec3 aCol;   // colour sampled from the photo
attribute float aPh;   // random phase
uniform vec2 uRes;     // canvas size (css px)
uniform float uSize;   // particle size (device px)
uniform float uTime;
uniform float uR;      // distance at which a particle counts as "scattered"
uniform float uShow;   // 0 → 1 fade in
varying vec3 vCol;
varying float vA;
void main() {
  // tiny idle shimmer so the portrait feels alive
  vec2 p = aPos + vec2(sin(uTime * 1.3 + aPh * 6.283), cos(uTime * 1.1 + aPh * 9.1)) * 0.35;
  float d = length(aPos - aHome);
  float k = smoothstep(0.0, uR * 1.2, d);       // 0 = at home, 1 = far away
  gl_Position = vec4(p.x / uRes.x * 2.0 - 1.0, 1.0 - p.y / uRes.y * 2.0, 0.0, 1.0);
  gl_PointSize = uSize * (1.0 - 0.5 * k);       // scattered particles shrink to specks
  vCol = mix(aCol, vec3(1.0), k * 0.9);         // …and glow white
  vA = (1.0 - 0.6 * k) * uShow;
}`;

const FRAG = `
precision mediump float;
varying vec3 vCol;
varying float vA;
void main() { gl_FragColor = vec4(vCol * vA, vA); }`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}

/* ---------------- sample the photo into particles ---------------- */
function samplePortrait(img) {
  const nh = img.naturalHeight, nw = img.naturalWidth;
  const sc = Math.min(1, 1500 / nh);
  const w = Math.max(1, Math.round(nw * sc));
  const h = Math.max(1, Math.round(nh * sc));
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data;

  let opaque = 0;
  for (let i = 3; i < d.length; i += 4) if (d[i] > 110) opaque++;
  const g = Math.max(1, Math.sqrt(opaque / MAX_PARTICLES)); // block size in px

  const U = [], V = [], C = [];
  for (let gy = 0; gy * g < h; gy++) {
    for (let gx = 0; gx * g < w; gx++) {
      const x0 = Math.floor(gx * g), y0 = Math.floor(gy * g);
      const x1 = Math.min(w, Math.max(x0 + 1, Math.floor((gx + 1) * g)));
      const y1 = Math.min(h, Math.max(y0 + 1, Math.floor((gy + 1) * g)));
      let r = 0, gg = 0, b = 0, a = 0, n = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const o = (y * w + x) * 4, al = d[o + 3];
          r += d[o] * al; gg += d[o + 1] * al; b += d[o + 2] * al; a += al; n++;
        }
      }
      if (a / n < 100) continue; // transparent cell
      // random spot inside the cell, so it looks like dust and not a grid
      U.push((x0 + Math.random() * (x1 - x0)) / w);
      V.push((y0 + Math.random() * (y1 - y0)) / h);
      C.push(r / a, gg / a, b / a);
    }
  }
  const N = U.length;
  // outline of the figure inside the image (0–1)
  let bx0 = 1, bx1 = 0, by0 = 1, by1 = 0;
  for (let i = 0; i < N; i++) {
    if (U[i] < bx0) bx0 = U[i]; if (U[i] > bx1) bx1 = U[i];
    if (V[i] < by0) by0 = V[i]; if (V[i] > by1) by1 = V[i];
  }
  const ph = new Float32Array(N);
  for (let i = 0; i < N; i++) ph[i] = Math.random();
  return {
    N, aspect: nw / nh, cellRel: g / h, bx0, bx1, by0, by1,
    u: Float32Array.from(U), v: Float32Array.from(V),
    col: Uint8Array.from(C), ph,
  };
}

const smooth = (t) => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };

export default function ParticlePortrait({ src, alt = "", play = true }) {
  const canvasRef = useRef(null);
  const playRef = useRef(play);
  const [fallback, setFallback] = useState(false);
  playRef.current = play;

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    if (reduced || !canvas) { setFallback(true); return; }

    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) { setFallback(true); return; }

    let alive = true;
    let raf = 0;
    const cleanups = [];

    const img = new Image();
    img.decoding = "async";
    img.src = src;
    img.onerror = () => alive && setFallback(true);
    img.onload = () => {
      if (!alive) return;
      let S;
      try { S = samplePortrait(img); } catch (e) { console.warn("[ParticlePortrait]", e); setFallback(true); return; }
      const N = S.N;

      /* ---- GL setup ---- */
      let prog;
      try {
        prog = gl.createProgram();
        gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
        gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
      } catch (e) { console.warn("[ParticlePortrait]", e); setFallback(true); return; }
      gl.useProgram(prog);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      const loc = (n) => gl.getAttribLocation(prog, n);
      const uni = (n) => gl.getUniformLocation(prog, n);
      const mkBuf = (data, usage) => {
        const b = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, b);
        gl.bufferData(gl.ARRAY_BUFFER, data, usage);
        return b;
      };

      // CPU-side state
      const pos = new Float32Array(N * 2);
      const home = new Float32Array(N * 2);
      const vel = new Float32Array(N * 2);
      const kSpring = new Float32Array(N);  // each particle returns at its own speed
      const delay = new Float32Array(N);    // when it joins the intro
      for (let i = 0; i < N; i++) {
        kSpring[i] = 9 + Math.random() * 13;
        delay[i] = S.v[i] * 0.6 + Math.random() * 0.7;
      }

      const bufPos = mkBuf(pos, gl.DYNAMIC_DRAW);
      const bufHome = mkBuf(home, gl.DYNAMIC_DRAW);
      const bufCol = mkBuf(S.col, gl.STATIC_DRAW);
      const bufPh = mkBuf(S.ph, gl.STATIC_DRAW);

      const bind = (buf, name, size, type, norm) => {
        const l = loc(name);
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.enableVertexAttribArray(l);
        gl.vertexAttribPointer(l, size, type, !!norm, 0, 0);
      };
      const bindAll = () => {
        bind(bufPos, "aPos", 2, gl.FLOAT);
        bind(bufHome, "aHome", 2, gl.FLOAT);
        bind(bufCol, "aCol", 3, gl.UNSIGNED_BYTE, true);
        bind(bufPh, "aPh", 1, gl.FLOAT);
      };
      bindAll();
      const uRes = uni("uRes"), uSize = uni("uSize"), uTime = uni("uTime"), uR = uni("uR"), uShow = uni("uShow");

      /* ---- layout: where the photo sits inside the hero ---- */
      let W = 1, H = 1, dpr = 1, R = 150, sc = 1, introStart = -1;
      const layout = () => {
        const parent = canvas.parentElement;
        W = parent.clientWidth || 1;
        H = parent.clientHeight || 1;
        dpr = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        gl.viewport(0, 0, canvas.width, canvas.height);

        const phone = W <= 700;
        // the figure runs from TOP_GAP down to the bottom edge of the hero
        const gap = phone ? TOP_GAP_PHONE : TOP_GAP;
        const figH = H * (1 - gap);
        const imgH = figH / Math.max(0.05, S.by1 - S.by0);   // size of the whole image file
        const imgW = imgH * S.aspect;
        const left = W * CENTER_X - ((S.bx0 + S.bx1) / 2) * imgW; // centre the figure, not the file
        const top = H * gap - S.by0 * imgH;
        for (let i = 0; i < N; i++) {
          home[i * 2] = left + S.u[i] * imgW;
          home[i * 2 + 1] = top + S.v[i] * imgH;
        }
        sc = H / 800;
        R = Math.max(120, figH * 0.24);
        const cell = S.cellRel * imgH;
        gl.uniform1f(uSize, Math.max(1.6, cell * 1.5) * dpr);
        gl.uniform1f(uR, R);
        gl.uniform2f(uRes, W, H);
        gl.bindBuffer(gl.ARRAY_BUFFER, bufHome);
        gl.bufferData(gl.ARRAY_BUFFER, home, gl.DYNAMIC_DRAW);
        scatter(introStart < 0 ? true : false);
      };

      // put every particle in a big swirling cloud around the photo (intro start)
      // or straight on its home spot (after a resize, once the intro has played)
      const scatter = (cloud) => {
        for (let i = 0; i < N; i++) {
          if (cloud) {
            const a = Math.random() * Math.PI * 2;
            const r = (0.15 + Math.random() * 0.7) * H * 0.7;
            pos[i * 2] = home[i * 2] + Math.cos(a) * r;
            pos[i * 2 + 1] = home[i * 2 + 1] + Math.sin(a) * r * 0.7;
          } else {
            pos[i * 2] = home[i * 2];
            pos[i * 2 + 1] = home[i * 2 + 1];
          }
          vel[i * 2] = 0; vel[i * 2 + 1] = 0;
        }
      };

      layout();
      const ro = new ResizeObserver(layout);
      ro.observe(canvas.parentElement);
      cleanups.push(() => ro.disconnect());

      /* ---- pointer ---- */
      const m = { x: -9999, y: -9999, vx: 0, vy: 0, lastX: 0, lastY: 0, lastT: 0, has: false };
      const onMove = (e) => {
        const r = canvas.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * W;
        const y = ((e.clientY - r.top) / r.height) * H;
        const t = performance.now();
        if (m.has) {
          const dt = Math.max(0.008, (t - m.lastT) / 1000);
          m.vx += ((x - m.lastX) / dt - m.vx) * 0.35;
          m.vy += ((y - m.lastY) / dt - m.vy) * 0.35;
        }
        m.x = x; m.y = y; m.lastX = x; m.lastY = y; m.lastT = t; m.has = true;
      };
      const onLeave = () => { m.x = -9999; m.y = -9999; m.has = false; m.vx = m.vy = 0; };
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("mouseleave", onLeave);
      });

      /* ---- animation loop ---- */
      let last = performance.now();
      const frame = (now) => {
        raf = requestAnimationFrame(frame);
        if (document.hidden) { last = now; return; }

        if (introStart < 0) {
          if (!playRef.current) { last = now; return; } // wait for the tiles to clear
          introStart = now;
        }
        const dt = Math.min(1 / 30, Math.max(0.001, (now - last) / 1000));
        last = now;
        const t = (now - introStart) / 1000;

        // pointer strength: gentle when still, strong when moving fast
        m.vx *= Math.exp(-5 * dt); m.vy *= Math.exp(-5 * dt);
        const speed = Math.hypot(m.vx, m.vy);
        const boost = 0.3 + 0.7 * Math.min(1, speed / (900 * sc));
        const push = 6500 * sc * boost;
        const swirl = 5500 * sc * boost;
        const follow = 1.9 * boost;
        const flow = 900 * sc;
        const damp = Math.exp(-3.6 * dt);
        const vmax = 2600 * sc;
        const R2 = R * R;
        const mx = m.x, my = m.y, mvx = m.vx, mvy = m.vy;

        for (let i = 0; i < N; i++) {
          const ix = i * 2, iy = ix + 1;
          const x = pos[ix], y = pos[iy];
          const hx = home[ix], hy = home[iy];
          let ax = 0, ay = 0;

          const dx = x - mx, dy = y - my;
          const d2 = dx * dx + dy * dy;

          // resting and far from the cursor: nothing to compute
          if (t > 2.6 && d2 >= R2) {
            const rx = x - hx, ry = y - hy;
            if (rx * rx + ry * ry < 0.04 && vel[ix] * vel[ix] + vel[iy] * vel[iy] < 0.04) {
              pos[ix] = hx; pos[iy] = hy; vel[ix] = 0; vel[iy] = 0;
              continue;
            }
          }

          // cursor: push away + swirl around + drag along
          if (d2 < R2) {
            const d = Math.sqrt(d2) + 0.001;
            let f = 1 - d / R; f *= f;
            const nx = dx / d, ny = dy / d;
            ax += (nx * push - ny * swirl) * f + mvx * follow * f;
            ay += (ny * push + nx * swirl) * f + mvy * follow * f;
          }

          // spring back home (each particle at its own pace; gated during the intro)
          const gate = smooth((t - delay[i]) / 0.7);
          const k = kSpring[i] * gate;
          ax += (hx - x) * k;
          ay += (hy - y) * k;

          // flowing swirl that only acts while a particle is away from home
          const ex = x - hx, ey = y - hy;
          const disp = Math.min(1, Math.sqrt(ex * ex + ey * ey) / (R * 1.5));
          const ph = S.ph[i] * 6.283;
          ax += Math.sin(y * 0.011 + t * 0.9 + ph) * disp * flow;
          ay += Math.cos(x * 0.011 + t * 0.7 + ph) * disp * flow;

          let vx = (vel[ix] + ax * dt) * damp;
          let vy = (vel[iy] + ay * dt) * damp;
          const sp = vx * vx + vy * vy;
          if (sp > vmax * vmax) { const s = vmax / Math.sqrt(sp); vx *= s; vy *= s; }
          vel[ix] = vx; vel[iy] = vy;
          pos[ix] = x + vx * dt;
          pos[iy] = y + vy * dt;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, bufPos);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, pos);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(uTime, now / 1000);
        gl.uniform1f(uShow, smooth(t / 0.6));
        gl.drawArrays(gl.POINTS, 0, N);
      };
      raf = requestAnimationFrame(frame);
      cleanups.push(() => cancelAnimationFrame(raf));
    };

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      cleanups.forEach((fn) => fn());
    };
  }, [src]);

  if (fallback) {
    return <img className="hero__photo" src={src} alt={alt} />;
  }
  return <canvas ref={canvasRef} className="hero__particles" role="img" aria-label={alt} />;
}