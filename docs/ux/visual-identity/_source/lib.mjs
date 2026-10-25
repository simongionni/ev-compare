// Small SVG helpers shared by the three concept renderers.
// Every element is written as a string; styling lives in each concept's <style> block.

export const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const attrs = (o = {}) =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(
      ([k, v]) => ` ${k}="${typeof v === "number" ? +v.toFixed(2) : esc(v)}"`,
    )
    .join("");

export const el = (name, a, inner) =>
  inner === undefined
    ? `<${name}${attrs(a)}/>`
    : `<${name}${attrs(a)}>${inner}</${name}>`;

/** Text. `o.c` is the CSS class, `o.a` the anchor ("start" | "middle" | "end"). */
// A fill passed to text goes into `style`: class rules would otherwise override the attribute.
const textFill = ({ fill, style, ...rest }) => ({
  ...rest,
  style: fill ? `fill:${fill}${style ? ";" + style : ""}` : style,
});

export const t = (x, y, s, o = {}) => {
  const { c, a, ...rest } = o;
  return el(
    "text",
    {
      x,
      y,
      class: c,
      "text-anchor": a && a !== "start" ? a : undefined,
      ...textFill(rest),
    },
    esc(s),
  );
};

/** Text made of differently styled runs: [[text, class], ...]. */
export const tr = (x, y, runs, o = {}) => {
  const { c, a, ...rest } = o;
  const inner = runs
    .map(([s, cls]) => (cls ? el("tspan", { class: cls }, esc(s)) : esc(s)))
    .join("");
  return el(
    "text",
    {
      x,
      y,
      class: c,
      "text-anchor": a && a !== "start" ? a : undefined,
      ...textFill(rest),
    },
    inner,
  );
};

export const r = (x, y, w, h, o = {}) => {
  const { c, rx, ...rest } = o;
  return el("rect", { x, y, width: w, height: h, rx, class: c, ...rest });
};
export const ln = (x1, y1, x2, y2, c, o = {}) =>
  el("line", { x1, y1, x2, y2, class: c, ...o });
export const ci = (cx, cy, rad, c, o = {}) =>
  el("circle", { cx, cy, r: rad, class: c, ...o });
export const p = (d, c, o = {}) => el("path", { d, class: c, ...o });
export const g = (inner, o = {}) =>
  el("g", o, Array.isArray(inner) ? inner.join("") : inner);
export const pl = (pts, c, o = {}) =>
  el("polyline", {
    points: pts.map(([x, y]) => `${+x.toFixed(2)},${+y.toFixed(2)}`).join(" "),
    class: c,
    ...o,
  });

export const svgDoc = ({ w, h, title, desc, style, defs = "", body }) =>
  `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)}</title>
<desc id="desc">${esc(desc)}</desc>
<style>
${style.trim()}
</style>
<defs>${defs}</defs>
${Array.isArray(body) ? body.join("\n") : body}
</svg>
`;

/** Catmull-Rom spline through points, as cubic Bézier path commands (no leading M). */
export const spline = (pts, k = 1) => {
  let d = "";
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1 = [
      p1[0] + ((p2[0] - p0[0]) / 6) * k,
      p1[1] + ((p2[1] - p0[1]) / 6) * k,
    ];
    const c2 = [
      p2[0] - ((p3[0] - p1[0]) / 6) * k,
      p2[1] - ((p3[1] - p1[1]) / 6) * k,
    ];
    d += ` C${c1.map((n) => +n.toFixed(2))} ${c2.map((n) => +n.toFixed(2))} ${p2.map((n) => +n.toFixed(2))}`;
  }
  return d;
};

// ---------------------------------------------------------------------------
// Car side profiles. Normalised box: x 0..100 (front on the right), ground at y 36.
// Shapes are generic body styles, not real models.

const BODY = {
  suv: {
    top: [
      [2, 27],
      [2.5, 19],
      [5, 14],
      [13, 9.6],
      [28, 8],
      [56, 8],
      [64, 9.5],
      [72, 15.4],
      [90, 18],
      [97, 20.5],
      [98.5, 27],
    ],
    win: [
      [11, 15.6],
      [16, 11],
      [28, 9.8],
      [55, 9.8],
      [62, 11.2],
      [68, 15.6],
    ],
    pillar: 41,
    wheels: [21, 79],
    wr: 8,
    k: 1.3,
  },
  compact: {
    top: [
      [4, 27],
      [4.5, 18],
      [7, 12.5],
      [16, 9.4],
      [30, 8.6],
      [52, 9],
      [60, 11],
      [69, 16.6],
      [86, 19.5],
      [95, 22],
      [96.5, 27],
    ],
    win: [
      [11, 15.8],
      [17, 11.2],
      [30, 10.4],
      [51, 10.8],
      [58, 12.4],
      [65, 16.4],
    ],
    pillar: 38,
    wheels: [21, 78],
    wr: 7.4,
    k: 1.25,
  },
  mpv: {
    top: [
      [2, 27],
      [2.4, 14],
      [5, 7.6],
      [14, 5.6],
      [52, 5.4],
      [62, 7.6],
      [73, 15],
      [91, 18.2],
      [97.5, 21],
      [98.5, 27],
    ],
    win: [
      [8, 14.6],
      [9.5, 8.6],
      [16, 7.4],
      [52, 7.2],
      [60, 9.2],
      [68, 15],
    ],
    pillar: 36,
    wheels: [20, 80],
    wr: 7.6,
    k: 1.28,
  },
  wagon: {
    top: [
      [2, 26],
      [2.5, 19.5],
      [5, 15.2],
      [12, 12.4],
      [30, 11.4],
      [57, 11.4],
      [66, 13],
      [75, 17.6],
      [91, 19.6],
      [97.5, 22],
      [98.5, 27],
    ],
    win: [
      [8, 17],
      [13, 13.8],
      [30, 13],
      [56, 13],
      [63, 14.4],
      [71, 17.6],
    ],
    pillar: 44,
    wheels: [20, 80],
    wr: 7.4,
    k: 1.12,
  },
  sedan: {
    top: [
      [2, 26],
      [2.6, 20.5],
      [8, 18.6],
      [20, 16.2],
      [34, 11.6],
      [52, 11.2],
      [60, 12.6],
      [70, 17.8],
      [90, 20],
      [97.5, 22.4],
      [98.5, 27],
    ],
    win: [
      [19, 17.6],
      [33, 13],
      [51, 12.8],
      [58, 14.2],
      [66, 17.8],
    ],
    pillar: 46,
    wheels: [21, 79],
    wr: 7.4,
    k: 1.08,
  },
};

