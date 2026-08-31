import { comparison, range } from "./shared.js";

function greatestPowerOfTwoBelow(value) {
  let power = 1;
  while (power < value) power *= 2;
  return power / 2;
}

export function bitonicTrace(items, stats, record) {
  const visual = (phase, start, length, ascending, distance = null, depth = 0) => ({
    kind: "bitonic",
    phase,
    start,
    length,
    ascending,
    distance,
    depth,
  });

  function merge(start, length, ascending, depth) {
    if (length <= 1) return;
    const distance = greatestPowerOfTwoBelow(length);

    record({
      type: "merge",
      title: `Merge a ${ascending ? "rising" : "falling"} sequence`,
      message: `Compare values ${distance} positions apart inside positions ${start + 1}–${start + length}.`,
      detail: "The comparison network is fixed by positions, not by the values.",
      line: "merge",
      range: [start, start + length],
      visual: visual("merge", start, length, ascending, distance, depth),
    });

    for (let index = start; index < start + length - distance; index += 1) {
      const partner = index + distance;
      const shouldSwap = ascending
        ? items[index].value > items[partner].value
        : items[index].value < items[partner].value;
      stats.comparisons += 1;
      record({
        type: "compare",
        title: shouldSwap ? "Comparator will exchange this pair" : "Comparator keeps this pair",
        message: `Compare ${items[index].value} and ${items[partner].value} for ${ascending ? "ascending" : "descending"} order.`,
        detail: `Network distance: ${distance}.`,
        line: "compare",
        active: [index, partner],
        range: [start, start + length],
        inspection: comparison("left", items[index].value, ascending ? ">" : "<", "right", items[partner].value, shouldSwap),
        visual: visual("compare", start, length, ascending, distance, depth),
      });

      if (shouldSwap) {
        [items[index], items[partner]] = [items[partner], items[index]];
        stats.swaps += 1;
        stats.writes += 2;
        record({
          type: "swap",
          title: "Exchange across the network",
          message: `Positions ${index + 1} and ${partner + 1} trade values.`,
          detail: "Every comparator at this distance can operate in parallel hardware.",
          line: "swap",
          active: [index, partner],
          range: [start, start + length],
          visual: visual("swap", start, length, ascending, distance, depth),
        });
      }
    }

    merge(start, distance, ascending, depth + 1);
    merge(start + distance, length - distance, ascending, depth + 1);
  }

  function sort(start, length, ascending, depth = 0) {
    if (length <= 1) return;
    const leftLength = Math.floor(length / 2);
    const rightLength = length - leftLength;
    record({
      type: "split",
      title: "Build opposite-direction subsequences",
      message: `Positions ${start + 1}–${start + leftLength} fall while the remaining positions rise.`,
      detail: "Together the two monotonic halves form a bitonic sequence.",
      line: "build",
      range: [start, start + length],
      partition: [start, start + leftLength, start + length],
      visual: visual("build", start, length, ascending, null, depth),
    });
    sort(start, leftLength, !ascending, depth + 1);
    sort(start + leftLength, rightLength, ascending, depth + 1);
    merge(start, length, ascending, depth);
  }

  sort(0, items.length, true);
  if (items.length > 0) {
    record({
      type: "settled",
      title: "The sorting network is complete",
      message: "Every lane is now in ascending order.",
      detail: "Bitonic networks trade extra comparisons for predictable parallel structure.",
      line: "merge",
      active: range(0, items.length),
      sorted: range(0, items.length),
      range: [0, items.length],
      visual: visual("done", 0, items.length, true),
    });
  }
}
