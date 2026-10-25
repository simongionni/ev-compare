// Content shared by all concepts. Copy and values come from the consolidated wireframes:
//   docs/ux/wireframes/consolidated-iteration-1/
//   docs/ux/wireframes/vehicle-comparison/
// Vehicles and data are illustrative, as in the wireframes.

export const nav = {
  brand: "EV Compare",
  items: ["Cerca", "Confronta", "Strumenti tecnici"],
  right: "Fonti e metodo",
};

export const landing = {
  title: "Trova l’auto elettrica adatta a te.",
  subtitle: "E capisci perché.",
  model: {
    heading: "Cerco un modello",
    query: "Nor",
    button: "Cerca",
    models: [
      { name: "Nordis E4", body: "SUV medio", action: "Apri la scheda ›" },
      { name: "Nordis E2", body: "Compatta", action: "Apri la scheda ›" },
    ],
    brands: [
      { name: "Tutti i modelli Nordis (3)", action: "Vedi i risultati ›" },
    ],
    all: "Cerca “Nor” in tutto il catalogo",
  },
  needs: {
    heading: "Parto dalle mie esigenze",
    chips: [
      "Budget",
      "Percorso quotidiano",
      "Viaggi lunghi",
      "Ricarica",
      "Spazio e posti",
      "Specifiche tecniche",
    ],
    cta: "Apri la ricerca per esigenze →",
  },
  direct: {
    heading: "Vai direttamente a",
    items: [
      {
        title: "Confronta veicoli",
        text: "Fino a 4 modelli, fianco a fianco.",
        link: "Apri il confronto →",
      },
      {
        title: "Strumenti tecnici",
        text: "Ricarica, consumi e autonomia.",
        link: "Apri gli strumenti →",
      },
      {
        title: "Fonti e metodo",
        text: "Da dove vengono dati e stime.",
        link: "Leggi il metodo →",
      },
    ],
  },
  footer: "Dati e veicoli illustrativi · Fonti e metodo · Contatti",
};

export const vehicles = {
  nordis: {
    name: "Nordis E4",
    body: "suv",
    kind: "SUV medio · 5 posti",
    price: "€41.500",
    trunk: "520 L",
    dc: "175 kW",
    stop: "1 sosta di ~22 min",
  },
  aurora: {
    name: "Aurora Vela",
    body: "compact",
    kind: "Compatta · 5 posti",
    price: "€32.900",
    trunk: "410 L",
    dc: "135 kW",
    stop: "1 sosta di ~28 min",
  },
  brisa: {
    name: "Brisa Family",
    body: "mpv",
    kind: "Monovolume · 7 posti",
    price: "€44.200",
    trunk: "720 L",
    dc: "130 kW",
    stop: "1 sosta di ~30 min",
  },
  meridian: {
    name: "Meridian Tour",
    body: "wagon",
    kind: "Station wagon · 5 posti · €46.800",
  },
  talon: {
    name: "Talon S",
    body: "sedan",
    kind: "Berlina sportiva · 5 posti · €44.900",
  },
};

