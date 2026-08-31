import { comparison, moveItemTo, range } from "./shared.js";

export function bucketTrace(items, stats, record) {
  if (items.length < 2) return;

  const values = items.map((item) => item.value);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const spread = maximum - minimum;
  const bucketCount = Math.max(1, Math.min(10, Math.ceil(Math.sqrt(items.length))));
  const buckets = Array.from({ length: bucketCount }, () => []);
  const snapshot = (phase, activeBucket = null, activeId = null) => ({
    kind: "bucket",
    phase,
    minimum,
    maximum,
    activeBucket,
    activeId,
    buckets: buckets.map((bucket) => bucket.map((item) => ({ ...item }))),
  });

  record({
    type: "bucket",
    title: `Create ${bucketCount} value ranges`,
    message: `Map values from ${minimum} to ${maximum} into evenly spaced buckets.`,
    detail: "Nearby values enter the same small local sorting problem.",
    line: "create",
    range: [0, items.length],
    visual: snapshot("create"),
  });

  for (const item of items) {
    const ratio = spread === 0 ? 0 : (item.value - minimum) / spread;
    const bucketIndex = Math.min(bucketCount - 1, Math.floor(ratio * bucketCount));
    buckets[bucketIndex].push(item);
    stats.writes += 1;
    record({
      type: "bucket",
      title: `Send ${item.value} to bucket ${bucketIndex + 1}`,
      message: `${item.value} belongs to value range ${bucketIndex + 1} of ${bucketCount}.`,
      detail: "Distribution keeps the original order inside each bucket.",
      line: "distribute",
      active: [items.findIndex((candidate) => candidate.id === item.id)],
      range: [0, items.length],
      visual: snapshot("distribute", bucketIndex, item.id),
    });
  }

  for (let bucketIndex = 0; bucketIndex < buckets.length; bucketIndex += 1) {
    const bucket = buckets[bucketIndex];
    record({
      type: "pass",
      title: `Sort bucket ${bucketIndex + 1}`,
      message: `Insertion-sort its ${bucket.length} ${bucket.length === 1 ? "value" : "values"}.`,
      detail: "Small buckets make the local quadratic work inexpensive.",
      line: "sort",
      range: [0, items.length],
      visual: snapshot("sort", bucketIndex),
    });

    for (let current = 1; current < bucket.length; current += 1) {
      const key = bucket[current];
      let cursor = current - 1;
      while (cursor >= 0) {
        stats.comparisons += 1;
        const shift = bucket[cursor].value > key.value;
        record({
          type: "compare",
          title: shift ? `Shift ${bucket[cursor].value} inside the bucket` : `${key.value} has found its opening`,
          message: `Compare ${bucket[cursor].value} with bucket key ${key.value}.`,
          detail: "Equal values are not shifted, preserving stability.",
          line: "sort",
          inspection: comparison("bucket value", bucket[cursor].value, ">", "key", key.value, shift),
          range: [0, items.length],
          visual: snapshot("sort", bucketIndex, key.id),
        });
        if (!shift) break;
        bucket[cursor + 1] = bucket[cursor];
        stats.writes += 1;
        cursor -= 1;
      }
      bucket[cursor + 1] = key;
      stats.writes += 1;
    }
  }

  let output = 0;
  for (let bucketIndex = 0; bucketIndex < buckets.length; bucketIndex += 1) {
    for (const item of buckets[bucketIndex]) {
      moveItemTo(items, item.id, output);
      stats.writes += 1;
      record({
        type: "write",
        title: `Collect ${item.value} from bucket ${bucketIndex + 1}`,
        message: `${item.value} moves into output position ${output + 1}.`,
        detail: "Buckets are collected from the smallest value range to the largest.",
        line: "collect",
        active: [output],
        sorted: range(0, output + 1),
        range: [0, items.length],
        visual: snapshot("collect", bucketIndex, item.id),
      });
      output += 1;
    }
  }
}
