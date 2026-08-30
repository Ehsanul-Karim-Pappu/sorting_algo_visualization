import { expect, test } from "@playwright/test";

const viewports = [
  { name: "phone-320", width: 320, height: 760 },
  { name: "phone-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 1000 },
];

for (const viewport of viewports) {
  test(`${viewport.name} has no horizontal overflow and captures the theater`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto("/?algorithm=merge&dataset=random&detail=decisions&seed=2026&size=16");
    await expect(page).toHaveTitle(/SortScope/);
    await expect(page.locator("#stage-title")).toHaveText("Merge Sort");

    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);

    const layout = await page.evaluate(() => ({
      nativeHeight: Math.round(document.querySelector("#native-visual").getBoundingClientRect().height),
      stageWidth: Math.round(document.querySelector("#stage-grid").getBoundingClientRect().width),
      theaterWidth: Math.round(document.querySelector(".theater").getBoundingClientRect().width),
    }));
    expect(layout.stageWidth).toBeLessThanOrEqual(layout.theaterWidth);
    expect(layout.nativeHeight).toBe(viewport.width <= 660 ? 158 : 172);

    await page.locator(".theater").scrollIntoViewIfNeeded();
    const screenshot = await page.locator(".theater").screenshot({
      path: testInfo.outputPath(`${viewport.name}-theater.png`),
      animations: "disabled",
      caret: "hide",
    });
    expect(screenshot.byteLength).toBeGreaterThan(5_000);
  });
}

test("mobile operation and narration panels keep stable heights", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?algorithm=bubble&dataset=reversed&detail=all&seed=2026&size=16");

  const initial = await page.evaluate(() => ({
    inspection: document.querySelector("#inspection").getBoundingClientRect().height,
    narration: document.querySelector(".narration").getBoundingClientRect().height,
  }));

  for (let count = 0; count < 8; count += 1) {
    await page.getByRole("button", { name: "Next step" }).click();
  }

  const active = await page.evaluate(() => ({
    inspection: document.querySelector("#inspection").getBoundingClientRect().height,
    narration: document.querySelector(".narration").getBoundingClientRect().height,
  }));
  expect(active).toEqual(initial);
});

test("comparison and native structures render together", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/?algorithm=heap&compare=radix&dataset=few-unique&detail=decisions&seed=77&size=16");

  await expect(page.locator("#stage-grid")).toHaveAttribute("data-compare", "true");
  await expect(page.locator("#native-visual")).toHaveAttribute("data-kind", "heap");
  await expect(page.locator("#compare-native-visual")).toHaveAttribute("data-kind", "radix");
  await expect(page.locator(".heap-tree")).toBeVisible();
  await expect(page.locator("#compare-native-visual .radix-buckets")).toBeVisible();

  await page.getByRole("button", { name: "Next step" }).click();
  await expect(page.locator("#compare-trace-position")).not.toHaveText("0 / 0");
  const screenshot = await page.locator("#stage-grid").screenshot({
    path: testInfo.outputPath("desktop-comparison.png"),
    animations: "disabled",
    caret: "hide",
  });
  expect(screenshot.byteLength).toBeGreaterThan(5_000);
});
