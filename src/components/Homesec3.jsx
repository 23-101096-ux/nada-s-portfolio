import { useEffect, useState } from "react";
import "./Homesec3.css";

/*
  HOMESEC3 — featured work
  Project cards are stacked: as you scroll, each new card slides up and covers
  the previous one, leaving a small strip of it showing at the top.

  Images are found automatically by file name anywhere inside  src/assets/
  (pizzapino.png, fastlane.png, eldahan.png). Upper/lower case does not matter.
  To change what is shown, edit the PROJECTS list below, or pass `projects`.
*/
const ctx = require.context("../assets", true, /\.(png|jpe?g|webp|avif)$/i);
const ENTRIES = ctx.keys().map((k) => [k, ctx(k)]);

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const BY_NAME = {};
ENTRIES.forEach(([key, url]) => {
  const base = slug(key.split("/").pop().replace(/\.[^.]+$/, ""));
  if (!(base in BY_NAME)) BY_NAME[base] = url;
});

const PROJECTS = [
  { name: "pizzapino", title: "Pizzapino", href: "#" },
  { name: "fastlane", title: "FastLane", href: "#" },
  { name: "eldahan", title: "Eldahan", href: "#" },
];

export default function HomeSec3({
  projects = PROJECTS,
  allLabel = "All projects",
  allHref = "#",
}) {
  // card shape follows your images (width / height), so nothing gets cropped
  const [ratio, setRatio] = useState(1.6);
  useEffect(() => {
    const srcs = projects.map((p) => BY_NAME[slug(p.name)]).filter(Boolean);
    let alive = true;
    Promise.all(
      srcs.map(
        (src) =>
          new Promise((res) => {
            const im = new Image();
            im.onload = () => res(im.naturalWidth / im.naturalHeight);
            im.onerror = () => res(null);
            im.src = src;
          })
      )
    ).then((list) => {
      const r = list.filter(Boolean).sort((a, b) => a - b);
      if (alive && r.length) setRatio(Math.min(2, Math.max(1.2, r[Math.floor(r.length / 2)])));
    });
    return () => { alive = false; };
  }, [projects]);

  return (
    <section className="sec3" style={{ "--ratio": ratio, "--n": projects.length }}>
      <div className="sec3__stack">
        {projects.map((p, i) => {
          const src = BY_NAME[slug(p.name)];
          if (!src) console.warn(`[HomeSec3] no image named "${p.name}" found in src/assets`);
          return (
            <a
              className="sec3__card"
              key={p.name}
              href={p.href}
              style={{ "--i": i }}
              aria-label={`${p.title} project`}
            >
              {src ? (
                <img src={src} alt={`${p.title} project`} draggable="false" />
              ) : (
                <span className="sec3__missing">
                  Add {p.name}.png to src/assets/work
                </span>
              )}
            </a>
          );
        })}

        {/* stays pinned right under the stack, so both are on screen together */}
        <a className="sec3__all" href={allHref}>
          <span>{allLabel}</span>
          <svg className="sec3__arrow" viewBox="0 0 36 24" aria-hidden="true">
            <path
              d="M2 12 H33 M23 3 L33.5 12 L23 21"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>

    </section>
  );
}