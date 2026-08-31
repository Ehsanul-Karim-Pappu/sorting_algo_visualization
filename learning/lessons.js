const FAMILY_GOALS = Object.freeze({
  foundational: "Track how the sorted region grows after each local decision.",
  partition: "Watch boundaries turn one range into independent subproblems.",
  merge: "Follow temporary storage and see why stable merging needs extra memory.",
  distribution: "Observe how positions emerge without comparing every pair.",
  hybrid: "Identify the moment the algorithm changes strategy and why.",
  network: "Follow fixed comparator lanes that do not depend on input values.",
});

const FAMILIES = Object.freeze({
  bubble: "foundational",
  cocktail: "foundational",
  selection: "foundational",
  insertion: "foundational",
  shell: "foundational",
  quick: "partition",
  "quick-three": "partition",
  merge: "merge",
  heap: "partition",
  counting: "distribution",
  radix: "distribution",
  bucket: "distribution",
  introsort: "hybrid",
  timsort: "hybrid",
  bitonic: "network",
});

export function lessonFor(algorithmId, algorithm) {
  const family = FAMILIES[algorithmId] ?? "foundational";
  return {
    family,
    goal: FAMILY_GOALS[family],
    checkpoints: [
      { id: "observe", label: "Observe the first decision", threshold: 0.05 },
      { id: "explain", label: "Reach and explain the invariant", threshold: 0.5 },
      { id: "complete", label: "Complete the trace", threshold: 1 },
    ],
    takeaway: algorithm.invariant,
  };
}

export function progressFor(cursor, maximum, lesson) {
  const ratio = maximum <= 0 ? 1 : Math.max(0, Math.min(1, cursor / maximum));
  return lesson.checkpoints.map((checkpoint) => ({
    ...checkpoint,
    complete: ratio >= checkpoint.threshold,
  }));
}

export function loadProgress(storage, key = "sortscope-learning-progress-v1") {
  try {
    return JSON.parse(storage.getItem(key) ?? "{}") ?? {};
  } catch {
    return {};
  }
}

export function saveProgress(storage, progress, key = "sortscope-learning-progress-v1") {
  try {
    storage.setItem(key, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}
