# UX notes from the visual identity exploration

The concepts keep the information architecture, content and flows of the consolidated wireframes. This page lists the presentation choices that go slightly beyond restyling, and the UX questions the exploration raised. None of them changes the baseline wireframes; each needs a decision before it is adopted. With the selection of Livrea Consolidated, the iteration 3 additions below are part of its screens; the questions still open are classified in [Decision status](livrea-consolidated/README.md#decision-status).

## Presentation additions in the concepts

| Concept  | Where                            | Addition                                                   | Note                                                                                                                                                            |
| -------- | -------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tavola   | Landing                          | Side elevation of Nordis E4 with three manufacturer values | Illustration only; uses existing data. If kept, the vehicle should be neutral (not implying a recommendation) or rotate.                                        |
| Tavola   | Comparison, "Altre differenze"   | Scale from zero with both values per row                   | Visualises existing values. Must never imply that more is better.                                                                                               |
| Tavola   | Charging chart                   | Markers on manufacturer curve points                       | Makes interpolation visible; adds a one-line key.                                                                                                               |
| Livrea   | Discovery tray                   | Empty slots 3 and 4                                        | Shows the four-vehicle capacity already stated on the landing.                                                                                                  |
| Livrea   | Landing, "Confronta veicoli"     | Four slot tabs                                             | Same information as "Fino a 4 modelli".                                                                                                                         |
| Livrea   | Comparison, "Altre differenze"   | Bars from zero in livery colours                           | As for Tavola's scale; bars are more easily read as scores.                                                                                                     |
| Notturno | Discovery cards and near matches | Segment bar "5 di 5"                                       | Counts satisfied criteria (requirements, then preferences). A count, not a score; must not become an aggregate ranking, which the comparison decisions exclude. |
| Notturno | Charging results                 | Ten-segment bar of the charged interval                    | Restates 10→80 %.                                                                                                                                               |
| Notturno | Comparison                       | Row highlight state on "Bagagliaio"                        | Hover state, drawn to show the interaction.                                                                                                                     |
| Notturno | Energy chart                     | Tooltip at 20 minutes                                      | Hover state; values are the engine's 20-minute results already in the wireframe.                                                                                |
| All      | Landing                          | Vehicle imagery in the hero                                | The wireframe has none.                                                                                                                                         |

## Questions raised

1. **Colour assignment in Livrea.** If adopted, the rule must be: a vehicle keeps its colour while it stays in the comparison; removing one frees its colour without repainting the others; a newly added vehicle takes the lowest free slot. The comparison wireframe states "vehicles appear in selection order", which this rule respects, but the order and the colour can diverge after removals. Five or more vehicles (open in the four-vehicle check) would have no colour.
2. **Series encoding with four vehicles.** The comparison README notes that line styles alone are not enough for four series. Each concept pairs colour or line style with direct labels; Tavola's achromatic first series also relies on darkness. To verify with real four-vehicle charts.
3. **Hover-dependent reading** (Notturno, and the chart interactions described for all three) needs keyboard and touch equivalents.
4. **Vehicle images.** All concepts assume an image per vehicle (drawing, silhouette or photo). The data source has none; a fallback is required in any direction.
5. **Theme.** No wireframe defines light or dark. Notturno is dark-only; Tavola and Livrea are light-only. The choice affects the token model of the first slice.

## Iteration 2 (Livrea Refined, Livrea Expressive)

Presentation choices beyond restyling:

| Concept    | Where                           | Addition                                               | Note                                                                                                            |
| ---------- | ------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Both       | Cards, headers, search, landing | Vehicle photographs (placeholders)                     | The wireframes have image placeholders; the size and placement are new. See [`photography.md`](photography.md). |
| Both       | Charging chart                  | Hatched region above the station's power, curve points | Same data; makes "limitata dalla colonnina" and the interpolation visible.                                      |
| Both       | Nav                             | Comparison count shown with the vehicles' marks        | Same count as the wireframe badge.                                                                              |
| Refined    | Comparison, "Altre differenze"  | Zero-based scale with numbered badges                  | As Tavola's scale; not a ranking.                                                                               |
| Refined    | Energy chart                    | Hover tooltip at 20 minutes                            | Interaction state; engine values already in the wireframe.                                                      |
| Expressive | Comparison, "Altre differenze"  | Livery bars from zero ending with stripes              | Bars can be read as scores; see iteration 1 note.                                                               |
| Expressive | Comparison context bar, notice  | Yellow wash for the user's criteria and their effect   | Colour only; no new content.                                                                                    |
| Expressive | Criteria column                 | Count "6" on a yellow plate next to "Criteri attivi"   | Same information as "Criteri attivi (6)".                                                                       |

Questions answered in the variants (see their READMEs, "Vehicle identity"):

1. **Colour assignment.** Both variants use the rule proposed in iteration 1: lowest free slot, stable colours, no repainting. The identity sheets show an add/remove sequence.
2. **Non-colour encoding.** Refined: number + marker shape. Expressive: stripe count + marker shape.
3. **Colour for states.** Both variants separate interface or settings colours, vehicle colours and signal colours.

Still open:

- Order versus colour: after a removal, slot numbers no longer match selection order. The wireframe says vehicles appear in selection order; whether columns follow slot or selection order needs a decision.
- A fifth vehicle (if ever allowed) has no colour in either variant.
- Single-vehicle analysis is described, not drawn.

## Iteration 3 (Livrea Consolidated)

Presentation choices beyond restyling:

| Where                            | Addition                                             | Note                                                              |
| -------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------- |
| Landing                          | Second, narrower photo frame                         | Composition only; placeholder.                                    |
| Discovery, criteria column       | Count "6" on a yellow plate next to "Criteri attivi" | Same information as "Criteri attivi (6)" (as in Expressive).      |
| Comparison context bar           | "6 criteri" on a yellow plate                        | Same text as the wireframe summary, split into plate and outcome. |
| Comparison, "Con i tuoi criteri" | Yellow tab beside the heading                        | Colour only.                                                      |
| Charging, "Con altre colonnine"  | Chosen station row in pale yellow                    | Same highlight as before, now in the scenario colour.             |
| Links                            | Underline for text links without an arrow            | Consequence of ink actions; to validate.                          |

Question raised: whether every control can be classified unambiguously as a scenario parameter (yellow) or a view choice (ink). Charge type and end-of-charging condition are treated as scenario parameters because they change the results.
