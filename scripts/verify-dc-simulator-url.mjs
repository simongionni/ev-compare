/**
 * Browser verification of the DC simulator's URL and pending-scenario behaviour (M0.2 increment
 * 3). It drives real pointer, keyboard and history events in Chrome through the DevTools protocol.
 *
 * Not a test framework and not part of `npm test`: the UI test strategy is still undecided (ADR
 * 0001 open question 8). No dependency: Node's built-in WebSocket and an installed Chrome or Edge.
 *
 *   npm run build
 *   npm start -- -p 3123
 *   node scripts/verify-dc-simulator-url.mjs [http://localhost:3123]
 *
 * CHROME_PATH selects the browser. The exit code is the number of failed checks.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const BASE = process.argv[2] ?? "http://localhost:3123";
const SIMULATOR = "/veicoli/nordis-e4/simulazione-dc";
const DEFAULT_QUERY = "?colonnina=150&inizio=10&fine=80";

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];

async function launchBrowser() {
  const executable = CHROME_CANDIDATES.find((path) => path && existsSync(path));
  if (executable === undefined) throw new Error("No browser: set CHROME_PATH");

  const profile = mkdtempSync(join(tmpdir(), "ev-compare-verify-"));
  const browser = spawn(
    executable,
    [
      "--headless=new",
      "--remote-debugging-port=0",
      `--user-data-dir=${profile}`,
      "--no-first-run",
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  const portFile = join(profile, "DevToolsActivePort");
  for (let attempt = 0; attempt < 100 && !existsSync(portFile); attempt += 1) {
    await sleep(100);
  }
  await sleep(100);
  const [port] = readFileSync(portFile, "utf8").split("\n");

  const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  const { webSocketDebuggerUrl } = targets.find(({ type }) => type === "page");

  const socket = new WebSocket(webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  let nextId = 0;
  const waiting = new Map();
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    const pending = waiting.get(message.id);
    if (pending === undefined) return;
    waiting.delete(message.id);
    if (message.error) pending.reject(new Error(message.error.message));
    else pending.resolve(message.result);
  });

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      nextId += 1;
      waiting.set(nextId, { resolve, reject });
      socket.send(JSON.stringify({ id: nextId, method, params }));
    });

  const close = async () => {
    socket.close();
    browser.kill();
    await sleep(500);
    rmSync(profile, { recursive: true, force: true, maxRetries: 5 });
  };

  return { send, close };
}

const { send, close } = await launchBrowser();

async function evaluate(expression) {
  const { result, exceptionDetails } = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (exceptionDetails) throw new Error(exceptionDetails.text);
  return result.value;
}

const READ_STATE = `(() => {
  const text = (selector) =>
    document.querySelector(selector)?.textContent.replace(/\\s+/g, " ").trim();
  return {
    path: location.pathname,
    search: location.search,
    historyLength: history.length,
    thumbs: [...document.querySelectorAll('input[type="range"]')].map((i) => Number(i.value)),
    range: text('[class*="socValue"]'),
    conditions: text('[class*="_resultConditions"] dd'),
    time: text('[class$="_time"] dd'),
    energy: text('[class$="_energy"] dd'),
    station: text('[role="radio"][aria-checked="true"]'),
    notice: document.body.textContent.includes("Parametri della simulazione non validi"),
    body: document.body.textContent.replace(/\\s+/g, " "),
  };
})()`;

const readState = () => evaluate(READ_STATE);

/** Waits for the page to be hydrated, so that handlers are attached to the given element. */
async function waitForHydrated(selector) {
  const probe = `(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    return element !== null && Object.keys(element).some((key) => key.startsWith("__reactProps"));
  })()`;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (await evaluate(probe)) return;
    await sleep(100);
  }
  throw new Error(`Not hydrated: ${selector}`);
}

async function open(url, readySelector = '[class*="sliderControl"]') {
  await send("Page.navigate", { url: `${BASE}${url}` });
  await sleep(200);
  await waitForHydrated(readySelector);
}

/** Viewport position of a SoC value on the slider. */
async function socX(soc) {
  const { left, width, y } = await evaluate(`(() => {
    const rect = document.querySelector('[class*="sliderTrack"]').getBoundingClientRect();
    return { left: rect.left, width: rect.width, y: rect.top + rect.height / 2 };
  })()`);
  return { x: left + (soc / 100) * width, y };
}

