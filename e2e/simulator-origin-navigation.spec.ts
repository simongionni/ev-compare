import { expect, test, type Page } from "@playwright/test";
import {
  expectPathAndSearch,
  expectScenario,
  initialSoc,
  moveHeldPointer,
  openScenario,
  pixelsPerSocPoint,
  result,
  simulatorPath,
  startDragTo,
} from "./simulator-helpers";

const analysisPath = "/veicoli/nordis-e4";
const defaultScenario = "colonnina=150&inizio=10&fine=80";
const originScenario = `?da=cerca&q=old&${defaultScenario}`;

const returnLink = (page: Page) =>
  page.getByRole("link", { name: "Nordis E4" });

async function replaceUrl(page: Page, url: string) {
  await page.evaluate((nextUrl) => {
    history.replaceState(null, "", nextUrl);
  }, url);
}

async function expectHistoryLength(page: Page, expected: number) {
  await expect.poll(() => page.evaluate(() => history.length)).toBe(expected);
}

test("E2E-022 simulator controls become visibly ready and accept the first interaction", async ({
  page,
}) => {
  await page.goto(`${simulatorPath}?${defaultScenario}`);

  const stations = page.getByRole("radiogroup", {
    name: "Potenza della colonnina",
  });
  await expect(stations).toBeVisible();
  await expect(
    stations.getByRole("radio", { name: "150 kW", exact: true }),
  ).toBeEnabled();
  await expect(initialSoc(page)).toBeVisible();
  await expect(initialSoc(page)).toBeEnabled();

  await initialSoc(page).focus();
  await initialSoc(page).press("ArrowRight");
  await expectScenario(page, 150, 11, 80);
  await expectPathAndSearch(
    page,
    `${simulatorPath}?colonnina=150&inizio=11&fine=80`,
  );
});

test("E2E-023 server response contains the shared scenario and origin before hydration", async ({
  request,
}) => {
  const response = await request.get(
    `${simulatorPath}?da=cerca&q=ssr&colonnina=50&inizio=20&fine=60`,
  );
  expect(response.ok()).toBe(true);
  const html = await response.text();

  const initialInput = html.match(
    /<input[^>]*aria-label="Livello di carica iniziale"[^>]*>/,
  )?.[0];
  const finalInput = html.match(
    /<input[^>]*aria-label="Livello di carica finale"[^>]*>/,
  )?.[0];
  expect(initialInput).toContain('value="20"');
  expect(finalInput).toContain('value="60"');
  expect(html).toMatch(
    /<a[^>]*href="\/veicoli\/nordis-e4\?da=cerca&amp;q=ssr"[^>]*>/,
  );
});

test("E2E-026 simulator never renders the next route query while leaving", async ({
  page,
}) => {
  await page.goto(analysisPath);
  await page
    .getByRole("link", {
      name: "Apri nel simulatore della ricarica DC di Nordis E4",
    })
    .click();
  await page.getByRole("radio", { name: "350 kW", exact: true }).click();
  await initialSoc(page).focus();
  for (let step = 0; step < 20; step += 1) {
    await initialSoc(page).press("ArrowRight");
  }
  await expectScenario(page, 350, 30, 80);

  const expectedConditions = "da 30% a 80% · colonnina 350 kW";
  const resultRegion = result(page);
  await resultRegion.evaluate((region, expected) => {
    const seen: string[] = [];
    const capture = () => {
      const match = region.textContent?.match(
        /da \d+% a \d+% · colonnina \d+ kW/,
      );
      if (match !== null && match !== undefined) seen.push(match[0]);
    };
    capture();
    const observer = new MutationObserver(capture);
    observer.observe(region, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
    });
    Object.assign(window, {
      __simulatorLeavingObservation: { expected, seen, observer },
    });
  }, expectedConditions);

  await page.goBack();
  await expectPathAndSearch(page, analysisPath);
  await expect(
    page.getByRole("heading", { name: "Nordis E4", level: 1 }),
  ).toBeVisible();

  const seen = await page.evaluate(() => {
    const observation = (
      window as typeof window & {
        __simulatorLeavingObservation?: {
          expected: string;
          seen: string[];
          observer: MutationObserver;
        };
      }
    ).__simulatorLeavingObservation;
    if (observation === undefined) {
      throw new Error("The route-transition observation was not installed");
    }
    observation.observer.disconnect();
    return observation.seen;
  });
  expect(seen.length).toBeGreaterThan(0);
  expect(seen).toEqual(seen.map(() => expectedConditions));
});

test("E2E-033 external origin change updates the return link and survives commits", async ({
  page,
}) => {
  await openScenario(page, originScenario);
  await expect(returnLink(page)).toHaveAttribute(
    "href",
    `${analysisPath}?da=cerca&q=old`,
  );

  const changedOrigin = `?da=cerca&q=new&${defaultScenario}`;
  await replaceUrl(page, changedOrigin);
  await expect(returnLink(page)).toHaveAttribute(
    "href",
    `${analysisPath}?da=cerca&q=new`,
  );
  await expectScenario(page, 150, 10, 80);

  await page.getByRole("radio", { name: "350 kW", exact: true }).click();
  await expectPathAndSearch(
    page,
    `${simulatorPath}?da=cerca&q=new&colonnina=350&inizio=10&fine=80`,
  );

  const pixelsPerPoint = await pixelsPerSocPoint(page);
  await startDragTo(page, initialSoc(page), 20, pixelsPerPoint);
  await page.mouse.up();
  await expectScenario(page, 350, 20, 80);
  await expectPathAndSearch(
    page,
    `${simulatorPath}?da=cerca&q=new&colonnina=350&inizio=20&fine=80`,
  );
  await expect(returnLink(page)).toHaveAttribute(
    "href",
    `${analysisPath}?da=cerca&q=new`,
  );
});

