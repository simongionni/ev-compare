# Visual identity exploration (M0.2)

Visual identity concepts applied to the same consolidated UX scenarios, to choose a direction before the UI stack and the first vertical slice. No concept is a recommendation.

## Iteration 2 — evolutions of Livrea

Livrea was chosen for further work. Two evolutions keep its vivid palette and the colour identity of compared vehicles, introduce real vehicle photography (placeholders for now), give colour room for states and signals, and borrow Tavola's tables and chart precision. Critical comparison: [`livrea-evolution.md`](livrea-evolution.md).

| Concept               | Idea                                                                                                                                                          | Docs                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| **Livrea Refined**    | Light surfaces, Schibsted Grotesk, photos in cards. Vehicle colours as small numbered marks; a dark blue interface accent; signal colours with icons.         | [`livrea-refined/`](livrea-refined/README.md)       |
| **Livrea Expressive** | Livery language: colour + stripe count per vehicle, signal yellow for what the user has set, Anybody expanded/condensed with Overpass, photos as composition. | [`livrea-expressive/`](livrea-expressive/README.md) |

Related: [`photography.md`](photography.md) (why the images are placeholders and how real images should be sourced), [`fonts/`](fonts/README.md) (embedded fonts and licences).

## Iteration 1 — three directions

Kept unchanged as history. Comparison: [`comparison.md`](comparison.md).

| Concept      | Idea                                                                                                                                  | Status                      | Docs                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | --------------------------------- |
| **Tavola**   | The vehicle as an annotated technical drawing: paper, ink, hairlines, monospaced figures, one vermilion signal.                       | Not continued; parts reused | [`tavola/`](tavola/README.md)     |
| **Livrea**   | Bold and poster-like. Each vehicle in the comparison wears a livery colour that follows it across results, comparison and charts.     | Chosen for iteration 2      | [`livrea/`](livrea/README.md)     |
| **Notturno** | A night instrument panel: warm graphite, information lit by relevance, amber for focus and the active state, low-key car photography. | Not continued               | [`notturno/`](notturno/README.md) |

## Review page

Open [`review.html`](review.html) in a browser (double-click works; no server needed). It shows:

- an overview of all concepts, grouped by iteration, latest first;
- the same scenario side by side for any selection of concepts, with presets (Famiglia Livrea, Iterazione 2, Iterazione 1, Tutti), zoom (fit, 50 %, 75 %, 100 %) and synchronised scrolling; `review.html#scenari/livrea` opens the Livrea family directly;
- every screen of a concept;
- a full-screen viewer (fit, 100 %, 200 %; ← → move through the concepts being compared, ↑ ↓ change scenario, Esc closes);
- identity sheets (palette and colour rules, type, components, vehicle representation, chart series);
- strengths and limits per concept.

The page references the SVG files directly. It is not part of the product and implies nothing about the frontend stack. It is independent of any earlier UX review page; no earlier review page is versioned in this repository.

## Files

Each concept directory contains the same five SVGs, 1440 px wide:

| File                | Scenario                            | Baseline                                                                                                                            |
| ------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `00-identity.svg`   | Identity sheet                      | —                                                                                                                                   |
| `01-landing.svg`    | Landing Page                        | [`Landing Page.svg`](../wireframes/consolidated-iteration-1/Landing%20Page.svg)                                                     |
| `02-discovery.svg`  | Vehicle Discovery — Active Criteria | [`Vehicle Discovery — Active Criteria.svg`](../wireframes/consolidated-iteration-1/Vehicle%20Discovery%20—%20Active%20Criteria.svg) |
| `03-comparison.svg` | Comparison — Selected Vehicles      | [`Comparison — Selected Vehicles.svg`](../wireframes/vehicle-comparison/Comparison%20—%20Selected%20Vehicles.svg)                   |
| `04-charging.svg`   | DC charging curves, two vehicles    | [`Comparison — Technical Exploration.svg`](../wireframes/vehicle-comparison/Comparison%20—%20Technical%20Exploration.svg)           |

