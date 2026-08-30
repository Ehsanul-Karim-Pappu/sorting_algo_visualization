export function normalizeInput(input) {
  if (!Array.isArray(input)) {
    throw new TypeError("The input must be an array.");
  }

  if (!input.every(Number.isFinite)) {
    throw new TypeError("Every array value must be a finite number.");
  }

  return [...input];
}

export function itemize(values) {
  return values.map((value, origin) => ({
    id: `item-${origin}`,
    value,
    origin,
  }));
}

export function createStats() {
  return {
    comparisons: 0,
    swaps: 0,
    writes: 0,
    steps: 0,
  };
}

export function range(start, end) {
  return Array.from({ length: Math.max(0, end - start) }, (_, index) => start + index);
}

export function uniqueIndexes(indexes, length) {
  return [...new Set(indexes)].filter(
    (index) => Number.isInteger(index) && index >= 0 && index < length,
  );
}

export function idsAt(items, indexes) {
  return uniqueIndexes(indexes, items.length).map((index) => items[index].id);
}

export function cloneInspection(inspection) {
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

export function cloneVisual(visual) {
  if (!visual) {
    return null;
  }

  return structuredClone(visual);
}

export function makeRecorder(items, stats) {
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
      visual: cloneVisual(options.visual),
    };

    steps.push(step);
    return step;
  }

  return { steps, record };
}

export function comparison(leftLabel, leftValue, operator, rightLabel, rightValue, truth) {
  return {
    left: { label: leftLabel, value: leftValue },
    right: { label: rightLabel, value: rightValue },
    operator,
    result: truth ? "Yes" : "No",
    truth,
  };
}

export function moveItemTo(items, id, target) {
  const current = items.findIndex((item) => item.id === id);
  const [item] = items.splice(current, 1);
  items.splice(target, 0, item);
}

export function integerBounds(items, algorithmName) {
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
