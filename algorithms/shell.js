import { comparison, integerBounds, moveItemTo, range } from "./shared.js";

export function shellTrace(items, stats, record) {
  const gapVisual = (phase, gap, keyIndex = null) => ({
    kind: "shell",
    phase,
    gap,
    keyIndex,
  });

  for (let gap = Math.floor(items.length / 2); gap > 0; gap = Math.floor(gap / 2)) {
    record({
      type: "gap",
      title: `Set the gap to ${gap}`,
      message: `Compare values ${gap} ${gap === 1 ? "position" : "positions"} apart.`,
      detail: gap === 1
        ? "The last pass is ordinary insertion sort."
        : "Wide gaps move badly misplaced values across the array quickly.",
      line: "gap",
      range: [0, items.length],
      visual: gapVisual("gap", gap),
    });

    for (let next = gap; next < items.length; next += 1) {
      const keyId = items[next].id;
      let keyIndex = next;

      record({
        type: "key",
        title: `Pick up ${items[keyIndex].value}`,
        message: `Insert this value into its gap-${gap} subsequence.`,
        detail: "Only positions connected by the current gap are compared.",
        line: "key",
        active: [keyIndex],
        keys: [keyIndex],
        sorted: gap === 1 ? range(0, next) : [],
        range: [0, items.length],
        visual: gapVisual("key", gap, keyIndex),
      });

      while (keyIndex >= gap) {
        const leftIndex = keyIndex - gap;
        const left = items[leftIndex];
        const key = items[keyIndex];
        const shouldShift = left.value > key.value;
        stats.comparisons += 1;

        record({
          type: "compare",
          title: shouldShift ? "Shift across the gap" : "This gap opening is correct",
          message: `Compare ${left.value} with key ${key.value} across gap ${gap}.`,
          detail: shouldShift
            ? `${left.value} must move ${gap} positions to the right.`
            : `${left.value} can stay before the key in this subsequence.`,
          line: "compare",
          active: [leftIndex, keyIndex],
          keys: [keyIndex],
          sorted: gap === 1 ? range(0, next) : [],
          range: [0, items.length],
          inspection: comparison("gap left", left.value, ">", "key", key.value, shouldShift),
          visual: gapVisual("compare", gap, keyIndex),
        });

        if (!shouldShift) {
          break;
        }

        [items[leftIndex], items[keyIndex]] = [items[keyIndex], items[leftIndex]];
        stats.swaps += 1;
        stats.writes += 2;
        keyIndex = leftIndex;

        record({
          type: "shift",
          title: `Move ${left.value} right by ${gap}`,
          message: `The key advances left to position ${keyIndex + 1}.`,
          detail: "Continue along the same gap-separated subsequence.",
          line: "shift",
          active: [keyIndex, keyIndex + gap],
          keys: [keyIndex],
          range: [0, items.length],
          visual: gapVisual("shift", gap, keyIndex),
        });
      }

      const resolvedKeyIndex = items.findIndex((item) => item.id === keyId);
      record({
        type: "insert",
        title: `Place ${items[resolvedKeyIndex].value} in its gap opening`,
        message: `The gap-${gap} subsequence is ordered through position ${next + 1}.`,
        detail: "The next key belongs to another interleaved subsequence.",
        line: "insert",
        active: [resolvedKeyIndex],
        keys: [resolvedKeyIndex],
        sorted: gap === 1 ? range(0, next + 1) : [],
        range: [0, items.length],
        visual: gapVisual("insert", gap, resolvedKeyIndex),
      });
    }

    record({
      type: "gap-done",
      title: `Gap ${gap} pass is complete`,
      message: gap === 1 ? "All neighboring values are now ordered." : "Shrink the gap and refine the ordering.",
      detail: "Earlier wide-gap movement makes each later pass less expensive.",
      line: "next",
      sorted: gap === 1 ? range(0, items.length) : [],
      range: [0, items.length],
      visual: gapVisual("complete", gap),
    });
  }
}
