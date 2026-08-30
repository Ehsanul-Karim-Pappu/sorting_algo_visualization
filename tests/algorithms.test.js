import assert from "node:assert/strict";
import test from "node:test";

import {
  ALGORITHMS,
  createAlgorithm,
  createDataset,
  createTrace,
} from "../algorithms.js";

const ALGORITHM_IDS = Object.keys(ALGORITHMS);

function ascending(values) {
  return [...values].sort((left, right) => left - right);
}

for (const algorithmId of ALGORITHM_IDS) {
  test(`${algorithmId} sorts representative datasets`, () => {
    const datasets = [
      [],
      [7],
      [1, 2, 3, 4, 5],
      [5, 4, 3, 2, 1],
      [4, 1, 5, 2, 3],
      [3, 1, 3, 2, 1],
      [0, -4, 8, -2, 8],
    ];

    for (const dataset of datasets) {
      const trace = createTrace(algorithmId, dataset);
      const finalStep = trace.steps.at(-1);

      assert.deepEqual(trace.result, ascending(dataset));
      assert.deepEqual(finalStep.values, ascending(dataset));
      assert.equal(finalStep.type, "done");
      assert.deepEqual(finalStep.sorted, dataset.map((_, index) => index));
    }
  });

  test(`${algorithmId} does not mutate its input`, () => {
    const input = [4, 2, 5, 1, 3];
    const original = [...input];
    createTrace(algorithmId, input);
    assert.deepEqual(input, original);
  });

  test(`${algorithmId} creates coherent, reversible snapshots`, () => {
    const input = [5, 2, 4, 1, 3];
    const trace = createTrace(algorithmId, input);
    const expectedIds = input.map((_, index) => `item-${index}`).sort();
    const validLines = new Set(ALGORITHMS[algorithmId].pseudocode.map((line) => line.id));

    trace.steps.forEach((step, index) => {
      assert.equal(step.sequence, index);
      assert.equal(step.stats.steps, index);
      assert.deepEqual(step.values, step.items.map((item) => item.value));
      assert.deepEqual(step.items.map((item) => item.id).sort(), expectedIds);
      assert.equal(new Set(step.items.map((item) => item.id)).size, input.length);
      assert.equal(step.line === null || validLines.has(step.line), true);

      for (const metric of Object.values(step.stats)) {
        assert.equal(Number.isFinite(metric), true);
        assert.equal(metric >= 0, true);
      }

      if (index > 0) {
        assert.notEqual(step.items, trace.steps[index - 1].items);
        assert.notEqual(step.stats, trace.steps[index - 1].stats);
      }
    });
  });
}

test("stable algorithms preserve the original order of equal values", () => {
  const input = [3, 1, 3, 2, 1, 3];

  for (const algorithmId of ["bubble", "insertion", "merge"]) {
    const finalItems = createTrace(algorithmId, input).steps.at(-1).items;

    for (const value of new Set(input)) {
      const origins = finalItems
        .filter((item) => item.value === value)
        .map((item) => item.origin);
      assert.deepEqual(origins, [...origins].sort((left, right) => left - right));
    }
  }
});

test("optimized bubble sort stops after one pass for sorted input", () => {
  const result = createTrace("bubble", [1, 2, 3, 4]).stats;
  assert.equal(result.comparisons, 3);
  assert.equal(result.swaps, 0);
  assert.equal(result.writes, 0);
});

test("bubble and selection sort perform six comparisons for four reversed values", () => {
  assert.equal(createTrace("bubble", [4, 3, 2, 1]).stats.comparisons, 6);
  assert.equal(createTrace("selection", [4, 3, 2, 1]).stats.comparisons, 6);
});

test("merge sort counts comparisons separately from writes", () => {
  const result = createTrace("merge", [4, 3, 2, 1]).stats;
  assert.equal(result.comparisons, 4);
  assert.equal(result.writes, 8);
  assert.equal(result.swaps, 0);
});

test("the compatibility iterator reaches the same final result", () => {
  const steps = [...createAlgorithm("insertion", [4, 1, 3, 2])];
  assert.deepEqual(steps.at(-1).values, [1, 2, 3, 4]);
});

test("trace narration stays concise for a stable mobile layout", () => {
  for (const algorithmId of ALGORITHM_IDS) {
    const input = createDataset("reversed", 36);
    const trace = createTrace(algorithmId, input);

    for (const step of trace.steps) {
      assert.equal(step.title.length <= 60, true);
      assert.equal(step.message.length <= 120, true);
      assert.equal(step.detail.length <= 100, true);
    }
  }
});

test("dataset presets create the requested shape and size", () => {
  const size = 18;
  const randomValues = [0.12, 0.77, 0.31, 0.94, 0.48];
  let randomIndex = 0;
  const random = () => randomValues[randomIndex++ % randomValues.length];

  const randomDataset = createDataset("random", size, random);
  const nearlySorted = createDataset("nearly-sorted", size, random);
  const reversed = createDataset("reversed", size, random);
  const fewUnique = createDataset("few-unique", size, random);

  for (const dataset of [randomDataset, nearlySorted, reversed, fewUnique]) {
    assert.equal(dataset.length, size);
    assert.equal(dataset.every(Number.isFinite), true);
  }

  assert.deepEqual([...randomDataset].sort((left, right) => left - right), ascending(randomDataset));
  assert.deepEqual([...nearlySorted].sort((left, right) => left - right), ascending(nearlySorted));
  assert.deepEqual(reversed, ascending(reversed).reverse());
  assert.equal(new Set(fewUnique).size <= 5, true);
});

test("invalid algorithms, datasets, sizes, and values are rejected", () => {
  assert.throws(() => createTrace("bogus", [1, 2, 3]), /Unknown algorithm/);
  assert.throws(() => createTrace("bubble", [1, Number.NaN]), /finite number/);
  assert.throws(() => createTrace("bubble", "1,2,3"), /must be an array/);
  assert.throws(() => createDataset("bogus", 10), /Unknown dataset/);
  assert.throws(() => createDataset("random", 1), /between 2 and 64/);
  assert.throws(() => createDataset("random", 10, 42), /must be a function/);
});
