import { expect, test, type Page } from "@playwright/test";
import {
  expectPathAndSearch,
  expectScenario,
  initialSoc,
  moveHeldPointer,
  openScenario,
  pixelsPerSocPoint,
  simulatorPath,
  startDragTo,
} from "./simulator-helpers";

const analysisPath = "/veicoli/nordis-e4";
const defaultWithOrigin = "?da=cerca&q=old&colonnina=150&inizio=10&fine=80";
const routerScenario = "?da=cerca&q=router&colonnina=50&inizio=20&fine=60";
const bypassScenario = "?da=cerca&q=bypass&colonnina=150&inizio=10&fine=%38%30";

type ListenerInstrumentation = {
  readonly available: boolean;
  count: number;
};

type InstrumentedWindow = Window & {
  __urlListenerInstrumentation?: ListenerInstrumentation;
};

const returnLink = (page: Page) =>
  page.getByRole("link", { name: "Nordis E4" });

async function expectHistoryLength(page: Page, expected: number) {
  await expect.poll(() => page.evaluate(() => history.length)).toBe(expected);
}

async function replaceThroughPatchedHistory(page: Page, url: string) {
  await page.evaluate((nextUrl) => {
    history.replaceState(null, "", nextUrl);
  }, url);
}

async function replacePastPatchedHistory(page: Page, url: string) {
  await page.evaluate((nextUrl) => {
    History.prototype.replaceState.call(history, null, "", nextUrl);
  }, url);
}

async function hasNavigationApi(page: Page) {
  return page.evaluate(() => window.navigation !== undefined);
}

async function forceNavigationApiAbsent(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(window, "navigation", {
      value: undefined,
      configurable: true,
    });
  });
}

async function installListenerInstrumentation(page: Page) {
  await page.addInitScript(() => {
    const target = window as InstrumentedWindow;
    const navigationApi = window.navigation;
    target.__urlListenerInstrumentation = {
      available: navigationApi !== undefined,
      count: 0,
    };
    if (navigationApi === undefined) return;

    const originalAdd = navigationApi.addEventListener.bind(navigationApi);
    const originalRemove =
      navigationApi.removeEventListener.bind(navigationApi);

    navigationApi.addEventListener = ((
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) => {
      if (type === "currententrychange") {
        target.__urlListenerInstrumentation!.count += 1;
      }
      originalAdd(type, listener, options);
    }) as typeof navigationApi.addEventListener;

    navigationApi.removeEventListener = ((
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions,
    ) => {
      if (type === "currententrychange") {
        target.__urlListenerInstrumentation!.count -= 1;
      }
      originalRemove(type, listener, options);
    }) as typeof navigationApi.removeEventListener;
  });
}

async function listenerState(page: Page) {
  return page.evaluate(
    () => (window as InstrumentedWindow).__urlListenerInstrumentation,
  );
}

test("E2E-029 router-visible replacement updates simulator state and the following commit", async ({
  page,
}) => {
  await openScenario(page, defaultWithOrigin);
  const historyLength = await page.evaluate(() => history.length);

  // Next.js documents the native History methods as router-integrated. Calling the patched
  // instance method is deliberately distinct from E2E-030's prototype-method bypass.
  await replaceThroughPatchedHistory(page, routerScenario);
  await expectPathAndSearch(page, `${simulatorPath}${routerScenario}`);
  await expectScenario(page, 50, 20, 60);
  await expect(returnLink(page)).toHaveAttribute(
    "href",
    `${analysisPath}?da=cerca&q=router`,
  );
  await expectHistoryLength(page, historyLength);

  await page.getByRole("radio", { name: "350 kW", exact: true }).click();
  await expectPathAndSearch(
    page,
    `${simulatorPath}?da=cerca&q=router&colonnina=350&inizio=20&fine=60`,
  );
  await expectScenario(page, 350, 20, 60);
  await expect(returnLink(page)).toHaveAttribute(
    "href",
    `${analysisPath}?da=cerca&q=router`,
  );
  await expectHistoryLength(page, historyLength);
});

test("E2E-030 native Navigation API observes a bypass History rewrite", async ({
  page,
}) => {
  await openScenario(page, defaultWithOrigin);
  if (!(await hasNavigationApi(page))) {
    test.info().annotations.push({
      type: "capability",
      description:
        "window.navigation is unavailable; E2E-031 covers the required fallback path",
    });
    return;
  }

  const pixelsPerPoint = await pixelsPerSocPoint(page);
  const pointer = await startDragTo(page, initialSoc(page), 50, pixelsPerPoint);
  await expectScenario(page, 150, 50, 80);

  await replacePastPatchedHistory(page, bypassScenario);
  await expectPathAndSearch(page, `${simulatorPath}${bypassScenario}`);
  await expectScenario(page, 150, 10, 80);
  await expect(returnLink(page)).toHaveAttribute(
    "href",
    `${analysisPath}?da=cerca&q=bypass`,
  );

  await moveHeldPointer(page, pointer, 15, pixelsPerPoint);
  await expectScenario(page, 150, 10, 80);
  await page.mouse.up();
  await expectScenario(page, 150, 10, 80);
  await expectPathAndSearch(page, `${simulatorPath}${bypassScenario}`);
});

