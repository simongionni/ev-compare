// Iteration 2, variant B — Livrea Expressive. Racing-livery language: each compared vehicle has
// a colour and a stripe count (1–4 stripes = slot number), so identity never depends on colour
// alone. Signal yellow marks what the user has set (criteria, conditions, selection). Anybody
// changes width: expanded for headings, condensed for figures; Overpass (after US highway
// signage lettering) for text.
import {
  t,
  tr,
  r,
  ln,
  ci,
  p,
  g,
  pl,
  el,
  svgDoc,
  scale,
  fmt,
  typeUtilities,
  checkPath,
  chevron,
  annotation,
  fontFaces,
  photoSlot,
} from "./lib.mjs";
import {
  nav,
  landing,
  vehicles,
  discovery as D,
  comparison as C,
  charging as H,
  effectivePower,
  sampleCurve,
  curvePower,
} from "./content.mjs";

const K = {
  paper: "#F3EFE6",
  white: "#FFFFFF",
  ink: "#141414",
  ink2: "#46433D",
  ink3: "#66635B",
  line: "#DDD7CA",
  line2: "#BFB8A8",
  wash: "#ECE7DC",
  yellow: "#FFD23F",
  yellowTint: "#FFF4C7",
  slot: ["#2548E0", "#E8601C", "#11A37A", "#B8338E"],
  onSlot: ["#FFFFFF", "#141414", "#141414", "#FFFFFF"],
  slotName: ["Cobalto", "Mandarino", "Smeraldo", "Magenta"],
  attn: "#8F5300",
  attnTint: "#FBF1DD",
  crit: "#B3261E",
  critTint: "#FBEAE8",
};
const SLOT = { nordis: 0, aurora: 1 };

const style = `
${fontFaces(["Anybody", "Overpass"])}
text{font-family:Overpass,'Segoe UI',Arial,sans-serif;fill:${K.ink}}
.x{font-family:Anybody,'Arial Black',Arial,sans-serif;font-stretch:140%;font-weight:850}
.xw{font-family:Anybody,Arial,sans-serif;font-stretch:115%;font-weight:700}
.cn{font-family:Anybody,'Arial Narrow',Arial,sans-serif;font-stretch:62%;font-weight:750;font-variant-numeric:tabular-nums}
${typeUtilities()}
.c2{fill:${K.ink2}}.c3{fill:${K.ink3}}.inv{fill:${K.white}}.crit{fill:${K.crit}}
.caps{letter-spacing:1.3px}
.paper{fill:${K.paper}}.white{fill:${K.white}}.ink{fill:${K.ink}}.yel{fill:${K.yellow}}.yt{fill:${K.yellowTint}}.wash{fill:${K.wash}}
.card{fill:${K.white};stroke:${K.line};stroke-width:1}
.field{fill:${K.white};stroke:${K.ink};stroke-width:1.5}
.req{fill:${K.white};stroke:${K.ink2};stroke-width:1.5}
.dash{fill:${K.white};stroke:${K.ink2};stroke-width:1.5;stroke-dasharray:6 4}
.hair{stroke:${K.line};stroke-width:1;fill:none}
.hair2{stroke:${K.line2};stroke-width:1;fill:none}
.rule{stroke:${K.ink};stroke-width:2;fill:none}
.stroke{stroke:${K.ink};stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round}
.strokew{stroke:${K.white};stroke-width:2;fill:none;stroke-linecap:round;stroke-linejoin:round}
.grid{stroke:${K.wash};stroke-width:1;fill:none}
`;
const defs = `<pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="${K.line2}" stroke-width="1.2"/></pattern>`;

// ---------------------------------------------------------------- components

/** Livery stripes: the stripe count is the slot number. */
const stripes = (x, y, i, h = 16, color = K.slot[i], w = 4, gap = 3) =>
  g(
    Array.from({ length: i + 1 }, (_, k) =>
      r(x + k * (w + gap), y, w, h, { fill: color }),
    ),
  );
const stripesW = (i, w = 4, gap = 3) => (i + 1) * (w + gap) - gap;

/** Yellow plate = something the user has set. Ink plate = an outcome. */
const plate = (
  x,
  y,
  w,
  h,
  label,
  { kind = "yellow", size = 14, cls = "cn" } = {},
) =>
  g([
    r(x, y, w, h, {
      rx: Math.min(6, h / 4),
      fill: kind === "yellow" ? K.yellow : K.ink,
    }),
    t(x + w / 2, y + h / 2 + size * 0.36, label, {
      c: `${cls} s${size}`,
      a: "middle",
      fill: kind === "yellow" ? K.ink : K.white,
    }),
  ]);

const logo = (x, y) =>
  g([
    plate(x, y, 34, 26, "EV", { size: 17 }),
    t(x + 42, y + 20, "Compare", { c: "xw s17" }),
  ]);

const navBar = (active, selected = 0) => {
  const xs = [220, 305, 447];
  const out = [
    r(0, 0, 1440, 64, { c: "paper" }),
    ln(0, 63, 1440, 63, "rule"),
    logo(32, 19),
  ];
  nav.items.forEach((it, i) => {
    out.push(t(xs[i], 39, it, { c: `s15 ${active === i ? "w7" : "w4 c2"}` }));
    if (active === i) out.push(r(xs[i], 56, it.length * 8.6, 6, { c: "ink" }));
  });
  if (selected)
    out.push(plate(400, 24, 24, 22, String(selected), { size: 14 }));
  out.push(t(1408, 39, nav.right, { c: "s14 c2", a: "end" }));
  return g(out);
};

const button = (x, y, w, label, kind = "line", h = 40) => {
  if (kind === "ink")
    return g([
      r(x, y, w, h, { rx: 6, c: "ink" }),
      t(x + w / 2, y + h / 2 + 5, label, { c: "s15 w7 inv", a: "middle" }),
    ]);
  return g([
    r(x, y, w, h, { rx: 6, c: "field" }),
    t(x + w / 2, y + h / 2 + 5, label, { c: "s14 w7", a: "middle" }),
  ]);
};

const segmented = (x, y, labels, active, widths, h = 36) => {
  const total = widths.reduce((a, b) => a + b, 0);
  const out = [r(x, y, total, h, { rx: 6, c: "field" })];
  let cx = x;
  labels.forEach((l, i) => {
    if (i === active)
      out.push(
        r(cx + 3, y + 3, widths[i] - 6, h - 6, {
          rx: 4,
          c: "yel",
          stroke: K.ink,
          "stroke-width": 1.5,
        }),
      );
    if (i) out.push(ln(cx, y + 8, cx, y + h - 8, "hair2"));
    out.push(
      t(cx + widths[i] / 2, y + h / 2 + 5, l, {
        c: `s14 ${i === active ? "w7" : "w4 c2"}`,
        a: "middle",
      }),
    );
    cx += widths[i];
  });
  return g(out);
};

