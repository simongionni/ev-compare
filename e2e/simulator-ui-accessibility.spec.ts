import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  chart,
  chartInspection,
  expectScenario,
  finalSoc,
  initialSoc,
  openScenario,
  pixelsPerSocPoint,
  result,
  simulatorPath,
  startDragTo,
} from "./simulator-helpers";

test("E2E-041 Ricarica preview is fixed and opens the same vehicle default simulator", async ({
  page,
}) => {
  await page.goto("/veicoli/nordis-e4");
  const preview = page.getByRole("region", { name: "Ricarica" });

  await expect(
    preview.getByText("150 kW", { exact: true }).first(),
  ).toBeVisible();
  await expect(preview.getByText("10% → 80%", { exact: true })).toBeVisible();
  await expect(preview.getByText("22 min", { exact: true })).toBeVisible();
  await expect(
    preview.getByText("+53,9 kWh nella batteria", { exact: true }),
  ).toBeVisible();
  await expect(
    preview.getByRole("img", { name: /Grafico della potenza.*Nordis E4/ }),
  ).toBeVisible();
  await expect(preview.getByText(/Provenienza: calcolo$/)).toBeVisible();
  await expect(preview).toContainText("costruttore (illustrativa)");
  await expect(preview.getByRole("radiogroup")).toHaveCount(0);
  await expect(preview.getByRole("slider")).toHaveCount(0);

  await preview
    .getByRole("link", {
      name: "Apri nel simulatore della ricarica DC di Nordis E4",
    })
    .click();
  await expect(page).toHaveURL(new RegExp(`${simulatorPath}$`));
  await expectScenario(page, 150, 10, 80);
});

test("E2E-042 simulator controls expose accepted bounds steps and range constraint", async ({
  page,
}) => {
  await openScenario(page);
  const group = page.getByRole("radiogroup", {
    name: "Potenza della colonnina",
  });
  await expect(group.getByRole("radio")).toHaveCount(3);
  for (const [index, name] of ["50 kW", "150 kW", "350 kW"].entries()) {
    await expect(group.getByRole("radio").nth(index)).toHaveAccessibleName(
      name,
    );
  }

  for (const thumb of [initialSoc(page), finalSoc(page)]) {
    await expect(thumb).toHaveAttribute("min", "0");
    await expect(thumb).toHaveAttribute("max", "100");
    await expect(thumb).toHaveAttribute("step", "1");
  }
  await initialSoc(page).focus();
  await initialSoc(page).press("ArrowRight");
  await expectScenario(page, 150, 11, 80);
  await expect(initialSoc(page)).toHaveAttribute("aria-valuetext", "11%");
  await expect(page.getByText("11% → 80%", { exact: true })).toBeVisible();

  await initialSoc(page).press("End");
  await expectScenario(page, 150, 80, 80);
  await expect(initialSoc(page)).toHaveAttribute("aria-valuetext", "80%");
  await finalSoc(page).press("Home");
  await expectScenario(page, 150, 80, 80);

  await openScenario(page);
  const pixelsPerPoint = await pixelsPerSocPoint(page);
  await startDragTo(page, initialSoc(page), 95, pixelsPerPoint);
  await expectScenario(page, 150, 80, 80);
  await page.mouse.up();

  await openScenario(page);
  await startDragTo(page, finalSoc(page), 0, pixelsPerPoint);
  await expectScenario(page, 150, 10, 10);
  await page.mouse.up();
  await expect(finalSoc(page)).toHaveAttribute("aria-valuetext", "10%");
  await expect(page.getByText("10% → 10%", { exact: true })).toBeVisible();
});

const referenceScenarios = [
  {
    id: "nordis-e4",
    station: 50,
    time: "1 h 05",
    energy: "+53,9 kWh nella batteria",
  },
  {
    id: "nordis-e4",
    station: 150,
    time: "22 min",
    energy: "+53,9 kWh nella batteria",
  },
  {
    id: "nordis-e4",
    station: 350,
    time: "20 min",
    energy: "+53,9 kWh nella batteria",
  },
  {
    id: "aurora-vela",
    station: 50,
    time: "49 min",
    energy: "+40,6 kWh nella batteria",
  },
  {
    id: "aurora-vela",
    station: 150,
    time: "27 min",
    energy: "+40,6 kWh nella batteria",
  },
  {
    id: "aurora-vela",
    station: 350,
    time: "27 min",
    energy: "+40,6 kWh nella batteria",
  },
] as const;

