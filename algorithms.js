const freezeLines = (lines) => Object.freeze(lines.map((line) => Object.freeze(line)));

export const ALGORITHMS = Object.freeze({
  bubble: Object.freeze({
    name: "Bubble Sort",
    shortName: "Bubble",
    description:
      "Compare neighbors and exchange any pair that is out of order. Each pass floats one large value into its final position.",
    invariant: "After every pass, the sorted suffix is final and never needs to move again.",
    best: "O(n)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: true,
    inPlace: true,
    accent: "#55e6c1",
    pseudocode: freezeLines([
      { id: "pass", code: "for each unsorted pass", depth: 0 },
      { id: "reset", code: "swapped ← false", depth: 1 },
      { id: "scan", code: "for each neighboring pair", depth: 1 },
      { id: "compare", code: "if left > right", depth: 2 },
      { id: "swap", code: "swap(left, right)", depth: 3 },
      { id: "settled", code: "mark pass end as sorted", depth: 1 },
      { id: "stop", code: "if not swapped: stop", depth: 1 },
    ]),
  }),
  selection: Object.freeze({
    name: "Selection Sort",
    shortName: "Selection",
    description:
      "Scan the unsorted region for its smallest value, then place that value at the next open position.",
    invariant: "The sorted prefix always contains the smallest values seen so far, in final order.",
    best: "O(n²)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: false,
    inPlace: true,
    accent: "#ffd166",
    pseudocode: freezeLines([
      { id: "position", code: "for each open position", depth: 0 },
      { id: "minimum", code: "minimum ← open position", depth: 1 },
      { id: "scan", code: "for each remaining value", depth: 1 },
      { id: "compare", code: "if value < minimum", depth: 2 },
      { id: "update", code: "minimum ← value", depth: 3 },
      { id: "swap", code: "swap(open, minimum)", depth: 1 },
      { id: "settled", code: "mark open position sorted", depth: 1 },
    ]),
  }),
  insertion: Object.freeze({
    name: "Insertion Sort",
    shortName: "Insertion",
    description:
      "Take the next value and walk it left through the sorted prefix until it reaches the first valid opening.",
    invariant: "Before the next value is picked up, every value to its left is already sorted.",
    best: "O(n)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: true,
    inPlace: true,
    accent: "#ff7a8a",
    pseudocode: freezeLines([
      { id: "key", code: "key ← next value", depth: 0 },
      { id: "scan", code: "scan sorted values to the left", depth: 1 },
      { id: "compare", code: "while left > key", depth: 1 },
      { id: "shift", code: "shift left value right", depth: 2 },
      { id: "insert", code: "insert key into the opening", depth: 1 },
    ]),
  }),
  merge: Object.freeze({
    name: "Merge Sort",
    shortName: "Merge",
    description:
      "Divide the array into smaller ranges, sort those ranges, then weave them together from smallest to largest.",
    invariant: "Every completed merge replaces two sorted halves with one larger sorted range.",
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(n)",
    stable: true,
    inPlace: false,
    accent: "#8ea1ff",
    pseudocode: freezeLines([
      { id: "split", code: "split range at its midpoint", depth: 0 },
      { id: "left", code: "mergeSort(left half)", depth: 1 },
      { id: "right", code: "mergeSort(right half)", depth: 1 },
      { id: "begin", code: "merge the two sorted halves", depth: 1 },
      { id: "compare", code: "compare the front values", depth: 2 },
      { id: "take", code: "write the smaller value next", depth: 2 },
      { id: "remainder", code: "copy any values left over", depth: 2 },
      { id: "merged", code: "mark the range merged", depth: 1 },
    ]),
  }),
});

const DATASET_TYPES = new Set(["random", "nearly-sorted", "reversed", "few-unique"]);

function normalizeInput(input) {
  if (!Array.isArray(input)) {
    throw new TypeError("The input must be an array.");
  }

  if (!input.every(Number.isFinite)) {
    throw new TypeError("Every array value must be a finite number.");
  }

  return [...input];
}

function itemize(values) {
  return values.map((value, origin) => ({
    id: `item-${origin}`,
    value,
    origin,
  }));
}