const glyph = (x, y, name) => {
  if (name === "costruttore") return r(x, y - 8, 8, 8, { c: "ink" });
  if (name === "stima")
    return ci(x + 4, y - 4, 3.6, "", {
      fill: "none",
      stroke: K.ink,
      "stroke-width": 1.5,
    });
  return p(
    `M${x + 4},${y - 9} L${x + 8.5},${y - 4} L${x + 4},${y + 1} L${x - 0.5},${y - 4} Z`,
    "ink",
  );
};
const tag = (xRight, y, name) =>
  g([
    glyph(xRight - name.length * 6.6 - 13, y, name),
    t(xRight, y, name, { c: "s12 c2", a: "end" }),
  ]);

const check = (x, y, s = 13) =>
  g([
    r(x, y, s, s, { rx: 2, c: "ink" }),
    p(checkPath(x, y, s), "strokew", { "stroke-width": 1.8 }),
  ]);
const missIcon = (cx, cy) =>
  g([
    ci(cx, cy, 8, "", {
      fill: K.critTint,
      stroke: K.crit,
      "stroke-width": 1.5,
    }),
    ln(cx - 4, cy, cx + 4, cy, "", {
      stroke: K.crit,
      "stroke-width": 2,
      "stroke-linecap": "round",
    }),
  ]);

/** Vehicle chip: white pill with the stripes, the name and a remove control. */
const chip = (x, y, w, i, label) =>
  g([
    r(x, y, w, 32, {
      rx: 6,
      fill: K.white,
      stroke: K.ink,
      "stroke-width": 1.5,
    }),
    stripes(x + 10, y + 8, i, 16),
    t(x + 16 + stripesW(i), y + 21, label, { c: "s14 w7" }),
    t(x + w - 13, y + 21, "×", { c: "s16 c2", a: "middle" }),
  ]);

/** Livery band: slot colour, stripes in the contrasting colour, optional label. */
const band = (x, y, w, h, i, label, cls = "xw s17") =>
  g([
    r(x, y, w, h, { fill: K.slot[i] }),
    stripes(x + 14, y + (h - 18) / 2, i, 18, K.onSlot[i]),
    label
      ? t(x + 24 + stripesW(i), y + h / 2 + 6, label, {
          c: cls,
          fill: K.onSlot[i],
        })
      : "",
  ]);

const marker = (x, y, i, s = 5) =>
  i % 2 === 0
    ? ci(x, y, s, "", { fill: K.slot[i], stroke: K.white, "stroke-width": 2 })
    : r(x - s, y - s, s * 2, s * 2, {
        fill: K.slot[i],
        stroke: K.white,
        "stroke-width": 2,
      });

const clipPhoto = (id, x, y, w, h, rx, opts) =>
  g([
    el("clipPath", { id }, r(x, y, w, h, { rx })),
    g(photoSlot(x, y, w, h, opts), { "clip-path": `url(#${id})` }),
  ]);

// ---------------------------------------------------------------- screens

function landingScreen() {
  const L = landing;
  const b = [r(0, 0, 1440, 880, { c: "paper" }), navBar(-1)];
  // photographs as composition: three tall frames, staggered
  [
    [792, 92, 180, 262],
    [988, 120, 180, 262],
    [1184, 100, 180, 262],
  ].forEach(([x, y, w, h], k) =>
    b.push(
      clipPhoto(`lp${k}`, x, y, w, h, 6, {
        model: "Catalogo",
        view: ["foto 1", "foto 2", "foto 3"][k],
      }),
    ),
  );
  b.push(
    t(64, 160, "Trova l’auto", { c: "x s64", "letter-spacing": "-1" }),
    t(64, 230, "elettrica", { c: "x s64", "letter-spacing": "-1" }),
    t(64, 300, "adatta a te.", { c: "x s64", "letter-spacing": "-1" }),
  );
  b.push(t(68, 344, L.subtitle, { c: "s26 c2" }));

  const py = 386;
  b.push(
    r(64, py, 640, 300, { rx: 8, c: "card" }),
    r(64, py, 640, 6, { c: "ink" }),
  );
  b.push(t(92, py + 48, L.model.heading, { c: "xw s22" }));
  b.push(
    r(92, py + 66, 474, 52, { rx: 8, c: "field", "stroke-width": 2 }),
    ci(120, py + 91, 7, "stroke"),
    ln(125, py + 96, 130, py + 101, "stroke"),
  );
  b.push(
    t(144, py + 99, L.model.query, { c: "s18" }),
    ln(178, py + 80, 178, py + 104, "stroke"),
  );
  b.push(button(576, py + 66, 100, L.model.button, "ink", 52));
  b.push(t(92, py + 148, "MODELLI", { c: "s11 w7 c3 caps" }));
  L.model.models.forEach((m, i) => {
    const y = py + 158 + i * 46;
    b.push(clipPhoto(`lt${i}`, 92, y, 54, 36, 4, { model: m.name }));
    b.push(
      t(160, y + 24, m.name, { c: "xw s16" }),
      t(282, y + 24, m.body, { c: "s14 c2" }),
      t(676, y + 24, m.action, { c: "s14 w7 u", a: "end" }),
    );
  });
  b.push(
    ln(92, py + 256, 676, py + 256, "hair"),
    t(92, py + 282, L.model.brands[0].name, { c: "s15 w7" }),
    t(330, py + 282, L.model.all, { c: "s13 c3" }),
    t(676, py + 282, L.model.brands[0].action, { c: "s14 w7 u", a: "end" }),
  );

  // needs: yellow wash, the colour of what the user sets
  b.push(
    r(728, py, 648, 300, { rx: 8, c: "yt" }),
    r(728, py, 648, 6, { c: "yel" }),
  );
  b.push(t(756, py + 48, L.needs.heading, { c: "xw s22" }));
  let cx = 756,
    cy = py + 70;
  L.needs.chips.forEach((chip) => {
    const w = chip.length * 8.2 + 46;
    if (cx + w > 1350) {
      cx = 756;
      cy += 50;
    }
    b.push(
      r(cx, cy, w, 40, { rx: 6, c: "field" }),
      t(cx + 16, cy + 26, "+", { c: "x s16" }),
      t(cx + 34, cy + 26, chip, { c: "s15 w7" }),
    );
    cx += w + 10;
  });
  b.push(button(756, py + 192, 320, L.needs.cta, "ink", 52));

  const dy = 724;
  b.push(t(64, dy, L.direct.heading.toUpperCase(), { c: "s12 w7 c3 caps" }));
  L.direct.items.forEach((it, i) => {
    const x = 64 + i * 440;
    b.push(
      r(x, dy + 14, 416, 104, { rx: 8, c: "card" }),
      r(x, dy + 14, 6, 104, { c: "ink" }),
    );
    b.push(
      t(x + 28, dy + 52, it.title, { c: "xw s20" }),
      t(x + 28, dy + 76, it.text, { c: "s14 c2" }),
      t(x + 28, dy + 102, it.link, { c: "s14 w7 u" }),
    );
  });
  b.push(t(64, 866, L.footer, { c: "s12 c3" }));
  return svgDoc({
    w: 1440,
    h: 880,
    title: "Livrea Expressive — Landing Page",
    desc: "Variante Livrea Expressive applicata alla landing consolidata. Le fotografie sono segnaposto.",
    style,
    defs,
    body: b,
  });
}

