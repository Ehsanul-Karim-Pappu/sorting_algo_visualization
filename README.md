# SortScope

SortScope is a teaching-first sorting algorithm visualizer. It keeps the moving values, current pseudocode line, comparison equation, plain-language narration, metrics, and timeline on the same trace so every algorithmic decision can be inspected.

**Live demo:** [ehsanul-karim-pappu.github.io/sorting_algo_visualization](https://ehsanul-karim-pappu.github.io/sorting_algo_visualization/)

## What makes it useful

- Bubble, Selection, Insertion, and Merge Sort
- Values retain their identity and physically move between positions
- Synchronized pseudocode highlighting and decision narration
- A comparison tray that shows the exact condition and result
- Play, pause, forward, backward, restart, replay, and timeline scrubbing
- Random, nearly sorted, reversed, and duplicate-heavy datasets
- Adjustable array size and playback tempo
- Separate comparison, swap, and write counts
- Algorithm invariants, complexity, stability, and memory properties
- Responsive keyboard-accessible interface with reduced-motion support
- No framework, runtime dependency, bundler, or build step

## Algorithms

| Algorithm | Best | Average | Worst | Extra space | Stable |
|---|---:|---:|---:|---:|---:|
| Bubble Sort | `O(n)` | `O(n²)` | `O(n²)` | `O(1)` | Yes |
| Selection Sort | `O(n²)` | `O(n²)` | `O(n²)` | `O(1)` | No |
| Insertion Sort | `O(n)` | `O(n²)` | `O(n²)` | `O(1)` | Yes |
| Merge Sort | `O(n log n)` | `O(n log n)` | `O(n log n)` | `O(n)` | Yes |

## How the trace works

Each run is computed into a series of independent snapshots before playback begins. A snapshot contains:

- the ordered items and their stable identities;
- the operation type and active pseudocode line;
- active, candidate, key, sorted, and focused-range markers;
- the current comparison and its Boolean result;
- narration and cumulative metrics.

Because playback reads snapshots instead of mutating a live generator, the timeline can move backward, forward, or jump to any point without replaying hidden state. The renderer keys bars by item identity and uses FLIP animation, so the same value visibly travels between positions.

## Run locally

The project uses native JavaScript modules, so serve it through a local HTTP server:

```bash
git clone https://github.com/Ehsanul-Karim-Pappu/sorting_algo_visualization.git
cd sorting_algo_visualization
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Test

Node.js 18 or newer is sufficient; no package installation is required.

```bash
npm run check
npm test
```

The test suite covers sorting correctness, input immutability, stable ordering, trace coherence, exact representative metrics, dataset generation, DOM/controller contracts, accessibility hooks, and responsive-motion safeguards.

## Keyboard shortcuts

| Key | Action |
|---|---|
| `Space` | Play or pause |
| `←` | Previous trace step |
| `→` | Next trace step |
| `R` | Restart the current trace |
| `N` | Generate new data |

## Project structure

```text
.
├── index.html              # Semantic teaching interface
├── styles.css              # Responsive visual system and motion
├── app.js                  # Timeline, playback, and keyed DOM renderer
├── algorithms.js           # Pure trace builders and dataset presets
├── package.json            # Syntax and test commands
├── .github/workflows/      # Pull-request CI
└── tests/
    ├── algorithms.test.js  # Correctness, trace, stability, and metrics
    └── ui.test.js          # Static controller and accessibility contracts
```

## Design direction

The interface combines a lab notebook with an instrument panel: warm, readable controls surround a dark execution stage. Color is semantic rather than decorative—cyan compares, coral moves, amber marks candidates, and green marks final values—while the selected algorithm supplies the accent used by its code trace and controls.