const mouse = (type, { x, y }, buttons) =>
  send("Input.dispatchMouseEvent", {
    type,
    x,
    y,
    button: "left",
    buttons,
    clickCount: 1,
  });

const press = async (soc) => {
  const position = await socX(soc);
  await mouse("mouseMoved", position, 0);
  await mouse("mousePressed", position, 1);
  await sleep(40);
};

/** Moves the pressed pointer in small steps, as a real drag does. */
const moveTo = async (from, to) => {
  const steps = 4;
  for (let step = 1; step <= steps; step += 1) {
    await mouse(
      "mouseMoved",
      await socX(from + ((to - from) * step) / steps),
      1,
    );
    await sleep(25);
  }
};

const release = async (soc) => {
  await mouse("mouseReleased", await socX(soc), 0);
  await sleep(80);
};

const key = async (name, code = 0) => {
  const event = {
    key: name,
    code: name,
    windowsVirtualKeyCode: code,
    nativeVirtualKeyCode: code,
  };
  await send("Input.dispatchKeyEvent", { type: "keyDown", ...event });
  await send("Input.dispatchKeyEvent", { type: "keyUp", ...event });
};

const replaceUrl = (query) =>
  evaluate(`history.replaceState(null, "", ${JSON.stringify(query)})`);
const pushUrl = (query) =>
  evaluate(`history.pushState(null, "", ${JSON.stringify(query)})`);

const scenario = (initial, target, kw) => ({
  thumbs: [initial, target],
  range: `${initial}% → ${target}%`,
  conditions: `da ${initial}% a ${target}% · colonnina ${kw} kW`,
  station: `${kw} kW`,
});

const matches = (state, expected) =>
  Object.entries(expected).every(
    ([name, value]) => JSON.stringify(state[name]) === JSON.stringify(value),
  );

const failures = [];
let passed = 0;

