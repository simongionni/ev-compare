// Contents of the visual identity review page. Edit this file to add concepts, screens or notes.
// SVG paths are relative to docs/ux/visual-identity/. Content hashes come from assets.js (generated).
window.VI_MANIFEST = {
  updated: "2026-10-25",
  iterations: [
    {
      id: 1,
      title: "Iterazione 1 — tre direzioni",
      summary:
        "Tre identità distinte applicate agli stessi scenari. Livrea è stata scelta come direzione da approfondire.",
    },
    {
      id: 2,
      title: "Iterazione 2 — evoluzioni di Livrea",
      summary:
        "Due evoluzioni di Livrea con fotografie reali (qui segnaposto), un sistema cromatico che distingue veicoli, segnali e interfaccia, e alcune soluzioni di Tavola per tabelle e grafici.",
    },
    {
      id: 3,
      title: "Iterazione 3 — sintesi",
      summary:
        "Un solo concept: struttura, leggerezza e tipografia di Livrea Refined, palette di Livrea Expressive in un sistema cromatico riprogettato. Da validare, non definitivo.",
    },
  ],
  // Side-by-side presets; the first one is the default.
  presets: [
    {
      id: "sintesi",
      label: "Refined ↔ Expressive ↔ Consolidated",
      concepts: ["livrea-refined", "livrea-expressive", "livrea-consolidated"],
    },
    {
      id: "livrea",
      iteration: 1,
      status: "Scelto da approfondire",
      label: "Famiglia Livrea",
      concepts: [
        "livrea",
        "livrea-refined",
        "livrea-expressive",
        "livrea-consolidated",
      ],
    },
    {
      id: "iterazione-2",
      label: "Iterazione 2",
      concepts: ["livrea-refined", "livrea-expressive"],
    },
    {
      id: "iterazione-1",
      label: "Iterazione 1",
      concepts: ["tavola", "livrea", "notturno"],
    },
    {
      id: "tutti",
      label: "Tutti",
      concepts: [
        "tavola",
        "livrea",
        "notturno",
        "livrea-refined",
        "livrea-expressive",
        "livrea-consolidated",
      ],
    },
  ],
  scenarios: [
    {
      id: "landing",
      file: "01-landing.svg",
      title: "Landing Page",
      width: 1440,
    },
    {
      id: "discovery",
      file: "02-discovery.svg",
      title: "Vehicle Discovery — Active Criteria",
      width: 1440,
    },
    {
      id: "comparison",
      file: "03-comparison.svg",
      title: "Comparison — Selected Vehicles",
      width: 1440,
    },
    {
      id: "charging",
      file: "04-charging.svg",
      title: "Curve di ricarica DC",
      width: 1440,
    },
    {
      id: "identity",
      file: "00-identity.svg",
      title: "Identity sheet",
      width: 1440,
    },
  ],
  concepts: [
    {
      id: "tavola",
      iteration: 1,
      status: "Non proseguito; alcuni elementi ripresi",
      name: "Tavola",
      tagline: "Il veicolo come disegno tecnico annotato.",
      summary:
        "Carta, inchiostro e linee sottili. Cifre monospaziate, un solo colore di segnale per focus e selezione. Le auto sono prospetti laterali a linea; i grafici sono tavole millimetrate con i punti dichiarati dal costruttore distinti dall’interpolazione.",
      swatches: [
        "#F3F0E8",
        "#FBFAF6",
        "#161616",
        "#4A4741",
        "#CFC9BC",
        "#C8361B",
        "#2251A3",
      ],
      fonts: "IBM Plex Sans · IBM Plex Mono",
      strengths: [
        "La più leggibile sulle schermate dense: tabelle, tag di fonte e cifre allineate.",
        "Rende visibile la provenienza dei dati (glifi per costruttore, stima, calcolo; punti della curva).",
        "Autorevole senza essere fredda; costo implementativo basso.",
      ],
      limits: [
        "Rischio di sembrare austera o “da ingegneri” per chi cerca solo un’auto adatta.",
        "Il disegno tecnico richiede un’illustrazione per ogni carrozzeria; senza, perde carattere.",
        "Coinvolgimento affidato alla qualità tipografica più che all’emozione.",
      ],
    },
    {
      id: "livrea",
      iteration: 1,
      status: "Scelto da approfondire",
      name: "Livrea",
      tagline:
        "Ogni veicolo nel confronto indossa un colore che lo segue ovunque.",
      summary:
        "Proposta audace: tipografia nera e pesante, blocchi pieni, colonna dei criteri in negativo. I quattro colori di livrea sono riservati all’identità dei veicoli selezionati e collegano schede, vassoio, colonne del confronto e linee dei grafici.",
      swatches: [
        "#0F0F10",
        "#FFFFFF",
        "#F6F5F1",
        "#2448D8",
        "#EF6A1F",
        "#11A37A",
        "#C23A8A",
      ],
      fonts: "Archivo Black · Archivo",
      strengths: [
        "La più riconoscibile; il colore ha una funzione (continuità del veicolo tra le viste).",
        "Il confronto si legge per colonne a colpo d’occhio, anche con quattro veicoli.",
        "Coinvolgente e accessibile a chi non ha competenze tecniche.",
      ],
      limits: [
        "Il colore non può indicare altro (stati, avvisi): la gerarchia si regge su peso e dimensione.",
        "Tipografia pesante e blocchi pieni stancano nelle sessioni lunghe; densità inferiore.",
        "Serve una regola rigorosa di assegnazione dei colori quando la selezione cambia.",
      ],
    },
    {
      id: "notturno",
      iteration: 1,
      status: "Non proseguito",
      name: "Notturno",
      tagline: "Un quadro strumenti di notte: si illumina ciò che serve ora.",
      summary:
        "Superfici grafite calde, testo in tre livelli di luce, ambra solo per focus, stato attivo e azione primaria. Le auto sono fotografie low-key in studio. I grafici mostrano in ombra ciò che è fuori portata e usano lo stato hover come elemento di lettura.",
      swatches: [
        "#141412",
        "#1C1B18",
        "#24221F",
        "#EDE9E1",
        "#8E887D",
        "#F2B24C",
        "#3A8EDB",
      ],
      fonts: "Barlow · Barlow Semi Condensed",
      strengths: [
        "Forte presenza automotive e atmosfera; le foto dei veicoli diventano protagoniste.",
        "La luce come gerarchia funziona bene per focus, righe evidenziate e stati attivi.",
        "Grafici molto leggibili su fondo scuro.",
      ],
      limits: [
        "Dipende da fotografie coerenti e di qualità, oggi non disponibili.",
        "Solo scuro: serve una variante chiara, che ne cambia profondamente il carattere.",
        "Rischio di scivolare nell’estetica “configuratore di lusso”; meno contrasto per il testo secondario.",
      ],
    },
    {
      id: "livrea-refined",
      iteration: 2,
      name: "Livrea Refined",
      tagline: "La vivacità di Livrea, calibrata per l’uso quotidiano.",
      summary:
        "Superfici chiare, Schibsted Grotesk, foto reali integrate nelle card. Il colore del veicolo diventa un segno piccolo e numerato; l’interfaccia ha un suo blu inchiostro e i segnali hanno toni propri. Tabelle leggere e grafici con i punti della curva, ripresi da Tavola.",
      swatches: [
        "#FAF8F4",
        "#FFFFFF",
        "#17171B",
        "#1E2A78",
        "#E8601C",
        "#11A37A",
        "#B8338E",
        "#6A3FD4",
      ],
      fonts: "Schibsted Grotesk",
      strengths: [
        "La più confortevole per sessioni lunghe; confronto e ricerca leggibili come in Tavola.",
        "Sistema cromatico completo: veicoli, azioni e segnali non si confondono.",
        "Fotografie integrate senza dominare; fattibile con un normale design system.",
      ],
      limits: [
        "Meno riconoscibile dell’originale: la personalità poggia su colore dei veicoli, tipografia e foto.",
        "Senza veicoli selezionati (landing) il colore è quasi assente.",
        "Il blu inchiostro dell’interfaccia e il viola del veicolo 4 vanno tenuti distinti nell’uso.",
      ],
    },
    {
      id: "livrea-expressive",
      iteration: 2,
      name: "Livrea Expressive",
      tagline:
        "La livrea come linguaggio: colore e strisce, targhe, cifre strette.",
      summary:
        "Anybody larga per i titoli e stretta per le cifre, Overpass per il testo. Ogni veicolo ha colore e numero di strisce; il giallo targa marca ciò che l’utente ha impostato. Foto grandi, con la livrea come fascia sotto l’immagine.",
      swatches: [
        "#F3EFE6",
        "#141414",
        "#FFD23F",
        "#2548E0",
        "#E8601C",
        "#11A37A",
        "#B8338E",
      ],
      fonts: "Anybody · Overpass",
      strengths: [
        "La più riconoscibile anche fuori dal confronto (titoli larghi, targhe, strisce).",
        "Identità del veicolo leggibile senza colore grazie alle strisce.",
        "Il giallo dà un significato visibile a criteri e condizioni scelti dall’utente.",
      ],
      limits: [
        "Il carattere largo occupa molto spazio; richiede regole di troncamento e titoli brevi.",
        "Più convenzioni da imparare (strisce, targhe gialle e nere).",
        "Maggior costo: font a larghezza variabile, componenti più specifici, foto di qualità a tutta larghezza.",
      ],
    },
    {
      id: "livrea-consolidated",
      iteration: 3,
      status: "Ultima iterazione · da validare",
      name: "Livrea Consolidated",
      tagline: "Leggera come Refined, riconoscibile come Expressive.",
      summary:
        "Layout, superfici, tabelle e Schibsted Grotesk di Refined. Inchiostro quasi nero per azioni e navigazione; giallo targa per ciò che l’utente imposta e che cambia i risultati (criteri, condizioni di simulazione) e per l’effetto delle sue modifiche; Cobalto, Mandarino, Smeraldo e Magenta per i veicoli, sempre con numero o marcatore. Foto come in Refined, su un segnaposto che mostra l’impostazione dello scatto.",
      swatches: [
        "#FAF8F4",
        "#FFFFFF",
        "#17171B",
        "#FFD23F",
        "#2548E0",
        "#E8601C",
        "#11A37A",
        "#B8338E",
      ],
      fonts: "Schibsted Grotesk",
      strengths: [
        "Conserva la leggibilità di Refined su ricerca, confronto e grafici: il colore è solo in segni, filetti, targhe e linee.",
        "Il giallo dà identità anche senza veicoli selezionati e collega criteri, confronto e simulazione.",
        "Nessun colore ha due significati: l’interfaccia non usa più il blu, che ora è il veicolo 1.",
      ],
      limits: [
        "Il giallo richiede disciplina: va distinta ogni volta una scelta di scenario (giallo) da una scelta di vista (inchiostro).",
        "Con l’inchiostro per le azioni, i link si distinguono per peso, freccia o sottolineatura, non per colore.",
        "La landing resta sobria; il carattere dipende ancora molto dalle future fotografie.",
      ],
    },
  ],
};