function criterionBox(x, y, w, item, kind, open = false) {
  const out = [
    r(x, y, w, 52, {
      rx: 6,
      c: open ? "field" : kind === "req" ? "req" : "dash",
      "stroke-width": open ? 2.5 : undefined,
    }),
  ];
  out.push(r(x + 1.5, y + 8, 5, 36, { rx: 2, c: "yel" }));
  out.push(
    t(x + 18, y + 21, item.label, { c: "s12 c2" }),
    t(x + 18, y + 41, item.value, { c: "s16 w7" }),
  );
  if (item.spec)
    out.push(plate(x + 156, y + 9, 40, 17, "SPEC", { kind: "ink", size: 11 }));
  out.push(p(chevron(x + w - 22, y + 26, 5, open), "stroke"));
  return g(out);
}

function discoveryScreen() {
  const b = [r(0, 0, 1440, 1330, { c: "paper" }), navBar(0, 2)];
  b.push(
    r(32, 84, 1376, 52, { rx: 8, c: "field", "stroke-width": 2 }),
    ci(60, 109, 7, "stroke"),
    ln(65, 114, 70, 119, "stroke"),
    t(86, 116, D.search, { c: "s16 c3" }),
  );
  b.push(
    t(32, 190, "Criteri attivi", { c: "xw s20" }),
    plate(216, 172, 26, 24, "6", { size: 15 }),
    t(352, 190, D.reset, { c: "s13 w7 u", a: "end" }),
  );
  b.push(
    r(32, 206, 28, 14, { rx: 3, c: "req" }),
    t(68, 218, D.legend.req, { c: "s12 c2" }),
    r(196, 206, 28, 14, { rx: 3, c: "dash" }),
    t(232, 218, D.legend.pref, { c: "s12 c2" }),
  );
  b.push(t(32, 250, "REQUISITI", { c: "s11 w7 c3 caps" }));
  D.requirements.forEach((it, i) =>
    b.push(criterionBox(32, 260 + i * 60, 320, it, "req", it.open)),
  );
  const E = D.editor,
    ey = 436;
  b.push(r(32, ey, 320, 304, { rx: 6, c: "white" }));
  b.push(
    t(48, ey + 30, E.min, { c: "s13 c2" }),
    t(336, ey + 34, E.minValue, { c: "cn s26", a: "end" }),
  );
  const sx = scale(50, 350, 58, 326);
  b.push(
    r(sx(50), ey + 52, sx(350) - sx(50), 4, { rx: 2, fill: K.line2 }),
    r(sx(100), ey + 50, sx(350) - sx(100), 8, { rx: 2, c: "yel" }),
  );
  [100, 350].forEach((v) =>
    b.push(
      r(sx(v) - 7, ey + 44, 14, 20, { rx: 3, c: "field", "stroke-width": 2 }),
    ),
  );
  b.push(
    t(48, ey + 84, E.from, { c: "s12 c3" }),
    t(336, ey + 84, E.to, { c: "s12 c3", a: "end" }),
  );
  b.push(
    t(48, ey + 114, E.behaviour, { c: "s13 c2" }),
    segmented(48, ey + 124, [E.req, E.pref], 0, [144, 144], 36),
  );
  b.push(ln(48, ey + 178, 336, ey + 178, "hair"));
  b.push(
    ci(57, ey + 198, 9, "", {
      fill: "none",
      stroke: K.ink,
      "stroke-width": 1.5,
    }),
    t(57, ey + 203, "?", { c: "s12 w7", a: "middle" }),
    t(76, ey + 203, E.explain, { c: "s15 w7" }),
    t(336, ey + 203, E.explainAction, { c: "s13 w7 u", a: "end" }),
  );
  b.push(ln(48, ey + 220, 336, ey + 220, "hair"));
  b.push(
    t(48, ey + 242, E.linkedKicker, { c: "s11 w7 c3 caps" }),
    tag(336, ey + 242, "calcolo"),
  );
  b.push(
    t(48, ey + 264, E.linkedTitle, { c: "s15 w7" }),
    t(48, ey + 282, E.linkedText, { c: "s12 c2" }),
    t(48, ey + 298, E.linkedAction, { c: "s13 w7 u" }),
  );

  b.push(t(32, 774, "PREFERENZE", { c: "s11 w7 c3 caps" }));
  D.preferences.forEach((it, i) =>
    b.push(criterionBox(32, 784 + i * 60, 320, it, "pref")),
  );
  b.push(
    button(32, 968, 320, D.addCriterion, "line", 44),
    t(32, 1032, D.categories, { c: "s12 c3" }),
  );

  b.push(plate(384, 156, 58, 70, "3", { kind: "ink", size: 64 }));
  b.push(
    t(458, 190, "veicoli rispettano", { c: "x s24" }),
    t(458, 218, "tutti i requisiti", { c: "x s24" }),
  );
  b.push(t(458, 242, D.resultsSub, { c: "s14 c2" }));
  b.push(
    segmented(930, 168, D.views, 0, [86, 78, 108], 40),
    r(1214, 168, 194, 40, { rx: 6, c: "field" }),
    t(1230, 193, D.sort, { c: "s14 w7" }),
    p(chevron(1388, 188), "stroke"),
  );
  b.push(
    r(384, 262, 1024, 40, { rx: 6, c: "yt" }),
    r(384, 262, 6, 40, { c: "yel" }),
    t(404, 287, D.notice, { c: "s14" }),
    t(1392, 287, D.undo, { c: "s14 w7 u", a: "end" }),
  );
  b.push(
    r(384, 314, 1024, 58, { rx: 8, c: "card" }),
    t(404, 348, "Nel confronto", { c: "xw s16" }),
    plate(556, 330, 24, 24, "2", { size: 15 }),
  );
  D.tray.items.forEach((it, i) => b.push(chip(596 + i * 164, 327, 152, i, it)));
  b.push(
    t(1240, 348, D.tray.diff, { c: "s14 w7 u", a: "end" }),
    button(1256, 323, 140, D.tray.cta, "ink", 40),
  );

  D.results.forEach((res, i) => {
    const v = vehicles[res.id];
    const s = res.inCompare ? SLOT[res.id] : -1;
    const x = 384 + i * 347,
      y = 388,
      w = 330;
    b.push(
      r(x, y, w, 468, { rx: 8, c: "card" }),
      clipPhoto(`cp${i}`, x, y, w, 176, 0, { model: v.name }),
    );
    if (s >= 0)
      b.push(
        band(x, y + 176, w, 30, s, ""),
        t(x + w - 14, y + 197, `${s + 1}`, {
          c: "cn s20",
          a: "end",
          fill: K.onSlot[s],
        }),
      );
    else b.push(r(x, y + 176, w, 30, { c: "wash" }));
    b.push(
      t(x + 18, y + 238, v.name, { c: "xw s20" }),
      t(x + 18, y + 258, v.kind, { c: "s13 c2" }),
    );
    b.push(
      t(x + 18, y + 298, v.price, { c: "cn s36" }),
      t(x + w - 18, y + 298, "listino", { c: "s12 c3", a: "end" }),
    );
    D.reqLabels.forEach((l, k) => {
      const lx = x + 18 + [0, 86, 198][k];
      b.push(check(lx, y + 314), t(lx + 19, y + 325, l, { c: "s13 w7" }));
    });
    b.push(ln(x + 18, y + 340, x + w - 18, y + 340, "hair"));
    b.push(
      check(x + 18, y + 350, 11),
      t(x + 35, y + 360, `Viaggio 400 km: ${v.stop}`, { c: "s13" }),
      tag(x + w - 18, y + 360, "stima"),
    );
    b.push(
      check(x + 18, y + 370, 11),
      t(x + 35, y + 380, D.prefDaily, { c: "s13" }),
    );
    b.push(
      t(x + 18, y + 410, D.why, { c: "s13 w7 u" }),
      t(x + w - 18, y + 410, res.specs, { c: "s13 c2", a: "end" }),
    );
  });
  D.results.forEach((res, i) => {
    const x = 384 + i * 347,
      y = 388;
    b.push(button(x + 18, y + 420, 118, "Apri scheda", "line", 34));
    if (res.inCompare)
      b.push(
        r(x + 144, y + 420, 168, 34, { rx: 6, c: "ink" }),
        p(checkPath(x + 154, y + 428, 18), "strokew"),
        t(x + 178, y + 442, "Nel confronto", { c: "s14 w7 inv" }),
      );
    else
      b.push(
        button(x + 144, y + 420, 168, "+ Aggiungi al confronto", "line", 34),
      );
  });

  b.push(
    t(384, 888, D.near.title, { c: "x s22" }),
    t(384, 910, D.near.sub, { c: "s14 c2" }),
  );
  D.near.items.forEach((n, i) => {
    const v = vehicles[n.id],
      y = 926 + i * 96;
    b.push(r(385, y + 1, 1022, 82, { rx: 8, c: "dash" }));
    b.push(clipPhoto(`np${i}`, 398, y + 12, 108, 60, 4, { model: v.name }));
    b.push(
      t(522, y + 34, v.name, { c: "xw s17" }),
      t(522, y + 54, v.kind, { c: "s13 c2" }),
      t(522, y + 72, "Apri scheda ›", { c: "s13 w7 u" }),
    );
    const [lab, val, over] = n.miss.split(": ");
    b.push(
      t(786, y + 32, D.near.missKicker, { c: "s11 w7 c3 caps" }),
      missIcon(794, y + 52),
      tr(
        810,
        y + 57,
        [
          [`${lab}: ${val}: `, ""],
          [over, "crit"],
        ],
        { c: "s13 w7" },
      ),
    );
    b.push(
      button(1078, y + 14, 210, n.fix, "line", 34),
      t(1183, y + 70, n.flex, { c: "s12 w7 u", a: "middle" }),
    );
    b.push(
      r(1304, y + 24, 16, 16, { rx: 3, c: "field" }),
      t(1328, y + 37, "Confronta", { c: "s13" }),
    );
  });
  b.push(t(384, 1150, D.deeper.title, { c: "x s22" }));
  D.deeper.items.forEach((it, i) => {
    const x = 384 + i * 520;
    b.push(
      r(x, 1164, 504, 72, { rx: 8, c: "card" }),
      r(x, 1164, 6, 72, { c: "ink" }),
      t(x + 26, 1194, it.title, { c: "xw s16" }),
      t(x + 26, 1216, it.text, { c: "s13 c2" }),
      t(x + 478, 1206, "→", { c: "s20 w7", a: "end" }),
    );
  });
  b.push(
    t(384, 1278, D.footnote, { c: "s12 c3" }),
    t(384, 1300, D.footlink, { c: "s12 w7 u" }),
  );
  return svgDoc({
    w: 1440,
    h: 1330,
    title: "Livrea Expressive — Vehicle Discovery, Active Criteria",
    desc: "Variante Livrea Expressive applicata alla ricerca con sei criteri attivi. Le fotografie sono segnaposto.",
    style,
    defs,
    body: b,
  });
}

