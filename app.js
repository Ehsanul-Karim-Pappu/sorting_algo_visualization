import {
  ALGORITHMS,
  applyTraceDetail,
  createDataset,
  createTrace,
  TRACE_DETAIL_MODES,
} from "./algorithms.js";

const elements = {
  algorithm: document.querySelector("#algorithm"),
  dataset: document.querySelector("#dataset"),
  size: document.querySelector("#size"),
  sizeValue: document.querySelector("#size-value"),
  speed: document.querySelector("#speed"),
  speedValue: document.querySelector("#speed-value"),
  detail: document.querySelector("#detail"),
  seed: document.querySelector("#seed"),
  newData: document.querySelector("#new-data"),
  compareToggle: document.querySelector("#compare-toggle"),
  compareField: document.querySelector("#compare-field"),
  compareAlgorithm: document.querySelector("#compare-algorithm"),
  shareLink: document.querySelector("#share-link"),
  shareStatus: document.querySelector("#share-status"),
  customDataPanel: document.querySelector("#custom-data-panel"),
  customData: document.querySelector("#custom-data"),
  applyCustom: document.querySelector("#apply-custom"),
  customError: document.querySelector("#custom-error"),
  codeAlgorithm: document.querySelector("#code-algorithm"),
  pseudocode: document.querySelector("#pseudocode"),
  invariant: document.querySelector("#invariant"),
  stageTitle: document.querySelector("#stage-title"),
  tracePosition: document.querySelector("#trace-position"),
  focusMode: document.querySelector("#focus-mode"),
  focusLabel: document.querySelector("#focus-label"),
  operationLabel: document.querySelector("#operation-label"),
  rangeReadout: document.querySelector("#range-readout"),
  inspection: document.querySelector("#inspection"),
  inspectionNote: document.querySelector("#inspection-note"),
  leftLabel: document.querySelector("#left-label"),
  leftValue: document.querySelector("#left-value"),
  operator: document.querySelector("#operator"),
  rightLabel: document.querySelector("#right-label"),
  rightValue: document.querySelector("#right-value"),
  comparisonResult: document.querySelector("#comparison-result"),
  bars: document.querySelector("#bars"),
  nativeVisual: document.querySelector("#native-visual"),
  stageGrid: document.querySelector("#stage-grid"),
  compareStage: document.querySelector("#compare-stage"),
  compareStageTitle: document.querySelector("#compare-stage-title"),
  compareTracePosition: document.querySelector("#compare-trace-position"),
  compareNativeVisual: document.querySelector("#compare-native-visual"),
  compareBars: document.querySelector("#compare-bars"),
  compareComparisons: document.querySelector("#compare-comparisons"),
  compareSwaps: document.querySelector("#compare-swaps"),
  compareWrites: document.querySelector("#compare-writes"),
  narrationIndex: document.querySelector("#narration-index"),
  stepTitle: document.querySelector("#step-title"),
  status: document.querySelector("#status"),
  stepDetail: document.querySelector("#step-detail"),
  restart: document.querySelector("#restart"),
  previous: document.querySelector("#previous"),
  play: document.querySelector("#play"),
  playIcon: document.querySelector("#play-icon"),
  playLabel: document.querySelector("#play-label"),
  next: document.querySelector("#next"),
  timeline: document.querySelector("#timeline"),
  timelineValue: document.querySelector("#timeline-value"),
  algorithmDescription: document.querySelector("#algorithm-description"),
  comparisons: document.querySelector("#comparisons"),
  swaps: document.querySelector("#swaps"),
  writes: document.querySelector("#writes"),
  bestComplexity: document.querySelector("#best-complexity"),
  averageComplexity: document.querySelector("#average-complexity"),
  worstComplexity: document.querySelector("#worst-complexity"),
  spaceComplexity: document.querySelector("#space-complexity"),
  stabilityChip: document.querySelector("#stability-chip"),
  stableProperty: document.querySelector("#stable-property"),
  placeProperty: document.querySelector("#place-property"),
};

const OPERATION_LABELS = Object.freeze({
  idle: "Ready",
  pass: "New pass",
  compare: "Compare",
  swap: "Swap",
  settled: "Position locked",
  "early-stop": "Early exit",
  select: "Select position",
  candidate: "New candidate",
  key: "Pick up key",
  shift: "Shift",
  insert: "Insert",
  split: "Split range",
  recurse: "Recurse",
  merge: "Begin merge",
  write: "Write",
  merged: "Range merged",
  partition: "Partition",
  pivot: "Choose pivot",
  heap: "Heap repair",
  extract: "Extract maximum",
  gap: "Set gap",
  "gap-done": "Gap complete",
  count: "Count value",
  prefix: "Accumulate counts",
  bucket: "Assign bucket",
  digit: "Digit pass",
  done: "Complete",
});

