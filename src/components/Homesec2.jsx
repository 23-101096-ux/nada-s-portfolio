import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./Homesec2.css";

/*
  HOMESEC2 — scroll-triggered word reveal + call to action
  Every word starts at opacity 0. As you scroll through this pinned section,
  the words switch on one by one, in order. After the LAST word, a round
  "GET TO KNOW ME" badge pops in (rotating text ring + arrow) and takes the
  visitor to the About page. Scrolling back up fades everything out again.
*/
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export default function HomeSec2({
  words = ["CURIOUS", "BY", "DESIGN."],
  fadeDuration = 1, //   seconds for one word to go from 0 to full opacity
  scrollLength = 2.5, // how long the section stays pinned, in screen heights
  start = 0.06, //       scroll progress (0–1) where the first word switches on
  end = 0.8, //          scroll progress where the last word switches on
  ctaAt = 0.9, //        scroll progress where the button appears (after the last word)
  ctaTo = "/about", //   page the button opens
  ctaText = "GET TO KNOW ME", // text that circles around the arrow
}) {
  const wrapRef = useRef(null);
  const wordRefs = useRef([]);
  const ctaRef = useRef(null);

  /* ---------- reveal on scroll ---------- */
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const n = words.length;
    const gap = n > 1 ? (end - start) / (n - 1) : 0; // scroll distance between words

    const update = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? clamp(-rect.top / total) : 0;
      wordRefs.current.forEach((el, i) => {
        if (!el) return;
        el.classList.toggle("is-on", reduced || p >= start + i * gap);
      });
      if (ctaRef.current) ctaRef.current.classList.toggle("is-on", reduced || p >= ctaAt);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [words, start, end, ctaAt]);

  /* ---------- the badge leans toward the mouse (desktop) ---------- */
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / r.width;
      const y = (e.clientY - (r.top + r.height / 2)) / r.height;
      el.style.setProperty("--tx", `${(x * 16).toFixed(1)}px`);
      el.style.setProperty("--ty", `${(y * 16).toFixed(1)}px`);
    };
    const leave = () => {
      el.style.setProperty("--tx", "0px");
      el.style.setProperty("--ty", "0px");
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  const ring = `${ctaText} • ${ctaText} • `;

  return (
    <section
      className="sec2"
      ref={wrapRef}
      style={{ height: `${(scrollLength + 1) * 100}vh`, "--fade": `${fadeDuration}s` }}
    >
      <div className="sec2__stage">
        <h2 className="sec2__title" aria-label={words.join(" ")}>
          {words.map((w, i) => (
            <span
              className="sec2__word"
              key={i}
              aria-hidden="true"
              ref={(el) => (wordRefs.current[i] = el)}
            >
              {w}
            </span>
          ))}
        </h2>

        <Link to={ctaTo} className="sec2__cta" ref={ctaRef} aria-label={ctaText.toLowerCase()}>
          <svg className="sec2__ring" viewBox="0 0 200 200" aria-hidden="true">
            <defs>
              <path id="sec2-circle" d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0" />
            </defs>
            <text>
              <textPath href="#sec2-circle" textLength="474">
                {ring}
              </textPath>
            </text>
          </svg>
          <svg className="sec2__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </section>
  );
}