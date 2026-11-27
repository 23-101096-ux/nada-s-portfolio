import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";
import "./Homesec4.css";

/* how many pop-up images each card shows */
const MAX_FAN = 5;

/* How the pop-up pile is arranged, by number of images, so that every
   image stays visible (they only overlap a little).
   x = sideways offset from the card centre (% of card width)
   w = image width (% of card width)      r = tilt (deg)
   b = height of the image's bottom edge above the card top (in card widths;
       negative = starts behind the card)
   p = how much of it peeks out above the card before you hover (card widths)
   z = stacking order. The FIRST image is the hero shot: in front, in the middle. */
const PILES = {
  1: [{ x: 0, w: 100, r: -3, b: -0.1, p: 0.22, z: 3 }],
  2: [
    { x: -12, w: 92, r: -4, b: -0.1, p: 0.18, z: 3 },
    { x: 26, w: 76, r: 8, b: 0.2, p: 0.3, z: 2 },
  ],
  3: [
    { x: 0, w: 94, r: -2, b: -0.08, p: 0.16, z: 3 },
    { x: -30, w: 76, r: -9, b: 0.24, p: 0.28, z: 2 },
    { x: 30, w: 74, r: 8, b: 0.26, p: 0.3, z: 1 },
  ],
  4: [
    { x: 0, w: 94, r: -2, b: -0.08, p: 0.16, z: 4 },
    { x: -30, w: 76, r: -9, b: 0.24, p: 0.28, z: 2 },
    { x: 30, w: 74, r: 8, b: 0.26, p: 0.3, z: 1 },
    { x: 0, w: 66, r: 3, b: 0.38, p: 0.34, z: 0 },
  ],
  5: [
    { x: 0, w: 94, r: -2, b: -0.08, p: 0.16, z: 4 },
    { x: -30, w: 76, r: -9, b: 0.24, p: 0.28, z: 2 },
    { x: 30, w: 74, r: 8, b: 0.26, p: 0.3, z: 1 },
    { x: 0, w: 66, r: 3, b: 0.38, p: 0.34, z: 0 },
    { x: 50, w: 52, r: 7, b: -0.1, p: 0.14, z: 5 },
  ],
};

/* the `images` column stores one long string with every URL separated by
   commas, so split it into a clean list of URLs */
