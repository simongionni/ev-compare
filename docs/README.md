# EV Compare documentation

Technical documentation for contributors. The codebase is the source of truth; these pages
describe the implementation as it exists on the `dev` branch.

## Charging domain and simulation engine (milestone M0.1)

| Page                                                   | Contents                                                                     |
| ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| [Overview and architecture](charging/README.md)        | Purpose, scope, source layout, layering, data flow, design rationale         |
| [Domain model](charging/domain-model.md)               | Domain types, units, invariants, raw vs validated types, AC and DC factories |
| [Calculation model](charging/calculation-model.md)     | Energy, AC power and time, DC curves and integration, session simulation     |
| [Public API](charging/public-api.md)                   | Exported functions, contracts, error catalogue, usage examples               |
| [Assumptions and limitations](charging/limitations.md) | Physical simplifications, numerical accuracy, open questions, technical debt |
| [Testing](charging/testing.md)                         | Test organization, covered behavior, commands                                |

## UX and visual identity (milestone M0.2)

| Page                                            | Contents                                                                  |
| ----------------------------------------------- | ------------------------------------------------------------------------- |
| [Product Vision](product-vision.md)             | Vision, audience, product principles                                      |
| [Design Principles](ux/design-principles.md)    | Principles for UX, visual design and frontend work                        |
| [Visual identity](ux/visual-identity/README.md) | Selected identity (Livrea Consolidated), exploration history, review page |

## Other directories

- `docs/decisions/` is reserved for architecture decision records. None exist yet.
