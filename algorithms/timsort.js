import { comparison, range } from "./shared.js";

function minimumRunLength(length) {
  let remainder = 0;
  while (length >= 32) {
    remainder |= length & 1;
    length >>= 1;
  }
  return Math.max(2, length + remainder);
}

export function timsortTrace(items, stats, record) {
  if (items.length < 2) return;

  const runs = [];
  const minimumRun = minimumRunLength(items.length);
  const visual = (phase, extra = {}) => ({
    kind: "timsort",
    phase,
    minimumRun,
    runs: runs.map((run) => ({ ...run })),
    ...extra,
  });

  function reverseRange(start, end) {
    let left = start;
    let right = end - 1;
    while (left < right) {
      [items[left], items[right]] = [items[right], items[left]];
      stats.swaps += 1;
      stats.writes += 2;
      left += 1;
      right -= 1;
    }
  }

  function findNaturalRun(start) {
    if (start + 1 >= items.length) return { end: items.length, descending: false };
    stats.comparisons += 1;
    const descending = items[start + 1].value < items[start].value;
    let end = start + 2;

    while (end < items.length) {
      stats.comparisons += 1;
      const continues = descending
        ? items[end].value < items[end - 1].value
        : items[end].value >= items[end - 1].value;
      if (!continues) break;
      end += 1;
    }

    record({
      type: "run",
      title: `Found a ${descending ? "descending" : "ascending"} run`,
      message: `Positions ${start + 1}–${end} already move in one direction.`,
      detail: "TimSort reuses order that already exists in real-world data.",
      line: "runs",
      active: range(start, end),
      range: [start, end],
      visual: visual("discover", { activeRun: { start, length: end - start }, descending }),
    });

    if (descending) {
      reverseRange(start, end);
      record({
        type: "swap",
        title: "Reverse the descending run",
        message: `Positions ${start + 1}–${end} now rise in stable order.`,
        detail: "Strictly descending detection avoids reversing equal values.",
        line: "reverse",
        active: range(start, end),
        range: [start, end],
        visual: visual("reverse", { activeRun: { start, length: end - start } }),
      });
    }

    return { end, descending };
  }

  function binaryInsertion(start, end, sortedEnd) {
    for (let current = sortedEnd; current < end; current += 1) {
      const key = items[current];
      let low = start;
      let high = current;
      while (low < high) {
        const middle = low + Math.floor((high - low) / 2);
        stats.comparisons += 1;
        const goesLeft = key.value < items[middle].value;
        record({
          type: "compare",
          title: goesLeft ? "Search the left half of the run" : "Search the right half of the run",
          message: `Compare key ${key.value} with ${items[middle].value}.`,
          detail: "Binary search locates the stable insertion opening.",
          line: "extend",
          active: [current, middle],
          range: [start, end],
          inspection: comparison("key", key.value, "<", "middle", items[middle].value, goesLeft),
          visual: visual("extend", { activeRun: { start, length: end - start }, low, high, current }),
        });
        if (goesLeft) high = middle;
        else low = middle + 1;
      }

      if (low !== current) {
        items.splice(current, 1);
        items.splice(low, 0, key);
        stats.writes += current - low + 1;
        record({
          type: "insert",
          title: `Insert ${key.value} into the run`,
          message: `${key.value} moves from position ${current + 1} to ${low + 1}.`,
          detail: "The run remains sorted after every insertion.",
          line: "extend",
          active: [low],
          range: [start, end],
          visual: visual("insert", { activeRun: { start, length: end - start }, current: low }),
        });
      }
    }
  }

  function mergeAt(index) {
    const leftRun = runs[index];
    const rightRun = runs[index + 1];
    const start = leftRun.start;
    const middle = rightRun.start;
    const end = rightRun.start + rightRun.length;
    const left = items.slice(start, middle);
    const right = items.slice(middle, end);
    let leftIndex = 0;
    let rightIndex = 0;

    record({
      type: "merge",
      title: "Merge adjacent TimSort runs",
      message: `Combine run lengths ${leftRun.length} and ${rightRun.length}.`,
      detail: "The run stack keeps merges balanced enough for logarithmic growth.",
      line: "merge",
      range: [start, end],
      partition: [start, middle, end],
      visual: visual("merge", { activeRuns: [index, index + 1], leftCursor: 0, rightCursor: 0 }),
    });

    for (let write = start; write < end; write += 1) {
      let chosen;
      if (leftIndex >= left.length) {
        chosen = right[rightIndex++];
      } else if (rightIndex >= right.length) {
        chosen = left[leftIndex++];
      } else {
        const takeLeft = left[leftIndex].value <= right[rightIndex].value;
        stats.comparisons += 1;
        record({
          type: "compare",
          title: takeLeft ? "Take from the earlier run" : "Take from the later run",
          message: `Compare ${left[leftIndex].value} and ${right[rightIndex].value}.`,
          detail: "Taking the left value on equality preserves stability.",
          line: "merge",
          active: [items.findIndex((item) => item.id === left[leftIndex].id), items.findIndex((item) => item.id === right[rightIndex].id)],
          range: [start, end],
          inspection: comparison("left run", left[leftIndex].value, "≤", "right run", right[rightIndex].value, takeLeft),
          visual: visual("merge", { activeRuns: [index, index + 1], leftCursor: leftIndex, rightCursor: rightIndex }),
        });
        chosen = takeLeft ? left[leftIndex++] : right[rightIndex++];
      }
      items[write] = chosen;
      stats.writes += 1;
    }

    runs.splice(index, 2, { start, length: end - start });
    record({
      type: "merged",
      title: `One run now spans ${end - start} values`,
      message: `Positions ${start + 1}–${end} form a single sorted run.`,
      detail: "The merged run returns to the stack for later balancing.",
      line: "merge",
      active: range(start, end),
      range: [start, end],
      visual: visual("merged", { activeRuns: [index] }),
    });
  }

  function collapseRuns() {
    while (runs.length >= 2) {
      const last = runs.length - 1;
      const a = runs[last - 1];
      const b = runs[last];
      const c = runs[last - 2];
      if (c && c.length <= a.length + b.length) {
        mergeAt(c.length < b.length ? last - 2 : last - 1);
      } else if (a.length <= b.length) {
        mergeAt(last - 1);
      } else {
        break;
      }
    }
  }

  let start = 0;
  while (start < items.length) {
    const { end: naturalEnd } = findNaturalRun(start);
    const end = Math.min(items.length, Math.max(naturalEnd, start + minimumRun));
    binaryInsertion(start, end, naturalEnd);
    runs.push({ start, length: end - start });
    record({
      type: "run",
      title: `Push a run of ${end - start}`,
      message: `The run stack now contains ${runs.length} ${runs.length === 1 ? "run" : "runs"}.`,
      detail: `Minimum run for this input: ${minimumRun}.`,
      line: "push",
      active: range(start, end),
      range: [start, end],
      visual: visual("push", { activeRuns: [runs.length - 1] }),
    });
    collapseRuns();
    start = end;
  }

  while (runs.length > 1) mergeAt(runs.length - 2);
}
