import { comparison, range } from "./shared.js";

export function introsortTrace(items, stats, record) {
  const insertionThreshold = 5;
  const depthLimit = items.length > 1 ? 2 * Math.floor(Math.log2(items.length)) : 0;
  const visual = (phase, start, end, depthRemaining, extra = {}) => ({
    kind: "introsort",
    phase,
    start,
    end,
    depthRemaining,
    depthLimit,
    insertionThreshold,
    ...extra,
  });

  function swap(first, second) {
    if (first === second) return;
    [items[first], items[second]] = [items[second], items[first]];
    stats.swaps += 1;
    stats.writes += 2;
  }

  function insertionSort(start, end, depthRemaining) {
    record({
      type: "fallback",
      title: "Finish this small range with insertion sort",
      message: `Positions ${start + 1}–${end} are below the size threshold.`,
      detail: "Insertion sort has low overhead on short ranges.",
      line: "insertion",
      range: [start, end],
      visual: visual("insertion", start, end, depthRemaining),
    });
    for (let current = start + 1; current < end; current += 1) {
      const key = items[current];
      let cursor = current - 1;
      while (cursor >= start) {
        stats.comparisons += 1;
        const shift = items[cursor].value > key.value;
        record({
          type: "compare",
          title: shift ? "Shift within the small range" : "The key has found its opening",
          message: `Compare ${items[cursor].value} with key ${key.value}.`,
          detail: "This is the final cleanup phase of IntroSort.",
          line: "insertion",
          active: [cursor, current],
          range: [start, end],
          inspection: comparison("left", items[cursor].value, ">", "key", key.value, shift),
          visual: visual("insertion", start, end, depthRemaining, { cursor, current }),
        });
        if (!shift) break;
        cursor -= 1;
      }
      const target = cursor + 1;
      if (target !== current) {
        items.splice(current, 1);
        items.splice(target, 0, key);
        stats.writes += current - target + 1;
        record({
          type: "insert",
          title: `Insert ${key.value} inside the small range`,
          message: `${key.value} moves into position ${target + 1}.`,
          detail: "The short range remains sorted through the current key.",
          line: "insertion",
          active: [target],
          range: [start, end],
          visual: visual("insertion", start, end, depthRemaining, { cursor: target, current: target }),
        });
      }
    }
  }

  function heapSort(start, end, depthRemaining) {
    const length = end - start;
    record({
      type: "fallback",
      title: "Depth limit reached: switch to heap sort",
      message: `Heap-sort positions ${start + 1}–${end} to guarantee O(n log n).`,
      detail: "This fallback prevents Quick Sort's quadratic worst case.",
      line: "fallback",
      range: [start, end],
      visual: visual("heap-fallback", start, end, depthRemaining, { heapSize: length }),
    });

    function sift(root, count) {
      while (root * 2 + 1 < count) {
        let child = root * 2 + 1;
        let largest = root;
        stats.comparisons += 1;
        if (items[start + child].value > items[start + largest].value) largest = child;
        if (child + 1 < count) {
          stats.comparisons += 1;
          if (items[start + child + 1].value > items[start + largest].value) largest = child + 1;
        }
        if (largest === root) break;
        swap(start + root, start + largest);
        record({
          type: "swap",
          title: "Repair the fallback heap",
          message: `Move the larger child above its parent inside the active range.`,
          detail: "The largest remaining value rises toward the range root.",
          line: "fallback",
          active: [start + root, start + largest],
          range: [start, end],
          visual: visual("heap-fallback", start, end, depthRemaining, { heapSize: count, root: largest }),
        });
        root = largest;
      }
    }

    for (let root = Math.floor(length / 2) - 1; root >= 0; root -= 1) sift(root, length);
    for (let count = length - 1; count > 0; count -= 1) {
      swap(start, start + count);
      record({
        type: "extract",
        title: "Extract the fallback heap maximum",
        message: `Lock position ${start + count + 1} inside this range.`,
        detail: "The active heap shrinks by one value.",
        line: "fallback",
        active: [start, start + count],
        range: [start, end],
        visual: visual("heap-fallback", start, end, depthRemaining, { heapSize: count }),
      });
      sift(0, count);
    }
  }

  function sort(start, end, depthRemaining) {
    const length = end - start;
    if (length <= 1) return;
    if (length <= insertionThreshold) {
      insertionSort(start, end, depthRemaining);
      return;
    }
    if (depthRemaining <= 0) {
      heapSort(start, end, depthRemaining);
      return;
    }

    const pivotIndex = end - 1;
    const pivotValue = items[pivotIndex].value;
    let boundary = start;
    record({
      type: "partition",
      title: `Quick-partition with ${depthRemaining} depth levels left`,
      message: `Use pivot ${pivotValue} inside positions ${start + 1}–${end}.`,
      detail: "IntroSort monitors recursion depth while Quick Sort is efficient.",
      line: "partition",
      candidates: [pivotIndex],
      range: [start, end],
      visual: visual("partition", start, end, depthRemaining, { pivotId: items[pivotIndex].id, boundary, scan: start }),
    });

    for (let scan = start; scan < pivotIndex; scan += 1) {
      stats.comparisons += 1;
      const goesLeft = items[scan].value <= pivotValue;
      record({
        type: "compare",
        title: goesLeft ? "Accept this value left of the pivot" : "Keep this value to the right",
        message: `Compare ${items[scan].value} with pivot ${pivotValue}.`,
        detail: `Depth budget after this partition: ${depthRemaining - 1}.`,
        line: "compare",
        active: [scan, pivotIndex],
        candidates: [pivotIndex],
        range: [start, end],
        inspection: comparison("value", items[scan].value, "≤", "pivot", pivotValue, goesLeft),
        visual: visual("compare", start, end, depthRemaining, { pivotId: items[pivotIndex].id, boundary, scan }),
      });
      if (goesLeft) {
        swap(boundary, scan);
        boundary += 1;
      }
    }
    swap(boundary, pivotIndex);
    record({
      type: "pivot",
      title: `Lock pivot ${pivotValue}`,
      message: `The pivot reaches position ${boundary + 1}.`,
      detail: "Continue with the two outer partitions.",
      line: "recurse",
      active: [boundary],
      range: [start, end],
      visual: visual("pivot", start, end, depthRemaining - 1, { pivotId: items[boundary].id, boundary, scan: boundary }),
    });
    sort(start, boundary, depthRemaining - 1);
    sort(boundary + 1, end, depthRemaining - 1);
  }

  record({
    type: "pass",
    title: "Set the IntroSort safeguards",
    message: `Depth limit ${depthLimit}; insertion threshold ${insertionThreshold}.`,
    detail: "Quick Sort leads, heap sort protects, and insertion sort finishes.",
    line: "limit",
    range: [0, items.length],
    visual: visual("start", 0, items.length, depthLimit),
  });
  sort(0, items.length, depthLimit);
  if (items.length > 0) {
    record({
      type: "settled",
      title: "IntroSort has finished every range",
      message: "The hybrid strategy produced ascending order.",
      detail: "Its worst case remains O(n log n).",
      line: "recurse",
      sorted: range(0, items.length),
      active: range(0, items.length),
      range: [0, items.length],
      visual: visual("done", 0, items.length, 0),
    });
  }
}
