// Concept 1 — Tavola. Technical drawing on paper: ink, hairlines, monospaced figures,
// one vermilion signal for focus and selection. Cars are drawn as side elevations.
import {
  t,
  tr,
  r,
  ln,
  ci,
  p,
  g,
  pl,
  svgDoc,
  car,
  scale,
  fmt,
  typeUtilities,
  checkPath,
  chevron,
  annotation,
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
  paper: "#F3F0E8",
  sheet: "#FBFAF6",
  ink: "#161616",
  ink2: "#4A4741",
  ink3: "#6B675F",
  rule: "#CFC9BC",
  grid: "#E4DFD3",
  signal: "#C8361B",
  // chart series: slot 1 ink (achromatic, solid), then validated hues
  series: ["#161616", "#2251A3", "#C27A00", "#A63D7A"],
};

const style = `
${typeUtilities()}
text{font-family:'IBM Plex Sans','Helvetica Neue',Arial,sans-serif;fill:${K.ink}}
.m{font-family:'IBM Plex Mono',Consolas,'SFMono-Regular',Menlo,monospace}
.c2{fill:${K.ink2}}.c3{fill:${K.ink3}}.sig{fill:${K.signal}}.inv{fill:${K.sheet}}.blue{fill:${K.series[1]}}
.caps{letter-spacing:1.2px}
.paper{fill:${K.paper}}.sheet{fill:${K.sheet}}.ink{fill:${K.ink}}.sigf{fill:${K.signal}}
.box{fill:${K.sheet};stroke:${K.ink};stroke-width:1}
.boxr{fill:${K.sheet};stroke:${K.rule};stroke-width:1}
.dash{fill:${K.sheet};stroke:${K.ink};stroke-width:1;stroke-dasharray:4 3}
.hair{stroke:${K.rule};stroke-width:1;fill:none}
.hairink{stroke:${K.ink};stroke-width:1;fill:none}
.grid{stroke:${K.grid};stroke-width:1;fill:none}
.stroke{stroke:${K.ink};stroke-width:1.5;fill:none;stroke-linecap:round;stroke-linejoin:round}
.thin{stroke:${K.ink};stroke-width:1;fill:none;stroke-linecap:round;stroke-linejoin:round}
.sigs{stroke:${K.signal};stroke-width:2;fill:none}
.center{stroke:${K.ink3};stroke-width:0.8;stroke-dasharray:10 3 2 3;fill:none}
.carbody{fill:${K.sheet};stroke:${K.ink};stroke-width:1.4;stroke-linejoin:round}
.carwin{fill:none;stroke:${K.ink};stroke-width:1}
.wheel{fill:${K.sheet};stroke:${K.ink};stroke-width:1.4}
.dim{stroke:${K.ink2};stroke-width:0.8;fill:none}
.s1{stroke:${K.series[0]};stroke-width:2;fill:none;stroke-linejoin:round}
.s2{stroke:${K.series[1]};stroke-width:2;fill:none;stroke-dasharray:7 4;stroke-linejoin:round}
.s1pot{stroke:${K.series[0]};stroke-width:1;fill:none;stroke-dasharray:1.5 3}
.limit{stroke:${K.ink2};stroke-width:1;stroke-dasharray:12 3 2 3;fill:none}
`;

const defs = `
<pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="${K.rule}" stroke-width="1"/></pattern>
`;

// ---------------------------------------------------------------- components

const logo = (x, y) =>
  g([
    r(x, y, 26, 26, { c: "hairink" }),
    ci(x + 13, y + 15, 6, "thin"),
    ln(x + 3, y + 21, x + 23, y + 21, "thin"),
    ln(x + 13, y + 4, x + 13, y + 8, "thin"),
  ]);

const navBar = (active, count) => {
  const xs = [220, 305, 447];
  const out = [
    r(0, 0, 1440, 64, { c: "paper" }),
    ln(0, 64, 1440, 64, "hairink"),
    logo(32, 19),
    t(68, 38, nav.brand, { c: "s17 w6" }),
  ];
  nav.items.forEach((it, i) => {
    out.push(t(xs[i], 38, it, { c: `s15 ${active === i ? "w6" : "w5"}` }));
    if (active === i) out.push(r(xs[i], 61, it.length * 8.4, 3, { c: "sigf" }));
  });
  if (count)
    out.push(
      r(390, 25, 18, 18, { c: "sigf" }),
      t(399, 38, String(count), { c: "m s12 w6 inv", a: "middle" }),
    );
  out.push(t(1408, 38, nav.right, { c: "s14 c2", a: "end" }));
  return g(out);
};

const tagGlyph = (x, y, tag) => {
  if (tag === "costruttore") return r(x, y - 7, 7, 7, { c: "ink" });
  if (tag === "stima") return ci(x + 3.5, y - 3.5, 3.4, "thin");
  return p(
    `M${x + 3.5},${y - 8} L${x + 7.5},${y - 3.5} L${x + 3.5},${y + 1} L${x - 0.5},${y - 3.5} Z`,
    "ink",
  );
};
/** Provenance tag, right-aligned at x. */
const tag = (x, y, name) => {
  const w = name.length * 6.1;
  return g([
    tagGlyph(x - w - 12, y, name),
    t(x, y, name, { c: "m s10 c2", a: "end" }),
  ]);
};

const check = (x, y, s = 12) =>
  g([r(x, y, s, s, { c: "hairink" }), p(checkPath(x, y, s), "thin")]);
const miss = (x, y) =>
  g([ci(x + 6, y + 6, 6, "thin"), ln(x + 3, y + 6, x + 9, y + 6, "thin")]);

const button = (x, y, w, label, kind = "line", h = 36) =>
  kind === "ink"
    ? g([
        r(x, y, w, h, { c: "ink" }),
        t(x + w / 2, y + h / 2 + 5, label, { c: "s14 w6 inv", a: "middle" }),
      ])
    : g([
        r(x, y, w, h, { c: "box" }),
        t(x + w / 2, y + h / 2 + 5, label, { c: "s14 w5", a: "middle" }),
      ]);

