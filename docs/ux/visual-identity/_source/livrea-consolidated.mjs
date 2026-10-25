// Iteration 3 — Livrea Consolidated. Livrea Refined's structure, surfaces, tables and Schibsted
// Grotesk, with a colour system redesigned around Livrea Expressive's palette:
//   interface  — near-black ink for actions, navigation and focus; warm neutral surfaces
//   scenario   — signal yellow for what the user has set that changes results (criteria,
//                simulation conditions) and for the effect of those settings
//   vehicles   — Cobalto, Mandarino, Smeraldo, Magenta, always with the slot number or marker shape
//   signals    — attention and critical, dark tones with an icon, never yellow
// Yellow intensity is a parameter: tier 1 elements are yellow in both studies (A, B); tier 2
// elements only in B. The screens use B; the identity sheet shows both side by side.
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
  veil: "#F1EEE7",
  yellow: "#FFD23F",
  yellowTint: "#FFF4C7",
  yellowBand: "#FFFAE8",
  // vehicle slots: mark colours and the text colour that sits on each
  slot: ["#2548E0", "#E8601C", "#11A37A", "#B8338E"],
  onSlot: ["#FFFFFF", "#17171B", "#17171B", "#FFFFFF"],
  slotName: ["Cobalto", "Mandarino", "Smeraldo", "Magenta"],
  attn: "#8F5300",
  crit: "#B3261E",
  critTint: "#FBEAE8",
};
// Comparison slots of the scenario: Nordis E4 → 1, Aurora Vela → 2.
const SLOT = { nordis: 0, aurora: 1 };

// Yellow intensity. "B" (characterising) is applied to the screens; "A" (discreet) is drawn only
// in the identity sheet study. Tier 1 = yellow in A and B, tier 2 = yellow in B only.
const Y = { mode: "B" };
const tier2 = () => Y.mode === "B";

const style = `
${fontFaces(["Schibsted Grotesk"])}
${typeUtilities()}
text{font-family:'Schibsted Grotesk','Helvetica Neue',Arial,sans-serif;fill:${K.ink}}
.c2{fill:${K.ink2}}.c3{fill:${K.ink3}}.inv{fill:${K.white}}.crit{fill:${K.crit}}.attn{fill:${K.attn}}
.caps{letter-spacing:1.1px}
.lk{font-weight:600;text-decoration:underline;text-underline-offset:3px}
.page{fill:${K.page}}.white{fill:${K.white}}.ink{fill:${K.ink}}.veil{fill:${K.veil}}
.yel{fill:${K.yellow}}.yt{fill:${K.yellowTint}}
.card{fill:${K.white};stroke:${K.line};stroke-width:1}
.field{fill:${K.white};stroke:${K.line2};stroke-width:1}
.dash{fill:${K.white};stroke:${K.line2};stroke-width:1.2;stroke-dasharray:5 4}
.focus{fill:${K.white};stroke:${K.ink};stroke-width:2}
.hair{stroke:${K.line};stroke-width:1;fill:none}
.hair2{stroke:${K.line2};stroke-width:1;fill:none}
.stroke{stroke:${K.ink};stroke-width:1.6;fill:none;stroke-linecap:round;stroke-linejoin:round}
.stroke2{stroke:${K.ink2};stroke-width:1.4;fill:none;stroke-linecap:round;stroke-linejoin:round}
.grid{stroke:#EFECE6;stroke-width:1;fill:none}
`;

const defs = `<pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="${K.line2}" stroke-width="1"/></pattern><radialGradient id="phShadow"><stop offset="0" stop-color="#B9B4AA" stop-opacity="0.55"/><stop offset="1" stop-color="#B9B4AA" stop-opacity="0"/></radialGradient><linearGradient id="phWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F4F2EE"/><stop offset="1" stop-color="#E7E4DD"/></linearGradient><linearGradient id="phFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DCD8CF"/><stop offset="1" stop-color="#ECE9E3"/></linearGradient>`;

// ---------------------------------------------------------------- components

/** The four comparison slots as the brand mark (the only place slot colours appear without numbers). */
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

/** Yellow plate around a user-set value; falls back to plain text when tier 2 is off. */
const plate = (x, y, label, size = 13, plain = "w6") => {
  const w = label.length * size * 0.56 + 16;
  if (!tier2()) return t(x, y + 17, label, { c: `s${size} ${plain}` });
  return g([
    r(x, y, w, 24, { rx: 6, c: "yel" }),
    t(x + w / 2, y + 16.5, label, { c: `s${size} w7`, a: "middle" }),
  ]);
};

const navBar = (active, selected = 0) => {
  const xs = [220, 305, 447];
  const out = [
    r(0, 0, 1440, 64, { c: "white" }),
    ln(0, 64, 1440, 64, "hair"),
    logo(32, 20),
    t(70, 39, nav.brand, { c: "s18 w7" }),
  ];
  nav.items.forEach((it, i) => {
    out.push(t(xs[i], 39, it, { c: `s15 ${active === i ? "w6" : "w5 c2"}` }));
    if (active === i)
      out.push(r(xs[i], 61, it.length * 8.3, 3, { rx: 1.5, c: "ink" }));
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
      r(x, y, w, h, { rx: h / 2, c: "ink" }),
      t(x + w / 2, y + h / 2 + 5, label, { c: "s14 w6 inv", a: "middle" }),
    ]);
  return g([
    r(x, y, w, h, { rx: h / 2, c: "field" }),
    t(x + w / 2, y + h / 2 + 5, label, { c: "s14 w5", a: "middle" }),
  ]);
};

/**
 * Segmented control. kind "view" changes how results are shown: ink. kind "scenario" changes the
 * results themselves (criterion behaviour, charging conditions): yellow with an ink outline.
 */
