# Vehicle comparison — wireframes

Low-fidelity desktop wireframes (1440 px, grayscale) for comparing two or more vehicles. Pink numbered circles and the "NON IMPLEMENTATO" marker are review annotations, not UI.

| File | Scenario |
| --- | --- |
| [`Comparison — Selected Vehicles.svg`](Comparison%20—%20Selected%20Vehicles.svg) | Comparison built while exploring: Nordis E4 and Aurora Vela, search criteria kept |
| [`Comparison — No Criteria.svg`](Comparison%20—%20No%20Criteria.svg) | Same two vehicles, no criteria: neutral comparison |
| [`Comparison — Empty State.svg`](Comparison%20—%20Empty%20State.svg) | Direct access from navigation or landing, no vehicles selected |
| [`Comparison — Technical Exploration.svg`](Comparison%20—%20Technical%20Exploration.svg) | Charging compared under shared conditions |
| [`Comparison — Four Vehicles Check.svg`](Comparison%20—%20Four%20Vehicles%20Check.svg) | Layout check with four vehicles (header and first rows only) |

## Architecture

**Needs first, categories second.** Vehicles are columns under a sticky header. When the user has criteria, the first section shows how each vehicle meets them (requirements, then preferences). The next section shows the other differences that matter most. Detailed categories follow, collapsed, with identical characteristics hidden by default ("Solo differenze"). Simulations open in a dedicated view.

Alternatives considered:

- **Feature-oriented table** (categories from the start, differences highlighted). Complete and familiar, but it starts from specifications and leaves the user to work out which differences matter. It survives as the "Dettagli" section.
- **Difference lens first** (Concept C chart as the main view). Good for trade-offs, weak for reading exact values. It is kept as the optional "Grafico" view (not drawn).

## Scenarios

**A — Selected vehicles.** The context bar returns to the search and edits criteria. Criteria rows show the actual value and a fit marker per vehicle. The add slot suggests vehicles from the current results.

**A2 — No criteria.** The criteria section is absent and nothing is judged. "Caratteristiche principali" lists the main values neutrally, each with its source. "+ Aggiungi criteri" opens the search criteria. The add slot suggests recently viewed vehicles.

**B — Empty state.** The empty slots are the search. Frequent comparisons offer a one-click start. Empty rows show what will be compared.

**C — Technical exploration.** Shared conditions (charging type, station power, SoC range, termination) apply to both vehicles. Each result shows time, stored energy, average power and the limiting factor. There are two charts (power by SoC, energy over time) and the same interval repeated at 50, 150 and 350 kW.

## Main decisions

- **No winner, no aggregate score.** Differences are stated as values. Vehicles appear in selection order.
- **No personalised assessment without criteria** (A2, B).
- **Source of every non-obvious value.** Tags in a fixed column at the edge of the label column: `costruttore` (manufacturer data), `stima` (EV Compare estimate, future models), `calcolo` (M0.1 charging engine).
- **Numbers.** Engine results carry no "~": times are rounded to the minute, energy to 0.1 kWh. "~" marks estimates only (range, consumption, trip stops).
- **Peak DC power is a technical value, not charging speed.** It appears as "Potenza DC massima". Charging is compared by time *and* stored energy for a stated scenario.
- **Trip stops and charging times are different quantities.** "1 sosta di ~22 min" (`stima`, future trip model) never shares a row with "Ricarica 10→80%, colonnina 150 kW" (`calcolo`).
- **AC scenarios state the station.** "Wallbox 11 kW trifase". On a single-phase 7.4 kW station the engine models 3.67 kW for these three-phase vehicles, so the phases change the result.
- **Comparable simulations only.** Both vehicles always share station, SoC range and termination condition.
- **Opening a vehicle keeps the comparison.** "Apri scheda" opens Vehicle Analysis with "‹ Confronto" in its context bar (see [`../vehicle-analysis-iteration-1/`](../vehicle-analysis-iteration-1/README.md)).

## Four vehicles at 1440 px

Checked in `Comparison — Four Vehicles Check.svg`. The label column shrinks to 328 px and each vehicle column to 232 px. No horizontal scrolling is needed.

What changes from three vehicles up:

- "Sostituisci" and "Rimuovi" move into a "⋯" menu. "Apri scheda" stays visible.
- The add slot disappears from the header. "+ Aggiungi un veicolo" moves to the left column.
- Notes such as "10 L sopra il minimo" move under the value.

Still to verify:

- **Charts with four series.** Line styles alone are not enough. They need direct labels or selectable series.
- **Missing data.** A vehicle without a DC curve shows "—" and "curva non disponibile"; the charging chart should leave it out explicitly.
- **Five or more vehicles** would need horizontal scrolling with a fixed label column. No product limit is set yet.

The two-vehicle layout is unchanged.

## Charging data (illustrative)

DC curves (SoC %, kW). The table values were verified with `simulateChargingSession` from the M0.1 engine.

| Vehicle | Usable capacity | Curve points | 10→80% at 150 kW | Energy | 20 min from 10% |
| --- | --- | --- | --- | --- | --- |
| Nordis E4 | 77 kWh | 0/140, 10/165, 55/175, 65/155, 80/110, 90/70, 100/35 | 22 min (22.2) | 53.9 kWh | 49.5 kWh, 74% |
| Aurora Vela | 58 kWh | 0/100, 10/120, 25/135, 40/120, 60/80, 80/40, 90/30, 100/20 | 27 min (27.3) | 40.6 kWh | 34.5 kWh, 70% |

10→80% at other stations: Nordis E4 65 min at 50 kW and 20 min at 350 kW; Aurora Vela 49 min at 50 kW and 27 min at 350 kW (vehicle-limited).

AC 20→100%, 11 kW three-phase on both sides: Nordis E4 5 h 36, Aurora Vela 4 h 13.

## Not implemented yet

- Trip simulation (marked) and trip stops in the preferences.
- Range and consumption figures: static estimates.
- "Grafico" view, frequent comparisons (they need usage data), the AC state of the simulator.

## Open trade-offs

- **Repetition.** Charging appears in "Altre differenze" and in "Dettagli". The rule should be that "Dettagli" hides what the sections above already show.
- **Tag vocabulary.** It is unclear whether `stima` and `calcolo` read as different to users.
- **Margins** such as "10 L sopra il minimo" help with borderline requirements but could become noise if shown everywhere.

## Resolved in this iteration

- Peak DC power is no longer translated into a charging duration in the search criterion editor.
- Trip stop versus 10→80% charging time: separate labels and sources everywhere.
- Home charging 5 h 36 aligned in Vehicle Analysis, with the station's phases stated.
- "Prova a portare il livello al 100%" removed from Vehicle Analysis.
- The comparison without criteria, Vehicle Analysis opened from a comparison, and the four-vehicle layout are now represented.
