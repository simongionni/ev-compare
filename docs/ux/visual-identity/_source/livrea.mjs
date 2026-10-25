// Concept 2 — Livrea. Bold, poster-like. Each vehicle in the comparison wears a livery colour
// that follows it everywhere: result card, tray, comparison column, chart line.
// Ink and white carry the interface; livery colours carry vehicle identity only.
import {
  t,
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
  page: "#F6F5F1",
  white: "#FFFFFF",
  ink: "#0F0F10",
  ink2: "#3D3D42",
  ink3: "#66666D",
  rule: "#DCDBD6",
  stone: "#ECEBE6",
  livery: ["#2448D8", "#EF6A1F", "#11A37A", "#C23A8A"],
  tint: ["#E8ECFB", "#FDEEE4", "#E3F4EE", "#F8E7F1"],
  // text that sits on each livery colour (contrast-checked: white on cobalt/magenta, ink on tangerine/green)
  on: ["#FFFFFF", "#0F0F10", "#0F0F10", "#FFFFFF"],
};

const style = `
${typeUtilities()}
text{font-family:Archivo,'Helvetica Neue',Arial,sans-serif;fill:${K.ink}}
.d{font-family:'Archivo Black','Arial Black',Archivo,sans-serif;font-weight:900}
.c2{fill:${K.ink2}}.c3{fill:${K.ink3}}.inv{fill:${K.white}}
.l1{fill:${K.livery[0]}}.l2{fill:${K.livery[1]}}.l3{fill:${K.livery[2]}}.l4{fill:${K.livery[3]}}
.caps{letter-spacing:1.4px}
.page{fill:${K.page}}.white{fill:${K.white}}.ink{fill:${K.ink}}.stone{fill:${K.stone}}
.card{fill:${K.white};stroke:${K.rule};stroke-width:1}
.field{fill:${K.white};stroke:${K.ink};stroke-width:2}
.dash{fill:none;stroke:${K.ink};stroke-width:2;stroke-dasharray:6 4}
.dashw{fill:none;stroke:${K.white};stroke-width:1.5;stroke-dasharray:6 4}
.rule{stroke:${K.rule};stroke-width:1;fill:none}
.ruleink{stroke:${K.ink};stroke-width:2;fill:none}
.stroke{stroke:${K.ink};stroke-width:2;fill:none;stroke-linecap:round;stroke-linejoin:round}
.strokew{stroke:${K.white};stroke-width:2;fill:none;stroke-linecap:round;stroke-linejoin:round}
.grid{stroke:${K.stone};stroke-width:1;fill:none}
`;

// ---------------------------------------------------------------- components

const pill = (
  x,
  y,
  w,
  h,
  label,
  { fill = K.ink, text = K.white, stroke, dash, cls = "s13 w7", rx } = {},
) =>
  g([
    r(x, y, w, h, {
      rx: rx ?? h / 2,
      fill: fill || "none",
      stroke,
      "stroke-width": stroke ? 2 : undefined,
      "stroke-dasharray": dash ? "5 3" : undefined,
    }),
    t(x + w / 2, y + h / 2 + 4.6, label, { c: cls, a: "middle", fill: text }),
  ]);

const slotBadge = (cx, cy, i, rad = 12, size = 13) =>
  g([
    ci(cx, cy, rad, "", { fill: K.livery[i] }),
    t(cx, cy + size * 0.36, String(i + 1), {
      c: `d s${size}`,
      a: "middle",
      fill: K.on[i],
    }),
  ]);

const logo = (x, y) =>
  g([
    r(x, y + 4, 18, 18, { rx: 3, fill: K.livery[0] }),
    r(x + 10, y, 18, 18, { rx: 3, fill: K.livery[1] }),
  ]);

const navBar = (active, selected = 0) => {
  const xs = [220, 305, 447];
  const out = [
    r(0, 0, 1440, 64, { c: "ink" }),
    logo(32, 20),
    t(70, 39, nav.brand, { c: "d s18 inv" }),
  ];
  nav.items.forEach((it, i) => {
    out.push(t(xs[i], 39, it, { c: `s15 ${active === i ? "w8" : "w5"} inv` }));
    if (active === i)
      out.push(r(xs[i], 58, it.length * 8.6, 6, { fill: K.white }));
  });
  for (let i = 0; i < selected; i++)
    out.push(slotBadge(404 + i * 22, 34, i, 10, 11));
  out.push(t(1408, 39, nav.right, { c: "s14 inv", a: "end" }));
  return g(out);
};

/** Flat silhouette. `i` = livery slot or -1 for a vehicle outside the comparison. */
const silhouette = (type, x, y, w, i, { onDark = false } = {}) => {
  const c = car(type, x, y, w);
  const fill = i >= 0 ? K.livery[i] : onDark ? K.white : K.ink2;
  const glass = i >= 0 ? K.tint[i] : onDark ? K.ink2 : K.stone;
  return g([
    p(c.body, "", { fill }),
    p(c.windows, "", { fill: glass, opacity: i >= 0 ? 0.85 : 1 }),
    p(c.pillar, "", { stroke: fill, "stroke-width": w / 60 }),
    ...c.wheels.map((wx) =>
      g([
        ci(wx, c.wheelY, c.wheelR, "", { fill: K.ink }),
        ci(wx, c.wheelY, c.wheelR * 0.42, "", { fill: K.stone }),
      ]),
    ),
  ]);
};

const tagPill = (xRight, y, name) => {
  const w = name.length * 6.3 + 16;
  const x = xRight - w;
  if (name === "costruttore")
    return pill(x, y - 13, w, 18, name, { fill: K.ink2, cls: "s10 w7" });
  if (name === "stima")
    return pill(x, y - 13, w, 18, name, {
      fill: "none",
      text: K.ink,
      stroke: K.ink2,
      dash: true,
      cls: "s10 w7",
    });
  return pill(x, y - 13, w, 18, name, {
    fill: "none",
    text: K.ink,
    stroke: K.ink2,
    cls: "s10 w7",
  });
};

const checkDot = (cx, cy, rad = 8, fill = K.ink, mark = K.white) =>
  g([
    ci(cx, cy, rad, "", { fill }),
    p(checkPath(cx - rad, cy - rad, rad * 2), "", {
      stroke: mark,
      "stroke-width": 2,
      fill: "none",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    }),
  ]);
