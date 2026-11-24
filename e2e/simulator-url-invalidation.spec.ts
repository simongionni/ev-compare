import { expect, test, type Page } from "@playwright/test";
import {
  defaultScenario,
  expectPathAndSearch,
  expectScenario,
  initialSoc,
  moveHeldPointer,
  openScenario,
  pixelsPerSocPoint,
  pressThumb,
  result,
  simulatorPath,
  startDragTo,
  type HeldPointer,
} from "./simulator-helpers";

const encodedScenario = "?colonnina=150&inizio=10&fine=%38%30";
const otherScenario = "?colonnina=50&inizio=20&fine=60";
const invalidScenario = "?colonnina=150&inizio=10&fine=oops";

async function replaceUrl(page: Page, url: string) {
  await page.evaluate((nextUrl) => {
    history.replaceState(null, "", nextUrl);
  }, url);
}

async function pushUrl(page: Page, url: string) {
  await page.evaluate((nextUrl) => {
    history.pushState(null, "", nextUrl);
  }, url);
}

async function expectHistoryLength(page: Page, expected: number) {
  await expect.poll(() => page.evaluate(() => history.length)).toBe(expected);
}

async function finishStaleDrag(
  page: Page,
  pointer: HeldPointer,
  pixelsPerPoint: number,
  expectedPathAndSearch: string,
  stationKw: 50 | 150 | 350,
  initial: number,
  final: number,
) {
  const historyLength = await page.evaluate(() => history.length);
  await moveHeldPointer(page, pointer, 15, pixelsPerPoint);
  await expectScenario(page, stationKw, initial, final);
  await expectPathAndSearch(page, expectedPathAndSearch);
  await expectHistoryLength(page, historyLength);
  await page.mouse.up();
  await expectScenario(page, stationKw, initial, final);
  await expectPathAndSearch(page, expectedPathAndSearch);
  await expectHistoryLength(page, historyLength);
}

test("E2E-003 pointer release canonicalises the URL and permits a following commit", async ({
  page,
}) => {
  await openScenario(page, encodedScenario);
  const pixelsPerPoint = await pixelsPerSocPoint(page);
  await expectPathAndSearch(page, `${simulatorPath}${encodedScenario}`);

  await startDragTo(page, initialSoc(page), 30, pixelsPerPoint);
  await expectScenario(page, 150, 30, 80);
  await expectPathAndSearch(page, `${simulatorPath}${encodedScenario}`);
  await page.mouse.up();
  await expectPathAndSearch(
    page,
    `${simulatorPath}?colonnina=150&inizio=30&fine=80`,
  );
  await expectScenario(page, 150, 30, 80);

  await startDragTo(page, initialSoc(page), 40, pixelsPerPoint);
  await expectScenario(page, 150, 40, 80);
  await page.mouse.up();
  await expectPathAndSearch(
    page,
    `${simulatorPath}?colonnina=150&inizio=40&fine=80`,
  );
  await expectScenario(page, 150, 40, 80);
});

test("E2E-004 external invalid URL cancels a pending drag", async ({
  page,
}) => {
  await openScenario(page);
  const pixelsPerPoint = await pixelsPerSocPoint(page);
  const pointer = await startDragTo(page, initialSoc(page), 50, pixelsPerPoint);
  await expectScenario(page, 150, 50, 80);

  await replaceUrl(page, invalidScenario);
  await expect(
    page.getByText("Parametri della simulazione non validi", { exact: true }),
  ).toBeVisible();
  await expectScenario(page, 150, 10, 80);
  await finishStaleDrag(
    page,
    pointer,
    pixelsPerPoint,
    `${simulatorPath}${invalidScenario}`,
    150,
    10,
    80,
  );
});

