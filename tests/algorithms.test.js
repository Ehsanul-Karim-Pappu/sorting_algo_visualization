import assert from "node:assert/strict";
import test from "node:test";

import { ALGORITHMS, createAlgorithm } from "../algorithms.js";

const ALGORITHM_IDS = Object.keys(ALGORITHMS);

function run(algorithmId, input) {
  let finalStep;

  for (const step of createAlgorithm(algorithmId, input)) {
    finalStep = step;
  }

  return finalStep;
}

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
      const result = run(algorithmId, dataset);
      assert.deepEqual(result.values, ascending(dataset));
      assert.equal(result.type, "done");
      assert.deepEqual(result.sorted, dataset.map((_, index) => index));
    }
  });

  test(`${algorithmId} does not mutate its input`, () => {
    const input = [4, 2, 5, 1, 3];
    const original = [...input];
    run(algorithmId, input);
    assert.deepEqual(input, original);
  });

  test(`${algorithmId} reports finite non-negative metrics`, () => {
    const result = run(algorithmId, [4, 1, 3, 2]);

    for (const value of Object.values(result.stats)) {
      assert.equal(Number.isFinite(value), true);
      assert.equal(value >= 0, true);
    }
  });
}

test("optimized bubble sort stops after one pass for sorted input", () => {
  const result = run("bubble", [1, 2, 3, 4]);
  assert.equal(result.stats.comparisons, 3);
  assert.equal(result.stats.swaps, 0);
  assert.equal(result.stats.writes, 0);
});

test("bubble and selection sort perform six comparisons for four reversed values", () => {
  assert.equal(run("bubble", [4, 3, 2, 1]).stats.comparisons, 6);
  assert.equal(run("selection", [4, 3, 2, 1]).stats.comparisons, 6);
});

test("merge sort counts comparisons separately from writes", () => {
  const result = run("merge", [4, 3, 2, 1]);
  assert.equal(result.stats.comparisons, 4);
  assert.equal(result.stats.writes, 8);
});

test("unknown algorithm identifiers are rejected", () => {
  assert.throws(() => createAlgorithm("bogus", [1, 2, 3]), /Unknown algorithm/);
});

test("invalid values are rejected when iteration begins", () => {
  const iterator = createAlgorithm("bubble", [1, Number.NaN]);
  assert.throws(() => iterator.next(), /finite number/);
});
