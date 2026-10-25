# Vehicle comparison — wireframes

Low-fidelity desktop wireframes (1440 px, grayscale) for comparing two or more vehicles. Pink numbered circles and the "NON IMPLEMENTATO" marker are review annotations, not UI.

| File | Scenario |
| --- | --- |
| [`Comparison — Selected Vehicles.svg`](Comparison%20—%20Selected%20Vehicles.svg) | Comparison built while exploring: Nordis E4 and Aurora Vela, search criteria kept |
| [`Comparison — Empty State.svg`](Comparison%20—%20Empty%20State.svg) | Direct access from navigation or landing, no vehicles selected |
| [`Comparison — Technical Exploration.svg`](Comparison%20—%20Technical%20Exploration.svg) | Charging compared under shared conditions |

## Architecture

**Needs first, categories second.** Vehicles are columns under a sticky header. When the user has criteria, the first section shows how each vehicle meets them (requirements, then preferences). The next section shows the other differences that matter most. Detailed categories follow, collapsed, with identical characteristics hidden by default ("Solo differenze"). Simulations open in a dedicated view.

Alternatives considered:

- **Feature-oriented table** (categories from the start, differences highlighted). Complete and familiar, but it starts from specifications and leaves the user to work out which differences matter. It survives here as the "Dettagli" section.
- **Difference lens first** (Concept C chart as the main view). Good for spotting trade-offs, weak for reading exact values and for people who don't read charts. It is kept as the optional "Grafico" view (not drawn).

## Scenarios

**A — Selected vehicles.** The context bar returns to the search and edits criteria. The vehicle header shows identity, price, "Apri scheda", "Sostituisci" and "Rimuovi". The add slot searches models and suggests vehicles from the current results. Criteria rows show the actual value and a fit marker per vehicle. Simulations are listed at the end. The trip simulation is shown but not implemented.

**B — Empty state.** The empty slots are the search. Typing in a slot suggests models (add directly) and brands. Frequent comparisons offer a one-click start. Empty rows show what will be compared, without explanatory copy.

**C — Technical exploration.** Shared conditions (charging type, station power, SoC range, termination) apply to both vehicles. Each result shows time, stored energy, average power and the limiting factor. Two charts: power by SoC, and energy over time, which supports equal-time comparison. A table repeats the comparison at 50, 150 and 350 kW. Assumptions are stated once.

## Main decisions

- **No winner, no aggregate score.** Differences are stated as values. The order of vehicles is the order of selection.
- **No personalised assessment without criteria.** Without criteria, the criteria section disappears and the comparison is neutral (scenario B).
- **Source of every non-obvious value.** Tags distinguish `costruttore` (manufacturer data), `stima` (EV Compare estimate) and `calcolo` (computed by the charging simulator).
- **Peak DC power is not charging speed.** Peak power appears only next to the requirement that uses it ("potenza massima"). Charging is compared by time *and* stored energy: Nordis E4 takes ~22 min for +53.9 kWh, Aurora Vela ~27 min for +40.6 kWh. At 50 kW, Aurora Vela reaches 80% sooner (~49 vs ~65 min) but stores less energy.
- **Comparable simulations only.** Both vehicles always share station, SoC range and termination condition. Each result names what limits it: the station or the vehicle curve.
- **Simulator reused from Vehicle Analysis.** Same controls and same assumptions line, adapted to two series.

## Charging data (illustrative)

DC curves (SoC %, kW), 150 kW station, 10→80%, computed with the M0.1 formulas (midpoint integration, no losses):

| Vehicle | Usable capacity | Curve points | 10→80% | Energy | After 20 min |
| --- | --- | --- | --- | --- | --- |
| Nordis E4 | 77 kWh | 0/140, 10/165, 55/175, 65/155, 80/110, 90/70, 100/35 | ~22 min | 53.9 kWh | ~50 kWh (~75%) |
| Aurora Vela | 58 kWh | 0/100, 10/120, 25/135, 40/120, 60/80, 80/40, 90/30, 100/20 | ~27 min | 40.6 kWh | ~35 kWh (~70%) |

AC at home (11 kW, three-phase on both sides, 20→100%): Nordis E4 5 h 36, Aurora Vela 4 h 13.

## Not implemented yet

- Trip simulation (marked in scenario A).
- Range and consumption figures: static estimates, there is no range engine.
- Trip stops in the preferences (~22 / ~28 min): estimates from a future trip model, not from the charging simulator.
- "Grafico" view, frequent comparisons (they need usage data), the AC state of the simulator.

## Open trade-offs

- **Repetition.** Charging appears in the criteria (peak power), in "Altre differenze" (time and energy) and in "Dettagli". Each vehicle needs one canonical place per metric.
- **Two different stop times.** The trip stop (~28 min for Aurora Vela) and the simulated 10→80% time (~27 min) measure different things. They will confuse users unless labelled consistently.
- **More than two vehicles.** Four columns at 1440 px leave about 250 px per vehicle. Charts with four series need testing.
- **Tag vocabulary.** It is unclear whether `stima` and `calcolo` read as different to users.
- **Margins** such as "10 L sopra il minimo" help with borderline requirements but could become noise if shown everywhere.

## Relations with search and Vehicle Analysis

- Selection and criteria come from the search. "Modifica criteri" returns there without losing the vehicles.
- "Apri scheda" opens Vehicle Analysis. Its context bar should offer "‹ Confronto" when opened from here, in addition to "‹ Risultati".
- The simulator in scenario C is the Vehicle Analysis simulator with two series.

Earlier wireframes that need revision:

- **Vehicle Analysis.** "Ricarica a casa ~5 h 40" should read 5 h 36, as computed.
- **Vehicle Analysis.** The curve explanation ends with "Prova a portare il livello al 100%", which conflicts with principle 9.
- **Search, criterion editor.** It equates peak DC power with a 10→80% duration ("≈ sosta 10→80% di 20–35 min"), which conflicts with principle 8.
- **Search result cards.** They label the trip stop and the charging time in similar ways.