const MOVEMENT_TYPES = new Set(["swap", "shift", "insert", "write", "extract"]);
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const barNodes = new Map();

const state = {
  source: [],
  fullTrace: null,
  trace: null,
  compareFullTrace: null,
  compareTrace: null,
  compareEnabled: false,
  focusMode: false,
  cursor: 0,
  playing: false,
  playbackToken: 0,
};

const DATASET_TYPES = new Set(["random", "nearly-sorted", "reversed", "few-unique", "custom"]);
const NATIVE_ALGORITHMS = new Set(["merge", "quick", "heap", "shell", "counting", "radix"]);
const MAX_CUSTOM_VALUES = 64;

function makeElement(tagName, className, text) {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = String(text);
  return node;
}

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

function normalizedSeed() {
  const parsed = Number(elements.seed.value);
  const seed = Number.isSafeInteger(parsed) ? Math.min(2147483647, Math.max(0, parsed)) : 2026;
  elements.seed.value = String(seed);
  return seed;
}

function parseCustomValues(raw) {
  const tokens = raw.trim().split(/[\s,]+/).filter(Boolean);
  if (tokens.length < 2 || tokens.length > MAX_CUSTOM_VALUES) {
    throw new RangeError(`Enter between 2 and ${MAX_CUSTOM_VALUES} values.`);
  }

  const values = tokens.map(Number);
  if (!values.every(Number.isFinite)) {
    throw new TypeError("Every custom value must be a finite number.");
  }
  return values;
}

function setCustomError(message = "") {
  elements.customError.textContent = message;
  elements.customData.setAttribute("aria-invalid", String(Boolean(message)));
}

function updateDatasetControls() {
  const custom = elements.dataset.value === "custom";
  elements.customDataPanel.hidden = !custom;
  elements.size.disabled = custom;
  if (custom && state.source.length > 0) {
    elements.sizeValue.textContent = String(state.source.length);
  } else {
    updateSizeLabel();
  }
}

function nextComparisonAlgorithm(primaryId) {
  return Object.keys(ALGORITHMS).find((id) => id !== primaryId) ?? primaryId;
}

function normalizeComparisonChoice() {
  if (elements.compareAlgorithm.value === elements.algorithm.value) {
    elements.compareAlgorithm.value = nextComparisonAlgorithm(elements.algorithm.value);
  }
}

function setCompareEnabled(enabled, { rebuild = true } = {}) {
  state.compareEnabled = Boolean(enabled);
  normalizeComparisonChoice();
  elements.compareToggle.setAttribute("aria-pressed", String(state.compareEnabled));
  elements.compareToggle.classList.toggle("active", state.compareEnabled);
  elements.compareField.hidden = !state.compareEnabled;
  elements.compareStage.hidden = !state.compareEnabled;
  elements.stageGrid.dataset.compare = String(state.compareEnabled);
  document.body.dataset.compare = String(state.compareEnabled);

  if (rebuild && state.source.length > 0) {
    rebuildTraces();
  }
}

function setFocusMode(enabled) {
  state.focusMode = Boolean(enabled);
  document.body.dataset.focusMode = String(state.focusMode);
  elements.focusMode.setAttribute("aria-pressed", String(state.focusMode));
  elements.focusLabel.textContent = state.focusMode ? "Exit focus" : "Focus";
  elements.focusMode.querySelector("span[aria-hidden]").textContent = state.focusMode ? "×" : "⛶";

  if (state.focusMode) {
    elements.stageTitle.scrollIntoView({ block: "start", behavior: motionQuery.matches ? "auto" : "smooth" });
  }
}

function syncUrl() {
  const params = new URLSearchParams();
  params.set("algorithm", elements.algorithm.value);
  params.set("dataset", elements.dataset.value);
  params.set("detail", elements.detail.value);
  params.set("seed", String(normalizedSeed()));
  params.set("size", elements.dataset.value === "custom" ? String(state.source.length) : elements.size.value);

  if (state.compareEnabled) {
    params.set("compare", elements.compareAlgorithm.value);
  }
  if (elements.dataset.value === "custom") {
    params.set("values", state.source.join(","));
  }

  const query = params.toString();
  window.history.replaceState(null, "", `${window.location.pathname}?${query}${window.location.hash}`);
}

function restoreUrlState() {
  const params = new URLSearchParams(window.location.search);
  const algorithm = params.get("algorithm");
  const dataset = params.get("dataset");
  const detail = params.get("detail");
  const compare = params.get("compare");
  const size = Number(params.get("size"));
  const seed = Number(params.get("seed"));

  if (algorithm && ALGORITHMS[algorithm]) elements.algorithm.value = algorithm;
  if (dataset && DATASET_TYPES.has(dataset)) elements.dataset.value = dataset;
  if (detail && TRACE_DETAIL_MODES[detail]) elements.detail.value = detail;
  if (params.has("size") && Number.isInteger(size) && size >= 6 && size <= 36) {
    elements.size.value = String(size);
  }
  if (params.has("seed") && Number.isSafeInteger(seed) && seed >= 0 && seed <= 2147483647) {
    elements.seed.value = String(seed);
  }
  if (compare && ALGORITHMS[compare]) elements.compareAlgorithm.value = compare;
  if (params.has("values")) elements.customData.value = params.get("values");

  setCompareEnabled(Boolean(compare && ALGORITHMS[compare]), { rebuild: false });
  updateDatasetControls();
}

