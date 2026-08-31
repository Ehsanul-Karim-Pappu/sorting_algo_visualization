export const CODE_LANGUAGES = Object.freeze({
  pseudocode: "Pseudocode",
  javascript: "JavaScript",
  python: "Python",
  cpp: "C++",
});

const row = (id, javascript, python, cpp, depth = 0) => Object.freeze({
  id,
  depth,
  javascript,
  python,
  cpp,
});

const SAMPLES = Object.freeze({
  bubble: [
    row("pass", "for (let end = a.length - 1; end > 0; end--) {", "for end in range(len(a) - 1, 0, -1):", "for (int end = a.size()-1; end > 0; --end) {"),
    row("reset", "let swapped = false;", "swapped = False", "bool swapped = false;", 1),
    row("scan", "for (let i = 0; i < end; i++) {", "for i in range(end):", "for (int i = 0; i < end; ++i) {", 1),
    row("compare", "if (a[i] > a[i + 1]) {", "if a[i] > a[i + 1]:", "if (a[i] > a[i + 1]) {", 2),
    row("swap", "[a[i], a[i + 1]] = [a[i + 1], a[i]];", "a[i], a[i + 1] = a[i + 1], a[i]", "std::swap(a[i], a[i + 1]);", 3),
    row("settled", "}", "# a[end] is final", "}", 1),
    row("stop", "if (!swapped) break;", "if not swapped: break", "if (!swapped) break;", 1),
  ],
  cocktail: [
    row("forward", "for (let i = left; i < right; i++) {", "for i in range(left, right):", "for (int i = left; i < right; ++i) {"),
    row("compare", "if (a[i] > a[i + 1])", "if a[i] > a[i + 1]:", "if (a[i] > a[i + 1])", 1),
    row("swap", "[a[i], a[i + 1]] = [a[i + 1], a[i]];", "a[i], a[i + 1] = a[i + 1], a[i]", "std::swap(a[i], a[i + 1]);", 2),
    row("right", "right--;", "right -= 1", "--right;"),
    row("backward", "for (let i = right; i > left; i--) {", "for i in range(right, left, -1):", "for (int i = right; i > left; --i) {"),
    row("left", "left++;", "left += 1", "++left;"),
    row("stop", "if (!swapped) break;", "if not swapped: break", "if (!swapped) break;"),
  ],
  selection: [
    row("position", "for (let open = 0; open < a.length - 1; open++) {", "for open in range(len(a) - 1):", "for (int open = 0; open < a.size()-1; ++open) {"),
    row("minimum", "let min = open;", "minimum = open", "int minimum = open;", 1),
    row("scan", "for (let i = open + 1; i < a.length; i++)", "for i in range(open + 1, len(a)):", "for (int i = open+1; i < a.size(); ++i)", 1),
    row("compare", "if (a[i] < a[min])", "if a[i] < a[minimum]:", "if (a[i] < a[minimum])", 2),
    row("update", "min = i;", "minimum = i", "minimum = i;", 3),
    row("swap", "[a[open], a[min]] = [a[min], a[open]];", "a[open], a[minimum] = a[minimum], a[open]", "std::swap(a[open], a[minimum]);", 1),
    row("settled", "}", "# a[open] is final", "}"),
  ],
  insertion: [
    row("key", "for (let i = 1; i < a.length; i++) { const key = a[i];", "for i in range(1, len(a)):\n    key = a[i]", "for (int i = 1; i < a.size(); ++i) { auto key = a[i];"),
    row("scan", "let j = i - 1;", "j = i - 1", "int j = i - 1;", 1),
    row("compare", "while (j >= 0 && a[j] > key) {", "while j >= 0 and a[j] > key:", "while (j >= 0 && a[j] > key) {", 1),
    row("shift", "a[j + 1] = a[j--];", "a[j + 1] = a[j]; j -= 1", "a[j + 1] = a[j--];", 2),
    row("insert", "a[j + 1] = key; }", "a[j + 1] = key", "a[j + 1] = key; }", 1),
  ],
  merge: [
    row("split", "const mid = Math.floor((lo + hi) / 2);", "mid = (lo + hi) // 2", "int mid = (lo + hi) / 2;"),
    row("left", "mergeSort(a, lo, mid);", "merge_sort(a, lo, mid)", "mergeSort(a, lo, mid);", 1),
    row("right", "mergeSort(a, mid, hi);", "merge_sort(a, mid, hi)", "mergeSort(a, mid, hi);", 1),
    row("begin", "const left = a.slice(lo, mid), right = a.slice(mid, hi);", "left, right = a[lo:mid], a[mid:hi]", "auto left = slice(a, lo, mid), right = slice(a, mid, hi);", 1),
    row("compare", "if (left[i] <= right[j])", "if left[i] <= right[j]:", "if (left[i] <= right[j])", 2),
    row("take", "a[k++] = left[i++];", "a[k] = left[i]; i += 1", "a[k++] = left[i++];", 2),
    row("remainder", "while (i < left.length) a[k++] = left[i++];", "a[k:hi] = left[i:] + right[j:]", "while (i < left.size()) a[k++] = left[i++];", 2),
    row("merged", "return a;", "return a", "return;", 1),
  ],
  quick: [
    row("partition", "function partition(a, lo, hi) {", "def partition(a, lo, hi):", "int partition(auto& a, int lo, int hi) {"),
    row("pivot", "const pivot = a[hi];", "pivot = a[hi]", "auto pivot = a[hi];", 1),
    row("scan", "for (let scan = lo; scan < hi; scan++) {", "for scan in range(lo, hi):", "for (int scan = lo; scan < hi; ++scan) {", 1),
    row("compare", "if (a[scan] <= pivot)", "if a[scan] <= pivot:", "if (a[scan] <= pivot)", 2),
    row("swap", "[a[boundary++], a[scan]] = [a[scan], a[boundary]];", "a[boundary], a[scan] = a[scan], a[boundary]; boundary += 1", "std::swap(a[boundary++], a[scan]);", 3),
    row("place", "swap(a, boundary, hi); return boundary;", "a[boundary], a[hi] = a[hi], a[boundary]; return boundary", "std::swap(a[boundary], a[hi]); return boundary;", 1),
    row("left", "quickSort(a, lo, pivotIndex - 1);", "quick_sort(a, lo, pivot_index - 1)", "quickSort(a, lo, pivotIndex - 1);"),
    row("right", "quickSort(a, pivotIndex + 1, hi);", "quick_sort(a, pivot_index + 1, hi)", "quickSort(a, pivotIndex + 1, hi);"),
  ],
  "quick-three": [
    row("pivot", "const pivot = a[lo]; let lt = lo, i = lo + 1, gt = hi;", "pivot = a[lo]; lt, i, gt = lo, lo + 1, hi", "auto pivot = a[lo]; int lt=lo, i=lo+1, gt=hi;"),
    row("compare", "while (i <= gt) {", "while i <= gt:", "while (i <= gt) {"),
    row("less", "if (a[i] < pivot) swap(a, lt++, i++);", "if a[i] < pivot: swap(a, lt, i); lt += 1; i += 1", "if (a[i] < pivot) std::swap(a[lt++], a[i++]);", 1),
    row("greater", "else if (a[i] > pivot) swap(a, i, gt--);", "elif a[i] > pivot: swap(a, i, gt); gt -= 1", "else if (a[i] > pivot) std::swap(a[i], a[gt--]);", 1),
    row("equal", "else i++;", "else: i += 1", "else ++i;", 1),
    row("recurse", "sort3(a, lo, lt - 1); sort3(a, gt + 1, hi);", "sort3(a, lo, lt - 1); sort3(a, gt + 1, hi)", "sort3(a, lo, lt-1); sort3(a, gt+1, hi);"),
  ],
  heap: [
    row("build", "for (let i = n / 2 - 1; i >= 0; i--) sift(a, i, n);", "for i in range(n // 2 - 1, -1, -1): sift(a, i, n)", "for (int i=n/2-1; i>=0; --i) sift(a, i, n);"),
    row("sift", "while (2 * root + 1 < size) {", "while 2 * root + 1 < size:", "while (2 * root + 1 < size) {", 1),
    row("compare", "const child = largerChild(a, root, size);", "child = larger_child(a, root, size)", "int child = largerChild(a, root, size);", 2),
    row("swap", "if (a[child] > a[root]) swap(a, child, root);", "if a[child] > a[root]: swap(a, child, root)", "if (a[child] > a[root]) std::swap(a[child], a[root]);", 2),
    row("extract", "swap(a, 0, end);", "a[0], a[end] = a[end], a[0]", "std::swap(a[0], a[end]);"),
    row("lock", "sift(a, 0, end);", "sift(a, 0, end)", "sift(a, 0, end);", 1),
  ],
  shell: [
    row("gap", "for (let gap = a.length >> 1; gap > 0; gap >>= 1) {", "gap = len(a) // 2\nwhile gap > 0:", "for (int gap=a.size()/2; gap>0; gap/=2) {"),
    row("key", "for (let i = gap; i < a.length; i++) { const key = a[i];", "for i in range(gap, len(a)):\n    key = a[i]", "for (int i=gap; i<a.size(); ++i) { auto key=a[i];", 1),
    row("compare", "while (j >= gap && a[j - gap] > key) {", "while j >= gap and a[j-gap] > key:", "while (j >= gap && a[j-gap] > key) {", 1),
    row("shift", "a[j] = a[j - gap]; j -= gap;", "a[j] = a[j-gap]; j -= gap", "a[j] = a[j-gap]; j -= gap;", 2),
    row("insert", "a[j] = key; }", "a[j] = key", "a[j] = key; }", 1),
    row("next", "}", "gap //= 2", "}"),
  ],
  counting: [
    row("init", "const count = Array(max - min + 1).fill(0);", "count = [0] * (maximum - minimum + 1)", "vector<int> count(maximum-minimum+1);"),
    row("count", "for (const value of a) count[value - min]++;", "for value in a: count[value - minimum] += 1", "for (auto value : a) ++count[value-minimum];"),
    row("prefix", "for (let i = 1; i < count.length; i++) count[i] += count[i - 1];", "for i in range(1, len(count)): count[i] += count[i-1]", "for (int i=1; i<count.size(); ++i) count[i] += count[i-1];"),
    row("output", "for (let i = a.length - 1; i >= 0; i--) out[--count[a[i]-min]] = a[i];", "for value in reversed(a): count[value-minimum] -= 1; out[count[value-minimum]] = value", "for (int i=a.size()-1; i>=0; --i) out[--count[a[i]-minimum]]=a[i];"),
    row("copy", "return out;", "return output", "return output;"),
  ],
  radix: [
    row("normalize", "const offset = Math.min(...a);", "offset = min(a)", "auto offset = *min_element(a.begin(), a.end());"),
    row("digit", "for (let place = 1; maxKey / place >= 1; place *= 10) {", "place = 1\nwhile max_key // place > 0:", "for (int place=1; maxKey/place>0; place*=10) {"),
    row("bucket", "buckets[digit(value, place)].push(value);", "buckets[digit(value, place)].append(value)", "buckets[digit(value, place)].push_back(value);", 1),
    row("collect", "a = buckets.flat();", "a = [v for bucket in buckets for v in bucket]", "a = flatten(buckets);", 1),
    row("repeat", "}", "place *= 10", "}"),
  ],
  bucket: [
    row("create", "const buckets = Array.from({length: k}, () => []);", "buckets = [[] for _ in range(k)]", "vector<vector<double>> buckets(k);"),
    row("distribute", "for (const value of a) buckets[indexOf(value)].push(value);", "for value in a: buckets[index_of(value)].append(value)", "for (auto value : a) buckets[indexOf(value)].push_back(value);"),
    row("sort", "for (const bucket of buckets) insertionSort(bucket);", "for bucket in buckets: insertion_sort(bucket)", "for (auto& bucket : buckets) insertionSort(bucket);"),
    row("collect", "return buckets.flat();", "return [v for bucket in buckets for v in bucket]", "return flatten(buckets);"),
  ],
  timsort: [
    row("runs", "const run = discoverRun(a, start);", "run = discover_run(a, start)", "auto run = discoverRun(a, start);"),
    row("reverse", "if (run.descending) reverse(a, run);", "if run.descending: reverse(a, run)", "if (run.descending) reverse(a, run);", 1),
    row("extend", "binaryInsertion(a, run.start, minRunEnd);", "binary_insertion(a, run.start, min_run_end)", "binaryInsertion(a, run.start, minRunEnd);"),
    row("push", "stack.push(run);", "stack.append(run)", "stack.push_back(run);"),
    row("merge", "while (violatesInvariant(stack)) mergeRuns(a, stack);", "while violates_invariant(stack): merge_runs(a, stack)", "while (violatesInvariant(stack)) mergeRuns(a, stack);"),
  ],
  introsort: [
    row("limit", "const limit = 2 * Math.floor(Math.log2(a.length));", "limit = 2 * floor(log2(len(a)))", "int limit = 2 * floor(log2(a.size()));"),
    row("partition", "const pivot = partition(a, lo, hi);", "pivot = partition(a, lo, hi)", "int pivot = partition(a, lo, hi);"),
    row("compare", "if (a[scan] <= pivotValue) swap(a, boundary++, scan);", "if a[scan] <= pivot_value: swap(a, boundary, scan); boundary += 1", "if (a[scan] <= pivotValue) std::swap(a[boundary++], a[scan]);", 1),
    row("fallback", "if (depth === 0) return heapSortRange(a, lo, hi);", "if depth == 0: return heap_sort_range(a, lo, hi)", "if (depth == 0) return heapSortRange(a, lo, hi);"),
    row("insertion", "if (hi - lo <= threshold) return insertionRange(a, lo, hi);", "if hi - lo <= threshold: return insertion_range(a, lo, hi)", "if (hi-lo <= threshold) return insertionRange(a, lo, hi);"),
    row("recurse", "intro(a, lo, pivot, depth - 1); intro(a, pivot + 1, hi, depth - 1);", "intro(a, lo, pivot, depth-1); intro(a, pivot+1, hi, depth-1)", "intro(a, lo, pivot, depth-1); intro(a, pivot+1, hi, depth-1);"),
  ],
  bitonic: [
    row("build", "bitonicSort(a, lo, left, !ascending); bitonicSort(a, lo + left, right, ascending);", "bitonic_sort(a, lo, left, not ascending); bitonic_sort(a, lo+left, right, ascending)", "bitonicSort(a, lo, left, !ascending); bitonicSort(a, lo+left, right, ascending);"),
    row("merge", "const distance = greatestPowerOfTwoBelow(length);", "distance = greatest_power_of_two_below(length)", "int distance = greatestPowerOfTwoBelow(length);"),
    row("compare", "if ((a[i] > a[i + distance]) === ascending)", "if (a[i] > a[i+distance]) == ascending:", "if ((a[i] > a[i+distance]) == ascending)", 1),
    row("swap", "swap(a, i, i + distance);", "a[i], a[i+distance] = a[i+distance], a[i]", "std::swap(a[i], a[i+distance]);", 2),
  ],
});

export function codeFor(algorithmId, language, pseudocode) {
  if (language === "pseudocode" || !SAMPLES[algorithmId]) {
    return pseudocode.map((line) => ({ ...line, text: line.code }));
  }
  return SAMPLES[algorithmId].map((line) => ({
    id: line.id,
    depth: line.depth,
    text: line[language],
  }));
}
