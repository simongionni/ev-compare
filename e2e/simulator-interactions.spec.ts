import { expect, test, type Locator, type Page } from "@playwright/test";

const simulatorPath = "/veicoli/nordis-e4/simulazione-dc";
const defaultScenario = "?colonnina=150&inizio=10&fine=80";

const initialSoc = (page: Page) =>
  page.getByRole("slider", { name: "Livello di carica iniziale" });
const finalSoc = (page: Page) =>
  page.getByRole("slider", { name: "Livello di carica finale" });
const result = (page: Page) => page.getByRole("region", { name: "Risultato" });

async function expectPathAndSearch(page: Page, expected: string) {
  await expect(page).toHaveURL((url) => url.pathname + url.search === expected);
}

async function expectScenario(
  page: Page,
  stationKw: 50 | 150 | 350,
  initial: number,
  final: number,
) {
  await expect(
    page.getByRole("radio", { name: `${stationKw} kW`, exact: true }),
  ).toBeChecked();
  await expect(initialSoc(page)).toHaveAttribute(
    "aria-valuenow",
    String(initial),
  );
  await expect(finalSoc(page)).toHaveAttribute("aria-valuenow", String(final));
  await expect(
    page.getByText(`da ${initial}% a ${final}% · colonnina ${stationKw} kW`, {
      exact: true,
    }),
  ).toBeVisible();
}

async function openScenario(page: Page, query = defaultScenario) {
  await page.goto(`${simulatorPath}${query}`);
  await expect(
    page.getByRole("heading", { name: "Ricarica rapida di Nordis E4" }),
  ).toBeVisible();
}

async function pixelsPerSocPoint(page: Page) {
  const initialBox = await initialSoc(page).boundingBox();
  const finalBox = await finalSoc(page).boundingBox();
  if (initialBox === null || finalBox === null) {
    throw new Error("The SoC slider thumbs have no layout boxes");
  }

  const initialCenter = initialBox.x + initialBox.width / 2;
  const finalCenter = finalBox.x + finalBox.width / 2;
  return (finalCenter - initialCenter) / 70;
}

async function startDragTo(
  page: Page,
  thumb: Locator,
  targetSoc: number,
  pixelsPerPoint: number,
) {
  const box = await thumb.boundingBox();
  const currentValue = Number(await thumb.getAttribute("aria-valuenow"));
  if (box === null || !Number.isFinite(currentValue)) {
    throw new Error("The SoC thumb is not ready for pointer interaction");
  }

  const startX = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(startX, y);
  await page.mouse.down();
  await page.mouse.move(
    startX + (targetSoc - currentValue) * pixelsPerPoint,
    y,
    { steps: 8 },
  );
}

test("E2E-010 drag updates controls and results without changing URL or history", async ({
  page,
}) => {
  await openScenario(page);
  const pixelsPerPoint = await pixelsPerSocPoint(page);
  const urlBefore = page.url();
  const historyBefore = await page.evaluate(() => history.length);
  const resultBefore = await result(page).innerText();

  await startDragTo(page, initialSoc(page), 40, pixelsPerPoint);
  await expectScenario(page, 150, 40, 80);
  await expect.poll(() => result(page).innerText()).not.toBe(resultBefore);
  expect(page.url()).toBe(urlBefore);
  expect(await page.evaluate(() => history.length)).toBe(historyBefore);

  await page.mouse.up();
});

test("E2E-011 pointer release commits by replacement and retains the reached values", async ({
  page,
}) => {
  await openScenario(page);
  const pixelsPerPoint = await pixelsPerSocPoint(page);
  const historyBefore = await page.evaluate(() => history.length);

  await startDragTo(page, initialSoc(page), 40, pixelsPerPoint);
  await expectScenario(page, 150, 40, 80);
  const resultDuringDrag = await result(page).innerText();
  await page.mouse.up();

  await expectPathAndSearch(
    page,
    `${simulatorPath}?colonnina=150&inizio=40&fine=80`,
  );
  await expectScenario(page, 150, 40, 80);
  await expect.poll(() => result(page).innerText()).toBe(resultDuringDrag);
  expect(await page.evaluate(() => history.length)).toBe(historyBefore);
});

test("E2E-015 keyboard step commits and remains usable after external invalidation", async ({
  page,
}) => {
  await openScenario(page);
  const historyBefore = await page.evaluate(() => history.length);

  await initialSoc(page).focus();
  await initialSoc(page).press("ArrowRight");
  await expectPathAndSearch(
    page,
    `${simulatorPath}?colonnina=150&inizio=11&fine=80`,
  );
  await expectScenario(page, 150, 11, 80);
  expect(await page.evaluate(() => history.length)).toBe(historyBefore);

  await page.evaluate(() => {
    history.replaceState(null, "", "?colonnina=150&inizio=10&fine=invalid");
  });
  await expect(
    page.getByText("Parametri della simulazione non validi", { exact: true }),
  ).toBeVisible();
  await expectScenario(page, 150, 10, 80);
  expect(await page.evaluate(() => history.length)).toBe(historyBefore);

  await initialSoc(page).focus();
  await initialSoc(page).press("ArrowRight");
  await expectPathAndSearch(
    page,
    `${simulatorPath}?colonnina=150&inizio=11&fine=80`,
  );
  await expectScenario(page, 150, 11, 80);
  await expect(
    page.getByText("Parametri della simulazione non validi", { exact: true }),
  ).toBeHidden();
  expect(await page.evaluate(() => history.length)).toBe(historyBefore);
});

