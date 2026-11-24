import { useEffect, useRef, useState } from "react";
import "./AboutHero.css";

/*
  ABOUT HERO
  - Put your picture in  src/assets/  with a name that contains "about"
    (for example  about-hero.png). It is picked up automatically.
    Without a file a dashed placeholder is shown.
  - The picture floats gently, follows the mouse a little, and glowing lines
    orbit around it (part of each line passes behind the picture, part in front).
  - Give the section an id so the header link works: this one already has id="about".
*/

let PICTURE = null;
try {
  const ctx = require.context("../assets", false, /about.*\.(png|jpe?g|webp|avif|svg)$/i);
  const key = ctx.keys()[0];
  if (key) PICTURE = ctx(key);
} catch (e) {
  PICTURE = null;
}

// two tilted orbits: [tilt°, rx, ry, seconds per lap, direction]
const ORBITS = [
  { tilt: -16, rx: 272, ry: 104, dur: 14, dir: 1 },
  { tilt: 24, rx: 250, ry: 64, dur: 20, dir: -1 },
];

const ellipsePath = (rx, ry, dir) => {
  const cx = 300, cy = 300;
  const a = dir > 0 ? 1 : 0;
  return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 ${a} ${cx + rx} ${cy} A ${rx} ${ry} 0 1 ${a} ${cx - rx} ${cy}`;
};

function Orbits({ front }) {
  return (
    <svg className={`ab__orbits ${front ? "is-front" : "is-back"}`} viewBox="0 0 600 600" aria-hidden="true">
      <defs>
        <clipPath id="ab-bottom">
          <rect x="-100" y="300" width="800" height="400" />
        </clipPath>
        <linearGradient id="ab-line" x1="0" x2="1">
          <stop offset="0" stopColor="#d6ff32" stopOpacity="0.1" />
          <stop offset="0.5" stopColor="#d6ff32" stopOpacity="0.9" />
          <stop offset="1" stopColor="#d6ff32" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      {ORBITS.map((o, i) => (
        <g key={i} transform={`rotate(${o.tilt} 300 300)`} clipPath={front ? "url(#ab-bottom)" : undefined}>
          <ellipse cx="300" cy="300" rx={o.rx} ry={o.ry} className="ab__ring" />
          <ellipse cx="300" cy="300" rx={o.rx} ry={o.ry} className="ab__flow" style={{ animationDuration: `${o.dur * 0.6}s` }} />
          <circle r="4.5" className="ab__dot">
            <animateMotion dur={`${o.dur}s`} repeatCount="indefinite" path={ellipsePath(o.rx, o.ry, o.dir)} />
          </circle>
          <circle r="11" className="ab__halo">
            <animateMotion dur={`${o.dur}s`} repeatCount="indefinite" path={ellipsePath(o.rx, o.ry, o.dir)} />
          </circle>
        </g>
      ))}
    </svg>
  );
}

export default function About({
  id = "about",
  lines = ["I MAKE", "IDEAS", "FEEL REAL."],
  arabic = "مين أنا؟",
  role = ["UI/UX", "Designer", "Creative Developer"],
  based = "BASED IN EGYPT",
  tagline = ["TURNING", "IDEAS", "INTO", "EXPERIENCES"],
  image = PICTURE,
}) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

  // start the entrance when the section comes into view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // small mouse parallax (CSS variables only, no re-render)
  const move = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    el.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  };
  const leave = () => {
    ref.current?.style.setProperty("--mx", 0);
    ref.current?.style.setProperty("--my", 0);
  };

  return (
    <section id={id} className={`ab ${seen ? "is-in" : ""}`} ref={ref} onMouseMove={move} onMouseLeave={leave}>
      {/* ---------- left: headline ---------- */}
      <div className="ab__copy">
        <h1 className="ab__title" aria-label={lines.join(" ")}>
          {lines.map((t, i) => (
            <span className="ab__line" key={i} aria-hidden="true">
              <span style={{ "--i": i }}>{t}</span>
            </span>
          ))}
        </h1>
        <p className="ab__ar" lang="ar" dir="rtl">
          <span>{arabic}</span>
        </p>
      </div>

      {/* ---------- right: picture + orbits ---------- */}
      <div className="ab__visual">
        <div className="ab__stage">
          <Orbits />
          <div className="ab__float">
            {image ? (
              <img className="ab__img" src={image} alt="Nada's work on laptop and screens" draggable="false" />
            ) : (
              <div className="ab__ph">about-hero.png</div>
            )}
          </div>
          <Orbits front />
          <i className="ab__spark ab__spark--a" />
          <i className="ab__spark ab__spark--b" />
          <i className="ab__spark ab__spark--c" />
        </div>

        <p className="ab__role" aria-label={role.join(" ")}>
          {role.map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </p>
      </div>

      <p className="ab__based">{based}</p>
      <p className="ab__tag">
        {tagline.map((t, i) => (
          <span key={i}>{t}</span>
        ))}
        <b />
      </p>
    </section>
  );
}