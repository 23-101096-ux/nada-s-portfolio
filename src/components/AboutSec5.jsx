import { useEffect, useRef, useState } from "react";
import "./AboutSec5.css";

/*
  ABOUT — SECTION 5 (statement)
  A big centred, stacked statement. Each line rises out of a clean edge, one after the other.
  Edit the lines, colours (tone: "sage" | "lime") and links below, or pass them as props.
  For an Arabic line set  ar: true  so the right font is used.
*/
const LINES = [
  { text: "CREATING", tone: "sage" },
  { text: "عظمة", tone: "lime", ar: true },
  { text: "SINCE", tone: "sage" },
  { text: "2023", tone: "sage" },
];

const SOCIALS = [
  {
    name: "GitHub",
    href: "https://github.com/23-101096-ux",
    d: "M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.38 7.86 10.9.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z",
  },
  {
    name: "LinkedIn",
    href: "#",
    d: "M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z",
  },
  {
    name: "Behance",
    href: "#",
    d: "M22 7h-7V5h7v2zm1.73 7c-.1-2.43-1.8-4.1-4.37-4.1-2.7 0-4.36 1.72-4.36 4.6 0 2.9 1.5 4.5 4.4 4.5 2.1 0 3.6-.95 4.17-2.9h-2.2c-.2.5-.8.9-1.85.9-1.4 0-2.1-.65-2.2-2h6.4zm-6.35-1.5c.12-1.1.8-1.75 1.98-1.75 1.1 0 1.8.7 1.9 1.75h-3.88zM7.8 11.6c1.2-.5 1.85-1.4 1.85-2.8 0-2.5-1.8-3.3-4-3.3H0v13h5.9c2.4 0 4.4-1.2 4.4-3.85 0-1.75-.9-2.65-2.5-3.05zM2.7 7.7h2.3c.9 0 1.6.4 1.6 1.4s-.7 1.4-1.6 1.4H2.7V7.7zm2.6 8H2.7v-3.1h2.7c1.1 0 1.9.5 1.9 1.55s-.9 1.55-2 1.55z",
  },
];

export default function AboutSec5({ lines = LINES, socials = SOCIALS, id = "about-statement" }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id={id} className={`as5 ${seen ? "is-in" : ""}`} ref={ref}>
      <h2 className="as5__text" aria-label={lines.map((l) => l.text).join(" ")}>
        {lines.map((l, i) => (
          <span className="as5__line" key={i} aria-hidden="true">
            <span
              className={`as5__word as5__word--${l.tone || "sage"} ${l.ar ? "as5__word--ar" : ""}`}
              style={{ "--i": i }}
              lang={l.ar ? "ar" : undefined}
            >
              {l.text}
            </span>
          </span>
        ))}
      </h2>

      <ul className="as5__social">
        {socials.map((s, i) => (
          <li key={s.name} style={{ "--i": i }}>
            <a href={s.href} target="_blank" rel="noreferrer" aria-label={s.name}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={s.d} />
              </svg>
            </a>
          </li>
        ))}
      </ul>

      <i className="as5__half" aria-hidden="true" />
    </section>
  );
}