/** Paths for a body style, scaled into a box at (x, y) of width w. */
export const car = (type, x, y, w) => {
  const b = BODY[type];
  const s = w / 100;
  // Profiles are drawn low; k stretches them vertically from the ground line.
  const P = ([px, py]) => [x + px * s, y + (36 - (36 - py) * b.k) * s];
  const top = b.top.map(P);
  const [wr, wf] = b.wheels;
  const R = (b.wr + 1.2) * s;
  const wheelY = y + (36 - b.wr) * s;
  const sillY = wheelY + 0.8 * s;
  const last = top[top.length - 1];
  const f2 = (n) => +n.toFixed(2);
  const body =
    `M${f2(top[0][0])},${f2(sillY)} L${top[0].map(f2)}` +
    spline(top, 0.9) +
    ` L${f2(last[0])},${f2(sillY)}` +
    ` L${f2(x + wf * s + R)},${f2(sillY)} A${f2(R)},${f2(R)} 0 0 0 ${f2(x + wf * s - R)},${f2(sillY)}` +
    ` L${f2(x + wr * s + R)},${f2(sillY)} A${f2(R)},${f2(R)} 0 0 0 ${f2(x + wr * s - R)},${f2(sillY)} Z`;
  const win = b.win.map(P);
  const windows =
    `M${win[0].map((n) => +n.toFixed(2))}` + spline(win, 0.8) + " Z";
  const px = x + b.pillar * s;
  const beltY = Math.max(...win.map((q) => q[1]));
  const pillarTop = win.reduce(
    (best, q) => (Math.abs(q[0] - px) < Math.abs(best[0] - px) ? q : best),
    win[0],
  )[1];
  return {
    body,
    roof: `M${top[1].map(f2)}` + spline(top.slice(1, -1), 0.9),
    windows,
    pillar: `M${px.toFixed(2)},${(pillarTop - 0.5 * s).toFixed(2)} L${px.toFixed(2)},${beltY.toFixed(2)}`,
    door: `M${px.toFixed(2)},${beltY.toFixed(2)} L${px.toFixed(2)},${(sillY - 1.5 * s).toFixed(2)}`,
    wheels: [x + wr * s, x + wf * s],
    wheelY,
    wheelR: b.wr * s,
    ground: y + 36 * s,
    beltY,
    roofY: Math.min(...top.map((q) => q[1])),
    x0: top[0][0],
    x1: last[0],
  };
};

// ---------------------------------------------------------------------------
// Chart scales

export const scale = (d0, d1, r0, r1) => (v) =>
  r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);

export const fmt = (n, dec = 1) => n.toFixed(dec).replace(".", ",");

/** Utility classes for font sizes (.s12), weights (.w6) shared by every concept. */
export const typeUtilities = () =>
  [
    9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28, 30, 32, 36,
    40, 44, 48, 52, 56, 64, 72, 80, 96, 120, 160,
  ]
    .map((s) => `.s${s}{font-size:${s}px}`)
    .join("") +
  [3, 4, 5, 6, 7, 8, 9].map((w) => `.w${w}{font-weight:${w}00}`).join("") +
  ".tab{font-variant-numeric:tabular-nums}.u{text-decoration:underline}.it{font-style:italic}";

/** Small check mark path inside a box of size `s` at (x, y). */
export const checkPath = (x, y, s) =>
  `M${x + s * 0.22},${y + s * 0.52} L${x + s * 0.42},${y + s * 0.72} L${x + s * 0.78},${y + s * 0.3}`;

/** Chevron pointing down, centred at (x, y). */
export const chevron = (x, y, s = 5, up = false) =>
  up
    ? `M${x - s},${y + s / 2} L${x},${y - s / 2} L${x + s},${y + s / 2}`
    : `M${x - s},${y - s / 2} L${x},${y + s / 2} L${x + s},${y - s / 2}`;

/** Magnifier icon. */
export const magnifier = (x, y, s = 14) =>
  `M${x + s * 0.62},${y + s * 0.62} L${x + s},${y + s}`;

/** Review annotation (not UI), same convention as the wireframes. */
export const annotation = (x, y, label) =>
  g([
    el("rect", {
      x,
      y,
      width: label.length * 6.6 + 16,
      height: 18,
      rx: 3,
      fill: "#FFFFFF",
      stroke: "#D63371",
      "stroke-width": 1,
    }),
    el(
      "text",
      {
        x: x + 8,
        y: y + 12.5,
        style:
          "font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;fill:#D63371;letter-spacing:0",
      },
      esc(label),
    ),
  ]);