test("E2E-031 forced Navigation API fallback preserves current URL state and lifecycle", async ({
  page,
}) => {
  await forceNavigationApiAbsent(page);
  await openScenario(page, defaultWithOrigin);
  expect(await hasNavigationApi(page)).toBe(false);

  const pixelsPerPoint = await pixelsPerSocPoint(page);
  const firstPointer = await startDragTo(
    page,
    initialSoc(page),
    50,
    pixelsPerPoint,
  );
  await replaceThroughPatchedHistory(page, routerScenario);
  await expectScenario(page, 50, 20, 60);
  await expect(returnLink(page)).toHaveAttribute(
    "href",
    `${analysisPath}?da=cerca&q=router`,
  );
  await moveHeldPointer(page, firstPointer, 15, pixelsPerPoint);
  await page.mouse.up();
  await expectScenario(page, 50, 20, 60);

  await page.getByRole("radio", { name: "350 kW", exact: true }).click();
  await expectPathAndSearch(
    page,
    `${simulatorPath}?da=cerca&q=router&colonnina=350&inizio=20&fine=60`,
  );
  await expectScenario(page, 350, 20, 60);

  await openScenario(page, defaultWithOrigin);
  const delayedPointer = await startDragTo(
    page,
    initialSoc(page),
    50,
    pixelsPerPoint,
  );
  const delayedScenario = "?da=cerca&q=delayed&colonnina=50&inizio=20&fine=60";
  await replacePastPatchedHistory(page, delayedScenario);

  // Without Navigation API support, a bypass emits no observable URL event. The pending UI and
  // return link therefore remain unchanged until a later supported event reads location.search.
  await expectPathAndSearch(page, `${simulatorPath}${delayedScenario}`);
  expect(await initialSoc(page).getAttribute("aria-valuenow")).toBe("50");
  expect(
    await page
      .getByRole("radio", { name: "150 kW", exact: true })
      .getAttribute("aria-checked"),
  ).toBe("true");
  expect(await returnLink(page).getAttribute("href")).toBe(
    `${analysisPath}?da=cerca&q=old`,
  );

  const station350 = page.getByRole("radio", {
    name: "350 kW",
    exact: true,
  });
  await station350.focus();
  await station350.press("Space");
  await expectPathAndSearch(
    page,
    `${simulatorPath}?da=cerca&q=delayed&colonnina=350&inizio=20&fine=60`,
  );
  await expectScenario(page, 350, 20, 60);
  await expect(returnLink(page)).toHaveAttribute(
    "href",
    `${analysisPath}?da=cerca&q=delayed`,
  );
  await moveHeldPointer(page, delayedPointer, 15, pixelsPerPoint);
  await page.mouse.up();
  await expectScenario(page, 350, 20, 60);

  await returnLink(page).click();
  await expectPathAndSearch(page, `${analysisPath}?da=cerca&q=delayed`);
  await page.goBack();
  await expectScenario(page, 350, 20, 60);
  await initialSoc(page).focus();
  await initialSoc(page).press("ArrowRight");
  await expectPathAndSearch(
    page,
    `${simulatorPath}?da=cerca&q=delayed&colonnina=350&inizio=21&fine=60`,
  );
  await expectScenario(page, 350, 21, 60);
});

test("E2E-032 URL subscription is singular and survives the supported lifecycle", async ({
  page,
}) => {
  await installListenerInstrumentation(page);
  await openScenario(page);
  const initialState = await listenerState(page);
  expect(initialState).toBeDefined();
  expect(initialState!.count).toBe(initialState!.available ? 1 : 0);

  await page.getByRole("radio", { name: "50 kW", exact: true }).click();
  await expectScenario(page, 50, 10, 80);
  expect((await listenerState(page))!.count).toBe(
    initialState!.available ? 1 : 0,
  );

  await replaceThroughPatchedHistory(
    page,
    "?da=cerca&q=lifecycle&colonnina=150&inizio=20&fine=60",
  );
  await expectScenario(page, 150, 20, 60);
  await expect(returnLink(page)).toHaveAttribute(
    "href",
    `${analysisPath}?da=cerca&q=lifecycle`,
  );
  expect((await listenerState(page))!.count).toBe(
    initialState!.available ? 1 : 0,
  );

  await returnLink(page).click();
  await expectPathAndSearch(page, `${analysisPath}?da=cerca&q=lifecycle`);
  expect((await listenerState(page))!.count).toBe(0);

  await page.goBack();
  await expectScenario(page, 150, 20, 60);
  expect((await listenerState(page))!.count).toBe(
    initialState!.available ? 1 : 0,
  );
});
