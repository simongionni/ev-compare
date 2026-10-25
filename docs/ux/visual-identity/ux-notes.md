# UX notes from the visual identity exploration

The concepts keep the information architecture, content and flows of the consolidated wireframes. This page lists the presentation choices that go slightly beyond restyling, and the UX questions the exploration raised. None of them changes the baseline wireframes; each needs a decision before it is adopted.

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