export const discovery = {
  search: "Cerca marca o modello, oppure un’esigenza (es. “7 posti”)",
  criteriaTitle: "Criteri attivi (6)",
  reset: "Azzera",
  legend: { req: "Requisito: esclude", pref: "Preferenza: ordina" },
  requirements: [
    { label: "Budget", value: "fino a €45.000" },
    { label: "Bagagliaio", value: "almeno 400 L" },
    {
      label: "Potenza DC massima",
      value: "almeno 100 kW",
      spec: true,
      open: true,
    },
  ],
  editor: {
    min: "Minimo",
    minValue: "100 kW",
    from: "50 kW",
    to: "350 kW",
    behaviour: "Comportamento",
    req: "Requisito",
    pref: "Preferenza",
    explain: "Cosa significa?",
    explainAction: "Apri ▾",
    linkedKicker: "CRITERIO COLLEGATO",
    linkedTitle: "Tempo di ricarica 10→80%",
    linkedText: "colonnina da 150 kW, dalla curva del veicolo",
    linkedAction: "+ Aggiungi",
  },
  preferences: [
    { label: "Viaggi lunghi", value: "400 km, al massimo 1 sosta" },
    { label: "Uso quotidiano", value: "circa 60 km al giorno" },
    { label: "Ricarica", value: "a casa, wallbox 11 kW trifase" },
  ],
  addCriterion: "+ Aggiungi un criterio",
  categories: "Budget · Uso · Viaggi · Ricarica · Spazio · Specifiche",
  resultsTitle: "3 veicoli rispettano tutti i requisiti",
  resultsSub: "Ordinati per preferenze soddisfatte, poi per sosta più breve",
  views: ["Schede", "Elenco", "Differenze"],
  sort: "Ordina: preferenze",
  notice:
    "Bagagliaio almeno 400 L: da 4 a 3 compatibili. Talon S passa tra i quasi compatibili.",
  undo: "Annulla",
  tray: {
    label: "Nel confronto (2)",
    items: ["Nordis E4", "Aurora Vela"],
    diff: "Vedi le differenze",
    cta: "Confronta →",
  },
  results: [
    { id: "nordis", inCompare: true, specs: "520 L · 175 kW" },
    { id: "aurora", inCompare: true, specs: "410 L · 135 kW" },
    { id: "brisa", inCompare: false, specs: "720 L · 130 kW" },
  ],
  reqLabels: ["Budget", "Bagagliaio", "Potenza DC"],
  prefDaily: "Uso quotidiano e ricarica a casa: adatta",
  why: "Perché è qui ›",
  near: {
    title: "Quasi compatibili",
    sub: "Non rispettano un requisito.",
    items: [
      {
        id: "meridian",
        miss: "Budget: €46.800: €1.800 oltre il limite",
        fix: "Porta il budget a €47.000",
        flex: "Rendi flessibile il budget",
      },
      {
        id: "talon",
        miss: "Bagagliaio: 360 L: 40 L sotto il minimo",
        fix: "Abbassa il minimo a 360 L",
        flex: "Rendi flessibile il bagagliaio",
      },
    ],
    missKicker: "REQUISITO NON RISPETTATO",
  },
  deeper: {
    title: "Approfondisci",
    items: [
      {
        title: "Grafico delle differenze",
        text: "Prezzo, soste e spazio dei 3 compatibili a colpo d’occhio",
      },
      {
        title: "Simula un viaggio di 400 km",
        text: "Con i veicoli nel confronto e i tuoi criteri già impostati",
      },
    ],
  },
  footnote:
    "Dati e veicoli illustrativi. “~” indica una stima: 110 km/h, 20 °C, colonnine da 150 kW.",
  footlink: "Fonti, stime e limiti dei dati →",
};

