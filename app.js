import { ALGORITHMS, createAlgorithm } from "./algorithms.js";

const elements = {
  algorithm: document.querySelector("#algorithm"),
  dataset: document.querySelector("#dataset"),
  size: document.querySelector("#size"),
  sizeValue: document.querySelector("#size-value"),
  speed: document.querySelector("#speed"),
  speedValue: document.querySelector("#speed-value"),
  newData: document.querySelector("#new-data"),
  play: document.querySelector("#play"),
  pause: document.querySelector("#pause"),
  step: document.querySelector("#step"),
  reset: document.querySelector("#reset"),
  bars: document.querySelector("#bars"),
  status: document.querySelector("#status"),
  operationLabel: document.querySelector("#operation-label"),
  activeValues: document.querySelector("#active-values"),
  progress: document.querySelector("#progress"),
  progressFill: document.querySelector("#progress-fill"),
  progressValue: document.querySelector("#progress-value"),
  itemCount: document.querySelector("#item-count"),
  comparisons: document.querySelector("#comparisons"),
  swaps: document.querySelector("#swaps"),
  writes: document.querySelector("#writes"),
  steps: document.querySelector("#steps"),
  algorithmName: document.querySelector("#algorithm-name"),
  algorithmDescription: document.querySelector("#algorithm-description"),
  bestComplexity: document.querySelector("#best-complexity"),
  averageComplexity: document.querySelector("#average-complexity"),
  worstComplexity: document.querySelector("#worst-complexity"),
  spaceComplexity: document.querySelector("#space-complexity"),
  stable: document.querySelector("#stable"),
  inPlace: document.querySelector("#in-place"),
};

const EMPTY_STATS = Object.freeze({
  comparisons: 0,
  swaps: 0,
  writes: 0,
  steps: 0,
});

const state = {
  source: [],
  iterator: null,
  currentStep: null,
  playing: false,
  completed: false,
  runToken: 0,
  totalSteps: 0,
};

const OPERATION_LABELS = Object.freeze({
  idle: "Ready",
  compare: "Comparing",
  swap: "Swapping",
  write: "Writing",
  insert: "Inserting",
  range: "Range merged",
  done: "Complete",
});

function shuffle(values) {
  const result = [...values];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
}

function createDataset(kind, size) {
  const ascending = Array.from({ length: size }, (_, index) => index + 1);

  switch (kind) {
    case "nearly-sorted": {
      const values = [...ascending];
      const swaps = Math.max(1, Math.floor(size / 8));

      for (let count = 0; count < swaps; count += 1) {
        const first = Math.floor(Math.random() * size);
        const second = Math.floor(Math.random() * size);
        [values[first], values[second]] = [values[second], values[first]];
      }

      return values;
    }
    case "reversed":
      return ascending.reverse();
    case "few-unique": {
      const levels = Math.min(8, Math.max(3, Math.floor(size / 5)));
      return Array.from({ length: size }, () => 1 + Math.floor(Math.random() * levels));
    }
    case "random":
    default:
      return shuffle(ascending);
  }
}

function idleStep(values, message = "Ready to visualize.") {
  return {
    values: [...values],
    stats: { ...EMPTY_STATS },
    type: "idle",
    active: [],
    sorted: [],
    message,
  };
}

function stopPlayback() {
  state.playing = false;
  state.runToken += 1;
  updateButtons();
}

function countTotalSteps() {
  let finalStep = null;

  for (const step of createAlgorithm(elements.algorithm.value, state.source)) {
    finalStep = step;
  }

  return finalStep?.stats.steps ?? 0;
}

function prepareRun(message = "Ready to visualize.") {
  stopPlayback();
  state.iterator = createAlgorithm(elements.algorithm.value, state.source);
  state.currentStep = idleStep(state.source, message);
  state.completed = false;
  state.totalSteps = countTotalSteps();
  render();
}

