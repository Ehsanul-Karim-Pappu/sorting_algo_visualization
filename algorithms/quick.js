import { comparison, integerBounds, moveItemTo, range } from "./shared.js";

export function quickTrace(items, stats, record) {
  const settled = new Set();
  const quickVisual = (phase, start, end, pivotId, boundary, scan = null) => ({
    kind: "quick",
    phase,
    start,
    end,
    pivotId,
    boundary,
    scan,
  });

  function sortRange(start, end, depth = 0) {
    if (start > end) {
      return;
    }

    if (start === end) {
      settled.add(start);
      record({
        type: "settled",
        title: `${items[start].value} is already isolated`,
        message: `Position ${start + 1} is a one-value partition, so it is final.`,
        detail: "A partition containing one value needs no comparisons.",
        line: "place",
        active: [start],
        sorted: settled,
        range: [start, end + 1],
        visual: quickVisual("isolated", start, end, items[start].id, start, start),
      });
      return;
    }

    const pivotId = items[end].id;
    const pivotValue = items[end].value;
    let boundary = start;

    record({
      type: "partition",
      title: `Partition positions ${start + 1}–${end + 1}`,
      message: `Build left and right partitions around pivot ${pivotValue}.`,
      detail: `Recursive depth ${depth + 1}: the pivot will not move again after this partition.`,
      line: "partition",
      candidates: [end],
      sorted: settled,
      range: [start, end + 1],
      visual: quickVisual("partition", start, end, pivotId, boundary),
    });

    record({
      type: "pivot",
      title: `${pivotValue} becomes the pivot`,
      message: `Scan positions ${start + 1} through ${end} before placing the pivot.`,
      detail: "The boundary marks where the next value no larger than the pivot belongs.",
      line: "pivot",
      active: [end],
      candidates: [end],
      sorted: settled,
      range: [start, end + 1],
      visual: quickVisual("pivot", start, end, pivotId, boundary),
    });

    record({
      type: "partition",
      title: "Open the left partition",
      message: `The left partition begins at position ${start + 1}.`,
      detail: "Every accepted value expands this partition by one position.",
      line: "scan",
      candidates: [end],
      sorted: settled,
      range: [start, end + 1],
      visual: quickVisual("scan", start, end, pivotId, boundary, start),
    });

    for (let scan = start; scan < end; scan += 1) {
      const scanned = items[scan];
      const pivotIndex = items.findIndex((item) => item.id === pivotId);
      const belongsLeft = scanned.value <= pivotValue;
      stats.comparisons += 1;

      record({
        type: "compare",
        title: belongsLeft ? "Send this value left" : "Keep this value on the right",
        message: `Compare scanned value ${scanned.value} with pivot ${pivotValue}.`,
        detail: belongsLeft
          ? `${scanned.value} belongs at the current left-partition boundary.`
          : `${scanned.value} stays beyond the boundary for the right partition.`,
        line: "compare",
        active: [scan, pivotIndex],
        candidates: [pivotIndex],
        sorted: settled,
        range: [start, end + 1],
        inspection: comparison("scanned", scanned.value, "≤", "pivot", pivotValue, belongsLeft),
        visual: quickVisual("compare", start, end, pivotId, boundary, scan),
      });

      if (!belongsLeft) {
        continue;
      }

      if (boundary !== scan) {
        const boundaryItem = items[boundary];
        [items[boundary], items[scan]] = [items[scan], items[boundary]];
        stats.swaps += 1;
        stats.writes += 2;

        record({
          type: "swap",
          title: `Move ${scanned.value} into the left partition`,
          message: `${scanned.value} trades places with ${boundaryItem.value} at the boundary.`,
          detail: "The accepted region is contiguous, even when skipped values must move right.",
          line: "swap",
          active: [boundary, scan],
          candidates: [end],
          sorted: settled,
          range: [start, end + 1],
          visual: quickVisual("move-left", start, end, pivotId, boundary, scan),
        });
      }

      boundary += 1;
    }

    const pivotIndex = items.findIndex((item) => item.id === pivotId);
    if (boundary !== pivotIndex) {
      const boundaryItem = items[boundary];
      [items[boundary], items[pivotIndex]] = [items[pivotIndex], items[boundary]];
      stats.swaps += 1;
      stats.writes += 2;

      record({
        type: "swap",
        title: `Place pivot ${pivotValue}`,
        message: `${pivotValue} trades places with ${boundaryItem.value} at position ${boundary + 1}.`,
        detail: "Every value left of the pivot is no larger; every value right of it is larger.",
        line: "place",
        active: [boundary, pivotIndex],
        sorted: settled,
        range: [start, end + 1],
        visual: quickVisual("place-pivot", start, end, pivotId, boundary, pivotIndex),
      });
    }

    settled.add(boundary);
    record({
      type: "settled",
      title: `Pivot ${pivotValue} is locked`,
      message: `Position ${boundary + 1} is now final.`,
      detail: "Quick Sort now handles the two partitions independently.",
      line: "place",
      active: [boundary],
      sorted: settled,
      range: [start, end + 1],
      visual: quickVisual("locked", start, end, pivotId, boundary, boundary),
    });

    if (start <= boundary - 1) {
      record({
        type: "recurse",
        title: "Sort the left partition",
        message: `Enter positions ${start + 1}–${boundary}.`,
        detail: "The locked pivot remains outside this recursive call.",
        line: "left",
        sorted: settled,
        range: [start, boundary],
      });
      sortRange(start, boundary - 1, depth + 1);
    }

    if (boundary + 1 <= end) {
      record({
        type: "recurse",
        title: "Sort the right partition",
        message: `Enter positions ${boundary + 2}–${end + 1}.`,
        detail: "Only values larger than the pivot appear in this partition.",
        line: "right",
        sorted: settled,
        range: [boundary + 1, end + 1],
      });
      sortRange(boundary + 1, end, depth + 1);
    }
  }

  sortRange(0, items.length - 1);
}
