import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./Homehero.css";

/*
  TILE REVEAL  (scroll-driven)
  1. Square tiles of your work fly in: the side columns drop in from the top,
     the middle column rises from the bottom. The tile closest to the centre
     leads, the others follow it like a train.
  2. The whole grid zooms in.
  3. The tiles spread apart and slide off the screen.
  4. Your <Hero /> is left behind and starts its own animation.

  Images are loaded automatically from  src/assets/work/
  (png, jpg, jpeg, webp, avif).
  - Every image is pre-loaded first, so no tile is ever shown empty.
  - A file that cannot be read is skipped (the console says which one).
  - Every image gets a tile, starting from the tiles nearest the centre.
    If there are more tiles than images, images repeat on the far tiles.
  - Tile shape follows your images (tileAspect="auto").
*/
const ctx = require.context("../assets/work", false, /\.(png|jpe?g|webp|avif)$/i);
const SOURCES = ctx.keys().sort().map(ctx);

// load + decode one image; resolves null if it is broken
const loadImage = (src) =>
  new Promise((resolve) => {
    const im = new Image();
    im.onload = () => {
      const done = () => resolve({ src, w: im.naturalWidth, h: im.naturalHeight });
      im.decode ? im.decode().then(done, done) : done();
    };
    im.onerror = () => {
      console.warn("[HomeHero] could not load this image, it was skipped:", src);
      resolve(null);
    };
    im.src = src;
  });

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeIn = (t) => t * t * t;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const FLIGHT = 1; //      one tile's fly-in, in timeline units
const ZOOM_LENGTH = 1.5; // zoom + spread + exit, in timeline units
const LEAD_IN = 0.04; //   scroll progress before the first tile moves
const END = 0.86; //       tiles finish here; the last part of the scroll just shows the hero