test("E2E-018 station choice is exclusive and commits results and URL immediately", async ({
  page,
}) => {
  await openScenario(page);
  const historyBefore = await page.evaluate(() => history.length);
  const stationGroup = page.getByRole("radiogroup", {
    name: "Potenza della colonnina",
  });
  const radios = stationGroup.getByRole("radio");
  await expect(radios).toHaveCount(3);
  for (const [index, name] of ["50 kW", "150 kW", "350 kW"].entries()) {
    await expect(radios.nth(index)).toHaveAccessibleName(name);
  }
  await expect(stationGroup.getByRole("radio", { checked: true })).toHaveCount(
    1,
  );
  const resultBefore = await result(page).innerText();

  await stationGroup.getByRole("radio", { name: "50 kW", exact: true }).click();
  await expectScenario(page, 50, 10, 80);
  await expect.poll(() => result(page).innerText()).not.toBe(resultBefore);
  await expectPathAndSearch(
    page,
    `${simulatorPath}?colonnina=50&inizio=10&fine=80`,
  );
  await expect(stationGroup.getByRole("radio", { checked: true })).toHaveCount(
    1,
  );
  expect(await page.evaluate(() => history.length)).toBe(historyBefore);
});

test("E2E-019 Nordis reference scenarios display approved Italian output formats", async ({
  page,
}) => {
  await openScenario(page);
  await expect(result(page).getByText("22 min", { exact: true })).toBeVisible();
  await expect(
    result(page).getByText("+53,9 kWh nella batteria", { exact: true }),
  ).toBeVisible();
  await expect(result(page)).not.toContainText("~");

  await page.getByRole("radio", { name: "50 kW", exact: true }).click();
  await expect(result(page).getByText("1 h 05", { exact: true })).toBeVisible();
  await expect(
    result(page).getByText("+53,9 kWh nella batteria", { exact: true }),
  ).toBeVisible();
  await expect(result(page)).not.toContainText("~");

  await page.getByRole("radio", { name: "350 kW", exact: true }).click();
  await expect(result(page).getByText("20 min", { exact: true })).toBeVisible();
  await expect(
    result(page).getByText("+53,9 kWh nella batteria", { exact: true }),
  ).toBeVisible();
  await expect(result(page)).not.toContainText("~");
});

test("E2E-020 SoC thumbs meet without crossing and an empty range shows zero results", async ({
  page,
}) => {
  await openScenario(page);
  const pixelsPerPoint = await pixelsPerSocPoint(page);

  await startDragTo(page, initialSoc(page), 95, pixelsPerPoint);
  await expectScenario(page, 150, 80, 80);
  await page.mouse.up();

  await expectPathAndSearch(
    page,
    `${simulatorPath}?colonnina=150&inizio=80&fine=80`,
  );
  await expectScenario(page, 150, 80, 80);
  await expect(result(page).getByText("0 min", { exact: true })).toBeVisible();
  await expect(
    result(page).getByText("+0,0 kWh nella batteria", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Parametri della simulazione non validi", { exact: true }),
  ).toHaveCount(0);
});

test("E2E-021 coincident SoC thumbs can separate left by lowering the initial bound", async ({
  page,
}) => {
  await openScenario(page);
  const pixelsPerPoint = await pixelsPerSocPoint(page);
  await openScenario(page, "?colonnina=150&inizio=50&fine=50");

  await startDragTo(page, finalSoc(page), 30, pixelsPerPoint);
  await page.mouse.up();

  await expectPathAndSearch(
    page,
    `${simulatorPath}?colonnina=150&inizio=30&fine=50`,
  );
  await expectScenario(page, 150, 30, 50);
  await expect(result(page).getByText("0 min", { exact: true })).toHaveCount(0);
});

test("E2E-021 coincident SoC thumbs can separate right by raising the final bound", async ({
  page,
}) => {
  await openScenario(page);
  const pixelsPerPoint = await pixelsPerSocPoint(page);
  await openScenario(page, "?colonnina=150&inizio=50&fine=50");

  await startDragTo(page, finalSoc(page), 70, pixelsPerPoint);
  await page.mouse.up();

  await expectPathAndSearch(
    page,
    `${simulatorPath}?colonnina=150&inizio=50&fine=70`,
  );
  await expectScenario(page, 150, 50, 70);
  await expect(result(page).getByText("0 min", { exact: true })).toHaveCount(0);
});
