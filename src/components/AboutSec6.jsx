import { useEffect, useRef } from "react";
import "./AboutSec6.css";

/*
  ABOUT — SECTION 6  (living word list)
  Two columns of words scroll upward forever around a lime ink blob with your N inside.
  The words closest to your cursor get heavier and turn lime.
  On phones / touch (no cursor) a "virtual cursor" glides up and down by itself.

  Edit the words below, or pass  left / right / leftLabel / rightLabel  as props.
*/
const LEFT = [
  "UI/UX Design", "3D Design", "Graphic Design", "Web Development", "Game Design", "Motion Graphics",
  "AR", "Illustration", "Branding", "Typography", "Prototyping", "Wireframing",
];
const RIGHT = [
  "Figma", "Photoshop", "Illustrator", "Blender", "After Effects", "Procreate",
  "React", "JavaScript", "HTML & CSS", "Supabase", "GitHub", "Framer",
];

// your N monogram (traced from the logo), size 323 x 345
const LOGO_W = 323;
const LOGO_H = 345;
const LOGO = "M121.2 152.0C120.3 152.7 120.4 152.7 120.2 153.0C120.1 153.3 118.7 151.4 120.2 154.0C121.8 156.6 124.0 160.4 129.5 168.8C135.0 177.1 143.9 190.1 153.5 204.0C163.1 217.9 179.5 241.2 187.2 252.0C195.0 262.8 197.2 265.3 200.2 269.0C203.2 272.7 204.0 273.1 205.2 274.2C206.5 275.4 206.8 275.4 207.8 275.8C208.8 276.1 209.4 276.6 211.2 276.2C213.1 275.9 215.8 275.0 218.8 273.8C221.7 272.5 225.4 270.5 229.0 268.5C232.6 266.5 237.4 263.7 240.5 261.8C243.6 259.8 245.9 258.1 247.8 256.8C249.6 255.4 250.2 254.9 251.5 253.8C252.8 252.6 254.7 250.7 255.5 249.8C256.3 248.8 256.3 248.5 256.5 248.0C256.7 247.5 257.0 248.1 256.5 247.0C256.0 245.9 258.8 250.1 253.2 241.2C247.7 232.4 228.6 202.2 223.2 193.8C217.9 185.3 225.7 198.0 221.0 190.8C216.3 183.5 200.5 158.5 195.0 150.0C189.5 141.5 189.5 141.8 188.0 140.0C186.5 138.2 187.5 139.5 186.2 139.2C185.0 139.0 183.4 138.7 180.5 138.5C177.6 138.3 171.5 138.2 168.8 138.2C166.0 138.2 166.9 138.2 164.0 138.5C161.1 138.8 155.1 139.6 151.5 140.2C147.9 140.9 145.2 141.7 142.2 142.5C139.3 143.3 136.5 144.2 133.8 145.2C131.0 146.3 127.8 147.9 125.8 149.0C123.7 150.1 122.2 151.3 121.2 152.0Z M281.0 56.8C280.6 56.6 280.0 56.6 279.8 56.8C279.5 56.9 280.7 52.8 279.2 57.8C277.8 62.8 272.7 81.4 271.2 86.8C269.8 92.1 271.1 88.5 270.8 89.8C270.4 91.0 269.5 93.2 269.2 94.2C269.0 95.3 269.2 95.5 269.0 96.2C268.8 97.0 268.3 97.7 268.0 98.8C267.7 99.8 267.2 101.8 267.0 102.8C266.8 103.8 263.1 99.2 267.0 104.8C270.9 110.3 285.2 128.8 290.5 136.2C295.8 143.8 296.9 146.1 299.0 149.8C301.1 153.4 301.4 154.1 303.0 158.2C304.6 162.4 307.3 170.4 308.5 174.5C309.7 178.6 309.8 180.7 310.0 183.0C310.2 185.3 309.9 186.8 309.8 188.2C309.6 189.7 309.5 190.1 309.0 191.5C308.5 192.9 308.4 194.0 307.0 196.5C305.6 199.0 303.4 202.8 300.8 206.8C298.1 210.7 294.8 215.5 291.2 220.0C287.7 224.5 283.2 229.8 279.5 234.0C275.8 238.2 271.9 241.9 268.8 245.0C265.6 248.1 263.9 249.7 260.5 252.5C257.1 255.3 252.3 259.1 248.2 262.0C244.2 264.9 240.5 267.4 236.0 270.0C231.5 272.6 225.4 275.8 221.2 277.8C217.1 279.8 214.8 280.6 211.0 282.0C207.2 283.4 201.7 285.0 198.2 286.0C194.8 287.0 193.2 287.2 190.5 287.8C187.8 288.2 185.4 288.7 181.8 289.0C178.1 289.3 172.0 289.5 168.5 289.5C165.0 289.5 163.0 289.2 160.5 289.0C158.0 288.8 157.0 288.8 153.8 288.0C150.5 287.2 145.0 285.8 141.2 284.5C137.5 283.2 134.0 281.4 131.2 280.0C128.5 278.6 127.2 277.8 124.5 276.0C121.8 274.2 117.7 271.0 115.2 269.0C112.8 267.0 112.0 266.1 110.0 264.0C108.0 261.9 105.6 259.2 103.5 256.5C101.4 253.8 99.2 250.3 97.5 247.5C95.8 244.7 94.3 241.5 93.5 239.8C92.7 238.0 93.0 238.0 92.8 237.2C92.5 236.5 92.3 237.1 91.8 235.5C91.2 233.9 89.9 230.0 89.2 227.5C88.6 225.0 88.1 222.5 87.8 220.5C87.4 218.5 87.3 217.9 87.2 215.2C87.2 212.6 87.2 207.5 87.2 204.8C87.3 202.0 87.4 201.2 87.8 199.0C88.1 196.8 88.7 194.0 89.2 191.8C89.8 189.5 90.2 188.0 91.2 185.2C92.3 182.5 94.3 178.2 95.8 175.5C97.2 172.8 98.2 171.5 99.8 169.2C101.3 167.0 102.8 165.0 105.2 162.2C107.7 159.5 112.7 154.8 114.2 153.0C115.8 151.2 114.7 152.0 114.5 151.8C114.3 151.5 114.2 151.2 113.2 151.5C112.3 151.8 111.2 152.2 109.0 153.5C106.8 154.8 102.4 157.5 99.8 159.2C97.1 161.0 94.8 162.8 93.0 164.2C91.2 165.7 90.9 165.9 89.0 167.8C87.1 169.6 84.3 172.2 81.8 175.2C79.2 178.2 76.0 182.5 73.8 185.8C71.5 189.0 69.9 192.0 68.2 195.0C66.6 198.0 65.4 200.6 64.0 204.0C62.6 207.4 61.0 212.2 60.0 215.2C59.0 218.3 58.8 219.8 58.2 222.2C57.8 224.7 57.3 227.5 57.0 229.8C56.7 232.0 56.6 232.9 56.5 235.5C56.4 238.1 56.2 241.5 56.5 245.5C56.8 249.5 57.7 256.0 58.2 259.2C58.8 262.5 59.7 263.9 60.0 265.0C60.3 266.1 59.3 263.9 60.0 266.0C60.7 268.1 62.6 274.0 64.2 277.8C65.9 281.5 68.1 285.7 69.8 288.8C71.4 291.8 72.1 293.0 74.2 296.0C76.4 299.0 80.0 303.5 82.5 306.5C85.0 309.5 86.9 311.3 89.5 313.8C92.1 316.2 95.5 319.0 98.0 321.0C100.5 323.0 101.5 323.8 104.8 325.8C108.0 327.7 114.3 331.1 117.8 332.8C121.2 334.4 122.9 334.9 125.2 335.8C127.6 336.6 129.1 337.1 132.0 337.8C134.9 338.4 137.8 339.1 142.5 339.5C147.2 339.9 155.1 340.0 160.0 340.0C164.9 340.0 167.5 339.8 172.0 339.2C176.5 338.7 182.2 337.8 186.8 336.8C191.3 335.7 195.2 334.3 199.2 332.8C203.3 331.2 207.2 329.5 211.2 327.5C215.3 325.5 219.0 323.7 223.5 321.0C228.0 318.3 234.1 314.3 238.2 311.5C242.4 308.7 244.7 306.9 248.2 304.0C251.8 301.1 256.0 297.5 259.5 294.2C263.0 291.0 265.8 288.2 269.0 284.8C272.2 281.2 275.8 277.3 279.0 273.2C282.2 269.2 285.7 264.7 288.5 260.5C291.3 256.3 294.0 251.8 296.0 248.2C298.0 244.8 298.7 243.5 300.5 239.5C302.3 235.5 305.0 229.1 306.8 224.5C308.5 219.9 309.5 216.7 310.8 211.8C312.0 206.8 313.5 200.7 314.5 195.0C315.5 189.3 316.4 181.2 316.8 177.5C317.1 173.8 316.6 175.1 316.8 172.8C316.9 170.4 317.4 167.9 317.5 163.5C317.6 159.1 317.7 151.7 317.5 146.2C317.3 140.8 317.0 135.6 316.5 131.0C316.0 126.4 315.1 121.5 314.5 118.5C313.9 115.5 313.1 114.0 312.8 112.8C312.4 111.5 313.2 113.1 312.5 110.8C311.8 108.4 309.7 102.3 308.2 98.8C306.8 95.2 306.0 93.1 304.0 89.5C302.0 85.9 299.4 81.4 296.5 77.0C293.6 72.6 289.1 66.5 286.8 63.2C284.4 60.0 283.2 58.8 282.2 57.8C281.3 56.7 281.4 56.9 281.0 56.8Z M224.5 24.2C224.2 24.2 226.1 21.3 224.0 24.5C221.9 27.7 215.0 38.4 211.8 43.2C208.5 48.1 205.8 51.5 204.5 53.5C203.2 55.5 201.3 51.0 204.2 55.2C207.2 59.5 218.7 74.2 222.2 78.8C225.8 83.2 224.8 81.7 225.5 82.2C226.2 82.8 225.5 83.5 226.8 82.2C228.0 81.0 229.1 80.0 232.8 75.0C236.4 70.0 246.0 56.5 248.8 52.5C251.5 48.5 250.1 52.0 249.0 50.8C247.9 49.5 244.5 47.2 242.2 45.2C240.0 43.3 237.4 40.7 235.8 39.0C234.1 37.3 234.0 37.3 232.2 35.0C230.5 32.7 226.8 26.8 225.5 25.0C224.2 23.2 224.8 24.3 224.5 24.2Z M91.5 7.2C89.9 6.9 87.5 6.5 85.0 6.2C82.5 6.0 85.2 5.8 76.5 5.8C67.8 5.7 42.1 5.9 33.0 6.0C23.9 6.1 23.8 6.3 21.8 6.5C19.7 6.7 20.7 6.8 20.5 7.0C20.3 7.2 19.7 7.2 20.5 7.5C21.3 7.8 24.1 8.4 25.2 8.8C26.4 9.1 26.6 9.2 27.2 9.8C27.9 10.3 28.8 11.4 29.2 12.0C29.7 12.6 29.7 12.4 30.0 13.5C30.3 14.6 30.9 16.8 31.2 18.5C31.6 20.2 31.8 20.5 32.0 24.0C32.2 27.5 32.6 3.9 32.8 39.2C32.9 74.6 33.1 196.5 33.0 236.2C32.9 276.0 32.3 269.9 32.0 278.0C31.7 286.1 31.6 282.6 31.2 284.8C30.9 286.9 30.3 289.0 29.8 291.0C29.2 293.0 28.7 294.4 27.8 296.5C26.8 298.6 25.2 301.6 24.0 303.5C22.8 305.4 21.7 306.6 20.5 308.0C19.3 309.4 18.2 310.5 16.8 311.8C15.3 313.0 13.4 314.3 11.8 315.2C10.1 316.2 7.8 316.8 7.0 317.2C6.2 317.7 6.9 317.6 7.0 317.8C7.1 317.9 5.2 317.8 7.5 318.0C9.8 318.2 12.4 318.6 20.8 318.8C29.1 318.9 50.8 318.8 57.5 318.8C64.2 318.7 60.2 318.6 61.0 318.5C61.8 318.4 61.9 318.2 62.0 318.0C62.1 317.8 62.4 317.5 61.5 317.0C60.6 316.5 58.2 315.9 56.5 315.0C54.8 314.1 52.7 312.6 51.2 311.5C49.8 310.4 48.9 309.5 47.8 308.2C46.6 307.0 45.2 305.3 44.2 304.0C43.2 302.7 42.5 301.6 41.8 300.2C41.0 298.9 40.3 297.5 39.8 295.8C39.2 294.0 38.6 291.6 38.2 289.5C37.9 287.4 37.8 285.9 37.5 283.0C37.2 280.1 37.0 278.2 36.8 272.0C36.5 265.8 36.3 274.6 36.2 245.8C36.2 216.9 36.4 134.5 36.5 99.0C36.6 63.5 36.8 44.1 37.0 33.0C37.2 21.9 37.4 32.4 37.8 32.5C38.1 32.6 37.2 31.1 39.0 33.8C40.8 36.4 46.4 45.4 48.5 48.5C50.6 51.6 45.9 44.2 51.5 52.5C57.1 60.8 71.7 83.1 82.0 98.5C92.3 113.9 108.1 137.2 113.5 145.0C118.9 152.8 114.1 145.4 114.5 145.5C114.9 145.6 114.8 145.7 115.8 145.5C116.7 145.3 116.8 145.7 120.0 144.5C123.2 143.3 131.1 140.0 135.2 138.5C139.4 137.0 141.3 136.5 145.0 135.8C148.7 135.0 151.9 134.4 157.5 134.0C163.1 133.6 174.5 133.7 178.8 133.5C183.0 133.3 182.0 133.0 182.8 132.8C183.5 132.5 183.6 132.6 183.5 132.0C183.4 131.4 184.2 132.2 182.2 129.0C180.3 125.8 180.2 125.2 172.0 112.8C163.8 100.2 139.9 64.5 133.0 54.0C126.1 43.5 133.6 54.5 130.5 49.8C127.4 45.0 117.6 30.6 114.2 25.8C110.9 20.9 111.5 22.1 110.2 20.5C109.0 18.9 107.7 17.5 106.5 16.2C105.3 15.0 104.3 14.0 103.0 13.0C101.7 12.0 99.9 10.8 98.5 10.0C97.1 9.2 95.9 8.7 94.8 8.2C93.6 7.8 93.1 7.6 91.5 7.2Z";