export default function HomeHero({
  children, //           revealed after the tiles clear (your <Hero />)
  headline, //           optional text that stays on top of the tiles
  onReveal, //           called once, when the tiles are almost gone
  columns = 3,
  rows = 5, //           rows in the side columns (middle column has one less)
  tileSize = 0.19, //    tile width as a share of the screen width
  tileAspect = "auto", // width / height. "auto" follows your images, or use a number (1 = square, 1.5 = landscape)
  gapRatio = 0.2, //     gap between tiles, as a share of tile width
  tileRadius = 0, //     corner radius in px
  grayscale = false,
  direction = "alternate", // "alternate" | "top" | "bottom"
  stagger = 0.12, //     delay between tiles in a column
  overlap = 0.5, //      how early the zoom starts, while tiles still fly in
  zoom = 2.6, //         how much the grid grows
  spread = 0.45, //      how far tiles drift apart while zooming (in tile sizes)
  scrub = 0.1, //        seconds the motion lags behind the scroll (0 = locked)
  scrollLength = 4, //   scroll distance, in screen heights
  revealAt = 0.55, //    scroll progress (0–1) when onReveal fires
}) {
  const wrapRef = useRef(null);
  const stageRef = useRef(null);
  const innerRef = useRef(null);
  const tileRefs = useRef([]);
  const hintRef = useRef(null);
  const revealed = useRef(false);
  const target = useRef(0);
  const cur = useRef(0);
  const raf = useRef(0);
  const last = useRef(0);
  const revealCb = useRef(onReveal);
  revealCb.current = onReveal;

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [imgs, setImgs] = useState(null); // null while loading, then [{src, w, h}]

  // pre-load every image before showing the tiles
  useEffect(() => {
    let alive = true;
    Promise.all(SOURCES.map(loadImage)).then((list) => {
      if (alive) setImgs(list.filter(Boolean));
    });
    return () => { alive = false; };
  }, []);

  const reduced = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  // measure the stage
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // geometry: where every tile lives and when it moves
  const geo = useMemo(() => {
    const { w, h } = size;
    // "auto": use the typical shape of your images (clamped so tiles stay sensible)
    let aspect = tileAspect;
    if (aspect === "auto") {
      const ratios = (imgs || []).map((i) => i.w / i.h).sort((a, b) => a - b);
      aspect = ratios.length ? ratios[Math.floor(ratios.length / 2)] : 1;
      aspect = clamp(aspect, 0.75, 1.8);
    }
    // wider tiles get a little more width so they keep a similar area to square ones
    const share = (w < 700 ? tileSize * 1.6 : tileSize) * Math.sqrt(Math.max(1, aspect));
    const tw = Math.min(w * share, w * 0.3, h * 0.42 * aspect);
    const th = tw / aspect;
    const g = tw * gapRatio;
    const pw = tw + g; // column pitch
    const ph = th + g; // row pitch

    const tiles = [];
    let n = 0;
    for (let c = 0; c < columns; c++) {
      const count = rows - (c % 2); // odd columns have one row less → half-step offset
      const fromTop = direction === "top" ? true : direction === "bottom" ? false : c % 2 === 0;
      const x = (c - (columns - 1) / 2) * pw;
      for (let r = 0; r < count; r++) {
        const y = (r - (count - 1) / 2) * ph;
        // the tile nearest the centre of the screen leads its column
        const order = fromTop ? count - 1 - r : r;
        // start just outside the stage (or at its own slot if that is already outside)
        const edge = h / 2 + th / 2 + g;
        const startY = fromTop ? Math.min(y, -edge) : Math.max(y, edge);
        // direction it drifts when the grid spreads apart
        let dx = x, dy = y;
        const len = Math.hypot(dx, dy);
        if (len < 1) { dx = 0; dy = c % 2 ? 1 : -1; } else { dx /= len; dy /= len; }
        tiles.push({
          img: null,
          x, y, startY, order, dx, dy, key: n++,
        });
      }
    }

    // hand out images from the centre outwards so every image gets a visible tile
    const list = imgs || [];
    if (list.length) {
      [...tiles]
        .sort((a, b) => Math.hypot(a.x, a.y * 0.6) - Math.hypot(b.x, b.y * 0.6))
        .forEach((t, rank) => { t.img = list[rank % list.length].src; });
    }

    const maxOrder = Math.max(...tiles.map((t) => t.order));
    const flyEnd = FLIGHT + stagger * maxOrder;
    const zoomStart = Math.max(0, flyEnd - overlap);
    return {
      tw, th, tiles,
      zoomStart,
      total: zoomStart + ZOOM_LENGTH,
      exitDist: Math.hypot(w, h) * 0.55 + Math.max(tw, th) * zoom,
    };
  }, [size, imgs, columns, rows, tileSize, tileAspect, gapRatio, direction, stagger, overlap, zoom]);
  const geoRef = useRef(geo);
  geoRef.current = geo;

  // paint one frame for scroll progress p (0–1)
  const render = (p) => {
    const G = geoRef.current;
    if (!G.tw) return;
    const pp = clamp((p - LEAD_IN) / (END - LEAD_IN));
    const t = pp * G.total;
    const q = clamp((t - G.zoomStart) / ZOOM_LENGTH);
    const scale = 1 + (zoom - 1) * easeInOut(clamp(q / 0.7));
    const exit = easeIn(clamp((q - 0.3) / 0.7));
    const push = spread * Math.max(G.tw, G.th) * easeOut(clamp(q / 0.8));

    if (innerRef.current) innerRef.current.style.transform = `scale(${scale})`;

    const travel = push + G.exitDist * exit;
    const gone = exit >= 1;
    G.tiles.forEach((tile, i) => {
      const el = tileRefs.current[i];
      if (!el) return;
      const f = easeOut(clamp((t - tile.order * stagger) / FLIGHT));
      const tx = tile.x + tile.dx * travel;
      const ty = tile.startY + (tile.y - tile.startY) * f + tile.dy * travel;
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      el.style.visibility = gone ? "hidden" : "visible";
    });

    if (hintRef.current) {
      hintRef.current.style.opacity = String(1 - clamp(p / 0.04));
    }
    if (!revealed.current && p >= revealAt) {
      revealed.current = true;
      revealCb.current?.();
    }
  };
  const renderRef = useRef(render);
  renderRef.current = render;

  // re-paint when the size changes
  useLayoutEffect(() => {
    renderRef.current(cur.current);
  }, [geo]);

  useEffect(() => {
    // always start at the top so the tiles are visible on load
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    if (reduced) {
      revealCb.current?.();
      return;
    }

    const frame = (now) => {
      const dt = Math.min(0.1, (now - last.current) / 1000 || 0.016);
      last.current = now;
      const k = scrub > 0 ? 1 - Math.exp(-dt / scrub) : 1;
      cur.current += (target.current - cur.current) * k;
      if (Math.abs(target.current - cur.current) < 0.0005) cur.current = target.current;
      renderRef.current(cur.current);
      raf.current = cur.current !== target.current ? requestAnimationFrame(frame) : 0;
    };

    const onScroll = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      target.current = total > 0 ? clamp(-rect.top / total) : 0;
      if (!raf.current) {
        last.current = performance.now();
        raf.current = requestAnimationFrame(frame);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
  }, [reduced, scrub]);

  // reduced motion: skip the tiles, just show the content
  if (reduced) return <>{children}</>;

  return (
    <section
      className="tr"
      ref={wrapRef}
      style={{ height: `${(scrollLength + 1) * 100}vh` }}
    >
      <div className="tr__stage" ref={stageRef}>
        <div className="tr__content">{children}</div>

        <div className={`tr__grid ${imgs ? "is-ready" : ""}`} aria-hidden="true">
          <div className="tr__grid-inner" ref={innerRef}>
            {geo.tiles.map((t, i) => (
              <div
                key={t.key}
                className="tr__tile"
                ref={(el) => (tileRefs.current[i] = el)}
                style={{
                  width: geo.tw,
                  height: geo.th,
                  marginLeft: -geo.tw / 2,
                  marginTop: -geo.th / 2,
                  borderRadius: tileRadius,
                  filter: grayscale ? "grayscale(1)" : undefined,
                  backgroundImage: t.img ? `url("${t.img}")` : undefined,
                }}
              />
            ))}
          </div>
        </div>

        {headline && <h2 className="tr__headline">{headline}</h2>}

        <p className="tr__hint" ref={hintRef}>
          Scroll
        </p>
      </div>
    </section>
  );
}