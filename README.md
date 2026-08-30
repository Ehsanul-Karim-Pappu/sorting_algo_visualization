# SortScope

SortScope is a teaching-first sorting algorithm visualizer. It keeps the moving values, current pseudocode line, comparison equation, plain-language narration, metrics, and timeline on the same trace so every algorithmic decision can be inspected.

**Live demo:** [ehsanul-karim-pappu.github.io/sorting_algo_visualization](https://ehsanul-karim-pappu.github.io/sorting_algo_visualization/)

## What makes it useful

- Ten algorithms spanning foundational, divide-and-conquer, heap/gap, and distribution families
- Values retain their identity and physically move between positions
- Synchronized pseudocode highlighting and decision narration
- A comparison tray that shows the exact condition and result
- Play, pause, forward, backward, restart, replay, and timeline scrubbing
- Algorithm-native views for merge buffers, pivot partitions, heap trees, Shell gaps, count tables, and radix buckets
- Synchronized side-by-side comparison on the same input
- Random, nearly sorted, reversed, duplicate-heavy, and custom datasets
- Deterministic seeds and shareable URL state
- Full, decision-only, and milestone trace densities
- Mobile Focus Mode with a sticky playback dock
- Adjustable array size and playback tempo
- Separate comparison, swap, and write counts
- Algorithm invariants, complexity, stability, and memory properties
- Responsive keyboard-accessible interface with reduced-motion support
- Pattern-and-color state markers, semantic labels, and reduced-motion support
- No framework, runtime dependency, bundler, or build step

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
npx playwright install chromium
npm run test:visual
```

The test suite covers sorting correctness, input immutability, stable ordering, trace coherence, native structural state, trace-density filtering, exact representative metrics, dataset generation, DOM/controller contracts, accessibility hooks, responsive layout invariants, and automated screenshots at 320, 390, 768, and 1440 pixels. CI uploads the rendered screenshots as an artifact.

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
├── playwright.config.js    # Responsive browser-test configuration
├── package.json            # Unit, syntax, and browser-test commands
├── .github/workflows/      # Pull-request CI
└── tests/
    ├── algorithms.test.js  # Correctness, trace, stability, and metrics
    ├── ui.test.js          # Static controller and accessibility contracts
    └── visual/             # Responsive screenshots and interaction checks
```

## Design direction

The interface combines a lab notebook with an instrument panel: warm, readable controls surround a dark execution stage. Color and pattern are both semantic—cyan stripes compare, coral diagonals move, amber checks mark candidates, and green bands mark final values—while the selected algorithm supplies the accent used by its code trace and controls.