const lerp = (a, b, t) => a + (b - a) * t;

export default function AboutSec6({
  left = LEFT,
  right = RIGHT,
  leftLabel = "Disciplines",
  rightLabel = "Tools",
}) {
  const rootRef = useRef(null);
  const listsRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const lists = listsRef.current;
    if (!root || !lists) return;

    const items = [...root.querySelectorAll(".as6__item")];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // pointer: [x, y] inside the lists box. null = use the virtual cursor
    let real = null;
    const cur = { x: 0, y: 0 };
    let visible = false;
    let raf = 0;
    let t0 = performance.now();

    const onMove = (e) => {
      const r = lists.getBoundingClientRect();
      real = { x: e.clientX - r.left, y: e.clientY - r.top };
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      root.style.setProperty("--px", nx.toFixed(3));
      root.style.setProperty("--py", ny.toFixed(3));
    };
    const onLeave = () => {
      real = null;
      root.style.setProperty("--px", 0);
      root.style.setProperty("--py", 0);
    };
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("pointercancel", onLeave);

    // keep the scroll speed the same on every screen size (about 48 px per second)
    const setSpeed = () => {
      const tr = root.querySelector(".as6__track");
      if (tr) root.style.setProperty("--dur", `${(tr.scrollHeight / 2 / 48).toFixed(1)}s`);
    };
    setSpeed();
    const ro = new ResizeObserver(setSpeed);
    ro.observe(lists);

    const frame = (now) => {
      if (!visible) { raf = 0; return; }
      const r = lists.getBoundingClientRect();
      const t = (now - t0) / 1000;

      // target: the real cursor, or a virtual one gliding on the centre line
      const tx = real ? real.x : r.width / 2 + Math.sin(t * 0.45) * r.width * 0.04;
      const ty = real ? real.y : r.height * (0.5 + 0.3 * Math.sin(t * 0.38));
      cur.x = lerp(cur.x || tx, tx, 0.14);
      cur.y = lerp(cur.y || ty, ty, 0.14);

      const rowH = items[0] ? items[0].offsetHeight : 60;
      const R = rowH * 1.7;
      const px = r.left + cur.x;
      const py = r.top + cur.y;

      for (let i = 0; i < items.length; i++) {
        const el = items[i];
        const b = el.getBoundingClientRect();
        const dy = b.top + b.height / 2 - py;
        const dx = (b.left + b.width / 2 - px) * 0.25;
        const f = Math.exp(-(dx * dx + dy * dy) / (2 * R * R));
        el.style.fontWeight = String(Math.round(200 + f * 500));
        el.style.letterSpacing = `${(-0.03 * f).toFixed(3)}em`;
        const k = f > 0.04 ? f : 0;
        el.style.color = k
          ? `rgb(${Math.round(255 - 41 * k)},255,${Math.round(255 - 205 * k)})`
          : "";
        el.style.opacity = String((0.55 + 0.45 * Math.min(1, f * 1.6)).toFixed(2));
      }
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        root.classList.toggle("is-in", visible || root.classList.contains("is-in"));
        if (visible && !raf && !reduced) {
          t0 = performance.now();
          raf = requestAnimationFrame(frame);
        }
      },
      { threshold: 0.15 }
    );
    io.observe(root);

    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointercancel", onLeave);
    };
  }, []);

  const track = (words, side) => (
    <ul className={`as6__col as6__col--${side}`} aria-label={side === "l" ? leftLabel : rightLabel}>
      <div className="as6__track">
        {[0, 1, 2, 3, 4, 5].map((copy) =>
          words.map((w, i) => (
            <li className="as6__item" key={`${copy}-${i}`} aria-hidden={copy > 0}>
              {w}
            </li>
          ))
        )}
      </div>
    </ul>
  );

  return (
    <section className="as6" ref={rootRef}>
      <div className="as6__labels" aria-hidden="true">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>

      <div className="as6__lists" ref={listsRef}>
        {track(left, "l")}

        <div className="as6__blob" aria-hidden="true">
          <svg className="as6__svg" viewBox="0 0 200 240">
            <defs>
              <filter id="as6-rough" x="-25%" y="-25%" width="150%" height="150%">
                <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="n">
                  <animate attributeName="baseFrequency" dur="11s" values="0.03;0.05;0.03" repeatCount="indefinite" />
                </feTurbulence>
                <feDisplacementMap in="SourceGraphic" in2="n" scale="20" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
            <g className="as6__shape">
              <g filter="url(#as6-rough)">
                <ellipse cx="100" cy="120" rx="76" ry="100" />
              </g>
            </g>
            <g className="as6__n" transform={`translate(${100 - (LOGO_W * 0.27) / 2} ${120 - (LOGO_H * 0.27) / 2}) scale(0.27)`}>
              <path d={LOGO} fillRule="evenodd" />
            </g>
          </svg>
        </div>

        {track(right, "r")}
      </div>
    </section>
  );
}