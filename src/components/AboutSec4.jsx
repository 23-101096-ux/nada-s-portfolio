import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./AboutSec4.css";

/*
  ABOUT — SECTION 4  (details list + buttons)
  Each row draws its line, then its text fades up. Edit the rows below
  or pass your own `rows` prop. "View résumé" opens resumeHref
  (put your PDF in /public, e.g. /resume.pdf).
*/
const ROWS = [
  {
    label: "Education",
    title: "Editable degree / university",
    text: "Add institution, field of study, and graduation information.",
  },
  {
    label: "Experience",
    title: "Editable role / studio",
    text: "Add verified employment, internship, or freelance experience.",
  },
  {
    label: "Current interests",
    title: "Interfaces, code, objects & images",
    text: "UI/UX, front-end development, 3D, identity, editorial systems, and motion.",
  },
];

export default function AboutSec4({
  rows = ROWS,
  resumeHref = "/resume.pdf",
  resumeLabel = "View résumé",
  projectsTo = "/projects",
  projectsLabel = "Selected projects",
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
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className={`as4 ${seen ? "is-in" : ""}`} ref={ref}>
      <div className="as4__list">
        {rows.map((r, i) => (
          <div className="as4__row" key={r.label} style={{ "--i": i }}>
            <p className="as4__label">{r.label}</p>
            <h3 className="as4__title">{r.title}</h3>
            <p className="as4__text">{r.text}</p>
          </div>
        ))}
      </div>

      <div className="as4__actions" style={{ "--i": rows.length }}>
        <a className="as4__btn as4__btn--solid" href={resumeHref} target="_blank" rel="noreferrer">
          <span>{resumeLabel}</span>
          <i aria-hidden="true" />
        </a>
        <Link className="as4__btn as4__btn--line" to={projectsTo}>
          <span>{projectsLabel}</span>
          <i aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}