import { createDataset, createTrace } from "../algorithms.js";

export const COMPLEXITY_SIZES = Object.freeze([4, 8, 12, 16, 24, 32]);

const GROWTH_MODELS = Object.freeze({
  bubble: "quadratic",
  selection: "quadratic",
  insertion: "quadratic",
  cocktail: "quadratic",
  shell: "n-power",
  merge: "n-log-n",
  quick: "n-log-n",
  "quick-three": "n-log-n",
  heap: "n-log-n",
  introsort: "n-log-n",
  timsort: "n-log-n",
  counting: "linear",
  radix: "linear",
  bucket: "linear",
  bitonic: "n-log-squared",
});

function seededRandom(seed) {
  let value = Number(seed) >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let mixed = value;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

export function metricValue(stats, metric = "work") {
  if (metric === "comparisons") return stats.comparisons;
  if (metric === "writes") return stats.writes;
  if (metric === "swaps") return stats.swaps;
  return stats.comparisons + stats.writes;
}

export function growthValue(model, size) {
  if (model === "quadratic") return size ** 2;
  if (model === "n-power") return size ** 1.5;
  if (model === "n-log-n") return size * Math.log2(Math.max(2, size));
  if (model === "n-log-squared") return size * Math.log2(Math.max(2, size)) ** 2;
  return size;
}

export function runComplexityExperiment({
  algorithmIds,
  dataset = "random",
  metric = "work",
  seed = 2026,
  sizes = COMPLEXITY_SIZES,
}) {
  return algorithmIds.map((algorithmId, algorithmOffset) => {
    const points = sizes.map((size, sizeOffset) => {
      const random = seededRandom(seed + algorithmOffset * 997 + sizeOffset * 37);
      const source = createDataset(dataset, size, random);
      const trace = createTrace(algorithmId, source);
      return { size, value: metricValue(trace.stats, metric) };
    });
    const model = GROWTH_MODELS[algorithmId] ?? "n-log-n";
    const lastGrowth = growthValue(model, points.at(-1).size);
    const scale = lastGrowth === 0 ? 1 : points.at(-1).value / lastGrowth;
    return {
      algorithmId,
      model,
      points,
      guide: points.map(({ size }) => ({ size, value: growthValue(model, size) * scale })),
    };
  });
}

export function chartPoints(points, width = 640, height = 260, padding = 28, maximum = null) {
  const maxValue = maximum ?? Math.max(1, ...points.map((point) => point.value));
  const maxSize = Math.max(1, ...points.map((point) => point.size));
  return points.map((point) => ({
    ...point,
    x: padding + (point.size / maxSize) * (width - padding * 2),
    y: height - padding - (point.value / maxValue) * (height - padding * 2),
  }));
}
