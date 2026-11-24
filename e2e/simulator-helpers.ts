import { expect, type Locator, type Page } from "@playwright/test";

export const simulatorPath = "/veicoli/nordis-e4/simulazione-dc";
export const defaultScenario = "?colonnina=150&inizio=10&fine=80";

export const initialSoc = (page: Page) =>
  page.getByRole("slider", { name: "Livello di carica iniziale" });
export const finalSoc = (page: Page) =>
  page.getByRole("slider", { name: "Livello di carica finale" });
export const result = (page: Page) =>
  page.getByRole("region", { name: "Risultato" });
export const chart = (page: Page) =>
  page.getByRole("region", { name: "Potenza per livello di carica" });
export const chartInspection = (page: Page) =>
  page.getByRole("slider", { name: /^Ispeziona il grafico:/ });

export async function expectPathAndSearch(page: Page, expected: string) {
  await expect(page).toHaveURL((url) => url.pathname + url.search === expected);
}

export async function expectScenario(
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

export async function openScenario(page: Page, query = defaultScenario) {
  await page.goto(`${simulatorPath}${query}`);
  await expect(
    page.getByRole("heading", { name: "Ricarica rapida di Nordis E4" }),
  ).toBeVisible();
}

export async function pixelsPerSocPoint(page: Page) {
  const initialBox = await initialSoc(page).boundingBox();
  const finalBox = await finalSoc(page).boundingBox();
  const initialValue = Number(
    await initialSoc(page).getAttribute("aria-valuenow"),
  );
  const finalValue = Number(await finalSoc(page).getAttribute("aria-valuenow"));
  if (
    initialBox === null ||
    finalBox === null ||
    !Number.isFinite(initialValue) ||
    !Number.isFinite(finalValue) ||
    initialValue === finalValue
  ) {
    throw new Error("The SoC slider thumbs cannot establish track geometry");
  }

  const initialCenter = initialBox.x + initialBox.width / 2;
  const finalCenter = finalBox.x + finalBox.width / 2;
  return (finalCenter - initialCenter) / (finalValue - initialValue);
}

export type HeldPointer = {
  readonly x: number;
  readonly y: number;
};

export async function pressThumb(
  page: Page,
  thumb: Locator,
): Promise<HeldPointer> {
  const box = await thumb.boundingBox();
  if (box === null) {
    throw new Error("The SoC thumb is not ready for pointer interaction");
  }

  const pointer = {
    x: box.x + box.width / 2,
    y: box.y + box.height / 2,
  };
  await page.mouse.move(pointer.x, pointer.y);
  await page.mouse.down();
  return pointer;
}

export async function startDragTo(
  page: Page,
  thumb: Locator,
  targetSoc: number,
  pixelsPerPoint: number,
): Promise<HeldPointer> {
  const currentValue = Number(await thumb.getAttribute("aria-valuenow"));
  if (!Number.isFinite(currentValue)) {
    throw new Error("The SoC thumb has no numeric accessible value");
  }

  const start = await pressThumb(page, thumb);
  const pointer = {
    x: start.x + (targetSoc - currentValue) * pixelsPerPoint,
    y: start.y,
  };
  await page.mouse.move(pointer.x, pointer.y, { steps: 8 });
  return pointer;
}

export async function moveHeldPointer(
  page: Page,
  pointer: HeldPointer,
  socDelta: number,
  pixelsPerPoint: number,
) {
  await page.mouse.move(pointer.x + socDelta * pixelsPerPoint, pointer.y, {
    steps: 8,
  });
}
