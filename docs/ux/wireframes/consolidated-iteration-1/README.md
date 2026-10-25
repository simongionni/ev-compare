# Consolidated UX — Iteration 1

Low-fidelity desktop wireframes (1440 px, grayscale) for entry and search. Pink numbered circles are review annotations.

| File | Scenario |
| --- | --- |
| [`Landing Page.svg`](Landing%20Page.svg) | Entry: search a known model or start from needs |
| [`Vehicle Discovery — Initial State.svg`](Vehicle%20Discovery%20—%20Initial%20State.svg) | Search without criteria: neutral results in price order |
| [`Vehicle Discovery — Active Criteria.svg`](Vehicle%20Discovery%20—%20Active%20Criteria.svg) | Search with six criteria: requirements, preferences, near matches, comparison selection |

## Criteria model

- **Requirements exclude, preferences order.** Each criterion has a sensible default behaviour, which the user can change in its editor.
- **Technical and practical criteria are distinct.** "Potenza DC massima" is a technical filter on the manufacturer's peak power. A charging time is a separate practical criterion, "Tempo di ricarica 10→80%" on a stated station (150 kW), evaluated with the vehicle's charging curve. The technical editor offers the practical criterion as a linked criterion to add; it never converts one into the other.
- **Trip stops are estimates from a future trip model** ("1 sosta di ~22 min", tagged `stima`). They are not charging times.
- **Home charging names the station**, for example "a casa, wallbox 11 kW trifase", because the result depends on power and phases.

## Notes

- The Figma file "EV Compare — UX Wireframes — Vehicle Discovery" still has the earlier text of these screens. These SVGs are the current version.
- Related wireframes: [Vehicle Analysis](../vehicle-analysis-iteration-1/README.md), [comparison](../vehicle-comparison/README.md).