test("E2E-005 external different scenario cancels a pending drag", async ({
  page,
}) => {
  await openScenario(page);
  const pixelsPerPoint = await pixelsPerSocPoint(page);
  const pointer = await startDragTo(page, initialSoc(page), 50, pixelsPerPoint);
  await expectScenario(page, 150, 50, 80);

  await replaceUrl(page, otherScenario);
  await expectScenario(page, 50, 20, 60);
  await finishStaleDrag(
    page,
    pointer,
    pixelsPerPoint,
    `${simulatorPath}${otherScenario}`,
    50,
    20,
    60,
  );
});

test("E2E-006 raw URL change cancels a drag even when the resolved scenario is equal", async ({
  page,
}) => {
  const equivalentUrls = [
    "?colonnina=150&inizio=10",
    "?inizio=10&fine=80&colonnina=150",
    "",
    encodedScenario,
  ];

  for (const query of equivalentUrls) {
    await openScenario(page);
    const pixelsPerPoint = await pixelsPerSocPoint(page);
    const pointer = await startDragTo(
      page,
      initialSoc(page),
      50,
      pixelsPerPoint,
    );
    await expectScenario(page, 150, 50, 80);

    await replaceUrl(page, query === "" ? simulatorPath : query);
    await expectScenario(page, 150, 10, 80);
    await finishStaleDrag(
      page,
      pointer,
      pixelsPerPoint,
      `${simulatorPath}${query}`,
      150,
      10,
      80,
    );
  }
});

test("E2E-007 and E2E-008 equivalent rewrite immediately drops pending state permanently", async ({
  page,
}) => {
  await openScenario(page);
  const pixelsPerPoint = await pixelsPerSocPoint(page);
  const time = result(page).getByText("22 min", { exact: true });
  const energy = result(page).getByText("+53,9 kWh nella batteria", {
    exact: true,
  });
  await expect(time).toBeVisible();
  await expect(energy).toBeVisible();
  const pointer = await startDragTo(page, initialSoc(page), 50, pixelsPerPoint);
  await expectScenario(page, 150, 50, 80);
  await expect(time).toBeHidden();
  await expect(energy).toBeHidden();

  await replaceUrl(page, encodedScenario);
  await expectScenario(page, 150, 10, 80);
  await expect(time).toBeVisible();
  await expect(energy).toBeVisible();
  await expectPathAndSearch(page, `${simulatorPath}${encodedScenario}`);

  await replaceUrl(page, defaultScenario);
  await expectScenario(page, 150, 10, 80);
  await expect(time).toBeVisible();
  await expect(energy).toBeVisible();
  await expectPathAndSearch(page, `${simulatorPath}${defaultScenario}`);
  await finishStaleDrag(
    page,
    pointer,
    pixelsPerPoint,
    `${simulatorPath}${defaultScenario}`,
    150,
    10,
    80,
  );
});

test("E2E-009 Back and Forward between equivalent encodings keep pending state dropped", async ({
  page,
}) => {
  await openScenario(page);
  const pixelsPerPoint = await pixelsPerSocPoint(page);
  const pointer = await startDragTo(page, initialSoc(page), 50, pixelsPerPoint);
  await expectScenario(page, 150, 50, 80);
  const historyLength = await page.evaluate(() => history.length);

  await pushUrl(page, encodedScenario);
  await expectHistoryLength(page, historyLength + 1);
  await expectScenario(page, 150, 10, 80);
  await expectPathAndSearch(page, `${simulatorPath}${encodedScenario}`);

  await page.goBack();
  await expectPathAndSearch(page, `${simulatorPath}${defaultScenario}`);
  await expectScenario(page, 150, 10, 80);
  await page.goForward();
  await expectPathAndSearch(page, `${simulatorPath}${encodedScenario}`);
  await expectScenario(page, 150, 10, 80);
  await finishStaleDrag(
    page,
    pointer,
    pixelsPerPoint,
    `${simulatorPath}${encodedScenario}`,
    150,
    10,
    80,
  );
});

