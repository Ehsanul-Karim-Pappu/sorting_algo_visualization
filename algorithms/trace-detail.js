export const TRACE_DETAIL_MODES = Object.freeze({
  all: Object.freeze({
    label: "Every operation",
    description: "Show the complete teaching trace.",
  }),
  decisions: Object.freeze({
    label: "Key decisions",
    description: "Keep comparisons, movement, and structural decisions.",
  }),
  milestones: Object.freeze({
    label: "Fast finish",
    description: "Show only major phase changes and final placements.",
  }),
});

const DECISION_TYPES = new Set([
  "idle",
  "compare",
  "swap",
  "shift",
  "insert",
  "write",
  "pivot",
  "partition",
  "extract",
  "bucket",
  "prefix",
  "settled",
  "merged",
  "gap-done",
  "early-stop",
  "done",
]);

const MILESTONE_TYPES = new Set([
  "idle",
  "pass",
  "partition",
  "pivot",
  "extract",
  "settled",
  "merged",
  "gap",
  "gap-done",
  "prefix",
  "digit",
  "early-stop",
  "done",
]);

export function applyTraceDetail(trace, mode = "all") {
  if (!TRACE_DETAIL_MODES[mode]) {
    throw new RangeError(`Unknown trace detail mode: ${mode}`);
  }

  if (mode === "all") {
    return {
      ...trace,
      detailMode: mode,
      originalStepCount: trace.steps.length,
      steps: [...trace.steps],
    };
  }

  const allowed = mode === "decisions" ? DECISION_TYPES : MILESTONE_TYPES;
  const steps = trace.steps.filter((step, index) => {
    return index === 0 || index === trace.steps.length - 1 || allowed.has(step.type);
  });

  return {
    ...trace,
    detailMode: mode,
    originalStepCount: trace.steps.length,
    steps,
  };
}
