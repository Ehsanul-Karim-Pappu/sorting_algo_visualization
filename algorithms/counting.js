import { comparison, integerBounds, moveItemTo, range } from "./shared.js";

export function countingTrace(items, stats, record) {
  const { minimum, maximum, span } = integerBounds(items, "Counting Sort");

  if (items.length < 2) {
    return;
  }

  if (span > 512) {
    throw new RangeError("Counting Sort supports a value range of at most 512 in this visualizer.");
  }

  const counts = Array(span).fill(0);
  const source = [...items];
  const countingVisual = (phase, extra = {}) => ({
    kind: "counting",
    phase,
    minimum,
    maximum,
    counts: [...counts],
    ...extra,
  });

  record({
    type: "count",
    title: `Create ${span} value counters`,
    message: `Map integer values ${minimum} through ${maximum} to counter positions.`,
    detail: "The value range k controls Counting Sort's extra memory use.",
    line: "init",
    range: [0, items.length],
    visual: countingVisual("init"),
  });

  for (const item of source) {
    const counter = item.value - minimum;
    counts[counter] += 1;
    stats.writes += 1;
    const currentIndex = items.findIndex((candidate) => candidate.id === item.id);

    record({
      type: "count",
      title: `Count another ${item.value}`,
      message: `The counter for ${item.value} is now ${counts[counter]}.`,
      detail: "No pairwise comparison is needed; the value directly selects its counter.",
      line: "count",
      active: [currentIndex],
      range: [0, items.length],
      visual: countingVisual("count", { activeValue: item.value }),
    });
  }

  for (let index = 1; index < counts.length; index += 1) {
    counts[index] += counts[index - 1];
    stats.writes += 1;
  }

  record({
    type: "prefix",
    title: "Accumulate the counters",
    message: `Each total now points just beyond that value's final output interval.`,
    detail: "These prefix totals turn frequencies into exact output positions.",
    line: "prefix",
    range: [0, items.length],
    visual: countingVisual("prefix"),
  });

  const output = Array(items.length);
  for (let index = source.length - 1; index >= 0; index -= 1) {
    const item = source[index];
    const counter = item.value - minimum;
    counts[counter] -= 1;
    const target = counts[counter];
    output[target] = item;
    stats.writes += 2;
    const currentIndex = items.findIndex((candidate) => candidate.id === item.id);

    record({
      type: "bucket",
      title: `Reserve output position ${target + 1}`,
      message: `${item.value} is assigned to position ${target + 1} in the output array.`,
      detail: "Reading right-to-left preserves the original order of equal values.",
      line: "output",
      active: [currentIndex],
      range: [0, items.length],
      visual: countingVisual("output", {
        activeValue: item.value,
        target,
        output: output.map((entry) => entry ? ({ id: entry.id, value: entry.value }) : null),
      }),
    });
  }

  output.forEach((item, target) => {
    moveItemTo(items, item.id, target);
    stats.writes += 1;

    record({
      type: "write",
      title: `Write ${item.value} to position ${target + 1}`,
      message: `${item.value} moves from the stable output array into the visible sequence.`,
      detail: `Positions 1–${target + 1} now match the final sorted order.`,
      line: "copy",
      active: [target],
      sorted: range(0, target + 1),
      range: [0, items.length],
      visual: countingVisual("copy", {
        activeValue: item.value,
        target,
        output: output.map((entry) => ({ id: entry.id, value: entry.value })),
      }),
    });
  });
}