// Comparison — Selected Vehicles. Each row: label, source tag, values [Nordis, Aurora], optional notes.
export const comparison = {
  context: {
    back: "‹ Ricerca",
    summary: "6 criteri · 3 compatibili",
    edit: "Modifica criteri",
  },
  title: "Confronto",
  count: "2 veicoli",
  rowsToggle: ["Tutte", "Solo differenze"],
  viewToggle: ["Tabella", "Grafico"],
  columns: ["nordis", "aurora"],
  actions: { open: "Apri scheda ›", replace: "Sostituisci", remove: "Rimuovi" },
  add: {
    title: "+ Aggiungi un veicolo",
    search: "Cerca un modello",
    kicker: "DAI TUOI RISULTATI",
    items: [
      { name: "Brisa Family", note: "€44.200" },
      { name: "Talon S", note: "quasi compatibile" },
    ],
  },
  criteria: {
    title: "Con i tuoi criteri",
    requirements: [
      { label: "Budget fino a €45.000", values: ["€41.500", "€32.900"] },
      {
        label: "Bagagliaio almeno 400 L",
        values: ["520 L", "410 L"],
        notes: [null, "10 L sopra il minimo"],
      },
      {
        label: "Potenza DC massima almeno 100 kW",
        values: ["175 kW", "135 kW"],
      },
    ],
    preferences: [
      {
        label: "Viaggio di 400 km, max 1 sosta",
        tag: "stima",
        values: ["1 sosta di ~22 min", "1 sosta di ~28 min"],
      },
      {
        label: "Circa 60 km al giorno",
        tag: "stima",
        values: ["ricarica ogni ~7 giorni", "ricarica ogni ~6 giorni"],
      },
      {
        label: "Ricarica a casa, wallbox 11 kW trifase",
        tag: "calcolo",
        values: ["20→100% in 5 h 36", "20→100% in 4 h 13"],
      },
    ],
  },
  others: {
    title: "Altre differenze",
    rows: [
      // num: numeric values for magnitude encodings (same unit within the row)
      {
        label: "Autonomia in autostrada, 110 km/h",
        tag: "stima",
        values: ["~380 km", "~300 km"],
        notes: ["+80 km", null],
        num: [380, 300],
        unit: "km",
      },
      {
        label: "Ricarica 10→80%, colonnina 150 kW",
        tag: "calcolo",
        values: ["22 min · +53,9 kWh", "27 min · +40,6 kWh"],
        num: [22, 27],
        unit: "min",
      },
      {
        label: "Consumo in autostrada",
        tag: "stima",
        values: ["20,3 kWh/100 km", "19,3 kWh/100 km"],
        num: [20.3, 19.3],
        unit: "kWh/100 km",
      },
    ],
  },
  details: {
    title: "Dettagli",
    hidden: "7 caratteristiche uguali nascoste",
    open: {
      title: "Autonomia e consumi",
      count: "4 differenze",
      rows: [
        {
          label: "Autonomia WLTP",
          tag: "costruttore",
          values: ["520 km", "410 km"],
        },
        {
          label: "Autonomia in autostrada, 110 km/h",
          tag: "stima",
          values: ["~380 km", "~300 km"],
        },
        {
          label: "Autonomia in autostrada, 0 °C",
          tag: "stima",
          values: ["~300 km", "~235 km"],
        },
        {
          label: "Batteria utile",
          tag: "costruttore",
          values: ["77 kWh", "58 kWh"],
        },
      ],
    },
    closed: [
      {
        title: "Ricarica",
        count: "5 differenze",
        action: "Simula la ricarica →",
      },
      { title: "Spazio e praticità", count: "4 differenze" },
      { title: "Prestazioni", count: "3 differenze" },
      { title: "Dimensioni e pesi", count: "6 differenze" },
    ],
  },
  simulations: {
    title: "Simulazioni",
    items: [
      {
        title: "Ricarica a parità di condizioni",
        text: "Stessa colonnina, stesso intervallo di carica",
        action: "Apri →",
      },
      {
        title: "Viaggio di 400 km",
        text: "Soste e tempo totale con lo stesso percorso",
        action: "Apri →",
        notImplemented: true,
      },
    ],
  },
  footnote:
    "Dati tecnici: costruttore (illustrativi). Autonomia, consumi e soste: stime EV Compare. Tempi di ricarica: calcolo con il simulatore.",
  footlink: "Fonti, metodo e limiti →",
};

