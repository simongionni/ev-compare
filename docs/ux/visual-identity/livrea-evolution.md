# Livrea — original, Refined, Expressive

Critical comparison of [Livrea](livrea/README.md) (iteration 1) and its two evolutions, [Livrea Refined](livrea-refined/README.md) and [Livrea Expressive](livrea-expressive/README.md), applied to the same five artefacts. The first iteration's comparison of all three directions stays in [`comparison.md`](comparison.md). No variant is declared the winner.

Ratings are relative within these three (● strongest, ◐ adequate, ○ weakest).

| Criterion                  | Livrea | Refined | Expressive |
| -------------------------- | ------ | ------- | ---------- |
| Recognisability            | ●      | ◐       | ●          |
| Personality                | ●      | ◐       | ●          |
| Engagement                 | ●      | ◐       | ●          |
| Legibility                 | ◐      | ●       | ◐          |
| Dense screens              | ○      | ●       | ◐          |
| Technical visualisations   | ◐      | ●       | ●          |
| Use of photography         | ○      | ◐       | ●          |
| Colour system coherence    | ○      | ●       | ●          |
| Scalability                | ○      | ●       | ◐          |
| Implementation feasibility | ◐      | ●       | ◐          |

## What changed from the original

| Issue in Livrea                       | Refined                                         | Expressive                                                              |
| ------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------- |
| Black criteria column, black blocks   | White card                                      | Paper with yellow-tabbed criteria; ink only as rules and small plates   |
| Full-height coloured columns          | Neutral columns, numbered badge                 | Neutral columns, livery band under the header photo                     |
| Archivo Black everywhere              | Schibsted Grotesk 700 for headings only         | Anybody expanded for headings, condensed for figures, Overpass for text |
| All colours reserved for vehicles     | Interface blue + signals + vehicles             | Yellow for user settings + signals + vehicles                           |
| Identity by colour only (plus number) | Number + marker shape                           | Stripe count + marker shape                                             |
| Flat silhouettes                      | Real photos (placeholders), integrated in cards | Real photos (placeholders) as composition elements                      |
| Tables without provenance             | Tavola-style provenance column, curve points    | Same, with condensed figures                                            |

## Recognisability and personality

**Expressive** is at least as recognisable as the original, and more so outside the comparison: expanded headings, plates and stripes appear on the landing and in every header, while the original's identity depended on selected vehicles. **Refined** gives up some recognisability; its character comes from Schibsted, the four vivid marks and photography. On the landing, where no vehicle is selected, Refined is the quietest of the three.

## Engagement

The original and Expressive both make comparing feel like building a line-up. Expressive adds a second engaging thread, the yellow that follows the user's own choices. Refined is pleasant rather than exciting; its engagement relies on photos.

## Legibility and dense screens

**Refined** is clearly the most legible: light surfaces, one text family, hairline tables, small coloured marks. **Expressive** keeps the tables neutral and sets values in Overpass, so the comparison reads well; the cost is in headings and cards (wide type takes space, more elements per card: band, stripes, plates). The **original** remains the heaviest on dense screens.

Check carried out for Expressive's comparison: values are not in condensed type (it was tried and made phrases such as "ricarica ogni ~7 giorni" hard to read); bands and colour are confined to the header; rows keep 40–42 px height and hairlines.

## Technical visualisations

Both evolutions adopt Tavola's manufacturer curve points with stated interpolation and Notturno's out-of-reach region (hatched above the station's power). Refined marks your interval in its interface tint; Expressive in yellow, with the station as a yellow plate, which ties the chart to the controls above it. Both show the 20-minute values (Refined as a hover tooltip, Expressive as tags on the lines). Both are an improvement over the original's thick lines and colour-only series.

## Photography

The original used flat silhouettes. Refined integrates photos in cards and headers at moderate size; Expressive makes them a structural element (landing strip, full-bleed card tops) with the livery band underneath. Both depend on a consistent image supply; Expressive depends on it more, because placeholders are much more visible at that size. All photos are placeholders in this iteration (see [`photography.md`](photography.md)).

## Colour system coherence

The original's rule ("every colour means a vehicle") was coherent but left no colour for states. Both evolutions now have three families:

- **Refined:** interface (dark blue) · vehicles (four vivid, numbered) · signals (dark tone + tint + icon). Simple and conventional; the dark blue and violet need care.
- **Expressive:** user settings (yellow) · vehicles (colour + stripes) · signals. More original and more meaningful, but stricter: yellow cannot be reused for anything else, and its low contrast with paper means it must always come with a border, text or weight change.

## Scalability

Refined extends easily to vehicle analysis, simulations, sources and method, and to mobile. Expressive extends well in identity (headings, plates, yellow work everywhere) but wide type needs a mobile strategy, and stripe and plate components must be built for every context. The original scaled poorly beyond the comparison.

## Implementation feasibility

Both need the same comparison-slot model (lowest free slot, stable colours) and a photography pipeline. Refined needs one variable font and standard components. Expressive needs two variable families (one with a width axis), bespoke components (bands, stripes, plates, end tags) and more careful responsive typography.

## Elements that could be combined later

Not a consolidated version, only candidates:

- **Expressive's stripe count** as the non-colour encoding of vehicle slots, in Refined's quieter layout (small stripe chips instead of numbered dots).
- **Expressive's yellow for user settings**, applied sparingly to criteria tabs, chosen conditions and the charging interval, with Refined's interface blue kept for actions.
- **Refined's table and card density** with Expressive's headings at a smaller expansion (for example 115–125 %).
- **Condensed figures** (Expressive) only for prices, times and chart axes; body and table values in a text face.
- **Photo size**: Expressive's full-bleed card tops on discovery, Refined's moderate headers in the comparison.
- **Shared by both**: provenance glyphs, curve points with stated interpolation, hatched out-of-reach region, hover row.

## Open questions

1. How much of the landing should carry colour when nothing is selected (Refined is nearly neutral there)?
2. Is "yellow = what you set" a rule the team wants to commit to across the product?
3. Photography: which source and licence model, and what happens for models without a usable image?
4. Is a width-variable display face acceptable for future mobile layouts?
5. Dark theme: still out of scope?
