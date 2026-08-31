import assert from "node:assert/strict";
import test from "node:test";

import { ALGORITHMS, createTrace } from "../algorithms.js";
import { CODE_LANGUAGES, codeFor } from "../learning/code-samples.js";
import {
  chartPoints,
  growthValue,
  runComplexityExperiment,
} from "../learning/complexity.js";
import { stepSvg, traceJson } from "../learning/exporter.js";
import { lessonFor, loadProgress, progressFor, saveProgress } from "../learning/lessons.js";
import {
  operationCost,
  raceMaximum,
  raceStanding,
  stepForWork,
  traceWork,
} from "../learning/race.js";
import { deriveLearningState } from "../learning/variables.js";

test("the expanded catalog contains fifteen distinct teaching algorithms", () => {
  assert.equal(Object.keys(ALGORITHMS).length, 15);
  for (const id of ["quick-three", "introsort", "timsort", "bucket", "bitonic"]) {
    assert.ok(ALGORITHMS[id]);
  }
});

test("new stable algorithms preserve duplicate identity", () => {
  const input = [4, 2, 4, 1, 2, 4, 1, 2];
  for (const id of ["timsort", "bucket"]) {
    const finalItems = createTrace(id, input).steps.at(-1).items;
    for (const value of new Set(input)) {
      const origins = finalItems.filter((item) => item.value === value).map((item) => item.origin);
      assert.deepEqual(origins, [...origins].sort((left, right) => left - right));
    }
  }
});

test("bitonic network sorts arbitrary lengths, not only powers of two", () => {
  for (let length = 2; length <= 19; length += 1) {
    const input = Array.from({ length }, (_, index) => (index * 17 + length * 11) % 23);
    assert.deepEqual(createTrace("bitonic", input).result, [...input].sort((left, right) => left - right));
  }
});

test("fair race clock is based on comparisons plus writes", () => {
  const primary = createTrace("bubble", [5, 4, 3, 2, 1]);
  const comparison = createTrace("merge", [5, 4, 3, 2, 1]);
  assert.equal(traceWork(primary), primary.stats.comparisons + primary.stats.writes);
  assert.equal(operationCost(primary.steps.at(-1)), traceWork(primary));
  assert.equal(raceMaximum(primary, comparison), Math.max(traceWork(primary), traceWork(comparison)));
  assert.equal(stepForWork(primary, traceWork(primary)).type, "done");
  assert.equal(stepForWork(primary, -20).type, "idle");
  const standing = raceStanding(primary, comparison, raceMaximum(primary, comparison));
  assert.equal(standing.primaryDone, true);
  assert.equal(standing.comparisonDone, true);
});

test("complexity experiments are deterministic and chart within bounds", () => {
  const options = {
    algorithmIds: ["insertion", "merge"],
    dataset: "random",
    metric: "work",
    seed: 42,
    sizes: [4, 8, 12],
  };
  const first = runComplexityExperiment(options);
  const second = runComplexityExperiment(options);
  assert.deepEqual(first, second);
  assert.equal(first[0].points.length, 3);
  assert.ok(growthValue("quadratic", 8) > growthValue("linear", 8));
  for (const point of chartPoints(first[0].points, 640, 260, 28)) {
    assert.ok(point.x >= 28 && point.x <= 612);
    assert.ok(point.y >= 28 && point.y <= 232);
  }
});

test("every algorithm has synchronized code in every language", () => {
  for (const [algorithmId, algorithm] of Object.entries(ALGORITHMS)) {
    const validLines = new Set(algorithm.pseudocode.map((line) => line.id));
    for (const language of Object.keys(CODE_LANGUAGES)) {
      const lines = codeFor(algorithmId, language, algorithm.pseudocode);
      assert.ok(lines.length > 0, `${algorithmId} ${language}`);
      assert.equal(lines.every((line) => validLines.has(line.id) && line.text.length > 0), true);
    }
  }
});

test("variable inspector derives structural state without mutating snapshots", () => {
  for (const algorithmId of ["merge", "quick", "heap", "timsort", "introsort", "bucket", "bitonic"]) {
    const trace = createTrace(algorithmId, [9, 3, 7, 1, 5, 3]);
    const step = trace.steps.find((candidate) => candidate.visual?.kind === algorithmId) ?? trace.steps[1];
    const before = structuredClone(step);
    const state = deriveLearningState(algorithmId, step);
    assert.ok(state.variables.length >= 2);
    assert.ok(state.stack.length >= 1);
    assert.deepEqual(step, before);
  }
});

test("lesson progress saves safely and never regresses", () => {
  const data = new Map();
  const storage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  };
  const lesson = lessonFor("merge", ALGORITHMS.merge);
  assert.equal(progressFor(0, 100, lesson).filter((item) => item.complete).length, 0);
  assert.equal(progressFor(100, 100, lesson).filter((item) => item.complete).length, 3);
  assert.equal(saveProgress(storage, { merge: 2 }), true);
  assert.deepEqual(loadProgress(storage), { merge: 2 });
});

test("exports are self-describing and XML-safe", () => {
  const trace = createTrace("bubble", [3, 1, 2]);
  const json = JSON.parse(traceJson(trace));
  assert.equal(json.schema, "sortscope-trace/v1");
  assert.deepEqual(json.result, [1, 2, 3]);
  const svg = stepSvg({ ...trace.steps[1], title: "<unsafe>", message: "A & B" }, "Bubble & Sort");
  assert.match(svg, /Bubble &amp; Sort/);
  assert.match(svg, /&lt;unsafe&gt;/);
  assert.doesNotMatch(svg, /<unsafe>/);
});
