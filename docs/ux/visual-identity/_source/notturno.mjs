// Concept 3 — Notturno. A night instrument panel: warm graphite surfaces, information lit by
// relevance, amber reserved for focus and the active state. Cars appear as low-key studio
// photography (here a placeholder rendered with light gradients).
import {
  t,
  r,
  ln,
  ci,
  p,
  g,
  pl,
  el,
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
  bg: "#141412",
  panel: "#1C1B18",
  panel2: "#24221F",
  line: "#36332E",
  line2: "#4A4640",
  text: "#EDE9E1",
  text2: "#B5AFA4",
  text3: "#8E887D",
  amber: "#F2B24C",
  amberDim: "#4A3819",
  series: ["#C4841E", "#3A8EDB", "#C45FA0", "#2C9A6A"],
};

const style = `
${typeUtilities()}
text{font-family:Barlow,Bahnschrift,'DIN Alternate','Segoe UI',Arial,sans-serif;fill:${K.text}}
.n{font-family:'Barlow Semi Condensed',Bahnschrift,'DIN Alternate','Arial Narrow',Arial,sans-serif}
.c2{fill:${K.text2}}.c3{fill:${K.text3}}.am{fill:${K.amber}}.dk{fill:${K.bg}}
.caps{letter-spacing:1.6px}
.bg{fill:${K.bg}}.panel{fill:${K.panel}}.panel2{fill:${K.panel2}}
.box{fill:${K.panel2};stroke:${K.line2};stroke-width:1}
.boxl{fill:${K.panel};stroke:${K.line};stroke-width:1}
.dash{fill:none;stroke:${K.line2};stroke-width:1.2;stroke-dasharray:5 4}
.focus{fill:${K.panel2};stroke:${K.amber};stroke-width:1.5}
.line{stroke:${K.line};stroke-width:1;fill:none}
.line2{stroke:${K.line2};stroke-width:1;fill:none}
.grid{stroke:#2A2824;stroke-width:1;fill:none}
.stroke{stroke:${K.text};stroke-width:1.6;fill:none;stroke-linecap:round;stroke-linejoin:round}
.strokeam{stroke:${K.amber};stroke-width:1.6;fill:none;stroke-linecap:round;stroke-linejoin:round}
.strokedim{stroke:${K.text3};stroke-width:1.4;fill:none;stroke-linecap:round;stroke-linejoin:round}
`;

const defs = `
<radialGradient id="spot" cx="50%" cy="20%" r="75%"><stop offset="0" stop-color="#34312C"/><stop offset="0.55" stop-color="#1D1C19"/><stop offset="1" stop-color="#121210"/></radialGradient>
<linearGradient id="rim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F4EEE3" stop-opacity="0"/><stop offset="0.35" stop-color="#F4EEE3" stop-opacity="0.85"/><stop offset="0.7" stop-color="#F4EEE3" stop-opacity="0.5"/><stop offset="1" stop-color="#F4EEE3" stop-opacity="0"/></linearGradient>
<linearGradient id="paint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A3731"/><stop offset="0.45" stop-color="#191816"/><stop offset="1" stop-color="#0B0B0A"/></linearGradient>
<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3A3833"/><stop offset="1" stop-color="#1A1917"/></linearGradient>
<radialGradient id="heroSpot" cx="72%" cy="10%" r="60%"><stop offset="0" stop-color="#36332D"/><stop offset="0.6" stop-color="#1A1916"/><stop offset="1" stop-color="#141412"/></radialGradient>
<radialGradient id="floor" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#000000" stop-opacity="0.7"/><stop offset="1" stop-color="#000000" stop-opacity="0"/></radialGradient>
`;

// ---------------------------------------------------------------- components

const logo = (x, y) =>
  g([
    ci(x + 13, y + 13, 12, "", {
      fill: "none",
      stroke: K.line2,
      "stroke-width": 1.5,
    }),
    ci(x + 13, y + 13, 4, "", { fill: K.amber }),
  ]);

const navBar = (active, count) => {
  const xs = [220, 305, 447];
  const out = [
    r(0, 0, 1440, 64, { c: "bg" }),
    ln(0, 64, 1440, 64, "line"),
    logo(32, 19),
    t(68, 38, nav.brand, { c: "s18 w6" }),
  ];
  nav.items.forEach((it, i) => {
    out.push(t(xs[i], 38, it, { c: `s15 ${active === i ? "w6" : "w5 c2"}` }));
    if (active === i)
      out.push(ci(xs[i] + it.length * 4.1, 54, 2.5, "", { fill: K.amber }));
  });
  if (count)
    out.push(
      r(386, 26, 22, 18, { rx: 9, fill: K.panel2, stroke: K.line2 }),
      t(397, 39, String(count), { c: "n s12 w6", a: "middle" }),
    );
  out.push(t(1408, 38, nav.right, { c: "s14 c2", a: "end" }));
  return g(out);
};

/** Low-key studio shot: spot-lit backdrop, dark body, rim light along the roof, floor shadow. */
const photo = (type, x, y, w, h, { round = 0, carW, bare = false } = {}) => {
  const cw = carW || Math.min(w * 0.78, (h - 16) * 2.4);
  const cx = x + (w - cw) / 2;
  const c = car(type, cx, y + h - cw * 0.36 - h * 0.12, cw);
  return g([
    bare ? "" : r(x, y, w, h, { rx: round, fill: "url(#spot)" }),
    el("ellipse", {
      cx: cx + cw / 2,
      cy: c.ground,
      rx: cw * 0.56,
      ry: cw * 0.035,
      fill: "url(#floor)",
    }),
    p(c.body, "", { fill: "url(#paint)" }),
    p(c.windows, "", { fill: "url(#glass)" }),
    p(c.pillar, "", { stroke: "#0B0B0A", "stroke-width": cw / 90 }),
    p(c.roof, "", {
      stroke: "url(#rim)",
      "stroke-width": Math.max(1.2, cw / 220),
      fill: "none",
    }),
    ...c.wheels.map((wx) =>
      g([
        ci(wx, c.wheelY, c.wheelR, "", { fill: "#0A0A09" }),
        ci(wx, c.wheelY, c.wheelR * 0.62, "", {
          fill: "none",
          stroke: "#3A3732",
          "stroke-width": Math.max(1, cw / 220),
        }),
      ]),
    ),
  ]);
};

