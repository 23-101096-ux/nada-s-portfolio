import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./ProjectsCarousel.css";

/*
  PROJECTS CAROUSEL — a 3D ring of bent cards
  • drag (mouse or finger) to spin it, let go and it keeps gliding, then snaps to a card
  • it drifts slowly by itself until you touch it
  • click a side card to bring it to the front; click the front card to open it
  Images are found by file name anywhere inside src/assets (spaces / capitals do not matter).
  Edit PROJECTS below to change what shows. `href` is where the front card goes on click.
*/
const ctx = require.context("../assets", true, /\.(png|jpe?g|webp|avif)$/i);
const BY_NAME = {};
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
ctx.keys().forEach((k) => {
  const b = slug(k.split("/").pop().replace(/\.[^.]+$/, ""));
  if (!(b in BY_NAME)) BY_NAME[b] = ctx(k);
});

const PROJECTS = [
  // "name" = the file name (without .png) of the picture in src/assets/vertical-gallery
  { name: "Pizzapino Italian Pizza Case Study", title: "Pizzapino", href: "#" },
  { name: "Fastlane_ The Future of Speed", title: "FastLane", href: "#" },
  { name: "Authentic Egyptian Dining Experience", title: "Eldahan", href: "#" },
  { name: "Luxury Smartwatches on Stone", title: "Smartwatches", href: "#" },
  { name: "Gallery Still Life with Bust and Teapot", title: "Still Life", href: "#" },
  { name: "GIZA Pyramid Poster Display", title: "Giza", href: "#" },
  { name: "Cosy Evening Framed Illustration Mockup", title: "Cosy Evening", href: "#" },
  { name: "Colourful Abstract Logo Glass Sign", title: "Glass Sign", href: "#" },
  { name: "Luxury Real Estate Website Showcase", title: "Real Estate", href: "#" },
  { name: "Neon Nephthys_ The Pharaoh’s Vault", title: "Neon Nephthys", href: "#" },
  { name: "The Last Signal_ Mission Briefing-2", title: "The Last Signal", href: "#" },
  { name: "African Creative Hub Laptop Showcase", title: "African Creative Hub", href: "#" },
  { name: "Illuminated Real Estate Exhibition Booth", title: "Exhibition Booth", href: "#" },
  { name: "Luminous Blue Crystal Potion Bottle", title: "Potion Bottle", href: "#" },
];

const SLICES = 7; // each card is built from thin strips so it can bend around the ring