test("E2E-012 Back and Forward during a drag restore URL state and discard the gesture", async ({
  page,
}) => {
  await openScenario(page);
  const pixelsPerPoint = await pixelsPerSocPoint(page);
  const pointer = await startDragTo(page, initialSoc(page), 50, pixelsPerPoint);
  await expectScenario(page, 150, 50, 80);

  await pushUrl(page, otherScenario);
  await expectPathAndSearch(page, `${simulatorPath}${otherScenario}`);
  await expectScenario(page, 50, 20, 60);
  await page.goBack();
  await expectPathAndSearch(page, `${simulatorPath}${defaultScenario}`);
  await expectScenario(page, 150, 10, 80);
  await page.goForward();
  await expectPathAndSearch(page, `${simulatorPath}${otherScenario}`);
  await expectScenario(page, 50, 20, 60);
  await page.goBack();
  await expectPathAndSearch(page, `${simulatorPath}${defaultScenario}`);
  await expectScenario(page, 150, 10, 80);
  await finishStaleDrag(
    page,
    pointer,
    pixelsPerPoint,
    `${simulatorPath}${defaultScenario}`,
    150,
    10,
    80,
  );
});

test("E2E-013 new drag works after stale release", async ({ page }) => {
  await openScenario(page);
  const pixelsPerPoint = await pixelsPerSocPoint(page);
  await startDragTo(page, initialSoc(page), 50, pixelsPerPoint);
  await expectScenario(page, 150, 50, 80);
  const historyLength = await page.evaluate(() => history.length);

  await replaceUrl(page, otherScenario);
  await expectScenario(page, 50, 20, 60);
  await page.mouse.up();
  await expectScenario(page, 50, 20, 60);
  await expectPathAndSearch(page, `${simulatorPath}${otherScenario}`);
  await expectHistoryLength(page, historyLength);

  await startDragTo(page, initialSoc(page), 30, pixelsPerPoint);
  await expectScenario(page, 50, 30, 60);
  await page.mouse.up();
  await expectScenario(page, 50, 30, 60);
  await expectPathAndSearch(
    page,
    `${simulatorPath}?colonnina=50&inizio=30&fine=60`,
  );
});

test("E2E-014 URL change between pointer-down and movement obsoletes the gesture", async ({
  page,
}) => {
  await openScenario(page);
  const pixelsPerPoint = await pixelsPerSocPoint(page);
  const pointer = await pressThumb(page, initialSoc(page));

  await replaceUrl(page, otherScenario);
  await expectScenario(page, 50, 20, 60);
  await finishStaleDrag(
    page,
    pointer,
    pixelsPerPoint,
    `${simulatorPath}${otherScenario}`,
    50,
    20,
    60,
  );
});

test("E2E-016 keyboard commit wins over an in-progress pointer drag", async ({
  page,
}) => {
  await openScenario(page);
  const pixelsPerPoint = await pixelsPerSocPoint(page);
  const pointer = await startDragTo(page, initialSoc(page), 40, pixelsPerPoint);
  await expectScenario(page, 150, 40, 80);

  await initialSoc(page).focus();
  await initialSoc(page).press("ArrowRight");
  await expectScenario(page, 150, 41, 80);
  await expectPathAndSearch(
    page,
    `${simulatorPath}?colonnina=150&inizio=41&fine=80`,
  );
  await finishStaleDrag(
    page,
    pointer,
    pixelsPerPoint,
    `${simulatorPath}?colonnina=150&inizio=41&fine=80`,
    150,
    41,
    80,
  );
});

test("E2E-017 rapid keyboard steps are not coalesced or lost", async ({
  page,
}) => {
  await openScenario(page);
  await initialSoc(page).focus();
  for (let step = 0; step < 5; step += 1) {
    await initialSoc(page).press("ArrowRight");
  }

  await expectScenario(page, 150, 15, 80);
  await expectPathAndSearch(
    page,
    `${simulatorPath}?colonnina=150&inizio=15&fine=80`,
  );
});