const tag = (xRight, y, name) => {
  const label = name.toUpperCase();
  const w = label.length * 6.4 + 14;
  const x = xRight - w;
  const frame =
    name === "costruttore"
      ? r(x, y - 12, w, 16, { rx: 3, fill: K.line })
      : name === "stima"
        ? r(x, y - 12, w, 16, { rx: 3, c: "dash" })
        : r(x, y - 12, w, 16, { rx: 3, fill: "none", stroke: K.line2 });
  return g([
    frame,
    t(x + w / 2, y, label, {
      c: "n s10 w6 c2 caps",
      a: "middle",
      "letter-spacing": "0.8",
    }),
  ]);
};

const check = (cx, cy) =>
  g([
    ci(cx, cy, 7, "", { fill: "none", stroke: K.text2, "stroke-width": 1.2 }),
    p(checkPath(cx - 7, cy - 7, 14), "stroke", { "stroke-width": 1.4 }),
  ]);
const miss = (cx, cy) =>
  g([
    ci(cx, cy, 7, "", { fill: "none", stroke: K.text2, "stroke-width": 1.2 }),
    ln(cx - 3.5, cy, cx + 3.5, cy, "stroke"),
  ]);

/** Segment bar: lit segments for each satisfied criterion, requirements then preferences. */
const segments = (x, y, req, pref, litReq = req, litPref = pref) => {
  const out = [];
  let cx = x;
  for (let i = 0; i < req; i++) {
    out.push(r(cx, y, 14, 6, { rx: 1, fill: i < litReq ? K.text : K.line }));
    cx += 17;
  }
  cx += 6;
  for (let i = 0; i < pref; i++) {
    out.push(
      r(cx, y, 14, 6, {
        rx: 1,
        fill: i < litPref ? K.text : "none",
        stroke: i < litPref ? "none" : K.line2,
      }),
    );
    cx += 17;
  }
  return g(out);
};

const button = (x, y, w, label, kind = "line", h = 38) => {
  if (kind === "amber")
    return g([
      r(x, y, w, h, { rx: 8, fill: K.amber }),
      t(x + w / 2, y + h / 2 + 5, label, { c: "s14 w7 dk", a: "middle" }),
    ]);
  return g([
    r(x, y, w, h, { rx: 8, c: "box" }),
    t(x + w / 2, y + h / 2 + 5, label, { c: "s14 w6", a: "middle" }),
  ]);
};

const segmented = (x, y, labels, active, widths, h = 34) => {
  const total = widths.reduce((a, b) => a + b, 0);
  const out = [r(x, y, total, h, { rx: 8, c: "box" })];
  let cx = x;
  labels.forEach((l, i) => {
    if (i === active)
      out.push(
        r(cx + 3, y + 3, widths[i] - 6, h - 6, { rx: 6, fill: K.line }),
        r(cx + widths[i] / 2 - 8, y + h - 5, 16, 2, { fill: K.amber }),
      );
    out.push(
      t(cx + widths[i] / 2, y + h / 2 + 4.5, l, {
        c: `s13 ${i === active ? "w6" : "w5 c2"}`,
        a: "middle",
      }),
    );
    cx += widths[i];
  });
  return g(out);
};

const seriesSwatch = (x, y, i, len = 18) =>
  ln(x, y, x + len, y, "", {
    stroke: K.series[i],
    "stroke-width": 3,
    "stroke-linecap": "round",
  });

// ---------------------------------------------------------------- screens

function landingScreen() {
  const L = landing;
  const b = [r(0, 0, 1440, 880, { c: "bg" })];
  b.push(
    r(0, 64, 1440, 320, { fill: "url(#heroSpot)" }),
    photo("suv", 620, 64, 820, 300, { carW: 600, bare: true }),
  );
  b.push(navBar(-1));
  b.push(
    t(96, 168, "Trova l’auto elettrica", {
      c: "s52 w6",
      "letter-spacing": "-0.8",
    }),
    t(96, 226, "adatta a te.", { c: "s52 w6", "letter-spacing": "-0.8" }),
  );
  b.push(t(98, 272, L.subtitle, { c: "s26 w4 c2" }));

  const py = 384;
  b.push(
    r(96, py, 610, 308, { rx: 14, c: "panel" }),
    r(734, py, 610, 308, { rx: 14, c: "panel" }),
  );
  b.push(t(124, py + 42, L.model.heading, { c: "s20 w6" }));
  b.push(
    r(124, py + 60, 450, 50, { rx: 10, c: "focus" }),
    ci(150, py + 84, 7, "strokedim"),
    ln(155, py + 89, 160, py + 94, "strokedim"),
  );
  b.push(
    t(172, py + 91, L.model.query, { c: "s17" }),
    ln(204, py + 73, 204, py + 97, "strokeam"),
  );
  b.push(button(584, py + 60, 94, L.model.button, "amber", 50));
  b.push(r(124, py + 120, 554, 168, { rx: 10, c: "panel2" }));
  b.push(t(144, py + 144, "MODELLI", { c: "n s11 w6 c3 caps" }));
  L.model.models.forEach((m, i) => {
    const y = py + 170 + i * 28;
    if (i === 0) b.push(r(132, y - 19, 538, 28, { rx: 6, fill: K.line }));
    b.push(
      t(144, y, m.name, { c: "s15 w6" }),
      t(236, y, m.body, { c: "s14 c2" }),
      t(658, y, m.action, { c: `s13 ${i === 0 ? "am w6" : "c2"}`, a: "end" }),
    );
  });
  b.push(
    ln(144, py + 208, 658, py + 208, "line"),
    t(144, py + 230, "MARCHE", { c: "n s11 w6 c3 caps" }),
  );
  b.push(
    t(144, py + 254, L.model.brands[0].name, { c: "s15 w6" }),
    t(658, py + 254, L.model.brands[0].action, { c: "s13 c2", a: "end" }),
  );
  b.push(t(144, py + 278, L.model.all, { c: "s13 c3" }));

  b.push(t(762, py + 42, L.needs.heading, { c: "s20 w6" }));
  let cx = 762,
    cy = py + 62;
  L.needs.chips.forEach((chip) => {
    const w = chip.length * 7.6 + 46;
    if (cx + w > 1316) {
      cx = 762;
      cy += 46;
    }
    b.push(
      r(cx, cy, w, 36, {
        rx: 8,
        c: chip === "Specifiche tecniche" ? "dash" : "box",
      }),
      t(cx + 16, cy + 23, "+", { c: "s16 w6 am" }),
      t(cx + 32, cy + 23, chip, { c: "s14 w5" }),
    );
    cx += w + 8;
  });
  b.push(button(762, py + 172, 300, L.needs.cta, "amber", 48));

  const dy = 724;
  b.push(t(96, dy, L.direct.heading.toUpperCase(), { c: "n s12 w6 c3 caps" }));
  L.direct.items.forEach((it, i) => {
    const x = 96 + i * 424;
    b.push(r(x, dy + 14, 400, 94, { rx: 12, c: "boxl" }));
    b.push(
      t(x + 24, dy + 48, it.title, { c: "s17 w6" }),
      t(x + 24, dy + 72, it.text, { c: "s13 c2" }),
      t(x + 24, dy + 96, it.link, { c: "s13 w6 am" }),
    );
  });
  b.push(t(96, 868, L.footer, { c: "s12 c3" }));
  return svgDoc({
    w: 1440,
    h: 880,
    title: "Notturno — Landing Page",
    desc: "Concept Notturno applicato alla landing consolidata.",
    style,
    defs,
    body: b,
  });
}

