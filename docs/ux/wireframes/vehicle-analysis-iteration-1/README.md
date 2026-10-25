# Vehicle Analysis — wireframes

Low-fidelity desktop wireframes (1440 px, grayscale) for analysing a single vehicle (Nordis E4). Pink numbered circles are review annotations.

| File | Scenario |
| --- | --- |
| [`Vehicle Analysis — From Search.svg`](Vehicle%20Analysis%20—%20From%20Search.svg) | Full page, opened from search results with criteria |
| [`Vehicle Analysis — Direct Access.svg`](Vehicle%20Analysis%20—%20Direct%20Access.svg) | Top of the page, opened directly (no criteria) |
| [`Vehicle Analysis — From Comparison.svg`](Vehicle%20Analysis%20—%20From%20Comparison.svg) | Top of the page, opened from a comparison |

The page is organised by practical questions (range, charging, space), with the charging simulator inside the "Ricarica" section and the full specification sheet on request.

## Where the user came from

Only the context bar changes. The rest of the page is the same.

| Origin | Context bar | Fit with criteria |
| --- | --- | --- |
| Search | "‹ Risultati", criteria summary, position in the results, next result | Shown |
| Direct access | "‹ Cerca" | Not shown; "Verifica con le tue esigenze" instead |
| Comparison | "‹ Confronto", compared vehicles, position, next compared vehicle | Shown only if the comparison has criteria |

The context bar reflects the most recent origin. Returning restores the selection, criteria and scroll position of that screen. "Nel confronto" works the same in all three cases.

## Values

- **Calculated by the M0.1 engine, without "~".** DC 10→80% on a 150 kW station: 22 min, +53.9 kWh. Station options: 65 / 22 / 20 min at 50 / 150 / 350 kW. AC 20→100% on an 11 kW three-phase wallbox: 5 h 36.
- **Estimates, with "~" or "stima".** Range by scenario, consumption, kilometres added (≈ 265 km at 20.3 kWh/100 km), trip stops in the criteria panel.
- **Manufacturer data (illustrative).** WLTP, capacities, maximum AC and DC power, dimensions.

Trip stops ("1 sosta di ~22 min") come from a future trip model. They are a different quantity from the simulated 10→80% charge, even when the minutes coincide.

## Not implemented yet

Range engine ("Simula un percorso"), the AC state of the simulator, the effect of switching version.
