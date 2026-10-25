# Iteration 3 — Livrea Consolidated against Refined and Expressive

Critical comparison of [Livrea Consolidated](livrea-consolidated/README.md) with the two iteration 2 variants, [Livrea Refined](livrea-refined/README.md) and [Livrea Expressive](livrea-expressive/README.md), on the same five artefacts. The iteration 2 comparison stays unchanged in [`livrea-evolution.md`](livrea-evolution.md), and the iteration 1 comparison in [`comparison.md`](comparison.md).

**Outcome: Livrea Consolidated was selected as the visual identity of EV Compare (2026-10-25), closing the M0.2 exploration.** This page is kept as the rationale of that selection. What is consolidated, what is provisional and what is future work is listed once, in [Livrea Consolidated — Decision status](livrea-consolidated/README.md#decision-status).

Ratings are relative within these three (● strongest, ◐ adequate, ○ weakest).

| Criterion                  | Refined | Expressive | Consolidated |
| -------------------------- | ------- | ---------- | ------------ |
| Recognisability            | ◐       | ●          | ◐ to ●       |
| Personality                | ◐       | ●          | ◐ to ●       |
| Lightness                  | ●       | ◐          | ●            |
| Legibility                 | ●       | ◐          | ●            |
| Dense screens              | ●       | ◐          | ●            |
| Technical visualisations   | ●       | ●          | ●            |
| Colour system coherence    | ●       | ●          | ●            |
| Identity without vehicles  | ○       | ●          | ◐            |
| Implementation feasibility | ●       | ◐          | ●            |

"◐ to ●" means better than Refined, short of Expressive, with the final position depending on the yellow intensity and on real photography.

## Why Livrea Consolidated was selected

The comparison below supports it: Consolidated matches Refined on lightness, legibility, dense screens and implementation feasibility, the qualities that matter most for daily use of search, comparison and technical exploration, and recovers much of Expressive's recognisability and personality through its palette and a narrower, functional use of yellow. Its colour system gives every colour one job (section 4). Its remaining weaknesses (identity without vehicles, the dependence on real photography, the discipline yellow requires) are known, bounded, and do not block implementation.

## 1. How the synthesis improves Refined

- **Colour character.** Cobalt, Mandarino, Smeraldo and Magenta are more vivid together than Refined's set with Viola, and cobalt gives the palette a clear primary.
- **No more blue ambiguity.** Refined had to keep its dark blue interface accent apart from slot 4's violet. Consolidated removes the interface colour altogether: actions are ink. Every colour on screen now has one job.
- **Identity on the landing.** Refined's landing was almost neutral. Consolidated adds the yellow needs card with its "+" markers; the logo and photo composition do the rest.
- **Continuity of the user's scenario.** Yellow follows criteria from discovery into the comparison context bar and into the charging conditions. Refined used its interface blue for these, indistinguishable from any other active state.
- **Slightly stronger vehicle marks.** 4 px rules (3 px in Refined), and the same rule under comparison header photos, so the header carries the identity and the table stays neutral.
- **A more informative photo placeholder** that shows the intended framing.

What did not change: layout, typography, tables, charts, density. Side by side in the review page, the Refined and Consolidated columns line up row by row.

## 2. What was taken from Expressive

The vehicle palette (unchanged), signal yellow and its tint, ink as the action colour, yellow tabs on criteria, plates for user-set values, the station plate on the chart, and the staggered photo composition on the landing (at Refined's scale).

## 3. What was deliberately discarded

| Expressive element                                     | Why it was left out                                                                                               |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Anybody expanded/condensed, Overpass                   | Schibsted is preferred; wide type costs space and needs a mobile strategy.                                        |
| Stripe count as vehicle identity                       | Numbers are self-evident; stripes are one more convention. Numbers and marker shapes already work without colour. |
| Livery bands (full-width colour under photos, headers) | Colour areas grow heavier with four vehicles; a 4 px rule carries the same identity.                              |
| Yellow on every selected segment                       | Diluted the meaning. View toggles are ink; only scenario parameters are yellow.                                   |
| Yellow wash on the needs card and the context bar      | Large yellow areas; replaced by a top rule, "+" markers and a plate around the count.                             |
| Ink plate for the results count, ink left rules        | Heavy blocks; Refined's plain headings are lighter.                                                               |
| Full-bleed photos at 176 px, three tall landing frames | Raises the bar for image consistency and makes placeholders dominate.                                             |
| Chart end tags                                         | Direct labels with badges are lighter and already sufficient.                                                     |

## 4. Is the semantics still coherent?

Yes, with one documented exception.

- **Ink**: act, navigate, change the view, focus.
- **Yellow**: your scenario parameters and their effect. Never a warning, never a generic selection, never decoration.
- **Vehicle colours**: identity in the comparison, always paired with a number or a marker shape.
- **Signals**: dark tone, icon and words. The attention tint was removed so it cannot be mistaken for yellow.
- **Exception**: the logo uses the four slot colours as a mark (as in Refined). Users do not read a logo as an indicator, so the risk is low, but it is the one place where slot colours appear without numbers.

The most fragile rule is the scenario/view split. It is meaningful (yellow changes what you see, ink changes how you see it) but it must hold in every future control. A wrong yellow toggle breaks it.

## 5. Does the extra vividness hurt legibility?

Not on the screens drawn. Checks carried out:

- Text never sits in a vehicle colour; values in tables and cards are ink on white or page.
- Yellow surfaces always carry ink text (≥ 12:1) or are pale tints behind ink text (≥ 16:1).
- In the comparison, colour stays in the header and in the "Altre differenze" badges; rows keep 40 px height, hairlines and the provenance column. With four vehicles there would be four badges and four header rules, not four coloured columns.
- In the charging chart, the curves (Cobalto, Mandarino) and the yellow interval are different forms (lines vs a pale band and an axis bar); the station limit is ink. Curve colours cannot be confused with interface states because no interface state uses a vehicle colour.
- Discovery's criteria column gains six thin yellow tabs; at reading distance it is the busiest area of the concept, still lighter than Expressive's.

Residual risks: Smeraldo's line contrast on the page (3.0:1) outside white cards, and the pale yellow band and table row (only a slight tint difference, but the information is also in the yellow axis bar and in text).

## 6. Points left open at selection

Listed as they stood when the comparison was written. Their current classification (provisional decision or future work) is in [Decision status](livrea-consolidated/README.md#decision-status).

1. **Yellow intensity**: B is applied; A is drawn in the identity sheet as a fallback. To be judged on more screens and in use.
2. **Link style**: underlined ink versus a dedicated link colour (which would have to avoid every vehicle hue).
3. **Logo**: keep the four slot colours, or move to ink plus yellow so that slot colours appear only with numbers.
4. **Landing personality** once real photography is sourced; without photos it is still the quietest screen.
5. **Single-vehicle analysis, mobile, dark theme**: not drawn in this iteration.
6. **Order versus colour** after removals, and a fifth vehicle (both open since iteration 1, see [`ux-notes.md`](ux-notes.md)).