function maximumCursor() {
  return Math.max(0, (state.trace?.steps.length ?? 1) - 1);
}

function currentStep() {
  return state.trace.steps[state.cursor];
}

function tempoLabel(speed) {
  if (speed <= 20) return "Deliberate";
  if (speed <= 55) return "Steady";
  if (speed <= 82) return "Brisk";
  return "Sprint";
}

function delayForSpeed() {
  return Math.max(55, Math.round(1110 - Number(elements.speed.value) * 10.5));
}

function movementDuration() {
  return Math.min(520, Math.max(170, delayForSpeed() * 0.72));
}

function sleep(duration) {
  return new Promise((resolve) => window.setTimeout(resolve, duration));
}

function stopPlayback() {
  state.playing = false;
  state.playbackToken += 1;
  renderTransport();
}

function buildPseudocode() {
  const algorithm = ALGORITHMS[elements.algorithm.value];
  const fragment = document.createDocumentFragment();

  algorithm.pseudocode.forEach((line, index) => {
    const item = document.createElement("li");
    const number = document.createElement("span");
    const code = document.createElement("code");

    item.dataset.line = line.id;
    item.style.setProperty("--depth", line.depth);
    number.className = "code-line-number";
    number.textContent = String(index + 1).padStart(2, "0");
    code.textContent = line.code;
    item.append(number, code);
    fragment.append(item);
  });

  elements.pseudocode.replaceChildren(fragment);
}

function renderAlgorithmDetails() {
  const algorithm = ALGORITHMS[elements.algorithm.value];

  document.documentElement.style.setProperty("--algorithm-accent", algorithm.accent);
  document.body.dataset.algorithm = elements.algorithm.value;
  elements.codeAlgorithm.textContent = algorithm.shortName;
  elements.stageTitle.textContent = algorithm.name;
  elements.invariant.textContent = algorithm.invariant;
  elements.algorithmDescription.textContent = algorithm.description;
  elements.bestComplexity.textContent = algorithm.best;
  elements.averageComplexity.textContent = algorithm.average;
  elements.worstComplexity.textContent = algorithm.worst;
  elements.spaceComplexity.textContent = algorithm.space;
  elements.stabilityChip.textContent = algorithm.stable ? "Stable" : "Not stable";
  elements.stabilityChip.dataset.positive = String(algorithm.stable);
  elements.stableProperty.textContent = algorithm.stable ? "✓ Stable" : "○ Not stable";
  elements.placeProperty.textContent = algorithm.inPlace ? "✓ In place" : "○ Extra array";
}

function rebuildTraces({ animate = false, source = state.source } = {}) {
  try {
    const fullTrace = createTrace(elements.algorithm.value, source);
    const trace = applyTraceDetail(fullTrace, elements.detail.value);
    let compareFullTrace = null;
    let compareTrace = null;

    if (state.compareEnabled) {
      normalizeComparisonChoice();
      compareFullTrace = createTrace(elements.compareAlgorithm.value, source);
      compareTrace = applyTraceDetail(compareFullTrace, elements.detail.value);
    }

    stopPlayback();
    state.source = [...source];
    state.fullTrace = fullTrace;
    state.trace = trace;
    state.compareFullTrace = compareFullTrace;
    state.compareTrace = compareTrace;
    state.cursor = 0;
    elements.timeline.max = String(maximumCursor());
    buildPseudocode();
    renderAlgorithmDetails();
    updateDatasetControls();
    setCustomError();
    render(null, animate);
    syncUrl();
    return true;
  } catch (error) {
    setCustomError(error instanceof Error ? error.message : "This dataset cannot be visualized.");
    return false;
  }
}

function generateData({ advanceSeed = false } = {}) {
  try {
    if (advanceSeed && elements.dataset.value !== "custom") {
      elements.seed.value = String((normalizedSeed() + 1) % 2147483648);
    }

    const source = elements.dataset.value === "custom"
      ? parseCustomValues(elements.customData.value)
      : createDataset(
          elements.dataset.value,
          Number(elements.size.value),
          seededRandom(normalizedSeed()),
        );
    return rebuildTraces({ source });
  } catch (error) {
    setCustomError(error instanceof Error ? error.message : "Could not create this dataset.");
    return false;
  }
}