function createStats() {
  return {
    comparisons: 0,
    swaps: 0,
    writes: 0,
    steps: 0,
  };
}

function range(start, end) {
  return Array.from({ length: Math.max(0, end - start) }, (_, index) => start + index);
}

function uniqueIndexes(indexes, length) {
  return [...new Set(indexes)].filter(
    (index) => Number.isInteger(index) && index >= 0 && index < length,
  );
}

function idsAt(items, indexes) {
  return uniqueIndexes(indexes, items.length).map((index) => items[index].id);
}

function cloneInspection(inspection) {
  if (!inspection) {
    return null;
  }

  return {
    left: { ...inspection.left },
    right: { ...inspection.right },
    operator: inspection.operator,
    result: inspection.result,
    truth: Boolean(inspection.truth),
  };
}

function makeRecorder(items, stats) {
  const steps = [];

  function record(options = {}) {
    if (steps.length > 0) {
      stats.steps += 1;
    }

    const active = uniqueIndexes(options.active ?? [], items.length);
    const sorted = uniqueIndexes(options.sorted ?? [], items.length);
    const candidates = uniqueIndexes(options.candidates ?? [], items.length);
    const keys = uniqueIndexes(options.keys ?? [], items.length);
    const itemCopies = items.map((item) => ({ ...item }));

    const step = {
      sequence: steps.length,
      type: options.type ?? "idle",
      title: options.title ?? "Ready to explore",
      message: options.message ?? "Choose Play or move through the trace one step at a time.",
      detail: options.detail ?? "",
      line: options.line ?? null,
      items: itemCopies,
      values: itemCopies.map((item) => item.value),
      stats: { ...stats },
      active,
      activeIds: idsAt(items, active),
      sorted,
      sortedIds: idsAt(items, sorted),
      candidateIds: idsAt(items, candidates),
      keyIds: idsAt(items, keys),
      range: options.range ? [...options.range] : null,
      partition: options.partition ? [...options.partition] : null,
      inspection: cloneInspection(options.inspection),
    };

    steps.push(step);
    return step;
  }

  return { steps, record };
}

function comparison(leftLabel, leftValue, operator, rightLabel, rightValue, truth) {
  return {
    left: { label: leftLabel, value: leftValue },
    right: { label: rightLabel, value: rightValue },
    operator,
    result: truth ? "Yes" : "No",
    truth,
  };
}

function bubbleTrace(items, stats, record) {
  const settled = new Set();

  for (let end = items.length - 1; end > 0; end -= 1) {
    let swapped = false;

    record({
      type: "pass",
      title: `Begin pass ${items.length - end}`,
      message: `Scan positions 1 through ${end + 1}. The largest unsettled value will move to the right edge.`,
      detail: "A fresh pass starts with the swapped flag set to false.",
      line: "reset",
      sorted: settled,
      range: [0, end + 1],
    });

    for (let index = 0; index < end; index += 1) {
      const left = items[index];
      const right = items[index + 1];
      const shouldSwap = left.value > right.value;
      stats.comparisons += 1;

      record({
        type: "compare",
        title: shouldSwap ? "These neighbors are out of order" : "These neighbors can stay",
        message: `Compare ${left.value} on the left with ${right.value} on the right.`,
        detail: shouldSwap
          ? `${left.value} is larger, so it must move one position to the right.`
          : `${left.value} is not larger, so this pair is already in ascending order.`,
        line: "compare",
        active: [index, index + 1],
        sorted: settled,
        range: [0, end + 1],
        inspection: comparison("left", left.value, ">", "right", right.value, shouldSwap),
      });

      if (shouldSwap) {
        [items[index], items[index + 1]] = [items[index + 1], items[index]];
        stats.swaps += 1;
        stats.writes += 2;
        swapped = true;

        record({
          type: "swap",
          title: "Exchange the pair",
          message: `${left.value} moves right while ${right.value} moves left.`,
          detail: "The same two values are highlighted after their positions change.",
          line: "swap",
          active: [index, index + 1],
          sorted: settled,
          range: [0, end + 1],
          inspection: comparison("left", left.value, ">", "right", right.value, true),
        });
      }
    }

    settled.add(end);
    record({
      type: "settled",
      title: `${items[end].value} has reached its final position`,
      message: `Position ${end + 1} joins the sorted suffix.`,
      detail: "The next pass can stop one position earlier.",
      line: "settled",
      active: [end],
      sorted: settled,
      range: [0, end],
    });

    if (!swapped) {
      range(0, end).forEach((index) => settled.add(index));
      record({
        type: "early-stop",
        title: "No swaps — the array is sorted",
        message: "A complete pass found no out-of-order neighbors, so Bubble Sort can stop early.",
        detail: "This early exit gives Bubble Sort its O(n) best case.",
        line: "stop",
        sorted: settled,
      });
      break;
    }
  }
}

