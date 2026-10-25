# Notturno

_A night instrument panel: what matters now is lit._

![Landing](01-landing.svg)

| Screen                              | File                                     |
| ----------------------------------- | ---------------------------------------- |
| Identity sheet                      | [`00-identity.svg`](00-identity.svg)     |
| Landing Page                        | [`01-landing.svg`](01-landing.svg)       |
| Vehicle Discovery — Active Criteria | [`02-discovery.svg`](02-discovery.svg)   |
| Comparison — Selected Vehicles      | [`03-comparison.svg`](03-comparison.svg) |
| DC charging curves                  | [`04-charging.svg`](04-charging.svg)     |

## Core idea and rationale

Some cars have a night mode for the instrument cluster that dims everything except what the driver needs now. Notturno uses that idea as a hierarchy rule: brightness follows relevance. Primary values are bright, secondary text is mid, notes and axes are low; amber, the classic instrument light, marks only focus, the active state and the primary action. Progressive disclosure becomes a matter of lighting rather than hiding.

It is the most automotive of the three, through cabin atmosphere and studio photography rather than speed lines or neon. It avoids the "futuristic" stereotype by staying warm (graphite, not blue-black) and by using a single amber accent instead of glows.

## Palette and semantic roles

| Token      | Hex                   | Role                                                                            |
| ---------- | --------------------- | ------------------------------------------------------------------------------- |
| Notte      | `#141412`             | Page background                                                                 |
| Pannello   | `#1C1B18`             | Panels, cards                                                                   |
| Pannello 2 | `#24221F`             | Inputs, highlighted rows, open editor                                           |
| Filo       | `#36332E` / `#4A4640` | Dividers / control borders                                                      |
| Luce       | `#EDE9E1`             | Primary text and values (14.2:1 on panel)                                       |
| Luce media | `#B5AFA4`             | Secondary text (8.5:1 on background)                                            |
| Luce bassa | `#8E887D`             | Notes, axes (5.2:1 on background, 4.5:1 on Pannello 2)                          |
| Ambra      | `#F2B24C`             | Focus ring, active segment and nav dot, primary buttons, links (9.2:1 on panel) |

Chart series (dark surface): 1 `#C4841E` amber, 2 `#3A8EDB` blue, 3 `#C45FA0` magenta, 4 `#2C9A6A` green. They pass the CVD validator on all pairs; magenta ↔ green is in the 6–8 ΔE band and needs the direct labels that every chart here has. Series 1 is a deeper amber than the UI accent so that a line is never mistaken for a focus state.

## Typography and hierarchy

- **Barlow** (400–600) for headings, body and labels: a grotesk with roots in road signage and instrument lettering.
- **Barlow Semi Condensed** for figures and small-caps labels: compact numbers that fit instrument-like readouts ("22 min", "+53,9 kWh").

The fallback Bahnschrift (DIN, preinstalled on Windows) keeps the character closely; Segoe UI / Arial elsewhere.

## Composition

- Rounded panels (10–14 px) floating on the night background, like modules of a cluster. Fewer rules; panels and brightness separate content.
- The criteria column is a single panel; result cards put the photograph first.
- Table rows are separated by faint lines; hover lights a row (shown on "Bagagliaio" in the comparison) with Pannello 2 and an amber edge.

## Components

- **Criteria:** requirement = solid control border; preference = dashed; the open criterion has an amber ring and an amber active range on the slider.
- **Segmented controls:** the active option is a raised segment with a short amber underline, like a lit tell-tale.
- **Fit summary:** a segment bar on each card (three requirement segments, then two preference segments) beside a text "5 di 5"; near matches show the unlit segment. The full list stays below; the bar is a glanceable summary.
- **Buttons:** primary amber with dark text; secondary dark with a border; links in amber.
- **Provenance tags:** small caps: `COSTRUTTORE` on a filled chip, `STIMA` dashed, `CALCOLO` outlined.
- **Charging result:** a ten-segment bar shows the charged interval (10→80 %) under the time.

## Vehicle representation

Low-key studio photography: dark bodywork against a spot-lit backdrop, a rim light along the roofline, a soft floor shadow. In these SVGs the photographs are placeholders drawn with gradients (the only place gradients are used, to simulate light). Real images would need a consistent brief: same angle (side or three-quarter), same lighting, neutral dark backdrop, cut-outs per model.

## Technical visualisation

- Dark plots with a faint grid; 2.5 px lines in series colours, each with a direct label next to a short colour swatch (text stays in text colours).
- The region above the station's power is an unlit band labelled "oltre la potenza della colonnina"; Nordis E4's curve inside it is faded and dashed.
- The charged interval is an amber bar under the SoC axis.
- **Hover as part of the design:** the energy chart is shown in its hover state at 20 minutes, with a crosshair, ringed points and a tooltip listing both vehicles' values from the engine.
- The 150 kW row of the stations table is lit like a selected row.

## Motion and interaction

Light, not movement: elements fade between brightness levels (150–200 ms). Focus brings a control from mid to full brightness and adds the amber ring. Changing station power in the simulation could "sweep" the charged segments from left to right once (300 ms) to tie the result to the interval. Photographs never move. Reduced-motion users get instant state changes.

## Strengths

- Strongest automotive presence and atmosphere; photography makes the cars the protagonists, balancing data and vehicles.
- Brightness as hierarchy works well for focus, hover and active states on dense screens.
- Charts read very clearly on dark backgrounds.
- The single accent keeps it disciplined.

## Limits and risks

- Depends on consistent, high-quality photography that does not exist yet; without it the concept collapses into generic dark UI.
- Dark only. A light variant is necessary for daylight use and many users' preferences, and would change the character substantially.
- Lower contrast for tertiary text (4.5–5.2:1) is at the AA floor; long technical reading in dark mode is tiring for some readers.
- Risk of drifting towards the "luxury configurator" look and away from neutral, buyer-first information.
- The segment bar can be read as a score if used beyond a count of satisfied criteria (see [`../ux-notes.md`](../ux-notes.md)).

## Implementation considerations

- Two OFL families, self-hostable; Bahnschrift as a good system fallback.
- A dark-first token set needs a full light counterpart from the start, not later.
- Photography pipeline: sourcing, licensing, cut-outs and a fallback for vehicles without images (the silhouette placeholder used here).
- Gradients and photography increase page weight; images need responsive sizes.
- Hover-driven chart reading needs keyboard and touch equivalents (focusable points, tap to pin the crosshair).