export default function ProjectsCarousel({
  projects = PROJECTS,
  title = "MY WORK",
  titleAr = "أعمالي",
}) {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const ringRef = useRef(null);
  const dotsRef = useRef(null);
  const items = projects.filter((p) => BY_NAME[slug(p.name)]);
  const n = items.length;

  useEffect(() => {
    const root = rootRef.current;
    const ring = ringRef.current;
    if (!root || !ring || !n) return;
    const cards = [...ring.querySelectorAll(".pc__card")];
    const step = 360 / n;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let angle = 0;        // current ring rotation (deg)
    let vel = 0;          // deg per frame while gliding
    let target = null;    // angle we are easing to (snap / click)
    let dragging = false;
    let lastX = 0;
    let moved = 0;
    let idle = 0;         // frames since last touch
    let raf = 0;
    let visible = true;

    const wrap = (a) => ((((a + 180) % 360) + 360) % 360) - 180;
    const nearestSnap = (a) => Math.round(a / step) * step;

    const frame = () => {
      raf = 0;
      if (!dragging) {
        if (target !== null) {
          angle += (target - angle) * 0.1;
          if (Math.abs(target - angle) < 0.02) { angle = target; target = null; }
        } else if (Math.abs(vel) > 0.04) {
          angle += vel;
          vel *= 0.95;
          if (Math.abs(vel) <= 0.04) { vel = 0; target = nearestSnap(angle); }
        } else if (!reduced) {
          idle++;
          if (idle > 90) angle -= 0.06; // slow drift
        }
      }

      ring.style.setProperty("--rot", `${angle}deg`);
      if (dotsRef.current) dotsRef.current.style.setProperty("--rot", `${angle}deg`);
      // dim the cards that face away
      cards.forEach((c, i) => {
        const a = Math.abs(wrap(i * step + angle));
        const front = 1 - Math.min(a, 180) / 180;
        c.style.setProperty("--b", (0.28 + 0.72 * Math.pow(front, 1.6)).toFixed(3));
        c.classList.toggle("is-front", a < step / 2);
      });
      if (visible) raf = requestAnimationFrame(frame);
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(frame); };

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }, { threshold: 0.05 });
    io.observe(root);

    const down = (e) => {
      dragging = true; moved = 0; lastX = e.clientX; vel = 0; target = null; idle = 0;
      root.setPointerCapture?.(e.pointerId);
      root.classList.add("is-drag");
    };
    const move = (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved += Math.abs(dx);
      const d = dx * (360 / Math.max(window.innerWidth, 700)) * 0.9;
      angle += d;
      vel = d;
      idle = 0;
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      root.classList.remove("is-drag");
      if (Math.abs(vel) < 0.3) { vel = 0; target = nearestSnap(angle); }
    };
    const click = (e) => {
      if (moved > 6) return; // it was a drag, not a click
      const card = e.target.closest(".pc__card");
      if (!card) return;
      const i = cards.indexOf(card);
      const a = wrap(i * step + angle);
      if (Math.abs(a) < step / 2) {
        const href = items[i].href;
        if (href && href !== "#") (href.startsWith("/") ? navigate(href) : (window.location.href = href));
      } else {
        // turn the ring the shortest way so this card ends up in front
        target = angle - a;
        vel = 0;
      }
    };
    const key = (e) => {
      if (e.key === "ArrowRight") { target = nearestSnap(angle) - step; vel = 0; }
      if (e.key === "ArrowLeft") { target = nearestSnap(angle) + step; vel = 0; }
    };

    root.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    root.addEventListener("click", click);
    root.addEventListener("keydown", key);
    start();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      root.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      root.removeEventListener("click", click);
      root.removeEventListener("keydown", key);
    };
  }, [n, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="pc" ref={rootRef} style={{ "--n": n, "--s": SLICES }} tabIndex={0} aria-label="Projects carousel">
      <h2 className="pc__title">
        <span className="pc__en">{title}</span>
        <span className="pc__ar" lang="ar" dir="rtl">{titleAr}</span>
      </h2>

      <div className="pc__scene">
        <div className="pc__floor" aria-hidden="true">
          <svg viewBox="0 0 1000 200" preserveAspectRatio="none">
            <defs>
              <radialGradient id="pcGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#d6ff32" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#d6ff32" stopOpacity="0" />
              </radialGradient>
              {/* the floor line is only visible at the two ends (the corners) and fades out toward the middle */}
              <linearGradient id="pcLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#d6ff32" stopOpacity="0.9" />
                <stop offset="28%" stopColor="#d6ff32" stopOpacity="0.25" />
                <stop offset="50%" stopColor="#d6ff32" stopOpacity="0" />
                <stop offset="72%" stopColor="#d6ff32" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#d6ff32" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <ellipse cx="500" cy="100" rx="498" ry="98" fill="url(#pcGlow)" />
            <ellipse cx="500" cy="100" rx="480" ry="86" fill="none" stroke="url(#pcLine)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="pc__dots" ref={dotsRef}><i /><i /></div>
        </div>

        <div className="pc__ring" ref={ringRef}>
          {items.map((p, i) => {
            const src = BY_NAME[slug(p.name)];
            return (
              <a
                className="pc__card"
                key={p.name}
                href={p.href}
                onClick={(e) => e.preventDefault()}
                draggable="false"
                aria-label={p.title}
                style={{ "--i": i }}
              >
                {Array.from({ length: SLICES }, (_, j) => (
                  <span
                    className="pc__slice"
                    key={j}
                    style={{ "--j": j, backgroundImage: `url("${src}")` }}
                  />
                ))}
                <i className="pc__shadow" aria-hidden="true" />
              </a>
            );
          })}
        </div>
      </div>

      <p className="pc__hint" aria-hidden="true">Drag · click a card</p>
    </section>
  );
}
