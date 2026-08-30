import { comparison, integerBounds, moveItemTo, range } from "./shared.js";

export function mergeTrace(items, stats, record) {
  function mergeVisual(start, middle, end, phase, leftItems, rightItems, extra = {}) {
    return {
      kind: "merge",
      phase,
      start,
      middle,
      end,
      left: (leftItems ?? items.slice(start, middle)).map((item) => ({
        id: item.id,
        value: item.value,
      })),
      right: (rightItems ?? items.slice(middle, end)).map((item) => ({
        id: item.id,
        value: item.value,
      })),
      ...extra,
    };
  }

  function sortRange(start, end, depth = 0) {
    if (end - start <= 1) {
      return;
    }

    const middle = start + Math.floor((end - start) / 2);
    record({
      type: "split",
      title: `Split positions ${start + 1}–${end}`,
      message: `Divide this range into ${start + 1}–${middle} and ${middle + 1}–${end}.`,
      detail: `Recursive depth ${depth + 1}: keep dividing until every range contains one value.`,
      line: "split",
      range: [start, end],
      partition: [start, middle, end],
      visual: mergeVisual(start, middle, end, "split"),
    });

    record({
      type: "recurse",
      title: "Sort the left half",
      message: `Enter positions ${start + 1}–${middle}.`,
      detail: "The other half waits while this recursive call finishes.",
      line: "left",
      range: [start, middle],
      partition: [start, middle, end],
      visual: mergeVisual(start, middle, end, "left"),
    });
    sortRange(start, middle, depth + 1);

    record({
      type: "recurse",
      title: "Sort the right half",
      message: `Enter positions ${middle + 1}–${end}.`,
      detail: "Both halves will be sorted before they are merged.",
      line: "right",
      range: [middle, end],
      partition: [start, middle, end],
      visual: mergeVisual(start, middle, end, "right"),
    });
    sortRange(middle, end, depth + 1);

    const left = items.slice(start, middle);
    const right = items.slice(middle, end);
    let leftIndex = 0;
    let rightIndex = 0;
    let writeIndex = start;

    record({
      type: "merge",
      title: "Merge the sorted halves",
      message: `Weave positions ${start + 1}–${middle} and ${middle + 1}–${end} into one sorted range.`,
      detail: "Only the front unplaced value of each half needs to be compared.",
      line: "begin",
      range: [start, end],
      partition: [start, middle, end],
      visual: mergeVisual(start, middle, end, "merge", left, right, {
        leftCursor: leftIndex,
        rightCursor: rightIndex,
        writeIndex,
      }),
    });

    while (leftIndex < left.length && rightIndex < right.length) {
      const leftItem = left[leftIndex];
      const rightItem = right[rightIndex];
      const takeLeft = leftItem.value <= rightItem.value;
      const currentLeft = items.findIndex((item) => item.id === leftItem.id);
      const currentRight = items.findIndex((item) => item.id === rightItem.id);
      stats.comparisons += 1;

      record({
        type: "compare",
        title: takeLeft ? "Take from the left half" : "Take from the right half",
        message: `Compare front values ${leftItem.value} and ${rightItem.value}.`,
        detail: takeLeft
          ? `${leftItem.value} is no larger, so it is written next. Equal values stay stable.`
          : `${rightItem.value} is smaller, so it is written next.`,
        line: "compare",
        active: [currentLeft, currentRight],
        range: [start, end],
        partition: [start, middle, end],
        inspection: comparison("left half", leftItem.value, "≤", "right half", rightItem.value, takeLeft),
        visual: mergeVisual(start, middle, end, "compare", left, right, {
          leftCursor: leftIndex,
          rightCursor: rightIndex,
          writeIndex,
        }),
      });

      const chosen = takeLeft ? leftItem : rightItem;
      moveItemTo(items, chosen.id, writeIndex);
      if (takeLeft) {
        leftIndex += 1;
      } else {
        rightIndex += 1;
      }
      stats.writes += 1;

      record({
        type: "write",
        title: `Write ${chosen.value} next`,
        message: `${chosen.value} moves into position ${writeIndex + 1} of the merged range.`,
        detail: "The merge cursor advances one position to the right.",
        line: "take",
        active: [writeIndex],
        range: [start, end],
        partition: [start, middle, end],
        visual: mergeVisual(start, middle, end, "write", left, right, {
          leftCursor: leftIndex,
          rightCursor: rightIndex,
          writeIndex,
          chosenId: chosen.id,
        }),
      });
      writeIndex += 1;
    }

    const remainder = leftIndex < left.length ? left.slice(leftIndex) : right.slice(rightIndex);
    const sourceName = leftIndex < left.length ? "left" : "right";

    for (const item of remainder) {
      moveItemTo(items, item.id, writeIndex);
      stats.writes += 1;
      if (sourceName === "left") {
        leftIndex += 1;
      } else {
        rightIndex += 1;
      }
      record({
        type: "write",
        title: `Copy remaining value ${item.value}`,
        message: `The ${sourceName} half is the only half with values left, so no comparison is needed.`,
        detail: `${item.value} is written into position ${writeIndex + 1}.`,
        line: "remainder",
        active: [writeIndex],
        range: [start, end],
        partition: [start, middle, end],
        visual: mergeVisual(start, middle, end, "remainder", left, right, {
          leftCursor: leftIndex,
          rightCursor: rightIndex,
          writeIndex,
          chosenId: item.id,
        }),
      });
      writeIndex += 1;
    }

    const mergedValues = items.slice(start, end).map((item) => item.value);
    record({
      type: "merged",
      title: `Positions ${start + 1}–${end} are merged`,
      message:
        mergedValues.length <= 8
          ? `This range is now sorted: ${mergedValues.join(", ")}.`
          : `All ${mergedValues.length} values in positions ${start + 1}–${end} are now sorted.`,
      detail: "The sorted range can now participate in the merge one level above it.",
      line: "merged",
      active: range(start, end),
      range: [start, end],
      partition: [start, middle, end],
      visual: mergeVisual(start, middle, end, "merged", left, right, {
        leftCursor: left.length,
        rightCursor: right.length,
        writeIndex: end,
      }),
    });
  }

  sortRange(0, items.length);
}