function criterionBox(x, y, w, item, kind, open = false) {
  const out = [
    r(x, y, w, 48, {
      rx: 8,
      c: open ? "focus" : kind === "req" ? "box" : "dash",
    }),
  ];
  out.push(
    t(x + 14, y + 19, item.label, { c: "s12 c2" }),
    t(x + 14, y + 38, item.value, { c: "s15 w6" }),
  );
  if (item.spec)
    out.push(
      r(x + 146, y + 8, 36, 15, { rx: 3, fill: K.line }),
      t(x + 164, y + 19, "SPEC", { c: "n s10 w6 c2", a: "middle" }),
    );
  out.push(
    p(chevron(x + w - 20, y + 24, 5, open), open ? "strokeam" : "strokedim"),
  );
  return g(out);
}

function discoveryScreen() {
  const b = [r(0, 0, 1440, 1330, { c: "bg" }), navBar(0, 2)];
  b.push(
    r(32, 86, 1376, 50, { rx: 10, c: "box" }),
    ci(58, 110, 7, "strokedim"),
    ln(63, 115, 68, 120, "strokedim"),
    t(80, 117, D.search, { c: "s15 c3" }),
  );
  b.push(r(16, 156, 352, 1150, { rx: 14, c: "panel" }));
  b.push(
    t(32, 192, D.criteriaTitle, { c: "s19 w6" }),
    t(352, 192, D.reset, { c: "s13 c2", a: "end" }),
  );
  b.push(
    r(32, 208, 28, 14, { rx: 4, c: "box" }),
    t(68, 220, D.legend.req, { c: "s12 c2" }),
    r(194, 208, 28, 14, { rx: 4, c: "dash" }),
    t(230, 220, D.legend.pref, { c: "s12 c2" }),
  );
  b.push(t(32, 252, "REQUISITI", { c: "n s11 w6 c3 caps" }));
  D.requirements.forEach((it, i) =>
    b.push(criterionBox(32, 262 + i * 56, 320, it, "req", it.open)),
  );
  const E = D.editor,
    ey = 432;
  b.push(r(32, ey, 320, 304, { rx: 10, c: "panel2" }));
  b.push(
    t(48, ey + 28, E.min, { c: "s12 c2" }),
    t(336, ey + 30, E.minValue, { c: "n s20 w6", a: "end" }),
  );
  const sx = scale(50, 350, 56, 328);
  b.push(
    r(sx(50), ey + 50, sx(350) - sx(50), 4, { rx: 2, fill: K.line }),
    r(sx(100), ey + 50, sx(350) - sx(100), 4, { rx: 2, fill: K.amber }),
  );
  b.push(
    ci(sx(100), ey + 52, 9, "", {
      fill: K.text,
      stroke: K.bg,
      "stroke-width": 3,
    }),
    ci(sx(350), ey + 52, 9, "", {
      fill: K.text,
      stroke: K.bg,
      "stroke-width": 3,
    }),
  );
  b.push(
    t(48, ey + 80, E.from, { c: "n s12 c3" }),
    t(336, ey + 80, E.to, { c: "n s12 c3", a: "end" }),
  );
  b.push(
    t(48, ey + 112, E.behaviour, { c: "s12 c2" }),
    segmented(48, ey + 122, [E.req, E.pref], 0, [144, 144], 34),
  );
  b.push(ln(48, ey + 174, 336, ey + 174, "line"));
  b.push(
    ci(57, ey + 194, 8, "", { fill: "none", stroke: K.text3 }),
    t(57, ey + 198, "?", { c: "s11 w7 c2", a: "middle" }),
    t(74, ey + 199, E.explain, { c: "s14 w6" }),
    t(336, ey + 199, E.explainAction, { c: "s13 c2", a: "end" }),
  );
  b.push(ln(48, ey + 216, 336, ey + 216, "line"));
  b.push(
    t(48, ey + 238, E.linkedKicker, { c: "n s11 w6 c3 caps" }),
    tag(336, ey + 238, "calcolo"),
  );
  b.push(
    t(48, ey + 260, E.linkedTitle, { c: "s15 w6" }),
    t(48, ey + 278, E.linkedText, { c: "s12 c2" }),
  );
  b.push(t(48, ey + 296, E.linkedAction, { c: "s13 w6 am" }));

  b.push(t(32, 768, "PREFERENZE", { c: "n s11 w6 c3 caps" }));
  D.preferences.forEach((it, i) =>
    b.push(criterionBox(32, 778 + i * 56, 320, it, "pref")),
  );
  b.push(
    r(32, 952, 320, 42, { rx: 8, c: "box" }),
    t(192, 978, D.addCriterion, { c: "s14 w6", a: "middle" }),
  );
  b.push(t(32, 1020, D.categories, { c: "s12 c3" }));

  b.push(
    t(392, 190, D.resultsTitle, { c: "s24 w6" }),
    t(392, 214, D.resultsSub, { c: "s13 c2" }),
  );
  b.push(
    segmented(948, 172, D.views, 0, [74, 70, 96], 36),
    r(1196, 172, 212, 36, { rx: 8, c: "box" }),
    t(1212, 195, D.sort, { c: "s13" }),
    p(chevron(1390, 190), "strokedim"),
  );
  b.push(
    r(392, 230, 1016, 36, { rx: 8, c: "panel" }),
    ci(410, 248, 3, "", { fill: K.amber }),
    t(424, 253, D.notice, { c: "s13 c2" }),
    t(1394, 253, D.undo, { c: "s13 w6 am", a: "end" }),
  );
  b.push(
    r(392, 278, 1016, 52, { rx: 10, c: "boxl" }),
    t(410, 309, D.tray.label, { c: "s14 w6" }),
  );
  D.tray.items.forEach((it, i) => {
    const x = 548 + i * 146;
    b.push(
      r(x, 290, 136, 28, { rx: 14, c: "box" }),
      seriesSwatch(x + 12, 304, i, 14),
      t(x + 34, 309, it, { c: "s13 w5" }),
      t(x + 122, 309, "×", { c: "s15 c2", a: "middle" }),
    );
  });
  b.push(
    t(1240, 309, D.tray.diff, { c: "s13 c2", a: "end" }),
    button(1256, 286, 140, D.tray.cta, "amber", 36),
  );

  D.results.forEach((res, i) => {
    const v = vehicles[res.id];
    const x = 392 + i * 344,
      y = 346,
      w = 328;
    b.push(
      r(x, y, w, 456, {
        rx: 14,
        c: "panel",
        stroke: res.inCompare ? K.line2 : "none",
      }),
    );
    b.push(
      photo(v.body, x, y, w, 148, { round: 14 }),
      r(x, y + 134, w, 14, { fill: K.panel, opacity: 0 }),
    );
    b.push(
      t(x + 20, y + 180, v.name, { c: "s18 w6" }),
      t(x + 20, y + 200, v.kind, { c: "s13 c2" }),
    );
    b.push(
      t(x + 20, y + 238, v.price, { c: "n s26 w6" }),
      t(x + 140, y + 238, "listino", { c: "s12 c3" }),
    );
    b.push(
      segments(x + w - 20 - 117, y + 230, 3, 2),
      t(x + w - 20, y + 222, "5 di 5", { c: "n s12 c2", a: "end" }),
    );
    b.push(ln(x + 20, y + 254, x + w - 20, y + 254, "line"));
    b.push(t(x + 20, y + 276, "REQUISITI", { c: "n s11 w6 c3 caps" }));
    D.reqLabels.forEach((l, k) => {
      const lx = x + 20 + [0, 84, 190][k];
      b.push(check(lx + 7, y + 293), t(lx + 20, y + 298, l, { c: "s13" }));
    });
    b.push(t(x + 20, y + 328, "PREFERENZE", { c: "n s11 w6 c3 caps" }));
    b.push(
      check(x + 27, y + 345),
      t(x + 40, y + 350, `Viaggio 400 km: ${v.stop}`, { c: "s13" }),
      tag(x + w - 20, y + 350, "stima"),
    );
    b.push(
      check(x + 27, y + 369),
      t(x + 40, y + 374, D.prefDaily, { c: "s13" }),
    );
    b.push(
      t(x + 20, y + 404, D.why, { c: "s13 w6 am" }),
      t(x + w - 20, y + 404, res.specs, { c: "n s13 c2", a: "end" }),
    );
    b.push(button(x + 20, y + 414, 120, "Apri scheda", "line", 32));
    if (res.inCompare)
      b.push(
        r(x + 148, y + 414, 160, 32, {
          rx: 8,
          fill: K.amberDim,
          stroke: K.amber,
        }),
        p(checkPath(x + 158, y + 422, 16), "strokeam"),
        t(x + 180, y + 435, "Nel confronto", { c: "s13 w6" }),
      );
    else
      b.push(
        button(x + 148, y + 414, 160, "Aggiungi al confronto", "line", 32),
      );
  });

  b.push(
    t(392, 852, D.near.title, { c: "s18 w6" }),
    t(392, 874, D.near.sub, { c: "s13 c2" }),
  );
  D.near.items.forEach((n, i) => {
    const v = vehicles[n.id],
      y = 892 + i * 96;
    b.push(r(392, y, 1016, 84, { rx: 12, c: "dash" }));
    b.push(photo(v.body, 404, y + 12, 104, 60, { round: 8 }));
    b.push(
      t(524, y + 32, v.name, { c: "s16 w6" }),
      t(524, y + 52, v.kind, { c: "s12 c2" }),
      t(524, y + 72, "Apri scheda ›", { c: "s12 am w6" }),
    );
    b.push(
      segments(780, y + 22, 3, 3, 2, 3),
      t(780, y + 50, D.near.missKicker, { c: "n s11 w6 c3 caps" }),
      miss(787, y + 66),
      t(800, y + 71, n.miss, { c: "s13 w6" }),
    );
    b.push(
      button(1076, y + 14, 208, n.fix, "line", 32),
      t(1180, y + 68, n.flex, { c: "s12 c2", a: "middle" }),
    );
    b.push(
      r(1302, y + 24, 16, 16, { rx: 4, c: "box" }),
      t(1326, y + 37, "Confronta", { c: "s13 c2" }),
    );
  });
  b.push(t(392, 1120, D.deeper.title, { c: "s18 w6" }));
  D.deeper.items.forEach((it, i) => {
    const x = 392 + i * 516;
    b.push(
      r(x, 1136, 500, 76, { rx: 12, c: "boxl" }),
      t(x + 22, 1168, it.title, { c: "s15 w6" }),
      t(x + 22, 1190, it.text, { c: "s12 c2" }),
      t(x + 474, 1180, "→", { c: "s18 am", a: "end" }),
    );
  });
  b.push(
    t(392, 1258, D.footnote, { c: "s12 c3" }),
    t(392, 1280, D.footlink, { c: "s12 w6 am" }),
  );
  return svgDoc({
    w: 1440,
    h: 1330,
    title: "Notturno — Vehicle Discovery, Active Criteria",
    desc: "Concept Notturno applicato alla ricerca con sei criteri attivi.",
    style,
    defs,
    body: b,
  });
}