test("E2E-046 all M0.2 reference scenarios render approved outputs", async ({
  page,
}) => {
  for (const scenario of referenceScenarios) {
    await page.goto(
      `/veicoli/${scenario.id}/simulazione-dc?colonnina=${scenario.station}&inizio=10&fine=80`,
    );
    const output = result(page);
    await expect(
      output.getByText(scenario.time, { exact: true }),
    ).toBeVisible();
    await expect(
      output.getByText(scenario.energy, { exact: true }),
    ).toBeVisible();
    await expect(output).toContainText(
      `da 10% a 80% · colonnina ${scenario.station} kW`,
    );
    await expect(output).not.toContainText("~");
  }
});

test("E2E-050 pages expose provenance illustrative notices and labelled placeholders without estimates", async ({
  page,
}) => {
  await page.goto("/veicoli/nordis-e4");
  const main = page.getByRole("main");
  await expect(
    main.getByRole("img", {
      name: "Foto segnaposto: Nordis E4, vista ¾ anteriore",
    }),
  ).toBeVisible();
  await expect(main.getByText(/Provenienza: costruttore$/)).toHaveCount(4);
  await expect(main.getByText(/Provenienza: calcolo$/)).toBeVisible();
  await expect(
    main.getByText("Dati e veicoli illustrativi.", { exact: true }),
  ).toBeVisible();
  await expect(main).toContainText(
    "punto dichiarato dal costruttore (illustrativo)",
  );
  await expect(main).not.toContainText("stima");
  await expect(main).not.toContainText("~");

  await page.goto(simulatorPath);
  await expect(result(page).getByText(/Provenienza: calcolo$/)).toBeVisible();
  await expect(chart(page)).toContainText("costruttore (illustrativo)");
  await expect(page.getByRole("main")).toContainText(
    "Dati e veicoli illustrativi.",
  );
  await expect(page.getByRole("main")).not.toContainText("stima");
  await expect(page.getByRole("main")).not.toContainText("~");
});

async function expectVisibleFocus(page: Page, locator: Locator) {
  await expect(locator).toBeFocused();
  // A keyboard action establishes keyboard modality consistently across engines while preserving
  // focus on the control under test.
  await page.keyboard.press("Shift");
  const focus = await locator.evaluate((element) => {
    let current: Element | null = element;
    while (current !== null) {
      const style = getComputedStyle(current);
      if (
        (style.outlineStyle !== "none" &&
          Number.parseFloat(style.outlineWidth) >= 2) ||
        style.boxShadow !== "none"
      ) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  });
  expect(focus).toBe(true);
}

test("E2E-052 implemented interactions complete the path with keyboard and visible focus", async ({
  page,
}) => {
  await page.goto("/cerca");
  const search = page.getByRole("searchbox", { name: "Cerca marca o modello" });
  await search.focus();
  await expectVisibleFocus(page, search);
  await search.pressSequentially("Nordis");

  const resultLink = page.getByRole("link", {
    name: "Apri scheda di Nordis E4",
  });
  await resultLink.focus();
  await expectVisibleFocus(page, resultLink);
  await resultLink.press("Enter");
  const resultsReturn = page.getByRole("link", { name: "Risultati" });
  await resultsReturn.focus();
  await expectVisibleFocus(page, resultsReturn);
  await resultsReturn.press("Enter");

  await resultLink.focus();
  await resultLink.press("Enter");
  const simulatorLink = page.getByRole("link", {
    name: "Apri nel simulatore della ricarica DC di Nordis E4",
  });
  await simulatorLink.focus();
  await expectVisibleFocus(page, simulatorLink);
  await simulatorLink.press("Enter");

  const selectedStation = page.getByRole("radio", {
    name: "150 kW",
    exact: true,
  });
  await selectedStation.focus();
  await expectVisibleFocus(page, selectedStation);
  await selectedStation.press("ArrowRight");
  await expectScenario(page, 350, 10, 80);

  await initialSoc(page).focus();
  await expectVisibleFocus(page, initialSoc(page));
  await initialSoc(page).press("ArrowRight");
  await finalSoc(page).focus();
  await finalSoc(page).press("ArrowLeft");
  await expectScenario(page, 350, 11, 79);

  await chartInspection(page).focus();
  await expectVisibleFocus(page, chartInspection(page));
  await chartInspection(page).press("ArrowRight");
  await expect(chartInspection(page)).toHaveAttribute("aria-valuenow", "12");

  const vehicleReturn = page.getByRole("link", { name: "Nordis E4" });
  await vehicleReturn.focus();
  await expectVisibleFocus(page, vehicleReturn);
  await vehicleReturn.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Nordis E4", level: 1 }),
  ).toBeVisible();
});

