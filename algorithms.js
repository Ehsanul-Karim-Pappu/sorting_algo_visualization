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
  quick: Object.freeze({
    name: "Quick Sort",
    shortName: "Quick",
    description:
      "Choose a pivot, partition smaller values to its left and larger values to its right, then repeat inside each partition.",
    invariant: "Every finished partition locks its pivot into the position it will occupy in the final array.",
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n²)",
    space: "O(log n)",
    stable: false,
    inPlace: true,
    accent: "#a78bfa",
    pseudocode: freezeLines([
      { id: "partition", code: "partition the current range", depth: 0 },
      { id: "pivot", code: "pivot ← last value", depth: 1 },
      { id: "scan", code: "scan values before the pivot", depth: 1 },
      { id: "compare", code: "if value ≤ pivot", depth: 2 },
      { id: "swap", code: "move value into left partition", depth: 3 },
      { id: "place", code: "place pivot between partitions", depth: 1 },
      { id: "left", code: "quickSort(left partition)", depth: 1 },
      { id: "right", code: "quickSort(right partition)", depth: 1 },
    ]),
  }),
  heap: Object.freeze({
    name: "Heap Sort",
    shortName: "Heap",
    description:
      "Build a max heap, repeatedly move its largest value to the end, and repair the remaining heap after every extraction.",
    invariant: "The heap root is the largest unsettled value, while the suffix beyond the heap is already final.",
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(1)",
    stable: false,
    inPlace: true,
    accent: "#ff9f43",
    pseudocode: freezeLines([
      { id: "build", code: "build a max heap", depth: 0 },
      { id: "sift", code: "sift the root downward", depth: 1 },
      { id: "compare", code: "find the larger child", depth: 2 },
      { id: "swap", code: "swap parent with larger child", depth: 2 },
      { id: "extract", code: "swap heap maximum to the end", depth: 0 },
      { id: "lock", code: "shrink heap; lock that position", depth: 1 },
    ]),
  }),
  shell: Object.freeze({
    name: "Shell Sort",
    shortName: "Shell",
    description:
      "Run insertion-style passes across wide gaps, then shrink the gap until the final pass compares ordinary neighbors.",
    invariant: "After each gap pass, values in every gap-separated subsequence are ordered relative to one another.",
    best: "O(n log n)",
    average: "≈ O(n^1.5)",
    worst: "O(n²)",
    space: "O(1)",
    stable: false,
    inPlace: true,
    accent: "#f472b6",
    pseudocode: freezeLines([
      { id: "gap", code: "gap ← floor(length / 2)", depth: 0 },
      { id: "key", code: "pick the next value in this gap", depth: 1 },
      { id: "compare", code: "while gap-left > key", depth: 1 },
      { id: "shift", code: "shift gap-left value right", depth: 2 },
      { id: "insert", code: "insert key into its gap opening", depth: 1 },
      { id: "next", code: "gap ← floor(gap / 2)", depth: 0 },
    ]),
  }),
  counting: Object.freeze({
    name: "Counting Sort",
    shortName: "Counting",
    description:
      "Count each integer value, accumulate those counts into output positions, then place values without comparing pairs.",
    invariant: "Accumulated counts identify the final output interval owned by every distinct integer value.",
    best: "O(n + k)",
    average: "O(n + k)",
    worst: "O(n + k)",
    space: "O(n + k)",
    stable: true,
    inPlace: false,
    accent: "#4dd4ff",
    pseudocode: freezeLines([
      { id: "init", code: "create one counter per value", depth: 0 },
      { id: "count", code: "count every input value", depth: 0 },
      { id: "prefix", code: "accumulate counter totals", depth: 0 },
      { id: "output", code: "place inputs right-to-left", depth: 0 },
      { id: "copy", code: "copy ordered output back", depth: 0 },
    ]),
  }),
  radix: Object.freeze({
    name: "Radix Sort",
    shortName: "Radix",
    description:
      "Group integers by one decimal digit at a time, preserving bucket order from the ones place toward the most significant digit.",
    invariant: "After a digit pass, the array is stably ordered by every digit processed so far.",
    best: "O(d(n + 10))",
    average: "O(d(n + 10))",
    worst: "O(d(n + 10))",
    space: "O(n + 10)",
    stable: true,
    inPlace: false,
    accent: "#c084fc",
    pseudocode: freezeLines([
      { id: "normalize", code: "offset keys so the minimum is zero", depth: 0 },
      { id: "digit", code: "for each decimal digit", depth: 0 },
      { id: "bucket", code: "append values to digit buckets", depth: 1 },
      { id: "collect", code: "collect buckets in order", depth: 1 },
      { id: "repeat", code: "move to the next digit", depth: 0 },
    ]),
  }),
  cocktail: Object.freeze({
    name: "Cocktail Shaker Sort",
    shortName: "Cocktail",
    description:
      "Sweep forward to move a large value right, then sweep backward to move a small value left, shrinking both boundaries.",
    invariant: "Each round locks one value at the right boundary and one value at the left boundary.",
    best: "O(n)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: true,
    inPlace: true,
    accent: "#fb7185",
    pseudocode: freezeLines([
      { id: "forward", code: "sweep left → right", depth: 0 },
      { id: "compare", code: "compare neighboring values", depth: 1 },
      { id: "swap", code: "swap if they are out of order", depth: 2 },
      { id: "right", code: "lock the right boundary", depth: 0 },
      { id: "backward", code: "sweep right → left", depth: 0 },
      { id: "left", code: "lock the left boundary", depth: 0 },
      { id: "stop", code: "stop if neither sweep swaps", depth: 0 },
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

function moveItemTo(items, id, target) {
  const current = items.findIndex((item) => item.id === id);
  const [item] = items.splice(current, 1);
  items.splice(target, 0, item);
}

function integerBounds(items, algorithmName) {
  if (!items.every((item) => Number.isSafeInteger(item.value))) {
    throw new RangeError(`${algorithmName} requires safe integer values.`);
  }

  if (items.length === 0) {
    return { minimum: 0, maximum: 0, span: 0 };
  }

  const values = items.map((item) => item.value);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const span = maximum - minimum + 1;

  if (!Number.isSafeInteger(span)) {
    throw new RangeError(`${algorithmName} requires a safely representable value range.`);
  }

  return { minimum, maximum, span };
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
      moveItemTo(items, chosen.id, writeIndex);
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
      moveItemTo(items, item.id, writeIndex);
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

    const mergedValues = items.slice(start, end).map((item) => item.value);
    record({
      type: "merged",
      title: `Positions ${start + 1}–${end} are merged`,
      message:
        mergedValues.length <= 8
          ? `This range is now sorted: ${mergedValues.join(", ")}.`
          : `All ${mergedValues.length} values in positions ${start + 1}–${end} are now sorted.`,
      detail: "The sorted range can now participate in the merge one level above it.",
      line: "merged",
      active: range(start, end),
      range: [start, end],
      partition: [start, middle, end],
    });
  }

  sortRange(0, items.length);
}

function quickTrace(items, stats, record) {
  const settled = new Set();

  function sortRange(start, end, depth = 0) {
    if (start > end) {
      return;
    }

    if (start === end) {
      settled.add(start);
      record({
        type: "settled",
        title: `${items[start].value} is already isolated`,
        message: `Position ${start + 1} is a one-value partition, so it is final.`,
        detail: "A partition containing one value needs no comparisons.",
        line: "place",
        active: [start],
        sorted: settled,
        range: [start, end + 1],
      });
      return;
    }

    const pivotId = items[end].id;
    const pivotValue = items[end].value;
    let boundary = start;

    record({
      type: "partition",
      title: `Partition positions ${start + 1}–${end + 1}`,
      message: `Build left and right partitions around pivot ${pivotValue}.`,
      detail: `Recursive depth ${depth + 1}: the pivot will not move again after this partition.`,
      line: "partition",
      candidates: [end],
      sorted: settled,
      range: [start, end + 1],
    });

    record({
      type: "pivot",
      title: `${pivotValue} becomes the pivot`,
      message: `Scan positions ${start + 1} through ${end} before placing the pivot.`,
      detail: "The boundary marks where the next value no larger than the pivot belongs.",
      line: "pivot",
      active: [end],
      candidates: [end],
      sorted: settled,
      range: [start, end + 1],
    });

    record({
      type: "partition",
      title: "Open the left partition",
      message: `The left partition begins at position ${start + 1}.`,
      detail: "Every accepted value expands this partition by one position.",
      line: "scan",
      candidates: [end],
      sorted: settled,
      range: [start, end + 1],
    });

    for (let scan = start; scan < end; scan += 1) {
      const scanned = items[scan];
      const pivotIndex = items.findIndex((item) => item.id === pivotId);
      const belongsLeft = scanned.value <= pivotValue;
      stats.comparisons += 1;

      record({
        type: "compare",
        title: belongsLeft ? "Send this value left" : "Keep this value on the right",
        message: `Compare scanned value ${scanned.value} with pivot ${pivotValue}.`,
        detail: belongsLeft
          ? `${scanned.value} belongs at the current left-partition boundary.`
          : `${scanned.value} stays beyond the boundary for the right partition.`,
        line: "compare",
        active: [scan, pivotIndex],
        candidates: [pivotIndex],
        sorted: settled,
        range: [start, end + 1],
        inspection: comparison("scanned", scanned.value, "≤", "pivot", pivotValue, belongsLeft),
      });

      if (!belongsLeft) {
        continue;
      }

      if (boundary !== scan) {
        const boundaryItem = items[boundary];
        [items[boundary], items[scan]] = [items[scan], items[boundary]];
        stats.swaps += 1;
        stats.writes += 2;

        record({
          type: "swap",
          title: `Move ${scanned.value} into the left partition`,
          message: `${scanned.value} trades places with ${boundaryItem.value} at the boundary.`,
          detail: "The accepted region is contiguous, even when skipped values must move right.",
          line: "swap",
          active: [boundary, scan],
          candidates: [end],
          sorted: settled,
          range: [start, end + 1],
        });
      }

      boundary += 1;
    }

    const pivotIndex = items.findIndex((item) => item.id === pivotId);
    if (boundary !== pivotIndex) {
      const boundaryItem = items[boundary];
      [items[boundary], items[pivotIndex]] = [items[pivotIndex], items[boundary]];
      stats.swaps += 1;
      stats.writes += 2;

      record({
        type: "swap",
        title: `Place pivot ${pivotValue}`,
        message: `${pivotValue} trades places with ${boundaryItem.value} at position ${boundary + 1}.`,
        detail: "Every value left of the pivot is no larger; every value right of it is larger.",
        line: "place",
        active: [boundary, pivotIndex],
        sorted: settled,
        range: [start, end + 1],
      });
    }

    settled.add(boundary);
    record({
      type: "settled",
      title: `Pivot ${pivotValue} is locked`,
      message: `Position ${boundary + 1} is now final.`,
      detail: "Quick Sort now handles the two partitions independently.",
      line: "place",
      active: [boundary],
      sorted: settled,
      range: [start, end + 1],
    });

    if (start <= boundary - 1) {
      record({
        type: "recurse",
        title: "Sort the left partition",
        message: `Enter positions ${start + 1}–${boundary}.`,
        detail: "The locked pivot remains outside this recursive call.",
        line: "left",
        sorted: settled,
        range: [start, boundary],
      });
      sortRange(start, boundary - 1, depth + 1);
    }

    if (boundary + 1 <= end) {
      record({
        type: "recurse",
        title: "Sort the right partition",
        message: `Enter positions ${boundary + 2}–${end + 1}.`,
        detail: "Only values larger than the pivot appear in this partition.",
        line: "right",
        sorted: settled,
        range: [boundary + 1, end + 1],
      });
      sortRange(boundary + 1, end, depth + 1);
    }
  }

  sortRange(0, items.length - 1);
}

function heapTrace(items, stats, record) {
  const settled = new Set();

  function siftDown(root, end) {
    let parent = root;

    while (true) {
      const left = parent * 2 + 1;
      const right = left + 1;
      let largest = parent;

      record({
        type: "heap",
        title: `Sift ${items[parent].value} from position ${parent + 1}`,
        message: `Inspect this parent and its children inside the ${end}-value heap.`,
        detail: "A max heap requires every parent to be at least as large as either child.",
        line: "sift",
        active: [parent],
        candidates: [largest],
        sorted: settled,
        range: [0, end],
      });

      if (left < end) {
        const child = items[left];
        const currentLargest = items[largest];
        const childIsLarger = child.value > currentLargest.value;
        stats.comparisons += 1;

        record({
          type: "compare",
          title: childIsLarger ? "Left child becomes largest" : "Parent remains larger",
          message: `Compare ${child.value} with current largest ${currentLargest.value}.`,
          detail: childIsLarger
            ? "The possible swap target moves to the left child."
            : "No candidate change is needed after this comparison.",
          line: "compare",
          active: [left, largest],
          candidates: [largest],
          sorted: settled,
          range: [0, end],
          inspection: comparison("child", child.value, ">", "largest", currentLargest.value, childIsLarger),
        });

        if (childIsLarger) {
          largest = left;
        }
      }

      if (right < end) {
        const child = items[right];
        const currentLargest = items[largest];
        const childIsLarger = child.value > currentLargest.value;
        stats.comparisons += 1;

        record({
          type: "compare",
          title: childIsLarger ? "Right child becomes largest" : "Keep the larger candidate",
          message: `Compare ${child.value} with current largest ${currentLargest.value}.`,
          detail: childIsLarger
            ? "The possible swap target moves to the right child."
            : `${currentLargest.value} is still the largest member of this family.`,
          line: "compare",
          active: [right, largest],
          candidates: [largest],
          sorted: settled,
          range: [0, end],
          inspection: comparison("child", child.value, ">", "largest", currentLargest.value, childIsLarger),
        });

        if (childIsLarger) {
          largest = right;
        }
      }

      if (largest === parent) {
        record({
          type: "heap",
          title: "Heap order holds here",
          message: `${items[parent].value} is no smaller than either available child.`,
          detail: "This sift-down path is complete.",
          line: "sift",
          active: [parent],
          sorted: settled,
          range: [0, end],
        });
        return;
      }

      const parentItem = items[parent];
      const childItem = items[largest];
      [items[parent], items[largest]] = [items[largest], items[parent]];
      stats.swaps += 1;
      stats.writes += 2;

      record({
        type: "swap",
        title: `Promote ${childItem.value} above ${parentItem.value}`,
        message: `Swap positions ${parent + 1} and ${largest + 1}.`,
        detail: "Continue sifting the displaced parent from its new, lower position.",
        line: "swap",
        active: [parent, largest],
        sorted: settled,
        range: [0, end],
      });
      parent = largest;
    }
  }

  if (items.length < 2) {
    return;
  }

  record({
    type: "heap",
    title: "Build the max heap",
    message: "Sift each internal node from right to left.",
    detail: "Leaves already satisfy heap order because they have no children.",
    line: "build",
    range: [0, items.length],
  });

  for (let parent = Math.floor(items.length / 2) - 1; parent >= 0; parent -= 1) {
    siftDown(parent, items.length);
  }

  for (let end = items.length - 1; end > 0; end -= 1) {
    const maximum = items[0];
    const replacement = items[end];
    [items[0], items[end]] = [items[end], items[0]];
    stats.swaps += 1;
    stats.writes += 2;
    settled.add(end);

    record({
      type: "extract",
      title: `Extract maximum ${maximum.value}`,
      message: `${maximum.value} moves to final position ${end + 1}; ${replacement.value} moves to the root.`,
      detail: "The active heap shrinks by one position before it is repaired.",
      line: "extract",
      active: [0, end],
      sorted: settled,
      range: [0, end],
    });

    siftDown(0, end);
    record({
      type: "heap",
      title: "The smaller heap is repaired",
      message: `The first ${end} positions again satisfy max-heap order.`,
      detail: "The sorted suffix remains untouched.",
      line: "lock",
      sorted: settled,
      range: [0, end],
    });
  }

  settled.add(0);
  record({
    type: "settled",
    title: `${items[0].value} is the final heap value`,
    message: "Position 1 completes the sorted array.",
    detail: "No heap remains to repair.",
    line: "lock",
    active: [0],
    sorted: settled,
  });
}

function shellTrace(items, stats, record) {
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
    });
  }
}

