import { expect, test, type Locator, type Page } from "@playwright/test";

const catalogueInPriceOrder = [
  "Aurora Vela",
  "Nordis E4",
  "Brisa Family",
  "Talon S",
  "Meridian Tour",
] as const;

const vehicleLinks = (page: Page) =>
  page.getByRole("link", { name: /^Apri scheda di / });

async function expectVehicleLinks(
  links: Locator,
  vehicleNames: readonly string[],
) {
  await expect(links).toHaveCount(vehicleNames.length);
  for (const [index, name] of vehicleNames.entries()) {
    await expect(links.nth(index)).toHaveAccessibleName(
      `Apri scheda di ${name}`,
    );
  }
}

test("E2E-038 Discovery filters and replaces its URL on each keystroke without submit", async ({
  page,
}) => {
  await page.goto("/cerca");
  const search = page.getByRole("searchbox", { name: "Cerca marca o modello" });
  const initialHistoryLength = await page.evaluate(() => history.length);

  await search.pressSequentially("N");
  await expect(page.getByRole("heading", { name: "3 veicoli" })).toBeVisible();
  await expect(page).toHaveURL(
    (url) => url.pathname + url.search === "/cerca?q=N",
  );

  await search.pressSequentially("ordis");
  await expectVehicleLinks(vehicleLinks(page), ["Nordis E4"]);
  await expect(page).toHaveURL(
    (url) => url.pathname + url.search === "/cerca?q=Nordis",
  );

  await search.press("ControlOrMeta+A");
  await search.pressSequentially("fam");
  await expectVehicleLinks(vehicleLinks(page), ["Brisa Family"]);

  await search.press("ControlOrMeta+A");
  await search.pressSequentially("nOrDiS");
  await expectVehicleLinks(vehicleLinks(page), ["Nordis E4"]);

  await search.press("ControlOrMeta+A");
  await search.pressSequentially("Nordis");
  await expectVehicleLinks(vehicleLinks(page), ["Nordis E4"]);
  await expect(page).toHaveURL(
    (url) => url.pathname + url.search === "/cerca?q=Nordis",
  );
  expect(await page.evaluate(() => history.length)).toBe(initialHistoryLength);
});

test("E2E-039 Discovery renders price order and a no-match empty state", async ({
  page,
}) => {
  await page.goto("/cerca");

  await expect(page.getByRole("heading", { name: "5 veicoli" })).toBeVisible();
  await expectVehicleLinks(vehicleLinks(page), catalogueInPriceOrder);

  const search = page.getByRole("searchbox", { name: "Cerca marca o modello" });
  await search.pressSequentially("nessun-modello");
  await expect(
    page.getByRole("heading", { name: "Nessun veicolo" }),
  ).toBeVisible();
  await expect(
    page.getByText("Nessun modello corrisponde a “nessun-modello”.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Mostra tutti i veicoli" }),
  ).toBeVisible();
  await expect(vehicleLinks(page)).toHaveCount(0);
  await expect(page.getByText("Dati e veicoli illustrativi.")).toBeVisible();
});