const segmented = (x, y, labels, active, widths, h = 34, kind = "view") => {
  const total = widths.reduce((a, b) => a + b, 0);
  const out = [r(x, y, total, h, { rx: h / 2, c: "field" })];
  let cx = x;
  labels.forEach((l, i) => {
    const on = i === active;
    if (on)
      out.push(
        kind === "scenario"
          ? r(cx + 3, y + 3, widths[i] - 6, h - 6, {
              rx: (h - 6) / 2,
              c: "yel",
              stroke: K.ink,
              "stroke-width": 1.5,
            })
          : r(cx + 3, y + 3, widths[i] - 6, h - 6, {
              rx: (h - 6) / 2,
              c: "ink",
            }),
      );
    out.push(
      t(cx + widths[i] / 2, y + h / 2 + 4.5, l, {
        c: `s13 ${on ? (kind === "scenario" ? "w7" : "w6 inv") : "w5 c2"}`,
        a: "middle",
      }),
    );
    cx += widths[i];
  });
  return g(out);
};

/** Range track: the set interval in yellow (tier 2) or ink, with outlined handles. */
const rangeTrack = (x0, x1, a, b, y, values) => {
  const out = [r(x0, y - 2, x1 - x0, 4, { rx: 2, fill: K.line2 })];
  out.push(
    tier2()
      ? r(a, y - 3.5, b - a, 7, { rx: 3.5, c: "yel" })
      : r(a, y - 2, b - a, 4, { rx: 2, c: "ink" }),
  );
  values.forEach((v) =>
    out.push(
      ci(v, y, 8.5, "", { fill: K.white, stroke: K.ink, "stroke-width": 2.2 }),
    ),
  );
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
    ci(cx, cy, rad, "", { fill: K.veil }),
    p(checkPath(cx - rad, cy - rad, rad * 2), "stroke", {
      "stroke-width": 1.7,
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
    ci(cx, cy, 8, "", { fill: K.ink2 }),
    t(cx, cy + 4, "i", { c: "s11 w7 inv", a: "middle" }),
  ]);
const attnIcon = (cx, cy) =>
  g([
    p(`M${cx},${cy - 8} l9,16 h-18 Z`, "", { fill: K.attn }),
    t(cx, cy + 6, "!", { c: "s10 w7 inv", a: "middle" }),
  ]);

/** Notice reporting the effect of the user's last change: yellow (tier 2) or neutral with an icon. */
const notice = (x, y, w, text, action) =>
  g(
    tier2()
      ? [
          r(x, y, w, 38, { rx: 10, c: "yt" }),
          r(x, y, 5, 38, { rx: 2.5, c: "yel" }),
          t(x + 20, y + 24, text, { c: "s13" }),
          t(x + w - 14, y + 24, action, { c: "s13 lk", a: "end" }),
        ]
      : [
          r(x, y, w, 38, { rx: 10, c: "veil" }),
          infoIcon(x + 20, y + 19),
          t(x + 38, y + 24, text, { c: "s13" }),
          t(x + w - 14, y + 24, action, { c: "s13 lk", a: "end" }),
        ],
  );

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

/**
 * Photographic placeholder drawn as the set a real photo will use: light studio wall, floor line,
 * a soft ground shadow where the car will stand, crop marks and an explicit label. No vehicle drawn.
 * `top` rounds only the top corners (card photos).
 */
let phId = 0;
const photo = (
  x,
  y,
  w,
  h,
  { model, view = "vista ¾ anteriore", rx = 12, top = false } = {},
) => {
  const id = `ph${phId++}`;
  const clip = top
    ? p(
        `M${x},${y + h} V${y + rx} a${rx},${rx} 0 0 1 ${rx},-${rx} H${x + w - rx} a${rx},${rx} 0 0 1 ${rx},${rx} V${y + h} Z`,
        "",
      )
    : r(x, y, w, h, { rx });
  const horizon = y + h * 0.66;
  const out = [
    r(x, y, w, h, { fill: "url(#phWall)" }),
    r(x, horizon, w, y + h - horizon, { fill: "url(#phFloor)" }),
    el("ellipse", {
      cx: x + w / 2,
      cy: y + h * 0.8,
      rx: w * 0.36,
      ry: Math.max(4, h * 0.07),
      fill: "url(#phShadow)",
    }),
  ];
  const c = Math.min(12, w / 10);
  const m = w < 120 ? 5 : 10;
  out.push(
    p(
      [
        [x + m, y + m, 1, 1],
        [x + w - m, y + m, -1, 1],
        [x + m, y + h - m, 1, -1],
        [x + w - m, y + h - m, -1, -1],
      ]
        .map(
          ([cx, cy, dx, dy]) =>
            `M${cx},${cy + dy * c} L${cx},${cy} L${cx + dx * c},${cy}`,
        )
        .join(" "),
      "",
      { fill: "none", stroke: "#B5B0A6", "stroke-width": 1.1 },
    ),
  );
  if (w >= 160 && h >= 90) {
    const label = "FOTO SEGNAPOSTO";
    let detail = model ? ` · ${model} · ${view}` : "";
    if (label.length * 6.1 + detail.length * 5.5 + 48 > w) detail = "";
    const pw = label.length * 6.1 + detail.length * 5.5 + 20;
    out.push(
      r(x + 14, y + h - 36, pw, 22, { rx: 11, fill: K.white, opacity: 0.92 }),
      tr(
        x + 24,
        y + h - 21,
        [
          [label, "w7 caps"],
          [detail, ""],
        ],
        { c: "s10 c2" },
      ),
    );
  } else {
    out.push(
      t(x + w / 2, y + h * 0.5 + 3, "FOTO", {
        c: "s9 w7 c3 caps",
        a: "middle",
      }),
    );
  }
  return g([
    el("clipPath", { id }, clip),
    g(out, { "clip-path": `url(#${id})` }),
  ]);
};

const icon = {
  compare: (x, y) =>
    g([
      r(x, y + 4, 7, 16, {
        rx: 2,
        fill: "none",
        stroke: K.ink,
        "stroke-width": 1.8,
      }),
      r(x + 11, y, 7, 20, {
        rx: 2,
        fill: "none",
        stroke: K.ink,
        "stroke-width": 1.8,
      }),
    ]),
  tools: (x, y) =>
    p(
      `M${x},${y + 18} C${x + 6},${y + 2} ${x + 10},${y + 2} ${x + 13},${y + 10} S${x + 18},${y + 16} ${x + 22},${y + 4}`,
      "stroke",
      { "stroke-width": 1.8 },
    ),
  sources: (x, y) =>
    g([
      r(x + 2, y, 16, 20, {
        rx: 2,
        fill: "none",
        stroke: K.ink,
        "stroke-width": 1.8,
      }),
      ln(x + 6, y + 7, x + 14, y + 7, "stroke"),
      ln(x + 6, y + 12, x + 14, y + 12, "stroke"),
    ]),
};

/** Criterion: requirement (solid) or preference (dashed); the yellow tab marks it as set by the user. */
function criterionBox(x, y, w, item, kind, open = false) {
  const out = [
    r(x, y, w, 50, {
      rx: 12,
      c: open ? "focus" : kind === "req" ? "field" : "dash",
    }),
    r(x + 6, y + 10, 4, 30, { rx: 2, c: "yel" }),
  ];
  out.push(
    t(x + 20, y + 20, item.label, { c: "s12 c2" }),
    t(x + 20, y + 39, item.value, { c: "s15 w6" }),
  );
  if (item.spec)
    out.push(
      r(x + 156, y + 9, 38, 16, { rx: 8, c: "veil" }),
      t(x + 175, y + 20.5, "SPEC", { c: "s9 w7 c2", a: "middle" }),
    );
  out.push(
    p(chevron(x + w - 22, y + 25, 5, open), open ? "stroke" : "stroke2"),
  );
  return g(out);
}

/** Context bar summary: the criteria count in a yellow plate (tier 2), then the outcome. */
const criteriaSummary = (x, y) => {
  const [crit, outcome] = C.context.summary.split(" · ");
  if (!tier2()) return t(x, y, C.context.summary, { c: "s13 c3" });
  return g([
    plate(x, y - 17, crit, 12),
    t(x + crit.length * 6.72 + 24, y, outcome, { c: "s13 c3" }),
  ]);
};

// ---------------------------------------------------------------- screens

function landingScreen() {
  phId = 0;
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
  // Refined's editorial image, with a staggered second frame (Expressive's composition, at Refined's scale)
  b.push(
    photo(780, 96, 380, 236, {
      model: "Foto editoriale",
      view: "ricarica, da reperire",
      rx: 18,
    }),
    photo(1176, 124, 168, 208, { model: "Dettaglio", view: "presa", rx: 18 }),
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
    ln(206, py + 75, 206, py + 99, "stroke"),
  );
  b.push(button(586, py + 62, 94, L.model.button, "primary", 50));
  b.push(t(124, py + 144, "MODELLI", { c: "s11 w6 c3 caps" }));
  L.model.models.forEach((m, i) => {
    const y = py + 154 + i * 50;
    if (i === 0) b.push(r(116, y - 4, 572, 48, { rx: 10, c: "veil" }));
    b.push(photo(124, y, 60, 40, { rx: 6 }));
    b.push(
      t(198, y + 25, m.name, { c: "s15 w6" }),
      t(290, y + 25, m.body, { c: "s14 c2" }),
      t(676, y + 25, m.action, {
        c: `s13 w6 ${i === 0 ? "" : "c2"}`,
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

  // Needs: where the user starts setting a scenario. Yellow marks it (tier 2).
  if (tier2())
    b.push(
      el("clipPath", { id: "needs" }, r(732, py, 612, 316, { rx: 18 })),
      g(r(732, py, 612, 5, { c: "yel" }), { "clip-path": "url(#needs)" }),
    );
  b.push(t(760, py + 44, L.needs.heading, { c: "s21 w6" }));
  let cx = 760,
    cy = py + 66;
  L.needs.chips.forEach((chip) => {
    const w = chip.length * 7.7 + 50;
    if (cx + w > 1316) {
      cx = 760;
      cy += 48;
    }
    b.push(r(cx, cy, w, 38, { rx: 19, c: "field" }));
    if (tier2()) b.push(ci(cx + 20, cy + 19, 9, "yel"));
    b.push(
      t(cx + 20, cy + 24, "+", { c: "s15 w7", a: "middle" }),
      t(cx + 37, cy + 25, chip, { c: "s14 w5" }),
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
      t(x + 64, dy + 101, it.link, { c: "s14 w6" }),
    );
  });
  b.push(t(96, 864, L.footer, { c: "s12 c3" }));
  return svgDoc({
    w: 1440,
    h: 880,
    title: "Livrea Consolidated — Landing Page",
    desc: "Livrea Consolidated applicata alla landing consolidata. Le fotografie sono segnaposto.",
    style,
    defs,
    body: b,
  });
}

function discoveryScreen() {
  phId = 0;
  const b = [r(0, 0, 1440, 1330, { c: "page" }), navBar(0, 2)];
  b.push(
    r(32, 86, 1376, 50, { rx: 25, c: "field" }),
    ci(60, 110, 7, "stroke2"),
    ln(65, 115, 70, 120, "stroke2"),
    t(84, 117, D.search, { c: "s15 c3" }),
  );
  b.push(r(24, 156, 344, 880, { rx: 18, c: "card" }));
  if (tier2())
    b.push(
      t(44, 192, "Criteri attivi", { c: "s19 w6" }),
      plate(170, 174, "6", 13),
    );
  else b.push(t(44, 192, D.criteriaTitle, { c: "s19 w6" }));
  b.push(t(348, 192, D.reset, { c: "s13 lk", a: "end" }));
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
    rangeTrack(sx(50), sx(350), sx(100), sx(350), ey + 52, [sx(100), sx(350)]),
  );
  [50, 150, 250, 350].forEach((v) =>
    b.push(t(sx(v), ey + 80, `${v}`, { c: "s11 c3", a: "middle" })),
  );
  b.push(
    t(60, ey + 110, E.behaviour, { c: "s12 c2" }),
    segmented(60, ey + 120, [E.req, E.pref], 0, [136, 136], 34, "scenario"),
  );
  b.push(ln(60, ey + 172, 332, ey + 172, "hair"));
  b.push(
    ci(69, ey + 192, 8, "", { fill: "none", stroke: K.ink2 }),
    t(69, ey + 196, "?", { c: "s11 w7 c2", a: "middle" }),
    t(86, ey + 197, E.explain, { c: "s14 w6" }),
    t(332, ey + 197, E.explainAction, { c: "s13 w6", a: "end" }),
  );
  b.push(ln(60, ey + 214, 332, ey + 214, "hair"));
  b.push(
    t(60, ey + 236, E.linkedKicker, { c: "s11 w6 c3 caps" }),
    tag(332, ey + 236, "calcolo"),
  );
  b.push(
    t(60, ey + 258, E.linkedTitle, { c: "s15 w6" }),
    t(60, ey + 276, E.linkedText, { c: "s12 c2" }),
    t(60, ey + 293, E.linkedAction, { c: "s13 w6" }),
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
  b.push(notice(392, 230, 1016, D.notice, D.undo));
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
    t(1244, 312, D.tray.diff, { c: "s13 lk", a: "end" }),
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
      photo(x, y, w, 156, { model: v.name, rx: 14, top: true }),
    );
    if (slot >= 0)
      b.push(
        r(x, y + 156, w, 4, { fill: K.slot[slot] }),
        badge(x + 28, y + 28, slot, 12, 13),
      );
    b.push(
      t(x + 20, y + 190, v.name, { c: "s18 w6" }),
      t(x + 20, y + 210, v.kind, { c: "s13 c2" }),
    );
    b.push(
      t(x + 20, y + 246, v.price, { c: "s24 w7" }),
      t(x + w - 20, y + 246, "listino", { c: "s12 c3", a: "end" }),
    );
    b.push(ln(x + 20, y + 260, x + w - 20, y + 260, "hair"));
    b.push(t(x + 20, y + 282, "REQUISITI", { c: "s11 w6 c3 caps" }));
    D.reqLabels.forEach((l, k) => {
      const lx = x + 20 + [0, 86, 194][k];
      b.push(check(lx + 7, y + 297), t(lx + 20, y + 302, l, { c: "s13" }));
    });
    b.push(t(x + 20, y + 331, "PREFERENZE", { c: "s11 w6 c3 caps" }));
    b.push(
      check(x + 27, y + 347),
      t(x + 40, y + 352, `Viaggio 400 km: ${v.stop}`, { c: "s13" }),
      tag(x + w - 20, y + 352, "stima"),
    );
    b.push(
      check(x + 27, y + 371),
      t(x + 40, y + 376, D.prefDaily, { c: "s13" }),
    );
    b.push(
      t(x + 20, y + 404, D.why, { c: "s13 w6" }),
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
    b.push(photo(404, y + 12, 104, 60, { rx: 8 }));
    b.push(
      t(524, y + 32, v.name, { c: "s16 w6" }),
      t(524, y + 52, v.kind, { c: "s12 c2" }),
      t(524, y + 72, "Apri scheda ›", { c: "s12 w6" }),
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
      t(1181, y + 70, n.flex, { c: "s12 lk", a: "middle" }),
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
      t(x + 474, 1184, "→", { c: "s18 w6", a: "end" }),
    );
  });
  b.push(
    t(392, 1262, D.footnote, { c: "s12 c3" }),
    t(392, 1284, D.footlink, { c: "s12 w6" }),
  );
  return svgDoc({
    w: 1440,
    h: 1330,
    title: "Livrea Consolidated — Vehicle Discovery, Active Criteria",
    desc: "Livrea Consolidated applicata alla ricerca con sei criteri attivi. Le fotografie sono segnaposto.",
    style,
    defs,
    body: b,
  });
}

function comparisonScreen() {
  phId = 0;
  const b = [r(0, 0, 1440, 1628, { c: "page" }), navBar(1, 2)];
  const COL = [424, 748];
  b.push(r(0, 65, 1440, 46, { c: "white" }), ln(0, 111, 1440, 111, "hair"));
  b.push(
    t(32, 94, C.context.back, { c: "s14 w6" }),
    criteriaSummary(112, 94),
    t(1408, 94, C.context.edit, { c: "s14 lk", a: "end" }),
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
      photo(x, 132, 300, 124, { model: v.name, rx: 12 }),
      r(x, 262, 300, 4, { rx: 2, fill: K.slot[s] }),
    );
    b.push(
      badge(x + 11, 287, s, 11, 12),
      t(x + 30, 293, v.name, { c: "s19 w6" }),
      t(x, 314, v.kind, { c: "s13 c2" }),
      t(x, 344, v.price, { c: "s22 w7" }),
    );
    b.push(
      t(x, 370, C.actions.open, { c: "s13 w6" }),
      t(x + 230, 370, C.actions.replace, { c: "s13 c2", a: "end" }),
      t(x + 300, 370, C.actions.remove, { c: "s13 c2", a: "end" }),
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
      t(1374, y, "+", { c: "s16 w6", a: "middle" }),
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
    if (hover) out.push(r(20, y - 25, 1400, 40, { rx: 8, c: "veil" }));
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

  // The criteria section derives from the user's scenario: a yellow tab next to its title (tier 2).
  b.push(section(440, C.criteria.title));
  if (tier2()) b.push(r(18, 424, 4, 22, { rx: 2, c: "yel" }));
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
    if (grp.action) b.push(t(1366, y, grp.action, { c: "s13 w6", a: "end" }));
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
      t(x + 654, 1522, s.action, { c: "s14 w6", a: "end" }),
    );
    if (s.notImplemented) b.push(annotation(x + 520, 1482, "NON IMPLEMENTATO"));
  });
  b.push(
    t(32, 1590, C.footnote, { c: "s12 c3" }),
    t(32, 1610, C.footlink, { c: "s12 w6" }),
  );
  return svgDoc({
    w: 1440,
    h: 1628,
    title: "Livrea Consolidated — Comparison, Selected Vehicles",
    desc: "Livrea Consolidated applicata al confronto con criteri. La riga Bagagliaio mostra lo stato al passaggio del puntatore.",
    style,
    defs,
    body: b,
  });
}

/** Power-by-SoC chart, shared by the charging screen and the yellow studies. */
function powerChart(PX, PY, { labels = true, compact = false } = {}) {
  const [nv, av] = H.vehicles;
  const sx = scale(0, 100, PX[0], PX[1]),
    sy = scale(0, 200, PY[1], PY[0]);
  const b = [];
  // the interval the user set: a pale band (tier 2) and a yellow bar on the axis (tier 1)
  if (tier2())
    b.push(
      r(sx(10), PY[0], sx(80) - sx(10), PY[1] - PY[0], { fill: K.yellowBand }),
    );
  b.push(
    r(PX[0], PY[0], PX[1] - PX[0], sy(150) - PY[0], { fill: "url(#hatch)" }),
  );
  if (!compact)
    b.push(
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
    b.push(t(sx(s), PY[1] + 26, `${s}%`, { c: "s12 c3", a: "middle" }));
  b.push(
    t(PX[0] - 12, PY[0] - 12, "kW", { c: "s11 c3", a: "end" }),
    ln(PX[0], PY[1], PX[1], PY[1], "hair2"),
  );
  b.push(
    r(sx(10), PY[1] - 3, sx(80) - sx(10), 6, { rx: 3, c: "yel" }),
    ln(sx(10), PY[1] - 7, sx(10), PY[1] + 7, "stroke", { "stroke-width": 2 }),
    ln(sx(80), PY[1] - 7, sx(80), PY[1] + 7, "stroke", { "stroke-width": 2 }),
  );
  if (!compact)
    b.push(
      t(sx(45), PY[1] - 10, "intervallo 10 → 80%", {
        c: "s11 w6",
        a: "middle",
      }),
    );
  b.push(
    ln(PX[0], sy(150), PX[1], sy(150), "", {
      stroke: K.ink,
      "stroke-width": 1.3,
      "stroke-dasharray": "6 4",
    }),
  );
  const stLabel = "colonnina 150 kW";
  if (tier2()) {
    const w = stLabel.length * 6.7 + 16;
    b.push(
      r(PX[1] - w, sy(150) - 28, w, 22, { rx: 6, c: "yel" }),
      t(PX[1] - w / 2, sy(150) - 13, stLabel, { c: "s12 w7", a: "middle" }),
    );
  } else b.push(t(PX[1], sy(150) - 10, stLabel, { c: "s12 c2", a: "end" }));
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
  if (labels)
    b.push(
      badge(sx(82) + 4, sy(126), sN, 9, 10),
      t(sx(82) + 18, sy(126) + 4, "Nordis E4", { c: "s13 w6" }),
      badge(sx(18), sy(108), sA, 9, 10),
      t(sx(18) + 14, sy(108) + 4, "Aurora Vela", { c: "s13 w6" }),
    );
  return g(b);
}

function chargingScreen() {
  phId = 0;
  const W = 1440,
    Hh = 1120;
  const b = [r(0, 0, W, Hh, { c: "page" }), navBar(1, 2)];
  b.push(
    r(0, 65, W, 46, { c: "white" }),
    ln(0, 111, W, 111, "hair"),
    t(32, 94, H.back, { c: "s14 w6" }),
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
          "scenario",
        ),
      );
    else {
      b.push(t(cx[i] + 290, 234, cd.range, { c: "s15 w7", a: "end" }));
      const s = scale(0, 100, cx[i] + 8, cx[i] + 282);
      b.push(rangeTrack(s(0), s(100), s(10), s(80), 261, [s(10), s(80)]));
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
  b.push(
    r(32, 452, 680, 430, { rx: 16, c: "card" }),
    t(52, 486, "Potenza per livello di carica", { c: "s16 w6" }),
  );
  b.push(powerChart(PX, PY));
  b.push(
    marker(60, 866, SLOT.nordis, 4),
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
      { stroke: K.slot[SLOT.aurora], "stroke-width": 2.5, fill: "none" },
    ),
    pl(
      nv.energy.map(([m, k]) => [ex(m), ey(k)]),
      "",
      { stroke: K.slot[SLOT.nordis], "stroke-width": 2.5, fill: "none" },
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
    // the row matching the chosen station: yellow (tier 2) or neutral
    if (kw === 150) {
      b.push(r(40, y - 22, 664, 32, { rx: 8, c: tier2() ? "yt" : "veil" }));
      if (tier2()) b.push(r(40, y - 22, 5, 32, { rx: 2.5, c: "yel" }));
    }
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
    t(1388, 932, "Limiti del calcolo →", { c: "s13 w6", a: "end" }),
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
    title: "Livrea Consolidated — DC charging curves",
    desc: "Livrea Consolidated: curve di ricarica DC di Nordis E4 e Aurora Vela a 150 kW, con stato di hover a 20 minuti. Valori dal simulatore M0.1.",
    style,
    defs,
    body: b,
  });
}

/** One yellow-intensity study: identical components and content, drawn with Y.mode = mode. */
function yellowStudy(x, y, mode, title, rule) {
  const prev = Y.mode;
  Y.mode = mode;
  const w = 652;
  const b = [r(x, y, w, 640, { rx: 18, c: "card" })];
  b.push(
    t(x + 24, y + 38, title, { c: "s20 w7" }),
    t(x + 24, y + 62, rule, { c: "s13 c2" }),
  );
  // nav fragment and context bar
  const cy = y + 84;
  b.push(r(x + 24, cy, w - 48, 40, { rx: 10, c: "field" }));
  b.push(t(x + 40, cy + 25, C.context.back, { c: "s13 w6" }));
  const [crit, outcome] = C.context.summary.split(" · ");
  if (tier2())
    b.push(
      plate(x + 120, cy + 8, crit, 12),
      t(x + 120 + crit.length * 6.72 + 24, cy + 25, outcome, { c: "s13 c3" }),
    );
  else b.push(t(x + 120, cy + 25, C.context.summary, { c: "s13 c3" }));
  b.push(t(x + w - 40, cy + 25, C.context.edit, { c: "s13 lk", a: "end" }));
  // criteria and editor
  const ky = y + 144;
  if (tier2())
    b.push(
      t(x + 24, ky + 14, "Criteri attivi", { c: "s15 w6" }),
      plate(x + 128, ky - 3, "6", 12),
    );
  else b.push(t(x + 24, ky + 14, D.criteriaTitle, { c: "s15 w6" }));
  b.push(
    criterionBox(x + 24, ky + 28, 290, D.requirements[0], "req"),
    criterionBox(x + 24, ky + 86, 290, D.preferences[0], "pref"),
  );
  const ex = x + 338;
  b.push(
    t(ex, ky + 14, D.editor.min, { c: "s12 c2" }),
    t(x + w - 24, ky + 16, D.editor.minValue, { c: "s17 w7", a: "end" }),
  );
  const sx = scale(50, 350, ex + 10, x + w - 34);
  b.push(
    rangeTrack(sx(50), sx(350), sx(100), sx(350), ky + 40, [sx(100), sx(350)]),
  );
  b.push(
    t(ex, ky + 78, D.editor.behaviour, { c: "s12 c2" }),
    segmented(
      ex,
      ky + 88,
      [D.editor.req, D.editor.pref],
      0,
      [132, 132],
      32,
      "scenario",
    ),
  );
  // notice
  b.push(
    notice(
      x + 24,
      y + 300,
      w - 48,
      "Bagagliaio almeno 400 L: da 4 a 3 compatibili.",
      D.undo,
    ),
  );
  // view vs scenario segmented
  const sy = y + 360;
  b.push(
    t(x + 24, sy, "VISTA", { c: "s11 w6 c3 caps" }),
    segmented(x + 24, sy + 10, D.views, 0, [76, 70, 98], 32),
  );
  b.push(
    t(x + 300, sy, "POTENZA DELLA COLONNINA", { c: "s11 w6 c3 caps" }),
    segmented(
      x + 300,
      sy + 10,
      ["50 kW", "150 kW", "350 kW"],
      1,
      [66, 74, 74],
      32,
      "scenario",
    ),
  );
  // chart
  b.push(
    powerChart([x + 64, x + w - 28], [y + 430, y + 580], {
      labels: false,
      compact: true,
    }),
  );
  Y.mode = prev;
  return g(b);
}

function identitySheet() {
  phId = 0;
  const Hs = 2040;
  const b = [r(0, 0, 1440, Hs, { c: "page" })];
  b.push(
    logo(48, 46),
    t(92, 72, "Livrea Consolidated", { c: "s44 w7", "letter-spacing": "-1" }),
  );
  b.push(
    t(
      48,
      104,
      "La struttura e la leggerezza di Refined, la palette di Expressive. Inchiostro per agire, giallo per il tuo scenario, colore per i veicoli.",
      {
        c: "s16 c2",
      },
    ),
  );
  const swatch = (x, y, name, hex, role, on, onFill) =>
    g([
      r(x, y, 112, 60, { rx: 10, fill: hex, stroke: K.line }),
      on ? t(x + 12, y + 38, on, { c: "s20 w7", fill: onFill }) : "",
      t(x, y + 80, name, { c: "s13 w6" }),
      t(x, y + 97, hex, { c: "s12 c2" }),
      t(x, y + 113, role, { c: "s11 c3" }),
    ]);
  b.push(t(48, 152, "INTERFACCIA", { c: "s11 w6 c3 caps" }));
  [
    ["Inchiostro", K.ink, "testo, azioni, focus"],
    ["Pagina", K.page, "sfondo"],
    ["Bianco", K.white, "card, campi"],
    ["Filo", K.line2, "bordi, divisori"],
    ["Velo", K.veil, "hover, righe attive"],
  ].forEach(([n, h, ro], i) => b.push(swatch(48 + i * 124, 164, n, h, ro)));
  b.push(t(700, 152, "IL TUO SCENARIO", { c: "s11 w6 c3 caps" }));
  b.push(
    swatch(
      700,
      164,
      "Giallo targa",
      K.yellow,
      "criteri, condizioni",
      "6",
      K.ink,
    ),
    swatch(824, 164, "Giallo tenue", K.yellowTint, "effetti, contesto"),
  );
  b.push(t(48, 312, "VEICOLI NEL CONFRONTO", { c: "s11 w6 c3 caps" }));
  K.slot.forEach((h, i) =>
    b.push(
      swatch(
        48 + i * 124,
        324,
        `${i + 1} · ${K.slotName[i]}`,
        h,
        `numero ${K.onSlot[i] === K.white ? "bianco" : "inchiostro"}`,
        String(i + 1),
        K.onSlot[i],
      ),
    ),
  );
  b.push(
    t(560, 312, "SEGNALI (SEMPRE CON ICONA E PAROLE)", { c: "s11 w6 c3 caps" }),
  );
  [
    ["Attenzione", K.attn, K.white, attnIcon],
    ["Critico", K.crit, K.critTint, missIcon],
    ["Informazione", K.ink2, K.veil, infoIcon],
  ].forEach(([n, h, tint, ic], i) => {
    const x = 560 + i * 150;
    b.push(
      r(x, 324, 136, 60, { rx: 10, fill: tint, stroke: K.line }),
      ic(x + 22, 354),
      t(x + 40, 359, n, { c: "s13 w6", fill: h }),
      t(x, 404, h, { c: "s12 c2" }),
      t(x, 420, tint === K.white ? "su bianco, senza fondo" : `fondo ${tint}`, {
        c: "s11 c3",
      }),
    );
  });
  b.push(t(1000, 152, "REGOLE DEL COLORE", { c: "s11 w6 c3 caps" }));
  [
    "Azioni, link, navigazione e focus: inchiostro.",
    "Giallo: ciò che hai impostato e che cambia i risultati.",
    "Le scelte di vista (Schede, Tabella) restano inchiostro.",
    "Il giallo ha sempre testo, bordo o forma in inchiostro.",
    "Il giallo non segnala mai un avviso.",
    "Colore di un veicolo solo con numero o marcatore.",
    "Veicoli: segni, filetti, linee. Mai testo, mai colonne.",
    "Fuori dal confronto il veicolo è neutro.",
    "Segnali: tono scuro, icona e parole.",
    "Eccezione: il marchio usa i quattro colori degli slot.",
  ].forEach((s, i) =>
    b.push(
      ci(1006, 176 + i * 24, 2.5, "", { fill: K.ink2 }),
      t(1018, 180 + i * 24, s, { c: "s13 c2" }),
    ),
  );

  b.push(t(48, 478, "TIPOGRAFIA · SCHIBSTED GROTESK", { c: "s11 w6 c3 caps" }));
  b.push(
    t(48, 530, "Trova l’auto adatta a te.", {
      c: "s44 w7",
      "letter-spacing": "-1.2",
    }),
    t(640, 512, "Titoli 700 · 56 / 32 / 26 / 20 · spaziatura stretta", {
      c: "s12 c3",
    }),
    t(
      640,
      530,
      "Testo ed etichette 400–600 · 12–17 · inchiostro, secondario, note",
      { c: "s12 c3" },
    ),
  );
  b.push(
    t(48, 566, "Testo, etichette, link e cifre con lo stesso carattere.", {
      c: "s16",
    }),
    t(474, 566, "Link sottolineato", { c: "s16 lk" }),
  );
  b.push(
    t(48, 612, "22 min   +53,9 kWh   €41.500   ~380 km", { c: "s30 w7" }),
    t(640, 594, "Cifre proporzionali per prezzi e decimali;", { c: "s12 c3" }),
    t(640, 612, "tabulari su assi dei grafici e tabella colonnine", {
      c: "s12 c3",
    }),
  );
  b.push(t(1000, 478, "GERARCHIA", { c: "s11 w6 c3 caps" }));
  [
    ["Confronto", "s32 w7", "32 / 700"],
    ["Con i tuoi criteri", "s20 w6", "20 / 600"],
    ["Bagagliaio almeno 400 L", "s14", "14 / 400"],
    ["REQUISITI", "s11 w6 c3 caps", "11 / 600 maiuscolo"],
  ].forEach(([s, c, m], i) => {
    const y = 516 + i * 30 + (i === 0 ? 0 : 6);
    b.push(
      t(1000, y, s, { c, "letter-spacing": i === 0 ? "-0.6" : undefined }),
      t(1392, y, m, { c: "s11 c3", a: "end" }),
    );
  });

  // components
  const cy = 664;
  b.push(t(48, cy, "COMPONENTI", { c: "s11 w6 c3 caps" }));
  b.push(
    criterionBox(48, cy + 14, 290, D.requirements[0], "req"),
    criterionBox(48, cy + 74, 290, D.preferences[0], "pref"),
    criterionBox(48, cy + 134, 290, D.requirements[2], "req", true),
  );
  b.push(
    t(48, cy + 212, "criterio · preferenza · aperto (focus)", { c: "s11 c3" }),
  );
  b.push(
    button(368, cy + 14, 150, "Confronta →", "primary"),
    button(528, cy + 14, 132, "Apri scheda"),
  );
  b.push(
    segmented(
      368,
      cy + 66,
      ["Schede", "Elenco", "Differenze"],
      0,
      [76, 70, 98],
      34,
    ),
    t(368, cy + 116, "vista: inchiostro", { c: "s11 c3" }),
  );
  b.push(
    segmented(
      368,
      cy + 128,
      ["50 kW", "150 kW", "350 kW"],
      1,
      [66, 74, 74],
      34,
      "scenario",
    ),
    t(368, cy + 178, "condizione del tuo scenario: giallo", { c: "s11 c3" }),
  );
  b.push(
    check(375, cy + 206),
    t(390, cy + 211, "rispettato", { c: "s13" }),
    missIcon(484, cy + 206),
    t(499, cy + 211, "non rispettato", { c: "s13" }),
  );
  b.push(
    tag(452, cy + 240, "costruttore"),
    tag(530, cy + 240, "stima"),
    tag(616, cy + 240, "calcolo"),
  );
  b.push(
    notice(
      48,
      cy + 258,
      612,
      "Bagagliaio almeno 400 L: da 4 a 3 compatibili.",
      D.undo,
    ),
  );

  // vehicle identity: two compact result cards and the slot sequence
  b.push(t(720, cy, "IDENTITÀ DEI VEICOLI", { c: "s11 w6 c3 caps" }));
  const card = (x, y, v, slot) => {
    const w = 210;
    const out = [
      r(x, y, w, 222, { rx: 14, c: "card" }),
      photo(x, y, w, 96, { rx: 14, top: true }),
    ];
    if (slot >= 0)
      out.push(
        r(x, y + 96, w, 4, { fill: K.slot[slot] }),
        badge(x + 20, y + 20, slot, 11, 12),
      );
    out.push(
      t(x + 16, y + 126, v.name, { c: "s16 w6" }),
      t(x + 16, y + 144, v.kind.split(" · ")[0], { c: "s12 c2" }),
      t(x + 16, y + 172, v.price, { c: "s20 w7" }),
    );
    if (slot >= 0)
      out.push(
        r(x + 16, y + 184, 178, 28, {
          rx: 14,
          fill: K.white,
          stroke: K.slot[slot],
          "stroke-width": 2,
        }),
        badge(x + 31, y + 198, slot, 8, 9),
        t(x + 45, y + 202.5, "Nel confronto", { c: "s12 w6" }),
      );
    else
      out.push(
        button(x + 16, y + 184, 178, "+ Aggiungi al confronto", "line", 28),
      );
    return g(out);
  };
  b.push(
    card(720, cy + 14, vehicles.nordis, 0),
    card(944, cy + 14, vehicles.brisa, -1),
  );
  b.push(
    t(720, cy + 256, "nel confronto · non nel confronto (neutra)", {
      c: "s11 c3",
    }),
  );
  const steps = [
    ["Aggiungi Nordis E4", [0]],
    ["Aggiungi Aurora Vela", [0, 1]],
    ["Aggiungi Brisa Family", [0, 1, 2]],
    ["Rimuovi Aurora Vela", [0, null, 2]],
    ["Aggiungi Talon S", [0, 1, 2]],
  ];
  steps.forEach(([lab, slots], k) => {
    const y = cy + 30 + k * 34;
    b.push(t(1178, y + 4, lab, { c: "s13" }));
    slots.forEach((s, j) =>
      b.push(
        s === null
          ? ci(1332 + j * 24, y, 9, "", {
              fill: "none",
              stroke: K.line2,
              "stroke-dasharray": "3 2",
            })
          : badge(1332 + j * 24, y, s, 9, 10),
      ),
    );
  });
  b.push(
    t(1178, cy + 204, "Primo slot libero; nessun veicolo", { c: "s11 c3" }),
    t(1178, cy + 220, "viene ricolorato.", { c: "s11 c3" }),
  );
  [0, 1, 2, 3].forEach((i) => b.push(marker(1186 + i * 26, cy + 246, i, 5)));
  b.push(t(1290, cy + 250, "marcatori di serie", { c: "s11 c3" }));

  // chart elements
  const gy = 990;
  b.push(t(48, gy, "VISUALIZZAZIONI TECNICHE", { c: "s11 w6 c3 caps" }));
  b.push(r(48, gy + 14, 612, 290, { rx: 16, c: "card" }));
  b.push(powerChart([108, 636], [gy + 50, gy + 250], { labels: true }));
  b.push(
    marker(70, gy + 290, 0, 4),
    t(
      82,
      gy + 294,
      "punto del costruttore · tra i punti interpolazione lineare · tratteggio: oltre la colonnina",
      { c: "s11 c3" },
    ),
  );
  const legend = [
    [
      "Linea 2,5 px nel colore dello slot, marcatore di forma per slot, etichetta diretta con numero.",
      null,
    ],
    [
      "Intervallo impostato: barra gialla sull’asse; fascia gialla tenue nel grafico.",
      null,
    ],
    [
      "Limite della colonnina: linea inchiostro tratteggiata, targa gialla con il valore scelto.",
      null,
    ],
    [
      "Area oltre la colonnina: tratteggio neutro; la parte della curva irraggiungibile è punteggiata.",
      null,
    ],
    ["Griglia e assi recessivi; cifre tabulari sugli assi.", null],
    [
      "Hover: mirino inchiostro sottile, tooltip bianco con valori in inchiostro.",
      null,
    ],
  ];
  legend.forEach(([s], i) =>
    b.push(
      ci(694, gy + 36 + i * 26, 2.5, "", { fill: K.ink2 }),
      t(706, gy + 40 + i * 26, s, { c: "s13 c2" }),
    ),
  );
  b.push(t(694, gy + 210, "FOTOGRAFIA", { c: "s11 w6 c3 caps" }));
  b.push(photo(694, gy + 222, 220, 100, { rx: 10 }));
  b.push(
    t(
      930,
      gy + 240,
      "Foto reali del modello: fondale chiaro neutro, vista ¾ anteriore,",
      { c: "s13 c2" },
    ),
    t(
      930,
      gy + 260,
      "auto appoggiata sulla linea del pavimento, angoli come le card.",
      { c: "s13 c2" },
    ),
    t(
      930,
      gy + 284,
      "Qui segnaposto etichettati: i veicoli del catalogo sono illustrativi.",
      { c: "s12 c3" },
    ),
  );

  // yellow studies
  const yy = 1360;
  b.push(
    t(
      48,
      yy - 24,
      "INTENSITÀ DEL GIALLO · STESSI COMPONENTI, STESSI CONTENUTI",
      { c: "s11 w6 c3 caps" },
    ),
  );
  b.push(
    yellowStudy(
      48,
      yy - 8,
      "A",
      "A · Giallo discreto",
      "Solo criteri attivi, condizioni scelte e intervallo sull’asse.",
    ),
    yellowStudy(
      740,
      yy - 8,
      "B",
      "B · Giallo caratterizzante — applicato alle schermate",
      "Anche conteggi, contesto, effetti delle modifiche, valori impostati.",
    ),
  );
  b.push(
    t(
      48,
      Hs - 22,
      "Font: Schibsted Grotesk (SIL OFL), incorporato. Dati e veicoli illustrativi.",
      { c: "s12 c3" },
    ),
  );
  return svgDoc({
    w: 1440,
    h: Hs,
    title: "Livrea Consolidated — Identity sheet",
    desc: "Palette, regole del colore, tipografia, componenti, identità dei veicoli, elementi dei grafici e due studi sull’intensità del giallo della proposta Livrea Consolidated.",
    style,
    defs,
    body: b,
  });
}

const concept = {
  id: "livrea-consolidated",
  screens: {
    identity: identitySheet,
    landing: landingScreen,
    discovery: discoveryScreen,
    comparison: comparisonScreen,
    charging: chargingScreen,
  },
};

export default concept;