const missDot = (cx, cy, rad = 8) =>
  g([
    ci(cx, cy, rad, "", { fill: "none", stroke: K.ink, "stroke-width": 2 }),
    ln(cx - 4, cy, cx + 4, cy, "stroke"),
  ]);

const segmented = (x, y, labels, active, widths, h = 36) => {
  const total = widths.reduce((a, b) => a + b, 0);
  const out = [r(x, y, total, h, { rx: h / 2, c: "field" })];
  let cx = x;
  labels.forEach((l, i) => {
    if (i === active)
      out.push(
        r(cx + 3, y + 3, widths[i] - 6, h - 6, { rx: (h - 6) / 2, c: "ink" }),
      );
    out.push(
      t(cx + widths[i] / 2, y + h / 2 + 4.6, l, {
        c: `s13 ${i === active ? "w8 inv" : "w6"}`,
        a: "middle",
      }),
    );
    cx += widths[i];
  });
  return g(out);
};

// ---------------------------------------------------------------- screens

function landingScreen() {
  const L = landing;
  const b = [r(0, 0, 1440, 880, { c: "page" }), navBar(-1)];
  b.push(
    t(72, 168, "Trova l’auto elettrica", {
      c: "d s72",
      "letter-spacing": "-2",
    }),
  );
  b.push(t(72, 246, "adatta a te.", { c: "d s72", "letter-spacing": "-2" }));
  b.push(t(76, 296, L.subtitle, { c: "s32 w5 c2" }));
  // livery parade: up to four vehicles side by side, each in its slot colour
  [
    ["mpv", 2],
    ["compact", 1],
    ["suv", 0],
  ].forEach(([type, i], k) => {
    const x = 620 + k * 250;
    b.push(silhouette(type, x, 200, 270, i));
    b.push(slotBadge(x + 135, 192, i, 14, 14));
  });
  b.push(r(600, 297, 840, 4, { c: "ink" }));

  const py = 336;
  // model search: white block, heavy frame
  b.push(r(72, py, 640, 316, { rx: 6, c: "field", "stroke-width": 3 }));
  b.push(t(100, py + 46, L.model.heading, { c: "d s24" }));
  b.push(
    r(100, py + 66, 470, 54, { rx: 27, c: "field", "stroke-width": 3 }),
    ci(130, py + 91, 8, "stroke"),
    ln(136, py + 97, 142, py + 103, "stroke"),
  );
  b.push(
    t(156, py + 100, L.model.query, { c: "s18 w6" }),
    ln(193, py + 80, 193, py + 106, "stroke"),
  );
  b.push(pill(580, py + 66, 104, 54, L.model.button, { cls: "s16 w8" }));
  b.push(t(100, py + 152, "MODELLI", { c: "s11 w8 c3 caps" }));
  L.model.models.forEach((m, i) => {
    const y = py + 180 + i * 30;
    b.push(
      t(100, y, m.name, { c: "s16 w8" }),
      t(204, y, m.body, { c: "s14 c2" }),
      t(684, y, m.action, { c: "s14 w7 u", a: "end" }),
    );
  });
  b.push(
    ln(100, py + 224, 684, py + 224, "rule"),
    t(100, py + 248, "MARCHE", { c: "s11 w8 c3 caps" }),
  );
  b.push(
    t(100, py + 274, L.model.brands[0].name, { c: "s16 w8" }),
    t(684, py + 274, L.model.brands[0].action, { c: "s14 w7 u", a: "end" }),
  );
  b.push(t(100, py + 300, L.model.all, { c: "s13 c2" }));

  // needs: black block
  b.push(r(736, py, 632, 316, { rx: 6, c: "ink" }));
  b.push(t(764, py + 46, L.needs.heading, { c: "d s24 inv" }));
  let cx = 764,
    cy = py + 72;
  L.needs.chips.forEach((chip) => {
    const w = chip.length * 8.2 + 48;
    if (cx + w > 1340) {
      cx = 764;
      cy += 52;
    }
    b.push(
      r(cx, cy, w, 40, {
        rx: 20,
        fill: "none",
        stroke: K.white,
        "stroke-width": 2,
        "stroke-dasharray": chip === "Specifiche tecniche" ? "6 4" : undefined,
      }),
    );
    b.push(
      t(cx + 18, cy + 26, "+", { c: "d s16 inv" }),
      t(cx + 36, cy + 26, chip, { c: "s15 w7 inv" }),
    );
    cx += w + 10;
  });
  b.push(
    pill(764, py + 210, 330, 54, L.needs.cta, {
      fill: K.white,
      text: K.ink,
      cls: "s16 w8",
    }),
  );

  // direct access
  const dy = 684;
  b.push(t(72, dy, L.direct.heading, { c: "s13 w8 c3 caps" }));
  L.direct.items.forEach((it, i) => {
    const x = 72 + i * 440,
      w = 416;
    b.push(
      r(x, dy + 16, w, 112, { rx: 6, c: "white" }),
      r(x, dy + 16, 8, 112, { c: "ink" }),
    );
    b.push(
      t(x + 32, dy + 54, it.title, { c: "d s20" }),
      t(x + 32, dy + 80, it.text, { c: "s14 c2" }),
      t(x + 32, dy + 110, it.link, { c: "s14 w8 u" }),
    );
    if (i === 0)
      K.livery.forEach((col, k) =>
        b.push(
          r(x + 300 + k * 26, dy + 36, 20, 28, { rx: 3, fill: col }),
          t(x + 310 + k * 26, dy + 55, String(k + 1), {
            c: "d s12",
            a: "middle",
            fill: K.on[k],
          }),
        ),
      );
  });
  b.push(t(72, 860, L.footer, { c: "s12 c3" }));
  return svgDoc({
    w: 1440,
    h: 880,
    title: "Livrea — Landing Page",
    desc: "Concept Livrea applicato alla landing consolidata.",
    style,
    body: b,
  });
}