function selectionTrace(items, stats, record) {
  const settled = new Set();

  for (let open = 0; open < items.length - 1; open += 1) {
    let minimum = open;

    record({
      type: "select",
      title: `Fill position ${open + 1}`,
      message: `${items[minimum].value} is the first minimum candidate in the unsorted region.`,
      detail: "The amber marker always shows the smallest value found during this scan.",
      line: "minimum",
      active: [open],
      candidates: [minimum],
      sorted: settled,
      range: [open, items.length],
    });

    for (let scan = open + 1; scan < items.length; scan += 1) {
      const currentMinimum = items[minimum];
      const scanned = items[scan];
      const isSmaller = scanned.value < currentMinimum.value;
      stats.comparisons += 1;

      record({
        type: "compare",
        title: isSmaller ? "A new minimum is found" : "Keep the current minimum",
        message: `Compare scanned value ${scanned.value} with minimum candidate ${currentMinimum.value}.`,
        detail: isSmaller
          ? `${scanned.value} is smaller, so the minimum marker will move here.`
          : `${currentMinimum.value} remains the smallest value seen in this region.`,
        line: "compare",
        active: [scan, minimum],
        candidates: [minimum],
        sorted: settled,
        range: [open, items.length],
        inspection: comparison("scanned", scanned.value, "<", "minimum", currentMinimum.value, isSmaller),
      });

      if (isSmaller) {
        minimum = scan;
        record({
          type: "candidate",
          title: `${items[minimum].value} becomes the minimum candidate`,
          message: `Remember position ${minimum + 1} and continue scanning.`,
          detail: "Nothing moves yet; Selection Sort only remembers this position.",
          line: "update",
          active: [minimum],
          candidates: [minimum],
          sorted: settled,
          range: [open, items.length],
        });
      }
    }

    if (minimum !== open) {
      const openItem = items[open];
      const minimumItem = items[minimum];
      [items[open], items[minimum]] = [items[minimum], items[open]];
      stats.swaps += 1;
      stats.writes += 2;

      record({
        type: "swap",
        title: "Place the minimum",
        message: `${minimumItem.value} moves into position ${open + 1}; ${openItem.value} moves to the vacated position.`,
        detail: "One swap completes the entire scan.",
        line: "swap",
        active: [open, minimum],
        candidates: [open],
        sorted: settled,
        range: [open, items.length],
      });
    }

    settled.add(open);
    record({
      type: "settled",
      title: `Position ${open + 1} is final`,
      message: `${items[open].value} joins the sorted prefix.`,
      detail: "The next scan starts one position farther to the right.",
      line: "settled",
      active: [open],
      sorted: settled,
      range: [open + 1, items.length],
    });
  }
}