function comparisonScreen() {
  const b = [r(0, 0, 1440, 1628, { c: "paper" }), navBar(1, 2)];
  const COL = [424, 748];
  // the context bar carries the user's criteria: yellow wash
  b.push(
    r(0, 65, 1440, 46, { c: "yt" }),
    t(32, 94, C.context.back, { c: "s14 w7 u" }),
    t(112, 94, C.context.summary, { c: "s14 c2" }),
    t(1408, 94, C.context.edit, { c: "s14 w7 u", a: "end" }),
  );
  b.push(
    t(32, 176, C.title, { c: "x s40", "letter-spacing": "-0.8" }),
    t(32, 202, C.count, { c: "s15 c2" }),
  );
  b.push(
    t(32, 244, "RIGHE", { c: "s11 w7 c3 caps" }),
    segmented(32, 254, C.rowsToggle, 1, [74, 140], 36),
  );
  b.push(
    t(32, 314, "VISTA", { c: "s11 w7 c3 caps" }),
    segmented(32, 324, C.viewToggle, 0, [92, 86], 36),
  );
  C.columns.forEach((id, i) => {
    const v = vehicles[id],
      x = COL[i],
      s = SLOT[id];
    b.push(
      clipPhoto(`hp${i}`, x, 132, 300, 132, 0, { model: v.name }),
      band(x, 264, 300, 44, s, v.name, "xw s18"),
    );
    b.push(
      t(x, 334, v.kind, { c: "s13 c2" }),
      t(x, 368, v.price, { c: "cn s32" }),
    );
    b.push(
      t(x, 392, C.actions.open, { c: "s13 w7 u" }),
      t(x + 230, 392, C.actions.replace, { c: "s13 c2 u", a: "end" }),
      t(x + 300, 392, C.actions.remove, { c: "s13 c2 u", a: "end" }),
    );
  });
  b.push(
    r(1072, 132, 336, 270, { rx: 8, c: "dash" }),
    t(1096, 168, C.add.title, { c: "xw s16" }),
  );
  b.push(
    r(1096, 184, 288, 44, { rx: 6, c: "field" }),
    ci(1120, 206, 6, "stroke"),
    ln(1124, 210, 1129, 215, "stroke"),
    t(1140, 211, C.add.search, { c: "s14 c3" }),
  );
  b.push(t(1096, 258, C.add.kicker, { c: "s11 w7 c3 caps" }));
  C.add.items.forEach((it, i) => {
    const y = 288 + i * 34;
    b.push(
      t(1096, y, it.name, { c: "s15 w7" }),
      t(1210, y, it.note, { c: "s13 c2" }),
      r(1360, y - 17, 24, 24, { rx: 4, c: "ink" }),
      t(1372, y + 1, "+", { c: "s17 w7 inv", a: "middle" }),
    );
  });
  b.push(ln(0, 420, 1440, 420, "rule"));

  const row = (
    y,
    label,
    tg,
    values,
    notes = [],
    checks = false,
    bars,
    hover = false,
  ) => {
    const out = [];
    if (hover) out.push(r(20, y - 26, 1400, 42, { rx: 4, c: "wash" }));
    out.push(t(32, y, label, { c: "s15" }));
    if (tg) out.push(tag(400, y, tg));
    values.forEach((val, i) => {
      const x = COL[i];
      if (checks) out.push(check(x, y - 12, 13));
      out.push(t(x + (checks ? 22 : 0), y, val, { c: "s16 w7" }));
      if (notes[i])
        out.push(
          t(x + (checks ? 22 : 0) + val.length * 9.6 + 12, y, notes[i], {
            c: "s12 c2",
          }),
        );
      if (bars)
        out.push(
          r(x, y + 9, bars[i], 6, { fill: K.slot[i] }),
          stripes(x + bars[i] + 4, y + 8, i, 8, K.slot[i], 2, 2),
        );
    });
    if (!hover)
      out.push(
        ln(32, y + (bars ? 24 : 16), 1408, y + (bars ? 24 : 16), "hair"),
      );
    return g(out);
  };
  const section = (y, title) => t(32, y, title, { c: "x s24" });

  b.push(section(462, C.criteria.title));
  b.push(t(32, 492, "REQUISITI", { c: "s11 w7 c3 caps" }));
  C.criteria.requirements.forEach((rw, i) =>
    b.push(
      row(
        524 + i * 42,
        rw.label,
        null,
        rw.values,
        rw.notes,
        true,
        null,
        i === 1,
      ),
    ),
  );
  b.push(t(32, 650, "PREFERENZE", { c: "s11 w7 c3 caps" }));
  C.criteria.preferences.forEach((rw, i) =>
    b.push(row(682 + i * 42, rw.label, rw.tag, rw.values, [], true)),
  );

  b.push(section(836, C.others.title));
  C.others.rows.forEach((rw, i) => {
    const max = Math.max(...rw.num) * 1.1;
    b.push(
      row(
        872 + i * 50,
        rw.label,
        rw.tag,
        rw.values,
        rw.notes || [],
        false,
        rw.num.map((n) => (n / max) * 250),
      ),
    );
  });

  b.push(
    section(1040, C.details.title),
    t(1408, 1040, C.details.hidden, { c: "s13 c2", a: "end" }),
  );
  b.push(ln(32, 1056, 1408, 1056, "rule"));
  b.push(
    t(32, 1088, C.details.open.title, { c: "xw s17" }),
    t(
      32 + C.details.open.title.length * 12.4 + 16,
      1088,
      C.details.open.count,
      { c: "s13 c2" },
    ),
    p(chevron(1396, 1083, 5, true), "stroke"),
  );
  C.details.open.rows.forEach((rw, i) =>
    b.push(row(1128 + i * 38, rw.label, rw.tag, rw.values)),
  );
  C.details.closed.forEach((grp, i) => {
    const y = 1300 + i * 44;
    b.push(
      t(32, y, grp.title, { c: "xw s17" }),
      t(32 + grp.title.length * 12.4 + 16, y, grp.count, { c: "s13 c2" }),
    );
    if (grp.action) b.push(t(1366, y, grp.action, { c: "s13 w7 u", a: "end" }));
    b.push(
      p(chevron(1396, y - 5), "stroke"),
      ln(32, y + 16, 1408, y + 16, "hair"),
    );
  });
  b.push(section(1492, C.simulations.title));
  C.simulations.items.forEach((s, i) => {
    const x = 32 + i * 700;
    b.push(
      r(x + (i ? 1 : 0), 1508, 676, 72, { rx: 8, c: i ? "dash" : "card" }),
    );
    if (!i) b.push(r(x, 1508, 6, 72, { c: "ink" }));
    b.push(
      t(x + 26, 1538, s.title, { c: "xw s17" }),
      t(x + 26, 1560, s.text, { c: "s13 c2" }),
      t(x + 652, 1550, s.action, { c: "s14 w7 u", a: "end" }),
    );
    if (s.notImplemented) b.push(annotation(x + 520, 1514, "NON IMPLEMENTATO"));
  });
  b.push(
    t(32, 1604, C.footnote, { c: "s12 c3" }),
    t(32, 1622, C.footlink, { c: "s12 w7 u" }),
  );
  return svgDoc({
    w: 1440,
    h: 1628,
    title: "Livrea Expressive — Comparison, Selected Vehicles",
    desc: "Variante Livrea Expressive applicata al confronto con criteri. La riga Bagagliaio mostra lo stato al passaggio del puntatore.",
    style,
    defs,
    body: b,
  });
}

