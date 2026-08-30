import { comparison, integerBounds, moveItemTo, range } from "./shared.js";

export function selectionTrace(items, stats, record) {
  const settled = new Set();

  for (let open = 0; open < items.length - 1; open += 1) {
    let minimum = open;

    record({
      type: "select",
      title: `Fill position ${open + 1}`,
      message: `${items[minimum].value} is the first minimum candidate in the unsorted region.`,
      detail: "The amber marker always shows the smallest value found during this scan.",
      line: "minimum",
      active: [open],
      candidates: [minimum],
      sorted: settled,
      range: [open, items.length],
    });

    for (let scan = open + 1; scan < items.length; scan += 1) {
      const currentMinimum = items[minimum];
      const scanned = items[scan];
      const isSmaller = scanned.value < currentMinimum.value;
      stats.comparisons += 1;

      record({
        type: "compare",
        title: isSmaller ? "A new minimum is found" : "Keep the current minimum",
        message: `Compare scanned value ${scanned.value} with minimum candidate ${currentMinimum.value}.`,
        detail: isSmaller
          ? `${scanned.value} is smaller, so the minimum marker will move here.`
          : `${currentMinimum.value} remains the smallest value seen in this region.`,
        line: "compare",
        active: [scan, minimum],
        candidates: [minimum],
        sorted: settled,
        range: [open, items.length],
        inspection: comparison("scanned", scanned.value, "<", "minimum", currentMinimum.value, isSmaller),
      });

      if (isSmaller) {
        minimum = scan;
        record({
          type: "candidate",
          title: `${items[minimum].value} becomes the minimum candidate`,
          message: `Remember position ${minimum + 1} and continue scanning.`,
          detail: "Nothing moves yet; Selection Sort only remembers this position.",
          line: "update",
          active: [minimum],
          candidates: [minimum],
          sorted: settled,
          range: [open, items.length],
        });
      }
    }

    if (minimum !== open) {
      const openItem = items[open];
      const minimumItem = items[minimum];
      [items[open], items[minimum]] = [items[minimum], items[open]];
      stats.swaps += 1;
      stats.writes += 2;

      record({
        type: "swap",
        title: "Place the minimum",
        message: `${minimumItem.value} moves into position ${open + 1}; ${openItem.value} moves to the vacated position.`,
        detail: "One swap completes the entire scan.",
        line: "swap",
        active: [open, minimum],
        candidates: [open],
        sorted: settled,
        range: [open, items.length],
      });
    }

    settled.add(open);
    record({
      type: "settled",
      title: `Position ${open + 1} is final`,
      message: `${items[open].value} joins the sorted prefix.`,
      detail: "The next scan starts one position farther to the right.",
      line: "settled",
      active: [open],
      sorted: settled,
      range: [open + 1, items.length],
    });
  }
}
