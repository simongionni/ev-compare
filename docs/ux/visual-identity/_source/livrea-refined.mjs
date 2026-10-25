// Iteration 2, variant A — Livrea Refined. Livrea's palette and vehicle identity, on light
// surfaces with lighter hierarchy. Vehicle colours become small numbered marks; the interface
// has its own dark blue accent; signals (info, attention, critical) have their own tones.
// Tables and charts borrow Tavola's hairlines, aligned figures, provenance and curve points.
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
  page: "#FAF8F4",
  white: "#FFFFFF",
  ink: "#17171B",
  ink2: "#4A4A52",
  ink3: "#68686F",
  line: "#E6E2DA",
  line2: "#CBC6BC",
  accent: "#1E2A78",
  accentTint: "#ECEEF8",
  // vehicle slots: mark colours and the text colour that sits on each
  slot: ["#E8601C", "#11A37A", "#B8338E", "#6A3FD4"],
  onSlot: ["#17171B", "#17171B", "#FFFFFF", "#FFFFFF"],
  slotName: ["Mandarino", "Smeraldo", "Magenta", "Viola"],
  info: "#1E2A78",
  infoTint: "#ECEEF8",
  attn: "#8F5300",
  attnTint: "#FBF1DD",
  crit: "#B3261E",
  critTint: "#FBEAE8",
};
// Comparison slots of the scenario: Nordis E4 → 1, Aurora Vela → 2.
const SLOT = { nordis: 0, aurora: 1 };

const style = `
${fontFaces(["Schibsted Grotesk"])}
${typeUtilities()}
text{font-family:'Schibsted Grotesk','Helvetica Neue',Arial,sans-serif;fill:${K.ink}}
.c2{fill:${K.ink2}}.c3{fill:${K.ink3}}.inv{fill:${K.white}}.ac{fill:${K.accent}}.crit{fill:${K.crit}}
.caps{letter-spacing:1.1px}
.page{fill:${K.page}}.white{fill:${K.white}}.ink{fill:${K.ink}}.acf{fill:${K.accent}}.act{fill:${K.accentTint}}
.card{fill:${K.white};stroke:${K.line};stroke-width:1}
.field{fill:${K.white};stroke:${K.line2};stroke-width:1}
.dash{fill:${K.white};stroke:${K.line2};stroke-width:1.2;stroke-dasharray:5 4}
.focus{fill:${K.white};stroke:${K.accent};stroke-width:2}
.hair{stroke:${K.line};stroke-width:1;fill:none}
.hair2{stroke:${K.line2};stroke-width:1;fill:none}
.stroke{stroke:${K.ink};stroke-width:1.6;fill:none;stroke-linecap:round;stroke-linejoin:round}
.strokeac{stroke:${K.accent};stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round}
.stroke2{stroke:${K.ink2};stroke-width:1.4;fill:none;stroke-linecap:round;stroke-linejoin:round}
.grid{stroke:#EFECE6;stroke-width:1;fill:none}
`;

const defs = `<pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="${K.line2}" stroke-width="1"/></pattern>`;

// ---------------------------------------------------------------- components

const logo = (x, y) =>
  g(
    K.slot.map((c, i) =>
      r(x + i * 7, y + (i % 2 ? 4 : 0), 5, 24 - (i % 2 ? 4 : 0), {
        rx: 2.5,
        fill: c,
      }),
    ),
  );

/** Numbered vehicle badge: the slot colour never appears without its number. */
const badge = (cx, cy, i, rad = 11, size = 12) =>
  g([
    ci(cx, cy, rad, "", { fill: K.slot[i] }),
    t(cx, cy + size * 0.36, String(i + 1), {
      c: `s${size} w7`,
      a: "middle",
      fill: K.onSlot[i],
    }),
  ]);

const navBar = (active, selected = 0) => {
  const xs = [220, 305, 447];
  const out = [
    r(0, 0, 1440, 64, { c: "white" }),
    ln(0, 64, 1440, 64, "hair"),
    logo(32, 20),
    t(70, 39, nav.brand, { c: "s18 w7" }),
  ];
  nav.items.forEach((it, i) => {
    out.push(
      t(xs[i], 39, it, { c: `s15 ${active === i ? "w6 ac" : "w5 c2"}` }),
    );
    if (active === i)
      out.push(r(xs[i], 61, it.length * 8.3, 3, { rx: 1.5, c: "acf" }));
  });
  if (selected) {
    out.push(r(392, 26, 40, 20, { rx: 10, fill: K.white, stroke: K.line2 }));
    for (let i = 0; i < selected; i++)
      out.push(ci(403 + i * 9, 36, 4, "", { fill: K.slot[i] }));
    out.push(t(424, 40.5, String(selected), { c: "s11 w7" }));
  }
  out.push(t(1408, 39, nav.right, { c: "s14 c2", a: "end" }));
  return g(out);
};

const button = (x, y, w, label, kind = "line", h = 38) => {
  if (kind === "primary")
    return g([
      r(x, y, w, h, { rx: h / 2, c: "acf" }),
      t(x + w / 2, y + h / 2 + 5, label, { c: "s14 w6 inv", a: "middle" }),
    ]);
  return g([
    r(x, y, w, h, { rx: h / 2, c: "field" }),
    t(x + w / 2, y + h / 2 + 5, label, { c: "s14 w5", a: "middle" }),
  ]);
};

const segmented = (x, y, labels, active, widths, h = 34) => {
  const total = widths.reduce((a, b) => a + b, 0);
  const out = [r(x, y, total, h, { rx: h / 2, c: "field" })];
  let cx = x;
  labels.forEach((l, i) => {
    if (i === active)
      out.push(
        r(cx + 3, y + 3, widths[i] - 6, h - 6, { rx: (h - 6) / 2, c: "acf" }),
      );
    out.push(
      t(cx + widths[i] / 2, y + h / 2 + 4.5, l, {
        c: `s13 ${i === active ? "w6 inv" : "w5 c2"}`,
        a: "middle",
      }),
    );
    cx += widths[i];
  });
  return g(out);
};

// Provenance, after Tavola: glyph + word in a fixed column.
const glyph = (x, y, name, color = K.ink2) => {
  if (name === "costruttore")
    return r(x, y - 7.5, 7, 7, { rx: 1, fill: color });
  if (name === "stima")
    return ci(x + 3.5, y - 4, 3.3, "", {
      fill: "none",
      stroke: color,
      "stroke-width": 1.3,
    });
  return p(
    `M${x + 3.5},${y - 8.5} L${x + 7.5},${y - 4} L${x + 3.5},${y + 0.5} L${x - 0.5},${y - 4} Z`,
    "",
    { fill: color },
  );
};
const tag = (xRight, y, name) =>
  g([
    glyph(xRight - name.length * 6.2 - 12, y, name),
    t(xRight, y, name, { c: "s11 w5 c2", a: "end" }),
  ]);

