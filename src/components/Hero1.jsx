import { useRef } from "react";
import "./Hero1.css";
import ParticlePortrait from "./ParticlePortrait";

import portrait from "../assets/nada.png";

const TITLE = "PORTFOLIO".split("");

export default function Hero({ play = true }) {
  const heroRef = useRef(null);

  // Mouse parallax: writes CSS variables directly (no re-renders)
  const handleMove = (e) => {
    const el = heroRef.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5; // -0.5 → 0.5
    const y = (e.clientY - top) / height - 0.5;
    el.style.setProperty("--mx", x.toFixed(3));
    el.style.setProperty("--my", y.toFixed(3));
  };

  const handleLeave = () => {
    const el = heroRef.current;
    if (!el) return;
    el.style.setProperty("--mx", 0);
    el.style.setProperty("--my", 0);
  };

  return (
    <section
      className={`hero ${play ? "is-playing" : ""}`}
      ref={heroRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {/* Layer 1 — giant PORTFOLIO word (behind the portrait) */}
      <div className="layer layer--title">
        <h1 className="hero__title" aria-label="Portfolio">
          {TITLE.map((letter, i) => (
            <span className="hero__letter" key={i} aria-hidden="true">
              <span style={{ "--i": i }}>{letter}</span>
            </span>
          ))}
        </h1>
      </div>

      {/* Layer 2 — portrait, made of particles that react to the cursor */}
      <div className="layer layer--photo">
        <ParticlePortrait src={portrait} alt="Nada Abu El Naga" play={play} />
      </div>

      {/* Layer 3 — Arabic name (in front of the portrait) */}
      <div className="layer layer--name">
        <p className="hero__name" lang="ar" dir="rtl">
          <span>ندى آبو النجا</span>
        </p>
      </div>

      <p className="hero__role">UI / UX DESIGNER</p>
    </section>
  );
}