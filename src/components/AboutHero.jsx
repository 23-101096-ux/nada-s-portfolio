import { useEffect, useRef, useState } from "react";
import "./AboutHero.css";

/*
  ABOUT HERO
  - Put your picture in  src/assets/  with a name that contains "about"
    (for example  about-hero.png). It is picked up automatically.
    Without a file a dashed placeholder is shown.
  - The Arabic "مين أنا؟" is a lime shape with a black outline, tilted and overlapping the last line.
  - The picture floats gently, follows the mouse a little, and glowing lines
    orbit around it (part of each line passes behind the picture, part in front).
  - Give the section an id so the header link works: this one already has id="about".
*/

let PICTURE = null;
try {
  const ctx = require.context("../assets", false, /about.*\.(png|jpe?g|webp|avif|svg)$/i);
  const key = ctx.keys()[0];
  if (key) PICTURE = ctx(key);
} catch (e) {
  PICTURE = null;
}

// "مين أنا؟" — the real Jameel Noori letters (your font) turned into one clean outline shape, so it looks
// the same on every device and does not depend on an Arabic font being installed.
// Size: AR_W x AR_H (the viewBox below is cut tight around the letters).
const AR_VIEW = "60 -1600 4340 1880";
const AR_PATH =
  "M410.0 -555.0 406.0 -451.0Q406.0 -451.0 346.0 -451.0Q346.0 -590.0 293.0 -666.0Q182.0 -788.0 158.0 -823.0Q94.0 -920.0 102.0 -1016.0Q109.0 -1092.0 159.0 -1157.5Q209.0 -1223.0 283.0 -1247.0Q330.0 -1264.0 383.0 -1264.0Q522.0 -1264.0 610.0 -1169.0Q641.0 -1137.0 651.0 -1112.0Q670.0 -1069.0 670.0 -1024.0Q670.0 -952.0 625.0 -909.0Q580.0 -879.0 528.0 -897.0Q479.0 -915.0 475.0 -967.0Q469.0 -1004.0 500.0 -1034.0Q528.0 -1059.0 555.0 -1085.0Q563.0 -1122.0 524.0 -1158.0Q485.0 -1194.0 426.0 -1194.0Q393.0 -1194.0 365.0 -1182.0Q264.0 -1143.0 256.0 -1006.0Q250.0 -891.0 305.0 -805.0Q365.0 -713.0 377.0 -688.0Q412.0 -618.0 410.0 -555.0ZM459.0 -305.0Q485.0 -266.0 469.0 -221.0Q451.0 -170.0 395.0 -156.0Q328.0 -150.0 293.0 -201.0Q276.0 -219.0 276.0 -250.0Q274.0 -281.0 289.0 -301.0Q301.0 -338.0 356.0 -350.0Q424.0 -358.0 459.0 -305.0ZM1041.0 -858.0V-872.0L1187.0 -1012.0L1199.0 -1008.0Q1242.0 -963.0 1336.0 -879.0Q1338.0 -864.0 1302.0 -827.0L1203.0 -731.0Q1177.0 -721.0 1158.0 -735.0Q1066.0 -809.0 1041.0 -858.0ZM1187.0 -141.0Q1134.0 -29.0 1066.0 -12.0Q996.0 10.0 941.0 -35.0Q904.0 -57.0 876.0 -145.0Q859.0 -195.0 855.0 -438.0Q853.0 -489.0 855.0 -633.0L865.0 -993.0Q867.0 -1040.0 894.0 -1108.0Q935.0 -1212.0 935.0 -1219.0L939.0 -1221.0Q941.0 -1223.0 943.0 -1223.0Q943.0 -1223.0 950.5 -1220.0Q958.0 -1217.0 968.0 -1210.0Q929.0 -909.0 945.0 -530.0Q947.0 -477.0 966.0 -373.0Q994.0 -281.0 1070.0 -264.0Q1082.0 -260.0 1093.0 -260.0Q1138.0 -260.0 1189.0 -330.0Q1197.0 -350.0 1211.0 -393.0Q1218.0 -399.0 1230.0 -414.0Q1246.0 -410.0 1250.0 -381.0Q1254.0 -283.0 1187.0 -141.0ZM1795.0 -1094.0Q1789.0 -1057.0 1781.0 -985.0Q1772.0 -893.0 1770.0 -731.0Q1770.0 -545.0 1766.0 -471.0Q1758.0 -313.0 1680.0 -141.0Q1666.0 -109.0 1654.0 -109.0Q1647.0 -109.0 1641.0 -113.0Q1627.0 -121.0 1631.0 -150.0Q1647.0 -205.0 1658.0 -426.0Q1643.0 -604.0 1647.0 -825.0Q1680.0 -936.0 1762.0 -1100.0Q1783.0 -1112.0 1795.0 -1094.0ZM1965.0 -1446.0V-1451.0Q1950.0 -1422.0 1914.0 -1377.0Q1895.0 -1377.0 1883.0 -1379.0Q1797.0 -1379.0 1739.0 -1307.0Q1688.0 -1223.0 1672.0 -1205.0Q1627.0 -1143.0 1582.0 -1129.0Q1551.0 -1119.0 1529.0 -1119.0Q1490.0 -1119.0 1469.0 -1145.0L1473.0 -1158.0Q1504.0 -1215.0 1570.0 -1301.0Q1594.0 -1289.0 1615.0 -1289.0Q1647.0 -1289.0 1676.0 -1313.0Q1717.0 -1365.0 1805.0 -1467.0Q1881.0 -1553.0 1969.0 -1551.0Q1987.0 -1551.0 2006.0 -1532.0L2004.0 -1516.0Q1993.0 -1502.0 1965.0 -1446.0ZM2735.0 -660.0Q2756.0 -688.0 2786.0 -660.0Q2829.0 -624.0 2884.0 -583.0Q2905.0 -567.0 2905.0 -561.0Q2905.0 -553.0 2847.0 -491.0L2783.0 -424.0Q2749.0 -422.0 2728.0 -436.0Q2704.0 -452.0 2655.0 -502.0Q2626.0 -531.0 2626.0 -536.0Q2626.0 -542.0 2681.0 -600.0Q2735.0 -658.0 2735.0 -660.0ZM3419.0 -430.0Q3440.0 -455.0 3446.0 -455.0Q3452.0 -455.0 3475.0 -434.0Q3554.0 -356.0 3613.0 -324.0Q3617.0 -324.0 3638.0 -348.0Q3719.0 -441.0 3730.0 -445.0Q3734.0 -445.0 3753.0 -428.0Q3822.0 -366.0 3886.0 -321.0Q3889.0 -319.0 3888.0 -309.0Q3886.0 -298.0 3853.0 -258.0L3839.0 -242.0Q3772.0 -161.0 3763.0 -155.0Q3758.0 -152.0 3746.0 -152.0Q3715.0 -152.0 3653.0 -207.0Q3609.0 -247.0 3596.0 -267.0Q3590.0 -278.0 3585.0 -279.0Q3581.0 -279.0 3532.0 -222.0Q3483.0 -166.0 3478.0 -163.0Q3460.0 -159.0 3432.0 -174.0Q3385.0 -200.0 3341.0 -246.0Q3306.0 -283.0 3306.0 -292.0Q3306.0 -298.0 3419.0 -430.0ZM4190.0 -1464.0Q4199.0 -1472.0 4203.0 -1470.0Q4216.0 -1463.0 4225.0 -1444.0Q4241.0 -1396.0 4318.0 -1289.0Q4342.0 -1255.0 4341.0 -1245.0Q4333.0 -1204.0 4290.0 -1167.0Q4239.0 -1115.0 4212.0 -1102.0Q4198.0 -1095.0 4190.0 -1096.0Q4173.0 -1098.0 4118.0 -1126.0Q4043.0 -1163.0 3982.0 -1135.0Q3920.0 -1098.0 3865.0 -1023.0Q3797.0 -939.0 3756.0 -913.0Q3632.0 -841.0 3557.0 -939.0Q3543.0 -955.0 3533.0 -937.0Q3493.0 -876.0 3435.0 -834.0Q3393.0 -797.0 3316.0 -795.0Q3277.0 -794.0 3271.0 -787.0Q3265.0 -780.0 3265.0 -744.0Q3265.0 -674.0 3250.0 -573.0Q3202.0 -263.0 3022.0 -20.0Q2911.0 130.0 2783.0 193.0Q2691.0 238.0 2588.0 241.0Q2434.0 246.0 2361.0 161.0Q2249.0 53.0 2249.0 -163.0Q2249.0 -226.0 2259.0 -292.0Q2282.0 -445.0 2359.0 -648.0Q2374.0 -689.0 2382.0 -697.0Q2394.0 -707.0 2403.0 -698.0Q2408.0 -682.0 2395.0 -638.0Q2352.0 -489.0 2337.0 -390.0Q2317.0 -247.0 2368.0 -137.0Q2413.0 -44.0 2537.0 -16.0Q2711.0 10.0 2849.0 -58.0Q2966.0 -114.0 3057.0 -231.0Q3228.0 -445.0 3191.0 -822.0Q3187.0 -916.0 3214.0 -980.0Q3233.0 -1001.0 3237.0 -970.0L3243.0 -940.0Q3332.0 -908.0 3424.0 -951.0Q3470.0 -973.0 3495.0 -1001.0Q3517.0 -1025.0 3524.0 -1101.0Q3541.0 -1202.0 3594.0 -1317.0Q3612.0 -1354.0 3621.0 -1358.0Q3632.0 -1361.0 3651.0 -1361.0L3649.0 -1328.0Q3644.0 -1205.0 3689.0 -1161.0Q3733.0 -1112.0 3815.0 -1114.0Q3829.0 -1115.0 3846.0 -1127.0Q3877.0 -1148.0 3949.0 -1215.0Q4019.0 -1285.0 4090.0 -1320.0Q4105.0 -1331.0 4114.0 -1354.0Q4154.0 -1433.0 4190.0 -1464.0Z";