const check = (cx, cy, rad = 7) =>
  g([
    ci(cx, cy, rad, "", { fill: K.accentTint }),
    p(checkPath(cx - rad, cy - rad, rad * 2), "strokeac", {
      "stroke-width": 1.6,
    }),
  ]);
const missIcon = (cx, cy, rad = 7) =>
  g([
    ci(cx, cy, rad, "", {
      fill: K.critTint,
      stroke: K.crit,
      "stroke-width": 1.3,
    }),
    ln(cx - 3.5, cy, cx + 3.5, cy, "", {
      stroke: K.crit,
      "stroke-width": 1.6,
      "stroke-linecap": "round",
    }),
  ]);
const infoIcon = (cx, cy) =>
  g([
    ci(cx, cy, 8, "", { fill: K.info }),
    t(cx, cy + 4, "i", { c: "s11 w7 inv", a: "middle" }),
  ]);

/** Slot marker shapes, shared by charts and the identity sheet: circle, square, triangle, diamond. */
const marker = (x, y, i, s = 4.5, fill = K.white) => {
  const st = { fill, stroke: K.slot[i], "stroke-width": 2 };
  if (i === 0) return ci(x, y, s, "", st);
  if (i === 1) return r(x - s, y - s, s * 2, s * 2, st);
  if (i === 2)
    return p(
      `M${x},${y - s * 1.2} L${x + s * 1.1},${y + s * 0.8} L${x - s * 1.1},${y + s * 0.8} Z`,
      "",
      st,
    );
  return p(
    `M${x},${y - s * 1.3} L${x + s * 1.3},${y} L${x},${y + s * 1.3} L${x - s * 1.3},${y} Z`,
    "",
    st,
  );
};

/** Card photo: placeholder clipped to the card's top corners. */
const cardPhoto = (x, y, w, h, model, rad = 14) =>
  g([
    el(
      "clipPath",
      { id: `cp${x}_${y}` },
      p(
        `M${x},${y + h} V${y + rad} a${rad},${rad} 0 0 1 ${rad},-${rad} H${x + w - rad} a${rad},${rad} 0 0 1 ${rad},${rad} V${y + h} Z`,
        "",
      ),
    ),
    g(photoSlot(x, y, w, h, { model }), { "clip-path": `url(#cp${x}_${y})` }),
  ]);

const icon = {
  compare: (x, y) =>
    g([
      r(x, y + 4, 7, 16, {
        rx: 2,
        fill: "none",
        stroke: K.accent,
        "stroke-width": 1.8,
      }),
      r(x + 11, y, 7, 20, {
        rx: 2,
        fill: "none",
        stroke: K.accent,
        "stroke-width": 1.8,
      }),
    ]),
  tools: (x, y) =>
    p(
      `M${x},${y + 18} C${x + 6},${y + 2} ${x + 10},${y + 2} ${x + 13},${y + 10} S${x + 18},${y + 16} ${x + 22},${y + 4}`,
      "strokeac",
    ),
  sources: (x, y) =>
    g([
      r(x + 2, y, 16, 20, {
        rx: 2,
        fill: "none",
        stroke: K.accent,
        "stroke-width": 1.8,
      }),
      ln(x + 6, y + 7, x + 14, y + 7, "strokeac"),
      ln(x + 6, y + 12, x + 14, y + 12, "strokeac"),
    ]),
};

// ---------------------------------------------------------------- screens

function landingScreen() {
  const L = landing;
  const b = [r(0, 0, 1440, 880, { c: "page" }), navBar(-1)];
  b.push(
    t(96, 172, "Trova l’auto elettrica", {
      c: "s56 w7",
      "letter-spacing": "-1.6",
    }),
    t(96, 236, "adatta a te.", { c: "s56 w7", "letter-spacing": "-1.6" }),
  );
  b.push(t(98, 284, L.subtitle, { c: "s28 w4 c2" }));
  b.push(
    el("clipPath", { id: "hero" }, r(780, 96, 564, 236, { rx: 18 })),
    g(
      photoSlot(780, 96, 564, 236, {
        model: "Foto editoriale",
        view: "auto elettrica in ricarica, da reperire",
      }),
      { "clip-path": "url(#hero)" },
    ),
  );

  const py = 364;
  b.push(
    r(96, py, 612, 316, { rx: 18, c: "card" }),
    r(732, py, 612, 316, { rx: 18, c: "card" }),
  );
  b.push(t(124, py + 44, L.model.heading, { c: "s21 w6" }));
  b.push(
    r(124, py + 62, 452, 50, { rx: 25, c: "focus" }),
    ci(152, py + 86, 7, "stroke2"),
    ln(157, py + 91, 162, py + 96, "stroke2"),
  );
  b.push(
    t(174, py + 93, L.model.query, { c: "s17" }),
    ln(206, py + 75, 206, py + 99, "strokeac"),
  );
  b.push(button(586, py + 62, 94, L.model.button, "primary", 50));
  b.push(t(124, py + 144, "MODELLI", { c: "s11 w6 c3 caps" }));
  L.model.models.forEach((m, i) => {
    const y = py + 154 + i * 50;
    if (i === 0) b.push(r(116, y - 4, 572, 48, { rx: 10, c: "act" }));
    b.push(
      el("clipPath", { id: `th${i}` }, r(124, y, 60, 40, { rx: 6 })),
      g(photoSlot(124, y, 60, 40, { model: m.name }), {
        "clip-path": `url(#th${i})`,
      }),
    );
    b.push(
      t(198, y + 25, m.name, { c: "s15 w6" }),
      t(290, y + 25, m.body, { c: "s14 c2" }),
      t(676, y + 25, m.action, {
        c: `s13 w6 ${i === 0 ? "ac" : "c2"}`,
        a: "end",
      }),
    );
  });
  b.push(
    ln(124, py + 252, 680, py + 252, "hair"),
    t(124, py + 271, "MARCHE", { c: "s11 w6 c3 caps" }),
    t(124, py + 291, L.model.brands[0].name, { c: "s15 w6" }),
    t(676, py + 291, L.model.brands[0].action, { c: "s13 w6 c2", a: "end" }),
  );
  b.push(t(124, py + 308, L.model.all, { c: "s13 c3" }));

  b.push(t(760, py + 44, L.needs.heading, { c: "s21 w6" }));
  let cx = 760,
    cy = py + 66;
  L.needs.chips.forEach((chip) => {
    const w = chip.length * 7.7 + 46;
    if (cx + w > 1316) {
      cx = 760;
      cy += 48;
    }
    b.push(
      r(cx, cy, w, 38, { rx: 19, c: "field" }),
      t(cx + 17, cy + 25, "+", { c: "s17 w6 ac" }),
      t(cx + 33, cy + 25, chip, { c: "s14 w5" }),
    );
    cx += w + 8;
  });
  b.push(button(760, py + 182, 304, L.needs.cta, "primary", 50));

  const dy = 716;
  b.push(t(96, dy, L.direct.heading, { c: "s15 w6 c2" }));
  L.direct.items.forEach((it, i) => {
    const x = 96 + i * 424;
    b.push(
      r(x, dy + 16, 400, 100, { rx: 16, c: "card" }),
      icon[["compare", "tools", "sources"][i]](x + 24, dy + 42),
    );
    b.push(
      t(x + 64, dy + 54, it.title, { c: "s17 w6" }),
      t(x + 64, dy + 77, it.text, { c: "s14 c2" }),
      t(x + 64, dy + 101, it.link, { c: "s14 w6 ac" }),
    );
  });
  b.push(t(96, 864, L.footer, { c: "s12 c3" }));
  return svgDoc({
    w: 1440,
    h: 880,
    title: "Livrea Refined — Landing Page",
    desc: "Variante Livrea Refined applicata alla landing consolidata. Le fotografie sono segnaposto.",
    style,
    defs,
    body: b,
  });
}