function comparisonScreen() {
  const b = [r(0, 0, 1440, 1628, { c: "bg" }), navBar(1, 2)];
  const COL = [424, 748];
  b.push(
    r(0, 65, 1440, 46, { c: "panel" }),
    t(32, 94, C.context.back, { c: "s14 w6 am" }),
    t(112, 94, C.context.summary, { c: "n s13 c3" }),
    t(1408, 94, C.context.edit, { c: "s14 w6", a: "end" }),
  );
  b.push(
    t(32, 172, C.title, { c: "s30 w6" }),
    t(32, 196, C.count, { c: "s14 c2" }),
  );
  b.push(
    t(32, 240, "RIGHE", { c: "n s11 w6 c3 caps" }),
    segmented(32, 250, C.rowsToggle, 1, [70, 132], 34),
  );
  b.push(
    t(32, 310, "VISTA", { c: "n s11 w6 c3 caps" }),
    segmented(32, 320, C.viewToggle, 0, [84, 80], 34),
  );
  C.columns.forEach((id, i) => {
    const v = vehicles[id],
      x = COL[i];
    b.push(photo(v.body, x, 132, 300, 120, { round: 12 }));
    b.push(
      seriesSwatch(x, 276, i),
      t(x + 26, 282, v.name, { c: "s19 w6" }),
      t(x, 302, v.kind, { c: "s13 c2" }),
      t(x, 334, v.price, { c: "n s22 w6" }),
    );
    b.push(
      t(x, 362, C.actions.open, { c: "s13 w6 am" }),
      t(x + 232, 362, C.actions.replace, { c: "s13 c2", a: "end" }),
      t(x + 300, 362, C.actions.remove, { c: "s13 c2", a: "end" }),
    );
  });
  b.push(
    r(1072, 132, 336, 240, { rx: 12, c: "dash" }),
    t(1094, 166, C.add.title, { c: "s15 w6" }),
  );
  b.push(
    r(1094, 180, 292, 42, { rx: 8, c: "box" }),
    ci(1116, 201, 6, "strokedim"),
    ln(1120, 205, 1125, 210, "strokedim"),
    t(1134, 206, C.add.search, { c: "s14 c3" }),
  );
  b.push(t(1094, 252, C.add.kicker, { c: "n s11 w6 c3 caps" }));
  C.add.items.forEach((it, i) => {
    const y = 280 + i * 32;
    b.push(
      t(1094, y, it.name, { c: "s14 w6" }),
      t(1204, y, it.note, { c: "s13 c2" }),
      ci(1374, y - 5, 11, "", { fill: "none", stroke: K.line2 }),
      t(1374, y, "+", { c: "s15 w6 am", a: "middle" }),
    );
  });
  b.push(ln(0, 396, 1440, 396, "line"));

  const row = (
    y,
    label,
    tg,
    values,
    notes = [],
    checks = false,
    focus = false,
  ) => {
    const out = [];
    if (focus)
      out.push(
        r(16, y - 25, 1408, 40, { rx: 6, fill: K.panel2 }),
        r(16, y - 25, 3, 40, { fill: K.amber }),
      );
    out.push(t(32, y, label, { c: `s14 ${focus ? "" : "c2"}` }));
    if (tg) out.push(tag(400, y, tg));
    values.forEach((val, i) => {
      const x = COL[i];
      if (checks) out.push(check(x + 7, y - 5));
      out.push(t(x + (checks ? 22 : 0), y, val, { c: "n s16 w6" }));
      if (notes[i])
        out.push(
          t(x + (checks ? 22 : 0) + val.length * 8.2 + 10, y, notes[i], {
            c: "s12 c3",
          }),
        );
    });
    if (!focus) out.push(ln(32, y + 15, 1408, y + 15, "line"));
    return g(out);
  };
  const section = (y, title) => t(32, y, title, { c: "s19 w6" });

  b.push(section(436, C.criteria.title));
  b.push(t(32, 468, "REQUISITI", { c: "n s11 w6 c3 caps" }));
  C.criteria.requirements.forEach((rw, i) =>
    b.push(
      row(500 + i * 40, rw.label, null, rw.values, rw.notes, true, i === 1),
    ),
  );
  b.push(t(32, 620, "PREFERENZE", { c: "n s11 w6 c3 caps" }));
  C.criteria.preferences.forEach((rw, i) =>
    b.push(row(652 + i * 40, rw.label, rw.tag, rw.values, [], true)),
  );
  b.push(section(800, C.others.title));
  C.others.rows.forEach((rw, i) =>
    b.push(row(838 + i * 40, rw.label, rw.tag, rw.values, rw.notes || [])),
  );
  b.push(
    section(992, C.details.title),
    t(1408, 992, C.details.hidden, { c: "s13 c3", a: "end" }),
  );
  b.push(r(16, 1008, 1408, 210, { rx: 12, c: "panel" }));
  b.push(
    t(32, 1040, C.details.open.title, { c: "s16 w6" }),
    t(32 + C.details.open.title.length * 8.9 + 14, 1040, C.details.open.count, {
      c: "n s13 c3",
    }),
    p(chevron(1396, 1035, 5, true), "strokedim"),
  );
  C.details.open.rows.forEach((rw, i) =>
    b.push(row(1080 + i * 36, rw.label, rw.tag, rw.values)),
  );
  C.details.closed.forEach((grp, i) => {
    const y = 1258 + i * 46;
    b.push(
      t(32, y, grp.title, { c: "s16 w6" }),
      t(32 + grp.title.length * 8.9 + 14, y, grp.count, { c: "n s13 c3" }),
    );
    if (grp.action)
      b.push(t(1366, y, grp.action, { c: "s13 w6 am", a: "end" }));
    b.push(
      p(chevron(1396, y - 5), "strokedim"),
      ln(32, y + 17, 1408, y + 17, "line"),
    );
  });
  b.push(section(1460, C.simulations.title));
  C.simulations.items.forEach((s, i) => {
    const x = 32 + i * 700;
    b.push(r(x, 1476, 676, 84, { rx: 12, c: i ? "dash" : "boxl" }));
    b.push(
      t(x + 22, 1510, s.title, { c: "s16 w6" }),
      t(x + 22, 1534, s.text, { c: "s13 c2" }),
      t(x + 654, 1524, s.action, { c: "s14 w6 am", a: "end" }),
    );
    if (s.notImplemented) b.push(annotation(x + 520, 1484, "NON IMPLEMENTATO"));
  });
  b.push(
    t(32, 1592, C.footnote, { c: "s12 c3" }),
    t(32, 1612, C.footlink, { c: "s12 w6 am" }),
  );
  return svgDoc({
    w: 1440,
    h: 1628,
    title: "Notturno — Comparison, Selected Vehicles",
    desc: "Concept Notturno applicato al confronto con criteri. La riga Bagagliaio mostra lo stato di evidenziazione al passaggio del puntatore.",
    style,
    defs,
    body: b,
  });
}

