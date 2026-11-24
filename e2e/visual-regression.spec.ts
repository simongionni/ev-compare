import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Page, type TestInfo } from "@playwright/test";

test.use({ viewport: { width: 1440, height: 1000 } });

function cssFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? cssFiles(path)
      : entry.name.endsWith(".css")
        ? [path]
        : [];
  });
}

async function captureReviewCandidate(
  page: Page,
  testInfo: TestInfo,
  name: string,
) {
  const path = testInfo.outputPath(`${name}.png`);
  await page.screenshot({ path, fullPage: true, animations: "disabled" });
  await testInfo.attach(name, { path, contentType: "image/png" });
}

test("E2E-051 static source uses Livrea tokens font and neutral single-vehicle chart roles", () => {
  const componentCss = cssFiles(join(process.cwd(), "src")).filter(
    (path) => !path.endsWith(join("styles", "tokens.css")),
  );
  const rawColour = /(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\()/i;
  for (const path of componentCss) {
    expect(
      readFileSync(path, "utf8"),
      `${path} must consume central colour tokens`,
    ).not.toMatch(rawColour);
  }

  const layout = readFileSync(
    join(process.cwd(), "src", "app", "layout.tsx"),
    "utf8",
  );
  expect(layout).toContain('src: "./fonts/SchibstedGrotesk-subset.woff2"');
  expect(layout).toContain('variable: "--font-schibsted-grotesk"');
  const globals = readFileSync(
    join(process.cwd(), "src", "styles", "globals.css"),
    "utf8",
  );
  expect(globals).toContain("font-family: var(--font-family-base)");

  const chartCss = readFileSync(
    join(
      process.cwd(),
      "src",
      "components",
      "DcPowerChart",
      "DcPowerChart.module.css",
    ),
    "utf8",
  );
  expect(chartCss).toContain("stroke: var(--color-vehicle-neutral)");
  expect(chartCss).toContain("stroke: var(--color-vehicle-neutral-secondary)");
  expect(chartCss).not.toMatch(/--color-slot-[1-4]/);
});

test("E2E-051 M0.2 screens render deterministic 1440px Livrea evidence", async ({
  page,
}, testInfo) => {
  await page.goto("/cerca");
  await expect(page.locator("body")).toHaveCSS(
    "font-family",
    /schibstedGrotesk/i,
  );
  await expect(page.getByRole("heading", { name: "5 veicoli" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /^Apri scheda di / }),
  ).toHaveCount(5);
  await captureReviewCandidate(
    page,
    testInfo,
    "E2E-051-discovery-1440-candidate",
  );

  await page.goto("/veicoli/nordis-e4");
  await expect(
    page.getByRole("heading", { name: "Nordis E4", level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole("region", { name: "Ricarica" })).toBeVisible();
  await captureReviewCandidate(
    page,
    testInfo,
    "E2E-051-analysis-1440-candidate",
  );

  await page.goto("/veicoli/nordis-e4/simulazione-dc");
  const selected = page.getByRole("radio", { name: "150 kW", exact: true });
  await expect(selected).toHaveCSS("background-color", "rgb(255, 210, 63)");
  const cards = page.getByRole("main").locator("section");
  await expect(cards.filter({ hasText: /^Risultato/ })).toHaveCSS(
    "border-radius",
    "16px",
  );
  const chartLines = page
    .getByRole("region", { name: "Potenza per livello di carica" })
    .locator("figcaption line");
  const strokes = await chartLines.evaluateAll((lines) =>
    lines.map((line) => getComputedStyle(line).stroke),
  );
  expect(strokes).toEqual(["rgb(23, 23, 27)", "rgb(74, 74, 82)"]);
  await selected.focus();
  await expect(selected).toHaveCSS("outline-style", "solid");
  await expect(selected).toHaveCSS("outline-width", "2px");
  await captureReviewCandidate(
    page,
    testInfo,
    "E2E-051-simulator-focused-1440-candidate",
  );
});
