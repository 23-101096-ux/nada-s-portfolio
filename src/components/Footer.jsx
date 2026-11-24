import { useEffect, useRef, useState } from "react";
import "./Footer.css";

/* The background picture: drop your image in src/assets and name it
   footer.png (or .jpg / .jpeg / .webp / .avif) - it is picked up automatically.
   You can also pass a different one with the `bg` prop. */
let assetBg = null;
// ASSETS-BG-START
try {
  const ctx = require.context("../assets", true, /\.(png|jpe?g|webp|avif)$/i);
  const key = ctx.keys().find((k) => /footer/i.test(k));
  if (key) {
    const m = ctx(key);
    assetBg = typeof m === "string" ? m : m.default;
  }
} catch (e) {
  /* no assets folder / no picture: the dark fallback background is used */
}
// ASSETS-BG-END

export default function Footer({
  bg = assetBg,
  contactHref = "#", // put your mailto: link or contact page here
  nameEn = "Nada Aboelnaga",
  nameAr = "ندى أبوالنجا",
  role = "UI/UX Designer & creative developer",
}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  /* ---------- entrance when the footer reaches the screen ---------- */
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* ---------- background drifts slower than the page (parallax) ---------- */
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      /* -1 .. 1 while the footer crosses the screen */
      const t = (r.top + r.height / 2 - window.innerHeight / 2) / (window.innerHeight / 2 + r.height / 2);
      el.style.setProperty("--py", `${(-t * r.height * 0.07).toFixed(1)}px`);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /* ---------- a soft spotlight follows the mouse (desktop) ---------- */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = { x: 0, y: 0 };
    const c = { x: 0, y: 0, ready: false };
    let raf = 0;
    let running = false;
    const tick = () => {
      if (!c.ready) {
        c.x = t.x;
        c.y = t.y;
        c.ready = true;
      }
      c.x += (t.x - c.x) * 0.12;
      c.y += (t.y - c.y) * 0.12;
      el.style.setProperty("--mx", `${c.x.toFixed(1)}px`);
      el.style.setProperty("--my", `${c.y.toFixed(1)}px`);
      if (running) raf = requestAnimationFrame(tick);
    };
    const move = (e) => {
      const r = el.getBoundingClientRect();
      t.x = e.clientX - r.left;
      t.y = e.clientY - r.top;
      if (!running) {
        running = true;
        el.classList.add("is-lit");
        raf = requestAnimationFrame(tick);
      }
    };
    const leave = () => {
      running = false;
      c.ready = false;
      cancelAnimationFrame(raf);
      el.classList.remove("is-lit");
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <footer ref={ref} className={`ft${inView ? " is-in" : ""}${bg ? "" : " ft--noimg"}`}>
      <div className="ft__bgwrap" aria-hidden="true">
        {bg && <img className="ft__bg" src={bg} alt="" draggable={false} />}
      </div>
      <div className="ft__shade" aria-hidden="true" />
      <div className="ft__spot" aria-hidden="true" />

      <h2 className="ft__title">
        <span className="ft__line" style={{ "--d": 0 }}>
          <span className="ft__g">LET&rsquo;S MAKE</span>
        </span>
        <span className="ft__line" style={{ "--d": 1 }}>
          <span className="ft__g">SOMETHING</span>
        </span>
        <span className="ft__line" style={{ "--d": 2 }}>
          <span className="ft__lime">MATTER.</span>
        </span>
      </h2>

      <div className="ft__side">
        <div className="ft__who">
          <p className="ft__ar" lang="ar" dir="rtl">
            {nameAr}
          </p>
          <p className="ft__en">{nameEn}</p>
          <p className="ft__role">{role}</p>
        </div>

        <a className="ft__btn" href={contactHref}>
          <span className="ft__btn-txt">Contact</span>
          <svg className="ft__btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </footer>
  );
}