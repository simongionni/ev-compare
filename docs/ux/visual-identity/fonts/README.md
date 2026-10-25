# Fonts embedded in the iteration 2 SVGs

The Livrea Refined and Livrea Expressive SVGs embed these fonts as base64 WOFF2, so they render correctly when opened directly or shown through `<img>` in the review page (which cannot load external files). The build reads them from this directory.

| File                            | Family                                        | Used by           | Source                                                                                                | Licence                                                             |
| ------------------------------- | --------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `SchibstedGrotesk-subset.woff2` | Schibsted Grotesk (variable, wght 400–900)    | Livrea Refined    | [google/fonts `ofl/schibstedgrotesk`](https://github.com/google/fonts/tree/main/ofl/schibstedgrotesk) | SIL OFL 1.1, [`OFL-schibstedgrotesk.txt`](OFL-schibstedgrotesk.txt) |
| `Anybody-subset.woff2`          | Anybody (variable, wdth 50–150, wght 100–900) | Livrea Expressive | [google/fonts `ofl/anybody`](https://github.com/google/fonts/tree/main/ofl/anybody)                   | SIL OFL 1.1, [`OFL-anybody.txt`](OFL-anybody.txt)                   |
| `Overpass-subset.woff2`         | Overpass (variable, wght 100–900)             | Livrea Expressive | [google/fonts `ofl/overpass`](https://github.com/google/fonts/tree/main/ofl/overpass)                 | SIL OFL 1.1, [`OFL-overpass.txt`](OFL-overpass.txt)                 |

The licence and copyright notices above were taken from each family's `METADATA.pb` and `OFL.txt` in the google/fonts repository on 2026-10-25. The OFL allows embedding the fonts in documents and redistributing them with the licence, which is why the licence files are kept here.

## Subsets

Made with fontTools `pyftsubset` from the variable TTFs, keeping the variation axes:

```
--unicodes=U+0020-007E,U+00A0-00FF,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2022,U+2026,
           U+2039,U+203A,U+20AC,U+2190-2193,U+2212,U+2248
--layout-features=kern,liga,tnum,lnum,pnum,case[,ss01]
--flavor=woff2
```

Anybody has no arrow glyphs; arrows in Expressive fall back to the next font in the stack. The iteration 1 SVGs embed no fonts and are unchanged.