function generateData() {
  const size = Number(elements.size.value);
  state.source = createDataset(elements.dataset.value, size);
  prepareRun("New data generated. Choose Play or Step.");
}

function delayForSpeed() {
  const speed = Number(elements.speed.value);
  return Math.max(8, Math.round(610 - speed * 6));
}

function sleep(duration) {
  return new Promise((resolve) => window.setTimeout(resolve, duration));
}

function advance() {
  if (state.completed) {
    return false;
  }

  if (!state.iterator) {
    state.iterator = createAlgorithm(elements.algorithm.value, state.source);
  }

  const next = state.iterator.next();

  if (next.done) {
    state.completed = true;
    state.playing = false;
    updateButtons();
    return false;
  }

  state.currentStep = next.value;
  state.completed = next.value.type === "done";

  if (state.completed) {
    state.playing = false;
  }

  render();
  return !state.completed;
}

async function play() {
  if (state.playing) {
    return;
  }

  if (state.completed) {
    prepareRun("Restarted with the same data.");
  }

  state.playing = true;
  const token = state.runToken + 1;
  state.runToken = token;
  updateButtons();

  while (state.playing && token === state.runToken) {
    const hasMore = advance();

    if (!hasMore) {
      break;
    }

    await sleep(delayForSpeed());
  }

  if (token === state.runToken) {
    state.playing = false;
    updateButtons();
  }
}

function pause() {
  if (!state.playing) {
    return;
  }

  stopPlayback();
  state.currentStep = {
    ...state.currentStep,
    message: "Paused. Continue with Play or advance one operation with Step.",
  };
  render();
}

function stepOnce() {
  stopPlayback();

  if (state.completed) {
    prepareRun("Restarted with the same data.");
  }

  advance();
}

function updateAlgorithmDetails() {
  const details = ALGORITHMS[elements.algorithm.value];
  document.body.dataset.algorithm = elements.algorithm.value;
  elements.algorithmName.textContent = details.name;
  elements.algorithmDescription.textContent = details.description;
  elements.bestComplexity.textContent = details.best;
  elements.averageComplexity.textContent = details.average;
  elements.worstComplexity.textContent = details.worst;
  elements.spaceComplexity.textContent = details.space;
  elements.stable.textContent = details.stable ? "Yes" : "No";
  elements.inPlace.textContent = details.inPlace ? "Yes" : "No";
}

function barState(index, step, active, sorted) {
  if (active.has(index)) {
    return step.type;
  }

  if (sorted.has(index)) {
    return "sorted";
  }

  return "default";
}

function ensureBarNodes(count) {
  if (elements.bars.children.length === count) {
    return Array.from(elements.bars.children);
  }

  const fragment = document.createDocumentFragment();

  for (let index = 0; index < count; index += 1) {
    const bar = document.createElement("div");
    const label = document.createElement("span");
    bar.className = "bar";
    bar.style.setProperty("--bar-index", index);
    bar.setAttribute("aria-hidden", "true");
    label.className = "bar-value";
    bar.append(label);
    fragment.append(bar);
  }

  elements.bars.replaceChildren(fragment);
  return Array.from(elements.bars.children);
}

function renderBars(step) {
  const maximum = Math.max(...step.values, 1);
  const active = new Set(step.active);
  const sorted = new Set(step.sorted);
  const showValues = step.values.length <= 24;
  const bars = ensureBarNodes(step.values.length);
  const firstActive = step.active[0];
  const focusPosition = Number.isInteger(firstActive)
    ? ((firstActive + 0.5) / Math.max(step.values.length, 1)) * 100
    : 50;

  elements.bars.style.setProperty("--bar-gap", step.values.length > 55 ? "2px" : "clamp(3px, 0.45vw, 7px)");
  elements.bars.style.setProperty("--step-duration", `${Math.min(360, Math.max(55, delayForSpeed() * 0.72))}ms`);
  elements.bars.style.setProperty("--focus-x", `${focusPosition}%`);
  elements.bars.style.setProperty("--focus-opacity", step.active.length > 0 ? "1" : "0");
  elements.bars.dataset.operation = step.type;
  elements.bars.dataset.labels = showValues ? "show" : "hide";

  step.values.forEach((value, index) => {
    const bar = bars[index];
    const currentState = barState(index, step, active, sorted);
    bar.dataset.state = currentState;
    bar.style.height = `${Math.max(3, (value / maximum) * 100)}%`;
    bar.title = `Position ${index + 1}: ${value}`;
    bar.children[0].textContent = String(value);
  });

  elements.bars.setAttribute(
    "aria-label",
    `${ALGORITHMS[elements.algorithm.value].name} visualization with ${step.values.length} values. ${step.message}`,
  );
}