function record(label, ok) {
  if (ok) passed += 1;
  else failures.push(label);
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${label}`);
}

/** Lets React settle, then checks the state, retrying briefly to allow for the URL transition. */
async function check(label, expected) {
  await sleep(120);
  let state = await readState();
  for (
    let attempt = 0;
    attempt < 12 && !matches(state, expected);
    attempt += 1
  ) {
    await sleep(100);
    state = await readState();
  }
  const ok = matches(state, expected);
  record(label, ok);
  if (ok) return;
  const actual = Object.fromEntries(
    Object.keys(expected).map((name) => [name, state[name]]),
  );
  console.log(`        expected ${JSON.stringify(expected)}`);
  console.log(`        actual   ${JSON.stringify(actual)}`);
}

function group(title) {
  console.log(`\n${title}`);
}

/** Opens the default scenario and leaves the initial thumb held at 50 %. */
async function holdInitialThumbAt50() {
  await open(`${SIMULATOR}${DEFAULT_QUERY}`);
  await press(10);
  await moveTo(10, 50);
  await check("while dragging: controls and results at 50→80, URL unchanged", {
    ...scenario(50, 80, 150),
    search: DEFAULT_QUERY,
  });
}

/** Moves and releases the stale drag, checking that the URL keeps what was imposed on it. */
async function finishStaleDrag(expected) {
  await moveTo(50, 60);
  await check("stale drag moved: nothing follows the pointer", expected);
  await release(60);
  await check("stale drag released: URL and scenario untouched", expected);
}

try {
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  group("A. Valid URL → pending drag → external invalid URL");
  await holdInitialThumbAt50();
  const invalidQuery = "?colonnina=150&inizio=10&fine=oops";
  await replaceUrl(invalidQuery);
  const invalidScenario = {
    ...scenario(10, 80, 150),
    notice: true,
    search: invalidQuery,
  };
  await check(
    "notice shown, default scenario in controls and results",
    invalidScenario,
  );
  await finishStaleDrag(invalidScenario);

  group("B. Valid URL → pending drag → external valid URL, different scenario");
  await holdInitialThumbAt50();
  const otherQuery = "?colonnina=50&inizio=20&fine=60";
  await replaceUrl(otherQuery);
  const otherScenario = {
    ...scenario(20, 60, 50),
    notice: false,
    search: otherQuery,
  };
  await check("the new URL's scenario is shown", otherScenario);
  await finishStaleDrag(otherScenario);

  group("C. Valid URL → pending drag → different URL, same resolved scenario");
  for (const [label, query] of [
    ["fine omitted (takes its default)", "?colonnina=150&inizio=10"],
    ["parameters reordered", "?inizio=10&fine=80&colonnina=150"],
    ["no simulation parameters", ""],
  ]) {
    console.log(`  - ${label}`);
    await holdInitialThumbAt50();
    await replaceUrl(query === "" ? SIMULATOR : query);
    const same = { ...scenario(10, 80, 150), notice: false, search: query };
    await check("default scenario shown", same);
    await finishStaleDrag(same);
  }
  console.log("  - same parameters, percent-encoded differently");
  await holdInitialThumbAt50();
  const encodedQuery = "?colonnina=150&inizio=10&fine=%38%30";
  await replaceUrl(encodedQuery);
  await finishStaleDrag({ ...scenario(10, 80, 150), search: encodedQuery });

  group("D. Ordinary drag → release → commit through replace");
  await open(`${SIMULATOR}${DEFAULT_QUERY}`);
  const before = await readState();
  await press(10);
  await moveTo(10, 50);
  await check("dragging: results follow, URL and history unchanged", {
    ...scenario(50, 80, 150),
    search: DEFAULT_QUERY,
    historyLength: before.historyLength,
  });
  await release(50);
  await check("released: URL rewritten, no history entry", {
    ...scenario(50, 80, 150),
    search: "?colonnina=150&inizio=50&fine=80",
    historyLength: before.historyLength,
  });
  await press(50);
  await moveTo(50, 40);
  await release(40);
  await check("a following drag commits normally", {
    ...scenario(40, 80, 150),
    search: "?colonnina=150&inizio=40&fine=80",
  });

  group("E. Back/Forward");
  await open("/veicoli/nordis-e4", '[href*="simulazione-dc"]');
  const analysisLength = (await readState()).historyLength;
  await evaluate(`document.querySelector('[href*="simulazione-dc"]').click()`);
  await sleep(300);
  await waitForHydrated('[class*="sliderControl"]');
  await check("analysis → simulator pushes one entry", {
    ...scenario(10, 80, 150),
    historyLength: analysisLength + 1,
  });
  await press(10);
  await moveTo(10, 30);
  await release(30);
  await evaluate(`document.querySelectorAll('[role="radio"]')[2].click()`);
  await check("confirmed changes replace the entry", {
    ...scenario(30, 80, 350),
    search: "?colonnina=350&inizio=30&fine=80",
    historyLength: analysisLength + 1,
  });
  await evaluate("history.back()");
  await sleep(300);
  await check("Back leaves the simulation for the analysis", {
    path: "/veicoli/nordis-e4",
  });
  await evaluate("history.forward()");
  await sleep(300);
  await waitForHydrated('[class*="sliderControl"]');
  await check("Forward restores the confirmed scenario", {
    ...scenario(30, 80, 350),
    search: "?colonnina=350&inizio=30&fine=80",
  });

  console.log(
    "  - Back and Forward during a drag, between entries of the simulator",
  );
  await holdInitialThumbAt50();
  await pushUrl(otherQuery);
  await check("pushed URL wins over the drag", {
    ...scenario(20, 60, 50),
    search: otherQuery,
  });
  await evaluate("history.back()");
  const backToDefault = { ...scenario(10, 80, 150), search: DEFAULT_QUERY };
  await check(
    "Back: the original URL's scenario, the dropped drag does not return",
    backToDefault,
  );
  await evaluate("history.forward()");
  await check("Forward: the later URL's scenario", {
    ...scenario(20, 60, 50),
    search: otherQuery,
  });
  await evaluate("history.back()");
  await check("Back again", backToDefault);
  await finishStaleDrag(backToDefault);

  group("F. New interactions after a stale release");
  await holdInitialThumbAt50();
  await replaceUrl(otherQuery);
  await release(50);
  await check("stale release ignored", {
    ...scenario(20, 60, 50),
    search: otherQuery,
  });
  await press(20);
  await moveTo(20, 30);
  await check("a new drag follows the pointer", {
    ...scenario(30, 60, 50),
    search: otherQuery,
  });
  await release(30);
  await check("and commits", {
    ...scenario(30, 60, 50),
    search: "?colonnina=50&inizio=30&fine=60",
  });

  console.log("  - URL changed after the press, before any move");
  await open(`${SIMULATOR}${DEFAULT_QUERY}`);
  await press(10);
  await replaceUrl(otherQuery);
  await check("the new URL's scenario is shown", {
    ...scenario(20, 60, 50),
    search: otherQuery,
  });
  await moveTo(10, 40);
  await release(40);
  await check("the gesture stays obsolete", {
    ...scenario(20, 60, 50),
    search: otherQuery,
  });

  group("Keyboard");
  await open(`${SIMULATOR}${DEFAULT_QUERY}`);
  await evaluate(`document.querySelector('input[type="range"]').focus()`);
  await key("ArrowRight", 39);
  await check("a step is committed at once", {
    ...scenario(11, 80, 150),
    search: "?colonnina=150&inizio=11&fine=80",
  });
  await replaceUrl(invalidQuery);
  await check("external invalid URL after a keyboard change", {
    ...scenario(10, 80, 150),
    notice: true,
    search: invalidQuery,
  });
  await key("ArrowRight", 39);
  await check("the keyboard still works on the new URL", {
    ...scenario(11, 80, 150),
    notice: false,
    search: "?colonnina=150&inizio=11&fine=80",
  });
  await press(11);
  await moveTo(11, 40);
  await key("ArrowRight", 39);
  await check("a keyboard step during a drag is committed", {
    ...scenario(41, 80, 150),
    search: "?colonnina=150&inizio=41&fine=80",
  });
  await moveTo(40, 60);
  await release(60);
  await check("and the drag it interrupted cannot overwrite it", {
    ...scenario(41, 80, 150),
    search: "?colonnina=150&inizio=41&fine=80",
  });

  group("Station power, durations and approved format");
  await open(`${SIMULATOR}${DEFAULT_QUERY}`);
  await check("150 kW: 22 min", {
    time: "22 min",
    energy: "+53,9 kWh nella batteria",
  });
  await evaluate(`document.querySelectorAll('[role="radio"]')[0].click()`);
  await check("50 kW: 65 minutes, shown as 1 h 05, URL at once", {
    ...scenario(10, 80, 50),
    time: "1 h 05",
    search: "?colonnina=50&inizio=10&fine=80",
  });
  await evaluate(`document.querySelectorAll('[role="radio"]')[2].click()`);
  await check("350 kW: 20 min", { ...scenario(10, 80, 350), time: "20 min" });

  group("SoC range: thumbs meet, never cross, separate again");
  await open(`${SIMULATOR}${DEFAULT_QUERY}`);
  await press(10);
  await moveTo(10, 95);
  await check("the initial thumb stops at the final one", {
    ...scenario(80, 80, 150),
    time: "0 min",
  });
  await release(95);
  await check("empty range committed: zero time and energy, no notice", {
    ...scenario(80, 80, 150),
    time: "0 min",
    energy: "+0,0 kWh nella batteria",
    notice: false,
    search: "?colonnina=150&inizio=80&fine=80",
  });
  await press(80);
  await moveTo(80, 60);
  await release(60);
  await check("from the coincidence, moving left widens the range", {
    ...scenario(60, 80, 150),
    search: "?colonnina=150&inizio=60&fine=80",
  });
  await open(`${SIMULATOR}?colonnina=150&inizio=50&fine=50`);
  await press(50);
  await moveTo(50, 70);
  await release(70);
  await check("from the coincidence, moving right widens the range", {
    ...scenario(50, 70, 150),
    search: "?colonnina=150&inizio=50&fine=70",
  });

  group("Return to the Vehicle Analysis and Ricarica preview (increment 2)");
  await open(`${SIMULATOR}?da=cerca&q=nordis`);
  await press(10);
  await moveTo(10, 20);
  await release(20);
  await check("a commit keeps the origin parameters", {
    search: "?da=cerca&q=nordis&colonnina=150&inizio=20&fine=80",
  });
  await evaluate(
    `document.querySelector('a[href^="/veicoli/nordis-e4?"]').click()`,
  );
  await sleep(400);
  await check("the return link leads to the analysis, with its origin", {
    path: "/veicoli/nordis-e4",
    search: "?da=cerca&q=nordis",
  });
  const { body } = await readState();
  for (const text of [
    "22 min",
    "53,9 kWh",
    "Apri nel simulatore",
    "Risultati",
  ]) {
    record(`the Ricarica preview page shows "${text}"`, body.includes(text));
  }
} finally {
  await close();
}

console.log(`\n${passed} passed, ${failures.length} failed`);
for (const failure of failures) console.log(`  failed: ${failure}`);
process.exit(failures.length);