function createBarNode(item) {
  const node = document.createElement("div");
  const value = document.createElement("span");
  const column = document.createElement("span");
  const position = document.createElement("span");

  node.className = "bar-item";
  node.dataset.itemId = item.id;
  node.setAttribute("aria-hidden", "true");
  value.className = "bar-value";
  column.className = "bar-column";
  position.className = "bar-position";
  node.append(value, column, position);
  barNodes.set(item.id, node);
  return node;
}

function captureBarPositions() {
  const positions = new Map();

  for (const [id, node] of barNodes) {
    if (node.isConnected) {
      positions.set(id, node.getBoundingClientRect());
    }
  }

  return positions;
}

function roleFor(item, step) {
  if (step.type === "done" && step.sortedIds.includes(item.id)) return "sorted";
  if (step.keyIds.includes(item.id)) return "key";
  if (step.candidateIds.includes(item.id)) return "candidate";

  if (step.activeIds.includes(item.id)) {
    if (step.type === "compare") return "compare";
    if (MOVEMENT_TYPES.has(step.type)) return "moving";
    return "focus";
  }

  if (step.sortedIds.includes(item.id)) return "sorted";
  return "default";
}

function renderBars(step, previousStep, animate) {
  const oldPositions = captureBarPositions();
  const relevantIds = new Set(step.items.map((item) => item.id));
  const fragment = document.createDocumentFragment();
  const values = step.items.map((item) => item.value);
  const minimum = Math.min(...values, 0);
  const maximum = Math.max(...values, 1);
  const spread = Math.max(1, maximum - minimum);
  const showValues = step.items.length <= 24;
  const showPositions = step.items.length <= 18;

  for (const [id, node] of barNodes) {
    if (!relevantIds.has(id)) {
      node.remove();
      barNodes.delete(id);
    }
  }

  step.items.forEach((item, index) => {
    const node = barNodes.get(item.id) ?? createBarNode(item);
    const height = 18 + ((item.value - minimum) / spread) * 72;
    const inRange = !step.range || (index >= step.range[0] && index < step.range[1]);
    const role = roleFor(item, step);

    node.dataset.role = role;
    node.dataset.operation = step.type;
    node.dataset.inRange = String(inRange);
    node.style.setProperty("--bar-height", `${height}%`);
    node.style.setProperty("--bar-order", index);
    node.querySelector(".bar-value").textContent = String(item.value);
    node.querySelector(".bar-position").textContent = String(index + 1);
    node.title = `Position ${index + 1}: ${item.value}`;
    fragment.append(node);
  });

  elements.bars.replaceChildren(fragment);
  elements.bars.dataset.values = showValues ? "show" : "hide";
  elements.bars.dataset.positions = showPositions ? "show" : "hide";
  elements.bars.dataset.partitioned = String(Boolean(step.partition));
  elements.bars.style.setProperty("--bar-count", step.items.length);
  elements.bars.style.setProperty("--bar-gap", step.items.length > 28 ? "3px" : "clamp(5px, 0.65vw, 11px)");

  if (step.partition) {
    const [, middle] = step.partition;
    elements.bars.style.setProperty("--partition-x", `${(middle / step.items.length) * 100}%`);
  }

  if (animate && previousStep && !motionQuery.matches) {
    const duration = movementDuration();

    for (const [id, oldPosition] of oldPositions) {
      const node = barNodes.get(id);
      if (!node || typeof node.animate !== "function") continue;

      const newPosition = node.getBoundingClientRect();
      const deltaX = oldPosition.left - newPosition.left;

      if (Math.abs(deltaX) > 0.5) {
        node.getAnimations().forEach((animation) => animation.cancel());
        node.animate(
          [
            { transform: `translate3d(${deltaX}px, 0, 0)` },
            { transform: "translate3d(0, 0, 0)" },
          ],
          {
            duration,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          },
        );
      }
    }
  }

  elements.bars.setAttribute(
    "aria-label",
    `${ALGORITHMS[elements.algorithm.value].name}, step ${step.sequence}. ${step.message}`,
  );
}

function nativeHeading(label, detail) {
  const heading = makeElement("div", "native-heading");
  heading.append(makeElement("span", "native-label", label), makeElement("strong", "native-phase", detail));
  return heading;
}

function nativeChip(item, { active = false, consumed = false, role = "default", label = "" } = {}) {
  const chip = makeElement("span", "native-chip", item?.value ?? "—");
  chip.dataset.active = String(active);
  chip.dataset.consumed = String(consumed);
  chip.dataset.role = role;
  if (label) chip.title = label;
  return chip;
}

