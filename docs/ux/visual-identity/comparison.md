# Visual identity concepts — critical comparison

_Iteration 1. Kept as history; Livrea was then chosen for further work. The comparison of its two evolutions is in [`livrea-evolution.md`](livrea-evolution.md); the selected identity is [Livrea Consolidated](livrea-consolidated/README.md)._

Compares [Tavola](tavola/README.md), [Livrea](livrea/README.md) and [Notturno](notturno/README.md) as applied to the same four scenarios. Ratings are relative (● strongest of the three, ◐ adequate, ○ weakest) and summarise the argument; the argument matters more than the symbol. No winner is declared.

| Criterion                          | Tavola | Livrea | Notturno |
| ---------------------------------- | ------ | ------ | -------- |
| Recognisability                    | ◐      | ●      | ◐        |
| Fit with the Product Vision        | ●      | ◐      | ◐        |
| Accessibility                      | ●      | ◐      | ○        |
| Dense screens                      | ●      | ◐      | ◐        |
| Precision of technical information | ●      | ◐      | ●        |
| Engagement                         | ○      | ●      | ●        |
| Scalability of the language        | ●      | ○      | ◐        |
| Implementation feasibility         | ●      | ◐      | ○        |

## Recognisability

**Livrea** is the only one that would be recognised from a single cropped screenshot: black type at poster sizes, solid livery blocks, coloured comparison columns. **Notturno** is recognisable by mood, but dark automotive interfaces are common; its distinctiveness depends on photography we do not have. **Tavola** is distinctive among car sites (no one draws cars as elevations with provenance glyphs) but quieter; it is recognised once seen in use rather than at first glance.

## Fit with the Product Vision

The vision asks for clarity, personality, explorability, precision and continuity, and warns against both the specification catalogue and the enthusiast-only dashboard.

- **Tavola** expresses _precision_ and _transparent recommendations_ most directly: provenance is drawn, curve points are distinguished from interpolation. Its risk is the "technical dashboard for enthusiasts" the vision rules out; the copy and spacing must keep it buyer-first.
- **Livrea** expresses _continuity_ best: the same vehicle has the same colour in every activity. It is also the most welcoming to buyers. Its risk is that boldness reads as marketing and competes with _clarity_ on technical screens.
- **Notturno** expresses _explorability_ and the automotive world; lighting as hierarchy is a good metaphor for "complexity available, never mandatory". Its risk is a premium, emotional tone that sits uneasily with neutral, no-winner comparisons.

## Accessibility

All three keep text tokens at or above WCAG AA (4.5:1) and never encode identity, fit or provenance by colour alone (line styles, slot numbers, glyphs, fill vs outline).

- **Tavola**: high contrast, light background, few colours. The vermilion signal (4.6:1) is only used on large or non-text elements or next to text.
- **Livrea**: liveries are high-contrast with their paired text colour, but magenta with white is 4.9:1 and the emerald ↔ magenta pair is near the colour-vision floor; slot numbers are mandatory, not optional. Heavy display type at small sizes would hurt; it is used only large.
- **Notturno**: dark-only is itself an accessibility limitation (glare sensitivity, astigmatism, daylight). Tertiary text sits at 4.5–5.2:1. A light theme is required before it could be accessible.

## Dense screens (Discovery and Comparison)

The brief warned that a spectacular landing is not enough. On the two dense screens:

- **Tavola** holds up best. Hairlines and monospaced figures make the comparison read like a reference table; the provenance column is calm; the near-matches list fits as a ruled table.
- **Livrea** stays readable because the colour key does the work: columns, chips and lines are matched instantly. But the black criteria column and heavy type increase visual weight; with four vehicles the 232 px columns leave little room for Archivo Black prices and long values.
- **Notturno** is readable and its row highlight helps scanning, but panels on dark backgrounds take more space than rules, and the photo-first cards push information down. Long sessions in the table are less comfortable than on paper.

## Precision and clarity of technical information

- **Tavola** is the most precise: graph-paper grid, curve points as markers, interpolation stated, station limit as a construction line, effective vs potential curve distinguished.
- **Notturno** is equally clear in a different way: the unlit band above the station power is the most intuitive explanation of "limited by the station", and the hover tooltip gives exact values. Its weakness is that much depends on interaction.
- **Livrea** is the most immediate (64 px times, coloured callouts) but less exact: thick lines lose resolution near crossings, and bars under values could be read as scores.

## Engagement

**Livrea** makes comparing feel like assembling a line-up; adding a vehicle is a visible event. **Notturno** creates desire through photography and atmosphere. **Tavola** engages people who enjoy understanding things; for a buyer who just wants a car that fits, it offers less pleasure.

## Scalability of the language

Future screens include vehicle analysis, simulations, sources and method, and possibly mobile.

- **Tavola** scales to anything: it is a system of rules and type. Methodology pages, simulators and dense spec sheets are native to it.
- **Notturno** scales to analytical tools well (charts, simulators) but needs photography for every vehicle and a light theme for everything.
- **Livrea** scales poorly where there is no comparison: a single-vehicle analysis has no livery to wear, and any new need for colour (status, warnings, map layers, a fifth vehicle) conflicts with the rule that colour means vehicle.

## Implementation feasibility

- **Tavola**: cheapest. Self-hosted fonts, tokens, hairlines; charts need custom markers and patterns; generic vehicle outlines are a fallback for missing images.
- **Livrea**: moderate. Slot colours are application state tied to the comparison selection; charts must colour by slot; full-height tinted columns constrain the table layout.
- **Notturno**: most expensive. Photography pipeline (sourcing, licensing, cut-outs, fallbacks), a complete light theme, accessible alternatives to hover-driven chart reading.

## Elements that could be combined later

Not a synthesis, only candidates for one:

- **Provenance drawn into the data** (Tavola): glyph + word tags; curve points vs interpolation in charts. Works under any palette.
- **Monospaced or tabular figures in tables** (Tavola), or the semi-condensed figures of Notturno.
- **Vehicle colour continuity** (Livrea), restricted to the comparison and charts, with a quieter base interface than Livrea's.
- **Line style per comparison slot** (Tavola) as the secondary encoding for Livrea's colours.
- **The unlit band above the station power** (Notturno) as the explanation of station-limited charging.
- **Lighting as hover and focus hierarchy** (Notturno), transferable to a light theme as contrast and elevation changes.
- **Big result numbers** (Livrea) for the one figure that answers the question (charging time, results count), inside an otherwise calm layout.
- **Vehicle drawings vs photography**: Tavola's outlines as the universal fallback, Notturno's studio photos where available.

Combinations to avoid: Livrea's colour rule with any other categorical use of colour; Notturno's dark-only stance; Tavola's drawings mixed with stock photography.

## Open questions for the review

1. How much emotional pull should the first screen have relative to the comparison's neutrality?
2. Is dark mode a requirement, a preference, or out of scope for the first slice?
3. Is a vehicle photography pipeline realistic for the data source (OpenEV Data has no images)?
4. Should colour be reserved for vehicle identity across the product, or for states and signals?
