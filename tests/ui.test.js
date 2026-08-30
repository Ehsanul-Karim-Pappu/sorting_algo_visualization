import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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

  for (const id of ["algorithm", "dataset", "size", "speed", "timeline"]) {
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

  for (const algorithm of ["bubble", "selection", "insertion", "merge"]) {
    assert.match(html, new RegExp(`value="${algorithm}"`));
  }

  for (const id of ["pseudocode", "inspection", "previous", "next", "timeline"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }

  assert.match(app, /setCursor\(state\.cursor -?\+ amount\)/);
  assert.match(
    app,
    /const requestedCursor = elements\.timeline\.value;\s+stopPlayback\(\);\s+setCursor\(requestedCursor\);/,
  );
  assert.match(app, /node\.animate\(/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /@media \(max-width: 660px\)/);
  assert.match(styles, /\.inspection\s*\{\s*height: 112px;\s*\}/);
  assert.match(styles, /min-height: 176px/);
  assert.match(styles, /min-height: 4\.35em/);
  assert.match(html, /<script type="module" src="\.\/app\.js"><\/script>/);
});