test("E2E-034 same-task commit uses the latest URL state", async ({ page }) => {
  await openScenario(page, originScenario);
  const station50 = page.getByRole("radio", {
    name: "50 kW",
    exact: true,
  });

  // React must not render between the external rewrite and activation. The browser-side click
  // activates the actual accessible radio in the same task; it does not call a React handler.
  await station50.evaluate((radio, nextUrl) => {
    history.replaceState(null, "", nextUrl);
    (radio as HTMLElement).click();
  }, "?da=cerca&q=newer&colonnina=150&inizio=30&fine=70");

  await expectScenario(page, 50, 30, 70);
  await expectPathAndSearch(
    page,
    `${simulatorPath}?da=cerca&q=newer&colonnina=50&inizio=30&fine=70`,
  );
  await expect(returnLink(page)).toHaveAttribute(
    "href",
    `${analysisPath}?da=cerca&q=newer`,
  );
});

test("E2E-035 removing origin updates the return link and commits remain direct", async ({
  page,
}) => {
  await openScenario(page, originScenario);
  await replaceUrl(page, `?${defaultScenario}`);
  await expect(returnLink(page)).toHaveAttribute("href", analysisPath);
  await expectScenario(page, 150, 10, 80);

  await page.getByRole("radio", { name: "350 kW", exact: true }).click();
  await expectPathAndSearch(
    page,
    `${simulatorPath}?colonnina=350&inizio=10&fine=80`,
  );
  await expect(returnLink(page)).toHaveAttribute("href", analysisPath);
});

test("E2E-035 adding origin updates links and survives keyboard commit and navigation", async ({
  page,
}) => {
  await openScenario(page, `?${defaultScenario}`);
  await expect(returnLink(page)).toHaveAttribute("href", analysisPath);

  await replaceUrl(page, `?da=cerca&q=added&${defaultScenario}`);
  await expect(returnLink(page)).toHaveAttribute(
    "href",
    `${analysisPath}?da=cerca&q=added`,
  );
  await initialSoc(page).focus();
  await initialSoc(page).press("ArrowRight");
  await expectPathAndSearch(
    page,
    `${simulatorPath}?da=cerca&q=added&colonnina=150&inizio=11&fine=80`,
  );

  await returnLink(page).click();
  await expectPathAndSearch(page, `${analysisPath}?da=cerca&q=added`);
  await expect(page.getByRole("link", { name: "Risultati" })).toHaveAttribute(
    "href",
    "/cerca?q=added",
  );
});

test("E2E-036 invalid origin falls back and the next commit writes a direct URL", async ({
  page,
}) => {
  await openScenario(page, `?da=altrove&q=x&${defaultScenario}`);
  await expect(returnLink(page)).toHaveAttribute("href", analysisPath);
  await expectScenario(page, 150, 10, 80);

  await page.getByRole("radio", { name: "50 kW", exact: true }).click();
  await expectPathAndSearch(
    page,
    `${simulatorPath}?colonnina=50&inizio=10&fine=80`,
  );
  await expect(returnLink(page)).toHaveAttribute("href", analysisPath);
});

test("E2E-036 invalid simulation retains an independently valid origin", async ({
  page,
}) => {
  const invalid = "?da=cerca&q=old&fine=oops";
  await openScenario(page, invalid);
  await expect(
    page.getByText("Parametri della simulazione non validi", { exact: true }),
  ).toBeVisible();
  await expectScenario(page, 150, 10, 80);
  await expect(returnLink(page)).toHaveAttribute(
    "href",
    `${analysisPath}?da=cerca&q=old`,
  );
  await expectPathAndSearch(page, `${simulatorPath}${invalid}`);
});

test("E2E-037 origin rewrite cancels pending drag and updates return navigation", async ({
  page,
}) => {
  await openScenario(page, originScenario);
  const pixelsPerPoint = await pixelsPerSocPoint(page);
  const pointer = await startDragTo(page, initialSoc(page), 50, pixelsPerPoint);
  await expectScenario(page, 150, 50, 80);
  await expect(result(page).getByText("22 min", { exact: true })).toBeHidden();
  const historyLength = await page.evaluate(() => history.length);

  const changedOrigin = `?da=cerca&q=during&${defaultScenario}`;
  await replaceUrl(page, changedOrigin);
  await expectScenario(page, 150, 10, 80);
  await expect(result(page).getByText("22 min", { exact: true })).toBeVisible();
  await expect(
    result(page).getByText("+53,9 kWh nella batteria", { exact: true }),
  ).toBeVisible();
  await expect(returnLink(page)).toHaveAttribute(
    "href",
    `${analysisPath}?da=cerca&q=during`,
  );
  await expectPathAndSearch(page, `${simulatorPath}${changedOrigin}`);
  await expectHistoryLength(page, historyLength);

  await moveHeldPointer(page, pointer, 15, pixelsPerPoint);
  await expectScenario(page, 150, 10, 80);
  await page.mouse.up();
  await expectScenario(page, 150, 10, 80);
  await expectPathAndSearch(page, `${simulatorPath}${changedOrigin}`);
  await expectHistoryLength(page, historyLength);
  await expect(returnLink(page)).toHaveAttribute(
    "href",
    `${analysisPath}?da=cerca&q=during`,
  );
});
