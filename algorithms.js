import { ALGORITHMS } from "./algorithms/catalog.js";
import { bubbleTrace } from "./algorithms/bubble.js";
import { cocktailTrace } from "./algorithms/cocktail.js";
import { countingTrace } from "./algorithms/counting.js";
import { heapTrace } from "./algorithms/heap.js";
import { insertionTrace } from "./algorithms/insertion.js";
import { mergeTrace } from "./algorithms/merge.js";
import { quickTrace } from "./algorithms/quick.js";
import { radixTrace } from "./algorithms/radix.js";
import { selectionTrace } from "./algorithms/selection.js";
import { shellTrace } from "./algorithms/shell.js";
import { createStats, itemize, makeRecorder, normalizeInput, range } from "./algorithms/shared.js";
import { applyTraceDetail, TRACE_DETAIL_MODES } from "./algorithms/trace-detail.js";

export { ALGORITHMS, applyTraceDetail, TRACE_DETAIL_MODES };

const DATASET_TYPES = new Set(["random", "nearly-sorted", "reversed", "few-unique"]);

const TRACE_BUILDERS = Object.freeze({
  bubble: bubbleTrace,
  selection: selectionTrace,
  insertion: insertionTrace,
  merge: mergeTrace,
  quick: quickTrace,
  heap: heapTrace,
  shell: shellTrace,
  counting: countingTrace,
  radix: radixTrace,
  cocktail: cocktailTrace,
});

export function createTrace(algorithmId, input) {
  const algorithm = ALGORITHMS[algorithmId];

  if (!algorithm) {
    throw new RangeError(`Unknown algorithm: ${algorithmId}`);
  }

  const source = normalizeInput(input);
  const items = itemize(source);
  const stats = createStats();
  const { steps, record } = makeRecorder(items, stats);

  record({
    type: "idle",
    title: `${algorithm.name} is ready`,
    message: "Press Play, use the step buttons, or drag the timeline to explore the complete trace.",
    detail: algorithm.invariant,
  });

  TRACE_BUILDERS[algorithmId](items, stats, record);

  record({
    type: "done",
    title: "Array sorted",
    message:
      items.length === 0
        ? `${algorithm.name} finished; there were no values to reorder.`
        : `${algorithm.name} finished sorting ${items.length} ${items.length === 1 ? "value" : "values"} into ascending order.`,
    detail: `Finished with ${stats.comparisons} comparisons, ${stats.swaps} swaps, and ${stats.writes} writes.`,
    sorted: range(0, items.length),
  });

  return {
    algorithmId,
    source,
    steps,
    result: items.map((item) => item.value),
    stats: { ...stats },
  };
}

export function createAlgorithm(algorithmId, input) {
  return createTrace(algorithmId, input).steps.slice(1).values();
}

export function createDataset(kind, size, random = Math.random) {
  if (!DATASET_TYPES.has(kind)) {
    throw new RangeError(`Unknown dataset: ${kind}`);
  }

  if (!Number.isInteger(size) || size < 2 || size > 64) {
    throw new RangeError("Dataset size must be an integer between 2 and 64.");
  }

  if (typeof random !== "function") {
    throw new TypeError("The random source must be a function.");
  }

  const ascending = Array.from({ length: size }, (_, index) =>
    Math.round(10 + (index * 86) / Math.max(1, size - 1)),
  );

  if (kind === "reversed") {
    return ascending.reverse();
  }

  if (kind === "few-unique") {
    const levels = [18, 36, 54, 72, 90];
    return Array.from({ length: size }, () => levels[Math.floor(random() * levels.length)]);
  }

  if (kind === "nearly-sorted") {
    const values = [...ascending];
    const disturbances = Math.max(1, Math.floor(size / 6));

    for (let count = 0; count < disturbances; count += 1) {
      const first = Math.min(size - 2, Math.floor(random() * (size - 1)));
      [values[first], values[first + 1]] = [values[first + 1], values[first]];
    }

    return values;
  }

  const values = [...ascending];
  for (let index = values.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    [values[index], values[randomIndex]] = [values[randomIndex], values[index]];
  }
  return values;
}