// two tilted orbits: [tilt°, rx, ry, seconds per lap, direction]
const ORBITS = [
  { tilt: -16, rx: 272, ry: 104, dur: 14, dir: 1 },
  { tilt: 24, rx: 250, ry: 64, dur: 20, dir: -1 },
];

const ellipsePath = (rx, ry, dir) => {
  const cx = 300, cy = 300;
  const a = dir > 0 ? 1 : 0;
  return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 ${a} ${cx + rx} ${cy} A ${rx} ${ry} 0 1 ${a} ${cx - rx} ${cy}`;
};

function Orbits({ front }) {
  return (
    <svg className={`ab__orbits ${front ? "is-front" : "is-back"}`} viewBox="0 0 600 600" aria-hidden="true">
      <defs>
        <clipPath id="ab-bottom">
          <rect x="-100" y="300" width="800" height="400" />
        </clipPath>
        <linearGradient id="ab-line" x1="0" x2="1">
          <stop offset="0" stopColor="#d6ff32" stopOpacity="0.1" />
          <stop offset="0.5" stopColor="#d6ff32" stopOpacity="0.9" />
          <stop offset="1" stopColor="#d6ff32" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      {ORBITS.map((o, i) => (
        <g key={i} transform={`rotate(${o.tilt} 300 300)`} clipPath={front ? "url(#ab-bottom)" : undefined}>
          <ellipse cx="300" cy="300" rx={o.rx} ry={o.ry} className="ab__ring" />
          <ellipse cx="300" cy="300" rx={o.rx} ry={o.ry} className="ab__flow" style={{ animationDuration: `${o.dur * 0.6}s` }} />
          <circle r="4.5" className="ab__dot">
            <animateMotion dur={`${o.dur}s`} repeatCount="indefinite" path={ellipsePath(o.rx, o.ry, o.dir)} />
          </circle>
          <circle r="11" className="ab__halo">
            <animateMotion dur={`${o.dur}s`} repeatCount="indefinite" path={ellipsePath(o.rx, o.ry, o.dir)} />
          </circle>
        </g>
      ))}
    </svg>
  );
}

export default function About({
  id = "about",
  lines = ["I MAKE", "IDEAS", "FEEL REAL."],
  arabicLabel = "مين أنا؟",
  role = ["UI/UX", "Designer", "Creative Developer"],
  based = "BASED IN EGYPT",
  tagline = ["TURNING", "IDEAS", "INTO", "EXPERIENCES"],
  image = PICTURE,
}) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

  // start the entrance when the section comes into view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setSeen(true), io.disconnect()), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // small mouse parallax (CSS variables only, no re-render)
  const move = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    el.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  };
  const leave = () => {
    ref.current?.style.setProperty("--mx", 0);
    ref.current?.style.setProperty("--my", 0);
  };

  return (
    <section id={id} className={`ab ${seen ? "is-in" : ""}`} ref={ref} onMouseMove={move} onMouseLeave={leave}>
      {/* ---------- left: headline ---------- */}
      <div className="ab__copy">
        <h1 className="ab__title" aria-label={lines.join(" ")}>
          {lines.map((t, i) => (
            <span className="ab__line" key={i} aria-hidden="true">
              <span style={{ "--i": i }}>{t}</span>
            </span>
          ))}
        </h1>
        <p className="ab__ar" role="img" aria-label={arabicLabel} lang="ar">
          <span>
            <svg viewBox={AR_VIEW} aria-hidden="true">
              <path d={AR_PATH} />
            </svg>
          </span>
        </p>
      </div>

      {/* ---------- right: picture + orbits ---------- */}
      <div className="ab__visual">
        <div className="ab__stage">
          <Orbits />
          <div className="ab__float">
            {image ? (
              <img className="ab__img" src={image} alt="Nada's work on laptop and screens" draggable="false" />
            ) : (
              <div className="ab__ph">about-hero.png</div>
            )}
          </div>
          <Orbits front />
          <i className="ab__spark ab__spark--a" />
          <i className="ab__spark ab__spark--b" />
          <i className="ab__spark ab__spark--c" />
        </div>

        <p className="ab__role" aria-label={role.join(" ")}>
          {role.map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </p>
      </div>

      <p className="ab__based">{based}</p>
      <p className="ab__tag">
        {tagline.map((t, i) => (
          <span key={i}>{t}</span>
        ))}
        <b />
      </p>
    </section>
  );
}