function chargingScreen() {
  const W = 1440,
    Hh = 1120;
  const b = [r(0, 0, W, Hh, { c: "bg" }), navBar(1, 2)];
  b.push(
    r(0, 65, W, 46, { c: "panel" }),
    t(32, 94, H.back, { c: "s14 w6 am" }),
    t(128, 94, H.backContext, { c: "n s13 c3" }),
  );
  b.push(t(32, 162, H.title, { c: "s30 w6" }));
  H.vehicles.forEach((v, i) =>
    b.push(
      seriesSwatch(1110 + i * 150, 152, i, 22),
      t(1140 + i * 150, 157, v.name, { c: "s14 w6" }),
    ),
  );
  b.push(
    r(32, 184, 1376, 104, { rx: 12, c: "panel" }),
    t(52, 210, H.conditionsKicker, { c: "n s11 w6 c3 caps" }),
  );
  const cx = [52, 452, 716, 1044];
  H.conditions.forEach((cd, i) => {
    b.push(t(cx[i], 234, cd.label, { c: "s12 c2" }));
    if (cd.options)
      b.push(
        segmented(
          cx[i],
          244,
          cd.options,
          cd.active,
          i === 1 ? [64, 72, 72] : i === 0 ? [176, 164] : [146, 124],
          34,
        ),
      );
    else {
      b.push(t(cx[i] + 290, 234, cd.range, { c: "n s15 w6", a: "end" }));
      const s = scale(0, 100, cx[i] + 8, cx[i] + 282);
      b.push(
        r(s(0), 259, s(100) - s(0), 4, { rx: 2, fill: K.line }),
        r(s(10), 259, s(80) - s(10), 4, { rx: 2, fill: K.amber }),
      );
      b.push(
        ci(s(10), 261, 8, "", {
          fill: K.text,
          stroke: K.panel,
          "stroke-width": 3,
        }),
        ci(s(80), 261, 8, "", {
          fill: K.text,
          stroke: K.panel,
          "stroke-width": 3,
        }),
      );
    }
  });
  H.vehicles.forEach((v, i) => {
    const x = 32 + i * 696;
    b.push(r(x, 304, 680, 132, { rx: 12, c: "panel" }));
    b.push(
      seriesSwatch(x + 22, 336, i, 22),
      t(x + 54, 341, v.name, { c: "s16 w6" }),
      tag(x + 656, 341, "calcolo"),
    );
    b.push(t(x + 22, 408, v.result.time, { c: "n s56 w6" }));
    // charged interval on a 0–100 % bar, one segment per 10 %
    for (let k = 0; k < 10; k++)
      b.push(
        r(x + 22 + k * 19, 420, 16, 6, {
          rx: 1,
          fill: k >= 1 && k < 8 ? K.text : K.line,
        }),
      );
    b.push(t(x + 220, 426, "10 → 80%", { c: "n s12 c3" }));
    b.push(
      t(x + 300, 376, v.result.energy, { c: "s15 w6" }),
      t(x + 300, 398, v.result.avg, { c: "s13 c2" }),
      t(x + 300, 418, v.result.limit, { c: "s13 c2" }),
    );
  });
  const [nv, av] = H.vehicles;
  const PX = [92, 684],
    PY = [520, 820];
  const sx = scale(0, 100, PX[0], PX[1]),
    sy = scale(0, 200, PY[1], PY[0]);
  b.push(
    r(32, 452, 680, 430, { rx: 12, c: "panel" }),
    t(52, 484, "Potenza per livello di carica", { c: "s16 w6" }),
  );
  // beyond the station's power: an unlit band
  b.push(r(PX[0], PY[0], PX[1] - PX[0], sy(150) - PY[0], { fill: "#11110F" }));
  b.push(
    t(PX[0] + 8, PY[0] + 16, "oltre la potenza della colonnina", {
      c: "n s11 c3",
    }),
  );
  for (let kw = 0; kw <= 200; kw += 50)
    b.push(
      ln(PX[0], sy(kw), PX[1], sy(kw), "grid"),
      t(PX[0] - 12, sy(kw) + 4, String(kw), { c: "n s12 c3", a: "end" }),
    );
  for (let s = 0; s <= 100; s += 10)
    b.push(ln(sx(s), PY[1], sx(s), PY[1] + (s % 20 ? 3 : 6), "line2"));
  for (let s = 0; s <= 100; s += 20)
    b.push(t(sx(s), PY[1] + 22, `${s}%`, { c: "n s12 c3", a: "middle" }));
  b.push(t(PX[0] - 12, PY[0] - 12, "kW", { c: "n s11 c3", a: "end" }));
  b.push(
    r(sx(10), PY[1] + 30, sx(80) - sx(10), 3, { fill: K.amber }),
    t(sx(45), PY[1] + 48, "intervallo 10 → 80%", {
      c: "n s11 c2",
      a: "middle",
    }),
  );
  b.push(
    ln(PX[0], sy(150), PX[1], sy(150), "", {
      stroke: K.text2,
      "stroke-width": 1,
    }),
    t(PX[1], sy(150) + 16, "colonnina 150 kW", { c: "n s12 c2", a: "end" }),
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
        stroke: K.series[0],
        "stroke-width": 1.5,
        fill: "none",
        opacity: 0.4,
        "stroke-dasharray": "3 3",
      },
    ),
  );
  b.push(
    pl(
      toPts(sampleCurve((s) => effectivePower(av, s, H.station), av.curve)),
      "",
      {
        stroke: K.series[1],
        "stroke-width": 2.5,
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
        stroke: K.series[0],
        "stroke-width": 2.5,
        fill: "none",
        "stroke-linejoin": "round",
      },
    ),
  );
  b.push(
    seriesSwatch(sx(82), sy(124), 0, 12),
    t(sx(82) + 18, sy(124) + 4, "Nordis E4", { c: "s13 w6" }),
  );
  b.push(
    seriesSwatch(sx(20), sy(108), 1, 12),
    t(sx(20) + 18, sy(108) + 4, "Aurora Vela", { c: "s13 w6" }),
  );

  const EX = [788, 1380],
    EY = PY;
  const ex = scale(0, 30, EX[0], EX[1]),
    ey = scale(0, 60, EY[1], EY[0]);
  b.push(
    r(728, 452, 680, 430, { rx: 12, c: "panel" }),
    t(748, 484, "Energia caricata nel tempo", { c: "s16 w6" }),
  );
  for (let k = 0; k <= 60; k += 20)
    b.push(
      ln(EX[0], ey(k), EX[1], ey(k), "grid"),
      t(EX[0] - 12, ey(k) + 4, String(k), { c: "n s12 c3", a: "end" }),
    );
  for (let m = 0; m <= 30; m += 5)
    b.push(t(ex(m), EY[1] + 22, `${m} min`, { c: "n s12 c3", a: "middle" }));
  b.push(t(EX[0] - 12, EY[0] - 12, "kWh", { c: "n s11 c3", a: "end" }));
  b.push(
    pl(
      av.energy.map(([m, k]) => [ex(m), ey(k)]),
      "",
      { stroke: K.series[1], "stroke-width": 2.5, fill: "none" },
    ),
    pl(
      nv.energy.map(([m, k]) => [ex(m), ey(k)]),
      "",
      { stroke: K.series[0], "stroke-width": 2.5, fill: "none" },
    ),
  );
  [nv, av].forEach((v, i) => {
    const X = ex(v.end.min),
      Y = ey(v.end.kwh);
    b.push(
      ci(X, Y, 5, "", {
        fill: K.series[i],
        stroke: K.panel,
        "stroke-width": 2,
      }),
      t(X + 10, Y + 18, `80%`, { c: "n s12 c2" }),
    );
  });
  // hover state: crosshair at 20 min with a tooltip listing both vehicles
  b.push(
    ln(ex(20), EY[0], ex(20), EY[1], "", {
      stroke: K.text2,
      "stroke-width": 1,
    }),
  );
  [nv, av].forEach((v, i) =>
    b.push(
      ci(ex(20), ey(v.at20.kwh), 5, "", {
        fill: K.panel,
        stroke: K.series[i],
        "stroke-width": 2.5,
      }),
    ),
  );
  const tx = EX[0] + 16,
    ty = 528;
  b.push(
    r(tx, ty, 220, 92, { rx: 8, fill: K.panel2, stroke: K.line2 }),
    t(tx + 14, ty + 22, "20 min dall’inizio", { c: "n s12 c3" }),
  );
  [nv, av].forEach((v, i) => {
    const y = ty + 46 + i * 26;
    b.push(
      seriesSwatch(tx + 14, y - 4, i, 12),
      t(tx + 34, y, v.name, { c: "s13" }),
      t(tx + 206, y, `${fmt(v.at20.kwh)} kWh · ${v.at20.soc}%`, {
        c: "n s13 w6",
        a: "end",
      }),
    );
  });
  b.push(
    t(
      748,
      870,
      "Valori del simulatore M0.1 · partenza dal 10%, colonnina 150 kW",
      { c: "s11 c3" },
    ),
  );

  b.push(
    r(32, 900, 680, 196, { rx: 12, c: "panel" }),
    t(52, 932, "Con altre colonnine", { c: "s16 w6" }),
    t(220, 932, "da 10% a 80%", { c: "n s12 c3" }),
  );
  const TX = [52, 280, 500];
  b.push(t(TX[0], 962, "COLONNINA", { c: "n s11 w6 c3 caps" }));
  [nv, av].forEach((v, i) =>
    b.push(
      seriesSwatch(TX[i + 1], 958, i, 12),
      t(
        TX[i + 1] + 18,
        962,
        `${v.name} · ${v.result.energy.split(" ")[0]} kWh`,
        { c: "n s12 c2" },
      ),
    ),
  );
  [50, 150, 350].forEach((kw, i) => {
    const y = 1000 + i * 34;
    if (kw === 150)
      b.push(
        r(40, y - 22, 664, 32, { rx: 6, fill: K.panel2 }),
        r(40, y - 22, 3, 32, { fill: K.amber }),
      );
    b.push(
      t(TX[0], y, `${kw} kW`, { c: `n s15 ${kw === 150 ? "w6" : "c2"}` }),
      t(TX[1], y, nv.stations[kw], { c: "n s16 w6" }),
      t(TX[2], y, av.stations[kw], { c: "n s16 w6" }),
    );
  });
  b.push(
    r(728, 900, 680, 196, { rx: 12, c: "boxl" }),
    t(748, 932, "Ipotesi", { c: "s16 w6" }),
    t(1388, 932, "Limiti del calcolo →", { c: "s13 w6 am", a: "end" }),
  );
  H.assumptions.forEach((a, i) =>
    b.push(
      ci(754, 962 + i * 28, 2.5, "", { fill: K.text3 }),
      t(768, 967 + i * 28, a, { c: "s13 c2" }),
    ),
  );
  return svgDoc({
    w: W,
    h: Hh,
    title: "Notturno — DC charging curves",
    desc: "Concept Notturno: curve di ricarica DC di Nordis E4 e Aurora Vela a 150 kW, con stato di hover a 20 minuti. Valori dal simulatore M0.1.",
    style,
    defs,
    body: b,
  });
}