function criterionBox(x, y, w, item, kind, open = false) {
  const out = [
    r(x, y, w, 50, {
      rx: 12,
      c: open ? "focus" : kind === "req" ? "field" : "dash",
    }),
  ];
  out.push(
    t(x + 16, y + 20, item.label, { c: "s12 c2" }),
    t(x + 16, y + 39, item.value, { c: "s15 w6" }),
  );
  if (item.spec)
    out.push(
      r(x + 152, y + 9, 38, 16, { rx: 8, c: "act" }),
      t(x + 171, y + 20.5, "SPEC", { c: "s9 w7 ac", a: "middle" }),
    );
  out.push(
    p(chevron(x + w - 22, y + 25, 5, open), open ? "strokeac" : "stroke2"),
  );
  return g(out);
}

function discoveryScreen() {
  const b = [r(0, 0, 1440, 1330, { c: "page" }), navBar(0, 2)];
  b.push(
    r(32, 86, 1376, 50, { rx: 25, c: "field" }),
    ci(60, 110, 7, "stroke2"),
    ln(65, 115, 70, 120, "stroke2"),
    t(84, 117, D.search, { c: "s15 c3" }),
  );
  b.push(r(24, 156, 344, 880, { rx: 18, c: "card" }));
  b.push(
    t(44, 192, D.criteriaTitle, { c: "s19 w6" }),
    t(348, 192, D.reset, { c: "s13 w5 ac", a: "end" }),
  );
  b.push(
    r(44, 208, 28, 14, { rx: 7, c: "field" }),
    t(80, 220, D.legend.req, { c: "s12 c2" }),
    r(200, 208, 28, 14, { rx: 7, c: "dash" }),
    t(236, 220, D.legend.pref, { c: "s12 c2" }),
  );
  b.push(t(44, 252, "REQUISITI", { c: "s11 w6 c3 caps" }));
  D.requirements.forEach((it, i) =>
    b.push(criterionBox(44, 262 + i * 58, 304, it, "req", it.open)),
  );
  const E = D.editor,
    ey = 438;
  b.push(r(44, ey, 304, 300, { rx: 12, fill: "#F6F5F1" }));
  b.push(
    t(60, ey + 28, E.min, { c: "s12 c2" }),
    t(332, ey + 30, E.minValue, { c: "s20 w7", a: "end" }),
  );
  const sx = scale(50, 350, 68, 322);
  b.push(
    r(sx(50), ey + 50, sx(350) - sx(50), 4, { rx: 2, fill: K.line2 }),
    r(sx(100), ey + 50, sx(350) - sx(100), 4, { rx: 2, c: "acf" }),
  );
  [100, 350].forEach((v) =>
    b.push(
      ci(sx(v), ey + 52, 9, "", {
        fill: K.white,
        stroke: K.accent,
        "stroke-width": 2.5,
      }),
    ),
  );
  [50, 150, 250, 350].forEach((v) =>
    b.push(t(sx(v), ey + 78, `${v}`, { c: "s11 c3", a: "middle" })),
  );
  b.push(
    t(60, ey + 110, E.behaviour, { c: "s12 c2" }),
    segmented(60, ey + 120, [E.req, E.pref], 0, [136, 136], 34),
  );
  b.push(ln(60, ey + 172, 332, ey + 172, "hair"));
  b.push(
    ci(69, ey + 192, 8, "", { fill: "none", stroke: K.ink2 }),
    t(69, ey + 196, "?", { c: "s11 w7 c2", a: "middle" }),
    t(86, ey + 197, E.explain, { c: "s14 w6" }),
    t(332, ey + 197, E.explainAction, { c: "s13 w5 ac", a: "end" }),
  );
  b.push(ln(60, ey + 214, 332, ey + 214, "hair"));
  b.push(
    t(60, ey + 236, E.linkedKicker, { c: "s11 w6 c3 caps" }),
    tag(332, ey + 236, "calcolo"),
  );
  b.push(
    t(60, ey + 258, E.linkedTitle, { c: "s15 w6" }),
    t(60, ey + 276, E.linkedText, { c: "s12 c2" }),
    t(60, ey + 293, E.linkedAction, { c: "s13 w6 ac" }),
  );

  b.push(t(44, 772, "PREFERENZE", { c: "s11 w6 c3 caps" }));
  D.preferences.forEach((it, i) =>
    b.push(criterionBox(44, 782 + i * 58, 304, it, "pref")),
  );
  b.push(
    button(44, 962, 304, D.addCriterion, "line", 42),
    t(44, 1022, D.categories, { c: "s12 c3" }),
  );

  b.push(
    t(392, 190, D.resultsTitle, { c: "s26 w7", "letter-spacing": "-0.4" }),
    t(392, 214, D.resultsSub, { c: "s14 c2" }),
  );
  b.push(
    segmented(948, 170, D.views, 0, [76, 70, 98], 36),
    r(1204, 170, 204, 36, { rx: 18, c: "field" }),
    t(1222, 193, D.sort, { c: "s13 w5" }),
    p(chevron(1388, 188), "stroke2"),
  );
  b.push(
    r(392, 230, 1016, 38, { rx: 10, fill: K.infoTint }),
    infoIcon(412, 249),
    t(430, 254, D.notice, { c: "s13" }),
    t(1394, 254, D.undo, { c: "s13 w6 ac", a: "end" }),
  );
  b.push(
    r(392, 280, 1016, 54, { rx: 14, c: "card" }),
    t(412, 312, D.tray.label, { c: "s15 w6" }),
  );
  D.tray.items.forEach((it, i) => {
    const x = 560 + i * 150;
    b.push(
      r(x, 292, 140, 30, { rx: 15, c: "field" }),
      badge(x + 15, 307, i, 10, 11),
      t(x + 32, 312, it, { c: "s13 w5" }),
      t(x + 126, 312, "×", { c: "s15 c3", a: "middle" }),
    );
  });
  b.push(
    t(1244, 312, D.tray.diff, { c: "s13 w5 ac", a: "end" }),
    button(1260, 288, 136, D.tray.cta, "primary", 38),
  );

  D.results.forEach((res, i) => {
    const v = vehicles[res.id];
    const slot = res.inCompare ? SLOT[res.id] : -1;
    const x = 392 + i * 344,
      y = 350,
      w = 328;
    b.push(
      r(x, y, w, 456, { rx: 14, c: "card" }),
      cardPhoto(x, y, w, 156, v.name),
    );
    if (slot >= 0)
      b.push(
        r(x, y + 156, w, 3, { fill: K.slot[slot] }),
        badge(x + 22, y + 22, slot, 12, 13),
      );
    b.push(
      t(x + 20, y + 188, v.name, { c: "s18 w6" }),
      t(x + 20, y + 208, v.kind, { c: "s13 c2" }),
    );
    b.push(
      t(x + 20, y + 244, v.price, { c: "s24 w7" }),
      t(x + w - 20, y + 244, "listino", { c: "s12 c3", a: "end" }),
    );
    b.push(ln(x + 20, y + 258, x + w - 20, y + 258, "hair"));
    b.push(t(x + 20, y + 280, "REQUISITI", { c: "s11 w6 c3 caps" }));
    D.reqLabels.forEach((l, k) => {
      const lx = x + 20 + [0, 86, 194][k];
      b.push(check(lx + 7, y + 296), t(lx + 20, y + 301, l, { c: "s13" }));
    });
    b.push(t(x + 20, y + 330, "PREFERENZE", { c: "s11 w6 c3 caps" }));
    b.push(
      check(x + 27, y + 346),
      t(x + 40, y + 351, `Viaggio 400 km: ${v.stop}`, { c: "s13" }),
      tag(x + w - 20, y + 351, "stima"),
    );
    b.push(
      check(x + 27, y + 370),
      t(x + 40, y + 375, D.prefDaily, { c: "s13" }),
    );
    b.push(
      t(x + 20, y + 404, D.why, { c: "s13 w6 ac" }),
      t(x + w - 20, y + 404, res.specs, { c: "s13 c2", a: "end" }),
    );
    b.push(button(x + 20, y + 414, 118, "Apri scheda", "line", 32));
    if (slot >= 0)
      b.push(
        r(x + 146, y + 414, 162, 32, {
          rx: 16,
          fill: K.white,
          stroke: K.slot[slot],
          "stroke-width": 2,
        }),
        badge(x + 162, y + 430, slot, 9, 10),
        t(x + 178, y + 435, "Nel confronto", { c: "s13 w6" }),
      );
    else
      b.push(
        button(x + 146, y + 414, 162, "+ Aggiungi al confronto", "line", 32),
      );
  });

  b.push(
    t(392, 852, D.near.title, { c: "s20 w6" }),
    t(392, 874, D.near.sub, { c: "s14 c2" }),
  );
  D.near.items.forEach((n, i) => {
    const v = vehicles[n.id],
      y = 892 + i * 96;
    b.push(r(392, y, 1016, 84, { rx: 14, c: "dash" }));
    b.push(
      el("clipPath", { id: `nm${i}` }, r(404, y + 12, 104, 60, { rx: 8 })),
      g(photoSlot(404, y + 12, 104, 60, { model: v.name }), {
        "clip-path": `url(#nm${i})`,
      }),
    );
    b.push(
      t(524, y + 32, v.name, { c: "s16 w6" }),
      t(524, y + 52, v.kind, { c: "s12 c2" }),
      t(524, y + 72, "Apri scheda ›", { c: "s12 w6 ac" }),
    );
    const [lab, val, over] = n.miss.split(": ");
    b.push(
      t(784, y + 32, D.near.missKicker, { c: "s11 w6 c3 caps" }),
      missIcon(791, y + 52),
    );
    b.push(
      tr(
        806,
        y + 57,
        [
          [`${lab}: ${val}: `, ""],
          [over, "crit"],
        ],
        { c: "s13 w6" },
      ),
    );
    b.push(
      button(1076, y + 14, 210, n.fix, "line", 34),
      t(1181, y + 70, n.flex, { c: "s12 w5 ac", a: "middle" }),
    );
    b.push(
      r(1304, y + 24, 16, 16, { rx: 4, c: "field" }),
      t(1328, y + 37, "Confronta", { c: "s13 c2" }),
    );
  });
  b.push(t(392, 1124, D.deeper.title, { c: "s20 w6" }));
  D.deeper.items.forEach((it, i) => {
    const x = 392 + i * 516;
    b.push(
      r(x, 1140, 500, 76, { rx: 14, c: "card" }),
      t(x + 22, 1172, it.title, { c: "s15 w6" }),
      t(x + 22, 1194, it.text, { c: "s13 c2" }),
      t(x + 474, 1184, "→", { c: "s18 ac", a: "end" }),
    );
  });
  b.push(
    t(392, 1262, D.footnote, { c: "s12 c3" }),
    t(392, 1284, D.footlink, { c: "s12 w6 ac" }),
  );
  return svgDoc({
    w: 1440,
    h: 1330,
    title: "Livrea Refined — Vehicle Discovery, Active Criteria",
    desc: "Variante Livrea Refined applicata alla ricerca con sei criteri attivi. Le fotografie sono segnaposto.",
    style,
    defs,
    body: b,
  });
}

