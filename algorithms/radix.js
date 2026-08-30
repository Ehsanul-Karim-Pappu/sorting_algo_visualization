import { comparison, integerBounds, moveItemTo, range } from "./shared.js";

export function radixTrace(items, stats, record) {
  const { minimum, maximum } = integerBounds(items, "Radix Sort");
  const radixVisual = (phase, extra = {}) => {
    const { buckets = [], ...details } = extra;
    return {
      kind: "radix",
      phase,
      minimum,
      buckets: Array.from({ length: 10 }, (_, index) =>
        (buckets[index] ?? []).map((item) => ({ id: item.id, value: item.value }))),
      ...details,
    };
  };

  if (items.length < 2) {
    return;
  }

  const maximumKey = maximum - minimum;
  if (!Number.isSafeInteger(maximumKey)) {
    throw new RangeError("Radix Sort requires a safely representable normalized key range.");
  }

  record({
    type: "digit",
    title: "Normalize the radix keys",
    message: `Use each value's distance from ${minimum} as its non-negative key.`,
    detail: "Adding the same offset preserves numerical order, including for negative values.",
    line: "normalize",
    range: [0, items.length],
    visual: radixVisual("normalize"),
  });

  if (maximumKey === 0) {
    record({
      type: "digit",
      title: "Every normalized key is zero",
      message: "All values are equal, so no digit pass can change their order.",
      detail: "The existing order is already sorted and remains stable.",
      line: "digit",
      sorted: range(0, items.length),
      visual: radixVisual("complete"),
    });
    return;
  }

  const digitName = (exponent) => {
    if (exponent === 1) return "ones";
    if (exponent === 10) return "tens";
    if (exponent === 100) return "hundreds";
    if (exponent === 1000) return "thousands";
    return `${exponent}s`;
  };

  for (let exponent = 1; exponent <= maximumKey; exponent *= 10) {
    const place = digitName(exponent);
    const finalPass = exponent > Math.floor(maximumKey / 10);
    const buckets = Array.from({ length: 10 }, () => []);
    const source = [...items];

    record({
      type: "digit",
      title: `Read the ${place} digit`,
      message: `Distribute every normalized key into buckets 0 through 9.`,
      detail: "Appending to each bucket preserves the order established by earlier digits.",
      line: "digit",
      range: [0, items.length],
      visual: radixVisual("digit", { exponent, place, buckets }),
    });

    for (const item of source) {
      const key = item.value - minimum;
      const digit = Math.floor(key / exponent) % 10;
      buckets[digit].push(item);
      stats.writes += 1;
      const currentIndex = items.findIndex((candidate) => candidate.id === item.id);

      record({
        type: "bucket",
        title: `Send ${item.value} to bucket ${digit}`,
        message: `Its normalized ${place} digit is ${digit}.`,
        detail: "Values enter this bucket from left to right, keeping the pass stable.",
        line: "bucket",
        active: [currentIndex],
        range: [0, items.length],
        visual: radixVisual("bucket", {
          exponent,
          place,
          digit,
          activeValue: item.value,
          buckets,
        }),
      });
    }

    const output = buckets.flat();
    output.forEach((item, target) => {
      moveItemTo(items, item.id, target);
      stats.writes += 1;

      record({
        type: "write",
        title: `Collect ${item.value} from its bucket`,
        message: `${item.value} moves into position ${target + 1} for this digit pass.`,
        detail: finalPass
          ? `Positions 1–${target + 1} now match the final sorted order.`
          : "Later digits can still regroup this partially ordered sequence.",
        line: "collect",
        active: [target],
        sorted: finalPass ? range(0, target + 1) : [],
        range: [0, items.length],
        visual: radixVisual("collect", {
          exponent,
          place,
          activeValue: item.value,
          target,
          buckets,
        }),
      });
    });

    record({
      type: "pass",
      title: `${place[0].toUpperCase()}${place.slice(1)} pass complete`,
      message: finalPass ? "Every significant digit has been processed." : "Move to the next decimal digit.",
      detail: "The order from all completed digit passes remains stable.",
      line: "repeat",
      sorted: finalPass ? range(0, items.length) : [],
      range: [0, items.length],
      visual: radixVisual("complete", { exponent, place, buckets }),
    });

    if (finalPass) {
      break;
    }
  }
}
