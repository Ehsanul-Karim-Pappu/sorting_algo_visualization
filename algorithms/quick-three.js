import { comparison, range } from "./shared.js";

export function quickThreeTrace(items, stats, record) {
  const settledIds = new Set();

  const sortedIndexes = () => items
    .map((item, index) => settledIds.has(item.id) ? index : -1)
    .filter((index) => index >= 0);

  const visual = (phase, low, high, pivotId, less, scan, greater, depth) => ({
    kind: "quick-three",
    phase,
    low,
    high,
    pivotId,
    less,
    scan,
    greater,
    depth,
  });

  function sort(low, high, depth = 0) {
    if (low > high) return;
    if (low === high) {
      settledIds.add(items[low].id);
      record({
        type: "settled",
        title: `${items[low].value} is isolated`,
        message: `Position ${low + 1} contains one value, so it is final.`,
        detail: "A one-value partition needs no further work.",
        line: "recurse",
        active: [low],
        sorted: sortedIndexes(),
        range: [low, high + 1],
        visual: visual("isolated", low, high, items[low].id, low, low, high, depth),
      });
      return;
    }

    const pivotId = items[low].id;
    const pivotValue = items[low].value;
    let less = low;
    let scan = low + 1;
    let greater = high;

    record({
      type: "pivot",
      title: `${pivotValue} becomes the three-way pivot`,
      message: "Build regions smaller than, equal to, and greater than the pivot.",
      detail: `Depth ${depth + 1}: duplicate values join the middle region immediately.`,
      line: "pivot",
      candidates: [low],
      sorted: sortedIndexes(),
      range: [low, high + 1],
      visual: visual("pivot", low, high, pivotId, less, scan, greater, depth),
    });

    while (scan <= greater) {
      const current = items[scan];
      const relation = current.value < pivotValue ? "smaller" : current.value > pivotValue ? "greater" : "equal";
      stats.comparisons += relation === "smaller" ? 1 : 2;

      record({
        type: "compare",
        title: `${current.value} is ${relation} than the pivot`,
        message: `Compare ${current.value} with pivot ${pivotValue}.`,
        detail: relation === "equal"
          ? "Equal values stay together in the middle region."
          : `Move this value into the ${relation} region.`,
        line: "compare",
        active: [scan, less],
        candidates: [items.findIndex((item) => item.id === pivotId)],
        sorted: sortedIndexes(),
        range: [low, high + 1],
        inspection: comparison("value", current.value, "<", "pivot", pivotValue, relation === "smaller"),
        visual: visual("compare", low, high, pivotId, less, scan, greater, depth),
      });

      if (current.value < pivotValue) {
        [items[less], items[scan]] = [items[scan], items[less]];
        stats.swaps += 1;
        stats.writes += 2;
        less += 1;
        scan += 1;
        record({
          type: "swap",
          title: `Move ${current.value} into the smaller region`,
          message: `The left boundary advances to position ${less + 1}.`,
          detail: "Everything before the boundary is now smaller than the pivot.",
          line: "less",
          active: [less - 1, scan - 1],
          sorted: sortedIndexes(),
          range: [low, high + 1],
          visual: visual("less", low, high, pivotId, less, scan, greater, depth),
        });
      } else if (current.value > pivotValue) {
        [items[scan], items[greater]] = [items[greater], items[scan]];
        stats.swaps += 1;
        stats.writes += 2;
        greater -= 1;
        record({
          type: "swap",
          title: `Move ${current.value} into the greater region`,
          message: `The right boundary retreats to position ${greater + 1}.`,
          detail: "The incoming value at the scan cursor still needs classification.",
          line: "greater",
          active: [scan, greater + 1],
          sorted: sortedIndexes(),
          range: [low, high + 1],
          visual: visual("greater", low, high, pivotId, less, scan, greater, depth),
        });
      } else {
        scan += 1;
        record({
          type: "partition",
          title: `${current.value} joins the equal region`,
          message: "No swap is needed for another pivot value.",
          detail: "This is why three-way partitioning handles duplicate-heavy input well.",
          line: "equal",
          active: [scan - 1],
          sorted: sortedIndexes(),
          range: [low, high + 1],
          visual: visual("equal", low, high, pivotId, less, scan, greater, depth),
        });
      }
    }

    for (let index = less; index <= greater; index += 1) {
      settledIds.add(items[index].id);
    }
    record({
      type: "settled",
      title: "The equal region is final",
      message: `Positions ${less + 1}–${greater + 1} contain every ${pivotValue}.`,
      detail: "Only the smaller and greater outer regions remain unsorted.",
      line: "recurse",
      active: range(less, greater + 1),
      sorted: sortedIndexes(),
      range: [low, high + 1],
      visual: visual("locked", low, high, pivotId, less, scan, greater, depth),
    });

    sort(low, less - 1, depth + 1);
    sort(greater + 1, high, depth + 1);
  }

  sort(0, items.length - 1);
}