function comparisonScreen() {
  const b = [r(0, 0, 1440, 1628, { c: "page" }), navBar(1, 2)];
  const COL = [424, 748];
  b.push(r(0, 65, 1440, 46, { c: "white" }), ln(0, 111, 1440, 111, "hair"));
  b.push(
    t(32, 94, C.context.back, { c: "s14 w6 ac" }),
    t(112, 94, C.context.summary, { c: "s13 c3" }),
    t(1408, 94, C.context.edit, { c: "s14 w6 ac", a: "end" }),
  );
  b.push(
    t(32, 172, C.title, { c: "s32 w7", "letter-spacing": "-0.6" }),
    t(32, 196, C.count, { c: "s14 c2" }),
  );
  b.push(
    t(32, 240, "RIGHE", { c: "s11 w6 c3 caps" }),
    segmented(32, 250, C.rowsToggle, 1, [72, 134], 34),
  );
  b.push(
    t(32, 310, "VISTA", { c: "s11 w6 c3 caps" }),
    segmented(32, 320, C.viewToggle, 0, [86, 82], 34),
  );
  C.columns.forEach((id, i) => {
    const v = vehicles[id],
      x = COL[i],
      s = SLOT[id];
    b.push(
      el("clipPath", { id: `hc${i}` }, r(x, 132, 300, 128, { rx: 12 })),
      g(photoSlot(x, 132, 300, 128, { model: v.name }), {
        "clip-path": `url(#hc${i})`,
      }),
    );
    b.push(
      badge(x + 11, 285, s, 11, 12),
      t(x + 30, 291, v.name, { c: "s19 w6" }),
      t(x, 312, v.kind, { c: "s13 c2" }),
      t(x, 342, v.price, { c: "s22 w7" }),
    );
    b.push(
      t(x, 368, C.actions.open, { c: "s13 w6 ac" }),
      t(x + 230, 368, C.actions.replace, { c: "s13 c2", a: "end" }),
      t(x + 300, 368, C.actions.remove, { c: "s13 c2", a: "end" }),
    );
  });
  b.push(
    r(1072, 132, 336, 248, { rx: 14, c: "dash" }),
    t(1094, 166, C.add.title, { c: "s15 w6" }),
  );
  b.push(
    r(1094, 180, 292, 42, { rx: 21, c: "field" }),
    ci(1118, 201, 6, "stroke2"),
    ln(1122, 205, 1127, 210, "stroke2"),
    t(1136, 206, C.add.search, { c: "s14 c3" }),
  );
  b.push(t(1094, 252, C.add.kicker, { c: "s11 w6 c3 caps" }));
  C.add.items.forEach((it, i) => {
    const y = 282 + i * 32;
    b.push(
      t(1094, y, it.name, { c: "s14 w6" }),
      t(1206, y, it.note, { c: "s13 c2" }),
      ci(1374, y - 5, 12, "", { fill: K.white, stroke: K.line2 }),
      t(1374, y, "+", { c: "s16 w6 ac", a: "middle" }),
    );
  });
  b.push(ln(0, 400, 1440, 400, "hair2"));

  const row = (
    y,
    label,
    tg,
    values,
    notes = [],
    checks = false,
    hover = false,
  ) => {
    const out = [];
    if (hover) out.push(r(20, y - 25, 1400, 40, { rx: 8, c: "act" }));
    out.push(t(32, y, label, { c: "s14" }));
    if (tg) out.push(tag(400, y, tg));
    values.forEach((val, i) => {
      const x = COL[i];
      if (checks) out.push(check(x + 7, y - 5));
      out.push(t(x + (checks ? 22 : 0), y, val, { c: "s15 w6" }));
      if (notes[i])
        out.push(
          t(x + (checks ? 22 : 0) + val.length * 8.4 + 10, y, notes[i], {
            c: "s12 c3",
          }),
        );
    });
    if (!hover) out.push(ln(32, y + 15, 1408, y + 15, "hair"));
    return g(out);
  };
  const section = (y, title) => t(32, y, title, { c: "s20 w6" });

  b.push(section(440, C.criteria.title));
  b.push(t(32, 470, "REQUISITI", { c: "s11 w6 c3 caps" }));
  C.criteria.requirements.forEach((rw, i) =>
    b.push(
      row(502 + i * 40, rw.label, null, rw.values, rw.notes, true, i === 1),
    ),
  );
  b.push(t(32, 622, "PREFERENZE", { c: "s11 w6 c3 caps" }));
  C.criteria.preferences.forEach((rw, i) =>
    b.push(row(654 + i * 40, rw.label, rw.tag, rw.values, [], true)),
  );

  b.push(
    section(802, C.others.title),
    t(1090, 802, "Sulla stessa scala, da zero", { c: "s12 c3" }),
  );
  C.others.rows.forEach((rw, i) => {
    const y = 840 + i * 40;
    b.push(row(y, rw.label, rw.tag, rw.values, rw.notes || []));
    const sx = scale(0, Math.max(...rw.num) * 1.15, 1090, 1330);
    b.push(
      ln(1090, y - 5, 1330, y - 5, "hair2"),
      ln(1090, y - 9, 1090, y - 1, "stroke2"),
    );
    const close = Math.abs(sx(rw.num[0]) - sx(rw.num[1])) < 18;
    rw.num.forEach((n, k) =>
      b.push(badge(sx(n), y - 5 + (close ? (k ? 7 : -7) : 0), k, 8, 10)),
    );
    b.push(t(1342, y, rw.unit, { c: "s11 c3" }));
  });

  b.push(
    section(994, C.details.title),
    t(1408, 994, C.details.hidden, { c: "s13 c3", a: "end" }),
  );
  b.push(ln(32, 1010, 1408, 1010, "hair2"));
  b.push(
    t(32, 1040, C.details.open.title, { c: "s16 w6" }),
    t(32 + C.details.open.title.length * 9 + 14, 1040, C.details.open.count, {
      c: "s13 c3",
    }),
    p(chevron(1396, 1035, 5, true), "stroke2"),
  );
  C.details.open.rows.forEach((rw, i) =>
    b.push(row(1080 + i * 38, rw.label, rw.tag, rw.values)),
  );
  C.details.closed.forEach((grp, i) => {
    const y = 1254 + i * 46;
    b.push(
      t(32, y, grp.title, { c: "s16 w6" }),
      t(32 + grp.title.length * 9 + 14, y, grp.count, { c: "s13 c3" }),
    );
    if (grp.action)
      b.push(t(1366, y, grp.action, { c: "s13 w6 ac", a: "end" }));
    b.push(
      p(chevron(1396, y - 5), "stroke2"),
      ln(32, y + 17, 1408, y + 17, "hair"),
    );
  });
  b.push(section(1456, C.simulations.title));
  C.simulations.items.forEach((s, i) => {
    const x = 32 + i * 700;
    b.push(r(x, 1474, 676, 84, { rx: 14, c: i ? "dash" : "card" }));
    b.push(
      t(x + 22, 1508, s.title, { c: "s16 w6" }),
      t(x + 22, 1532, s.text, { c: "s13 c2" }),
      t(x + 654, 1522, s.action, { c: "s14 w6 ac", a: "end" }),
    );
    if (s.notImplemented) b.push(annotation(x + 520, 1482, "NON IMPLEMENTATO"));
  });
  b.push(
    t(32, 1590, C.footnote, { c: "s12 c3" }),
    t(32, 1610, C.footlink, { c: "s12 w6 ac" }),
  );
  return svgDoc({
    w: 1440,
    h: 1628,
    title: "Livrea Refined — Comparison, Selected Vehicles",
    desc: "Variante Livrea Refined applicata al confronto con criteri. La riga Bagagliaio mostra lo stato al passaggio del puntatore.",
    style,
    defs,
    body: b,
  });
}