function countingTrace(items, stats, record) {
  const { minimum, maximum, span } = integerBounds(items, "Counting Sort");

  if (items.length < 2) {
    return;
  }

  if (span > 512) {
    throw new RangeError("Counting Sort supports a value range of at most 512 in this visualizer.");
  }

  const counts = Array(span).fill(0);
  const source = [...items];

  record({
    type: "count",
    title: `Create ${span} value counters`,
    message: `Map integer values ${minimum} through ${maximum} to counter positions.`,
    detail: "The value range k controls Counting Sort's extra memory use.",
    line: "init",
    range: [0, items.length],
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
    });
  });
}

function radixTrace(items, stats, record) {
  const { minimum, maximum } = integerBounds(items, "Radix Sort");

  if (items.length < 2) {
    return;
  }

  const maximumKey = maximum - minimum;
  if (!Number.isSafeInteger(maximumKey)) {
    throw new RangeError("Radix Sort requires a safely representable normalized key range.");
  }

  record({
    type: "digit",
    title: "Normalize the radix keys",
    message: `Use each value's distance from ${minimum} as its non-negative key.`,
    detail: "Adding the same offset preserves numerical order, including for negative values.",
    line: "normalize",
    range: [0, items.length],
  });

  if (maximumKey === 0) {
    record({
      type: "digit",
      title: "Every normalized key is zero",
      message: "All values are equal, so no digit pass can change their order.",
      detail: "The existing order is already sorted and remains stable.",
      line: "digit",
      sorted: range(0, items.length),
    });
    return;
  }

  const digitName = (exponent) => {
    if (exponent === 1) return "ones";
    if (exponent === 10) return "tens";
    if (exponent === 100) return "hundreds";
    if (exponent === 1000) return "thousands";
    return `${exponent}s`;
  };

  for (let exponent = 1; exponent <= maximumKey; exponent *= 10) {
    const place = digitName(exponent);
    const finalPass = exponent > Math.floor(maximumKey / 10);
    const buckets = Array.from({ length: 10 }, () => []);
    const source = [...items];

    record({
      type: "digit",
      title: `Read the ${place} digit`,
      message: `Distribute every normalized key into buckets 0 through 9.`,
      detail: "Appending to each bucket preserves the order established by earlier digits.",
      line: "digit",
      range: [0, items.length],
    });

    for (const item of source) {
      const key = item.value - minimum;
      const digit = Math.floor(key / exponent) % 10;
      buckets[digit].push(item);
      stats.writes += 1;
      const currentIndex = items.findIndex((candidate) => candidate.id === item.id);

      record({
        type: "bucket",
        title: `Send ${item.value} to bucket ${digit}`,
        message: `Its normalized ${place} digit is ${digit}.`,
        detail: "Values enter this bucket from left to right, keeping the pass stable.",
        line: "bucket",
        active: [currentIndex],
        range: [0, items.length],
      });
    }

    const output = buckets.flat();
    output.forEach((item, target) => {
      moveItemTo(items, item.id, target);
      stats.writes += 1;

      record({
        type: "write",
        title: `Collect ${item.value} from its bucket`,
        message: `${item.value} moves into position ${target + 1} for this digit pass.`,
        detail: finalPass
          ? `Positions 1–${target + 1} now match the final sorted order.`
          : "Later digits can still regroup this partially ordered sequence.",
        line: "collect",
        active: [target],
        sorted: finalPass ? range(0, target + 1) : [],
        range: [0, items.length],
      });
    });

    record({
      type: "pass",
      title: `${place[0].toUpperCase()}${place.slice(1)} pass complete`,
      message: finalPass ? "Every significant digit has been processed." : "Move to the next decimal digit.",
      detail: "The order from all completed digit passes remains stable.",
      line: "repeat",
      sorted: finalPass ? range(0, items.length) : [],
      range: [0, items.length],
    });

    if (finalPass) {
      break;
    }
  }
}

