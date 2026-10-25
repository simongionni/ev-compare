# Livrea Consolidated

_Iteration 3. One synthesis of Livrea Refined and Livrea Expressive. **The selected visual identity of EV Compare** and the baseline for frontend implementation._

![Landing](01-landing.svg)

| Screen                              | File                                     |
| ----------------------------------- | ---------------------------------------- |
| Identity sheet                      | [`00-identity.svg`](00-identity.svg)     |
| Landing Page                        | [`01-landing.svg`](01-landing.svg)       |
| Vehicle Discovery — Active Criteria | [`02-discovery.svg`](02-discovery.svg)   |
| Comparison — Selected Vehicles      | [`03-comparison.svg`](03-comparison.svg) |
| DC charging curves                  | [`04-charging.svg`](04-charging.svg)     |

## Decision status

Selected on 2026-10-25. This closes the visual identity exploration of M0.2; the five earlier concepts are history, not alternatives. Rationale: [`../livrea-consolidation.md`](../livrea-consolidation.md). The consolidated UX wireframes remain the baseline for content, structure and flows; this concept defines how they look.

### Consolidated

Approved. The baseline for the frontend. Details are in the sections of this page.

| Area                                  | Decision                                                                                                                                                                                                                                          | Details                                                                                                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Colour system                         | Four families (interface, your scenario, vehicles, signals) with the tokens listed; a colour from one family never does another family's job.                                                                                                     | [Colour system](#colour-system)                                                                                                                                       |
| Typography                            | Schibsted Grotesk as the only family, with the hierarchy of the screens; tabular figures only on chart axes and in the stations table.                                                                                                            | [Typography](#typography)                                                                                                                                             |
| Visual hierarchy                      | Light page, white cards with hairline borders, ink text and headings; colour only in small marks, never in columns or large areas.                                                                                                                | [Kept from Refined](#kept-from-refined), [Screens](#screens)                                                                                                          |
| Components                            | Pill buttons and fields, 12–18 px radii, hairline tables with the provenance column; actions, navigation and view toggles in ink; yellow tabs and plates for scenario values.                                                                     | [Kept from Refined](#kept-from-refined), [Taken from Expressive](#taken-from-expressive)                                                                              |
| Technical visualisations              | Manufacturer curve points with stated linear interpolation, hatched region above the station's power, dotted unreachable curve, station limit as an ink dashed line, charging interval on the axis, direct labels with badges, zero-based scales. | [Kept from Refined](#kept-from-refined), [Screens](#screens)                                                                                                          |
| Vehicle representation                | Slot colour always with its number or marker shape; lowest free slot, no repainting; vehicles outside the comparison neutral; real photographs of the correct model, labelled placeholders until then.                                            | [Colour system](#colour-system), [Refined's vehicle identity rules](../livrea-refined/README.md#vehicle-identity-section-5-of-the-brief), [Photography](#photography) |
| Yellow                                | Marks the parameters of the user's scenario and their effect; how results are viewed, navigation and actions stay ink. Yellow always comes with ink.                                                                                              | [Yellow](#yellow)                                                                                                                                                     |
| Interface, vehicle and signal colours | Kept apart: no interface state uses a vehicle colour; signals always carry an icon and words; attention has no tint, so it cannot be read as yellow.                                                                                              | [Colour system](#colour-system)                                                                                                                                       |

### Provisional

Start from what is drawn; verify during implementation. None of these blocks the first vertical slice.

| Topic                             | Starting point                                                                      | To verify                                                                                        |
| --------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Yellow intensity                  | Variant B, as applied to the screens.                                               | Whether B is too insistent in use and over longer sessions; A (same components) is the fallback. |
| Link style                        | Ink, weight 600, an arrow or chevron when the copy has one, an underline otherwise. | Against a dedicated link colour, which would have to avoid every vehicle hue.                    |
| Logo                              | The four slot colours, as drawn (the documented exception to the colour rules).     | Keep it, or move to ink plus yellow so that slot colours appear only with numbers.               |
| Minimum size of colour indicators | The sizes drawn at 1440 px: 4 px rules, badges, tabs, marker shapes.                | Minimum sizes at which they stay recognisable.                                                   |
| Behaviour at other screen sizes   | The 1440 px layouts.                                                                | How they adapt to the screen widths the first slice supports.                                    |

### Future work

Not designed or resolved yet. Not requirements for the first vertical slice.

- **Screens not drawn in the exploration**, in particular Vehicle Analysis (wireframes in [`../../wireframes/vehicle-analysis-iteration-1/`](../../wireframes/vehicle-analysis-iteration-1/README.md)): extend the language with the rules above.
- **Responsive and mobile design.**
- **Dark mode**, if any. Only a light theme exists.
- **Sourcing and management of authentic vehicle photographs**: see [`../photography.md`](../photography.md). The landing's personality is to be judged again once real photos exist.
- **Accessibility verification in the working interface**, including the risks already known: Smeraldo at 3.0:1 for thin lines outside white cards, Mandarino next to Critico, the pale yellow tints, keyboard and touch equivalents for hover readings, and whether the scenario/view distinction is perceived without explanation (if it needs explaining, the rule is wrong).
- **Comparisons with many vehicles**: a fifth vehicle has no colour; column order versus slot numbers after removals is open (see [`../ux-notes.md`](../ux-notes.md)).

### Artefacts for implementation

| Need                                                                             | Artefact                                                                                                                                                               |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Palette, colour rules, type, components, vehicle marks, chart series, yellow A/B | [`00-identity.svg`](00-identity.svg)                                                                                                                                   |
| Applied screens                                                                  | [`01-landing.svg`](01-landing.svg), [`02-discovery.svg`](02-discovery.svg), [`03-comparison.svg`](03-comparison.svg), [`04-charging.svg`](04-charging.svg)             |
| Exact values (colours, sizes, radii, positions)                                  | [`../_source/livrea-consolidated.mjs`](../_source/livrea-consolidated.mjs); each SVG also names its colours in a `<style>` block                                       |
| Font files and licence                                                           | [`../fonts/`](../fonts/README.md) (Schibsted Grotesk, SIL OFL)                                                                                                         |
| Content, structure and flows                                                     | The consolidated wireframes in [`../../wireframes/`](../../wireframes/); scenario copy and data in [`../_source/content.mjs`](../_source/content.mjs) are illustrative |
| Photography requirements and image metadata                                      | [`../photography.md`](../photography.md)                                                                                                                               |
| Browsing and side-by-side comparison                                             | [`../review.html#concept/livrea-consolidated`](../review.html#concept/livrea-consolidated)                                                                             |

The SVGs are design references, not production assets; the review annotations in pink ("NON IMPLEMENTATO") are not UI.

## Goal of the synthesis

Keep what made [Livrea Refined](../livrea-refined/README.md) preferred (lightness, Schibsted Grotesk, clean surfaces, components, legible dense screens, tables, balanced composition) and add what made [Livrea Expressive](../livrea-expressive/README.md) preferred (a livelier palette with cobalt, yellow as part of the identity, more colour character). Expressive's colours were not dropped onto Refined's components: the two palettes served different semantic systems, so the colour roles were redesigned for Refined's structure.

Generator: [`../_source/livrea-consolidated.mjs`](../_source/livrea-consolidated.mjs), built from the Refined module. Same content, scenarios and data as all previous concepts ([`../_source/content.mjs`](../_source/content.mjs)).

## Kept from Refined

- Layout and coordinates of all four screens, so the side-by-side comparison in the review page lines up.
- Light page `#FAF8F4`, white cards with hairline borders, 12–18 px radii, pill buttons and fields.
- Schibsted Grotesk as the only family, same hierarchy.
- Hairline comparison table, values in one column per vehicle, provenance column (■ `costruttore`, ○ `stima`, ◆ `calcolo`), the zero-based scale in "Altre differenze".
- Numbered vehicle badges and the four marker shapes (circle, square, triangle, diamond) as the non-colour identity.
- Charts: manufacturer curve points with stated linear interpolation, hatched region above the station's power, dotted unreachable part of the curve, hover state at 20 minutes.

## Taken from Expressive

- The vehicle palette, unchanged: 1 Cobalto `#2548E0`, 2 Mandarino `#E8601C`, 3 Smeraldo `#11A37A`, 4 Magenta `#B8338E`.
- Signal yellow `#FFD23F` and its tint `#FFF4C7`, with a narrower meaning (below).
- Ink as the action colour: near-black buttons and active states instead of a coloured interface accent.
- Yellow tabs on active criteria, the yellow plate as a container for a user-set value, the station plate on the chart.
- A staggered second frame in the landing photography, at Refined's scale.

## Colour system

Four families. A colour from one family never does another family's job.

| Family        | Tokens                                                                                        | Job                                                                                                     |
| ------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Interface     | Inchiostro `#17171B`, Pagina `#FAF8F4`, Bianco, Filo `#CBC6BC`, Velo `#F1EEE7`                | Text; actions, links, active navigation, view toggles, focus (ink); hover rows and neutral fills (Velo) |
| Your scenario | Giallo targa `#FFD23F`, Giallo tenue `#FFF4C7`                                                | What you have set that changes the results, and the effect of those settings                            |
| Vehicles      | 1 Cobalto `#2548E0`, 2 Mandarino `#E8601C`, 3 Smeraldo `#11A37A`, 4 Magenta `#B8338E`         | Identity in the comparison, always with the slot number or marker shape                                 |
| Signals       | Attenzione `#8F5300` on white; Critico `#B3261E` on `#FBEAE8`; Informazione `#4A4A52` on Velo | States, always with an icon and words                                                                   |

Why the interface is no longer blue: Refined's Blu inchiostro `#1E2A78` would sit next to Cobalto, the colour of vehicle 1, and a user could read a blue button or a blue focus ring as "about vehicle 1". Ink removes the ambiguity and keeps surfaces calm. Links are distinguished by weight 600 plus an arrow or chevron when the copy has one, and by an underline otherwise ("Azzera", "Annulla", "Modifica criteri", "Vedi le differenze", "Rendi flessibile …").

Why attention has no tint: Refined's attention tint `#FBF1DD` is too close to Giallo tenue. Attention is brown text with a triangle on a plain surface, so yellow can never be read as a warning.

Rules:

- A vehicle colour appears only with its number (badge) or its marker shape (charts): badge, 4 px rule under a card photo or a comparison header photo, outline of the "Nel confronto" button, 4 px edge of a result card, chart line, dot on a scale.
- Vehicle colours never colour text and never fill columns or large areas.
- Vehicles outside the comparison are neutral.
- Yellow always comes with ink: ink text on it, an ink outline, ink handles, or an ink rule next to it.
- Exception: the logo uses the four slot colours, as in Refined. It is a mark, not an identity indicator.

Contrast (WCAG): ink on Giallo 12.4:1, on Giallo tenue 16.2:1; secondary text `#4A4A52` on Giallo tenue 8.0:1; notes `#68686F` 5.2:1 on the page; Critico 6.5:1 on white, 5.6:1 on its tint; Attenzione 6.2:1 on white; numbers on slot colours: white on Cobalto 6.8:1, ink on Mandarino 5.2:1, ink on Smeraldo 5.6:1, white on Magenta 5.4:1. Chart lines against the white chart cards: Cobalto 6.8:1, Mandarino 3.4:1, Smeraldo 3.2:1, Magenta 5.4:1 (all ≥ 3:1 for graphical objects). Yellow on the page is only 1.4:1, which is why it never stands alone as a boundary.

Colour vision: the four vehicle colours pass the colour-vision validator on all pairs against the page (worst pair Magenta–Smeraldo, deutan ΔE 10.0; normal-vision floor 21.2). Adding Critico to the set still passes; its closest neighbour is Magenta (normal-vision ΔE 15.2, at the floor), which is acceptable because signals always carry an icon and words and never mark a vehicle.

## Yellow

**Meaning.** Expressive's rule was "yellow = what you have set", and it coloured every selected segment, including view toggles. That rule is too broad: almost every control is set by the user, so yellow drifted towards "selected", competing with ink. The consolidated rule is narrower and easier to keep:

> Yellow marks the parameters of your scenario, the ones that change the results (criteria, criterion behaviour, charging conditions, the charging interval), and the effect of those parameters. How you look at the results (Schede/Elenco/Differenze, Tabella/Grafico, Tutte/Solo differenze), navigation and actions stay ink.

**Two studies** in the identity sheet use identical components and content:

| Element                                                                     | A · discreet        | B · characterising      |
| --------------------------------------------------------------------------- | ------------------- | ----------------------- |
| Tab on active criteria                                                      | yellow              | yellow                  |
| Selected scenario option (behaviour, station, charge type, end of charging) | yellow, ink outline | yellow, ink outline     |
| Charging interval on the chart axis                                         | yellow bar          | yellow bar              |
| Criteria count ("Criteri attivi 6", "6 criteri" in the context bar)         | text                | yellow plate            |
| Notice reporting the effect of the last change                              | neutral, info icon  | yellow tint and tab     |
| Range sliders (DC power minimum, charge level)                              | ink fill            | yellow fill             |
| Station limit on the chart                                                  | text                | yellow plate            |
| Interval band in the chart, chosen station row in the table                 | none / neutral      | pale yellow             |
| Landing: needs card and its "+" chips                                       | neutral             | yellow top rule and "+" |
| Comparison: "Con i tuoi criteri"                                            | —                   | yellow tab              |

**Applied to the screens: B.** Reasons:

1. The landing has no vehicles selected. With A it would carry no yellow at all and its identity would rest on the logo and photos, which is Refined's weakest point. B gives it one functional yellow element: the place where you start setting your needs.
2. In B yellow follows your scenario across discovery (criteria, count, notice), comparison (count in the context bar, the criteria section) and simulation (conditions, interval, station). That continuity is useful, not decorative.
3. Every yellow element in B is small: tabs, plates, a slider track, a 5 px rule, pale bands. No yellow card, column or bar wider than a table row. The page stays as light as Refined's.

B is the starting point for implementation. A remains the fallback if B proves too insistent in use; the components are the same, only tier-2 elements change (one parameter in the generator). See [Provisional](#provisional).

## Typography

Schibsted Grotesk (OFL), embedded. Unchanged from Refined: headings 700 at 56 / 32 / 26 / 20 with tight tracking, text and labels 400–600 at 12–17. Tabular figures only on chart axes and in the stations table, because Schibsted's tabular set widens `.`, `,` and `:` in prices and decimals. Underlined links are new (consequence of the ink interface; the link style is [provisional](#provisional)). No other family was introduced; Anybody, IBM Plex and Archivo were not reconsidered, as requested.

## Photography

Refined's approach: real photographs of the correct model, integrated at moderate size, rounded like the cards, never under text. The landing borrows Expressive's staggered composition with a second, narrower frame (380 × 236 and 168 × 208). All images are still **labelled placeholders**; the scenario vehicles are illustrative (see [`../photography.md`](../photography.md)).

The placeholder is new for this concept: instead of a flat field with a camera icon it shows the intended set (light studio wall, floor line at two thirds of the height, soft ground shadow where the car will stand, crop marks) and a label pill "FOTO SEGNAPOSTO · model · view". It previews how real photos should be framed while staying obviously a placeholder. No vehicle is drawn. The shared `photoSlot` in `lib.mjs` is unchanged, so earlier concepts rebuild identically.

## Screens

- **Landing.** Refined's layout. Identity without vehicles: logo, Schibsted headline, ink actions, the yellow needs card, the photo composition.
- **Discovery.** Six thin yellow criteria tabs, the "6" plate, a yellow slider and behaviour toggle in the open criterion, the yellow notice. Results cards: 4 px slot rule under the photo, badge on the photo, slot-coloured outline on "Nel confronto"; Brisa Family stays neutral. View toggle and primary actions in ink.
- **Comparison.** Neutral hairline table, no coloured columns. Colour only in the header (4 px slot rule under each photo, badge next to the name) and in the badges of "Altre differenze". "6 criteri" in a yellow plate in the context bar; a yellow tab beside "Con i tuoi criteri". The hover row is Velo.
- **Charging.** Conditions in yellow (they are your scenario); curves in Cobalto and Mandarino with marker shapes and direct labels; interval as a yellow bar on the axis plus a pale band; station limit as an ink dashed line with a yellow plate above it; hatched region and dotted unreachable curve as in Refined; neutral crosshair and tooltip. The chosen station row in "Con altre colonnine" is pale yellow.

## Trade-offs

- Ink links are less discoverable than coloured links; underlines and arrows compensate, at the cost of a little visual noise.
- Yellow tier 2 adds about ten small yellow elements per dense screen. Each has a reason, but together they need restraint in future screens.
- Removing the attention tint makes warnings quieter than in Refined.
- The pale chart band and the pale table row rely on a 1.1:1 tint difference; the yellow axis bar and the "150 kW" label carry the information when the tint is not perceived.
- Numbered badges were kept over Expressive's stripe counts: more self-evident, less characteristic.

The points this iteration left to validate are now listed in [Decision status](#decision-status), as provisional decisions or future work.
