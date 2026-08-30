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
};

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

function prepareRun(message = "Ready to visualize.") {
  stopPlayback();
  state.iterator = createAlgorithm(elements.algorithm.value, state.source);
  state.currentStep = idleStep(state.source, message);
  state.completed = false;
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

function renderBars(step) {
  const maximum = Math.max(...step.values, 1);
  const active = new Set(step.active);
  const sorted = new Set(step.sorted);
  const showValues = step.values.length <= 24;
  const fragment = document.createDocumentFragment();

  elements.bars.style.setProperty("--bar-gap", step.values.length > 55 ? "2px" : "clamp(3px, 0.45vw, 7px)");

  step.values.forEach((value, index) => {
    const bar = document.createElement("div");
    const currentState = barState(index, step, active, sorted);
    bar.className = "bar";
    bar.dataset.state = currentState;
    bar.style.height = `${Math.max(3, (value / maximum) * 100)}%`;
    bar.title = `Position ${index + 1}: ${value}`;
    bar.setAttribute("aria-hidden", "true");

    if (showValues) {
      const label = document.createElement("span");
      label.className = "bar-value";
      label.textContent = String(value);
      bar.append(label);
    }

    fragment.append(bar);
  });

  elements.bars.replaceChildren(fragment);
  elements.bars.setAttribute(
    "aria-label",
    `${ALGORITHMS[elements.algorithm.value].name} visualization with ${step.values.length} values. ${step.message}`,
  );
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
  updateAlgorithmDetails();

  elements.status.textContent = step.message;
  elements.status.dataset.state = state.completed ? "complete" : state.playing ? "running" : "ready";
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