function renderProgress(step) {
  const percentage = state.completed
    ? 100
    : state.totalSteps > 0
      ? Math.min(100, (step.stats.steps / state.totalSteps) * 100)
      : 0;

  elements.progressFill.style.width = `${percentage}%`;
  const roundedPercentage = Math.round(percentage);
  elements.progressValue.textContent = percentage > 0 && roundedPercentage === 0 ? "<1%" : `${roundedPercentage}%`;
  elements.progress.setAttribute("aria-valuenow", String(roundedPercentage));
}

function renderOperation(step) {
  const values = step.active
    .map((index) => step.values[index])
    .filter((value) => value !== undefined);

  elements.operationLabel.textContent = OPERATION_LABELS[step.type] ?? "Working";
  elements.activeValues.textContent = values.length > 0 ? values.join(" · ") : "—";
  elements.itemCount.textContent = `${step.values.length} values`;
}

function updateButtons() {
  elements.play.disabled = state.playing;
  elements.pause.disabled = !state.playing;
  elements.step.disabled = state.playing;
  elements.play.textContent = state.completed ? "Replay" : "Play";
}

function render() {
  const step = state.currentStep ?? idleStep(state.source);
  renderBars(step);
  renderProgress(step);
  renderOperation(step);
  updateAlgorithmDetails();

  elements.status.textContent = step.message;
  elements.status.dataset.state = state.completed ? "complete" : step.type === "idle" ? "ready" : "running";
  elements.comparisons.textContent = step.stats.comparisons.toLocaleString();
  elements.swaps.textContent = step.stats.swaps.toLocaleString();
  elements.writes.textContent = step.stats.writes.toLocaleString();
  elements.steps.textContent = step.stats.steps.toLocaleString();
  updateButtons();
}

elements.algorithm.addEventListener("change", () => {
  updateAlgorithmDetails();
  prepareRun("Algorithm changed. The current data is preserved.");
});

elements.dataset.addEventListener("change", generateData);
elements.newData.addEventListener("click", generateData);
elements.play.addEventListener("click", play);
elements.pause.addEventListener("click", pause);
elements.step.addEventListener("click", stepOnce);
elements.reset.addEventListener("click", () => prepareRun("Reset to the original data."));

elements.size.addEventListener("input", () => {
  elements.sizeValue.textContent = elements.size.value;
});

elements.size.addEventListener("change", generateData);

elements.speed.addEventListener("input", () => {
  elements.speedValue.textContent = `${elements.speed.value}%`;
});

document.addEventListener("keydown", (event) => {
  const interactiveElement = event.target.closest("input, select, button, a");

  if (interactiveElement) {
    return;
  }

  if (event.code === "Space") {
    event.preventDefault();
    state.playing ? pause() : play();
  } else if (event.code === "ArrowRight") {
    event.preventDefault();
    stepOnce();
  } else if (event.key.toLowerCase() === "r") {
    prepareRun("Reset to the original data.");
  } else if (event.key.toLowerCase() === "n") {
    generateData();
  }
});

elements.sizeValue.textContent = elements.size.value;
elements.speedValue.textContent = `${elements.speed.value}%`;
generateData();