function identitySheet() {
  const b = [r(0, 0, 1440, 900, { c: "bg" })];
  b.push(
    t(48, 76, "Notturno", { c: "s52 w6" }),
    t(
      48,
      108,
      "Un quadro strumenti di notte: si illumina ciò che serve ora. L’ambra indica focus e stato attivo.",
      { c: "s16 c2" },
    ),
  );
  b.push(t(48, 160, "SUPERFICI E TESTO", { c: "n s12 w6 c3 caps" }));
  [
    ["Notte", K.bg, "sfondo"],
    ["Pannello", K.panel, "superfici"],
    ["Pannello 2", K.panel2, "campi, righe attive"],
    ["Filo", K.line, "divisori"],
    ["Luce", K.text, "testo primario"],
    ["Luce media", K.text2, "testo secondario"],
    ["Luce bassa", K.text3, "note, assi"],
  ].forEach(([n, hex, role], i) => {
    const x = 48 + i * 124;
    b.push(
      r(x, 172, 112, 70, { rx: 8, fill: hex, stroke: K.line2 }),
      t(x, 262, n, { c: "s13 w6" }),
      t(x, 280, hex, { c: "n s12 c2" }),
      t(x, 296, role, { c: "s11 c3" }),
    );
  });
  b.push(
    r(940, 172, 112, 70, { rx: 8, fill: K.amber }),
    t(940, 262, "Ambra", { c: "s13 w6" }),
    t(940, 280, K.amber, { c: "n s12 c2" }),
    t(940, 296, "focus, attivo, azione primaria", { c: "s11 c3" }),
  );
  b.push(t(1100, 160, "SERIE NEI GRAFICI", { c: "n s12 w6 c3 caps" }));
  K.series.forEach((col, i) => {
    const y = 184 + i * 26;
    b.push(
      seriesSwatch(1100, y, i, 40),
      t(1152, y + 4, `${i + 1} · ${col}`, { c: "n s13 c2" }),
    );
  });
  b.push(t(48, 352, "TIPOGRAFIA", { c: "n s12 w6 c3 caps" }));
  b.push(
    t(48, 404, "Trova l’auto adatta a te.", { c: "s44 w6" }),
    t(760, 400, "Barlow 600 · 52/30/19", { c: "n s13 c3" }),
  );
  b.push(
    t(
      48,
      440,
      "Testo ed etichette in Barlow; il secondario resta in luce bassa.",
      { c: "s16 c2" },
    ),
    t(760, 438, "Barlow 400–600 · 12–16", { c: "n s13 c3" }),
  );
  b.push(
    t(48, 492, "22 min   +53,9 kWh   €41.500", { c: "n s40 w6" }),
    t(760, 486, "Barlow Semi Condensed: cifre, etichette maiuscole", {
      c: "n s13 c3",
    }),
  );
  b.push(t(48, 556, "COMPONENTI", { c: "n s12 w6 c3 caps" }));
  b.push(
    criterionBox(48, 570, 280, D.requirements[0], "req"),
    criterionBox(48, 626, 280, D.preferences[0], "pref"),
    criterionBox(48, 682, 280, D.requirements[2], "req", true),
  );
  b.push(
    button(360, 570, 150, "Confronta →", "amber"),
    button(520, 570, 130, "Apri scheda"),
    segmented(
      360,
      622,
      ["Schede", "Elenco", "Differenze"],
      0,
      [74, 70, 96],
      36,
    ),
  );
  b.push(
    check(367, 684),
    t(382, 689, "rispettato", { c: "s13" }),
    miss(487, 684),
    t(502, 689, "non rispettato", { c: "s13" }),
  );
  b.push(
    segments(360, 708, 3, 2),
    t(490, 715, "3 requisiti + 2 preferenze", { c: "s12 c3" }),
  );
  b.push(
    tag(450, 752, "costruttore"),
    tag(520, 752, "stima"),
    tag(600, 752, "calcolo"),
  );
  b.push(
    photo("suv", 720, 570, 330, 170, { round: 12 }),
    photo("compact", 1066, 570, 160, 80, { round: 8 }),
    photo("mpv", 1066, 660, 160, 80, { round: 8 }),
    photo("sedan", 1240, 570, 160, 80, { round: 8 }),
    photo("wagon", 1240, 660, 160, 80, { round: 8 }),
  );
  b.push(
    t(
      720,
      770,
      "Veicoli: fotografia low-key in studio. Qui un segnaposto disegnato con gradienti di luce.",
      { c: "s12 c3" },
    ),
  );
  b.push(
    t(
      48,
      868,
      "Font: Barlow e Barlow Semi Condensed (OFL). Fallback: Bahnschrift, DIN Alternate, Segoe UI / Arial.",
      { c: "n s12 c3" },
    ),
  );
  return svgDoc({
    w: 1440,
    h: 900,
    title: "Notturno — Identity sheet",
    desc: "Palette, tipografia e componenti del concept Notturno.",
    style,
    defs,
    body: b,
  });
}

const concept = {
  id: "notturno",
  screens: {
    identity: identitySheet,
    landing: landingScreen,
    discovery: discoveryScreen,
    comparison: comparisonScreen,
    charging: chargingScreen,
  },
};

export default concept;
