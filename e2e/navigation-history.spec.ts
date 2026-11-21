import { expect, test, type Page } from "@playwright/test";

const analysisPath = "/veicoli/nordis-e4";
const simulatorPath = `${analysisPath}/simulazione-dc`;

async function expectPathAndSearch(page: Page, expected: string) {
  await expect(page).toHaveURL((url) => url.pathname + url.search === expected);
}

async function expectScenario(
  page: Page,
  stationKw: 50 | 150 | 350,
  initialSoc: number,
  finalSoc: number,
) {
  await expect(
    page.getByRole("radio", { name: `${stationKw} kW`, exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("slider", { name: "Livello di carica iniziale" }),
  ).toHaveAttribute("aria-valuenow", String(initialSoc));
  await expect(
    page.getByRole("slider", { name: "Livello di carica finale" }),
  ).toHaveAttribute("aria-valuenow", String(finalSoc));
  await expect(
    page.getByText(
      `da ${initialSoc}% a ${finalSoc}% · colonnina ${stationKw} kW`,
      { exact: true },
    ),
  ).toBeVisible();
}

async function openNordisFromDiscovery(page: Page) {
  await page.goto("/cerca?q=nordis");
  await page.getByRole("link", { name: "Apri scheda di Nordis E4" }).click();
  await expectPathAndSearch(page, `${analysisPath}?da=cerca&q=nordis`);
}

async function expectNordisDiscovery(page: Page) {
  await expectPathAndSearch(page, "/cerca?q=nordis");
  await expect(
    page.getByRole("searchbox", { name: "Cerca marca o modello" }),
  ).toHaveValue("nordis");
  await expect(page.getByRole("heading", { name: "1 veicolo" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Apri scheda di Nordis E4" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /^Apri scheda di / }),
  ).toHaveCount(1);
}

test("E2E-025 navigation pushes once while simulator commits replace and Forward restores", async ({
  page,
}) => {
  await page.goto(analysisPath);
  const analysisHistoryLength = await page.evaluate(() => history.length);

  await page
    .getByRole("link", {
      name: "Apri nel simulatore della ricarica DC di Nordis E4",
    })
    .click();
  await expectPathAndSearch(page, simulatorPath);
  await expectScenario(page, 150, 10, 80);
  expect(await page.evaluate(() => history.length)).toBe(
    analysisHistoryLength + 1,
  );

  await page.getByRole("radio", { name: "350 kW", exact: true }).click();
  await expectPathAndSearch(
    page,
    `${simulatorPath}?colonnina=350&inizio=10&fine=80`,
  );
  await expectScenario(page, 350, 10, 80);
  expect(await page.evaluate(() => history.length)).toBe(
    analysisHistoryLength + 1,
  );

  const initialSoc = page.getByRole("slider", {
    name: "Livello di carica iniziale",
  });
  await initialSoc.focus();
  await initialSoc.press("ArrowRight");
  await expectPathAndSearch(
    page,
    `${simulatorPath}?colonnina=350&inizio=11&fine=80`,
  );
  await expectScenario(page, 350, 11, 80);
  expect(await page.evaluate(() => history.length)).toBe(
    analysisHistoryLength + 1,
  );

  await page.goBack();
  await expectPathAndSearch(page, analysisPath);
  await expect(
    page.getByRole("heading", { name: "Nordis E4", level: 1 }),
  ).toBeVisible();

  await page.goForward();
  await expectPathAndSearch(
    page,
    `${simulatorPath}?colonnina=350&inizio=11&fine=80`,
  );
  await expectScenario(page, 350, 11, 80);
});

test("E2E-027 ordinary route navigation preserves origin and simulator scenario", async ({
  page,
}) => {
  await openNordisFromDiscovery(page);
  await expect(page.getByRole("link", { name: "Risultati" })).toHaveAttribute(
    "href",
    "/cerca?q=nordis",
  );

  await page
    .getByRole("link", {
      name: "Apri nel simulatore della ricarica DC di Nordis E4",
    })
    .click();
  await expectPathAndSearch(page, `${simulatorPath}?da=cerca&q=nordis`);
  await expectScenario(page, 150, 10, 80);
  await expect(page.getByRole("link", { name: "Nordis E4" })).toHaveAttribute(
    "href",
    `${analysisPath}?da=cerca&q=nordis`,
  );

  await page.getByRole("radio", { name: "350 kW", exact: true }).click();
  const committedSimulatorUrl = `${simulatorPath}?da=cerca&q=nordis&colonnina=350&inizio=10&fine=80`;
  await expectPathAndSearch(page, committedSimulatorUrl);
  await expectScenario(page, 350, 10, 80);

  await page.getByRole("link", { name: "Nordis E4" }).click();
  await expectPathAndSearch(page, `${analysisPath}?da=cerca&q=nordis`);
  await expect(page.getByRole("link", { name: "Risultati" })).toHaveAttribute(
    "href",
    "/cerca?q=nordis",
  );

  await page.goBack();
  await expectPathAndSearch(page, committedSimulatorUrl);
  await expectScenario(page, 350, 10, 80);
  await expect(page.getByRole("link", { name: "Nordis E4" })).toHaveAttribute(
    "href",
    `${analysisPath}?da=cerca&q=nordis`,
  );
});

test("E2E-028 simulator return opens the same analysis and reference preview", async ({
  page,
}) => {
  await page.goto(`${simulatorPath}?da=cerca&q=nordis`);
  await page.getByRole("link", { name: "Nordis E4" }).click();

  await expectPathAndSearch(page, `${analysisPath}?da=cerca&q=nordis`);
  await expect(
    page.getByRole("heading", { name: "Nordis E4", level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Risultati" })).toHaveAttribute(
    "href",
    "/cerca?q=nordis",
  );

  const preview = page.getByRole("region", { name: "Ricarica" });
  await expect(
    preview.getByRole("definition").filter({ hasText: /^150 kW$/ }),
  ).toBeVisible();
  await expect(
    preview.getByRole("definition").filter({ hasText: /^10% → 80%$/ }),
  ).toBeVisible();
  await expect(
    preview.getByRole("definition").filter({ hasText: /^22 min$/ }),
  ).toBeVisible();
  await expect(
    preview
      .getByRole("definition")
      .filter({ hasText: /^\+53,9 kWh nella batteria$/ }),
  ).toBeVisible();
  await expect(
    preview.getByRole("link", {
      name: "Apri nel simulatore della ricarica DC di Nordis E4",
    }),
  ).toHaveAttribute("href", `${simulatorPath}?da=cerca&q=nordis`);
});

test("E2E-048 Results link restores the Discovery scenario", async ({
  page,
}) => {
  await openNordisFromDiscovery(page);
  await page.getByRole("link", { name: "Risultati" }).click();
  await expectNordisDiscovery(page);
});

test("E2E-048 browser Back restores the Discovery scenario", async ({
  page,
}) => {
  await openNordisFromDiscovery(page);
  await page.goBack();
  await expectNordisDiscovery(page);
});