function chargingScreen() {
  const W = 1440,
    Hh = 1120;
  const b = [r(0, 0, W, Hh, { c: "page" }), navBar(1, 2)];
  b.push(
    r(0, 65, W, 46, { c: "white" }),
    ln(0, 111, W, 111, "hair"),
    t(32, 94, H.back, { c: "s14 w6 ac" }),
    t(128, 94, H.backContext, { c: "s13 c3" }),
  );
  b.push(t(32, 164, H.title, { c: "s32 w7", "letter-spacing": "-0.6" }));
  H.vehicles.forEach((v, i) =>
    b.push(
      badge(1104 + i * 156, 152, SLOT[v.id], 10, 11),
      t(1120 + i * 156, 157, v.name, { c: "s14 w6" }),
    ),
  );
  b.push(
    r(32, 184, 1376, 104, { rx: 16, c: "card" }),
    t(52, 210, H.conditionsKicker, { c: "s11 w6 c3 caps" }),
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
          i === 1 ? [66, 74, 74] : i === 0 ? [180, 164] : [148, 124],
          34,
        ),
      );
    else {
      b.push(t(cx[i] + 290, 234, cd.range, { c: "s15 w7", a: "end" }));
      const s = scale(0, 100, cx[i] + 8, cx[i] + 282);
      b.push(
        r(s(0), 259, s(100) - s(0), 4, { rx: 2, fill: K.line2 }),
        r(s(10), 259, s(80) - s(10), 4, { rx: 2, c: "acf" }),
      );
      [10, 80].forEach((v) =>
        b.push(
          ci(s(v), 261, 8, "", {
            fill: K.white,
            stroke: K.accent,
            "stroke-width": 2.5,
          }),
        ),
      );
    }
  });
  H.vehicles.forEach((v, i) => {
    const x = 32 + i * 696,
      s = SLOT[v.id];
    b.push(
      r(x, 304, 680, 132, { rx: 16, c: "card" }),
      r(x, 320, 4, 100, { rx: 2, fill: K.slot[s] }),
    );
    b.push(
      badge(x + 32, 336, s, 11, 12),
      t(x + 52, 341, v.name, { c: "s17 w6" }),
      tag(x + 656, 341, "calcolo"),
    );
    b.push(
      t(x + 24, 410, v.result.time, { c: "s52 w7", "letter-spacing": "-1" }),
    );
    b.push(
      t(x + 300, 376, v.result.energy, { c: "s15 w6" }),
      t(x + 300, 398, v.result.avg, { c: "s13 c2" }),
      t(x + 300, 418, v.result.limit, { c: "s13 c2" }),
    );
  });
  const [nv, av] = H.vehicles;
  const PX = [92, 684],
    PY = [522, 822];
  const sx = scale(0, 100, PX[0], PX[1]),
    sy = scale(0, 200, PY[1], PY[0]);
  b.push(
    r(32, 452, 680, 430, { rx: 16, c: "card" }),
    t(52, 486, "Potenza per livello di carica", { c: "s16 w6" }),
  );
  b.push(
    r(sx(10), PY[0], sx(80) - sx(10), PY[1] - PY[0], {
      c: "act",
      opacity: 0.6,
    }),
  );
  b.push(
    r(PX[0], PY[0], PX[1] - PX[0], sy(150) - PY[0], { fill: "url(#hatch)" }),
    t(PX[0] + 8, PY[0] + 16, "oltre la potenza della colonnina", {
      c: "s11 c3",
    }),
  );
  for (let kw = 0; kw <= 200; kw += 50)
    b.push(
      ln(PX[0], sy(kw), PX[1], sy(kw), "grid"),
      t(PX[0] - 12, sy(kw) + 4, String(kw), { c: "s12 c3 tab", a: "end" }),
    );
  for (let s = 0; s <= 100; s += 20)
    b.push(t(sx(s), PY[1] + 22, `${s}%`, { c: "s12 c3", a: "middle" }));
  b.push(
    t(PX[0] - 12, PY[0] - 12, "kW", { c: "s11 c3", a: "end" }),
    ln(PX[0], PY[1], PX[1], PY[1], "hair2"),
  );
  b.push(
    t(sx(45), PY[1] - 8, "intervallo 10 → 80%", {
      c: "s11 w6 ac",
      a: "middle",
    }),
  );
  b.push(
    ln(PX[0], sy(150), PX[1], sy(150), "", {
      stroke: K.ink2,
      "stroke-width": 1.2,
      "stroke-dasharray": "6 4",
    }),
    t(PX[1], sy(150) + 16, "colonnina 150 kW", { c: "s12 c2", a: "end" }),
  );
  const toPts = (pts) => pts.map(([s, kw]) => [sx(s), sy(kw)]);
  const [sN, sA] = [SLOT.nordis, SLOT.aurora];
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
        "stroke-width": 1.4,
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
        stroke: K.slot[sN],
        "stroke-width": 2.5,
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
    badge(sx(82) + 4, sy(126), sN, 9, 10),
    t(sx(82) + 18, sy(126) + 4, "Nordis E4", { c: "s13 w6" }),
  );
  b.push(
    badge(sx(18), sy(108), sA, 9, 10),
    t(sx(18) + 14, sy(108) + 4, "Aurora Vela", { c: "s13 w6" }),
  );
  b.push(
    marker(60, 866, sN, 4),
    t(
      72,
      870,
      "punto della curva dichiarato dal costruttore · tra i punti: interpolazione lineare",
      { c: "s11 c3" },
    ),
  );

  const EX = [788, 1380],
    EY = PY;
  const ex = scale(0, 30, EX[0], EX[1]),
    ey = scale(0, 60, EY[1], EY[0]);
  b.push(
    r(728, 452, 680, 430, { rx: 16, c: "card" }),
    t(748, 486, "Energia caricata nel tempo", { c: "s16 w6" }),
  );
  for (let k = 0; k <= 60; k += 20)
    b.push(
      ln(EX[0], ey(k), EX[1], ey(k), "grid"),
      t(EX[0] - 12, ey(k) + 4, String(k), { c: "s12 c3 tab", a: "end" }),
    );
  for (let m = 0; m <= 30; m += 5)
    b.push(t(ex(m), EY[1] + 22, `${m} min`, { c: "s12 c3", a: "middle" }));
  b.push(
    t(EX[0] - 12, EY[0] - 12, "kWh", { c: "s11 c3", a: "end" }),
    ln(EX[0], EY[1], EX[1], EY[1], "hair2"),
  );
  b.push(
    pl(
      av.energy.map(([m, k]) => [ex(m), ey(k)]),
      "",
      { stroke: K.slot[sA], "stroke-width": 2.5, fill: "none" },
    ),
    pl(
      nv.energy.map(([m, k]) => [ex(m), ey(k)]),
      "",
      { stroke: K.slot[sN], "stroke-width": 2.5, fill: "none" },
    ),
  );
  [nv, av].forEach((v) => {
    const s = SLOT[v.id];
    b.push(
      marker(ex(v.end.min), ey(v.end.kwh), s, 5, K.slot[s]),
      t(ex(v.end.min) + 10, ey(v.end.kwh) + 18, "80%", { c: "s12 c2" }),
    );
  });
  // hover state at 20 minutes
  b.push(
    ln(ex(20), EY[0], ex(20), EY[1], "", { stroke: K.ink2, "stroke-width": 1 }),
  );
  [nv, av].forEach((v) =>
    b.push(
      ci(ex(20), ey(v.at20.kwh), 5, "", {
        fill: K.white,
        stroke: K.slot[SLOT[v.id]],
        "stroke-width": 2.5,
      }),
    ),
  );
  const tx = EX[0] + 16,
    ty = 528;
  b.push(
    r(tx, ty, 228, 92, { rx: 10, fill: K.white, stroke: K.line2 }),
    t(tx + 14, ty + 22, "20 min dall’inizio", { c: "s12 c3" }),
  );
  [nv, av].forEach((v, i) => {
    const y = ty + 46 + i * 26;
    b.push(
      badge(tx + 22, y - 4, SLOT[v.id], 8, 9),
      t(tx + 36, y, v.name, { c: "s13" }),
      t(tx + 214, y, `${fmt(v.at20.kwh)} kWh · ${v.at20.soc}%`, {
        c: "s13 w6",
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
    r(32, 900, 680, 196, { rx: 16, c: "card" }),
    t(52, 932, "Con altre colonnine", { c: "s16 w6" }),
    t(218, 932, "da 10% a 80%", { c: "s12 c3" }),
  );
  const TX = [52, 280, 500];
  b.push(t(TX[0], 962, "COLONNINA", { c: "s11 w6 c3 caps" }));
  [nv, av].forEach((v, i) =>
    b.push(
      badge(TX[i + 1] + 7, 958, SLOT[v.id], 7, 9),
      t(
        TX[i + 1] + 20,
        962,
        `${v.name} · ${v.result.energy.split(" ")[0]} kWh`,
        { c: "s12 c2" },
      ),
    ),
  );
  [50, 150, 350].forEach((kw, i) => {
    const y = 1000 + i * 34;
    if (kw === 150) b.push(r(40, y - 22, 664, 32, { rx: 8, c: "act" }));
    b.push(
      t(TX[0], y, `${kw} kW`, { c: `s15 ${kw === 150 ? "w6" : "c2"}` }),
      t(TX[1], y, nv.stations[kw], { c: "s15 w6 tab" }),
      t(TX[2], y, av.stations[kw], { c: "s15 w6 tab" }),
    );
    if (kw !== 350) b.push(ln(52, y + 12, 692, y + 12, "hair"));
  });
  b.push(
    r(728, 900, 680, 196, { rx: 16, c: "card" }),
    t(748, 932, "Ipotesi", { c: "s16 w6" }),
    t(1388, 932, "Limiti del calcolo →", { c: "s13 w6 ac", a: "end" }),
  );
  H.assumptions.forEach((a, i) =>
    b.push(
      ci(754, 962 + i * 28, 2.5, "", { fill: K.ink3 }),
      t(768, 967 + i * 28, a, { c: "s13 c2" }),
    ),
  );
  return svgDoc({
    w: W,
    h: Hh,
    title: "Livrea Refined — DC charging curves",
    desc: "Variante Livrea Refined: curve di ricarica DC di Nordis E4 e Aurora Vela a 150 kW, con stato di hover a 20 minuti. Valori dal simulatore M0.1.",
    style,
    defs,
    body: b,
  });
}

function identitySheet() {
  const b = [r(0, 0, 1440, 1000, { c: "page" })];
  b.push(
    logo(48, 46),
    t(92, 72, "Livrea Refined", { c: "s44 w7", "letter-spacing": "-1" }),
  );
  b.push(
    t(
      48,
      104,
      "La vivacità di Livrea su superfici chiare. Il colore del veicolo è un segno piccolo e numerato; l’interfaccia ha il suo blu.",
      { c: "s16 c2" },
    ),
  );
  const swatch = (x, y, name, hex, role, w = 112, on) =>
    g([
      r(x, y, w, 60, { rx: 10, fill: hex, stroke: K.line }),
      on
        ? t(x + 12, y + 38, on, {
            c: "s20 w7",
            fill: hex === K.slot[2] || hex === K.slot[3] ? K.white : K.ink,
          })
        : "",
      t(x, y + 80, name, { c: "s13 w6" }),
      t(x, y + 97, hex, { c: "s12 c2" }),
      t(x, y + 113, role, { c: "s11 c3" }),
    ]);
  b.push(t(48, 152, "INTERFACCIA", { c: "s11 w6 c3 caps" }));
  [
    ["Inchiostro", K.ink, "testo"],
    ["Pagina", K.page, "sfondo"],
    ["Bianco", K.white, "card, campi"],
    ["Filo", K.line2, "bordi, divisori"],
    ["Blu inchiostro", K.accent, "azioni, focus, attivo"],
    ["Blu tenue", K.accentTint, "righe attive, selezioni"],
  ].forEach(([n, h, ro], i) => b.push(swatch(48 + i * 124, 164, n, h, ro)));
  b.push(t(48, 312, "VEICOLI NEL CONFRONTO", { c: "s11 w6 c3 caps" }));
  K.slot.forEach((h, i) =>
    b.push(
      swatch(
        48 + i * 124,
        324,
        `${i + 1} · ${K.slotName[i]}`,
        h,
        `numero ${K.onSlot[i] === K.white ? "bianco" : "inchiostro"}`,
        112,
        String(i + 1),
      ),
    ),
  );
  b.push(t(560, 312, "SEGNALI (SEMPRE CON ICONA)", { c: "s11 w6 c3 caps" }));
  [
    ["Informazione", K.info, K.infoTint, infoIcon],
    ["Attenzione", K.attn, K.attnTint, null],
    ["Critico", K.crit, K.critTint, missIcon],
  ].forEach(([n, h, tint, ic], i) => {
    const x = 560 + i * 150;
    b.push(
      r(x, 324, 136, 60, { rx: 10, fill: tint }),
      ic
        ? ic(x + 22, 354)
        : g([
            p(`M${x + 22},${344} l9,16 h-18 Z`, "", { fill: K.attn }),
            t(x + 22, 358, "!", { c: "s10 w7 inv", a: "middle" }),
          ]),
      t(x + 40, 359, n, { c: "s13 w6", fill: h }),
    );
    b.push(
      t(x, 404, h, { c: "s12 c2" }),
      t(x, 420, `fondo ${tint}`, { c: "s11 c3" }),
    );
  });
  b.push(t(1040, 152, "REGOLE DEL COLORE", { c: "s11 w6 c3 caps" }));
  [
    "Il colore di un veicolo compare solo con il suo numero.",
    "Solo segni piccoli: badge, filetto, linea, marcatore.",
    "Mai su testo, mai su grandi superfici.",
    "Fuori dal confronto il veicolo è neutro.",
    "I segnali usano toni scuri, fondo tenue e icona.",
    "Le azioni sono blu inchiostro, mai colori veicolo.",
  ].forEach((s, i) =>
    b.push(
      ci(1046, 176 + i * 24, 2.5, "", { fill: K.ink2 }),
      t(1058, 180 + i * 24, s, { c: "s13 c2" }),
    ),
  );

  b.push(t(48, 478, "TIPOGRAFIA · SCHIBSTED GROTESK", { c: "s11 w6 c3 caps" }));
  b.push(
    t(48, 530, "Trova l’auto adatta a te.", {
      c: "s44 w7",
      "letter-spacing": "-1.2",
    }),
    t(640, 524, "700 · 56 / 32 / 26 · interlinea stretta", { c: "s12 c3" }),
  );
  b.push(
    t(
      48,
      566,
      "Testo, etichette e azioni con lo stesso carattere, in pesi 400–700.",
      { c: "s16" },
    ),
    t(640, 564, "400–600 · 12–17", { c: "s12 c3" }),
  );
  b.push(
    t(48, 610, "22 min   +53,9 kWh   €41.500   ~380 km", { c: "s30 w7" }),
    t(640, 604, "cifre tabulari in tabelle e grafici", { c: "s12 c3" }),
  );

  b.push(t(48, 664, "COMPONENTI", { c: "s11 w6 c3 caps" }));
  b.push(
    criterionBox(48, 678, 290, D.requirements[0], "req"),
    criterionBox(48, 738, 290, D.preferences[0], "pref"),
    criterionBox(48, 798, 290, D.requirements[2], "req", true),
  );
  b.push(
    button(368, 678, 150, "Confronta →", "primary"),
    button(528, 678, 132, "Apri scheda"),
    segmented(
      368,
      730,
      ["Schede", "Elenco", "Differenze"],
      0,
      [76, 70, 98],
      36,
    ),
  );
  b.push(
    check(375, 794),
    t(390, 799, "rispettato", { c: "s13" }),
    missIcon(484, 794),
    t(499, 799, "non rispettato", { c: "s13" }),
  );
  b.push(
    tag(470, 834, "costruttore"),
    tag(560, 834, "stima"),
    tag(650, 834, "calcolo"),
  );
  b.push(
    r(368, 852, 160, 30, { rx: 15, c: "field" }),
    badge(383, 867, 0, 10, 11),
    t(400, 872, "Nordis E4  ×", { c: "s13 w5" }),
  );
  [0, 1, 2, 3].forEach((i) => b.push(marker(560 + i * 26, 867, i, 5)));
  b.push(t(668, 871, "marcatori di serie", { c: "s12 c3" }));

  b.push(t(820, 664, "ASSEGNAZIONE DEI COLORI", { c: "s11 w6 c3 caps" }));
  const steps = [
    ["Aggiungi Nordis E4", [0]],
    ["Aggiungi Aurora Vela", [0, 1]],
    ["Aggiungi Brisa Family", [0, 1, 2]],
    ["Rimuovi Aurora Vela", [0, null, 2]],
    ["Aggiungi Talon S", [0, 1, 2], "riceve il 2, il primo libero"],
  ];
  steps.forEach(([lab, slots, note], k) => {
    const y = 690 + k * 34;
    b.push(t(820, y + 4, lab, { c: "s13" }));
    slots.forEach((s, j) =>
      b.push(
        s === null
          ? ci(1010 + j * 26, y, 10, "", {
              fill: "none",
              stroke: K.line2,
              "stroke-dasharray": "3 2",
            })
          : badge(1010 + j * 26, y, s, 10, 11),
      ),
    );
    if (note) b.push(t(1100, y + 4, note, { c: "s12 c3" }));
  });
  b.push(
    t(
      820,
      872,
      "Il colore resta al veicolo finché è nel confronto; nessun veicolo viene ricolorato.",
      { c: "s12 c3" },
    ),
  );

  b.push(t(48, 916, "FOTOGRAFIA", { c: "s11 w6 c3 caps" }));
  b.push(
    el("clipPath", { id: "idp" }, r(48, 926, 180, 60, { rx: 8 })),
    g(photoSlot(48, 926, 180, 60, {}), { "clip-path": "url(#idp)" }),
  );
  b.push(
    t(
      244,
      950,
      "Foto reali del modello, sfondo neutro chiaro, vista ¾ anteriore, angoli arrotondati come le card.",
      { c: "s13 c2" },
    ),
    t(
      244,
      970,
      "Qui segnaposto: i veicoli del catalogo sono illustrativi. Font: Schibsted Grotesk (OFL), incorporato.",
      { c: "s12 c3" },
    ),
  );
  return svgDoc({
    w: 1440,
    h: 1000,
    title: "Livrea Refined — Identity sheet",
    desc: "Palette, segnali, tipografia, componenti, regole del colore dei veicoli della variante Livrea Refined.",
    style,
    defs,
    body: b,
  });
}

const concept = {
  id: "livrea-refined",
  screens: {
    identity: identitySheet,
    landing: landingScreen,
    discovery: discoveryScreen,
    comparison: comparisonScreen,
    charging: chargingScreen,
  },
};

export default concept;
