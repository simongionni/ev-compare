# EV Compare documentation

Technical documentation for contributors. The codebase is the source of truth; the technical
pages describe the implementation as it exists on the `dev` branch. Decision records and
milestone specifications describe approved intent; their status says whether it is implemented.

## Charging domain and simulation engine (milestone M0.1)

| Page                                                   | Contents                                                                     |
| ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| [Overview and architecture](charging/README.md)        | Purpose, scope, source layout, layering, data flow, design rationale         |
| [Domain model](charging/domain-model.md)               | Domain types, units, invariants, raw vs validated types, AC and DC factories |
| [Calculation model](charging/calculation-model.md)     | Energy, AC power and time, DC curves and integration, session simulation     |
| [Public API](charging/public-api.md)                   | Exported functions, contracts, error catalogue, usage examples               |
| [Assumptions and limitations](charging/limitations.md) | Physical simplifications, numerical accuracy, open questions, technical debt |
| [Testing](charging/testing.md)                         | Test organization, covered behavior, commands                                |

## Architecture decision records

| Record                                                                  | Status   | Contents                                                                                       |
| ----------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| [0001 — Frontend architecture](decisions/0001-frontend-architecture.md) | Accepted | Stack, separation of responsibilities, state management, design system, charts, open questions |

## Milestones

| Page                                                                   | Status                                                                            | Contents                                                                                               |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [M0.2 — First vertical slice](milestones/m0.2-first-vertical-slice.md) | Completed (increments 1, 2 and 3 implemented; accepted with non-blocking caveats) | Discovery → Vehicle Analysis → DC simulation: scope, data, navigation, acceptance criteria, acceptance |

## Maintenance

| Page                                                   | Status   | Contents                                                                        |
| ------------------------------------------------------ | -------- | ------------------------------------------------------------------------------- |
| [Technical debt register](technical-debt.md)           | Current  | Debt, tooling problems and test gaps verified at the M0.2 baseline, with status |
| [Post-M0.2 maintenance plan](maintenance/post-m0.2.md) | Proposed | Work packages TD-01 to TD-04, sequence, decisions requiring approval            |

## Product, UX and visual identity

These pages describe intent and design, not implemented features.

| Page                                                                                | Contents                                                                                                            |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| [Product Vision](product-vision.md)                                                 | Product requirements and principles                                                                                 |
| [UX Design Principles](ux/design-principles.md)                                     | Rules for UX, visual and frontend work                                                                              |
| [User flows](ux/user-flow-overview.md)                                              | High-level activities and navigation                                                                                |
| [Discovery wireframes](ux/wireframes/consolidated-iteration-1/README.md)            | Landing and search                                                                                                  |
| [Vehicle Analysis wireframes](ux/wireframes/vehicle-analysis-iteration-1/README.md) | Single-vehicle page                                                                                                 |
| [Comparison wireframes](ux/wireframes/vehicle-comparison/README.md)                 | Comparison and technical exploration                                                                                |
| [Visual identity](ux/visual-identity/README.md)                                     | Explored concepts; [Livrea Consolidated](ux/visual-identity/livrea-consolidated/README.md) is the selected identity |
