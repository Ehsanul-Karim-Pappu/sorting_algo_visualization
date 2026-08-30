import { comparison, integerBounds, moveItemTo, range } from "./shared.js";

export function cocktailTrace(items, stats, record) {
  const settled = new Set();
  let start = 0;
  let end = items.length - 1;

  while (start < end) {
    let swappedForward = false;

    record({
      type: "pass",
      title: "Sweep from left to right",
      message: `Move the largest unsettled value toward position ${end + 1}.`,
      detail: "This half of the round behaves like a Bubble Sort pass.",
      line: "forward",
      sorted: settled,
      range: [start, end + 1],
    });

    for (let index = start; index < end; index += 1) {
      const left = items[index];
      const right = items[index + 1];
      const shouldSwap = left.value > right.value;
      stats.comparisons += 1;

      record({
        type: "compare",
        title: shouldSwap ? "Push the larger value right" : "This pair can stay",
        message: `Compare ${left.value} on the left with ${right.value} on the right.`,
        detail: shouldSwap
          ? `${left.value} is larger, so exchange the neighbors.`
          : "Their order is already correct for the forward sweep.",
        line: "compare",
        active: [index, index + 1],
        sorted: settled,
        range: [start, end + 1],
        inspection: comparison("left", left.value, ">", "right", right.value, shouldSwap),
      });

      if (shouldSwap) {
        [items[index], items[index + 1]] = [items[index + 1], items[index]];
        stats.swaps += 1;
        stats.writes += 2;
        swappedForward = true;

        record({
          type: "swap",
          title: "Exchange the forward pair",
          message: `${left.value} moves right while ${right.value} moves left.`,
          detail: "The larger value continues traveling toward the right boundary.",
          line: "swap",
          active: [index, index + 1],
          sorted: settled,
          range: [start, end + 1],
        });
      }
    }

    settled.add(end);
    record({
      type: "settled",
      title: `${items[end].value} reaches the right boundary`,
      message: `Position ${end + 1} is now final.`,
      detail: "The next round will stop one position earlier on the right.",
      line: "right",
      active: [end],
      sorted: settled,
      range: [start, end],
    });
    end -= 1;

    if (!swappedForward) {
      range(start, end + 1).forEach((index) => settled.add(index));
      record({
        type: "early-stop",
        title: "The forward sweep made no swaps",
        message: "The remaining region is already sorted.",
        detail: "No backward sweep is necessary.",
        line: "stop",
        sorted: settled,
      });
      break;
    }

    if (start >= end) {
      settled.add(start);
      break;
    }

    let swappedBackward = false;
    record({
      type: "pass",
      title: "Sweep from right to left",
      message: `Move the smallest unsettled value toward position ${start + 1}.`,
      detail: "The direction reverses without restarting from the far boundary.",
      line: "backward",
      sorted: settled,
      range: [start, end + 1],
    });

    for (let index = end; index > start; index -= 1) {
      const left = items[index - 1];
      const right = items[index];
      const shouldSwap = left.value > right.value;
      stats.comparisons += 1;

      record({
        type: "compare",
        title: shouldSwap ? "Pull the smaller value left" : "This pair can stay",
        message: `Compare ${left.value} on the left with ${right.value} on the right.`,
        detail: shouldSwap
          ? `${right.value} is smaller, so exchange the neighbors.`
          : "Their order is already correct for the backward sweep.",
        line: "compare",
        active: [index - 1, index],
        sorted: settled,
        range: [start, end + 1],
        inspection: comparison("left", left.value, ">", "right", right.value, shouldSwap),
      });

      if (shouldSwap) {
        [items[index - 1], items[index]] = [items[index], items[index - 1]];
        stats.swaps += 1;
        stats.writes += 2;
        swappedBackward = true;

        record({
          type: "swap",
          title: "Exchange the backward pair",
          message: `${right.value} moves left while ${left.value} moves right.`,
          detail: "The smaller value continues traveling toward the left boundary.",
          line: "swap",
          active: [index - 1, index],
          sorted: settled,
          range: [start, end + 1],
        });
      }
    }

    settled.add(start);
    record({
      type: "settled",
      title: `${items[start].value} reaches the left boundary`,
      message: `Position ${start + 1} is now final.`,
      detail: "The next round starts one position farther to the right.",
      line: "left",
      active: [start],
      sorted: settled,
      range: [start + 1, end + 1],
    });
    start += 1;

    if (!swappedBackward) {
      range(start, end + 1).forEach((index) => settled.add(index));
      record({
        type: "early-stop",
        title: "The backward sweep made no swaps",
        message: "The remaining region is already sorted.",
        detail: "Both boundaries and the middle region are final.",
        line: "stop",
        sorted: settled,
      });
      break;
    }
  }
}