function renderMergeView(step, container) {
  const visual = step.visual?.kind === "merge" ? step.visual : null;
  const fallbackStart = step.range?.[0] ?? 0;
  const fallbackEnd = step.range?.[1] ?? step.items.length;
  const fallbackMiddle = step.partition?.[1] ?? fallbackStart + Math.floor((fallbackEnd - fallbackStart) / 2);
  const left = visual?.left ?? step.items.slice(fallbackStart, fallbackMiddle);
  const right = visual?.right ?? step.items.slice(fallbackMiddle, fallbackEnd);
  const leftCursor = visual?.leftCursor ?? 0;
  const rightCursor = visual?.rightCursor ?? 0;
  const writeIndex = visual?.writeIndex ?? visual?.start ?? fallbackStart;
  const buffers = makeElement("div", "merge-buffers");

  for (const [name, values, cursor] of [["Left buffer", left, leftCursor], ["Right buffer", right, rightCursor]]) {
    const buffer = makeElement("section", "merge-buffer");
    buffer.append(makeElement("span", "buffer-label", name));
    const row = makeElement("div", "buffer-values");
    values.forEach((item, index) => {
      row.append(nativeChip(item, {
        active: index === cursor,
        consumed: index < cursor,
        role: item.id === visual?.chosenId ? "moving" : "default",
        label: `${name}, value ${item.value}`,
      }));
    });
    if (values.length === 0) row.append(nativeChip(null));
    buffer.append(row);
    buffers.append(buffer);
  }

  container.append(
    nativeHeading("Temporary merge buffers", visual?.phase ?? "Waiting for a split"),
    buffers,
    makeElement("p", "native-footnote", `Next output position: ${writeIndex + 1}`),
  );
}

function renderQuickView(step, container) {
  const visual = step.visual?.kind === "quick" ? step.visual : null;
  const start = visual?.start ?? step.range?.[0] ?? 0;
  const end = visual?.end ?? Math.max(start, (step.range?.[1] ?? step.items.length) - 1);
  const pivotId = visual?.pivotId ?? step.candidateIds[0] ?? step.items[end]?.id;
  const pivotIndex = Math.max(start, step.items.findIndex((item) => item.id === pivotId));
  const boundary = Math.min(pivotIndex, Math.max(start, visual?.boundary ?? start));
  const groups = makeElement("div", "quick-partitions");
  const sections = [
    ["≤ pivot", step.items.slice(start, boundary), "accepted"],
    ["Unclassified", step.items.slice(boundary, pivotIndex), "pending"],
    ["Pivot", pivotIndex >= 0 ? [step.items[pivotIndex]] : [], "pivot"],
  ];

  for (const [label, values, kind] of sections) {
    const section = makeElement("section", "partition-group");
    section.dataset.partition = kind;
    section.append(makeElement("span", "buffer-label", label));
    const row = makeElement("div", "buffer-values");
    values.forEach((item) => row.append(nativeChip(item, {
      active: item.id === pivotId || item.id === step.items[visual?.scan]?.id,
      role: item.id === pivotId ? "candidate" : roleFor(item, step),
    })));
    if (values.length === 0) row.append(nativeChip(null));
    section.append(row);
    groups.append(section);
  }

  container.append(
    nativeHeading("Pivot partition", visual?.phase ?? "Waiting for a partition"),
    groups,
    makeElement("p", "native-footnote", `Boundary opens at position ${boundary + 1}`),
  );
}

function buildHeapBranch(step, index, heapSize) {
  if (index >= heapSize) return null;
  const listItem = makeElement("li", "heap-branch");
  const item = step.items[index];
  const node = makeElement("span", "heap-node");
  node.dataset.role = roleFor(item, step);
  node.append(makeElement("strong", "", item.value), makeElement("small", "", `#${index + 1}`));
  node.title = `Heap position ${index + 1}: ${item.value}`;
  listItem.append(node);

  const left = buildHeapBranch(step, index * 2 + 1, heapSize);
  const right = buildHeapBranch(step, index * 2 + 2, heapSize);
  if (left || right) {
    const children = makeElement("ol", "heap-children");
    if (left) children.append(left);
    if (right) children.append(right);
    listItem.append(children);
  }
  return listItem;
}

function renderHeapView(step, container) {
  const visual = step.visual?.kind === "heap" ? step.visual : null;
  const heapSize = Math.max(0, Math.min(step.items.length, visual?.heapSize ?? step.range?.[1] ?? step.items.length));
  const tree = makeElement("ol", "heap-tree");
  const root = buildHeapBranch(step, 0, heapSize);
  if (root) tree.append(root);
  const sortedCount = step.items.length - heapSize;
  container.append(
    nativeHeading("Max-heap tree", visual?.phase ?? "Array-to-tree mapping"),
    tree,
    makeElement("p", "native-footnote", `${heapSize} in heap · ${sortedCount} extracted`),
  );
}