const segmented = (x, y, labels, active, w = 80, h = 32) =>
  g(
    labels.map((l, i) => {
      const lw = Array.isArray(w) ? w[i] : w;
      const lx =
        x +
        (Array.isArray(w) ? w.slice(0, i).reduce((a, b) => a + b, 0) : i * w);
      return g([
        r(lx, y, lw, h, { c: i === active ? "ink" : "box" }),
        t(lx + lw / 2, y + h / 2 + 4.5, l, {
          c: `s13 ${i === active ? "w6 inv" : "w5"}`,
          a: "middle",
        }),
      ]);
    }),
  );

/** Line drawing of a car on a construction ground line. */
const drawing = (type, x, y, w, { center = true, dims = false } = {}) => {
  const c = car(type, x, y, w);
  const out = [];
  out.push(ln(x - 12, c.ground, x + w + 12, c.ground, "thin"));
  if (center)
    c.wheels.forEach((wx) =>
      out.push(ln(wx, c.roofY - 6, wx, c.ground + 8, "center")),
    );
  out.push(
    p(c.body, "carbody"),
    p(c.windows, "carwin"),
    p(c.pillar, "carwin"),
    p(c.door, "carwin"),
  );
  c.wheels.forEach((wx) => {
    out.push(
      ci(wx, c.wheelY, c.wheelR, "wheel"),
      ci(wx, c.wheelY, c.wheelR * 0.55, "thin"),
      ci(wx, c.wheelY, 1.2, "ink"),
    );
  });
  if (dims) {
    // wheelbase dimension line, no number: the drawing is generic, not a real model
    const yy = c.ground + 18;
    out.push(
      ln(c.wheels[0], yy, c.wheels[1], yy, "dim"),
      ln(c.wheels[0], c.ground + 10, c.wheels[0], yy + 6, "dim"),
      ln(c.wheels[1], c.ground + 10, c.wheels[1], yy + 6, "dim"),
    );
    out.push(
      p(
        `M${c.wheels[0]},${yy} l7,-3 v6 Z M${c.wheels[1]},${yy} l-7,-3 v6 Z`,
        "ink",
      ),
    );
  }
  return { svg: g(out), c };
};

/** Small framed drawing used in cards and table headers. */
const plate = (type, x, y, w, h) => {
  const out = [r(x, y, w, h, { c: "paper" })];
  for (let gx = x + 20; gx < x + w; gx += 20)
    out.push(ln(gx, y, gx, y + h, "grid"));
  for (let gy = y + 20; gy < y + h; gy += 20)
    out.push(ln(x, gy, x + w, gy, "grid"));
  const cw = Math.min(w * 0.72, (h - 12) * 2.5);
  out.push(drawing(type, x + (w - cw) / 2, y + h - cw * 0.36 - 10, cw).svg);
  return g(out);
};

/** Series key: the line style used for a vehicle in charts and chips. */
const seriesKey = (x, y, i, len = 22) =>
  i === 0 ? ln(x, y, x + len, y, "s1") : ln(x, y, x + len, y, "s2");

// ---------------------------------------------------------------- screens

function landingScreen() {
  const L = landing;
  const b = [r(0, 0, 1440, 880, { c: "paper" }), navBar(-1)];
  b.push(
    t(120, 152, "Trova l’auto elettrica", {
      c: "s52 w6",
      "letter-spacing": "-1.2",
    }),
  );
  b.push(
    t(120, 212, "adatta a te.", { c: "s52 w6", "letter-spacing": "-1.2" }),
  );
  b.push(t(120, 258, L.subtitle, { c: "s26 c2" }));

  // Annotated elevation: data of one vehicle, each value with its provenance glyph
  const d = drawing("suv", 850, 112, 420);
  b.push(d.svg);
  const callout = (ax, ay, lx, ly, label, value, left = false) => {
    const x0 = left ? lx - 132 : lx;
    return g([
      ln(ax, ay, lx, ly, "dim"),
      ci(ax, ay, 2.2, "ink"),
      ln(x0, ly, x0 + 132, ly, "dim"),
      t(x0, ly - 22, label, { c: "s11 c2" }),
      tagGlyph(x0, ly - 6, "costruttore"),
      t(x0 + 12, ly - 5.5, value, { c: "m s14 w6" }),
    ]);
  };
  b.push(callout(872, 168, 820, 140, "Bagagliaio", "520 L", true));
  b.push(callout(1000, 240, 1000, 302, "Batteria utile", "77 kWh", true));
  b.push(callout(1246, 196, 1288, 140, "Potenza DC massima", "175 kW"));
  b.push(
    t(1408, 300, "Nordis E4 · dati del costruttore, illustrativi", {
      c: "m s10 c3",
      a: "end",
    }),
  );

  // Two entry points
  const py = 336;
  b.push(
    r(120, py, 588, 300, { c: "box" }),
    r(732, py, 588, 300, { c: "box" }),
  );
  b.push(
    t(144, py + 40, "01", { c: "m s12 c3" }),
    t(176, py + 40, L.model.heading, { c: "s20 w6" }),
  );
  b.push(
    r(144, py + 60, 444, 48, { c: "box", "stroke-width": 1.5 }),
    ci(166, py + 82, 6.5, "thin"),
    ln(171, py + 87, 176, py + 92, "thin"),
  );
  b.push(
    t(188, py + 90, L.model.query, { c: "s16" }),
    ln(219, py + 72, 219, py + 96, "stroke"),
  );
  b.push(button(596, py + 60, 88, L.model.button, "ink", 48));
  b.push(r(144, py + 116, 540, 164, { c: "boxr" }));
  b.push(t(160, py + 140, "MODELLI", { c: "m s10 c3 caps" }));
  L.model.models.forEach((m, i) => {
    const y = py + 166 + i * 28;
    b.push(
      t(160, y, m.name, { c: "s14 w6" }),
      t(248, y, m.body, { c: "s13 c2" }),
      t(668, y, m.action, { c: "s13 u", a: "end" }),
    );
  });
  b.push(
    ln(160, py + 206, 668, py + 206, "hair"),
    t(160, py + 228, "MARCHE", { c: "m s10 c3 caps" }),
  );
  b.push(
    t(160, py + 252, L.model.brands[0].name, { c: "s14 w6" }),
    t(668, py + 252, L.model.brands[0].action, { c: "s13 u", a: "end" }),
  );
  b.push(t(160, py + 272, L.model.all, { c: "s13 c2" }));

  b.push(
    t(756, py + 40, "02", { c: "m s12 c3" }),
    t(788, py + 40, L.needs.heading, { c: "s20 w6" }),
  );
  let cx = 756,
    cy = py + 64;
  L.needs.chips.forEach((chip) => {
    const w = chip.length * 7.4 + 42;
    if (cx + w > 1296) {
      cx = 756;
      cy += 44;
    }
    b.push(
      r(cx, cy, w, 34, { c: chip === "Specifiche tecniche" ? "dash" : "box" }),
      t(cx + 14, cy + 22, "+", { c: "m s14 w6" }),
      t(cx + 30, cy + 22, chip, { c: "s13 w5" }),
    );
    cx += w + 8;
  });
  b.push(button(756, py + 172, 300, L.needs.cta, "ink", 46));

  // Direct access as one ruled strip
  const dy = 680;
  b.push(
    t(120, dy, L.direct.heading, { c: "s15 w6" }),
    ln(120, dy + 16, 1320, dy + 16, "hairink"),
    ln(120, dy + 120, 1320, dy + 120, "hairink"),
  );
  L.direct.items.forEach((it, i) => {
    const x = 120 + i * 400;
    if (i) b.push(ln(x, dy + 16, x, dy + 120, "hair"));
    b.push(
      t(x + (i ? 24 : 0), dy + 52, it.title, { c: "s16 w6" }),
      t(x + (i ? 24 : 0), dy + 76, it.text, { c: "s13 c2" }),
      t(x + (i ? 24 : 0), dy + 104, it.link, { c: "s13 w6 u" }),
    );
  });
  b.push(ln(0, 826, 1440, 826, "hair"), t(120, 856, L.footer, { c: "s12 c3" }));
  return svgDoc({
    w: 1440,
    h: 880,
    title: "Tavola — Landing Page",
    desc: "Concept Tavola applicato alla landing consolidata.",
    style,
    defs,
    body: b,
  });
}

