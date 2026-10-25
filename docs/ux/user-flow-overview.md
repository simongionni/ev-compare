# EV Compare — High-Level User Flows

## Purpose and scope

This diagram consolidates the high-level activities, choices, and navigation paths of the intended EV Compare experience. It is a shared input for wireframing, not a page map, screen specification, or description of the current implementation.

The Product Vision is the primary source of requirements. The diagram groups related activities for readability; those groups do not imply separate pages, routes, or fixed UI containers.

Miro diagram: [EV Compare — High-Level User Flows](https://miro.com/app/board/uXjVEVmqOSs=/?moveToWidget=3458764688325774277)

Mermaid source: [`user-flow-overview.mmd`](user-flow-overview.mmd)

## Consolidated UX decisions

- **Immediate access:** discovery, single-vehicle analysis, comparison, and technical tools are directly reachable without onboarding, questionnaires, or knowledge assessments.
- **Combinable criteria:** make/model search, practical needs, and technical specifications coexist in one discovery experience and can be refined continuously while reviewing results.
- **Autonomous vehicle analysis:** a vehicle can be examined for practical fit, technical characteristics, data, and performance without entering a comparison.
- **Optional comparison:** users can build a comparison progressively from results or vehicle details, modify its selection, or enter comparison directly and select vehicles there.
- **Optional depth:** contextual explanations remain within the current activity. Simulations are deeper interactive activities that can be opened directly or from a vehicle or comparison.
- **Context reuse and continuity:** vehicle, comparison, filter, and scenario context is reused when available and preserved when returning from technical exploration. The implementation mechanism is intentionally unspecified.
- **Transversal transparency:** sources, estimates, assumptions, limitations, and explanations of suitability are available wherever the product presents results, analyses, comparisons, or simulated outcomes.
- **User judgment:** recommendations and comparisons explain relevant criteria and trade-offs rather than declaring an opaque winner.

## The three central activities

### Discover

Users can immediately explore vehicles and combine text search, practical constraints, and technical filters. Criteria and results form a continuous loop: users can adjust any criterion while retaining the rest of the exploration. Suitability signals can be explained in context.

### Analyze a vehicle

Users can open a vehicle directly or from discovery and independently assess practical compatibility, technical characteristics, and the meaning of its data and performance. They can consult evidence and limitations, open a contextual explanation, or run an interactive simulation without selecting another vehicle.

### Compare

Users can add or remove vehicles while discovering and analyzing them, then compare practical differences, technical differences, and trade-offs. They can also enter comparison directly, build a selection there, and open any compared vehicle for individual analysis. Comparison is central but never a mandatory destination.

## Optional explanations, simulations, and transparency

Short explanations are contextual: consulting one does not conceptually leave the current activity. Interactive simulations may involve a dedicated analytical environment, but they reuse known vehicles and comparison context, incorporate scenario configuration into the activity, and provide a clear return to the originating analysis or comparison.

Sources, estimates, assumptions, and limitations are represented as a cross-cutting capability rather than a gate. This includes explanations of why a result appears compatible and disclosure of assumptions behind simulated outcomes.

## Navigation rationale

- The entry point exposes all central activities without a preliminary decision step.
- Discovery, individual analysis, and comparison are independent but connected; none is a required stage before another.
- Comparison selection is modeled as a functional capability, without assuming a persistent bar, dedicated panel, or other component.
- Solid connections represent navigation or a change of activity. Dashed connections represent optional contextual information that does not impose progression.
- No decision diamonds are used: the previous questions represented interface rules or unnecessary checkpoints rather than meaningful user decisions.

## Open decisions for wireframing

1. Should the initial discovery state show the full catalogue immediately, or begin with a more focused but still non-blocking search state?
2. Should practical needs primarily filter vehicles, influence an explainable compatibility ordering, or support both behaviors?
3. How should the comparison selection be represented and accessed across discovery, vehicle analysis, and comparison without assuming it is always visible?
4. When a technical tool is opened without a vehicle, should it begin with a generic example, a vehicle choice, manual specifications, or a combination of these?
5. Which interaction pattern best keeps short explanations in context while allowing simulations to use a larger analytical workspace?
6. How should the return path communicate preserved filters, selected vehicles, and scenario inputs without adding navigational clutter?

Questions about the exact practical criteria, data provenance taxonomy, comparison capacity, regionalization, and cross-visit persistence remain product concerns, but they do not change this high-level flow map and need not block the first wireframes.

## Scenario verification

- **A — Autonomous discovery:** entry → results ↔ combined criteria, with continuous refinement and no guided flow.
- **B — Individual analysis:** results or direct entry → vehicle analysis → simulation → return to the same vehicle context.
- **C — Progressive comparison:** results/vehicle → manage selection → comparison → open an individual vehicle.
- **D — Direct comparison:** entry → manage selection → comparison and its practical, technical, and trade-off lenses.
- **E — Contextual explanation:** criteria, technical characteristics, or trade-offs → explanation in the current context.
- **F — Direct technical exploration:** entry → configure and explore a simulation → inspect vehicles or manage a comparison selection.

All six scenarios are represented without assigning page boundaries or UI components.