function renderShellView(step, container) {
  const visual = step.visual?.kind === "shell" ? step.visual : null;
  const gap = Math.max(1, visual?.gap ?? (Math.floor(step.items.length / 2) || 1));
  const lanes = makeElement("div", "gap-lanes");

  for (let offset = 0; offset < Math.min(gap, step.items.length); offset += 1) {
    const lane = makeElement("section", "gap-lane");
    lane.append(makeElement("span", "buffer-label", `Lane ${offset + 1}`));
    const row = makeElement("div", "buffer-values");
    for (let index = offset; index < step.items.length; index += gap) {
      const item = step.items[index];
      row.append(nativeChip(item, {
        active: index === visual?.keyIndex,
        role: roleFor(item, step),
        label: `Position ${index + 1}, value ${item.value}`,
      }));
    }
    lane.append(row);
    lanes.append(lane);
  }

  container.append(
    nativeHeading(`Gap-${gap} subsequences`, visual?.phase ?? "Interleaved insertion lanes"),
    lanes,
  );
}

function sampledCounterIndexes(counts, activeIndex) {
  if (counts.length <= 28) return counts.map((_, index) => index);
  const indexes = new Set([0, counts.length - 1]);
  const stride = Math.ceil(counts.length / 24);
  for (let index = 0; index < counts.length; index += stride) indexes.add(index);
  if (Number.isInteger(activeIndex)) indexes.add(activeIndex);
  return [...indexes].sort((left, right) => left - right).slice(0, 28);
}

function renderCountingView(step, container) {
  const visual = step.visual?.kind === "counting" ? step.visual : null;
  const values = step.items.map((item) => item.value);
  const minimum = visual?.minimum ?? Math.min(...values, 0);
  const maximum = visual?.maximum ?? Math.max(...values, 0);
  const span = Math.max(1, maximum - minimum + 1);
  const counts = visual?.counts ?? Array(span).fill(0);
  const activeIndex = Number.isFinite(visual?.activeValue) ? visual.activeValue - minimum : null;
  const table = makeElement("div", "count-table");

  sampledCounterIndexes(counts, activeIndex).forEach((index) => {
    const cell = makeElement("div", "count-cell");
    cell.dataset.active = String(index === activeIndex);
    cell.append(
      makeElement("span", "count-value", minimum + index),
      makeElement("strong", "count-total", counts[index]),
    );
    table.append(cell);
  });

  container.append(nativeHeading("Frequency → prefix table", visual?.phase ?? "Counters ready"), table);
  if (visual?.output) {
    const output = makeElement("div", "output-slots");
    visual.output.slice(0, 28).forEach((item, index) => {
      const slot = nativeChip(item, { active: index === visual.target, role: index === visual.target ? "moving" : "default" });
      slot.title = `Output position ${index + 1}`;
      output.append(slot);
    });
    container.append(output);
  }
}

function renderRadixView(step, container) {
  const visual = step.visual?.kind === "radix" ? step.visual : null;
  const buckets = visual?.buckets ?? Array.from({ length: 10 }, () => []);
  const grid = makeElement("div", "radix-buckets");

  buckets.forEach((items, digit) => {
    const bucket = makeElement("section", "radix-bucket");
    bucket.dataset.active = String(digit === visual?.digit);
    bucket.append(makeElement("span", "bucket-digit", digit));
    const stack = makeElement("div", "bucket-stack");
    items.slice(0, 8).forEach((item) => stack.append(nativeChip(item, {
      active: item.value === visual?.activeValue,
      role: item.value === visual?.activeValue ? "moving" : "default",
    })));
    bucket.append(stack);
    grid.append(bucket);
  });

  container.append(
    nativeHeading("Decimal buckets", visual?.place ? `${visual.place} digit` : "Buckets 0–9"),
    grid,
  );
}

function renderNativeView(step, algorithmId, container) {
  if (!NATIVE_ALGORITHMS.has(algorithmId)) {
    container.hidden = true;
    container.replaceChildren();
    return;
  }

  container.hidden = false;
  container.dataset.kind = algorithmId;
  container.setAttribute("role", "group");
  container.setAttribute("aria-label", `${ALGORITHMS[algorithmId].name} internal structure`);
  container.replaceChildren();

  const renderers = {
    merge: renderMergeView,
    quick: renderQuickView,
    heap: renderHeapView,
    shell: renderShellView,
    counting: renderCountingView,
    radix: renderRadixView,
  };
  renderers[algorithmId](step, container);
}

function compareCursor() {
  if (!state.compareTrace) return 0;
  const primaryMaximum = maximumCursor();
  const compareMaximum = Math.max(0, state.compareTrace.steps.length - 1);
  if (primaryMaximum === 0) return compareMaximum;
  return Math.round((state.cursor / primaryMaximum) * compareMaximum);
}

