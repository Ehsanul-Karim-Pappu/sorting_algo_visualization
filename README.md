# SortScope Learning Lab

SortScope is a teaching-first sorting laboratory. It keeps moving values, real code, live variables, algorithm-specific structures, plain-language narration, metrics, and a reversible timeline on one trace so every decision can be inspected and tested.

**Live demo:** [ehsanul-karim-pappu.github.io/sorting_algo_visualization](https://ehsanul-karim-pappu.github.io/sorting_algo_visualization/)

## Native Android edition

SortScope also includes a fully native Kotlin and Jetpack Compose Android application in [`android-native/`](android-native/). It is not a WebView wrapper: all fifteen algorithms, traces, playback controls, lessons, comparison metrics, prediction checkpoints, stability identities, and complexity experiments run locally. The APK declares no `INTERNET` permission and continues working completely offline.

GitHub Actions builds an installable debug APK for every Android pull request and uploads it as the `SortScope-native-android` artifact. Native build and architecture details are in the [Android README](android-native/README.md).

## What makes it useful

- Fifteen algorithms spanning foundational, divide-and-conquer, hybrid, distribution, and parallel-network families
- Values retain their identity and physically move between positions
- Synchronized pseudocode highlighting and decision narration
- A comparison tray that shows the exact condition and result
- Play, pause, forward, backward, restart, replay, and timeline scrubbing
- Algorithm-native views for merge buffers, pivot partitions, heap trees, Shell gaps, count tables, and radix buckets
- Synchronized side-by-side comparison on the same input
- A fair race clock based on comparisons plus writes, with normalized progress available separately
- Predict-the-next-decision checkpoints with immediate explanations and a score
- A live variable and recursive call-scope inspector
- Pseudocode, JavaScript, Python, and C++ views synchronized to the current operation
- A Stability Lab that gives duplicate values persistent `A/B/C` identities
- A Complexity Lab that measures growth and plots it against a normalized Big-O guide
- Three-step guided lessons with progress stored locally in the browser
- Random, nearly sorted, reversed, duplicate-heavy, and custom datasets
- Deterministic seeds and shareable URL state
- Full, decision-only, and milestone trace densities
- Mobile Focus Mode with a sticky playback dock
- Adjustable array size and playback tempo
- Separate comparison, swap, and write counts
- Algorithm invariants, complexity, stability, and memory properties
- Responsive keyboard-accessible interface with reduced-motion support
- Pattern-and-color state markers, semantic labels, and reduced-motion support
- SVG snapshot, full trace JSON, and WebM lesson-video export
- Installable offline PWA with no framework, bundler, application server, or account

## Algorithms

| Algorithm | Best | Average | Worst | Extra space | Stable |
|---|---:|---:|---:|---:|---:|
| Bubble Sort | `O(n)` | `O(n²)` | `O(n²)` | `O(1)` | Yes |
| Selection Sort | `O(n²)` | `O(n²)` | `O(n²)` | `O(1)` | No |
| Insertion Sort | `O(n)` | `O(n²)` | `O(n²)` | `O(1)` | Yes |
| Merge Sort | `O(n log n)` | `O(n log n)` | `O(n log n)` | `O(n)` | Yes |
| Quick Sort | `O(n log n)` | `O(n log n)` | `O(n²)` | `O(log n)` | No |
| Heap Sort | `O(n log n)` | `O(n log n)` | `O(n log n)` | `O(1)` | No |
| Shell Sort | `O(n log n)` | `≈ O(n^1.5)` | `O(n²)` | `O(1)` | No |
| Counting Sort | `O(n + k)` | `O(n + k)` | `O(n + k)` | `O(n + k)` | Yes |
| Radix Sort | `O(d(n + 10))` | `O(d(n + 10))` | `O(d(n + 10))` | `O(n + 10)` | Yes |
| Cocktail Shaker Sort | `O(n)` | `O(n²)` | `O(n²)` | `O(1)` | Yes |
| Three-Way Quick Sort | `O(n)`* | `O(n log n)` | `O(n²)` | `O(log n)` | No |
| IntroSort | `O(n log n)` | `O(n log n)` | `O(n log n)` | `O(log n)` | No |
| TimSort | `O(n)` | `O(n log n)` | `O(n log n)` | `O(n)` | Yes |
| Bucket Sort | `O(n + k)` | `O(n + k)` | `O(n²)` | `O(n + k)` | Yes |
| Bitonic Sort Network | `O(n log² n)` | `O(n log² n)` | `O(n log² n)` | `O(log n)` | No |

\* Three-way Quick Sort reaches linear behavior when duplicate-heavy input collapses into one equal region. The TimSort teaching trace models natural runs, minimum-run extension, and merge-stack balancing; it intentionally omits production galloping optimizations.

## Learning Lab modes

### Fair algorithm race

Race mode advances both algorithms on a common primitive-work clock. One tick represents one comparison or one array write; a swap therefore contributes two writes. An algorithm that finishes first freezes on its sorted result while the other continues. Normalized progress remains available when the goal is to compare structural phases rather than work.

### Predict and inspect

Prediction mode pauses before a Boolean comparison and asks the learner to decide whether the condition will be true. The live inspector simultaneously exposes variables such as cursors, pivots, boundaries, gaps, heap size, digit place, run stack, recursion budget, and active call scope.

### Complexity and stability labs

Complexity Lab runs deterministic experiments at sizes 4, 8, 12, 16, 24, and 32, then plots measured comparisons, writes, swaps, or combined work against the algorithm family's expected growth shape. Stability Lab tags duplicates by identity so equal-value reordering is visible instead of merely described.

## How the trace works

Each run is computed into a series of independent snapshots before playback begins. A snapshot contains:

- the ordered items and their stable identities;
- the operation type and active pseudocode line;
- active, candidate, key, sorted, and focused-range markers;
- the current comparison and its Boolean result;
- narration and cumulative metrics.
- algorithm-specific structural state, such as active buckets, heap size, gap, or merge cursors.

Because playback reads snapshots instead of mutating a live generator, the timeline can move backward, forward, or jump to any point without replaying hidden state. The renderer keys bars by item identity and uses FLIP animation, so the same value visibly travels between positions.

## Run locally

The project uses native JavaScript modules and includes a small local preview server:

```bash
git clone https://github.com/Ehsanul-Karim-Pappu/sorting_algo_visualization.git
cd sorting_algo_visualization
npm install
npm run dev
```

Then open [http://localhost:4173](http://localhost:4173).

## Test

```bash
npm run check
npm test
npx playwright install chromium firefox webkit
npm run test:visual
```

The suite covers all fifteen implementations, arbitrary-length bitonic networks, stable identity, reversible snapshots, fair race mapping, deterministic complexity experiments, synchronized code, exports, offline metadata, DOM contracts, accessibility budgets, and responsive layouts at 320, 390, 768, and 1440 pixels. GitHub Actions runs the rendered interaction suite in Chromium, Firefox, and WebKit and uploads screenshots.

## Keyboard shortcuts

| Key | Action |
|---|---|
| `Space` | Play or pause |
| `←` | Previous trace step |
| `→` | Next trace step |
| `R` | Restart the current trace |
| `N` | Generate new data |
| `F` | Enter or exit Focus Mode |
| `Esc` | Exit Focus Mode |

## Project structure

```text
.
├── index.html              # Semantic teaching interface
├── styles.css              # Responsive visual system and motion
├── app.js                  # Timeline, playback, and keyed DOM renderer
├── algorithms.js           # Small public facade and dataset presets
├── algorithms/             # Catalog, shared recorder, detail filters, and one module per algorithm
├── learning/               # Race clock, variables, code, lessons, experiments, and exports
├── manifest.webmanifest    # Installable application metadata
├── service-worker.js       # Versioned offline application shell
├── icons/                  # PWA identity assets
├── playwright.config.js    # Cross-browser responsive configuration
├── package.json            # Unit, syntax, and browser-test commands
├── .github/workflows/      # Pull-request CI
└── tests/
    ├── algorithms.test.js  # Correctness, trace, stability, and metrics
    ├── learning.test.js    # Race, complexity, code, lessons, and exports
    ├── ui.test.js          # Static controller, PWA, and accessibility contracts
    └── visual/             # Responsive screenshots and interaction checks
```

## Design direction

The interface combines a lab notebook with an instrument panel: warm, readable controls surround a dark execution stage. Color and pattern are both semantic—cyan stripes compare, coral diagonals move, amber checks mark candidates, and green bands mark final values—while the selected algorithm supplies the accent used by its code trace and controls.
