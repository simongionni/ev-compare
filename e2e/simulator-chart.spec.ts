import { expect, test, type Locator, type TestInfo } from "@playwright/test";
import {
  chart,
  chartInspection,
  expectScenario,
  finalSoc,
  initialSoc,
  openScenario,
  result,
} from "./simulator-helpers";

async function attachCandidate(
  locator: Locator,
  testInfo: TestInfo,
  name: string,
) {
  const path = testInfo.outputPath(`${name}.png`);
  await locator.screenshot({ path, animations: "disabled" });
  await testInfo.attach(name, { path, contentType: "image/png" });
}

test("E2E-043 chart exposes accepted series and visual roles", async ({
  page,
}, testInfo) => {
  await openScenario(page);
  const chartRegion = chart(page);
  const figure = chartRegion.locator("figure");

  await expect(
    figure.getByText("Potenza ricevuta", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    figure.getByText("Curva del veicolo", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    figure.getByText(
      /punto dichiarato dal costruttore \(illustrativo\).*interpolazione lineare/,
    ),
  ).toBeVisible();
  await expect(
    figure.getByText("colonnina 150 kW", { exact: true }),
  ).toBeVisible();
  await expect(figure.getByText("kW", { exact: true })).toBeVisible();
  for (const percentage of [
    "0%",
    "20%",
    "40%",
    "60%",
    "80%",
    "100%",
  ] as const) {
    await expect(
      figure.getByText(percentage, { exact: true }).first(),
    ).toBeVisible();
  }
  await expect(figure.getByRole("img")).toHaveAccessibleName(
    /Nordis E4.*colonnina 150 kW.*intervallo 10 → 80%/,
  );
  await expect(figure.getByRole("table")).toHaveAccessibleName(
    "Potenza di ricarica di Nordis E4 ai punti dichiarati, con colonnina 150 kW",
  );
  await expect(figure.getByRole("row")).toHaveCount(8);

  await expect(figure.locator("figcaption line")).toHaveCount(2);

  await attachCandidate(figure, testInfo, "E2E-043-chart-visual-candidate");
});

test("E2E-044 chart follows the scenario including an empty interval", async ({
  page,
}, testInfo) => {
  await openScenario(page);
  const chartImage = chart(page).getByRole("img");
  const firstResult = await result(page).innerText();

  await page.getByRole("radio", { name: "50 kW", exact: true }).click();
  await expectScenario(page, 50, 10, 80);
  await expect(chartImage).toHaveAccessibleName(
    /colonnina 50 kW.*intervallo 10 → 80%/,
  );
  await expect(
    chart(page).getByText("colonnina 50 kW", { exact: true }),
  ).toBeVisible();
  await expect.poll(() => result(page).innerText()).not.toBe(firstResult);

  await initialSoc(page).focus();
  await initialSoc(page).press("ArrowRight");
  await finalSoc(page).focus();
  await finalSoc(page).press("ArrowLeft");
  await expectScenario(page, 50, 11, 79);
  await expect(chartImage).toHaveAccessibleName(
    /colonnina 50 kW.*intervallo 11 → 79%/,
  );
  await expect(
    chart(page).getByText("intervallo 11 → 79%", { exact: true }),
  ).toBeVisible();
  await expect(result(page)).toContainText("da 11% a 79% · colonnina 50 kW");

  await openScenario(page, "?colonnina=150&inizio=80&fine=80");
  await expect(chartImage).toHaveAccessibleName(/intervallo 80 → 80%/);
  await expect(
    chart(page).getByText("intervallo 80 → 80%", { exact: true }),
  ).toBeVisible();
  await expect(result(page).getByText("0 min", { exact: true })).toBeVisible();
  await expect(result(page)).toContainText("+0,0 kWh nella batteria");
  await attachCandidate(
    chart(page).locator("figure"),
    testInfo,
    "E2E-044-empty-interval-marker-candidate",
  );
});

test("E2E-045 chart inspection works by pointer and keyboard and exposes text", async ({
  page,
}) => {
  await openScenario(page);
  const inspection = chartInspection(page);
  const box = await inspection.boundingBox();
  if (box === null) throw new Error("The chart inspection area is not visible");

  await page.mouse.move(box.x + box.width * 0.55, box.y + box.height / 2);
  const chartImage = chart(page).getByRole("img");
  await expect(chartImage.getByText("55%", { exact: true })).toBeVisible();
  await expect(
    chartImage.getByText("Potenza ricevuta", { exact: true }),
  ).toBeVisible();
  await expect(chartImage.getByText("150 kW", { exact: true })).toBeVisible();
  await expect(
    chartImage.getByText("Curva del veicolo", { exact: true }),
  ).toBeVisible();
  await expect(chartImage.getByText("175 kW", { exact: true })).toBeVisible();
  await expect(inspection).toHaveAttribute(
    "aria-valuetext",
    "55%: potenza ricevuta 150 kW, curva del veicolo 175 kW",
  );

  await inspection.focus();
  await inspection.press("Home");
  await inspection.press("ArrowRight");
  await expect(chartImage.getByText("1%", { exact: true })).toBeVisible();
  const keyboardDescription = await inspection.getAttribute("aria-valuetext");
  expect(keyboardDescription).toMatch(
    /^1%: potenza ricevuta (\d+ kW), curva del veicolo (\d+ kW)$/,
  );
  const powers = keyboardDescription?.match(/\d+ kW/g) ?? [];
  expect(powers).toHaveLength(2);
  for (const power of new Set(powers)) {
    await expect(
      chartImage.getByText(power, { exact: true }).last(),
    ).toBeVisible();
  }
});

test("E2E-049 chart inspection state is cleared after route navigation", async ({
  page,
}) => {
  await openScenario(page);
  const inspection = chartInspection(page);
  await inspection.focus();
  await inspection.press("End");
  await expect(inspection).toHaveAttribute(
    "aria-valuetext",
    "100%: potenza ricevuta 35 kW, curva del veicolo 35 kW",
  );
  await expect(
    chart(page).getByRole("img").getByText("35 kW", { exact: true }).last(),
  ).toBeVisible();

  await page.getByRole("link", { name: "Nordis E4" }).click();
  await expect(
    page.getByRole("heading", { name: "Nordis E4", level: 1 }),
  ).toBeVisible();
  await page
    .getByRole("link", {
      name: "Apri nel simulatore della ricarica DC di Nordis E4",
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "Ricarica rapida di Nordis E4" }),
  ).toBeVisible();
  await expect(chartInspection(page)).toHaveAttribute("aria-valuetext", "10%");
  await expect(
    chart(page).getByRole("img").getByText("35 kW", { exact: true }),
  ).toBeHidden();
});