function cocktailTrace(items, stats, record) {
  const settled = new Set();
  let start = 0;
  let end = items.length - 1;

  while (start < end) {
    let swappedForward = false;

    record({
      type: "pass",
      title: "Sweep from left to right",
      message: `Move the largest unsettled value toward position ${end + 1}.`,
      detail: "This half of the round behaves like a Bubble Sort pass.",
      line: "forward",
      sorted: settled,
      range: [start, end + 1],
    });

    for (let index = start; index < end; index += 1) {
      const left = items[index];
      const right = items[index + 1];
      const shouldSwap = left.value > right.value;
      stats.comparisons += 1;

      record({
        type: "compare",
        title: shouldSwap ? "Push the larger value right" : "This pair can stay",
        message: `Compare ${left.value} on the left with ${right.value} on the right.`,
        detail: shouldSwap
          ? `${left.value} is larger, so exchange the neighbors.`
          : "Their order is already correct for the forward sweep.",
        line: "compare",
        active: [index, index + 1],
        sorted: settled,
        range: [start, end + 1],
        inspection: comparison("left", left.value, ">", "right", right.value, shouldSwap),
      });

      if (shouldSwap) {
        [items[index], items[index + 1]] = [items[index + 1], items[index]];
        stats.swaps += 1;
        stats.writes += 2;
        swappedForward = true;

        record({
          type: "swap",
          title: "Exchange the forward pair",
          message: `${left.value} moves right while ${right.value} moves left.`,
          detail: "The larger value continues traveling toward the right boundary.",
          line: "swap",
          active: [index, index + 1],
          sorted: settled,
          range: [start, end + 1],
        });
      }
    }

    settled.add(end);
    record({
      type: "settled",
      title: `${items[end].value} reaches the right boundary`,
      message: `Position ${end + 1} is now final.`,
      detail: "The next round will stop one position earlier on the right.",
      line: "right",
      active: [end],
      sorted: settled,
      range: [start, end],
    });
    end -= 1;

    if (!swappedForward) {
      range(start, end + 1).forEach((index) => settled.add(index));
      record({
        type: "early-stop",
        title: "The forward sweep made no swaps",
        message: "The remaining region is already sorted.",
        detail: "No backward sweep is necessary.",
        line: "stop",
        sorted: settled,
      });
      break;
    }

    if (start >= end) {
      settled.add(start);
      break;
    }

    let swappedBackward = false;
    record({
      type: "pass",
      title: "Sweep from right to left",
      message: `Move the smallest unsettled value toward position ${start + 1}.`,
      detail: "The direction reverses without restarting from the far boundary.",
      line: "backward",
      sorted: settled,
      range: [start, end + 1],
    });

    for (let index = end; index > start; index -= 1) {
      const left = items[index - 1];
      const right = items[index];
      const shouldSwap = left.value > right.value;
      stats.comparisons += 1;

      record({
        type: "compare",
        title: shouldSwap ? "Pull the smaller value left" : "This pair can stay",
        message: `Compare ${left.value} on the left with ${right.value} on the right.`,
        detail: shouldSwap
          ? `${right.value} is smaller, so exchange the neighbors.`
          : "Their order is already correct for the backward sweep.",
        line: "compare",
        active: [index - 1, index],
        sorted: settled,
        range: [start, end + 1],
        inspection: comparison("left", left.value, ">", "right", right.value, shouldSwap),
      });

      if (shouldSwap) {
        [items[index - 1], items[index]] = [items[index], items[index - 1]];
        stats.swaps += 1;
        stats.writes += 2;
        swappedBackward = true;

        record({
          type: "swap",
          title: "Exchange the backward pair",
          message: `${right.value} moves left while ${left.value} moves right.`,
          detail: "The smaller value continues traveling toward the left boundary.",
          line: "swap",
          active: [index - 1, index],
          sorted: settled,
          range: [start, end + 1],
        });
      }
    }

    settled.add(start);
    record({
      type: "settled",
      title: `${items[start].value} reaches the left boundary`,
      message: `Position ${start + 1} is now final.`,
      detail: "The next round starts one position farther to the right.",
      line: "left",
      active: [start],
      sorted: settled,
      range: [start + 1, end + 1],
    });
    start += 1;

    if (!swappedBackward) {
      range(start, end + 1).forEach((index) => settled.add(index));
      record({
        type: "early-stop",
        title: "The backward sweep made no swaps",
        message: "The remaining region is already sorted.",
        detail: "Both boundaries and the middle region are final.",
        line: "stop",
        sorted: settled,
      });
      break;
    }
  }
}

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
