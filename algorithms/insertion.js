import { comparison, integerBounds, moveItemTo, range } from "./shared.js";

export function insertionTrace(items, stats, record) {
  for (let next = 1; next < items.length; next += 1) {
    const keyId = items[next].id;
    let keyIndex = next;

    record({
      type: "key",
      title: `Pick up ${items[keyIndex].value}`,
      message: `Use ${items[keyIndex].value} as the key and compare it with the sorted values to its left.`,
      detail: "The pink marker follows the key while a gap is opened for it.",
      line: "key",
      active: [keyIndex],
      keys: [keyIndex],
      sorted: range(0, next),
      range: [0, next + 1],
    });

    while (keyIndex > 0) {
      const leftIndex = keyIndex - 1;
      const left = items[leftIndex];
      const key = items[keyIndex];
      const shouldShift = left.value > key.value;
      stats.comparisons += 1;

      record({
        type: "compare",
        title: shouldShift ? "Open a position for the key" : "The opening is found",
        message: `Compare left value ${left.value} with key ${key.value}.`,
        detail: shouldShift
          ? `${left.value} is larger, so shift it one position to the right.`
          : `${left.value} can stay before ${key.value}; the key belongs immediately after it.`,
        line: "compare",
        active: [leftIndex, keyIndex],
        keys: [keyIndex],
        sorted: range(0, next),
        range: [0, next + 1],
        inspection: comparison("left", left.value, ">", "key", key.value, shouldShift),
      });

      if (!shouldShift) {
        break;
      }

      [items[leftIndex], items[keyIndex]] = [items[keyIndex], items[leftIndex]];
      keyIndex = leftIndex;
      stats.writes += 1;

      record({
        type: "shift",
        title: `Shift ${left.value} to the right`,
        message: `${left.value} moves right and the visible key advances into the opening.`,
        detail: "The animation keeps the key visible; in memory, it is held aside until the final write.",
        line: "shift",
        active: [keyIndex, keyIndex + 1],
        keys: [keyIndex],
        range: [0, next + 1],
      });
    }

    const resolvedKeyIndex = items.findIndex((item) => item.id === keyId);
    stats.writes += 1;
    record({
      type: "insert",
      title: `Insert ${items[resolvedKeyIndex].value}`,
      message: `${items[resolvedKeyIndex].value} is written into position ${resolvedKeyIndex + 1}.`,
      detail: `The first ${next + 1} values are sorted and ready for the next key.`,
      line: "insert",
      active: [resolvedKeyIndex],
      keys: [resolvedKeyIndex],
      sorted: range(0, next + 1),
      range: [0, next + 1],
    });
  }
}