function criterionBox(x, y, w, item, kind, open = false, onDark = true) {
  const out = [];
  if (kind === "req")
    out.push(
      r(x, y, w, 50, {
        rx: 6,
        fill: K.white,
        stroke: open ? K.white : "none",
        "stroke-width": open ? 3 : 0,
      }),
    );
  else
    out.push(
      r(x + 0.75, y + 0.75, w - 1.5, 48.5, {
        rx: 6,
        c: onDark ? "dashw" : "dash",
      }),
    );
  const txt = kind === "req" || !onDark ? "" : "inv";
  out.push(
    t(x + 16, y + 20, item.label, { c: `s12 w6 ${txt || "c2"}` }),
    t(x + 16, y + 40, item.value, { c: `s15 w8 ${txt}` }),
  );
  if (item.spec)
    out.push(
      pill(x + 156, y + 9, 40, 16, "SPEC", { fill: K.ink, cls: "s9 w8" }),
    );
  out.push(
    p(chevron(x + w - 22, y + 25, 5, open), "", {
      stroke: kind === "req" || !onDark ? K.ink : K.white,
      "stroke-width": 2,
      fill: "none",
    }),
  );
  return g(out);
}

function discoveryScreen() {
  const b = [r(0, 0, 1440, 1330, { c: "page" }), navBar(0, 2)];
  b.push(r(0, 64, 368, 1266, { c: "ink" }));
  // search spans the results area; the criteria column starts with its own title
  b.push(
    r(384, 84, 1024, 52, { rx: 26, c: "field" }),
    ci(414, 108, 8, "stroke"),
    ln(420, 114, 426, 120, "stroke"),
    t(440, 116, D.search, { c: "s15 c3" }),
  );
  b.push(
    t(32, 112, D.criteriaTitle, { c: "d s22 inv" }),
    t(344, 112, D.reset, { c: "s13 w7 u inv", a: "end" }),
  );
  b.push(
    r(32, 134, 30, 16, { rx: 4, fill: K.white }),
    t(70, 147, D.legend.req, { c: "s12 inv" }),
    r(196, 134, 30, 16, { rx: 4, c: "dashw" }),
    t(234, 147, D.legend.pref, { c: "s12 inv" }),
  );
  b.push(t(32, 186, "REQUISITI", { c: "s11 w8 caps inv" }));
  D.requirements.forEach((it, i) =>
    b.push(criterionBox(32, 198 + i * 60, 312, it, "req", it.open)),
  );
  const E = D.editor,
    ey = 376;
  b.push(r(32, ey, 312, 330, { rx: 6, c: "white" }));
  b.push(
    t(48, ey + 30, E.min, { c: "s12 w6 c2" }),
    t(328, ey + 32, E.minValue, { c: "d s20", a: "end" }),
  );
  const sx = scale(50, 350, 56, 316);
  b.push(
    r(sx(50), ey + 52, sx(350) - sx(50), 8, { rx: 4, c: "stone" }),
    r(sx(100), ey + 52, sx(350) - sx(100), 8, { rx: 4, c: "ink" }),
  );
  b.push(
    ci(sx(100), ey + 56, 11, "", {
      fill: K.white,
      stroke: K.ink,
      "stroke-width": 3,
    }),
    ci(sx(350), ey + 56, 11, "", {
      fill: K.white,
      stroke: K.ink,
      "stroke-width": 3,
    }),
  );
  b.push(
    t(48, ey + 88, E.from, { c: "s12 c3" }),
    t(328, ey + 88, E.to, { c: "s12 c3", a: "end" }),
  );
  b.push(
    t(48, ey + 122, E.behaviour, { c: "s12 w6 c2" }),
    segmented(48, ey + 132, [E.req, E.pref], 0, [132, 132], 36),
  );
  b.push(ln(48, ey + 186, 328, ey + 186, "rule"));
  b.push(
    ci(58, ey + 206, 10, "", {
      fill: "none",
      stroke: K.ink,
      "stroke-width": 2,
    }),
    t(58, ey + 211, "?", { c: "d s12", a: "middle" }),
    t(76, ey + 211, E.explain, { c: "s14 w8" }),
    t(328, ey + 211, E.explainAction, { c: "s13 w7 u", a: "end" }),
  );
  b.push(ln(48, ey + 228, 328, ey + 228, "rule"));
  b.push(
    t(48, ey + 252, E.linkedKicker, { c: "s10 w8 c3 caps" }),
    tagPill(328, ey + 252, "calcolo"),
  );
  b.push(
    t(48, ey + 276, E.linkedTitle, { c: "s15 w8" }),
    t(48, ey + 294, E.linkedText, { c: "s12 c2" }),
  );
  b.push(pill(48, ey + 302, 104, 22, E.linkedAction, { cls: "s12 w8" }));

  b.push(t(32, 748, "PREFERENZE", { c: "s11 w8 caps inv" }));
  D.preferences.forEach((it, i) =>
    b.push(criterionBox(32, 760 + i * 60, 312, it, "pref")),
  );
  b.push(
    pill(32, 946, 312, 44, D.addCriterion, {
      fill: K.white,
      text: K.ink,
      cls: "s15 w8",
    }),
  );
  b.push(t(32, 1018, D.categories, { c: "s12 inv", opacity: 0.75 }));

  // results header with a giant numeral
  b.push(t(384, 236, "3", { c: "d s96", "letter-spacing": "-3" }));
  b.push(
    t(456, 200, "veicoli rispettano", { c: "d s24" }),
    t(456, 228, "tutti i requisiti", { c: "d s24" }),
  );
  b.push(t(456, 252, D.resultsSub, { c: "s13 c2" }));
  b.push(
    segmented(904, 168, D.views, 0, [86, 80, 110], 40),
    r(1196, 168, 212, 40, { rx: 20, c: "field" }),
    t(1216, 193, D.sort, { c: "s13 w7" }),
    p(chevron(1386, 188), "stroke"),
  );
  // notice
  b.push(
    r(384, 272, 1024, 40, { rx: 6, c: "white" }),
    r(384, 272, 6, 40, { c: "ink" }),
    t(404, 297, D.notice, { c: "s13 w5" }),
    t(1392, 297, D.undo, { c: "s13 w8 u", a: "end" }),
  );
  // tray: the selection carries its colours
  b.push(
    r(384, 324, 1024, 60, { rx: 6, c: "white" }),
    t(404, 359, D.tray.label, { c: "s15 w8" }),
  );
  D.tray.items.forEach((it, i) => {
    const x = 552 + i * 160;
    b.push(
      r(x, 336, 152, 36, { rx: 18, fill: K.livery[i] }),
      slotBadge(x + 18, 354, i, 10, 11),
      ci(x + 18, 354, 10, "", {
        fill: "none",
        stroke: K.on[i],
        "stroke-width": 1.5,
      }),
    );
    b.push(
      t(x + 36, 359, it, { c: "s13 w8", fill: K.on[i] }),
      t(x + 138, 360, "×", { c: "s16 w7", a: "middle", fill: K.on[i] }),
    );
  });
  [2, 3].forEach((k) =>
    b.push(
      r(868 + (k - 2) * 44, 336, 36, 36, {
        rx: 18,
        c: "dash",
        "stroke-width": 1.5,
      }),
      t(886 + (k - 2) * 44, 359, String(k + 1), { c: "d s13 c3", a: "middle" }),
    ),
  );
  b.push(
    t(1232, 359, D.tray.diff, { c: "s13 w7 u", a: "end" }),
    pill(1248, 334, 148, 40, D.tray.cta, { cls: "s15 w8" }),
  );

  // cards
  D.results.forEach((res, i) => {
    const v = vehicles[res.id];
    const slot = res.inCompare ? i : -1;
    const x = 384 + i * 347,
      y = 400,
      w = 330;
    b.push(r(x, y, w, 410, { rx: 6, c: "white" }));
    b.push(
      p(
        `M${x},${y + 6} a6,6 0 0 1 6,-6 h${w - 12} a6,6 0 0 1 6,6 v136 h-${w} Z`,
        "",
        { fill: slot >= 0 ? K.tint[slot] : K.stone },
      ),
    );
    b.push(silhouette(v.body, x + 30, y + 22, 270, slot));
    if (slot >= 0) b.push(slotBadge(x + 26, y + 26, slot, 14, 14));
    b.push(
      t(x + 20, y + 172, v.name, { c: "s18 w8" }),
      t(x + 20, y + 192, v.kind, { c: "s13 c2" }),
    );
    b.push(
      t(x + 20, y + 232, v.price, { c: "d s28", "letter-spacing": "-0.5" }),
      t(x + w - 20, y + 232, "listino", { c: "s12 c3", a: "end" }),
    );
    let px = x + 20;
    D.reqLabels.forEach((l) => {
      const pw = l.length * 7 + 34;
      b.push(
        r(px, y + 250, pw, 24, { rx: 12, c: "ink" }),
        p(checkPath(px + 6, y + 255, 14), "strokew"),
        t(px + 24, y + 266, l, { c: "s12 w7 inv" }),
      );
      px += pw + 6;
    });
    b.push(r(x + 20, y + 286, 24, 1, { c: "ink" }));
    b.push(
      checkDot(x + 28, y + 306, 7),
      t(x + 42, y + 310, `Viaggio 400 km: ${v.stop}`, { c: "s12 w6" }),
      tagPill(x + w - 20, y + 310, "stima"),
    );
    b.push(
      checkDot(x + 28, y + 328, 7),
      t(x + 42, y + 332, D.prefDaily, { c: "s12 w6" }),
    );
    b.push(
      t(x + 20, y + 360, D.why, { c: "s13 w8 u" }),
      t(x + w - 20, y + 360, res.specs, { c: "s13 w7 c2", a: "end" }),
    );
    b.push(
      pill(x + 20, y + 372, 120, 30, "Apri scheda", {
        fill: "none",
        text: K.ink,
        stroke: K.ink,
        cls: "s13 w8",
      }),
    );
    if (slot >= 0)
      b.push(
        r(x + 148, y + 372, 162, 30, { rx: 15, fill: K.livery[slot] }),
        p(checkPath(x + 160, y + 380, 14), "", {
          stroke: K.on[slot],
          "stroke-width": 2.2,
          fill: "none",
        }),
        t(x + 180, y + 392, "Nel confronto", { c: "s13 w8", fill: K.on[slot] }),
      );
    else
      b.push(
        pill(x + 148, y + 372, 162, 30, "Aggiungi al confronto", {
          fill: "none",
          text: K.ink,
          stroke: K.ink,
          cls: "s12 w7",
        }),
      );
  });

  b.push(
    t(384, 862, D.near.title, { c: "d s22" }),
    t(384, 886, D.near.sub, { c: "s13 c2" }),
  );
  D.near.items.forEach((n, i) => {
    const v = vehicles[n.id],
      y = 904 + i * 96;
    b.push(r(385, y + 1, 1022, 82, { rx: 6, c: "dash", fill: K.white }));
    b.push(
      r(400, y + 14, 100, 56, { rx: 4, c: "stone" }),
      silhouette(v.body, 408, y + 24, 84, -1),
    );
    b.push(
      t(516, y + 34, v.name, { c: "s16 w8" }),
      t(516, y + 54, v.kind, { c: "s12 c2" }),
      t(516, y + 72, "Apri scheda ›", { c: "s12 w7 u" }),
    );
    b.push(
      t(780, y + 32, D.near.missKicker, { c: "s10 w8 c3 caps" }),
      missDot(788, y + 50, 7),
      t(802, y + 55, n.miss, { c: "s12 w7" }),
    );
    b.push(
      pill(1078, y + 16, 212, 34, n.fix, {
        fill: "none",
        text: K.ink,
        stroke: K.ink,
        cls: "s13 w8",
      }),
      t(1184, y + 70, n.flex, { c: "s12 w6 u", a: "middle" }),
    );
    b.push(
      r(1304, y + 24, 18, 18, {
        rx: 4,
        fill: "none",
        stroke: K.ink,
        "stroke-width": 2,
      }),
      t(1330, y + 38, "Confronta", { c: "s13 w6" }),
    );
  });
  b.push(t(384, 1136, D.deeper.title, { c: "d s22" }));
  D.deeper.items.forEach((it, i) => {
    const x = 384 + i * 520;
    b.push(
      r(x, 1152, 504, 76, { rx: 6, c: "white" }),
      t(x + 24, 1184, it.title, { c: "s16 w8" }),
      t(x + 24, 1206, it.text, { c: "s12 c2" }),
    );
    b.push(
      ci(x + 470, 1190, 18, "ink"),
      t(x + 470, 1196, "→", { c: "s16 w8 inv", a: "middle" }),
    );
  });
  b.push(
    t(384, 1266, D.footnote, { c: "s12 c3" }),
    t(384, 1288, D.footlink, { c: "s12 w8 u" }),
  );
  return svgDoc({
    w: 1440,
    h: 1330,
    title: "Livrea — Vehicle Discovery, Active Criteria",
    desc: "Concept Livrea applicato alla ricerca con sei criteri attivi.",
    style,
    body: b,
  });
}

