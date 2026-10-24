// Run: node tests/ml-engine.test.cjs
const assert = require('node:assert/strict');
const E = require('../ml-engine.js');
let checks = 0;
function check(value, message) { assert.ok(value, message); checks++; }
const algorithms = ['logistic', 'knn', 'tree', 'gaussianNB'];
for (const shape of ['linear', 'moons', 'circles', 'xor']) {
    for (const seed of [0, 42, 999999]) {
        const data = E.generate(shape, 200, 0.12, seed);
        assert.deepEqual(data, E.generate(shape, 200, 0.12, seed)); checks++;
        check(data.train.length === 140 && data.test.length === 60, '70/30 split');
        check(data.train.filter(p => p.label === 1).length === 70, 'Stratified training data');
        check(data.test.filter(p => p.label === 1).length === 30, 'Stratified test data');
        check(data.train.every(p => !data.test.includes(p)), 'Disjoint train and test points');
        const original = JSON.stringify(data);
        for (const algorithm of algorithms) {
            const predict = E[algorithm](data.train);
            for (const p of [...data.test, { x: 100, y: -100 }]) {
                const probability = predict(p);
                check(Number.isFinite(probability) && probability >= 0 && probability <= 1, `${algorithm} has finite probabilities`);
            }
        }
        check(JSON.stringify(data) === original, 'Learners do not mutate the dataset');
    }
}
// Independently specified separable example: all models should learn the sign of x.
const simple = [];
for (const x of [-2, -1, 1, 2]) for (const y of [-1, 0, 1]) simple.push({ x, y, label: Number(x > 0) });
for (const algorithm of algorithms) {
    const predict = E[algorithm](simple);
    check(predict({ x: -1.5, y: 0.25 }) < 0.5, `${algorithm} recognizes class 0`);
    check(predict({ x: 1.5, y: -0.25 }) > 0.5, `${algorithm} recognizes class 1`);
}
// kNN compared to an independent full-sort implementation, including repeated points/ties.
const points = E.generate('moons', 100, 0.25, 7).train;
for (const k of [1, 3, 7, 25]) {
    const predict = E.knn(points, k);
    for (const query of [{ x: 0, y: 0 }, { x: 0.4, y: -0.3 }, ...points.slice(0, 8)]) {
        const nearest = points.slice().sort((a, b) => Math.hypot(a.x - query.x, a.y - query.y) - Math.hypot(b.x - query.x, b.y - query.y)).slice(0, k);
        assert.equal(predict(query), nearest.reduce((s, p) => s + p.label, 0) / k); checks++;
    }
}
// A depth-zero tree is the empirical prior; depth one captures the simple split.
check(E.tree(simple, 0)({ x: 100, y: 100 }) === 0.5, 'Depth zero has no split');
check(E.accuracy(E.tree(simple, 1), simple) === 1, 'A stump learns a separable split');
check(E.accuracy(() => 0.5, simple) === 0.5, 'Threshold ties go to class 1');
// The nonlinear example should expose a substantial limitation of a linear boundary.
const circles = E.generate('circles', 400, 0, 42);
check(E.accuracy(E.knn(circles.train, 7), circles.test) > 0.95, 'Local classifier learns concentric circles');
check(E.accuracy(E.logistic(circles.train), circles.test) < 0.7, 'Linear model cannot separate concentric circles');
// Degenerate within-class variance remains finite, including far-away predictions.
const duplicates = [{ x: -1, y: 0, label: 0 }, { x: -1, y: 0, label: 0 }, { x: 1, y: 0, label: 1 }, { x: 1, y: 0, label: 1 }];
check(Number.isFinite(E.gaussianNB(duplicates)({ x: 0, y: 100 })), 'Gaussian smoothing handles zero variance');
console.log(`Passed ${checks} machine-learning checks.`);
