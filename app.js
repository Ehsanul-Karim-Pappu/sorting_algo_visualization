import { ALGORITHMS, createDataset, createTrace } from "./algorithms.js";

const elements = {
  algorithm: document.querySelector("#algorithm"),
  dataset: document.querySelector("#dataset"),
  size: document.querySelector("#size"),
  sizeValue: document.querySelector("#size-value"),
  speed: document.querySelector("#speed"),
  speedValue: document.querySelector("#speed-value"),
  newData: document.querySelector("#new-data"),
  codeAlgorithm: document.querySelector("#code-algorithm"),
  pseudocode: document.querySelector("#pseudocode"),
  invariant: document.querySelector("#invariant"),
  stageTitle: document.querySelector("#stage-title"),
  tracePosition: document.querySelector("#trace-position"),
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
  trace: null,
  cursor: 0,
  playing: false,
  playbackToken: 0,
};

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

function rebuildTrace({ animate = false } = {}) {
  stopPlayback();
  state.trace = createTrace(elements.algorithm.value, state.source);
  state.cursor = 0;
  elements.timeline.max = String(maximumCursor());
  buildPseudocode();
  renderAlgorithmDetails();
  render(null, animate);
}

function generateData() {
  const size = Number(elements.size.value);
  state.source = createDataset(elements.dataset.value, size);
  rebuildTrace();
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
  renderInspector(step);
  renderPseudocode(step);
  renderRangeReadout(step);
  renderMetrics(step);
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

elements.algorithm.addEventListener("change", () => rebuildTrace());
elements.dataset.addEventListener("change", generateData);
elements.size.addEventListener("input", updateSizeLabel);
elements.size.addEventListener("change", generateData);
elements.speed.addEventListener("input", updateSpeedLabel);
elements.newData.addEventListener("click", generateData);
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
    generateData();
  }
});

updateSizeLabel();
updateSpeedLabel();
generateData();
