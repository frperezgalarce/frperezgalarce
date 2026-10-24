/* Small, deterministic teaching examples. No dependencies or network requests. */
(function (root) {
    'use strict';
    function random(seed) {
        let state = seed >>> 0;
        return () => {
            state += 0x6D2B79F5;
            let t = Math.imul(state ^ state >>> 15, 1 | state);
            t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }
    const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const tourLength = (points, tour) => tour.reduce((sum, node, i) =>
        sum + distance(points[node], points[tour[(i + 1) % tour.length]]), 0);

    function generateTSP(count, seed) {
        const rng = random(seed);
        const points = [];
        for (let i = 0; i < count; i++) {
            let point;
            // Reject very close points so city labels remain readable.
            for (let attempt = 0; attempt < 100; attempt++) {
                point = { x: 35 + rng() * 630, y: 35 + rng() * 370 };
                if (points.every(other => distance(point, other) > 27)) break;
            }
            points.push(point);
        }
        return { type: 'tsp', seed, points };
    }
    function solveTSP(instance) {
        const { points } = instance;
        const remaining = new Set(points.map((_, i) => i).slice(1));
        const tour = [0];
        while (remaining.size) {
            const last = points[tour[tour.length - 1]];
            let nearest = -1;
            let best = Infinity;
            for (const i of remaining) {
                const d = distance(last, points[i]);
                if (d < best) { best = d; nearest = i; }
            }
            tour.push(nearest);
            remaining.delete(nearest);
        }
        const initialTour = tour.slice();
        const initialLength = tourLength(points, tour);
        let swaps = 0;
        // First-improvement 2-opt: reverse a segment when two edges get shorter.
        for (;;) {
            let improved = false;
            search: for (let i = 1; i < tour.length - 1; i++) {
                for (let j = i + 1; j < tour.length; j++) {
                    const a = points[tour[i - 1]], b = points[tour[i]];
                    const c = points[tour[j]], d = points[tour[(j + 1) % tour.length]];
                    if (distance(a, c) + distance(b, d) < distance(a, b) + distance(c, d) - 1e-9) {
                        tour.splice(i, j - i + 1, ...tour.slice(i, j + 1).reverse());
                        swaps++;
                        improved = true;
                        break search;
                    }
                }
            }
            if (!improved) break;
        }
        return { tour, initialTour, initialLength, length: tourLength(points, tour), swaps };
    }

    function generateGraph(count, extraProbability, seed) {
        const rng = random(seed);
        const points = Array.from({ length: count }, (_, i) => {
            const angle = i * 2 * Math.PI / count - Math.PI / 2;
            return { x: 350 + Math.cos(angle) * (235 + rng() * 40),
                y: 220 + Math.sin(angle) * (150 + rng() * 25) };
        });
        const edges = [];
        for (let a = 0; a < count; a++) {
            for (let b = a + 1; b < count; b++) {
                // A ring guarantees connectivity; extra edges offer shortcuts.
                if (b === a + 1 || (a === 0 && b === count - 1) || rng() < extraProbability) {
                    edges.push({ a, b, weight: Math.max(1, Math.round(distance(points[a], points[b]) / 20 + rng() * 9)) });
                }
            }
        }
        return { type: 'path', seed, points, edges };
    }
    function solvePath(instance, source, target) {
        const n = instance.points.length;
        const distances = Array(n).fill(Infinity), previous = Array(n).fill(-1), visited = new Set();
        distances[source] = 0;
        while (visited.size < n) {
            let current = -1;
            for (let i = 0; i < n; i++) {
                if (!visited.has(i) && (current === -1 || distances[i] < distances[current])) current = i;
            }
            if (current === -1 || !Number.isFinite(distances[current])) break;
            visited.add(current);
            if (current === target) break;
            for (const edge of instance.edges) {
                const next = edge.a === current ? edge.b : edge.b === current ? edge.a : -1;
                if (next < 0 || visited.has(next)) continue;
                const candidate = distances[current] + edge.weight;
                if (candidate < distances[next]) { distances[next] = candidate; previous[next] = current; }
            }
        }
        const path = [];
        if (Number.isFinite(distances[target])) {
            for (let at = target; at !== -1; at = previous[at]) path.unshift(at);
        }
        return { path, distance: distances[target], visited: visited.size, source, target };
    }

    function generateNurses(nurses, days, demand, seed) {
        const rng = random(seed);
        return { type: 'nurses', seed, nurses, days, demand,
            maxShifts: Math.floor(days * 5 / 7), maxConsecutive: 3,
            availability: Array.from({ length: nurses }, () =>
                Array.from({ length: days }, () => rng() >= 0.08)) };
    }
    function solveNurses(instance) {
        const { nurses, days, demand, availability, maxShifts, maxConsecutive } = instance;
        const rng = random(instance.seed ^ 0xABCDEF);
        let best;
        // Repeated greedy construction; prioritize coverage, then workload balance.
        for (let attempt = 0; attempt < 100; attempt++) {
            const schedule = Array.from({ length: nurses }, () => Array(days).fill(0));
            const loads = Array(nurses).fill(0), nights = Array(nurses).fill(0);
            const shortages = Array.from({ length: days }, () => [0, 0]);
            for (let day = 0; day < days; day++) {
                for (const shift of [1, 2]) {
                    const candidates = [];
                    for (let nurse = 0; nurse < nurses; nurse++) {
                        if (!availability[nurse][day] || schedule[nurse][day] || loads[nurse] >= maxShifts) continue;
                        if (shift === 1 && day > 0 && schedule[nurse][day - 1] === 2) continue;
                        let consecutive = 0;
                        for (let back = day - 1; back >= 0 && schedule[nurse][back]; back--) consecutive++;
                        if (consecutive >= maxConsecutive) continue;
                        candidates.push({ nurse, score: loads[nurse] + (shift === 2 ? nights[nurse] * 0.3 : 0) + rng() * 2 });
                    }
                    candidates.sort((a, b) => a.score - b.score);
                    const selected = candidates.slice(0, demand);
                    for (const { nurse } of selected) {
                        schedule[nurse][day] = shift;
                        loads[nurse]++;
                        if (shift === 2) nights[nurse]++;
                    }
                    shortages[day][shift - 1] = demand - selected.length;
                }
            }
            const unfilled = shortages.flat().reduce((a, b) => a + b, 0);
            const spread = Math.max(...loads) - Math.min(...loads);
            if (!best || unfilled < best.unfilled || (unfilled === best.unfilled && spread < best.spread)) {
                best = { schedule, loads, shortages, unfilled, spread, attempts: 100 };
            }
        }
        return best;
    }
    const api = { random, distance, tourLength, generateTSP, solveTSP, generateGraph, solvePath, generateNurses, solveNurses };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.PlaygroundEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
