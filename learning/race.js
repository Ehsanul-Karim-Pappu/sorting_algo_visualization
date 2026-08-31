export function operationCost(step) {
  if (!step?.stats) return 0;
  return Math.max(0, Number(step.stats.comparisons) + Number(step.stats.writes));
}

export function traceWork(trace) {
  return operationCost(trace?.steps?.at(-1));
}

export function stepIndexForWork(trace, requestedWork) {
  const steps = trace?.steps ?? [];
  if (steps.length === 0) return 0;
  const total = traceWork(trace);
  const work = Math.max(0, Math.min(total, Number(requestedWork) || 0));
  if (work <= 0) return 0;
  if (work >= total) return steps.length - 1;

  let low = 0;
  let high = steps.length - 1;
  while (low <= high) {
    const middle = low + Math.floor((high - low) / 2);
    if (operationCost(steps[middle]) <= work) low = middle + 1;
    else high = middle - 1;
  }
  return Math.max(0, high);
}

export function stepForWork(trace, work) {
  return trace.steps[stepIndexForWork(trace, work)];
}

export function raceMaximum(primaryTrace, comparisonTrace) {
  return Math.max(traceWork(primaryTrace), traceWork(comparisonTrace));
}

export function raceStanding(primaryTrace, comparisonTrace, work) {
  const primaryTotal = traceWork(primaryTrace);
  const comparisonTotal = traceWork(comparisonTrace);
  return {
    clock: Math.max(0, Number(work) || 0),
    primaryTotal,
    comparisonTotal,
    primaryDone: work >= primaryTotal,
    comparisonDone: work >= comparisonTotal,
    winner: primaryTotal === comparisonTotal ? "tie" : primaryTotal < comparisonTotal ? "primary" : "comparison",
  };
}
