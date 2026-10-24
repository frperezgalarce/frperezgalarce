# Optimization playground

Open `playground.html` through a local static server, or visit the same page after publishing this repository to GitHub Pages. There is no build step, external dependency, or backend. The page follows the site's English/Spanish language preference (`?lang=en` / `?lang=es`).

For a local preview:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Visit http://127.0.0.1:8765/playground.html.

## Experiments

- **Traveling salesman:** 5–60 Euclidean cities; nearest-neighbor construction from city 1, followed by first-improvement 2-opt until no improving move remains. Results compare the greedy tour and improved tour, including the return to the start. No global-optimality guarantee.
- **Nurse scheduling:** 6–30 nurses, 7 or 14 days, and 1–8 nurses required per shift. Two shifts daily, one assignment per nurse-day, no night-to-day transition, at most three consecutive working days, and a horizon-wide cap of 5 or 10 shifts per nurse. Availability is sampled independently with an 8% absence probability. The best of 100 randomized greedy constructions minimizes unfilled positions, then workload range. Partial coverage is reported rather than claimed infeasible. This is a simplified educational model.
- **Shortest path:** 5–20 nodes, positive integer costs, undirected edges, and a ring ensuring connectivity. Optional additional edges create shortcuts. Dijkstra returns an exact minimum-cost route, including the zero-cost case where both endpoints coincide.

The same seed and settings reproduce each instance and solution. Changing controls requires generating an instance before solving or exporting. Shuffle changes the seed and generates immediately. JSON downloads include the instance, current solution (or `null`), and endpoints for shortest path. Arrays and route indices in the export are zero-based; visible labels are one-based. Nurse assignments use 0 = off, 1 = day, 2 = night.

## Verification

With Node.js installed:

```sh
node tests/playground-engine.test.cjs
```

The checks cover reproducibility, valid TSP tours and non-worsening improvement, shortest paths against an independent Floyd–Warshall reference, and nurse scheduling constraints and coverage accounting across multiple seeds and sizes. Browser checks should also cover all three solvers, language switching, input validation, JSON downloads, and narrow layouts.
