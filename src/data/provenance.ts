/**
 * Provenance kind of a value: the kind of source it belongs to (M0.2 slice, "Provenance and
 * nature of the data").
 *
 * - `costruttore`: a technical specification, of the type a manufacturer declares.
 * - `stima`: an estimate from a model.
 * - `calcolo`: calculated by the M0.1 engine.
 *
 * Whether a value is real or illustrative is a separate property, not a fourth kind.
 */
export type ProvenanceKind = "costruttore" | "stima" | "calcolo";
