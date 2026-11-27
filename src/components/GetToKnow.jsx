import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./GetToKnow.css";
import PORTRAIT_SVG from "./PortraitSvg";

/*
  GET TO KNOW ME MORE
  A line-art portrait of you: your eyes (and head) follow the mouse, you blink,
  and when you hover the button you look at it and raise your eyebrows.
  On phones (no mouse) she looks around by herself.
  The button on the right opens the About page.  Change `to` / `label` below if you like.
*/
export default function GetToKnow({
  eyebrow = "02 — Me",
  hello = "Hi, I'm Nada.",
  label = "Get to know me more",
  to = "/about",
}) {
  const rootRef = useRef(null);
  const svgRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const svg = svgRef.current;
    if (!root || !svg) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let tx = 0, ty = 0;        // where she wants to look (-1 .. 1)
    let cx = 0, cy = 0;        // where she looks now (smoothed)
    let lastMove = -1e9;       // last time the pointer moved
    let overBtn = false;
    let raf = 0;
    let visible = false;
    let t0 = performance.now();

    const clampLen = (x, y) => {
      const l = Math.hypot(x, y);
      return l > 1 ? [x / l, y / l] : [x, y];
    };

    const onMove = (e) => {
      if (overBtn) return;
      const r = svg.getBoundingClientRect();
      const mx = r.left + r.width / 2;
      const my = r.top + r.height * 0.5;
      const range = Math.max(r.width * 0.9, 360); // how far the mouse has to be for her to look fully sideways
      [tx, ty] = clampLen((e.clientX - mx) / range, (e.clientY - my) / range);
      lastMove = performance.now();
    };

    const frame = (now) => {
      raf = 0;
      if (!visible) return;
      if (!reduced && !overBtn && now - lastMove > 2800) {
        // nobody is moving a mouse: look around slowly by herself
        const s = (now - t0) / 1000;
        tx = Math.sin(s * 0.7) * 0.8;
        ty = Math.sin(s * 0.45 + 1) * 0.45;
      }
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      svg.style.setProperty("--dx", cx.toFixed(3));
      svg.style.setProperty("--dy", cy.toFixed(3));
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        root.classList.toggle("is-in", visible || root.classList.contains("is-in"));
        if (visible && !raf) raf = requestAnimationFrame(frame);
      },
      { threshold: 0.2 }
    );
    io.observe(root);

    // looking at the button
    const btn = btnRef.current;
    const enter = () => {
      overBtn = true;
      const r = svg.getBoundingClientRect();
      const b = btn.getBoundingClientRect();
      [tx, ty] = clampLen((b.left + b.width / 2 - (r.left + r.width / 2)) / (r.width * 0.6), (b.top + b.height / 2 - (r.top + r.height / 2)) / (r.height * 0.8));
      svg.classList.add("is-happy");
    };
    const leave = () => {
      overBtn = false;
      lastMove = performance.now();
      svg.classList.remove("is-happy");
    };
    btn.addEventListener("pointerenter", enter);
    btn.addEventListener("pointerleave", leave);
    btn.addEventListener("focus", enter);
    btn.addEventListener("blur", leave);
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      btn.removeEventListener("pointerenter", enter);
      btn.removeEventListener("pointerleave", leave);
      btn.removeEventListener("focus", enter);
      btn.removeEventListener("blur", leave);
    };
  }, []);

  return (
    <section className="gk" ref={rootRef} id="me">
      <div className="gk__art">
        {/* the line-art portrait (SVG markup lives in PortraitSvg.js) */}
        <div
          ref={svgRef}
          className="gk__svg"
          role="img"
          aria-label="Illustrated portrait of Nada looking at your mouse"
          dangerouslySetInnerHTML={{ __html: PORTRAIT_SVG }}
        />
      </div>

      <div className="gk__txt">
        <p className="gk__eyebrow">{eyebrow}</p>
        <p className="gk__hello">{hello}</p>
        <Link ref={btnRef} className="gk__btn" to={to}>
          <span className="gk__label">{label}</span>
          <span className="gk__arrow" aria-hidden="true">
            <svg viewBox="0 0 36 24"><path d="M3 12 H31 M22 4 L31.5 12 L22 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        </Link>
      </div>
    </section>
  );
}