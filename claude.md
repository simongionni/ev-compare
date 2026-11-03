## UX and frontend design

Before performing UX design, wireframing or frontend UI work, read:

- `docs/product-vision.md`
- `docs/ux/design-principles.md`

For visual design and frontend UI work, also read `docs/ux/visual-identity/livrea-consolidated/README.md`, the selected visual identity. Treat its consolidated decisions as the baseline and its provisional decisions as starting points to verify.

Follow these documents throughout the task.

Do not introduce unnecessary explanatory copy, patronizing guidance or features added solely to demonstrate compliance with the Product Vision.

## Frontend implementation

Before any frontend implementation work, also read:

- `docs/ux/visual-identity/livrea-consolidated/README.md`: the selected visual identity.
- `docs/decisions/0001-frontend-architecture.md`: approved stack, responsibilities, state rules, open questions.
- The milestone specification for the task in `docs/milestones/` (currently `m0.2-first-vertical-slice.md`) and the wireframes it references.

Rules that are easy to miss:

- Do not add libraries outside the ADR 0001 stack, and do not replace any part of it.
- Do not change M0.1 engine behaviour (`src/domain/`, `src/calculations/`) to suit the UI.
- Items listed as open in the ADR or the specification are undecided: raise them, do not settle them silently.
- Build only what the current specification requires.
