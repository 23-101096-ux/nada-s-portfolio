import { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Header.css";

/*
  HEADER  (fixed / sticky, minimal)
  - Logo on the left: put your file in  src/assets/  and name it  logo.svg
    (logo.png / logo.webp also work). If no logo file is found, "ATELIER N" text shows.
  - Nav on the right in a very light font.
  - Transparent over the hero, turns into a soft blurred bar after you scroll.
  - Always stays on screen, no matter how far you scroll.
  - Phones / small tablets: menu button + full-screen menu.

  Each link opens its own page:  { label: "About", to: "/about" }
  A link can also scroll to a section on the Home page:  { label: "Work", to: "/#projects" }
  Put <Header /> ONCE in App.js (outside <Routes>) so it stays on every page.
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
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Projects", to: "/projects" },
  { label: "Skills", to: "/skills" },
  { label: "Contact", to: "/contact" },
  { label: "FAQ", to: "/faq" },
  { label: "Privacy", to: "/privacy" },
];

export default function Header({ items = DEFAULT_ITEMS, logo = LOGO, brand = "ATELIER N" }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
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

  // new page → start at the top (or at the section named in the link), close the menu
  useEffect(() => {
    setOpen(false);
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 60);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  // lock page scroll while the mobile menu is open; Esc closes it
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // close the menu if the window grows to desktop size
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 901px)");
    const on = () => mq.matches && setOpen(false);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // clicking the link of the page you are already on scrolls to the top
  const go = useCallback(
    (e, to) => {
      const [path] = to.split("#");
      if ((path || "/") === pathname && !to.includes("#")) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      setOpen(false);
    },
    [pathname]
  );

  const isActive = (to) => {
    const [path, h] = to.split("#");
    return (path || "/") === pathname && (h ? "#" + h === hash : !hash);
  };

  return (
    <header
      className={`hdr ${scrolled ? "is-scrolled" : ""} ${open ? "is-open" : ""}`}
    >
      <div className="hdr__bar">
        <Link className="hdr__logo" to="/" onClick={(e) => go(e, "/")} aria-label="Home">
          {logo ? <img src={logo} alt={brand} draggable="false" /> : <span>{brand}</span>}
        </Link>

        <nav className="hdr__nav" aria-label="Main">
          <ul>
            {items.map((it, i) => (
              <li key={it.to} style={{ "--i": i }}>
                <Link
                  to={it.to}
                  className={isActive(it.to) ? "is-active" : ""}
                  onClick={(e) => go(e, it.to)}
                >
                  <span>{it.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className="hdr__burger"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <i />
          <i />
        </button>
      </div>
    </header>
  );
}