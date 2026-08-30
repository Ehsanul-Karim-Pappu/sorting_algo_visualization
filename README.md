# Sorting Lab

An interactive sorting-algorithm visualizer built with modern, dependency-free JavaScript. It presents every comparison and data movement as a controllable animation, while keeping separate live counts for comparisons, swaps, writes, and total steps.

**Live demo:** [ehsanul-karim-pappu.github.io/sorting_algo_visualization](https://ehsanul-karim-pappu.github.io/sorting_algo_visualization/)

## Highlights

- Bubble, Selection, Insertion, and Merge Sort
- Play, pause, single-step, replay, and reset controls
- Adjustable animation speed and array size
- Random, nearly sorted, reversed, and duplicate-heavy datasets
- Correct, separate comparison/swap/write metrics
- Smooth persistent-bar animation with live operation values and progress
- Responsive layout for desktop, tablet, and mobile
- Keyboard shortcuts and accessible status announcements
- Pure algorithm generators that are independent of rendering
- Automated tests using Node's built-in test runner
- No framework, runtime dependency, bundler, or build step

## Algorithms

| Algorithm | Best | Average | Worst | Extra space | Stable |
|---|---:|---:|---:|---:|---:|
| Bubble Sort | `O(n)` | `O(n²)` | `O(n²)` | `O(1)` | Yes |
| Selection Sort | `O(n²)` | `O(n²)` | `O(n²)` | `O(1)` | No |
| Insertion Sort | `O(n)` | `O(n²)` | `O(n²)` | `O(1)` | Yes |
| Merge Sort | `O(n log n)` | `O(n log n)` | `O(n log n)` | `O(n)` | Yes |

## Run locally

Because the project uses native JavaScript modules, serve it through a small local HTTP server:

```bash
git clone https://github.com/Ehsanul-Karim-Pappu/sorting_algo_visualization.git
cd sorting_algo_visualization
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Test

Node.js 18 or newer is sufficient; no package installation is required.

```bash
npm test
```

## Keyboard shortcuts

| Key | Action |
|---|---|
| `Space` | Play or pause |
| `→` | Advance one operation |
| `R` | Reset the current run |
| `N` | Generate new data |

## Project structure

```text
.
├── index.html              # Semantic application shell
├── styles.css              # Responsive visual design
├── app.js                  # Playback controller and DOM rendering
├── algorithms.js           # Pure generator-based algorithms
├── package.json            # Test command and module configuration
├── .github/workflows/      # Automated test workflow
└── tests/
    └── algorithms.test.js  # Correctness and metric tests
```

## Design notes

Each algorithm is implemented as a JavaScript generator. A generator yields an immutable snapshot for every meaningful operation, allowing the interface to pause, resume, or advance exactly one step without maintaining separate, algorithm-specific animation flags.

The original version of this project was created in 2020 with p5.js. The current version keeps the educational goal while replacing the rendering dependency and global state with browser-native APIs and testable modules.
