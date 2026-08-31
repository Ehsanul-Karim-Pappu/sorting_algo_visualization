import { expect, test } from "@playwright/test";

test("fair race uses primitive work instead of normalized progress", async ({ page }) => {
  await page.goto("/?algorithm=bubble&compare=merge&clock=race&dataset=reversed&detail=all&seed=5&size=8");
  await expect(page.locator("#stage-grid")).toHaveAttribute("data-compare", "true");
  await expect(page.locator("#compare-mode")).toHaveValue("race");
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(page.locator("#race-status")).toContainText("operation ticks");
  await expect(page.locator("#trace-position")).toContainText("clock 1/");

  await page.locator("#compare-mode").selectOption("progress");
  await expect(page.locator("#race-status")).toContainText("Normalized progress");
  await expect(page).toHaveURL(/clock=progress/);
});

test("prediction mode pauses before a decision and scores the answer", async ({ page }) => {
  await page.goto("/?algorithm=quick&dataset=custom&values=3%2C1%2C2&detail=all&seed=2&size=3");
  await page.getByRole("button", { name: "Predict next step" }).click();
  await expect(page.getByRole("button", { name: "Predict next step" })).toHaveAttribute("aria-pressed", "true");

  for (let count = 0; count < 8; count += 1) {
    if (await page.locator("#prediction-card").isVisible()) break;
    await page.getByRole("button", { name: "Next step", exact: true }).click();
  }
  await expect(page.locator("#prediction-card")).toBeVisible();
  await expect(page.locator("#prediction-question")).toContainText("evaluate to Yes");
  await page.getByRole("button", { name: "No", exact: true }).click();
  await expect(page.locator("#prediction-feedback")).toContainText("Correct");
  await expect(page.locator("#prediction-score")).toHaveText("1 / 1");
  await expect(page.locator("#prediction-card")).toBeHidden({ timeout: 2_000 });
});

test("stability lab exposes duplicate identities and a final observation", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?algorithm=selection&dataset=random&detail=milestones&seed=3&size=8");
  await page.getByRole("button", { name: "Stability Lab" }).click();
  await expect(page).toHaveURL(/lab=stability/);
  await expect(page.locator("#bars .bar-item")).toHaveCount(8);
  await expect(page.locator("#bars .bar-value").first()).toContainText(/[ABC]/);
  await expect(page.locator("#stability-result")).toBeVisible();

  const maximum = await page.locator("#timeline").getAttribute("max");
  await page.locator("#timeline").fill(maximum);
  await expect(page.locator("#stability-observation")).toHaveText(/Order (preserved|changed)/);
  await page.locator(".theater").screenshot({
    path: testInfo.outputPath("phone-stability-lab.png"),
    animations: "disabled",
    caret: "hide",
  });
});

test("real code, variables, and saved lesson progress stay synchronized", async ({ page }) => {
  await page.goto("/?algorithm=merge&dataset=random&detail=all&seed=7&size=8");
  await page.locator("#code-language").selectOption("python");
  await expect(page.locator("#code-title")).toHaveText("Python");
  await expect(page.locator("#pseudocode code").first()).toContainText("mid");
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(page.locator("#variables > div")).not.toHaveCount(0);
  await expect(page.locator("#call-stack li")).not.toHaveCount(0);
  await expect(page.locator("#pseudocode li[aria-current='step']")).toHaveCount(1);
  await expect(page).toHaveURL(/code=python/);
});

test("complexity lab renders measured and theoretical series", async ({ page }, testInfo) => {
  await page.goto("/?algorithm=insertion&compare=merge&clock=race&dataset=random&seed=11&size=10");
  await page.getByRole("button", { name: "Complexity Lab" }).click();
  await expect(page.locator("#complexity-dialog")).toBeVisible();
  await expect(page.locator("#complexity-chart .chart-line")).toHaveCount(2);
  await expect(page.locator("#complexity-chart .chart-guide")).toHaveCount(2);
  await expect(page.locator("#complexity-body tr")).toHaveCount(6);
  await page.locator("#complexity-metric").selectOption("comparisons");
  await page.getByRole("button", { name: "Run experiment" }).click();
  await expect(page.locator("#complexity-summary")).toContainText("Solid lines are measured");
  await page.locator("#complexity-dialog").screenshot({
    path: testInfo.outputPath("complexity-lab.png"),
    animations: "disabled",
    caret: "hide",
  });
});

test("all new algorithms expose a native teaching view", async ({ page }) => {
  for (const algorithm of ["quick-three", "introsort", "timsort", "bucket", "bitonic"]) {
    await page.goto(`/?algorithm=${algorithm}&dataset=few-unique&detail=decisions&seed=17&size=8`);
    await expect(page.locator("#native-visual")).toHaveAttribute("data-kind", algorithm);
    await expect(page.locator("#native-visual")).toBeVisible();
    await page.getByRole("button", { name: "Next step", exact: true }).click();
    await expect(page.locator("#native-visual")).toBeVisible();
  }
});

test("export and offline metadata are available without layout overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?algorithm=bitonic&dataset=random&detail=decisions&seed=20&size=8");
  await page.getByRole("button", { name: "Export" }).click();
  await expect(page.locator("#export-dialog")).toBeVisible();
  await expect(page.getByRole("button", { name: /SVG snapshot/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Trace JSON/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /WebM lesson/ })).toBeVisible();
  const manifest = await page.evaluate(async () => (await fetch("./manifest.webmanifest")).json());
  expect(manifest.display).toBe("standalone");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("the learning lab meets basic accessibility and startup budgets", async ({ page }) => {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/?algorithm=timsort&dataset=nearly-sorted&detail=decisions&seed=29&size=16");
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Enter Focus Mode" })).toBeVisible();
  await expect(page.locator("button:not([aria-label])")).not.toHaveCount(0);

  const diagnostics = await page.evaluate(() => ({
    duration: performance.getEntriesByType("navigation")[0]?.duration ?? 0,
    nodes: document.querySelectorAll("*").length,
    emptyButtons: [...document.querySelectorAll("button")].filter((button) => !(button.textContent.trim() || button.getAttribute("aria-label"))).length,
    unlabeledInputs: [...document.querySelectorAll("input, select")].filter((input) => !input.labels?.length && !input.getAttribute("aria-label")).length,
  }));
  expect(diagnostics.duration).toBeLessThan(3_000);
  expect(diagnostics.nodes).toBeLessThan(3_500);
  expect(diagnostics.emptyButtons).toBe(0);
  expect(diagnostics.unlabeledInputs).toBe(0);
  expect(errors).toEqual([]);
});