function comparisonScreen() {
  const b = [r(0, 0, 1440, 1628, { c: "page" }), navBar(1, 2)];
  const COL = [412, 736],
    CW = 312;
  b.push(
    r(0, 64, 1440, 48, { c: "white" }),
    t(32, 94, C.context.back, { c: "s14 w8 u" }),
    t(112, 94, C.context.summary, { c: "s13 c2" }),
    t(1408, 94, C.context.edit, { c: "s14 w8 u", a: "end" }),
  );
  // column tints run the full height of the table: the livery stays visible while scrolling
  COL.forEach((x, i) => b.push(r(x, 132, CW, 1300, { fill: K.tint[i] })));
  b.push(
    t(32, 176, C.title, { c: "d s36" }),
    t(32, 202, C.count, { c: "s14 c2" }),
  );
  b.push(
    t(32, 246, "Righe", { c: "s12 w6 c2" }),
    segmented(32, 256, C.rowsToggle, 1, [72, 136], 36),
  );
  b.push(
    t(32, 316, "Vista", { c: "s12 w6 c2" }),
    segmented(32, 326, C.viewToggle, 0, [92, 88], 36),
  );
  C.columns.forEach((id, i) => {
    const v = vehicles[id],
      x = COL[i];
    b.push(r(x, 132, CW, 248, { fill: K.livery[i] }));
    b.push(t(x + 20, 178, `0${i + 1}`, { c: "d s40", fill: K.on[i] }));
    b.push(
      silhouette(v.body, x + 112, 140, 184, -1, {
        onDark: K.on[i] === K.white,
      }),
    );
    b.push(
      t(x + 20, 262, v.name, { c: "d s22", fill: K.on[i] }),
      t(x + 20, 284, v.kind, { c: "s13 w5", fill: K.on[i] }),
    );
    b.push(t(x + 20, 324, v.price, { c: "d s28", fill: K.on[i] }));
    b.push(
      t(x + 20, 360, C.actions.open, { c: "s13 w8 u", fill: K.on[i] }),
      t(x + 230, 360, C.actions.replace, {
        c: "s13 u",
        a: "end",
        fill: K.on[i],
      }),
      t(x + 292, 360, C.actions.remove, {
        c: "s13 u",
        a: "end",
        fill: K.on[i],
      }),
    );
  });
  b.push(
    r(1072, 132, 336, 248, { rx: 6, c: "dash" }),
    t(1096, 166, C.add.title, { c: "s16 w8" }),
  );
  b.push(
    r(1096, 180, 288, 44, { rx: 22, c: "field" }),
    ci(1120, 202, 7, "stroke"),
    ln(1125, 207, 1130, 212, "stroke"),
    t(1140, 207, C.add.search, { c: "s14 c3" }),
  );
  b.push(t(1096, 254, C.add.kicker, { c: "s10 w8 c3 caps" }));
  C.add.items.forEach((it, i) => {
    const y = 282 + i * 34;
    b.push(
      t(1096, y, it.name, { c: "s15 w8" }),
      t(1206, y, it.note, { c: "s13 c2" }),
      ci(1372, y - 5, 13, "ink"),
      t(1372, y, "+", { c: "s16 w8 inv", a: "middle" }),
    );
  });

  const row = (y, label, tg, values, notes = [], checks = false, bars) => {
    const out = [t(32, y, label, { c: "s14 w5" })];
    if (tg) out.push(tagPill(396, y, tg));
    values.forEach((val, i) => {
      const x = COL[i] + 20;
      if (checks) out.push(checkDot(x + 8, y - 5, 8));
      out.push(t(x + (checks ? 24 : 0), y, val, { c: "s15 w8" }));
      if (notes[i])
        out.push(
          t(x + (checks ? 24 : 0) + val.length * 9.4 + 10, y, notes[i], {
            c: "s12 w6 c2",
          }),
        );
      if (bars) out.push(r(x, y + 8, bars[i], 6, { rx: 3, fill: K.livery[i] }));
    });
    out.push(ln(32, y + (bars ? 22 : 16), 1408, y + (bars ? 22 : 16), "rule"));
    return g(out);
  };

  b.push(t(32, 436, C.criteria.title, { c: "d s24" }));
  b.push(t(32, 468, "REQUISITI", { c: "s11 w8 c3 caps" }));
  C.criteria.requirements.forEach((rw, i) =>
    b.push(row(500 + i * 40, rw.label, null, rw.values, rw.notes, true)),
  );
  b.push(t(32, 620, "PREFERENZE", { c: "s11 w8 c3 caps" }));
  C.criteria.preferences.forEach((rw, i) =>
    b.push(row(652 + i * 40, rw.label, rw.tag, rw.values, [], true)),
  );

  b.push(t(32, 800, C.others.title, { c: "d s24" }));
  C.others.rows.forEach((rw, i) => {
    const max = Math.max(...rw.num) * 1.1;
    b.push(
      row(
        838 + i * 48,
        rw.label,
        rw.tag,
        rw.values,
        rw.notes || [],
        false,
        rw.num.map((n) => (n / max) * 260),
      ),
    );
  });

  b.push(
    t(32, 1006, C.details.title, { c: "d s24" }),
    t(1408, 1006, C.details.hidden, { c: "s13 w6 c2", a: "end" }),
  );
  b.push(ln(32, 1020, 1408, 1020, "ruleink"));
  b.push(
    t(32, 1050, C.details.open.title, { c: "s17 w8" }),
    pill(
      32 + C.details.open.title.length * 10.6 + 12,
      1036,
      96,
      20,
      C.details.open.count,
      { fill: K.ink, cls: "s11 w7" },
    ),
    ci(1396, 1045, 12, "ink"),
    ln(1390, 1045, 1402, 1045, "strokew"),
  );
  C.details.open.rows.forEach((rw, i) =>
    b.push(row(1090 + i * 38, rw.label, rw.tag, rw.values)),
  );
  C.details.closed.forEach((grp, i) => {
    const y = 1258 + i * 44;
    b.push(
      t(32, y, grp.title, { c: "s17 w8" }),
      pill(44 + grp.title.length * 10.4, y - 14, 96, 20, grp.count, {
        fill: "none",
        text: K.ink,
        stroke: K.ink,
        cls: "s11 w7",
      }),
    );
    if (grp.action) b.push(t(1366, y, grp.action, { c: "s13 w8 u", a: "end" }));
    b.push(
      ci(1396, y - 5, 12, "", {
        fill: "none",
        stroke: K.ink,
        "stroke-width": 2,
      }),
      ln(1390, y - 5, 1402, y - 5, "stroke"),
      ln(1396, y - 11, 1396, y + 1, "stroke"),
      ln(32, y + 16, 1408, y + 16, "rule"),
    );
  });

  b.push(t(32, 1476, C.simulations.title, { c: "d s24" }));
  C.simulations.items.forEach((s, i) => {
    const x = 32 + i * 700;
    if (i) b.push(r(x + 1, 1493, 674, 82, { rx: 6, c: "dash" }));
    else b.push(r(x, 1492, 676, 84, { rx: 6, c: "ink" }));
    const tc = i ? "" : "inv";
    b.push(
      t(x + 24, 1526, s.title, { c: `d s18 ${tc}` }),
      t(x + 24, 1550, s.text, { c: `s13 ${tc || "c2"}` }),
      t(x + 652, 1540, s.action, { c: `s14 w8 u ${tc}`, a: "end" }),
    );
    if (s.notImplemented) b.push(annotation(x + 520, 1500, "NON IMPLEMENTATO"));
  });
  b.push(
    t(32, 1600, C.footnote, { c: "s12 c3" }),
    t(32, 1620, C.footlink, { c: "s12 w8 u" }),
  );
  return svgDoc({
    w: 1440,
    h: 1628,
    title: "Livrea — Comparison, Selected Vehicles",
    desc: "Concept Livrea applicato al confronto con criteri.",
    style,
    body: b,
  });
}

