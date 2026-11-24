import { useEffect, useRef, useState } from "react";
import "./AboutSec3.css";

/*
  ABOUT — SECTION 3  (process)
  Big heading + 4 columns. The heading wipes in, then the 4 columns
  fade up from the bottom, one after the other.
  Edit the steps below or pass your own `steps` prop.
*/
const STEPS = [
  {
    title: "Research",
    text: "I start by understanding the problem, the users, and the bigger picture.",
  },
  {
    title: "Ideate",
    text: "I explore ideas, sketch solutions, and experiment with different directions.",
  },
  {
    title: "Design",
    text: "I turn ideas into clean, functional, and engaging experience.",
  },
  {
    title: "Build",
    text: "I bring design to life through front-end development and interactive visuals.",
  },
];

export default function AboutSec3({ heading = "Design. Experiment. Build.", steps = STEPS }) {
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
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className={`as3 ${seen ? "is-in" : ""}`} ref={ref}>
      <h2 className="as3__heading" aria-label={heading}>
        <span aria-hidden="true">{heading}</span>
      </h2>

      <ol className="as3__grid">
        {steps.map((s, i) => (
          <li className="as3__col" key={s.title} style={{ "--i": i }}>
            <span className="as3__num">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="as3__title">{s.title}</h3>
            <p className="as3__text">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}