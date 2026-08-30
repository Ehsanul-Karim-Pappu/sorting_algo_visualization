import { comparison, integerBounds, moveItemTo, range } from "./shared.js";

export function heapTrace(items, stats, record) {
  const settled = new Set();
  const heapVisual = (phase, heapSize, focus = {}) => ({
    kind: "heap",
    phase,
    heapSize,
    ...focus,
  });

  function siftDown(root, end) {
    let parent = root;

    while (true) {
      const left = parent * 2 + 1;
      const right = left + 1;
      let largest = parent;

      record({
        type: "heap",
        title: `Sift ${items[parent].value} from position ${parent + 1}`,
        message: `Inspect this parent and its children inside the ${end}-value heap.`,
        detail: "A max heap requires every parent to be at least as large as either child.",
        line: "sift",
        active: [parent],
        candidates: [largest],
        sorted: settled,
        range: [0, end],
        visual: heapVisual("sift", end, { parent, left, right, candidate: largest }),
      });

      if (left < end) {
        const child = items[left];
        const currentLargest = items[largest];
        const childIsLarger = child.value > currentLargest.value;
        stats.comparisons += 1;

        record({
          type: "compare",
          title: childIsLarger ? "Left child becomes largest" : "Parent remains larger",
          message: `Compare ${child.value} with current largest ${currentLargest.value}.`,
          detail: childIsLarger
            ? "The possible swap target moves to the left child."
            : "No candidate change is needed after this comparison.",
          line: "compare",
          active: [left, largest],
          candidates: [largest],
          sorted: settled,
          range: [0, end],
          inspection: comparison("child", child.value, ">", "largest", currentLargest.value, childIsLarger),
          visual: heapVisual("compare", end, { parent, child: left, candidate: largest }),
        });

        if (childIsLarger) {
          largest = left;
        }
      }

      if (right < end) {
        const child = items[right];
        const currentLargest = items[largest];
        const childIsLarger = child.value > currentLargest.value;
        stats.comparisons += 1;

        record({
          type: "compare",
          title: childIsLarger ? "Right child becomes largest" : "Keep the larger candidate",
          message: `Compare ${child.value} with current largest ${currentLargest.value}.`,
          detail: childIsLarger
            ? "The possible swap target moves to the right child."
            : `${currentLargest.value} is still the largest member of this family.`,
          line: "compare",
          active: [right, largest],
          candidates: [largest],
          sorted: settled,
          range: [0, end],
          inspection: comparison("child", child.value, ">", "largest", currentLargest.value, childIsLarger),
          visual: heapVisual("compare", end, { parent, child: right, candidate: largest }),
        });

        if (childIsLarger) {
          largest = right;
        }
      }

      if (largest === parent) {
        record({
          type: "heap",
          title: "Heap order holds here",
          message: `${items[parent].value} is no smaller than either available child.`,
          detail: "This sift-down path is complete.",
          line: "sift",
          active: [parent],
          sorted: settled,
          range: [0, end],
          visual: heapVisual("valid", end, { parent }),
        });
        return;
      }

      const parentItem = items[parent];
      const childItem = items[largest];
      [items[parent], items[largest]] = [items[largest], items[parent]];
      stats.swaps += 1;
      stats.writes += 2;

      record({
        type: "swap",
        title: `Promote ${childItem.value} above ${parentItem.value}`,
        message: `Swap positions ${parent + 1} and ${largest + 1}.`,
        detail: "Continue sifting the displaced parent from its new, lower position.",
        line: "swap",
        active: [parent, largest],
        sorted: settled,
        range: [0, end],
        visual: heapVisual("swap", end, { parent, child: largest, candidate: largest }),
      });
      parent = largest;
    }
  }

  if (items.length < 2) {
    return;
  }

  record({
    type: "heap",
    title: "Build the max heap",
    message: "Sift each internal node from right to left.",
    detail: "Leaves already satisfy heap order because they have no children.",
    line: "build",
    range: [0, items.length],
    visual: heapVisual("build", items.length),
  });

  for (let parent = Math.floor(items.length / 2) - 1; parent >= 0; parent -= 1) {
    siftDown(parent, items.length);
  }

  for (let end = items.length - 1; end > 0; end -= 1) {
    const maximum = items[0];
    const replacement = items[end];
    [items[0], items[end]] = [items[end], items[0]];
    stats.swaps += 1;
    stats.writes += 2;
    settled.add(end);

    record({
      type: "extract",
      title: `Extract maximum ${maximum.value}`,
      message: `${maximum.value} moves to final position ${end + 1}; ${replacement.value} moves to the root.`,
      detail: "The active heap shrinks by one position before it is repaired.",
      line: "extract",
      active: [0, end],
      sorted: settled,
      range: [0, end],
      visual: heapVisual("extract", end, { parent: 0, extracted: end }),
    });

    siftDown(0, end);
    record({
      type: "heap",
      title: "The smaller heap is repaired",
      message: `The first ${end} positions again satisfy max-heap order.`,
      detail: "The sorted suffix remains untouched.",
      line: "lock",
      sorted: settled,
      range: [0, end],
      visual: heapVisual("repaired", end),
    });
  }

  settled.add(0);
  record({
    type: "settled",
    title: `${items[0].value} is the final heap value`,
    message: "Position 1 completes the sorted array.",
    detail: "No heap remains to repair.",
    line: "lock",
    active: [0],
    sorted: settled,
    visual: heapVisual("complete", 0, { extracted: 0 }),
  });
}