```
visual-identity/
  review.html            review page
  review/                page script, styles, manifest.js (content), assets.js (generated hashes)
  _source/               SVG generator: lib.mjs, content.mjs, one module per concept, build.mjs
  fonts/                 fonts embedded in iteration 2 SVGs, with OFL licences
  tavola/ livrea/ notturno/                 iteration 1
  livrea-refined/ livrea-expressive/        iteration 2
  comparison.md          iteration 1 comparison
  livrea-evolution.md    iteration 2 comparison
  photography.md         photography decision and sourcing strategy
  ux-notes.md            presentation choices and UX observations not built into the baseline
```

## Editing and rebuilding

The SVGs are generated so that all concepts share the same content. Copy and data live in [`_source/content.mjs`](_source/content.mjs); each concept module draws its own layout and styles, so variants can be edited independently. Every SVG keeps its colours in a `<style>` block with named classes.

```sh
node docs/ux/visual-identity/_source/build.mjs                  # all concepts
node docs/ux/visual-identity/_source/build.mjs livrea-refined   # one concept
```

The build rewrites the SVGs and `review/assets.js`, which holds a content hash per file. The review page appends that hash to each URL, so a rebuild always shows the current SVG instead of a cached one. Hand-edited SVGs need a build afterwards (or a manual hash change); a full build overwrites hand edits. Rebuilding iteration 1 produces byte-identical files.

To add a concept: create `_source/<id>.mjs` exporting the five screens, add the id to `ALL` in `build.mjs`, and add an entry (with its `iteration`) to `review/manifest.js`. To add a scenario: add it to `FILES` in `build.mjs` and to `scenarios` in the manifest.

## Content and data

- Copy, vehicles and values are those of the consolidated wireframes. Vehicles and data are illustrative.
- Review annotations follow the wireframe convention (pink, "NON IMPLEMENTATO"); they are not UI.
- Charging values come from the M0.1 engine. The DC curves and capacities are the illustrative manufacturer data in [`../wireframes/vehicle-comparison/README.md`](../wireframes/vehicle-comparison/README.md). Session results (22.2 / 27.3 min, 53.9 / 40.6 kWh, 49.5 / 34.5 kWh after 20 min) and the energy-over-time series were computed with `simulateChargingSession` and stored in `content.mjs`. Effective power is the vehicle curve, linearly interpolated, capped by the vehicle maximum and the station.
- Engine results carry no `~`; estimates keep `~` and the `stima` tag, as in the wireframes.

## Fonts and images

**Iteration 2** SVGs embed their fonts (subset WOFF2, base64), so they render as designed everywhere, including inside the review page. Details and licences: [`fonts/README.md`](fonts/README.md).

| Concept           | Fonts (SIL Open Font License) |
| ----------------- | ----------------------------- |
| Livrea Refined    | Schibsted Grotesk             |
| Livrea Expressive | Anybody, Overpass             |

They contain **no photographs**: the scenario vehicles are fictional, so every image is a labelled placeholder. See [`photography.md`](photography.md).

**Iteration 1** SVGs embed no fonts or images; they name the intended typefaces with fallbacks, and reviewers without the fonts see the fallback.

| Concept  | Intended (all SIL Open Font License, Google Fonts) | Fallback                                     |
| -------- | -------------------------------------------------- | -------------------------------------------- |
| Tavola   | IBM Plex Sans, IBM Plex Mono                       | Helvetica Neue / Arial; Consolas / Menlo     |
| Livrea   | Archivo, Archivo Black                             | Arial Black; Helvetica Neue / Arial          |
| Notturno | Barlow, Barlow Semi Condensed                      | Bahnschrift, DIN Alternate, Segoe UI / Arial |

Iteration 1 vehicle drawings are generic body styles generated in `_source/lib.mjs`, not real models; Notturno's photographs are gradient placeholders.

## Checks

Iteration 2:

- All 25 SVGs parse as XML and have no external references; the 10 new ones were rendered with headless Chrome at 1440 px and inspected, with the embedded fonts.
- Iteration 1 SVGs and the consolidated wireframes are byte-identical to the previous commit.
- The same strings and values appear in both variants and in iteration 1.
- Vehicle palettes of both variants pass the colour-vision validator on all pairs; text tokens meet WCAG 4.5:1 (ratios in each README).
- The review page was exercised in headless Chrome: presets, concept selection, `#scenari/<preset>` links, synchronised scrolling, viewer navigation within the compared concepts, zoom, hashed URLs.

Iteration 1: the same XML, rendering, content, palette and review page checks on 15 SVGs.
