/* Deterministic, dependency-free classifiers for the teaching lab. */
(function (root) {
    'use strict';
    function random(seed) {
        let s = seed >>> 0;
        return () => {
            s += 0x6D2B79F5;
            let t = Math.imul(s ^ s >>> 15, 1 | s);
            t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }
    function generate(kind, count, noise, seed) {
        const rng = random(seed);
        const normal = () => Math.sqrt(-2 * Math.log(Math.max(rng(), 1e-12))) * Math.cos(2 * Math.PI * rng());
        const classes = [[], []];
        for (let i = 0; i < count; i++) {
            const label = i % 2;
            let x, y;
            if (kind === 'moons') {
                const a = rng() * Math.PI;
                x = Math.cos(a) + label - 0.5;
                y = (label ? -Math.sin(a) + 0.5 : Math.sin(a)) - 0.25;
            } else if (kind === 'circles') {
                const a = rng() * 2 * Math.PI, r = label ? 1.3 : 0.55;
                x = r * Math.cos(a); y = r * Math.sin(a);
            } else if (kind === 'xor') {
                const sign = rng() < 0.5 ? -1 : 1;
                x = sign * (0.25 + rng()); y = sign * (label ? -1 : 1) * (0.25 + rng());
            } else {
                x = (label ? 0.85 : -0.85) + normal() * 0.3;
                y = normal() * 0.65;
            }
            classes[label].push({ x: x + normal() * noise, y: y + normal() * noise, label });
        }
        // Stratified 70/30 split. No held-out points are passed to a learner.
        const train = [], test = [];
        for (const points of classes) {
            for (let i = points.length - 1; i > 0; i--) {
                const j = Math.floor(rng() * (i + 1));
                [points[i], points[j]] = [points[j], points[i]];
            }
            const cut = Math.floor(points.length * 0.7);
            train.push(...points.slice(0, cut)); test.push(...points.slice(cut));
        }
        return { train, test };
    }
    function logistic(points, penalty = 0.02) {
        const w = [0, 0, 0];
        const sigmoid = z => 1 / (1 + Math.exp(-Math.max(-40, Math.min(40, z))));
        for (let step = 0; step < 900; step++) {
            const g = [0, 0, 0];
            for (const p of points) {
                const error = sigmoid(w[0] + w[1] * p.x + w[2] * p.y) - p.label;
                g[0] += error; g[1] += error * p.x; g[2] += error * p.y;
            }
            for (let j = 0; j < 3; j++) w[j] -= 0.3 * (g[j] / points.length + (j ? penalty * w[j] : 0));
        }
        return p => sigmoid(w[0] + w[1] * p.x + w[2] * p.y);
    }
    function knn(points, k = 7) {
        // Retain only k nearest distances instead of sorting every training point per pixel.
        return p => {
            const nearest = [];
            for (const q of points) {
                const d = (p.x - q.x) ** 2 + (p.y - q.y) ** 2;
                let i = nearest.length;
                while (i > 0 && nearest[i - 1].d > d) i--;
                if (i < k) { nearest.splice(i, 0, { d, label: q.label }); if (nearest.length > k) nearest.pop(); }
            }
            return nearest.reduce((s, q) => s + q.label, 0) / nearest.length;
        };
    }
    function gaussianNB(points) {
        const stats = [0, 1].map(label => {
            const rows = points.filter(p => p.label === label);
            const mean = key => rows.reduce((s, p) => s + p[key], 0) / rows.length;
            const x = mean('x'), y = mean('y');
            return { prior: rows.length / points.length, x, y,
                vx: Math.max(1e-6, rows.reduce((s, p) => s + (p.x - x) ** 2, 0) / rows.length),
                vy: Math.max(1e-6, rows.reduce((s, p) => s + (p.y - y) ** 2, 0) / rows.length) };
        });
        return p => {
            const scores = stats.map(s => Math.log(s.prior) - 0.5 * (Math.log(s.vx * s.vy) + (p.x - s.x) ** 2 / s.vx + (p.y - s.y) ** 2 / s.vy));
            return 1 / (1 + Math.exp(Math.max(-700, Math.min(700, scores[0] - scores[1]))));
        };
    }
    function tree(points, maxDepth = 4) {
        const impurity = (ones, n) => n ? 2 * ones * (1 - ones / n) : 0;
        function grow(rows, depth) {
            const ones = rows.reduce((s, p) => s + p.label, 0);
            const node = { probability: ones / rows.length };
            if (depth >= maxDepth || rows.length < 4 || !ones || ones === rows.length) return node;
            let best = null;
            for (const axis of ['x', 'y']) {
                const sorted = rows.slice().sort((a, b) => a[axis] - b[axis]);
                let leftOnes = 0;
                for (let i = 1; i < sorted.length; i++) {
                    leftOnes += sorted[i - 1].label;
                    if (i < 2 || sorted.length - i < 2 || sorted[i - 1][axis] === sorted[i][axis]) continue;
                    const score = impurity(leftOnes, i) + impurity(ones - leftOnes, sorted.length - i);
                    if (!best || score < best.score) best = { score, axis, value: (sorted[i - 1][axis] + sorted[i][axis]) / 2 };
                }
            }
            if (!best || best.score >= impurity(ones, rows.length) - 1e-10) return node;
            return { ...node, axis: best.axis, value: best.value,
                left: grow(rows.filter(p => p[best.axis] <= best.value), depth + 1),
                right: grow(rows.filter(p => p[best.axis] > best.value), depth + 1) };
        }
        const model = grow(points, 0);
        return p => {
            let node = model;
            while (node.axis) node = p[node.axis] <= node.value ? node.left : node.right;
            return node.probability;
        };
    }
    const accuracy = (predict, points) => points.reduce((s, p) => s + (Number(predict(p) >= 0.5) === p.label), 0) / points.length;
    const api = { generate, logistic, knn, gaussianNB, tree, accuracy };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.MLEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