type ContrastSample = { foreground: string; background: string; ratio: number };

async function contrastSample(locator: Locator): Promise<ContrastSample> {
  return locator.evaluate((element) => {
    function parseRgb(value: string) {
      const channels = value
        .match(/[\d.]+/g)
        ?.slice(0, 3)
        .map(Number);
      if (channels === undefined || channels.length !== 3)
        throw new Error(`Unsupported colour: ${value}`);
      return channels;
    }
    function luminance(value: string) {
      const channels = parseRgb(value).map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.04045
          ? normalized / 12.92
          : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    }
    const foreground = getComputedStyle(element).color;
    let ancestor: Element | null = element;
    let background = "rgba(0, 0, 0, 0)";
    while (ancestor !== null) {
      background = getComputedStyle(ancestor).backgroundColor;
      if (!background.endsWith(", 0)")) break;
      ancestor = ancestor.parentElement;
    }
    const lighter = Math.max(luminance(foreground), luminance(background));
    const darker = Math.min(luminance(foreground), luminance(background));
    return {
      foreground,
      background,
      ratio: (lighter + 0.05) / (darker + 0.05),
    };
  });
}

test("E2E-053 pages expose names values text alternatives contrast and Italian language", async ({
  page,
}) => {
  await openScenario(page);
  await expect(page.locator("html")).toHaveAttribute("lang", "it");
  await expect(page.getByRole("radiogroup")).toHaveAccessibleName(
    "Potenza della colonnina",
  );
  await expect(initialSoc(page)).toHaveAccessibleName(
    "Livello di carica iniziale",
  );
  await expect(initialSoc(page)).toHaveAttribute("aria-valuenow", "10");
  await expect(initialSoc(page)).toHaveAttribute("aria-valuetext", "10%");
  await expect(finalSoc(page)).toHaveAccessibleName("Livello di carica finale");
  await expect(finalSoc(page)).toHaveAttribute("aria-valuenow", "80");
  await expect(finalSoc(page)).toHaveAttribute("aria-valuetext", "80%");
  await expect(chartInspection(page)).toHaveAccessibleName(
    "Ispeziona il grafico: potenza per livello di carica di Nordis E4",
  );
  await expect(chart(page).getByRole("table")).toHaveAccessibleName(
    /punti dichiarati.*colonnina 150 kW/,
  );
  await expect(chart(page)).toContainText("Potenza ricevuta");
  await expect(chart(page)).toContainText("Curva del veicolo");
  await expect(chart(page)).toContainText(
    "punto dichiarato dal costruttore (illustrativo)",
  );
  await expect(chart(page)).toContainText("interpolazione lineare");

  const bodyContrast = await contrastSample(page.locator("body"));
  expect(bodyContrast.ratio).toBeGreaterThanOrEqual(4.5);
  const noteContrast = await contrastSample(
    page.getByText("Dati e veicoli illustrativi."),
  );
  expect(noteContrast.ratio).toBeGreaterThanOrEqual(5.2);
  const selectedContrast = await contrastSample(
    page.getByRole("radio", { name: "150 kW", exact: true }),
  );
  expect(Number(selectedContrast.ratio.toFixed(1))).toBe(12.4);
});
