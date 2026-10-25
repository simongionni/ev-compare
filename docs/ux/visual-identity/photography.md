# Vehicle photography

Decision for iteration 2: both Livrea variants are designed around **real photographs of the correct model**. No AI-generated vehicle images and no vehicle illustrations are used.

## Why the SVGs show placeholders

The vehicles in the scenarios (Nordis E4, Aurora Vela, Brisa Family, Meridian Tour, Talon S) are **illustrative**: they come from the consolidated wireframes and do not exist. A real photograph of any real car would misrepresent the model shown, which the brief rules out. The SVGs therefore use neutral photographic placeholders, labelled "FOTO SEGNAPOSTO" with the model and intended view. No photograph was downloaded or embedded, so there is no provenance or licence to record yet.

The placeholder (`photoSlot` in [`_source/lib.mjs`](_source/lib.mjs)) is a neutral tonal field with crop marks and a camera icon. It is also a reasonable production fallback for models without a usable image, as long as it stays clearly a placeholder.

## Requirements for real images

| Context                           | Refined                        | Expressive                        |
| --------------------------------- | ------------------------------ | --------------------------------- |
| Result card                       | 330 × 156, rounded top corners | 330 × 176, full-bleed top         |
| Comparison header                 | 300 × 128, rounded             | 300 × 132, livery band underneath |
| Thumbnails (search, near matches) | 60 × 40, 104 × 60              | 54 × 36, 108 × 60                 |
| Landing                           | One editorial image, 564 × 236 | Three tall frames, 180 × 262      |

Common rules:

- The exact model; ideally the exact version shown (year, trim), otherwise state the difference.
- Consistent view per context: three-quarter front for cards and headers, side view where profiles are compared.
- Neutral or unobtrusive background; no text, logos or watermarks over the car.
- The image never carries information that is not also in text (photos do not replace data).
- Alt text with model and view.

## Sourcing strategy (to decide before implementation)

Options, to be evaluated case by case; none was used here and no licence is assumed:

1. **Manufacturer media sites.** Usually allow editorial use; terms vary by brand and often exclude commercial or comparative contexts. Each brand's terms must be read and recorded.
2. **Wikimedia Commons.** Per-file licences (often CC BY or CC BY-SA, sometimes public domain). Require attribution and, for share-alike, compliance with the licence terms. Quality and consistency vary.
3. **Licensed automotive image providers.** Consistent angles and backgrounds per model and version; paid, with terms to negotiate (display, caching, derivatives).
4. **Own photography or contributions.** Full control, high cost, limited coverage.

The data source (OpenEV Data) provides no images, so the association between image and model must be stored by EV Compare.

## Metadata to store per image

| Field                         | Example                                    |
| ----------------------------- | ------------------------------------------ |
| Model, version, model year    | —                                          |
| View                          | three-quarter front, side, rear            |
| Source URL                    | link to the original file or press release |
| Author / rights holder        | —                                          |
| Licence and licence URL       | as stated by the source, verbatim          |
| Attribution text              | as required by the licence                 |
| Allowed uses and restrictions | editorial only, no modification, …         |
| Retrieved on, verified by     | date, person                               |
| Crops / derivatives           | which crops were made                      |

An image without complete metadata is not published; the placeholder is shown instead.
