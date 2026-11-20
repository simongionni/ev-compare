import { expect, test, type Page } from "@playwright/test";

const simulatorPath = "/veicoli/nordis-e4/simulazione-dc";

async function expectScenario(
  page: Page,
  stationKw: 50 | 150 | 350,
  initialSoc: number,
  finalSoc: number,
) {
  await expect(
    page.getByRole("heading", { name: "Ricarica rapida di Nordis E4" }),
  ).toBeVisible();
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

test("E2E-001 simulator URL resolves default, partial, reordered and equivalent scenarios", async ({
  page,
}) => {
  await page.goto(simulatorPath);
  await expectScenario(page, 150, 10, 80);
  await expect(page.getByText("22 min", { exact: true })).toBeVisible();
  await expect(
    page.getByText("+53,9 kWh nella batteria", { exact: true }),
  ).toBeVisible();

  await page.goto(`${simulatorPath}?inizio=20`);
  await expectScenario(page, 150, 20, 80);

  await page.goto(`${simulatorPath}?fine=70&colonnina=50&inizio=20`);
  await expectScenario(page, 50, 20, 70);

  await page.goto(
    `${simulatorPath}?inizio=%32%30&fine=%37%30&colonnina=%35%30`,
  );
  await expectScenario(page, 50, 20, 70);
});

test("E2E-002 invalid shared scenario falls back visibly and preserves a valid origin", async ({
  page,
}) => {
  await page.goto(
    `${simulatorPath}?da=cerca&q=Nordis&colonnina=50&inizio=20&fine=invalid`,
  );

  await expect(
    page.getByText("Parametri della simulazione non validi", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Il collegamento non descrive uno scenario valido: è mostrato lo scenario predefinito.",
      { exact: true },
    ),
  ).toBeVisible();
  await expectScenario(page, 150, 10, 80);

  const returnLink = page.getByRole("link", { name: "Nordis E4" });
  await expect(returnLink).toHaveAttribute(
    "href",
    "/veicoli/nordis-e4?da=cerca&q=Nordis",
  );
  await returnLink.click();
  await expect(page.getByRole("link", { name: "Risultati" })).toHaveAttribute(
    "href",
    "/cerca?q=Nordis",
  );
});

test("E2E-024 shared simulator URL reproduces the scenario in a fresh context", async ({
  page,
  browser,
}) => {
  await page.goto(`${simulatorPath}?colonnina=50&inizio=20&fine=70`);
  await expectScenario(page, 50, 20, 70);

  const sourceResult = await page
    .getByRole("region", { name: "Risultato" })
    .innerText();
  const sharedUrl = page.url();

  const freshContext = await browser.newContext();
  try {
    const freshPage = await freshContext.newPage();
    await freshPage.goto(sharedUrl);
    await expectScenario(freshPage, 50, 20, 70);
    const freshResult = await freshPage
      .getByRole("region", { name: "Risultato" })
      .innerText();
    expect(freshResult).toBe(sourceResult);
  } finally {
    await freshContext.close();
  }
});