function chargingScreen() {
  const W = 1440,
    Hh = 1120;
  const b = [r(0, 0, W, Hh, { c: "paper" }), navBar(1, 2)];
  b.push(
    r(0, 65, W, 46, { c: "white" }),
    ln(0, 111, W, 111, "hair"),
    t(32, 94, H.back, { c: "s14 w7 u" }),
    t(128, 94, H.backContext, { c: "s14 c2" }),
  );
  b.push(t(32, 168, H.title, { c: "x s40", "letter-spacing": "-0.8" }));
  H.vehicles.forEach((v, i) => {
    const s = SLOT[v.id];
    b.push(
      stripes(1090 + i * 160, 146, s, 16),
      t(1098 + stripesW(s) + i * 160, 159, v.name, { c: "s15 w7" }),
    );
  });
  b.push(
    r(32, 186, 1376, 104, { rx: 8, c: "card" }),
    t(52, 212, H.conditionsKicker, { c: "s11 w7 c3 caps" }),
  );
  const cx = [52, 452, 716, 1044];
  H.conditions.forEach((cd, i) => {
    b.push(t(cx[i], 236, cd.label, { c: "s13 c2" }));
    if (cd.options)
      b.push(
        segmented(
          cx[i],
          246,
          cd.options,
          cd.active,
          i === 1 ? [66, 76, 76] : i === 0 ? [186, 168] : [150, 126],
          36,
        ),
      );
    else {
      b.push(t(cx[i] + 290, 238, cd.range, { c: "cn s20", a: "end" }));
      const s = scale(0, 100, cx[i] + 8, cx[i] + 282);
      b.push(
        r(s(0), 262, s(100) - s(0), 4, { rx: 2, fill: K.line2 }),
        r(s(10), 260, s(80) - s(10), 8, { rx: 2, c: "yel" }),
      );
      [10, 80].forEach((v) =>
        b.push(
          r(s(v) - 7, 254, 14, 20, { rx: 3, c: "field", "stroke-width": 2 }),
        ),
      );
    }
  });
  H.vehicles.forEach((v, i) => {
    const x = 32 + i * 696,
      s = SLOT[v.id];
    b.push(
      r(x, 306, 680, 132, { rx: 8, c: "card" }),
      band(x, 306, 680, 36, s, v.name, "xw s16"),
      t(x + 664, 330, "da 10% a 80%", {
        c: "s12 w7",
        a: "end",
        fill: K.onSlot[s],
      }),
    );
    b.push(
      t(x + 22, 420, v.result.time, { c: "cn s64" }),
      tag(x + 656, 428, "calcolo"),
    );
    b.push(
      t(x + 300, 376, v.result.energy, { c: "s15 w7" }),
      t(x + 300, 398, v.result.avg, { c: "s14 c2" }),
      t(x + 300, 420, v.result.limit, { c: "s14 c2" }),
    );
  });
  const [nv, av] = H.vehicles;
  const [sN, sA] = [SLOT.nordis, SLOT.aurora];
  const endTag = (x, y, label, i) => {
    const w = label.length * 7.6 + 24 + stripesW(i);
    return g([
      r(x, y - 13, w, 24, { rx: 4, fill: K.slot[i] }),
      stripes(x + 8, y - 7, i, 12, K.onSlot[i], 3, 2),
      t(x + 14 + stripesW(i, 3, 2), y + 4, label, {
        c: "s13 w7",
        fill: K.onSlot[i],
      }),
    ]);
  };

  const PX = [92, 684],
    PY = [524, 824];
  const sx = scale(0, 100, PX[0], PX[1]),
    sy = scale(0, 200, PY[1], PY[0]);
  b.push(
    r(32, 454, 680, 430, { rx: 8, c: "card" }),
    t(52, 490, "Potenza per livello di carica", { c: "xw s17" }),
  );
  b.push(r(sx(10), PY[0], sx(80) - sx(10), PY[1] - PY[0], { c: "yt" }));
  b.push(
    r(PX[0], PY[0], PX[1] - PX[0], sy(150) - PY[0], {
      fill: "url(#hatch)",
      opacity: 0.8,
    }),
    t(PX[0] + 8, PY[0] + 16, "oltre la potenza della colonnina", {
      c: "s12 c3",
    }),
  );
  for (let kw = 0; kw <= 200; kw += 50)
    b.push(
      ln(PX[0], sy(kw), PX[1], sy(kw), "grid"),
      t(PX[0] - 12, sy(kw) + 5, String(kw), { c: "cn s15 c2", a: "end" }),
    );
  for (let s = 0; s <= 100; s += 20)
    b.push(t(sx(s), PY[1] + 24, `${s}%`, { c: "cn s15 c2", a: "middle" }));
  b.push(
    t(PX[0] - 12, PY[0] - 12, "kW", { c: "s12 c3", a: "end" }),
    ln(PX[0], PY[1], PX[1], PY[1], "rule"),
  );
  b.push(t(sx(45), PY[1] - 8, "10 → 80%", { c: "s12 w7", a: "middle" }));
  b.push(
    ln(PX[0], sy(150), PX[1], sy(150), "", {
      stroke: K.ink,
      "stroke-width": 1.5,
      "stroke-dasharray": "8 4",
    }),
    plate(PX[1] - 128, sy(150) - 30, 128, 22, "colonnina 150 kW", {
      size: 13,
      cls: "w7",
    }),
  );
  const toPts = (pts) => pts.map(([s, kw]) => [sx(s), sy(kw)]);
  b.push(
    pl(
      toPts(
        sampleCurve(
          (s) => Math.min(curvePower(nv.curve, s), nv.maxDc),
          nv.curve,
        ),
      ),
      "",
      {
        stroke: K.slot[sN],
        "stroke-width": 1.5,
        fill: "none",
        "stroke-dasharray": "2 4",
        "stroke-linecap": "round",
      },
    ),
  );
  b.push(
    pl(
      toPts(sampleCurve((s) => effectivePower(av, s, H.station), av.curve)),
      "",
      {
        stroke: K.slot[sA],
        "stroke-width": 3,
        fill: "none",
        "stroke-linejoin": "round",
      },
    ),
  );
  b.push(
    pl(
      toPts(sampleCurve((s) => effectivePower(nv, s, H.station), nv.curve)),
      "",
      {
        stroke: K.slot[sN],
        "stroke-width": 3,
        fill: "none",
        "stroke-linejoin": "round",
      },
    ),
  );
  nv.curve.forEach(([s, kw]) =>
    b.push(marker(sx(s), sy(Math.min(kw, nv.maxDc)), sN)),
  );
  av.curve.forEach(([s, kw]) => b.push(marker(sx(s), sy(kw), sA)));
  b.push(
    endTag(sx(80) + 10, sy(130), "Nordis E4", sN),
    endTag(sx(22), sy(104), "Aurora Vela", sA),
  );
  b.push(
    marker(60, 868, sN, 4.5),
    t(
      72,
      872,
      "punto dichiarato dal costruttore · tra i punti: interpolazione lineare",
      { c: "s12 c3" },
    ),
  );

  const EX = [788, 1380],
    EY = PY;
  const ex = scale(0, 30, EX[0], EX[1]),
    ey = scale(0, 60, EY[1], EY[0]);
  b.push(
    r(728, 454, 680, 430, { rx: 8, c: "card" }),
    t(748, 490, "Energia caricata nel tempo", { c: "xw s17" }),
  );
  for (let k = 0; k <= 60; k += 20)
    b.push(
      ln(EX[0], ey(k), EX[1], ey(k), "grid"),
      t(EX[0] - 12, ey(k) + 5, String(k), { c: "cn s15 c2", a: "end" }),
    );
  for (let m = 0; m <= 30; m += 5)
    b.push(t(ex(m), EY[1] + 24, `${m} min`, { c: "cn s15 c2", a: "middle" }));
  b.push(
    t(EX[0] - 12, EY[0] - 12, "kWh", { c: "s12 c3", a: "end" }),
    ln(EX[0], EY[1], EX[1], EY[1], "rule"),
  );
  b.push(
    pl(
      av.energy.map(([m, k]) => [ex(m), ey(k)]),
      "",
      { stroke: K.slot[sA], "stroke-width": 3, fill: "none" },
    ),
    pl(
      nv.energy.map(([m, k]) => [ex(m), ey(k)]),
      "",
      { stroke: K.slot[sN], "stroke-width": 3, fill: "none" },
    ),
  );
  [nv, av].forEach((v, i) => {
    const s = SLOT[v.id];
    b.push(
      marker(ex(v.end.min), ey(v.end.kwh), s, 6),
      t(ex(v.end.min) + (i ? -10 : 12), ey(v.end.kwh) + (i ? -12 : 5), "80%", {
        c: "cn s16",
        a: i ? "end" : "start",
      }),
    );
  });
  b.push(
    ln(ex(20), EY[0], ex(20), EY[1], "", {
      stroke: K.ink,
      "stroke-width": 1.2,
    }),
    plate(ex(20) - 32, EY[0] - 22, 64, 20, "20 min", {
      kind: "ink",
      size: 13,
      cls: "w7",
    }),
  );
  [nv, av].forEach((v, i) => {
    const s = SLOT[v.id];
    b.push(
      ci(ex(20), ey(v.at20.kwh), 6, "", {
        fill: K.white,
        stroke: K.slot[s],
        "stroke-width": 3,
      }),
    );
    b.push(
      endTag(
        i ? ex(20) + 12 : ex(20) - 150,
        ey(v.at20.kwh) + (i ? 20 : -14),
        `${fmt(v.at20.kwh)} kWh · ${v.at20.soc}%`,
        s,
      ),
    );
  });
  b.push(
    t(
      748,
      872,
      "Valori del simulatore M0.1 · partenza dal 10%, colonnina 150 kW",
      { c: "s12 c3" },
    ),
  );

  b.push(
    r(32, 902, 680, 196, { rx: 8, c: "card" }),
    t(52, 934, "Con altre colonnine", { c: "xw s17" }),
    t(270, 934, "da 10% a 80%", { c: "s13 c3" }),
  );
  const TX = [52, 280, 500];
  b.push(t(TX[0], 964, "COLONNINA", { c: "s11 w7 c3 caps" }));
  [nv, av].forEach((v, i) => {
    const s = SLOT[v.id];
    b.push(
      stripes(TX[i + 1], 953, s, 13, K.slot[s], 3, 2),
      t(
        TX[i + 1] + stripesW(s, 3, 2) + 8,
        964,
        `${v.name} · ${v.result.energy.split(" ")[0]} kWh`,
        { c: "s12 c2" },
      ),
    );
  });
  [50, 150, 350].forEach((kw, i) => {
    const y = 1004 + i * 34;
    if (kw === 150)
      b.push(
        r(40, y - 24, 664, 34, { rx: 4, c: "yt" }),
        r(40, y - 24, 6, 34, { c: "yel" }),
      );
    b.push(
      t(TX[0] + 8, y, `${kw} kW`, { c: `s15 ${kw === 150 ? "w7" : "c2"}` }),
      t(TX[1], y + 1, nv.stations[kw], { c: "cn s21" }),
      t(TX[2], y + 1, av.stations[kw], { c: "cn s21" }),
    );
  });
  b.push(
    r(728, 902, 680, 196, { rx: 8, c: "card" }),
    t(748, 934, "Ipotesi", { c: "xw s17" }),
    t(1388, 934, "Limiti del calcolo →", { c: "s14 w7 u", a: "end" }),
  );
  H.assumptions.forEach((a, i) =>
    b.push(
      r(752, 960 + i * 28, 6, 6, { c: "ink" }),
      t(768, 967 + i * 28, a, { c: "s14 c2" }),
    ),
  );
  return svgDoc({
    w: W,
    h: Hh,
    title: "Livrea Expressive — DC charging curves",
    desc: "Variante Livrea Expressive: curve di ricarica DC di Nordis E4 e Aurora Vela a 150 kW. Valori dal simulatore M0.1.",
    style,
    defs,
    body: b,
  });
}