function insertionTrace(items, stats, record) {
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

function mergeTrace(items, stats, record) {
  function moveItemTo(id, target) {
    const current = items.findIndex((item) => item.id === id);
    const [item] = items.splice(current, 1);
    items.splice(target, 0, item);
  }

  function sortRange(start, end, depth = 0) {
    if (end - start <= 1) {
      return;
    }

    const middle = start + Math.floor((end - start) / 2);
    record({
      type: "split",
      title: `Split positions ${start + 1}–${end}`,
      message: `Divide this range into ${start + 1}–${middle} and ${middle + 1}–${end}.`,
      detail: `Recursive depth ${depth + 1}: keep dividing until every range contains one value.`,
      line: "split",
      range: [start, end],
      partition: [start, middle, end],
    });

    record({
      type: "recurse",
      title: "Sort the left half",
      message: `Enter positions ${start + 1}–${middle}.`,
      detail: "The other half waits while this recursive call finishes.",
      line: "left",
      range: [start, middle],
      partition: [start, middle, end],
    });
    sortRange(start, middle, depth + 1);

    record({
      type: "recurse",
      title: "Sort the right half",
      message: `Enter positions ${middle + 1}–${end}.`,
      detail: "Both halves will be sorted before they are merged.",
      line: "right",
      range: [middle, end],
      partition: [start, middle, end],
    });
    sortRange(middle, end, depth + 1);

    const left = items.slice(start, middle);
    const right = items.slice(middle, end);
    let leftIndex = 0;
    let rightIndex = 0;
    let writeIndex = start;

    record({
      type: "merge",
      title: "Merge the sorted halves",
      message: `Weave positions ${start + 1}–${middle} and ${middle + 1}–${end} into one sorted range.`,
      detail: "Only the front unplaced value of each half needs to be compared.",
      line: "begin",
      range: [start, end],
      partition: [start, middle, end],
    });

    while (leftIndex < left.length && rightIndex < right.length) {
      const leftItem = left[leftIndex];
      const rightItem = right[rightIndex];
      const takeLeft = leftItem.value <= rightItem.value;
      const currentLeft = items.findIndex((item) => item.id === leftItem.id);
      const currentRight = items.findIndex((item) => item.id === rightItem.id);
      stats.comparisons += 1;

      record({
        type: "compare",
        title: takeLeft ? "Take from the left half" : "Take from the right half",
        message: `Compare front values ${leftItem.value} and ${rightItem.value}.`,
        detail: takeLeft
          ? `${leftItem.value} is no larger, so it is written next. Equal values stay stable.`
          : `${rightItem.value} is smaller, so it is written next.`,
        line: "compare",
        active: [currentLeft, currentRight],
        range: [start, end],
        partition: [start, middle, end],
        inspection: comparison("left half", leftItem.value, "≤", "right half", rightItem.value, takeLeft),
      });

      const chosen = takeLeft ? leftItem : rightItem;
      moveItemTo(chosen.id, writeIndex);
      if (takeLeft) {
        leftIndex += 1;
      } else {
        rightIndex += 1;
      }
      stats.writes += 1;

      record({
        type: "write",
        title: `Write ${chosen.value} next`,
        message: `${chosen.value} moves into position ${writeIndex + 1} of the merged range.`,
        detail: "The merge cursor advances one position to the right.",
        line: "take",
        active: [writeIndex],
        range: [start, end],
        partition: [start, middle, end],
      });
      writeIndex += 1;
    }

    const remainder = leftIndex < left.length ? left.slice(leftIndex) : right.slice(rightIndex);
    const sourceName = leftIndex < left.length ? "left" : "right";

    for (const item of remainder) {
      moveItemTo(item.id, writeIndex);
      stats.writes += 1;
      record({
        type: "write",
        title: `Copy remaining value ${item.value}`,
        message: `The ${sourceName} half is the only half with values left, so no comparison is needed.`,
        detail: `${item.value} is written into position ${writeIndex + 1}.`,
        line: "remainder",
        active: [writeIndex],
        range: [start, end],
        partition: [start, middle, end],
      });
      writeIndex += 1;
    }

    record({
      type: "merged",
      title: `Positions ${start + 1}–${end} are merged`,
      message: `This entire range is now sorted: ${items
        .slice(start, end)
        .map((item) => item.value)
        .join(", ")}.`,
      detail: "The sorted range can now participate in the merge one level above it.",
      line: "merged",
      active: range(start, end),
      range: [start, end],
      partition: [start, middle, end],
    });
  }

  sortRange(0, items.length);
}

const TRACE_BUILDERS = Object.freeze({
  bubble: bubbleTrace,
  selection: selectionTrace,
  insertion: insertionTrace,
  merge: mergeTrace,
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
    message: `${algorithm.name} produced ${items.map((item) => item.value).join(", ") || "an empty array"}.`,
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
