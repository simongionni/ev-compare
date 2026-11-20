import { expect, test } from "@playwright/test";

test("E2E-040 vehicle analysis supports result direct and unknown-ID entry paths", async ({
  page,
  browser,
}) => {
  await page.goto("/cerca?q=Nordis");
  await page.getByRole("link", { name: "Apri scheda di Nordis E4" }).click();
  await expect(page).toHaveURL(/\/veicoli\/nordis-e4\?da=cerca&q=Nordis$/);
  await expect(
    page.getByRole("heading", { name: "Nordis E4", level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Risultati" })).toHaveAttribute(
    "href",
    "/cerca?q=Nordis",
  );
  const selectedAnalysis = await page.getByRole("main").innerText();

  const freshContext = await browser.newContext();
  try {
    const directPage = await freshContext.newPage();
    await directPage.goto("/veicoli/nordis-e4");
    await expect(
      directPage.getByRole("heading", { name: "Nordis E4", level: 1 }),
    ).toBeVisible();
    expect(await directPage.getByRole("main").innerText()).toBe(
      selectedAnalysis,
    );
    await expect(
      directPage
        .getByRole("navigation", { name: "Contesto" })
        .getByRole("link", { name: "Cerca" }),
    ).toHaveAttribute("href", "/cerca");

    const response = await directPage.goto("/veicoli/veicolo-sconosciuto");
    expect(response?.status()).toBe(404);
    await expect(
      directPage.getByRole("heading", { name: "Veicolo non trovato" }),
    ).toBeVisible();
    await expect(
      directPage.getByText(
        "Nel catalogo non c’è un veicolo con questo indirizzo.",
        { exact: true },
      ),
    ).toBeVisible();
  } finally {
    await freshContext.close();
  }
});
