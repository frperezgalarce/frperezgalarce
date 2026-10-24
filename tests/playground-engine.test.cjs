// Run with: node tests/playground-engine.test.cjs
const assert = require('node:assert/strict');
const E = require('../playground-engine.js');
let checks = 0;
function check(condition, message) { assert.ok(condition, message); checks++; }
function equal(actual, expected, message) { assert.deepEqual(actual, expected, message); checks++; }

const square = { points: [{x:0,y:0}, {x:1,y:0}, {x:1,y:1}, {x:0,y:1}] };
equal(E.solveTSP(square).length, 4, 'Unit square tour has length four');
for (let seed = 0; seed < 40; seed++) {
    const instance = E.generateTSP(seed % 2 ? 60 : 5, seed);
    equal(instance, E.generateTSP(instance.points.length, seed), 'TSP generation is reproducible');
    const result = E.solveTSP(instance);
    equal(new Set(result.tour).size, instance.points.length, 'Every city appears once');
    equal(result.tour[0], 0, 'Tour starts at city one');
    check(result.length <= result.initialLength + 1e-8, '2-opt never worsens the starting tour');
    equal(result.length, E.tourLength(instance.points, result.tour), 'Reported tour length includes the return edge');
}

// Independently compare Dijkstra to Floyd–Warshall for every pair in 20 graphs.
for (let seed = 0; seed < 20; seed++) {
    const graph = E.generateGraph(5 + seed % 16, (seed % 3) / 10, seed);
    equal(graph, E.generateGraph(graph.points.length, (seed % 3) / 10, seed), 'Graph generation is reproducible');
    const n = graph.points.length;
    const shortest = Array.from({length:n}, (_, i) => Array.from({length:n}, (_, j) => i === j ? 0 : Infinity));
    for (const edge of graph.edges) {
        check(edge.weight > 0 && Number.isInteger(edge.weight), 'Positive integer weights');
        shortest[edge.a][edge.b] = shortest[edge.b][edge.a] = edge.weight;
    }
    for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        shortest[i][j] = Math.min(shortest[i][j], shortest[i][k] + shortest[k][j]);
    }
    for (let source = 0; source < n; source++) for (let target = 0; target < n; target++) {
        const result = E.solvePath(graph, source, target);
        equal(result.distance, shortest[source][target], 'Shortest-path cost matches independent reference');
        equal(result.path[0], source, 'Path begins at selected source');
        equal(result.path.at(-1), target, 'Path ends at selected destination');
        let cost = 0;
        for (let i = 1; i < result.path.length; i++) {
            const a = result.path[i - 1], b = result.path[i];
            const edge = graph.edges.find(e => (e.a === a && e.b === b) || (e.a === b && e.b === a));
            check(Boolean(edge), 'Path follows actual edges');
            cost += edge.weight;
        }
        equal(cost, result.distance, 'Displayed path cost equals its edge sum');
    }
}
equal(E.solvePath({points:[{},{}],edges:[]}, 0, 1).path, [], 'Disconnected destination returns no path');

for (let seed = 0; seed < 40; seed++) {
    const instance = E.generateNurses(6 + seed % 25, seed % 2 ? 7 : 14, 1 + seed % 8, seed);
    equal(instance, E.generateNurses(instance.nurses, instance.days, instance.demand, seed), 'Nurse availability is reproducible');
    const result = E.solveNurses(instance);
    equal(result, E.solveNurses(instance), 'Scheduler is reproducible');
    let unfilled = 0;
    for (let nurse = 0; nurse < instance.nurses; nurse++) {
        let shifts = 0, run = 0;
        for (let day = 0; day < instance.days; day++) {
            const shift = result.schedule[nurse][day];
            check([0,1,2].includes(shift), 'At most one valid shift per day');
            check(!shift || instance.availability[nurse][day], 'Assignments respect availability');
            check(!(shift === 1 && day && result.schedule[nurse][day - 1] === 2), 'No night-to-day transition');
            if (shift) { shifts++; run++; } else run = 0;
            check(run <= instance.maxConsecutive, 'Consecutive-day limit respected');
        }
        check(shifts <= instance.maxShifts, 'Total workload cap respected');
        equal(result.loads[nurse], shifts, 'Reported nurse workload matches assignments');
    }
    for (let day = 0; day < instance.days; day++) for (const shift of [1,2]) {
        const covered = result.schedule.filter(row => row[day] === shift).length;
        check(covered <= instance.demand, 'No overstaffing');
        equal(result.shortages[day][shift - 1], instance.demand - covered, 'Shortages are accurately reported');
        unfilled += instance.demand - covered;
    }
    equal(result.unfilled, unfilled, 'Total unfilled positions is accurate');
}
equal(E.solveNurses(E.generateNurses(12, 7, 3, 42)).unfilled, 0, 'Default example has full coverage');
check(E.solveNurses(E.generateNurses(6, 14, 8, 42)).unfilled > 0, 'Overloaded example reports shortages');
const unavailable = E.generateNurses(6, 7, 1, 42);
unavailable.availability.forEach(row => row.fill(false));
equal(E.solveNurses(unavailable).unfilled, 14, 'Completely unavailable team leaves every position unfilled');
console.log(`Passed ${checks} optimization checks.`);