function criterionBox(x, y, w, item, kind, open = false) {
  const out = [
    r(x, y, w, 46, {
      c: kind === "req" ? "box" : "dash",
      "stroke-width": open ? 1.5 : 1,
    }),
  ];
  if (open) out.push(r(x, y, 3, 46, { c: "sigf" }));
  out.push(
    t(x + 14, y + 18, item.label, { c: "s12 c2" }),
    t(x + 14, y + 37, item.value, { c: "s14 w6" }),
  );
  if (item.spec)
    out.push(
      r(x + 140, y + 8, 34, 14, { c: "hairink", fill: "none" }),
      t(x + 157, y + 18.5, "SPEC", { c: "m s9 w6", a: "middle" }),
    );
  out.push(p(chevron(x + w - 20, y + 23, 5, open), "thin"));
  return g(out);
}

function discoveryScreen() {
  const b = [r(0, 0, 1440, 1330, { c: "paper" }), navBar(0, 2)];
  // search
  b.push(
    r(32, 88, 1376, 48, { c: "box" }),
    ci(54, 110, 6.5, "thin"),
    ln(59, 115, 64, 120, "thin"),
    t(76, 117, D.search, { c: "s15 c3" }),
  );
  // ---- criteria column
  b.push(ln(368, 160, 368, 1300, "hair"));
  b.push(
    t(32, 186, D.criteriaTitle, { c: "s18 w6" }),
    t(352, 186, D.reset, { c: "s13 u", a: "end" }),
  );
  b.push(
    r(32, 204, 30, 14, { c: "box" }),
    t(70, 216, D.legend.req, { c: "s12 c2" }),
    r(196, 204, 30, 14, { c: "dash" }),
    t(234, 216, D.legend.pref, { c: "s12 c2" }),
  );
  b.push(
    t(32, 246, "REQUISITI", { c: "m s10 c3 caps" }),
    t(352, 246, "3", { c: "m s10 c3", a: "end" }),
  );
  D.requirements.forEach((it, i) =>
    b.push(criterionBox(32, 254 + i * 54, 320, it, "req", it.open)),
  );
  // open editor
  const E = D.editor,
    ey = 416;
  b.push(r(32, ey, 320, 312, { c: "boxr" }), ln(32, ey, 352, ey, "hairink"));
  b.push(
    t(46, ey + 28, E.min, { c: "s12 c2" }),
    t(338, ey + 28, E.minValue, { c: "m s14 w6", a: "end" }),
  );
  const sx = scale(50, 350, 54, 330);
  b.push(
    ln(sx(50), ey + 54, sx(350), ey + 54, "hair"),
    ln(sx(100), ey + 54, sx(350), ey + 54, "stroke"),
  );
  [50, 100, 150, 200, 250, 300, 350].forEach((v) =>
    b.push(
      ln(sx(v), ey + 60, sx(v), ey + 65, "thin"),
      t(sx(v), ey + 78, String(v), { c: "m s10 c3", a: "middle" }),
    ),
  );
  b.push(
    r(sx(100) - 6, ey + 47, 12, 14, { c: "box", "stroke-width": 1.5 }),
    r(sx(350) - 6, ey + 47, 12, 14, { c: "box", "stroke-width": 1.5 }),
  );
  b.push(t(338, ey + 94, "kW", { c: "m s10 c3", a: "end" }));
  b.push(t(46, ey + 122, E.behaviour, { c: "s12 c2" }));
  b.push(
    ci(54, ey + 141, 7, "thin"),
    ci(54, ey + 141, 3.5, "ink"),
    t(70, ey + 146, E.req, { c: "s14 w5" }),
    ci(186, ey + 141, 7, "thin"),
    t(202, ey + 146, E.pref, { c: "s14" }),
  );
  b.push(ln(46, ey + 166, 338, ey + 166, "hair"));
  b.push(
    ci(54, ey + 186, 7, "thin"),
    t(54, ey + 190, "?", { c: "m s10 w7", a: "middle" }),
    t(70, ey + 191, E.explain, { c: "s13 w6" }),
    t(338, ey + 191, E.explainAction, { c: "s12 u", a: "end" }),
  );
  b.push(ln(46, ey + 208, 338, ey + 208, "hair"));
  b.push(
    t(46, ey + 230, E.linkedKicker, { c: "m s10 c3 caps" }),
    tagGlyph(250, ey + 230, "calcolo"),
    t(262, ey + 230, "calcolo", { c: "m s10 c2" }),
  );
  b.push(
    t(46, ey + 252, E.linkedTitle, { c: "s14 w6" }),
    t(46, ey + 270, E.linkedText, { c: "s12 c2" }),
  );
  b.push(
    r(46, ey + 280, 96, 26, { c: "box" }),
    t(94, ey + 297, E.linkedAction, { c: "s12 w6", a: "middle" }),
  );

  b.push(
    t(32, 762, "PREFERENZE", { c: "m s10 c3 caps" }),
    t(352, 762, "3", { c: "m s10 c3", a: "end" }),
  );
  D.preferences.forEach((it, i) =>
    b.push(criterionBox(32, 772 + i * 54, 320, it, "pref")),
  );
  b.push(
    r(32, 944, 320, 40, { c: "box" }),
    t(192, 969, D.addCriterion, { c: "s14 w6", a: "middle" }),
  );
  b.push(t(32, 1008, D.categories, { c: "m s10 c3" }));

  // ---- results
  b.push(
    tr(
      384,
      188,
      [
        ["3", "m w6"],
        [" veicoli rispettano tutti i requisiti", ""],
      ],
      { c: "s22 w6" },
    ),
  );
  b.push(t(384, 210, D.resultsSub, { c: "s13 c2" }));
  b.push(segmented(948, 172, D.views, 0, [66, 66, 92], 32));
  b.push(
    r(1188, 172, 220, 32, { c: "box" }),
    t(1202, 193, D.sort, { c: "s13" }),
    p(chevron(1390, 188), "thin"),
  );
  // notice
  b.push(
    r(384, 226, 1024, 34, { c: "sheet" }),
    r(384, 226, 2, 34, { c: "ink" }),
    t(398, 248, D.notice, { c: "s13 c2" }),
    t(1394, 248, D.undo, { c: "s13 w6 u", a: "end" }),
  );
  // tray
  b.push(
    r(384, 272, 1024, 52, { c: "box" }),
    t(400, 303, D.tray.label, { c: "s14 w6" }),
  );
  D.tray.items.forEach((it, i) => {
    const x = 540 + i * 140;
    b.push(
      r(x, 284, 128, 28, { c: "box" }),
      seriesKey(x + 10, 298, i, 18),
      t(x + 36, 303, it, { c: "s13 w5" }),
      t(x + 116, 303, "×", { c: "s15", a: "middle" }),
    );
  });
  b.push(
    t(1252, 303, D.tray.diff, { c: "s13 u", a: "end" }),
    button(1268, 280, 124, D.tray.cta, "ink", 36),
  );

  // cards
  D.results.forEach((res, i) => {
    const v = vehicles[res.id];
    const x = 384 + i * 347,
      y = 340,
      w = 330;
    b.push(r(x, y, w, 462, { c: "box" }));
    b.push(plate(v.body, x + 1, y + 1, w - 2, 128));
    b.push(ln(x, y + 130, x + w, y + 130, "hairink"));
    b.push(
      t(x + 16, y + 160, v.name, { c: "s17 w6" }),
      t(x + 16, y + 180, v.kind, { c: "s13 c2" }),
    );
    b.push(
      t(x + 16, y + 214, v.price, { c: "m s20 w6" }),
      t(x + w - 16, y + 214, "listino", { c: "m s11 c3", a: "end" }),
    );
    b.push(ln(x + 16, y + 226, x + w - 16, y + 226, "hair"));
    b.push(t(x + 16, y + 248, "REQUISITI", { c: "m s10 c3 caps" }));
    D.reqLabels.forEach((l, k) => {
      const lx = x + 16 + [0, 86, 190][k];
      b.push(check(lx, y + 259, 11), t(lx + 17, y + 269, l, { c: "s12" }));
    });
    b.push(t(x + 16, y + 300, "PREFERENZE", { c: "m s10 c3 caps" }));
    b.push(
      check(x + 16, y + 311, 11),
      t(x + 33, y + 321, `Viaggio 400 km: ${v.stop}`, { c: "s12" }),
      tag(x + w - 16, y + 321, "stima"),
    );
    b.push(
      check(x + 16, y + 333, 11),
      t(x + 33, y + 343, D.prefDaily, { c: "s12" }),
    );
    b.push(
      t(x + 16, y + 376, D.why, { c: "s12 w6 u" }),
      t(x + w - 16, y + 376, res.specs, { c: "m s12 c2", a: "end" }),
    );
    b.push(button(x + 16, y + 398, 120, "Apri scheda", "line", 38));
    if (res.inCompare) {
      b.push(
        r(x + 144, y + 398, 170, 38, { c: "box", "stroke-width": 1.5 }),
        r(x + 156, y + 410, 14, 14, { c: "ink" }),
        p(checkPath(x + 156, y + 410, 14), "thin", { stroke: K.sheet }),
      );
      b.push(
        t(x + 178, y + 422, "Nel confronto", { c: "s13 w6" }),
        seriesKey(x + 282, y + 417, i, 18),
      );
    } else {
      b.push(
        r(x + 144, y + 398, 170, 38, { c: "box" }),
        r(x + 156, y + 410, 14, 14, { c: "hairink" }),
        t(x + 178, y + 422, "Aggiungi al confronto", { c: "s13" }),
      );
    }
  });

  // near matches — a ruled table
  b.push(ln(384, 834, 1408, 834, "hairink"));
  b.push(
    t(384, 864, D.near.title, { c: "s16 w6" }),
    t(384, 886, D.near.sub, { c: "s13 c2" }),
  );
  D.near.items.forEach((n, i) => {
    const v = vehicles[n.id],
      y = 904 + i * 96;
    b.push(r(384, y, 1024, 84, { c: "dash" }));
    b.push(plate(v.body, 396, y + 12, 96, 60));
    b.push(
      t(508, y + 32, v.name, { c: "s15 w6" }),
      t(508, y + 52, v.kind, { c: "s12 c2" }),
      t(508, y + 72, "Apri scheda ›", { c: "s12 u" }),
    );
    b.push(
      t(774, y + 30, D.near.missKicker, { c: "m s10 c3 caps" }),
      miss(774, y + 44),
      t(794, y + 55, n.miss, { c: "s13 w6" }),
    );
    b.push(
      button(1060, y + 14, 220, n.fix, "line", 34),
      t(1170, y + 68, n.flex, { c: "s12 u", a: "middle" }),
    );
    b.push(
      r(1304, y + 24, 14, 14, { c: "hairink" }),
      t(1326, y + 36, "Confronta", { c: "s13" }),
    );
  });

  // deeper
  b.push(
    ln(384, 1112, 1408, 1112, "hairink"),
    t(384, 1142, D.deeper.title, { c: "s16 w6" }),
    ln(384, 1220, 1408, 1220, "hair"),
  );
  D.deeper.items.forEach((it, i) => {
    const x = 384 + i * 512;
    if (i) b.push(ln(x, 1158, x, 1210, "hair"));
    b.push(
      t(x + (i ? 24 : 0), 1180, it.title, { c: "s14 w6" }),
      t(x + (i ? 24 : 0), 1200, it.text, { c: "s12 c2" }),
      t(x + 488, 1190, "→", { c: "m s16", a: "end" }),
    );
  });
  b.push(
    t(384, 1262, D.footnote, { c: "s12 c3" }),
    t(384, 1284, D.footlink, { c: "s12 w6 u" }),
  );
  return svgDoc({
    w: 1440,
    h: 1330,
    title: "Tavola — Vehicle Discovery, Active Criteria",
    desc: "Concept Tavola applicato alla ricerca con sei criteri attivi.",
    style,
    defs,
    body: b,
  });
}

