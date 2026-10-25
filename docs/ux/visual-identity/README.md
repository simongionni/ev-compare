# Visual identity exploration (M0.2)

Three visual identity concepts applied to the same consolidated UX scenarios, to choose a direction before the UI stack and the first vertical slice. None of them is a recommendation; see [`comparison.md`](comparison.md).

| Concept      | Idea                                                                                                                                  | Docs                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| **Tavola**   | The vehicle as an annotated technical drawing: paper, ink, hairlines, monospaced figures, one vermilion signal.                       | [`tavola/`](tavola/README.md)     |
| **Livrea**   | Bold and poster-like. Each vehicle in the comparison wears a livery colour that follows it across results, comparison and charts.     | [`livrea/`](livrea/README.md)     |
| **Notturno** | A night instrument panel: warm graphite, information lit by relevance, amber for focus and the active state, low-key car photography. | [`notturno/`](notturno/README.md) |

## Review page

Open [`review.html`](review.html) in a browser (double-click works; no server needed). It shows:

- an overview of the three concepts;
- the same scenario side by side, with zoom (fit, 50 %, 75 %, 100 %) and synchronised scrolling;
- every screen of a concept;
- a full-screen viewer (fit, 100 %, 200 %; ← → change concept, ↑ ↓ change scenario, Esc closes);
- identity sheets (palette, type, components, vehicle representation, chart series);
- strengths and limits.

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
  tavola/ livrea/ notturno/
  comparison.md          critical comparison
  ux-notes.md            presentation choices and UX observations not built into the baseline
```

## Editing and rebuilding

The SVGs are generated so that the three concepts always share the same content. Copy and data live in [`_source/content.mjs`](_source/content.mjs); each concept module draws its own layout and styles. Every SVG keeps its colours in a `<style>` block with named classes, so small edits can also be made by hand.

```sh
node docs/ux/visual-identity/_source/build.mjs            # all concepts
node docs/ux/visual-identity/_source/build.mjs livrea     # one concept
```

The build rewrites the SVGs and `review/assets.js`, which holds a content hash per file. The review page appends that hash to each URL, so a rebuild always shows the current SVG instead of a cached one. Hand-edited SVGs need a build afterwards (or a manual hash change) for the same reason; note that a full build overwrites hand edits.

To add a concept: create `_source/<id>.mjs` exporting the five screens, add the id to `ALL` in `build.mjs`, and add an entry to `review/manifest.js`. To add a scenario: add it to `FILES` in `build.mjs` and to `scenarios` in the manifest.

## Content and data

- Copy, vehicles and values are those of the consolidated wireframes. Vehicles and data are illustrative.
- Review annotations follow the wireframe convention (pink, "NON IMPLEMENTATO"); they are not UI.
- Charging values come from the M0.1 engine. The DC curves and capacities are the illustrative manufacturer data in [`../wireframes/vehicle-comparison/README.md`](../wireframes/vehicle-comparison/README.md). Session results (22.2 / 27.3 min, 53.9 / 40.6 kWh, 49.5 / 34.5 kWh after 20 min) and the energy-over-time series were computed with `simulateChargingSession` and stored in `content.mjs`. Effective power is the vehicle curve, linearly interpolated, capped by the vehicle maximum and the station.
- Engine results carry no "~~"; estimates keep "~~" and the `stima` tag, as in the wireframes.

## Fonts and assets

The SVGs embed no fonts or images and make no network requests. They name the intended typefaces with fallbacks; reviewers without the fonts installed see the fallback, which is what the screenshots in this iteration were checked with.

| Concept  | Intended (all SIL Open Font License, Google Fonts) | Fallback                                     |
| -------- | -------------------------------------------------- | -------------------------------------------- |
| Tavola   | IBM Plex Sans, IBM Plex Mono                       | Helvetica Neue / Arial; Consolas / Menlo     |
| Livrea   | Archivo, Archivo Black                             | Arial Black; Helvetica Neue / Arial          |
| Notturno | Barlow, Barlow Semi Condensed                      | Bahnschrift, DIN Alternate, Segoe UI / Arial |

Vehicle drawings are generic body styles generated from simple profiles in `_source/lib.mjs`, not real models. Notturno's photographs are placeholders drawn with light gradients; a real implementation needs consistent studio photography (see that concept's README).

## Checks done in this iteration

- All 15 SVGs parse as XML, have no external references, and were rendered with headless Chrome at 1440 px and inspected.
- The same strings and values appear in all three concepts (criteria, results, near matches, comparison rows, charging results).
- Categorical chart palettes were checked with a colour-vision-deficiency validator; text tokens meet WCAG 4.5:1 on their surfaces (ratios in each concept README).
- The review page was exercised in headless Chrome: every view, synchronised scrolling, viewer navigation and zoom, hashed URLs.
- The consolidated wireframes are unchanged.
