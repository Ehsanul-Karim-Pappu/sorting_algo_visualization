function position(index) {
  return Number.isInteger(index) ? index + 1 : "—";
}

function valueOf(step, id) {
  return step.items.find((item) => item.id === id)?.value ?? "—";
}

function entry(name, value, tone = "default") {
  return { name, value: String(value), tone };
}

function rangeLabel(range) {
  return range ? `${range[0] + 1}–${range[1]}` : "whole array";
}

export function deriveLearningState(algorithmId, step) {
  const visual = step.visual ?? {};
  const variables = [
    entry("operation", step.type),
    entry("work", step.stats.comparisons + step.stats.writes, "accent"),
  ];
  const stack = Array.isArray(visual.stack)
    ? visual.stack.map((frame, index) => ({
        label: `depth ${index + 1}`,
        range: `${frame.start + 1}–${frame.end + (frame.inclusive ? 1 : 0)}`,
      }))
    : [];

  if (visual.kind === "merge") {
    variables.push(
      entry("left", position(visual.start)),
      entry("mid", position(visual.middle)),
      entry("right", visual.end),
      entry("L cursor", position(visual.leftCursor)),
      entry("R cursor", position(visual.rightCursor)),
      entry("write", position(visual.writeIndex), "accent"),
    );
  } else if (visual.kind === "quick") {
    variables.push(
      entry("low", position(visual.start)),
      entry("high", position(visual.end)),
      entry("pivot", valueOf(step, visual.pivotId), "candidate"),
      entry("boundary", position(visual.boundary)),
      entry("scan", position(visual.scan), "accent"),
    );
  } else if (visual.kind === "quick-three") {
    variables.push(
      entry("low", position(visual.low)),
      entry("less", position(visual.less)),
      entry("scan", position(visual.scan), "accent"),
      entry("greater", position(visual.greater)),
      entry("pivot", valueOf(step, visual.pivotId), "candidate"),
    );
  } else if (visual.kind === "heap") {
    variables.push(
      entry("heap size", visual.heapSize ?? step.range?.[1] ?? step.items.length),
      entry("root", position(visual.root), "accent"),
      entry("child", position(visual.child)),
    );
  } else if (visual.kind === "shell") {
    variables.push(
      entry("gap", visual.gap ?? "—", "accent"),
      entry("key", position(visual.keyIndex)),
      entry("cursor", position(visual.cursor)),
    );
  } else if (visual.kind === "counting") {
    variables.push(
      entry("minimum", visual.minimum ?? "—"),
      entry("maximum", visual.maximum ?? "—"),
      entry("value", visual.activeValue ?? "—", "accent"),
      entry("output", position(visual.target)),
    );
  } else if (visual.kind === "radix") {
    variables.push(
      entry("place", visual.place ?? "—", "accent"),
      entry("digit", visual.digit ?? "—"),
      entry("value", visual.activeValue ?? "—"),
    );
  } else if (visual.kind === "timsort") {
    variables.push(
      entry("min run", visual.minimumRun),
      entry("run stack", visual.runs?.length ?? 0, "accent"),
      entry("L cursor", position(visual.leftCursor)),
      entry("R cursor", position(visual.rightCursor)),
    );
  } else if (visual.kind === "introsort") {
    variables.push(
      entry("low", position(visual.start)),
      entry("high", visual.end ?? "—"),
      entry("depth left", visual.depthRemaining ?? "—", "accent"),
      entry("limit", visual.depthLimit ?? "—"),
      entry("boundary", position(visual.boundary)),
      entry("scan", position(visual.scan)),
    );
  } else if (visual.kind === "bucket") {
    variables.push(
      entry("buckets", visual.buckets?.length ?? 0),
      entry("active", position(visual.activeBucket), "accent"),
      entry("minimum", visual.minimum),
      entry("maximum", visual.maximum),
    );
  } else if (visual.kind === "bitonic") {
    variables.push(
      entry("direction", visual.ascending ? "rising" : "falling", "accent"),
      entry("start", position(visual.start)),
      entry("length", visual.length),
      entry("distance", visual.distance ?? "—"),
      entry("depth", visual.depth ?? 0),
    );
  } else {
    step.active.slice(0, 2).forEach((index, order) => {
      variables.push(entry(order === 0 ? "left / i" : "right / j", position(index), order === 0 ? "accent" : "default"));
    });
  }

  if (stack.length === 0 && step.range) {
    stack.push({ label: "active frame", range: rangeLabel(step.range) });
  }

  return { variables: variables.slice(0, 8), stack };
}