function comparisonScreen() {
  const b = [r(0, 0, 1440, 1628, { c: "paper" }), navBar(1, 2)];
  const COL = [424, 748];
  b.push(r(0, 65, 1440, 46, { c: "sheet" }), ln(0, 111, 1440, 111, "hair"));
  b.push(
    t(32, 94, C.context.back, { c: "s14 w6 u" }),
    t(112, 94, C.context.summary, { c: "m s12 c3" }),
    t(1408, 94, C.context.edit, { c: "s14 w6 u", a: "end" }),
  );
  b.push(
    t(32, 168, C.title, { c: "s28 w6" }),
    t(32, 192, C.count, { c: "s14 c2" }),
  );
  b.push(
    t(32, 236, "RIGHE", { c: "m s10 c3 caps" }),
    segmented(32, 246, C.rowsToggle, 1, [64, 128], 32),
  );
  b.push(
    t(32, 306, "VISTA", { c: "m s10 c3 caps" }),
    segmented(32, 316, C.viewToggle, 0, [74, 74], 32),
  );
  C.columns.forEach((id, i) => {
    const v = vehicles[id],
      x = COL[i];
    b.push(
      r(x, 136, 300, 112, { c: "hairink", fill: "none" }),
      plate(v.body, x + 0.5, 136.5, 299, 111),
    );
    b.push(seriesKey(x, 274, i, 20), t(x + 28, 280, v.name, { c: "s18 w6" }));
    b.push(
      t(x, 300, v.kind, { c: "s13 c2" }),
      t(x, 330, v.price, { c: "m s18 w6" }),
    );
    b.push(
      t(x, 358, C.actions.open, { c: "s13 w6 u" }),
      t(x + 230, 358, C.actions.replace, { c: "s13 c2 u", a: "end" }),
      t(x + 300, 358, C.actions.remove, { c: "s13 c2 u", a: "end" }),
    );
  });
  b.push(
    r(1072, 136, 336, 232, { c: "dash" }),
    t(1092, 168, C.add.title, { c: "s15 w6" }),
  );
  b.push(
    r(1092, 182, 296, 40, { c: "box" }),
    ci(1112, 201, 6, "thin"),
    ln(1116, 206, 1121, 211, "thin"),
    t(1132, 207, C.add.search, { c: "s14 c3" }),
  );
  b.push(t(1092, 250, C.add.kicker, { c: "m s10 c3 caps" }));
  C.add.items.forEach((it, i) => {
    const y = 276 + i * 30;
    b.push(
      t(1092, y, it.name, { c: "s14 w6" }),
      t(1200, y, it.note, { c: "s13 c2" }),
      r(1368, y - 13, 18, 18, { c: "box" }),
      t(1377, y + 1, "+", { c: "m s14 w6", a: "middle" }),
    );
  });
  b.push(ln(0, 392, 1440, 392, "hairink"));

  const row = (y, label, tg, values, notes = [], checks = false) => {
    const out = [t(32, y, label, { c: "s14" })];
    if (tg) out.push(tag(400, y, tg));
    values.forEach((val, i) => {
      const x = COL[i];
      if (checks) out.push(check(x, y - 11, 12));
      out.push(t(x + (checks ? 22 : 0), y, val, { c: "m s14 w6" }));
      if (notes[i])
        out.push(
          t(x + (checks ? 22 : 0) + val.length * 8.6 + 10, y, notes[i], {
            c: "m s11 c3",
          }),
        );
    });
    out.push(ln(32, y + 15, 1408, y + 15, "hair"));
    return g(out);
  };
  const section = (y, title, num) =>
    g([t(32, y, num, { c: "m s12 c3" }), t(64, y, title, { c: "s18 w6" })]);

  b.push(section(432, C.criteria.title, "A"));
  b.push(t(32, 466, "REQUISITI", { c: "m s10 c3 caps" }));
  C.criteria.requirements.forEach((rw, i) =>
    b.push(row(499 + i * 40, rw.label, null, rw.values, rw.notes, true)),
  );
  b.push(t(32, 618, "PREFERENZE", { c: "m s10 c3 caps" }));
  C.criteria.preferences.forEach((rw, i) =>
    b.push(row(651 + i * 40, rw.label, rw.tag, rw.values, [], true)),
  );

  b.push(section(796, C.others.title, "B"));
  // Scale: both values on one axis from zero, per row (same unit)
  b.push(t(1100, 806, "SCALA DA ZERO", { c: "m s10 c3 caps" }));
  C.others.rows.forEach((rw, i) => {
    const y = 837 + i * 40;
    b.push(row(y, rw.label, rw.tag, rw.values, rw.notes || []));
    const max = Math.max(...rw.num) * 1.15;
    const sx = scale(0, max, 1100, 1320);
    b.push(
      ln(1100, y - 4, 1320, y - 4, "hair"),
      ln(1100, y - 8, 1100, y, "thin"),
    );
    b.push(ln(sx(rw.num[0]), y - 11, sx(rw.num[0]), y + 3, "s1"));
    b.push(
      ln(sx(rw.num[1]), y - 11, sx(rw.num[1]), y + 3, "s2", {
        "stroke-dasharray": "3 2",
      }),
    );
    b.push(t(1330, y, rw.unit, { c: "m s10 c3" }));
  });

  b.push(
    section(990, C.details.title, "C"),
    t(1408, 990, C.details.hidden, { c: "m s12 c3", a: "end" }),
  );
  b.push(ln(32, 1006, 1408, 1006, "hairink"));
  b.push(
    t(32, 1035, C.details.open.title, { c: "s16 w6" }),
    t(224, 1035, C.details.open.count, { c: "m s12 c3" }),
    t(1400, 1036, "−", { c: "m s18", a: "end" }),
  );
  C.details.open.rows.forEach((rw, i) =>
    b.push(row(1077 + i * 38, rw.label, rw.tag, rw.values)),
  );
  C.details.closed.forEach((grp, i) => {
    const y = 1247 + i * 46;
    b.push(
      t(32, y, grp.title, { c: "s16 w6" }),
      t(32 + grp.title.length * 9.4 + 14, y, grp.count, { c: "m s12 c3" }),
    );
    if (grp.action) b.push(t(1370, y, grp.action, { c: "s13 w6 u", a: "end" }));
    b.push(
      t(1400, y + 1, "+", { c: "m s18", a: "end" }),
      ln(32, y + 16, 1408, y + 16, "hair"),
    );
  });

  b.push(section(1442, C.simulations.title, "D"));
  C.simulations.items.forEach((s, i) => {
    const x = 32 + i * 700;
    b.push(r(x, 1460, 676, 84, { c: i ? "dash" : "box" }));
    b.push(
      t(x + 20, 1492, s.title, { c: "s16 w6" }),
      t(x + 20, 1516, s.text, { c: "s13 c2" }),
      t(x + 656, 1506, s.action, { c: "s14 w6 u", a: "end" }),
    );
    if (s.notImplemented) b.push(annotation(x + 520, 1468, "NON IMPLEMENTATO"));
  });
  b.push(
    t(32, 1576, C.footnote, { c: "s12 c3" }),
    t(32, 1598, C.footlink, { c: "s12 w6 u" }),
  );
  return svgDoc({
    w: 1440,
    h: 1628,
    title: "Tavola — Comparison, Selected Vehicles",
    desc: "Concept Tavola applicato al confronto con criteri.",
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
    r(0, 65, W, 46, { c: "sheet" }),
    ln(0, 111, W, 111, "hair"),
    t(32, 94, H.back, { c: "s14 w6 u" }),
    t(128, 94, H.backContext, { c: "m s12 c3" }),
  );
  b.push(t(32, 160, H.title, { c: "s28 w6" }));
  H.vehicles.forEach((v, i) =>
    b.push(
      seriesKey(1100 + i * 160, 152, i, 26),
      t(1134 + i * 160, 157, v.name, { c: "s14 w6" }),
    ),
  );
  // conditions
  b.push(
    r(32, 184, 1376, 104, { c: "box" }),
    t(52, 210, H.conditionsKicker, { c: "m s10 c3 caps" }),
  );
  const cx = [52, 452, 716, 1044];
  H.conditions.forEach((cd, i) => {
    b.push(t(cx[i], 234, cd.label, { c: "s12 c2" }));
    if (cd.options)
      b.push(
        segmented(
          cx[i],
          246,
          cd.options,
          cd.active,
          i === 1 ? 64 : i === 0 ? [176, 160] : [146, 118],
          34,
        ),
      );
    else {
      b.push(t(cx[i] + 280, 234, cd.range, { c: "m s13 w6", a: "end" }));
      const s = scale(0, 100, cx[i] + 8, cx[i] + 272);
      b.push(
        ln(s(0), 263, s(100), 263, "hair"),
        ln(s(10), 263, s(80), 263, "stroke"),
      );
      for (let k = 0; k <= 100; k += 10)
        b.push(ln(s(k), 268, s(k), k % 50 ? 271 : 274, "thin"));
      b.push(
        r(s(10) - 6, 256, 12, 14, { c: "box", "stroke-width": 1.5 }),
        r(s(80) - 6, 256, 12, 14, { c: "box", "stroke-width": 1.5 }),
      );
    }
  });
  // results
  H.vehicles.forEach((v, i) => {
    const x = 32 + i * 696;
    b.push(r(x, 308, 680, 124, { c: "box" }));
    b.push(
      seriesKey(x + 20, 340, i, 26),
      t(x + 56, 345, v.name, { c: "s16 w6" }),
      t(x + 660, 345, "da 10% a 80%", { c: "m s12 c3", a: "end" }),
    );
    b.push(
      t(x + 20, 404, v.result.time, { c: "m s48 w6" }),
      tag(x + 560, 345, "calcolo"),
    );
    b.push(
      t(x + 248, 374, v.result.energy, { c: "s14 w6" }),
      t(x + 248, 396, v.result.avg, { c: "s13 c2" }),
      t(x + 248, 416, v.result.limit, { c: "s13 c2" }),
    );
  });

  // ---- power by SoC
  const PX = [96, 680],
    PY = [520, 820];
  const sx = scale(0, 100, PX[0], PX[1]),
    sy = scale(0, 200, PY[1], PY[0]);
  b.push(
    r(32, 452, 680, 424, { c: "box" }),
    t(52, 482, "Potenza per livello di carica", { c: "s15 w6" }),
  );
  b.push(
    r(sx(10), PY[0], sx(80) - sx(10), PY[1] - PY[0], { fill: "url(#hatch)" }),
  );
  for (let s = 0; s <= 100; s += 5)
    b.push(ln(sx(s), PY[0], sx(s), PY[1], s % 20 ? "grid" : "hair"));
  for (let kw = 0; kw <= 200; kw += 10)
    b.push(ln(PX[0], sy(kw), PX[1], sy(kw), kw % 50 ? "grid" : "hair"));
  for (let s = 0; s <= 100; s += 20)
    b.push(t(sx(s), PY[1] + 20, `${s}%`, { c: "m s11 c2", a: "middle" }));
  for (let kw = 0; kw <= 200; kw += 50)
    b.push(t(PX[0] - 10, sy(kw) + 4, String(kw), { c: "m s11 c2", a: "end" }));
  b.push(t(PX[0] - 10, PY[0] - 14, "kW", { c: "m s11 c3", a: "end" }));
  b.push(
    ln(PX[0], sy(150), PX[1], sy(150), "limit"),
    t(PX[1] - 4, sy(150) - 8, "colonnina 150 kW", { c: "m s11 c2", a: "end" }),
  );
  const [nv, av] = H.vehicles;
  const toPts = (pts) => pts.map(([s, kw]) => [sx(s), sy(kw)]);
  b.push(
    pl(
      toPts(
        sampleCurve(
          (s) => Math.min(curvePower(nv.curve, s), nv.maxDc),
          nv.curve,
        ),
      ),
      "s1pot",
    ),
  );
  b.push(
    pl(
      toPts(sampleCurve((s) => effectivePower(av, s, H.station), av.curve)),
      "s2",
    ),
  );
  b.push(
    pl(
      toPts(sampleCurve((s) => effectivePower(nv, s, H.station), nv.curve)),
      "s1",
    ),
  );
  nv.curve.forEach(([s, kw]) =>
    b.push(r(sx(s) - 3, sy(kw) - 3, 6, 6, { c: "box", "stroke-width": 1.2 })),
  );
  av.curve.forEach(([s, kw]) =>
    b.push(
      p(`M${sx(s)},${sy(kw) - 4} l4,4 l-4,4 l-4,-4 Z`, "", {
        fill: K.sheet,
        stroke: K.series[1],
        "stroke-width": 1.2,
      }),
    ),
  );
  b.push(
    t(sx(56), sy(175) - 10, "curva del veicolo oltre il limite", {
      c: "m s10 c3",
      a: "middle",
    }),
  );
  b.push(
    t(sx(24), sy(150) - 7, "Nordis E4", { c: "s12 w6" }),
    t(sx(22), sy(110), "Aurora Vela", { c: "s12 w6 blue" }),
  );
  b.push(
    r(52, 856, 6, 6, { c: "box", "stroke-width": 1.2 }),
    t(
      64,
      862,
      "punto della curva (costruttore) · tra i punti: interpolazione lineare",
      { c: "m s10 c3" },
    ),
  );

  // ---- energy over time
  const EX = [792, 1376],
    EY = PY;
  const ex = scale(0, 30, EX[0], EX[1]),
    ey = scale(0, 60, EY[1], EY[0]);
  b.push(
    r(728, 452, 680, 424, { c: "box" }),
    t(748, 482, "Energia caricata nel tempo", { c: "s15 w6" }),
  );
  for (let m = 0; m <= 30; m += 1)
    b.push(ln(ex(m), EY[0], ex(m), EY[1], m % 5 ? "grid" : "hair"));
  for (let k = 0; k <= 60; k += 5)
    b.push(ln(EX[0], ey(k), EX[1], ey(k), k % 20 ? "grid" : "hair"));
  for (let m = 0; m <= 30; m += 5)
    b.push(t(ex(m), EY[1] + 20, `${m} min`, { c: "m s11 c2", a: "middle" }));
  for (let k = 0; k <= 60; k += 20)
    b.push(t(EX[0] - 10, ey(k) + 4, String(k), { c: "m s11 c2", a: "end" }));
  b.push(t(EX[0] - 10, EY[0] - 14, "kWh", { c: "m s11 c3", a: "end" }));
  b.push(
    ln(ex(20), EY[0], ex(20), EY[1], "limit"),
    t(ex(20), EY[0] - 8, "a 20 min", { c: "m s11 c2", a: "middle" }),
  );
  b.push(
    pl(
      av.energy.map(([m, k]) => [ex(m), ey(k)]),
      "s2",
    ),
    pl(
      nv.energy.map(([m, k]) => [ex(m), ey(k)]),
      "s1",
    ),
  );
  [nv, av].forEach((v, i) => {
    const X = ex(v.end.min),
      Y = ey(v.end.kwh);
    b.push(
      i
        ? p(`M${X},${Y - 5} l5,5 l-5,5 l-5,-5 Z`, "", { fill: K.series[1] })
        : r(X - 4, Y - 4, 8, 8, { c: "ink" }),
    );
    b.push(
      t(X + (i ? -10 : 10), Y + (i ? -12 : 4), `80% · ${fmt(v.end.kwh)} kWh`, {
        c: `m s11 w6 ${i ? "blue" : ""}`,
        a: i ? "end" : "start",
      }),
    );
    const y20 = ey(v.at20.kwh);
    b.push(
      ci(ex(20), y20, 3, "", {
        fill: K.sheet,
        stroke: K.series[i],
        "stroke-width": 1.5,
      }),
    );
    b.push(
      t(
        ex(20) + (i ? 8 : -8),
        y20 + (i ? 20 : -8),
        `${fmt(v.at20.kwh)} kWh · ${v.at20.soc}%`,
        { c: `m s11 ${i ? "blue" : ""}`, a: i ? "start" : "end" },
      ),
    );
  });
  b.push(
    t(
      748,
      862,
      "valori del simulatore M0.1 · stessa colonnina, partenza dal 10%",
      { c: "m s10 c3" },
    ),
  );

  // ---- other stations + assumptions
  b.push(
    t(32, 922, "Con altre colonnine", { c: "s16 w6" }),
    t(210, 922, "da 10% a 80%", { c: "m s12 c3" }),
  );
  const TX = [32, 260, 500];
  b.push(ln(32, 940, 712, 940, "hairink"));
  b.push(
    t(TX[0] + 16, 962, "Colonnina", { c: "m s11 c3" }),
    t(TX[1], 962, "Nordis E4 · +53,9 kWh", { c: "m s11 c3" }),
    t(TX[2], 962, "Aurora Vela · +40,6 kWh", { c: "m s11 c3" }),
  );
  [50, 150, 350].forEach((kw, i) => {
    const y = 998 + i * 36;
    if (kw === 150)
      b.push(
        r(32, y - 23, 680, 36, { c: "sheet" }),
        r(32, y - 23, 3, 36, { c: "sigf" }),
      );
    b.push(
      t(TX[0] + 16, y, `${kw} kW`, { c: `m s14 ${kw === 150 ? "w6" : ""}` }),
      t(TX[1], y, nv.stations[kw], { c: "m s14 w6" }),
      t(TX[2], y, av.stations[kw], { c: "m s14 w6" }),
    );
    b.push(ln(32, y + 13, 712, y + 13, "hair"));
  });
  b.push(
    r(728, 902, 680, 176, { c: "boxr" }),
    t(748, 932, "Ipotesi", { c: "s15 w6" }),
    t(1388, 932, "Limiti del calcolo →", { c: "s13 w6 u", a: "end" }),
  );
  H.assumptions.forEach((a, i) =>
    b.push(
      t(748, 966 + i * 26, `${i + 1}`, { c: "m s11 c3" }),
      t(770, 966 + i * 26, a, { c: "s13 c2" }),
    ),
  );
  return svgDoc({
    w: W,
    h: Hh,
    title: "Tavola — DC charging curves",
    desc: "Concept Tavola: confronto delle curve di ricarica DC di Nordis E4 e Aurora Vela a 150 kW, valori dal simulatore M0.1.",
    style,
    defs,
    body: b,
  });
}

function identitySheet() {
  const b = [r(0, 0, 1440, 900, { c: "paper" })];
  b.push(
    t(48, 72, "Tavola", { c: "s48 w6", "letter-spacing": "-1" }),
    t(
      48,
      104,
      "Il veicolo come disegno tecnico annotato: inchiostro, linee sottili, cifre monospaziate.",
      { c: "s16 c2" },
    ),
  );
  // palette
  b.push(t(48, 160, "COLORE", { c: "m s11 c3 caps" }));
  const sw = [
    ["Carta", K.paper, "sfondo"],
    ["Foglio", K.sheet, "superfici"],
    ["Inchiostro", K.ink, "testo, linee, azioni"],
    ["Grafite", K.ink2, "testo secondario"],
    ["Grafite chiara", K.ink3, "note, assi"],
    ["Filo", K.rule, "divisori"],
    ["Vermiglio", K.signal, "focus, selezione, stato attivo"],
  ];
  sw.forEach(([n, hex, role], i) => {
    const x = 48 + i * 132;
    b.push(
      r(x, 172, 120, 72, { fill: hex, stroke: K.rule }),
      t(x, 264, n, { c: "s13 w6" }),
      t(x, 282, hex, { c: "m s11 c2" }),
      t(x, 298, role, { c: "s11 c3" }),
    );
  });
  b.push(t(990, 160, "SERIE NEI GRAFICI", { c: "m s11 c3 caps" }));
  ["solido", "tratteggio", "punto-linea", "punto"].forEach((st, i) => {
    const y = 186 + i * 28;
    b.push(
      ln(990, y, 1060, y, "", {
        stroke: K.series[i],
        "stroke-width": 2,
        "stroke-dasharray": ["", "7 4", "10 3 2 3", "2 3"][i],
      }),
    );
    b.push(
      t(1072, y + 4, `${i + 1} · ${K.series[i]} · ${st}`, { c: "m s11 c2" }),
    );
  });
  // type
  b.push(t(48, 350, "TIPOGRAFIA", { c: "m s11 c3 caps" }));
  b.push(
    t(48, 400, "Trova l’auto adatta a te.", {
      c: "s40 w6",
      "letter-spacing": "-0.8",
    }),
    t(560, 400, "IBM Plex Sans 600 · 52/40/28", { c: "m s11 c3" }),
  );
  b.push(
    t(48, 436, "Testo corrente, etichette e azioni in IBM Plex Sans.", {
      c: "s15",
    }),
    t(560, 436, "IBM Plex Sans 400–600 · 12–16", { c: "m s11 c3" }),
  );
  b.push(
    t(48, 476, "22 min · +53,9 kWh · €41.500", { c: "m s24 w6" }),
    t(560, 476, "IBM Plex Mono: tutte le cifre", { c: "m s11 c3" }),
  );
  b.push(
    t(48, 506, "REQUISITI · PREFERENZE · CRITERIO COLLEGATO", {
      c: "m s11 c3 caps",
    }),
    t(560, 506, "IBM Plex Mono 10–11 maiuscolo", { c: "m s11 c3" }),
  );
  // components
  b.push(t(48, 566, "COMPONENTI", { c: "m s11 c3 caps" }));
  b.push(
    criterionBox(48, 580, 260, D.requirements[0], "req"),
    criterionBox(48, 636, 260, D.preferences[0], "pref"),
    criterionBox(48, 692, 260, D.requirements[2], "req", true),
  );
  b.push(
    button(340, 580, 140, "Confronta →", "ink"),
    button(490, 580, 120, "Apri scheda"),
    segmented(340, 630, ["Schede", "Elenco", "Differenze"], 0, [66, 66, 92]),
  );
  b.push(
    check(340, 684),
    t(360, 695, "requisito rispettato", { c: "s13" }),
    miss(340, 708),
    t(360, 719, "requisito non rispettato", { c: "s13" }),
  );
  b.push(
    tag(450, 752, "costruttore"),
    tag(560, 752, "stima"),
    tag(670, 752, "calcolo"),
  );
  b.push(
    t(
      340,
      780,
      "Fonte: glifo + parola, colonna fissa a destra dell’etichetta.",
      { c: "s12 c3" },
    ),
  );
  b.push(
    plate("suv", 700, 580, 260, 130),
    plate("compact", 980, 580, 200, 130),
    plate("mpv", 1200, 580, 200, 130),
  );
  b.push(
    t(
      700,
      734,
      "Rappresentazione dei veicoli: prospetto laterale a linea, griglia, interassi in asse.",
      { c: "s12 c3" },
    ),
  );
  b.push(
    t(
      48,
      860,
      "Font: IBM Plex Sans e IBM Plex Mono (OFL). Fallback: Helvetica Neue / Arial, Consolas / Menlo.",
      { c: "m s11 c3" },
    ),
  );
  return svgDoc({
    w: 1440,
    h: 900,
    title: "Tavola — Identity sheet",
    desc: "Palette, tipografia e componenti del concept Tavola.",
    style,
    defs,
    body: b,
  });
}

const concept = {
  id: "tavola",
  screens: {
    identity: identitySheet,
    landing: landingScreen,
    discovery: discoveryScreen,
    comparison: comparisonScreen,
    charging: chargingScreen,
  },
};

export default concept;