function chargingScreen() {
  const W = 1440,
    Hh = 1120;
  const b = [r(0, 0, W, Hh, { c: "page" }), navBar(1, 2)];
  b.push(
    r(0, 64, W, 48, { c: "white" }),
    t(32, 94, H.back, { c: "s14 w8 u" }),
    t(128, 94, H.backContext, { c: "s13 c2" }),
  );
  b.push(t(32, 166, H.title, { c: "d s36" }));
  // conditions
  b.push(
    r(32, 188, 1376, 100, { rx: 6, c: "white" }),
    t(56, 214, H.conditionsKicker, { c: "s10 w8 c3 caps" }),
  );
  const cx = [56, 456, 720, 1048];
  H.conditions.forEach((cd, i) => {
    b.push(t(cx[i], 238, cd.label, { c: "s12 w6 c2" }));
    if (cd.options)
      b.push(
        segmented(
          cx[i],
          248,
          cd.options,
          cd.active,
          i === 1 ? [72, 80, 80] : i === 0 ? [186, 170] : [150, 128],
          32,
        ),
      );
    else {
      b.push(t(cx[i] + 290, 238, cd.range, { c: "d s14", a: "end" }));
      const s = scale(0, 100, cx[i] + 10, cx[i] + 280);
      b.push(
        r(s(0), 260, s(100) - s(0), 8, { rx: 4, c: "stone" }),
        r(s(10), 260, s(80) - s(10), 8, { rx: 4, c: "ink" }),
      );
      b.push(
        ci(s(10), 264, 10, "", {
          fill: K.white,
          stroke: K.ink,
          "stroke-width": 3,
        }),
        ci(s(80), 264, 10, "", {
          fill: K.white,
          stroke: K.ink,
          "stroke-width": 3,
        }),
      );
    }
  });
  // results as livery blocks
  H.vehicles.forEach((v, i) => {
    const x = 32 + i * 696,
      on = K.on[i];
    b.push(r(x, 304, 680, 132, { rx: 6, fill: K.livery[i] }));
    b.push(
      slotBadge(x + 32, 336, i, 14, 14),
      ci(x + 32, 336, 14, "", { fill: "none", stroke: on, "stroke-width": 2 }),
    );
    b.push(
      t(x + 56, 342, v.name, { c: "d s18", fill: on }),
      t(x + 656, 342, "da 10% a 80% · calcolo", {
        c: "s12 w6",
        a: "end",
        fill: on,
      }),
    );
    b.push(
      t(x + 24, 416, v.result.time, {
        c: "d s64",
        "letter-spacing": "-2",
        fill: on,
      }),
    );
    b.push(
      t(x + 300, 382, v.result.energy, { c: "s15 w8", fill: on }),
      t(x + 300, 404, v.result.avg, { c: "s13 w5", fill: on }),
      t(x + 300, 424, v.result.limit, { c: "s13 w5", fill: on }),
    );
  });
  const [nv, av] = H.vehicles;
  const endTag = (x, y, label, i) => {
    const w = label.length * 7.4 + 20;
    return g([
      r(x, y - 13, w, 22, { rx: 11, fill: K.livery[i] }),
      t(x + w / 2, y + 2, label, { c: "s12 w8", a: "middle", fill: K.on[i] }),
    ]);
  };
  // power
  const PX = [92, 684],
    PY = [522, 822];
  const sx = scale(0, 100, PX[0], PX[1]),
    sy = scale(0, 200, PY[1], PY[0]);
  b.push(
    r(32, 452, 680, 430, { rx: 6, c: "white" }),
    t(56, 486, "Potenza per livello di carica", { c: "d s16" }),
  );
  b.push(r(sx(10), PY[0], sx(80) - sx(10), PY[1] - PY[0], { fill: K.page }));
  b.push(t(sx(45), PY[0] + 16, "10% → 80%", { c: "s11 w7 c3", a: "middle" }));
  for (let kw = 0; kw <= 200; kw += 50)
    b.push(
      ln(PX[0], sy(kw), PX[1], sy(kw), "grid"),
      t(PX[0] - 12, sy(kw) + 4, String(kw), { c: "s12 w6 c2", a: "end" }),
    );
  for (let s = 0; s <= 100; s += 20)
    b.push(t(sx(s), PY[1] + 22, `${s}%`, { c: "s12 w6 c2", a: "middle" }));
  b.push(
    t(PX[0] - 12, PY[0] - 12, "kW", { c: "s11 w7 c3", a: "end" }),
    ln(PX[0], PY[1], PX[1], PY[1], "ruleink"),
  );
  b.push(
    ln(PX[0], sy(150), PX[1], sy(150), "", {
      stroke: K.ink,
      "stroke-width": 2,
      "stroke-dasharray": "2 4",
      "stroke-linecap": "round",
    }),
  );
  b.push(
    pill(PX[1] - 132, sy(150) - 30, 132, 22, "colonnina 150 kW", {
      cls: "s11 w8",
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
      { stroke: K.livery[0], "stroke-width": 1.5, fill: "none", opacity: 0.45 },
    ),
  );
  b.push(
    pl(
      toPts(sampleCurve((s) => effectivePower(av, s, H.station), av.curve)),
      "",
      {
        stroke: K.livery[1],
        "stroke-width": 3.5,
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
        stroke: K.livery[0],
        "stroke-width": 3.5,
        fill: "none",
        "stroke-linejoin": "round",
      },
    ),
  );
  b.push(
    t(sx(38), sy(172) - 6, "senza il limite della colonnina", {
      c: "s11 w6 c3",
      a: "middle",
    }),
  );
  b.push(
    endTag(sx(80) + 8, sy(130), "1 Nordis E4", 0),
    endTag(sx(42), sy(70), "2 Aurora Vela", 1),
  );
  // energy
  const EX = [788, 1380],
    EY = PY;
  const ex = scale(0, 30, EX[0], EX[1]),
    ey = scale(0, 60, EY[1], EY[0]);
  b.push(
    r(728, 452, 680, 430, { rx: 6, c: "white" }),
    t(752, 486, "Energia caricata nel tempo", { c: "d s16" }),
  );
  for (let k = 0; k <= 60; k += 20)
    b.push(
      ln(EX[0], ey(k), EX[1], ey(k), "grid"),
      t(EX[0] - 12, ey(k) + 4, String(k), { c: "s12 w6 c2", a: "end" }),
    );
  for (let m = 0; m <= 30; m += 5)
    b.push(t(ex(m), EY[1] + 22, `${m} min`, { c: "s12 w6 c2", a: "middle" }));
  b.push(
    t(EX[0] - 12, EY[0] - 12, "kWh", { c: "s11 w7 c3", a: "end" }),
    ln(EX[0], EY[1], EX[1], EY[1], "ruleink"),
  );
  b.push(
    ln(ex(20), EY[0], ex(20), EY[1], "", {
      stroke: K.ink,
      "stroke-width": 1,
      "stroke-dasharray": "2 4",
    }),
    t(ex(20), EY[0] - 8, "a 20 min", { c: "s11 w8", a: "middle" }),
  );
  b.push(
    pl(
      av.energy.map(([m, k]) => [ex(m), ey(k)]),
      "",
      { stroke: K.livery[1], "stroke-width": 3.5, fill: "none" },
    ),
    pl(
      nv.energy.map(([m, k]) => [ex(m), ey(k)]),
      "",
      { stroke: K.livery[0], "stroke-width": 3.5, fill: "none" },
    ),
  );
  [nv, av].forEach((v, i) => {
    const X = ex(v.end.min),
      Y = ey(v.end.kwh);
    b.push(
      ci(X, Y, 7, "", {
        fill: K.livery[i],
        stroke: K.white,
        "stroke-width": 2,
      }),
    );
    b.push(
      t(X + (i ? -12 : 12), Y + (i ? -12 : 5), `80% · ${fmt(v.end.kwh)} kWh`, {
        c: "s12 w8",
        a: i ? "end" : "start",
      }),
    );
    b.push(
      ci(ex(20), ey(v.at20.kwh), 5, "", {
        fill: K.white,
        stroke: K.livery[i],
        "stroke-width": 3,
      }),
    );
    b.push(
      endTag(
        i ? ex(20) + 12 : ex(20) - 132,
        ey(v.at20.kwh) + (i ? 18 : -14),
        `${fmt(v.at20.kwh)} kWh · ${v.at20.soc}%`,
        i,
      ),
    );
  });
  b.push(
    t(
      752,
      868,
      "Valori del simulatore M0.1 · partenza dal 10%, colonnina 150 kW",
      { c: "s11 c3" },
    ),
  );
  // stations table and assumptions
  b.push(
    r(32, 900, 680, 196, { rx: 6, c: "white" }),
    t(56, 932, "Con altre colonnine", { c: "d s16" }),
    t(244, 932, "da 10% a 80%", { c: "s12 c3" }),
  );
  const TX = [56, 280, 500];
  b.push(t(TX[0], 960, "Colonnina", { c: "s11 w8 c3" }));
  [nv, av].forEach((v, i) =>
    b.push(
      r(TX[i + 1] - 4, 945, 190, 22, { rx: 11, fill: K.livery[i] }),
      t(
        TX[i + 1] + 8,
        960,
        `${v.name} · ${v.result.energy.split(" ")[0]} kWh`,
        { c: "s11 w8", fill: K.on[i] },
      ),
    ),
  );
  [50, 150, 350].forEach((kw, i) => {
    const y = 1000 + i * 34;
    if (kw === 150) b.push(r(44, y - 22, 656, 32, { rx: 4, c: "stone" }));
    b.push(
      t(TX[0], y, `${kw} kW`, { c: `s14 ${kw === 150 ? "w8" : "w5"}` }),
      t(TX[1], y, nv.stations[kw], { c: "d s15" }),
      t(TX[2], y, av.stations[kw], { c: "d s15" }),
    );
  });
  b.push(
    r(728, 900, 680, 196, { rx: 6, c: "ink" }),
    t(752, 932, "Ipotesi", { c: "d s16 inv" }),
    t(1384, 932, "Limiti del calcolo →", { c: "s13 w8 u inv", a: "end" }),
  );
  H.assumptions.forEach((a, i) =>
    b.push(
      ci(758, 962 + i * 28, 3, "white"),
      t(772, 967 + i * 28, a, { c: "s13 inv" }),
    ),
  );
  return svgDoc({
    w: W,
    h: Hh,
    title: "Livrea — DC charging curves",
    desc: "Concept Livrea: curve di ricarica DC di Nordis E4 e Aurora Vela a 150 kW, valori dal simulatore M0.1.",
    style,
    body: b,
  });
}

function identitySheet() {
  const b = [r(0, 0, 1440, 900, { c: "page" })];
  b.push(
    t(48, 80, "Livrea", { c: "d s56", "letter-spacing": "-2" }),
    t(
      48,
      112,
      "Ogni veicolo nel confronto indossa un colore che lo segue ovunque. Inchiostro e bianco per l’interfaccia.",
      { c: "s16 c2" },
    ),
  );
  b.push(t(48, 164, "INTERFACCIA", { c: "s11 w8 c3 caps" }));
  [
    ["Inchiostro", K.ink, "testo, azioni"],
    ["Bianco", K.white, "superfici"],
    ["Pagina", K.page, "sfondo"],
    ["Pietra", K.stone, "campi, immagini neutre"],
    ["Grafite", K.ink2, "testo secondario"],
  ].forEach(([n, hex, role], i) => {
    const x = 48 + i * 132;
    b.push(
      r(x, 176, 120, 72, { rx: 4, fill: hex, stroke: K.rule }),
      t(x, 268, n, { c: "s13 w8" }),
      t(x, 286, hex, { c: "s11 c2" }),
      t(x, 302, role, { c: "s11 c3" }),
    );
  });
  b.push(
    t(740, 164, "LIVREE (SOLO IDENTITÀ DEI VEICOLI)", { c: "s11 w8 c3 caps" }),
  );
  ["Cobalto", "Mandarino", "Smeraldo", "Magenta"].forEach((n, i) => {
    const x = 740 + i * 166;
    b.push(
      r(x, 176, 154, 72, { rx: 4, fill: K.livery[i] }),
      t(x + 14, 222, String(i + 1), { c: "d s32", fill: K.on[i] }),
      r(x + 104, 186, 40, 52, { rx: 3, fill: K.tint[i] }),
    );
    b.push(
      t(x, 268, `${i + 1} · ${n}`, { c: "s13 w8" }),
      t(x, 286, `${K.livery[i]} · tinta ${K.tint[i]}`, { c: "s11 c2" }),
      t(x, 302, `testo ${K.on[i] === K.white ? "bianco" : "inchiostro"}`, {
        c: "s11 c3",
      }),
    );
  });
  b.push(t(48, 352, "TIPOGRAFIA", { c: "s11 w8 c3 caps" }));
  b.push(
    t(48, 410, "Trova l’auto adatta a te.", {
      c: "d s48",
      "letter-spacing": "-1.5",
    }),
    t(820, 404, "Archivo Black · 72/36/24 · cifre grandi", { c: "s12 c3" }),
  );
  b.push(
    t(48, 448, "Testo, etichette e azioni in Archivo, pesi 500–800.", {
      c: "s16 w5",
    }),
    t(820, 446, "Archivo · 12–18", { c: "s12 c3" }),
  );
  b.push(
    t(48, 500, "22 min  €41.500  3", { c: "d s40" }),
    t(820, 492, "I numeri principali sono il titolo", { c: "s12 c3" }),
  );
  b.push(t(48, 566, "COMPONENTI", { c: "s11 w8 c3 caps" }));
  b.push(r(48, 580, 300, 244, { rx: 6, c: "ink" }));
  b.push(
    criterionBox(64, 596, 268, D.requirements[0], "req"),
    criterionBox(64, 656, 268, D.preferences[0], "pref"),
    criterionBox(64, 716, 268, D.requirements[2], "req", true),
  );
  b.push(
    t(64, 806, "Requisito: pieno · Preferenza: tratteggio", { c: "s12 inv" }),
  );
  b.push(
    pill(380, 580, 150, 40, "Confronta →", { cls: "s15 w8" }),
    pill(540, 580, 130, 40, "Apri scheda", {
      fill: "none",
      text: K.ink,
      stroke: K.ink,
      cls: "s14 w8",
    }),
  );
  b.push(
    segmented(
      380,
      636,
      ["Schede", "Elenco", "Differenze"],
      0,
      [86, 80, 110],
      40,
    ),
  );
  let px = 380;
  ["Budget", "Bagagliaio"].forEach((l) => {
    const pw = l.length * 7 + 34;
    b.push(
      r(px, 696, pw, 24, { rx: 12, c: "ink" }),
      p(checkPath(px + 6, 701, 14), "strokew"),
      t(px + 24, 712, l, { c: "s12 w7 inv" }),
    );
    px += pw + 6;
  });
  b.push(
    checkDot(388, 744, 7),
    t(402, 748, "preferenza soddisfatta", { c: "s12 w6" }),
    missDot(388, 768, 7),
    t(402, 772, "requisito non rispettato", { c: "s12 w6" }),
  );
  b.push(
    tagPill(480, 806, "costruttore"),
    tagPill(560, 806, "stima"),
    tagPill(650, 806, "calcolo"),
  );
  [0, 1].forEach((i) =>
    b.push(
      r(720 + i * 190, 580, 180, 26, { rx: 13, fill: K.livery[i] }),
      slotBadge(736 + i * 190, 593, i, 8, 10),
      t(752 + i * 190, 598, ["Nordis E4", "Aurora Vela"][i], {
        c: "s13 w8",
        fill: K.on[i],
      }),
    ),
  );
  [
    ["suv", 0],
    ["compact", 1],
    ["mpv", -1],
  ].forEach(([type, i], k) => {
    const x = 720 + k * 230;
    b.push(
      r(x, 624, 214, 120, { rx: 6, fill: i >= 0 ? K.tint[i] : K.stone }),
      silhouette(type, x + 18, 640, 178, i),
    );
    if (i >= 0) b.push(slotBadge(x + 20, 644, i, 11, 12));
  });
  b.push(
    t(
      720,
      772,
      "Veicoli: sagome piatte nel colore di livrea; fuori dal confronto in grafite.",
      { c: "s12 c3" },
    ),
  );
  b.push(
    t(
      48,
      868,
      "Font: Archivo e Archivo Black (OFL). Fallback: Arial Black, Helvetica Neue / Arial.",
      { c: "s11 c3" },
    ),
  );
  return svgDoc({
    w: 1440,
    h: 900,
    title: "Livrea — Identity sheet",
    desc: "Palette, tipografia e componenti del concept Livrea.",
    style,
    body: b,
  });
}

const concept = {
  id: "livrea",
  screens: {
    identity: identitySheet,
    landing: landingScreen,
    discovery: discoveryScreen,
    comparison: comparisonScreen,
    charging: chargingScreen,
  },
};

export default concept;
