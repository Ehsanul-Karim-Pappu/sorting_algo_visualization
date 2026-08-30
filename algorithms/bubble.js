import { comparison, integerBounds, moveItemTo, range } from "./shared.js";

export function bubbleTrace(items, stats, record) {
  const settled = new Set();

  for (let end = items.length - 1; end > 0; end -= 1) {
    let swapped = false;

    record({
      type: "pass",
      title: `Begin pass ${items.length - end}`,
      message: `Scan positions 1 through ${end + 1}. The largest unsettled value will move to the right edge.`,
      detail: "A fresh pass starts with the swapped flag set to false.",
      line: "reset",
      sorted: settled,
      range: [0, end + 1],
    });

    for (let index = 0; index < end; index += 1) {
      const left = items[index];
      const right = items[index + 1];
      const shouldSwap = left.value > right.value;
      stats.comparisons += 1;

      record({
        type: "compare",
        title: shouldSwap ? "These neighbors are out of order" : "These neighbors can stay",
        message: `Compare ${left.value} on the left with ${right.value} on the right.`,
        detail: shouldSwap
          ? `${left.value} is larger, so it must move one position to the right.`
          : `${left.value} is not larger, so this pair is already in ascending order.`,
        line: "compare",
        active: [index, index + 1],
        sorted: settled,
        range: [0, end + 1],
        inspection: comparison("left", left.value, ">", "right", right.value, shouldSwap),
      });

      if (shouldSwap) {
        [items[index], items[index + 1]] = [items[index + 1], items[index]];
        stats.swaps += 1;
        stats.writes += 2;
        swapped = true;

        record({
          type: "swap",
          title: "Exchange the pair",
          message: `${left.value} moves right while ${right.value} moves left.`,
          detail: "The same two values are highlighted after their positions change.",
          line: "swap",
          active: [index, index + 1],
          sorted: settled,
          range: [0, end + 1],
          inspection: comparison("left", left.value, ">", "right", right.value, true),
        });
      }
    }

    settled.add(end);
    record({
      type: "settled",
      title: `${items[end].value} has reached its final position`,
      message: `Position ${end + 1} joins the sorted suffix.`,
      detail: "The next pass can stop one position earlier.",
      line: "settled",
      active: [end],
      sorted: settled,
      range: [0, end],
    });

    if (!swapped) {
      range(0, end).forEach((index) => settled.add(index));
      record({
        type: "early-stop",
        title: "No swaps — the array is sorted",
        message: "A complete pass found no out-of-order neighbors, so Bubble Sort can stop early.",
        detail: "This early exit gives Bubble Sort its O(n) best case.",
        line: "stop",
        sorted: settled,
      });
      break;
    }
  }
}
