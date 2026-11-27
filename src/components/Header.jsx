import { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Header.css";

/*
  HEADER  (fixed, tiny)
  - Logo on the left (src/assets/logo.svg). Click it = back to Home.
  - Two small buttons on the right: Projects and Contact. Nothing else.
  - Transparent over the hero, turns into a soft blurred bar after you scroll.
  - Always stays on screen. Same size on phones (no burger menu needed).

  About / Skills / FAQ / Privacy are not in the header any more:
  they are reached from the story sections of the Home page and from the footer.
  To change the buttons, edit DEFAULT_ITEMS.
*/

// logo is picked up automatically, and the build does not break if it is missing
let LOGO = null;
try {
  const ctx = require.context("../assets", false, /(^|\/)logo\.(svg|png|webp|avif|jpe?g)$/i);
  const key = ctx.keys()[0];
  if (key) LOGO = ctx(key);
} catch (e) {
  LOGO = null;
}

const DEFAULT_ITEMS = [
  { label: "Projects", to: "/projects" },
  { label: "Contact", to: "/contact" },
];

export default function Header({ items = DEFAULT_ITEMS, logo = LOGO, brand = "ATELIER N" }) {
  const [scrolled, setScrolled] = useState(false);
  const { pathname, hash } = useLocation();

  // soft background once you leave the top (the header itself never hides)
  useEffect(() => {
    let ticking = false;
    const update = () => {
      setScrolled(window.scrollY > 40);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // new page → start at the top (or at the section named in the link)
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 60);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  // clicking the link of the page you are already on scrolls to the top
  const go = useCallback(
    (e, to) => {
      const [path] = to.split("#");
      if ((path || "/") === pathname && !to.includes("#")) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [pathname]
  );

  const isActive = (to) => {
    const [path, h] = to.split("#");
    return (path || "/") === pathname && (h ? "#" + h === hash : !hash);
  };

  return (
    <header className={`hdr ${scrolled ? "is-scrolled" : ""}`}>
      <div className="hdr__bar">
        <Link className="hdr__logo" to="/" onClick={(e) => go(e, "/")} aria-label="Home">
          {logo ? <img src={logo} alt={brand} draggable="false" /> : <span>{brand}</span>}
        </Link>

        <nav className="hdr__nav" aria-label="Main">
          {items.map((it, i) => (
            <Link
              key={it.to}
              to={it.to}
              style={{ "--i": i }}
              className={`hdr__btn ${isActive(it.to) ? "is-active" : ""}`}
              onClick={(e) => go(e, it.to)}
            >
              <span>{it.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}