function identitySheet() {
  const b = [r(0, 0, 1440, 1000, { c: "paper" })];
  b.push(
    plate(48, 34, 60, 50, "EV", { size: 34 }),
    t(124, 74, "Livrea Expressive", { c: "x s44", "letter-spacing": "-1" }),
  );
  b.push(
    t(
      48,
      112,
      "Il linguaggio della livrea: colore e strisce per i veicoli, giallo targa per ciò che imposti tu, cifre strette e titoli larghi.",
      { c: "s16 c2" },
    ),
  );
  const sw = (x, y, name, hex, role, w = 112, inner) =>
    g([
      r(x, y, w, 60, { rx: 6, fill: hex, stroke: K.line }),
      inner || "",
      t(x, y + 80, name, { c: "s13 w7" }),
      t(x, y + 97, hex, { c: "s12 c2" }),
      t(x, y + 113, role, { c: "s11 c3" }),
    ]);
  b.push(t(48, 160, "INTERFACCIA", { c: "s11 w7 c3 caps" }));
  [
    ["Inchiostro", K.ink, "testo, azioni"],
    ["Carta", K.paper, "sfondo"],
    ["Bianco", K.white, "card, campi"],
    ["Lavatura", K.wash, "neutro, hover"],
    ["Giallo targa", K.yellow, "ciò che imposti"],
    ["Giallo tenue", K.yellowTint, "fondo delle tue scelte"],
  ].forEach(([n, h, ro], i) => b.push(sw(48 + i * 124, 172, n, h, ro)));
  b.push(
    t(48, 322, "VEICOLI NEL CONFRONTO: COLORE + STRISCE", {
      c: "s11 w7 c3 caps",
    }),
  );
  K.slot.forEach((h, i) =>
    b.push(
      sw(
        48 + i * 124,
        334,
        `${i + 1} · ${K.slotName[i]}`,
        h,
        `strisce ${K.onSlot[i] === K.white ? "bianche" : "inchiostro"}`,
        112,
        stripes(48 + i * 124 + 14, 352, i, 24, K.onSlot[i]),
      ),
    ),
  );
  b.push(t(560, 322, "SEGNALI (SEMPRE CON ICONA)", { c: "s11 w7 c3 caps" }));
  b.push(
    r(560, 334, 136, 60, { rx: 6, c: "yt" }),
    r(560, 334, 6, 60, { c: "yel" }),
    t(578, 369, "Effetto di una scelta", { c: "s12 w7" }),
  );
  b.push(
    r(710, 334, 136, 60, { rx: 6, fill: K.attnTint }),
    p(`M${730},354 l9,16 h-18 Z`, "", { fill: K.attn }),
    t(730, 368, "!", { c: "s10 w7 inv", a: "middle" }),
    t(748, 369, "Attenzione", { c: "s13 w7", fill: K.attn }),
  );
  b.push(
    r(860, 334, 136, 60, { rx: 6, fill: K.critTint }),
    missIcon(882, 364),
    t(898, 369, "Critico", { c: "s13 w7", fill: K.crit }),
  );
  b.push(t(560, 414, `${K.attn} · ${K.crit} su fondi tenui`, { c: "s12 c2" }));
  b.push(t(1040, 160, "REGOLE DEL COLORE", { c: "s11 w7 c3 caps" }));
  [
    "Ogni veicolo nel confronto: colore + numero di strisce.",
    "Le strisce leggono anche in scala di grigi e in stampa.",
    "Il colore può riempire fasce e intestazioni, mai il testo.",
    "Giallo = ciò che hai impostato: criteri, condizioni, scelte.",
    "Inchiostro = azioni ed esiti (es. il numero dei risultati).",
    "Attenzione e critico: toni scuri e icona.",
  ].forEach((s, i) =>
    b.push(
      r(1046, 172 + i * 24, 5, 5, { c: "ink" }),
      t(1060, 180 + i * 24, s, { c: "s13 c2" }),
    ),
  );

  b.push(
    t(48, 478, "TIPOGRAFIA · ANYBODY + OVERPASS", { c: "s11 w7 c3 caps" }),
  );
  b.push(
    t(48, 534, "Trova l’auto adatta", { c: "x s44", "letter-spacing": "-0.8" }),
    t(720, 528, "Anybody larga 140% · 850 · titoli", { c: "s12 c3" }),
  );
  b.push(
    t(48, 584, "22 min  +53,9 kWh  €41.500  ~380 km", { c: "cn s44" }),
    t(720, 578, "Anybody stretta 62% · 750 · cifre, tabulari", { c: "s12 c3" }),
  );
  b.push(
    t(
      48,
      618,
      "Testo ed etichette in Overpass, nato dalle lettere della segnaletica stradale.",
      { c: "s16" },
    ),
    t(720, 640, "Overpass · 400–700 · 12–18", { c: "s12 c3" }),
  );
  b.push(t(48, 642, "Nomi dei veicoli in Anybody 115%", { c: "xw s18" }));

  b.push(t(48, 690, "COMPONENTI", { c: "s11 w7 c3 caps" }));
  b.push(
    criterionBox(48, 704, 300, D.requirements[0], "req"),
    criterionBox(48, 766, 300, D.preferences[0], "pref"),
    criterionBox(48, 828, 300, D.requirements[2], "req", true),
  );
  b.push(
    button(376, 704, 150, "Confronta →", "ink"),
    button(536, 704, 132, "Apri scheda"),
    segmented(
      376,
      758,
      ["Schede", "Elenco", "Differenze"],
      0,
      [86, 78, 108],
      40,
    ),
  );
  b.push(
    check(376, 818),
    t(396, 829, "rispettato", { c: "s13" }),
    missIcon(498, 824),
    t(512, 829, "non rispettato", { c: "s13" }),
  );
  b.push(
    tag(478, 866, "costruttore"),
    tag(570, 866, "stima"),
    tag(668, 866, "calcolo"),
  );
  b.push(
    chip(376, 884, 150, 0, "Nordis E4"),
    plate(540, 886, 26, 26, "2", { size: 16 }),
    plate(574, 884, 30, 30, "3", { kind: "ink", size: 22 }),
    t(614, 904, "targhe: scelta · esito", { c: "s12 c3" }),
  );

  b.push(t(820, 690, "ASSEGNAZIONE DEI COLORI", { c: "s11 w7 c3 caps" }));
  const steps = [
    ["Aggiungi Nordis E4", [0]],
    ["Aggiungi Aurora Vela", [0, 1]],
    ["Aggiungi Brisa Family", [0, 1, 2]],
    ["Rimuovi Aurora Vela", [0, null, 2]],
    ["Aggiungi Talon S", [0, 1, 2], "riceve 2 strisce, il primo posto libero"],
  ];
  steps.forEach(([lab, slots, note], k) => {
    const y = 716 + k * 34;
    b.push(t(820, y + 5, lab, { c: "s13" }));
    slots.forEach((s, j) =>
      b.push(
        s === null
          ? r(1006 + j * 34, y - 10, 28, 22, {
              rx: 3,
              fill: "none",
              stroke: K.line2,
              "stroke-dasharray": "3 2",
            })
          : g([
              r(1006 + j * 34, y - 10, 28, 22, { rx: 3, fill: K.slot[s] }),
              stripes(
                1006 + j * 34 + (28 - stripesW(s, 3, 2)) / 2,
                y - 5,
                s,
                12,
                K.onSlot[s],
                3,
                2,
              ),
            ]),
      ),
    );
    if (note) b.push(t(1116, y + 5, note, { c: "s12 c3" }));
  });
  b.push(
    t(
      820,
      898,
      "Un veicolo non selezionato non ha livrea: fascia neutra, senza colore né strisce.",
      { c: "s12 c3" },
    ),
  );

  b.push(t(48, 944, "FOTOGRAFIA", { c: "s11 w7 c3 caps" }));
  b.push(clipPhoto("idp", 48, 954, 120, 40, 4, {}));
  b.push(
    t(
      184,
      970,
      "Foto reali grandi, a tutta larghezza nelle card e nelle intestazioni; la livrea è una fascia sotto la foto, mai sopra.",
      { c: "s13 c2" },
    ),
    t(
      184,
      990,
      "Qui segnaposto: i veicoli del catalogo sono illustrativi. Font: Anybody, Overpass (OFL), incorporati.",
      { c: "s12 c3" },
    ),
  );
  return svgDoc({
    w: 1440,
    h: 1000,
    title: "Livrea Expressive — Identity sheet",
    desc: "Palette, segnali, tipografia, componenti, regole del colore dei veicoli della variante Livrea Expressive.",
    style,
    defs,
    body: b,
  });
}

const concept = {
  id: "livrea-expressive",
  screens: {
    identity: identitySheet,
    landing: landingScreen,
    discovery: discoveryScreen,
    comparison: comparisonScreen,
    charging: chargingScreen,
  },
};

export default concept;
