import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./AboutSec2.css";

/*
  ABOUT — SECTION 2
  Big dim statement on the left, short intro on the right.
  Everything fades in from the left to the right when the section scrolls into view.
  Change the words below or pass your own props.
*/
const BIG = ["I DESIGN.", "I", "EXPERIMENT.", "I BUILD."];

export default function AboutSec2({
  big = BIG,
  blocks = [
    {
      title: "I design with curiosity.",
      text: "I'm Nada, a UI/UX designer and front-end developer exploring the space between design, technology, and visual storytelling.",
    },
    {
      title: "I don't just design screens. I build experiences.",
      text: "My work moves between UI/UX, web design, 3D, branding, and digital illustration. I'm drawn to the details that make a digital experience feel distinct.",
    },
  ],
  linkLabel = "More about Nada",
  linkTo = "/about",
}) {
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
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className={`as2 ${seen ? "is-in" : ""}`} ref={ref}>
      <h2 className="as2__big" aria-label={big.join(" ")}>
        {big.map((t, i) => (
          <span className="as2__row" key={i} aria-hidden="true" style={{ "--d": `${i * 0.14}s` }}>
            <span>{t}</span>
          </span>
        ))}
      </h2>

      <div className="as2__copy">
        {blocks.map((b, i) => (
          <div className="as2__block" key={i}>
            <h3 className="as2__title as2__fade" style={{ "--d": `${0.5 + i * 0.5}s` }}>
              {b.title}
            </h3>
            <p className="as2__text as2__fade" style={{ "--d": `${0.7 + i * 0.5}s` }}>
              {b.text}
            </p>
          </div>
        ))}

        <Link className="as2__link as2__fade" to={linkTo} style={{ "--d": `${0.7 + blocks.length * 0.5}s` }}>
          <span>{linkLabel}</span>
          <i aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}