function renderCompareBars(step) {
  const values = step.items.map((item) => item.value);
  const minimum = Math.min(...values, 0);
  const maximum = Math.max(...values, 1);
  const spread = Math.max(1, maximum - minimum);
  const fragment = document.createDocumentFragment();

  step.items.forEach((item, index) => {
    const bar = makeElement("span", "compare-bar");
    bar.dataset.role = roleFor(item, step);
    bar.style.setProperty("--bar-height", `${18 + ((item.value - minimum) / spread) * 72}%`);
    bar.title = `Position ${index + 1}: ${item.value}`;
    fragment.append(bar);
  });

  elements.compareBars.replaceChildren(fragment);
  elements.compareBars.style.setProperty("--bar-count", step.items.length);
  elements.compareBars.setAttribute(
    "aria-label",
    `${ALGORITHMS[elements.compareAlgorithm.value].name}, synchronized step ${step.sequence}. ${step.message}`,
  );
}

function renderComparison() {
  if (!state.compareEnabled || !state.compareTrace) {
    elements.compareStage.hidden = true;
    return;
  }

  elements.compareStage.hidden = false;
  const cursor = compareCursor();
  const maximum = state.compareTrace.steps.length - 1;
  const step = state.compareTrace.steps[cursor];
  const algorithmId = elements.compareAlgorithm.value;
  elements.compareStageTitle.textContent = ALGORITHMS[algorithmId].name;
  elements.compareTracePosition.textContent = `${cursor} / ${maximum}`;
  elements.compareComparisons.textContent = step.stats.comparisons.toLocaleString();
  elements.compareSwaps.textContent = step.stats.swaps.toLocaleString();
  elements.compareWrites.textContent = step.stats.writes.toLocaleString();
  renderNativeView(step, algorithmId, elements.compareNativeVisual);
  renderCompareBars(step);
}

function renderInspector(step) {
  const inspection = step.inspection;
  elements.inspection.dataset.active = String(Boolean(inspection));

  if (!inspection) {
    elements.inspectionNote.textContent =
      step.detail || "Compared values will appear here as the algorithm makes a decision.";
    return;
  }

  elements.leftLabel.textContent = inspection.left.label;
  elements.leftValue.textContent = String(inspection.left.value);
  elements.operator.textContent = inspection.operator;
  elements.rightLabel.textContent = inspection.right.label;
  elements.rightValue.textContent = String(inspection.right.value);
  elements.comparisonResult.textContent = inspection.result;
  elements.comparisonResult.dataset.truth = String(inspection.truth);
}

function renderPseudocode(step) {
  const lines = elements.pseudocode.querySelectorAll("li");

  lines.forEach((line) => {
    const active = line.dataset.line === step.line;
    line.dataset.active = String(active);
    if (active) {
      line.setAttribute("aria-current", "step");
    } else {
      line.removeAttribute("aria-current");
    }
  });
}

function renderRangeReadout(step) {
  if (step.type === "done") {
    elements.rangeReadout.textContent = `${step.items.length} / ${step.items.length} sorted`;
    return;
  }

  if (step.range && step.range[1] > step.range[0]) {
    elements.rangeReadout.textContent = `Focus: ${step.range[0] + 1}–${step.range[1]}`;
    return;
  }

  elements.rangeReadout.textContent = `${step.items.length} values`;
}

function renderMetrics(step) {
  elements.comparisons.textContent = step.stats.comparisons.toLocaleString();
  elements.swaps.textContent = step.stats.swaps.toLocaleString();
  elements.writes.textContent = step.stats.writes.toLocaleString();
}

function renderTransport() {
  if (!state.trace) return;

  const maximum = maximumCursor();
  const percentage = maximum > 0 ? (state.cursor / maximum) * 100 : 0;
  elements.restart.disabled = state.cursor === 0;
  elements.previous.disabled = state.cursor === 0;
  elements.next.disabled = state.cursor === maximum;
  elements.play.disabled = maximum === 0;
  elements.play.setAttribute("aria-pressed", String(state.playing));
  elements.playIcon.textContent = state.playing ? "Ⅱ" : state.cursor === maximum ? "↺" : "▶";
  elements.playLabel.textContent = state.playing
    ? "Pause trace"
    : state.cursor === maximum
      ? "Replay trace"
      : "Play trace";
  elements.timeline.value = String(state.cursor);
  elements.timelineValue.textContent = `${Math.round(percentage)}%`;
  elements.timeline.style.setProperty("--timeline-progress", `${percentage}%`);
}

function render(previousStep = null, animate = true) {
  const step = currentStep();
  const maximum = maximumCursor();

  document.body.dataset.operation = step.type;
  elements.tracePosition.textContent = `${state.cursor} / ${maximum}`;
  elements.operationLabel.textContent = OPERATION_LABELS[step.type] ?? "Working";
  elements.narrationIndex.textContent = String(step.sequence).padStart(2, "0");
  elements.stepTitle.textContent = step.title;
  elements.status.textContent = step.message;
  elements.stepDetail.textContent = step.detail;

  renderBars(step, previousStep, animate);
  renderNativeView(step, elements.algorithm.value, elements.nativeVisual);
  renderInspector(step);
  renderPseudocode(step);
  renderRangeReadout(step);
  renderMetrics(step);
  renderComparison();
  renderTransport();
}

