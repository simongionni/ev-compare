// Contents of the visual identity review page. Edit this file to add concepts, screens or notes.
// SVG paths are relative to docs/ux/visual-identity/. Content hashes come from assets.js (generated).
window.VI_MANIFEST = {
  iteration: "Iterazione 1",
  updated: "2026-10-25",
  scenarios: [
    {
      id: "landing",
      file: "01-landing.svg",
      title: "Landing Page",
      size: [1440, 880],
    },
    {
      id: "discovery",
      file: "02-discovery.svg",
      title: "Vehicle Discovery — Active Criteria",
      size: [1440, 1330],
    },
    {
      id: "comparison",
      file: "03-comparison.svg",
      title: "Comparison — Selected Vehicles",
      size: [1440, 1628],
    },
    {
      id: "charging",
      file: "04-charging.svg",
      title: "Curve di ricarica DC",
      size: [1440, 1120],
    },
    {
      id: "identity",
      file: "00-identity.svg",
      title: "Identity sheet",
      size: [1440, 900],
    },
  ],
  concepts: [
    {
      id: "tavola",
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
  ],
};
