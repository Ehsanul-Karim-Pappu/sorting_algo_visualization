import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

async function source(name) {
  return readFile(new URL(name, projectRoot), "utf8");
}

test("every DOM selector used by the controller exists exactly once", async () => {
  const [html, app] = await Promise.all([source("index.html"), source("app.js")]);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  const selectors = [...app.matchAll(/querySelector\("#([^"]+)"\)/g)].map(
    (match) => match[1],
  );

  assert.equal(new Set(ids).size, ids.length, "HTML contains a duplicate id");

  for (const selector of selectors) {
    assert.equal(
      ids.filter((id) => id === selector).length,
      1,
      `#${selector} should exist exactly once`,
    );
  }
});

test("primary controls have programmatic labels and accessible status", async () => {
  const html = await source("index.html");

  for (const id of [
    "algorithm",
    "dataset",
    "size",
    "speed",
    "detail",
    "seed",
    "compare-algorithm",
    "custom-data",
    "timeline",
  ]) {
    assert.match(html, new RegExp(`<label[^>]+for="${id}"`));
  }

  assert.match(html, /id="status"[^>]+aria-live="polite"/);
  assert.match(html, /id="bars"[^>]+role="img"/);
  assert.match(html, /<main>/);
  assert.match(html, /class="skip-link"/);
  assert.doesNotMatch(html, /\sonclick=/);
});

test("the page ships the complete learning and playback surfaces", async () => {
  const [html, app, styles] = await Promise.all([
    source("index.html"),
    source("app.js"),
    source("styles.css"),
  ]);

  for (const algorithm of [
    "bubble",
    "cocktail",
    "selection",
    "insertion",
    "merge",
    "quick",
    "heap",
    "shell",
    "counting",
    "radix",
    "quick-three",
    "introsort",
    "timsort",
    "bucket",
    "bitonic",
  ]) {
    assert.match(html, new RegExp(`value="${algorithm}"`));
  }

  for (const id of [
    "pseudocode",
    "inspection",
    "native-visual",
    "compare-stage",
    "custom-data-panel",
    "focus-mode",
    "previous",
    "next",
    "timeline",
    "variables",
    "call-stack",
    "prediction-card",
    "complexity-dialog",
    "export-dialog",
    "stability-result",
  ]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }

  assert.match(app, /setCursor\(state\.cursor -?\+ amount\)/);
  assert.match(
    app,
    /const requestedCursor = elements\.timeline\.value;\s+stopPlayback\(\);\s+setCursor\(requestedCursor\);/,
  );
  assert.match(app, /node\.animate\(/);
  assert.match(app, /URLSearchParams/);
  assert.match(app, /seededRandom/);
  assert.match(app, /renderNativeView/);
  assert.match(app, /renderComparison/);
  assert.match(app, /setFocusMode/);
  assert.match(app, /raceMaximum/);
  assert.match(app, /maybeShowPrediction/);
  assert.match(app, /renderComplexityExperiment/);
  assert.match(app, /renderLearningInspector/);
  assert.match(app, /recordTraceVideo/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /@media \(max-width: 660px\)/);
  assert.match(styles, /\.inspection\s*\{\s*height: 112px;\s*\}/);
  assert.match(styles, /min-height: 176px/);
  assert.match(styles, /min-height: 4\.35em/);
  assert.match(html, /<script type="module" src="\.\/app\.js"><\/script>/);
});

test("algorithm implementations are split into focused modules", async () => {
  const files = await readdir(new URL("algorithms/", projectRoot));
  for (const name of [
    "bubble.js",
    "cocktail.js",
    "selection.js",
    "insertion.js",
    "merge.js",
    "quick.js",
    "heap.js",
    "shell.js",
    "counting.js",
    "radix.js",
    "quick-three.js",
    "introsort.js",
    "timsort.js",
    "bucket.js",
    "bitonic.js",
    "catalog.js",
    "shared.js",
    "trace-detail.js",
  ]) {
    assert.equal(files.includes(name), true, `${name} should exist`);
  }

  const facade = await source("algorithms.js");
  assert.equal(facade.split("\n").length < 150, true, "algorithms.js should remain a small facade");
});

test("the installable app shell contains every local module", async () => {
  const [html, manifest, worker] = await Promise.all([
    source("index.html"),
    source("manifest.webmanifest"),
    source("service-worker.js"),
  ]);
  assert.match(html, /rel="manifest"/);
  assert.equal(JSON.parse(manifest).display, "standalone");
  for (const path of ["./app.js", "./algorithms.js", "./learning/race.js", "./learning/exporter.js"]) {
    assert.match(worker, new RegExp(path.replaceAll(".", "\\.")));
  }
});
