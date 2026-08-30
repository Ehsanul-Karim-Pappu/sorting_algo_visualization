export const ALGORITHMS = Object.freeze({
  bubble: Object.freeze({
    name: "Bubble Sort",
    description:
      "Repeatedly compares neighboring values and moves the larger value toward the end. This version stops early when a pass makes no swaps.",
    best: "O(n)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: true,
    inPlace: true,
  }),
  selection: Object.freeze({
    name: "Selection Sort",
    description:
      "Finds the smallest remaining value and places it at the next sorted position.",
    best: "O(n²)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: false,
    inPlace: true,
  }),
  insertion: Object.freeze({
    name: "Insertion Sort",
    description:
      "Builds a sorted prefix by shifting larger values right and inserting each new value into its correct position.",
    best: "O(n)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: true,
    inPlace: true,
  }),
  merge: Object.freeze({
    name: "Merge Sort",
    description:
      "Divides the data into smaller ranges, sorts them recursively, and merges those ranges back together.",
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(n)",
    stable: true,
    inPlace: false,
  }),
});

function normalizeInput(input) {
  if (!Array.isArray(input)) {
    throw new TypeError("The input must be an array.");
  }

  if (!input.every(Number.isFinite)) {
    throw new TypeError("Every array value must be a finite number.");
  }

  return [...input];
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

function snapshot(values, stats, options = {}) {
  return {
    values: [...values],
    stats: { ...stats },
    type: options.type ?? "idle",
    active: [...(options.active ?? [])],
    sorted: [...(options.sorted ?? [])],
    message: options.message ?? "",
  };
}

function completedStep(values, stats, algorithmName) {
  return snapshot(values, stats, {
    type: "done",
    sorted: range(0, values.length),
    message: `${algorithmName} complete.`,
  });
}

export function* bubbleSort(input) {
  const values = normalizeInput(input);
  const stats = createStats();
  const sorted = new Set();

  for (let end = values.length - 1; end > 0; end -= 1) {
    let swapped = false;

    for (let index = 0; index < end; index += 1) {
      stats.comparisons += 1;
      stats.steps += 1;
      yield snapshot(values, stats, {
        type: "compare",
        active: [index, index + 1],
        sorted,
        message: `Compare positions ${index + 1} and ${index + 2}.`,
      });

      if (values[index] > values[index + 1]) {
        [values[index], values[index + 1]] = [values[index + 1], values[index]];
        stats.swaps += 1;
        stats.writes += 2;
        stats.steps += 1;
        swapped = true;

        yield snapshot(values, stats, {
          type: "swap",
          active: [index, index + 1],
          sorted,
          message: `Swap positions ${index + 1} and ${index + 2}.`,
        });
      }
    }

    sorted.add(end);

    if (!swapped) {
      break;
    }
  }

  yield completedStep(values, stats, ALGORITHMS.bubble.name);
}

export function* selectionSort(input) {
  const values = normalizeInput(input);
  const stats = createStats();
  const sorted = new Set();

  for (let index = 0; index < values.length - 1; index += 1) {
    let minimum = index;

    for (let scan = index + 1; scan < values.length; scan += 1) {
      stats.comparisons += 1;
      stats.steps += 1;
      yield snapshot(values, stats, {
        type: "compare",
        active: [minimum, scan],
        sorted,
        message: `Compare the current minimum with position ${scan + 1}.`,
      });

      if (values[scan] < values[minimum]) {
        minimum = scan;
      }
    }

    if (minimum !== index) {
      [values[index], values[minimum]] = [values[minimum], values[index]];
      stats.swaps += 1;
      stats.writes += 2;
      stats.steps += 1;

      yield snapshot(values, stats, {
        type: "swap",
        active: [index, minimum],
        sorted,
        message: `Place the minimum value at position ${index + 1}.`,
      });
    }

    sorted.add(index);
  }

  yield completedStep(values, stats, ALGORITHMS.selection.name);
}

export function* insertionSort(input) {
  const values = normalizeInput(input);
  const stats = createStats();

  for (let index = 1; index < values.length; index += 1) {
    const key = values[index];
    let scan = index - 1;

    while (scan >= 0) {
      stats.comparisons += 1;
      stats.steps += 1;
      yield snapshot(values, stats, {
        type: "compare",
        active: [scan, scan + 1],
        sorted: range(0, index),
        message: `Compare ${key} with the value at position ${scan + 1}.`,
      });

      if (values[scan] <= key) {
        break;
      }

      values[scan + 1] = values[scan];
      stats.writes += 1;
      stats.steps += 1;

      yield snapshot(values, stats, {
        type: "write",
        active: [scan, scan + 1],
        sorted: range(0, index),
        message: `Shift ${values[scan]} one position to the right.`,
      });

      scan -= 1;
    }

    values[scan + 1] = key;
    stats.writes += 1;
    stats.steps += 1;

    yield snapshot(values, stats, {
      type: "insert",
      active: [scan + 1],
      sorted: range(0, index + 1),
      message: `Insert ${key} at position ${scan + 2}.`,
    });
  }

  yield completedStep(values, stats, ALGORITHMS.insertion.name);
}

export function* mergeSort(input) {
  const values = normalizeInput(input);
  const stats = createStats();

  function* sortRange(start, end) {
    if (end - start <= 1) {
      return;
    }

    const middle = start + Math.floor((end - start) / 2);
    yield* sortRange(start, middle);
    yield* sortRange(middle, end);

    const left = values.slice(start, middle);
    const right = values.slice(middle, end);
    let leftIndex = 0;
    let rightIndex = 0;
    let writeIndex = start;

    while (leftIndex < left.length && rightIndex < right.length) {
      stats.comparisons += 1;
      stats.steps += 1;
      yield snapshot(values, stats, {
        type: "compare",
        active: [writeIndex],
        message: `Compare ${left[leftIndex]} and ${right[rightIndex]}.`,
      });

      if (left[leftIndex] <= right[rightIndex]) {
        values[writeIndex] = left[leftIndex];
        leftIndex += 1;
      } else {
        values[writeIndex] = right[rightIndex];
        rightIndex += 1;
      }

      stats.writes += 1;
      stats.steps += 1;
      yield snapshot(values, stats, {
        type: "write",
        active: [writeIndex],
        message: `Write the next value at position ${writeIndex + 1}.`,
      });
      writeIndex += 1;
    }

    while (leftIndex < left.length) {
      values[writeIndex] = left[leftIndex];
      leftIndex += 1;
      stats.writes += 1;
      stats.steps += 1;
      yield snapshot(values, stats, {
        type: "write",
        active: [writeIndex],
        message: `Copy the remaining left-side value to position ${writeIndex + 1}.`,
      });
      writeIndex += 1;
    }

    while (rightIndex < right.length) {
      values[writeIndex] = right[rightIndex];
      rightIndex += 1;
      stats.writes += 1;
      stats.steps += 1;
      yield snapshot(values, stats, {
        type: "write",
        active: [writeIndex],
        message: `Copy the remaining right-side value to position ${writeIndex + 1}.`,
      });
      writeIndex += 1;
    }

    yield snapshot(values, stats, {
      type: "range",
      active: range(start, end),
      message: `Merged positions ${start + 1}–${end}.`,
    });
  }

  yield* sortRange(0, values.length);
  yield completedStep(values, stats, ALGORITHMS.merge.name);
}

const IMPLEMENTATIONS = Object.freeze({
  bubble: bubbleSort,
  selection: selectionSort,
  insertion: insertionSort,
  merge: mergeSort,
});

export function createAlgorithm(algorithmId, input) {
  const implementation = IMPLEMENTATIONS[algorithmId];

  if (!implementation) {
    throw new RangeError(`Unknown algorithm: ${algorithmId}`);
  }

  return implementation(input);
}