function setCursor(cursor, { animate = true } = {}) {
  const nextCursor = Math.min(maximumCursor(), Math.max(0, Number(cursor)));
  const previousStep = currentStep();
  const distance = Math.abs(nextCursor - state.cursor);
  state.cursor = nextCursor;
  render(previousStep, animate && distance === 1);
}

async function playTrace() {
  if (state.playing) {
    stopPlayback();
    return;
  }

  if (state.cursor === maximumCursor()) {
    setCursor(0, { animate: false });
  }

  state.playing = true;
  const token = state.playbackToken + 1;
  state.playbackToken = token;
  renderTransport();

  while (state.playing && token === state.playbackToken && state.cursor < maximumCursor()) {
    setCursor(state.cursor + 1);

    if (state.cursor < maximumCursor()) {
      await sleep(delayForSpeed());
    }
  }

  if (token === state.playbackToken) {
    state.playing = false;
    renderTransport();
  }
}

function stepBy(amount) {
  stopPlayback();
  setCursor(state.cursor + amount);
}

function restartTrace() {
  stopPlayback();
  setCursor(0, { animate: false });
}

function updateSizeLabel() {
  elements.sizeValue.textContent = elements.size.value;
}

function updateSpeedLabel() {
  const speed = Number(elements.speed.value);
  elements.speedValue.textContent = tempoLabel(speed);
  elements.speedValue.title = `${delayForSpeed()} milliseconds per trace step`;
}

function isTypingTarget(target) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLButtonElement ||
    target.isContentEditable
  );
}

async function copyShareLink() {
  syncUrl();
  try {
    await navigator.clipboard.writeText(window.location.href);
    elements.shareStatus.textContent = "Link copied";
  } catch {
    elements.shareStatus.textContent = "Share URL is ready in the address bar";
  }
  window.setTimeout(() => {
    elements.shareStatus.textContent = "";
  }, 2400);
}

elements.algorithm.addEventListener("change", () => {
  const previousAlgorithm = state.trace?.algorithmId;
  normalizeComparisonChoice();
  if (!rebuildTraces() && previousAlgorithm) {
    elements.algorithm.value = previousAlgorithm;
  }
});
elements.dataset.addEventListener("change", () => {
  updateDatasetControls();
  generateData();
});
elements.size.addEventListener("input", updateSizeLabel);
elements.size.addEventListener("change", () => {
  if (elements.dataset.value !== "custom") generateData();
});
elements.speed.addEventListener("input", updateSpeedLabel);
elements.detail.addEventListener("change", () => rebuildTraces());
elements.seed.addEventListener("input", () => {
  if (elements.dataset.value !== "custom") generateData();
});
elements.newData.addEventListener("click", () => generateData({ advanceSeed: true }));
elements.applyCustom.addEventListener("click", () => generateData());
elements.customData.addEventListener("keydown", (event) => {
  if (event.key === "Enter") generateData();
});
elements.compareToggle.addEventListener("click", () => {
  setCompareEnabled(!state.compareEnabled);
  syncUrl();
});
elements.compareAlgorithm.addEventListener("change", () => {
  normalizeComparisonChoice();
  rebuildTraces();
});
elements.shareLink.addEventListener("click", copyShareLink);
elements.focusMode.addEventListener("click", () => setFocusMode(!state.focusMode));
elements.restart.addEventListener("click", restartTrace);
elements.previous.addEventListener("click", () => stepBy(-1));
elements.next.addEventListener("click", () => stepBy(1));
elements.play.addEventListener("click", playTrace);
elements.timeline.addEventListener("input", () => {
  const requestedCursor = elements.timeline.value;
  stopPlayback();
  setCursor(requestedCursor);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.focusMode) {
    setFocusMode(false);
    return;
  }

  if (isTypingTarget(event.target) || event.metaKey || event.ctrlKey || event.altKey) {
    return;
  }

  if (event.code === "Space") {
    event.preventDefault();
    playTrace();
  } else if (event.code === "ArrowRight") {
    event.preventDefault();
    stepBy(1);
  } else if (event.code === "ArrowLeft") {
    event.preventDefault();
    stepBy(-1);
  } else if (event.key.toLowerCase() === "r") {
    restartTrace();
  } else if (event.key.toLowerCase() === "n") {
    generateData({ advanceSeed: true });
  } else if (event.key.toLowerCase() === "f") {
    setFocusMode(!state.focusMode);
  }
});

window.addEventListener("popstate", () => {
  restoreUrlState();
  generateData();
});

restoreUrlState();
updateSizeLabel();
updateSpeedLabel();
if (!generateData()) {
  elements.dataset.value = "random";
  elements.customData.value = "42, 17, 63, 8, 29, 51, 34, 12";
  updateDatasetControls();
  generateData();
}