function parseImages(raw) {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list
    .flatMap((item) => {
      if (item && typeof item === "object") return item.url ? [item.url] : [];
      return typeof item === "string" ? item.split(/\s*,\s*(?=https?:\/\/)/i) : [];
    })
    .map((u) => u.trim())
    .filter((u) => /^https?:\/\//i.test(u));
}

function chunk(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

export default function HomeSec4({ title = "CATEGORIES" }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [per, setPer] = useState(4); // cards per screen
  const [inView, setInView] = useState(false);
  const [seen, setSeen] = useState(() => new Set());
  const [badIcons, setBadIcons] = useState(() => new Set());
  const [edge, setEdge] = useState({ start: true, end: false });

  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const drag = useRef({ down: false, x: 0, left: 0 });

  /* ---------- load from Supabase ---------- */
  useEffect(() => {
    let alive = true;
    supabase
      .from("categories")
      .select("id, category_name, category_img, images")
      .order("id")
      .then(({ data, error }) => {
        if (!alive) return;
        if (error || !data) {
          console.warn("[HomeSec4] could not load categories:", error);
          setStatus("error");
          return;
        }
        setItems(
          data.map((row) => ({
            id: row.id,
            name: row.category_name,
            icon: row.category_img,
            images: parseImages(row.images).slice(0, MAX_FAN),
          }))
        );
        setStatus("ready");
      });
    return () => {
      alive = false;
    };
  }, []);

  /* ---------- 4 cards per screen (fewer on smaller screens) ---------- */
  useEffect(() => {
    const phone = window.matchMedia("(max-width: 560px)");
    const tablet = window.matchMedia("(max-width: 800px)");
    const set = () => setPer(phone.matches ? 2 : tablet.matches ? 3 : 4);
    set();
    phone.addEventListener("change", set);
    tablet.addEventListener("change", set);
    return () => {
      phone.removeEventListener("change", set);
      tablet.removeEventListener("change", set);
    };
  }, []);

  const pages = chunk(items, per);

  /* ---------- play the entrance when the section reaches the screen ---------- */
  useEffect(() => {
    const el = sectionRef.current;
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

  /* ---------- each page of cards animates in when you scroll to it ---------- */
  useEffect(() => {
    const root = trackRef.current;
    if (!root) return;
    const els = root.querySelectorAll(".cat__page");
    if (!("IntersectionObserver" in window)) {
      setSeen(new Set([...els].map((_, i) => i)));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        setSeen((prev) => {
          let next = prev;
          entries.forEach((e) => {
            const i = Number(e.target.dataset.page);
            if (e.isIntersecting && !next.has(i)) {
              if (next === prev) next = new Set(prev);
              next.add(i);
            }
          });
          return next;
        });
      },
      { root, threshold: 0.5 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pages.length]);

  /* ---------- arrows: show / hide at the two ends ---------- */
  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdge({ start: el.scrollLeft <= 2, end: el.scrollLeft >= max - 2 });
  }, []);

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [items, per, updateEdges]);

  const go = (dir) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  /* ---------- drag the row with the mouse ---------- */
  const onPointerDown = (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = trackRef.current;
    drag.current = { down: true, x: e.clientX, left: el.scrollLeft };
    el.classList.add("is-drag");
  };

  useEffect(() => {
    const move = (e) => {
      if (!drag.current.down || !trackRef.current) return;
      trackRef.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
    };
    const up = () => {
      if (!drag.current.down) return;
      drag.current.down = false;
      if (trackRef.current) trackRef.current.classList.remove("is-drag");
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  /* ---------- the pile of images leans a little with the mouse ---------- */
  const onCardMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 2 - 1);
    e.currentTarget.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const onCardLeave = (e) => {
    e.currentTarget.style.setProperty("--mx", 0);
    e.currentTarget.style.setProperty("--my", 0);
  };

  const iconFailed = (id) =>
    setBadIcons((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));

  return (
    <section
      ref={sectionRef}
      className={`cat${inView ? " is-in" : ""}`}
      style={{ "--per": per }}
      aria-labelledby="cat-title"
    >
      <h2 id="cat-title" className="cat__title">
        {title}
      </h2>

      {status === "error" && (
        <p className="cat__msg">Couldn&apos;t load the categories. Please try again later.</p>
      )}

      <div
        ref={trackRef}
        className="cat__track"
        onScroll={updateEdges}
        onPointerDown={onPointerDown}
      >
        {pages.map((group, p) => (
          <div
            className={`cat__page${inView && seen.has(p) ? " is-in" : ""}`}
            data-page={p}
            key={p}
          >
            {group.map((c, i) => {
              const pile = PILES[c.images.length] || [];
              return (
                <article
                  className="cat__card"
                  tabIndex={0}
                  key={c.id}
                  style={{ "--i": i }}
                  onPointerMove={onCardMove}
                  onPointerLeave={onCardLeave}
                >
                  {/* the pile of project images behind the card */}
                  <div className="cat__fan" aria-hidden="true">
                    {c.images.map((src, k) => (
                      <img
                        key={src}
                        src={src}
                        alt=""
                        draggable={false}
                        style={{
                          "--k": k,
                          "--xn": pile[k].x,
                          "--w": `${pile[k].w}%`,
                          "--r": `${pile[k].r}deg`,
                          "--b": pile[k].b,
                          "--p": pile[k].p,
                          zIndex: pile[k].z,
                        }}
                      />
                    ))}
                  </div>

                  <div className="cat__face">
                    {c.icon && !badIcons.has(c.id) ? (
                      <img
                        className="cat__icon"
                        src={c.icon}
                        alt=""
                        draggable={false}
                        onError={() => iconFailed(c.id)}
                      />
                    ) : (
                      <FallbackIcon name={c.name} />
                    )}
                    <h3 className="cat__name">{c.name}</h3>
                    <span className="cat__dash" />
                  </div>
                </article>
              );
            })}
          </div>
        ))}
      </div>

      <div className="cat__nav">
        <button
          type="button"
          className={`cat__arrow cat__arrow--prev${edge.start ? " is-hidden" : ""}`}
          onClick={() => go(-1)}
          aria-label="Previous categories"
          tabIndex={edge.start ? -1 : 0}
        >
          <Arrow />
        </button>
        <button
          type="button"
          className={`cat__arrow${edge.end ? " is-hidden" : ""}`}
          onClick={() => go(1)}
          aria-label="More categories"
          tabIndex={edge.end ? -1 : 0}
        >
          <Arrow />
        </button>
      </div>
    </section>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 48 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M1 12h44M35 2l10 10-10 10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* shown only if a category's icon file is missing or can't load */
function FallbackIcon({ name = "" }) {
  const n = name.toLowerCase();
  const common = {
    className: "cat__icon cat__icon--fallback",
    viewBox: "0 0 64 64",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 3,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
  if (n.includes("game")) {
    return (
      <svg {...common}>
        <path d="M18 22h28a10 10 0 0 1 10 11l-2 10a6 6 0 0 1-10 2l-3-5H23l-3 5a6 6 0 0 1-10-2L8 33a10 10 0 0 1 10-11Z" />
        <path d="M20 31v6M17 34h6" />
        <circle cx="42" cy="32" r="1.5" />
        <circle cx="47" cy="36" r="1.5" />
      </svg>
    );
  }
  if (n.includes("ui") || n.includes("ux")) {
    return (
      <svg {...common}>
        <rect x="8" y="12" width="48" height="40" rx="6" />
        <path d="M8 24h48M20 36h14M20 44h8" />
        <circle cx="15" cy="18" r="1" />
        <circle cx="21" cy="18" r="1" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="10" y="10" width="26" height="26" rx="5" />
      <circle cx="42" cy="42" r="14" />
    </svg>
  );
}