// Technical view — DC charging under shared conditions (Comparison — Technical Exploration).
// Curve points are illustrative manufacturer data. Results and series were computed with
// simulateChargingSession from the M0.1 engine (station 150 kW, start 10 %).
export const charging = {
  title: "Ricarica a confronto",
  back: "‹ Confronto",
  backContext: "Nordis E4 · Aurora Vela",
  conditionsKicker: "STESSE CONDIZIONI PER ENTRAMBI",
  conditions: [
    {
      label: "Tipo di ricarica",
      options: ["Colonnina rapida (DC)", "Casa o colonnina AC"],
      active: 0,
    },
    {
      label: "Potenza della colonnina",
      options: ["50 kW", "150 kW", "350 kW"],
      active: 1,
    },
    { label: "Livello di carica", range: "10% → 80%" },
    {
      label: "Fine della ricarica",
      options: ["Al livello scelto", "Dopo un tempo"],
      active: 0,
    },
  ],
  station: 150,
  from: 10,
  to: 80,
  vehicles: [
    {
      id: "nordis",
      name: "Nordis E4",
      capacity: 77,
      maxDc: 175,
      curve: [
        [0, 140],
        [10, 165],
        [55, 175],
        [65, 155],
        [80, 110],
        [90, 70],
        [100, 35],
      ],
      result: {
        time: "22 min",
        energy: "+53,9 kWh nella batteria",
        avg: "potenza media 145 kW",
        limit: "limitata dalla colonnina (150 kW)",
      },
      at20: { kwh: 49.5, soc: 74 },
      end: { min: 22.23, kwh: 53.9 },
      // [minute, kWh stored] from 10 %, engine output
      energy: [
        [0, 0],
        [2, 5],
        [4, 10],
        [6, 15],
        [8, 20],
        [10, 25],
        [12, 30],
        [14, 35],
        [16, 40],
        [17, 42.5],
        [18, 44.98],
        [19, 47.31],
        [20, 49.5],
        [21, 51.55],
        [22, 53.48],
        [22.23, 53.9],
      ],
      stations: { 50: "65 min", 150: "22 min", 350: "20 min" },
    },
    {
      id: "aurora",
      name: "Aurora Vela",
      capacity: 58,
      maxDc: 135,
      curve: [
        [0, 100],
        [10, 120],
        [25, 135],
        [40, 120],
        [60, 80],
        [80, 40],
        [90, 30],
        [100, 20],
      ],
      result: {
        time: "27 min",
        energy: "+40,6 kWh nella batteria",
        avg: "potenza media 89 kW",
        limit: "limitata dalla curva del veicolo (max 135 kW)",
      },
      at20: { kwh: 34.5, soc: 70 },
      end: { min: 27.31, kwh: 40.6 },
      energy: [
        [0, 0],
        [1, 2.03],
        [2, 4.12],
        [3, 6.27],
        [4, 8.48],
        [5, 10.7],
        [6, 12.86],
        [8, 17],
        [10, 20.82],
        [12, 24.23],
        [14, 27.27],
        [16, 29.98],
        [18, 32.39],
        [20, 34.54],
        [22, 36.46],
        [24, 38.17],
        [26, 39.69],
        [27, 40.39],
        [27.31, 40.6],
      ],
      stations: { 50: "49 min", 150: "27 min", 350: "27 min" },
    },
  ],
  assumptions: [
    "Curve di ricarica del costruttore (illustrative)",
    "Energia immagazzinata nella batteria: quella prelevata dalla rete è maggiore",
    "Nessun effetto di temperatura o preriscaldamento",
    "Potenza della colonnina non condivisa con altri veicoli",
  ],
};

/** Effective DC power at a SoC: vehicle curve (linear between points), capped by vehicle max and station. */
export const effectivePower = (v, soc, station) =>
  Math.min(curvePower(v.curve, soc), v.maxDc, station);

export const curvePower = (curve, soc) => {
  for (let i = 0; i < curve.length - 1; i++) {
    const [s0, p0] = curve[i];
    const [s1, p1] = curve[i + 1];
    if (soc >= s0 && soc <= s1)
      return p0 + ((soc - s0) / (s1 - s0)) * (p1 - p0);
  }
  return curve[curve.length - 1][1];
};

/** Polyline points of a curve sampled every `step` SoC points, including breakpoints. */
export const sampleCurve = (fn, curve, step = 1) => {
  const xs = new Set();
  for (let s = 0; s <= 100; s += step) xs.add(s);
  curve.forEach(([s]) => xs.add(s));
  return [...xs].sort((a, b) => a - b).map((s) => [s, fn(s)]);
};
