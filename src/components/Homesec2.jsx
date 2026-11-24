import { useEffect, useRef } from "react";
import "./Homesec2.css";

/*
  HOMESEC2 — scroll-triggered word reveal
  Every word starts at opacity 0. As you scroll through this pinned section,
  the words switch on one by one, in order. Each word then fades in on its own
  over `fadeDuration` seconds, so the fade is smooth and does not depend on
  how fast you scroll. Scrolling back up fades the words out again.
*/
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export default function HomeSec2({
  words = ["CURIOUS", "BY", "DESIGN."],
  fadeDuration = 1, //   seconds for one word to go from 0 to full opacity
  scrollLength = 2.5, // how long the section stays pinned, in screen heights
  start = 0.06, //       scroll progress (0–1) where the first word switches on
  end = 0.8, //          scroll progress where the last word switches on
}) {
  const wrapRef = useRef(null);
  const wordRefs = useRef([]);

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
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [words, start, end]);

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
      </div>
    </section>
  );
}