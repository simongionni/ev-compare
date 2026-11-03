# ADR 0001 — Frontend architecture

| Field   | Value                                                                      |
| ------- | -------------------------------------------------------------------------- |
| Status  | Accepted                                                                   |
| Date    | 2026-11-03                                                                 |
| Applies | Milestone M0.2 onwards: every frontend change                              |
| Related | [First vertical slice](../milestones/m0.2-first-vertical-slice.md) (M0.2)  |
| Revised | 2026-11-03: `react-redux` approved; open questions before the slice listed |

This record formalises decisions that were already discussed and approved. It does not
introduce new ones. Wherever a detail has not been decided, it is listed under
[Open questions](#9-open-questions) and must not be treated as settled.

## 1. Context

- **M0.1 is complete.** A UI-independent charging domain model and simulation engine live in
  `src/domain/` and `src/calculations/` ([charging docs](../charging/README.md)). It is pure,
  synchronous and deterministic, and reports invalid input as typed errors
  (`CalculationResult<T, E>`).
- **The UX of M0.2 is consolidated**: high-level flows, desktop wireframes for Discovery,
  Vehicle Analysis and Comparison.
- **Livrea Consolidated is the selected visual identity** of the product.
- **The web app is still the bootstrap landing page** (`src/app/`). No frontend feature,
  styling system, state management or chart exists yet.

Authoritative sources. This ADR does not override them; where it seems to, the source wins and
the conflict must be reported.

| Concern              | Source                                                                                                                                                                                                                                                                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product requirements | [Product Vision](../product-vision.md)                                                                                                                                                                                                                                                                                              |
| UX                   | [UX Design Principles](../ux/design-principles.md), [user flows](../ux/user-flow-overview.md), consolidated wireframes ([Discovery](../ux/wireframes/consolidated-iteration-1/README.md), [Vehicle Analysis](../ux/wireframes/vehicle-analysis-iteration-1/README.md), [Comparison](../ux/wireframes/vehicle-comparison/README.md)) |
| Visual identity      | [Livrea Consolidated](../ux/visual-identity/livrea-consolidated/README.md), [photography](../ux/visual-identity/photography.md)                                                                                                                                                                                                     |
| Charging engine      | [Public API](../charging/public-api.md), [domain model](../charging/domain-model.md), [limitations](../charging/limitations.md)                                                                                                                                                                                                     |

## 2. Technology stack

| Area                     | Technology                        | In the repository today      |
| ------------------------ | --------------------------------- | ---------------------------- |
| Framework                | Next.js 16 (App Router)           | Installed (16.3.x)           |
| UI                       | React 19                          | Installed (19.2.x)           |
| Language                 | TypeScript, `strict`              | Installed (6.x)              |
| Accessible primitives    | Base UI                           | Not installed                |
| Styling                  | CSS Modules                       | Supported by Next.js, unused |
| Design tokens            | CSS Custom Properties             | None defined                 |
| Design system            | Proprietary EV Compare components | None                         |
| Technical charts         | visx                              | Not installed                |
| Shared application state | Redux Toolkit, with `react-redux` | Not installed                |
| Shareable scenarios      | URL                               | —                            |
| Calculation engine       | M0.1, independent of the frontend | Implemented                  |
| Tests (existing)         | Vitest                            | Installed, Node environment  |

Rules:

- Existing dependencies stay. ESLint 9 and TypeScript 6 stay for the reasons given in the
  [README](../../README.md#bootstrap-choices).
- No library beyond this table is introduced, and no part of the stack is replaced. A need that
  the stack cannot meet is reported, not solved by adding a dependency.
- Packages are installed in the implementation session that first needs them, not in advance.
- The strategy for UI component tests and end-to-end tests is **not defined** (see
  [Testing](#7-testing)).

Packaging notes to verify at installation time (they do not change the stack):

- Redux Toolkit is used from React through its official binding, `react-redux`, which is part of
  the approved Redux Toolkit decision. Both are installed together, only when Redux is actually
  introduced (see [Decision 6](#decision-6--redux-toolkit)); approving the binding does not mean
  creating a store or slices in advance.
- visx is distributed as separate `@visx/*` packages; install only those a chart uses.
- Check the current npm package name of Base UI and the declared React 19 support of Base UI,
  visx and Redux Toolkit against the installed React version.

## 3. Separation of responsibilities

| Concern                                 | Location                                           | Must not depend on                                |
| --------------------------------------- | -------------------------------------------------- | ------------------------------------------------- |
| Domain models and rules                 | `src/domain/` (existing)                           | React, Next.js, Redux, visx, browser APIs         |
| Calculation engines                     | `src/calculations/` (existing, M0.1)               | React, Next.js, Redux, visx, browser APIs         |
| Vehicle catalogue access                | `src/data/` (planned at bootstrap)                 | React components, Redux                           |
| Application logic and state transitions | Pure TypeScript functions; location open           | React, Redux (testable without either)            |
| Shared state                            | Redux Toolkit store; location open                 | Domain rules implemented inside reducers          |
| Routing and scenario serialisation      | Routes in `src/app/`; scenario codec location open | Codec: React, Redux                               |
| Presentation components                 | `src/components/` (planned at bootstrap)           | Calculation internals; arbitrary colour values    |
| Design tokens and styling               | Central CSS Custom Properties + CSS Modules        | Values duplicated in components                   |
| Technical visualisations                | visx-based components                              | Mathematical logic (they receive computed series) |

Dependencies point from the UI towards the domain, never the reverse:

```mermaid
flowchart TD
    App["Routes and pages (src/app)"] --> Components["EV Compare components"]
    App --> Store["Redux store (shared state only)"]
    App --> Codec["Scenario models and codec"]
    Components --> Primitives["Base UI primitives"]
    Components --> Charts["visx charts"]
    Components --> Tokens["Design tokens (CSS custom properties)"]
    Store --> Logic["Application logic (pure functions)"]
    App --> Data["Catalogue access (src/data)"]
    Logic --> Domain["Domain (src/domain)"]
    Codec --> Domain
    Data --> Domain
    App --> Engine["M0.1 engine (src/calculations)"]
    Engine --> Domain
```

Constraints:

- **The M0.1 engine stays independent** of React, Redux, Next.js, visx and every other frontend
  technology. Frontend needs never justify changing engine behaviour, and the frontend never
  reimplements engine mathematics. Values the engine does not expose are handled as described
  in [open question 3](#9-open-questions).
- **Selection logic is testable without Redux.** Rules that change the comparison selection are
  plain functions; a reducer may call them, not contain them.
- **Raw data enters through the M0.1 factories**, as [limitations](../charging/limitations.md#constraints-for-future-extensions)
  requires for external data. Catalogue data is validated where it is loaded, not in components.
- **No speculative layers.** Do not add services, repositories, adapters or abstraction layers for
  features that do not exist. A layer is introduced by the first feature that needs it.

The table names existing and bootstrap-planned directories. Locations marked "open" are decided
by the first implementation that needs them and recorded in that change.

## 4. State management

### Decision 1 — Shareable scenarios in the URL

EV Compare can share and fully rebuild, from a URL alone:

- searches, with their criteria and preferences;
- comparisons, with the selected vehicles and the criteria applied;
- technical simulations, with every parameter needed to reproduce them.

Constraints:

- Each scenario has a **TypeScript model independent of the frontend framework**.
- Scenarios are **serialisable, validated and rebuildable** without any previous browser state
  (no `localStorage`, history state or in-memory store is needed to open a shared URL).
- Parsing untrusted URL input returns a validated scenario or a typed error, following the
  repository's errors-as-values convention. A malformed URL never crashes the page.
- Serialising and parsing **round-trip**: parsing a serialised scenario yields an equal scenario.
- The representation can **evolve** without needlessly breaking existing URLs.
- Vehicles are referenced by **stable identifiers**, so a URL keeps pointing to the same vehicle.

Not decided: the concrete URL format (parameter names, encoding, compression, versioning
mechanism) and the behaviour for partially invalid scenarios. Do not fix a definitive URL schema
before the scenarios that need it exist.

### Decision 2 — Reactive updates

Changes to criteria and parameters update results automatically when the computational cost
allows it. There is no mandatory confirmation step for operations that can update directly.

Five events are distinct and need not happen at the same time:

| Event                       | Meaning                                                            |
| --------------------------- | ------------------------------------------------------------------ |
| Temporary interaction state | A value while the user is still interacting (slider being dragged) |
| Committed scenario state    | The scenario value the product considers current                   |
| Result update               | Results recomputed from the inputs                                 |
| URL update                  | The URL rewritten to represent the committed scenario              |
| Browser history update      | A new history entry, as opposed to replacing the current one       |

Example: dragging a slider may update results continuously, but must not create a history entry
for every intermediate value.

Not decided: when temporary state becomes committed (on release, after a pause, on every change),
and which changes push a history entry rather than replacing the current one.

### Decision 3 — Comparison selection

The selection preserves vehicle identity, selection order, visual slots, and stable colours and
markers while it changes. Its logical structure is equivalent to:

```ts
type ComparisonEntry = {
  vehicleId: string;
  slot: number;
};

type ComparisonSelection = ComparisonEntry[];
```

- Array order is the selection order.
- `slot` is the visual identity of the vehicle.

Rules:

1. A new vehicle receives the first free slot.
2. Removing a vehicle frees its slot.
3. The remaining vehicles are not reassigned.
4. An explicit replacement keeps the replaced vehicle's slot.
5. Reordering, if offered, does not change slots.
6. Serialising the scenario rebuilds the selection faithfully, including order and slots. Since
   order and slot diverge after removals, both are part of the serialised form.

Colour and marker shape are **derived** from the slot and the design tokens. In Livrea
Consolidated the slots are 1 Cobalto, 2 Mandarino, 3 Smeraldo, 4 Magenta, and the marker shapes
in slot order are circle, square, triangle, diamond (`_source/livrea-consolidated.mjs`). They are
never stored as independent data.

Not decided: more than four vehicles; behaviour when the selection is full; replacing a vehicle
with one that is already selected; the numeric base of `slot`.

### Decision 4 — Navigation continuity

Preserved: the current scenario; the origin context; what is needed to return to the previous
activity; the scroll position when appropriate.

Not preserved indiscriminately: tooltips, hover, temporary editors, open menus and other
transient visual states.

Constraints:

- Use native browser and Next.js behaviour (history, scroll restoration, links) where it is
  sufficient. No additional persistence (storage, server sessions) without a demonstrated need.
- A page opened directly from a URL works on its own, without any previous navigation context.
  The wireframes define this case (for example "‹ Cerca" instead of "‹ Risultati" in Vehicle
  Analysis).
- The return path is a product behaviour (the context bar of the wireframes), not only the
  browser's Back button; both must behave consistently.

Not decided: how the origin context is represented (URL, history state, or both).

### Decision 5 — Derived data and calculations

- **Inputs are the source of truth** for calculated results. M0.1 results are derived from the
  inputs and not duplicated in shared state.
- Prefer direct calculation when it is fast enough. The engine's own cost estimate
  ([limitations](../charging/limitations.md#numerical-accuracy)) is negligible for interactive use.
- Memoisation, caches or Web Workers are introduced only with a concrete, **measured** reason.
  No preventive complex cache.
- A cache of remote data (future vehicle data source) is separate from the handling of
  mathematical results.

### Decision 6 — Redux Toolkit

Redux Toolkit manages shared application state, for predictable and traceable transitions,
organised state, testability and shared conventions.

Constraints:

- Redux does not duplicate the scenarios represented in the URL.
- Each piece of information has **one authoritative source** (table below).
- Domain rules stay independent of reducers.
- State that is purely local stays in React.
- Calculated results are not stored globally without need.
- The store is not a general container for every piece of application information.
- With the App Router, follow the official Redux Toolkit guidance: one store per request, created
  in a client component, never a module-level singleton shared across requests.

Sources of truth known today:

| Information                                       | Authoritative source                 |
| ------------------------------------------------- | ------------------------------------ |
| Committed search, comparison, simulation scenario | URL                                  |
| Temporary interaction values                      | Local React state                    |
| Transient UI (tooltip, hover, menus, editors)     | Local React state; not preserved     |
| Calculated results                                | Derived from inputs; not stored      |
| Vehicle catalogue                                 | Catalogue data access (`src/data/`)  |
| Visual identity of a vehicle                      | Derived from its slot and the tokens |

Not decided: the slice structure of the store, and which state is owned by Redux at all (see
[open questions](#9-open-questions)). Do not design the full set of slices in advance.

## 5. Design system

### Tokens

Livrea Consolidated is the approved baseline. Its tokens are CSS Custom Properties defined in one
central place and covering: semantic colours (the four families: interface, your scenario,
vehicles, signals), Schibsted Grotesk typography, spacing, borders and radii, interactive states,
vehicle colours, marker shapes, data provenance indicators.

- Components use tokens; they do not repeat raw values.
- The colour rules of Livrea Consolidated apply to code as they do to the SVGs: a colour from one
  family never does another family's job; a vehicle colour always appears with its number or
  marker shape; yellow marks scenario parameters and their effects, never view options,
  navigation or warnings.
- Livrea Consolidated applies yellow intensity B and keeps A as a fallback; the token structure
  should not make that switch harder.
- Desktop (1440 px) is the only designed width; mobile and dark theme are not designed.

### Primitives and styling

- Base UI provides interactive accessible primitives (sliders, toggle groups, menus, dialogs,
  tooltips…).
- Styling is CSS Modules consuming the tokens.

### Application components

EV Compare builds its own components that represent product concepts directly, for example
`VehicleCard`, `VehicleIdentityBadge`, `CriterionEditor`, `DataProvenanceTag`,
`ComparisonTable`, `ChargingCurveChart`. These are examples, not a catalogue to build now.

Components take **semantic** properties (a slot, a provenance kind, a vehicle) and decide colour,
border, icon and shape themselves. Callers do not repeatedly decide presentation details. For
instance, a provenance tag receives `costruttore`, `stima` or `calcolo` and renders the matching
symbol (■, ○, ◆) and label.

The provenance kind says where a value comes from. Whether the value is real or illustrative is a
separate property, not a fourth kind; the first vertical slice states how its fictional catalogue
expresses it ([Data](../milestones/m0.2-first-vertical-slice.md#4-data)).

### Charts

visx is used for technical visualisations. Charts preserve the Livrea Consolidated principles:

- declared curve points are distinguishable from linear interpolation between them;
- the station limit is represented (dashed line with plate, hatched region above it, unreachable
  part of the curve dotted);
- markers and colours come from the vehicle slot;
- labels and technical values are correct, with units;
- interactions are accessible.

Mathematical logic is not coupled to chart components: charts receive series computed elsewhere
(engine or pure functions) and only map them to pixels.

## 6. Alternatives considered

These are the reasons the approved options were preferred. They are not a full record of the
discussion.

| Alternative                                              | Why it was not adopted                                                                                                                    |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| URL and React state only, no shared store                | Less organised and traceable shared state as features grow; the URL still owns scenarios, so the cost of Redux stays bounded              |
| Redux as the single store of everything, URL as a mirror | Two sources of truth for scenarios; shared links would depend on synchronisation code                                                     |
| Storing engine results in the store or a cache           | Duplicates data derivable from inputs; the engine is cheap enough to recompute                                                            |
| Persisting navigation state in browser storage           | Not needed when the URL and native history suffice; would hide whether a shared URL is self-sufficient                                    |
| A pre-styled component library                           | Livrea Consolidated is a proprietary identity; Base UI is unstyled and keeps accessibility without imposing a look                        |
| Utility-class or runtime CSS-in-JS styling               | CSS Modules with custom properties keep tokens in plain CSS, scoped per component, without a styling runtime                              |
| High-level chart libraries with prebuilt chart types     | The charging chart needs precise, non-standard semantics (declared points, interpolation, station limit); visx gives low-level primitives |

## 7. Testing

- Vitest stays the test runner for domain, calculations, scenario codecs and selection logic.
  These are plain TypeScript and run in the existing Node environment.
- Every new pure module (scenario model and codec, selection rules, catalogue validation) has
  unit tests, mirroring the source layout as today.
- **Not defined:** how UI components and end-to-end flows are tested, and with which tools. No
  test library is added until that strategy is decided.

## 8. Consequences and trade-offs

- Two state mechanisms (URL and Redux) need a clear ownership rule per piece of information;
  the table in Decision 6 is the starting point and must be extended, not bypassed.
- Keeping results derived means recomputation on every relevant change. This is acceptable with
  M0.1's measured cost; it must be revisited with measurements if heavier models arrive.
- Proprietary components on unstyled primitives cost more initial work than a styled library,
  in exchange for an identity that follows Livrea Consolidated exactly.
- visx requires building axes, legends and interactions explicitly, including accessibility.
- An evolvable URL format must be designed with compatibility in mind from the first scenario,
  even though its concrete schema is deferred.
- Charts and components that need values the engine does not expose (see open question 3) cannot
  compute them in the UI without duplicating engine logic.

## 9. Open questions

1. **`react-redux`: resolved.** Approved as the official binding that integrates Redux Toolkit
   with React ([Technology stack](#2-technology-stack)). It is installed only when Redux is
   introduced. The numbering of the remaining questions is kept because other documents refer
   to it.
2. **Store scope.** Which state Redux owns. In particular, where the comparison selection lives
   while the user is outside the comparison view (the comparison URL owns it inside the view).
3. **Values not exposed by M0.1.** The wireframes show the effective power at a SoC (curve capped
   by vehicle and station maximum), the limiting factor of a session and an energy-over-time
   series. M0.1 applies the cap inside `dcChargingTime` and exports only `powerAtSoc` (uncapped).
   Which of these values the engine exposes, through which functions and contracts, and when,
   needs a decision.

   Orientation (approved): extending the M0.1 public API is admissible with pure functions that
   are backward compatible and tested, when they expose information that already belongs to the
   calculation logic. Duplicating the engine's mathematics in the frontend is not acceptable.
   This orientation does not authorise changing the engine now.

4. **URL format**: encoding, versioning, handling of partially invalid scenarios.
5. **History policy**: commit points of temporary state, when the URL is rewritten, push vs
   replace.
6. **Origin context representation** (URL, history state, both).
7. **Comparison capacity** beyond four vehicles and the behaviour of a full selection.
8. **UI component and end-to-end test strategy** and tools.
9. **Token organisation**: file location, naming (Livrea names such as Inchiostro, or role
   names), and how the A/B yellow intensity is expressed.
10. **Font delivery** of Schibsted Grotesk (OFL), for example `next/font` or self-hosting.
11. **Responsive layout and dark theme**: not designed.
12. **Directory locations** for application logic, scenario codecs, the store and tokens.

### To decide before implementing the first vertical slice

These must be discussed and approved before the corresponding part of the
[first vertical slice](../milestones/m0.2-first-vertical-slice.md#9-open-questions) is built.
None is settled by this record.

| Question                                                                    | Where it is described                                                                      |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Composition of the dedicated single-vehicle DC simulation screen            | Slice, open question 1                                                                     |
| Role of the simulator embedded in the Ricarica section of Vehicle Analysis  | Slice, open question 2                                                                     |
| Values the chart needs that M0.1 does not expose, including effective power | Open question 3 above; slice, open question 3                                              |
| SoC control granularity and handling of an empty interval                   | Slice, open question 4                                                                     |
| Synchronisation of parameter changes, URL and browser history               | [Decision 2](#decision-2--reactive-updates), open question 5 above; slice, open question 6 |

## 10. Notes on existing documentation

- The visual identity pages and [`.github/copilot-instructions.md`](../../.github/copilot-instructions.md),
  noted here when this record was first written, have since been aligned with it.
- `src/app/layout.tsx` declares `lang="en"`, while all product copy is Italian. Not changed; the
  first vertical slice requires the document language to match the copy (acceptance criterion
  11.5).
