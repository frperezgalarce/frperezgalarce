document.addEventListener('DOMContentLoaded', () => {
    'use strict';
    const E = window.PlaygroundEngine;
    const es = window.siteLanguage === 'es';
    const t = (en, spanish) => es ? spanish : en;
    const $ = id => document.getElementById(id);
    const format = value => new Intl.NumberFormat(es ? 'es-CL' : 'en', { maximumFractionDigits: 1 }).format(value);
    let problem = 'tsp', instance, solution, endpoints;
    const names = { tsp: t('A tour through every city', 'Un recorrido por cada ciudad'),
        nurses: t('A roster for your team', 'Un calendario para tu equipo'),
        path: t('A route across the network', 'Una ruta a través de la red') };
    const methods = {
        tsp: {
            title: t('Nearest neighbor + 2-opt', 'Vecino más cercano + 2-opt'),
            description: t('Start at city 1 and repeatedly visit the nearest unvisited city, then return to the start. Improve that tour by reversing segments whenever replacing two edges shortens the route.', 'Comienza en la ciudad 1, visita la ciudad más cercana aún no visitada y vuelve al inicio. Mejora ese recorrido invirtiendo segmentos cuando reemplazar dos aristas reduce la distancia.'),
            rules: [t('Visit each city exactly once and return to the start.', 'Visita cada ciudad exactamente una vez y regresa al inicio.'), t('Distances are Euclidean, in the coordinate units of the drawing.', 'Las distancias son euclidianas, en las unidades de coordenadas del dibujo.'), t('Compare the initial greedy tour with the improved tour on the same cities.', 'Compara el recorrido voraz inicial con el recorrido mejorado sobre las mismas ciudades.')],
            caveat: t('This heuristic reaches a 2-opt local optimum, not necessarily the shortest possible tour.', 'Esta heurística alcanza un óptimo local de 2-opt, que no necesariamente es el recorrido más corto posible.')
        },
        nurses: {
            title: t('Greedy assignment, balanced loads', 'Asignación voraz, cargas equilibradas'),
            description: t('Build 100 rosters, favoring eligible nurses with fewer assigned shifts and randomizing priorities. Keep the roster with the fewest unfilled positions, then the smallest workload range.', 'Construye 100 calendarios, priorizando al personal disponible con menos turnos asignados y variando las prioridades al azar. Conserva el calendario con menos puestos sin cubrir y, en caso de empate, menor rango de carga.'),
            rules: [t('Two shifts per day (day and night); at most one shift per nurse per day.', 'Dos turnos diarios (día y noche); como máximo un turno por persona al día.'), t('At most 3 consecutive workdays; no day shift immediately after a night shift.', 'Máximo 3 días consecutivos de trabajo; sin turno de día inmediatamente después de uno nocturno.'), t('At most 5 shifts in 7 days or 10 in 14 days (a limit over the full horizon). Each nurse-day has an 8% chance of being unavailable.', 'Máximo 5 turnos en 7 días o 10 en 14 días (límite sobre el horizonte completo). Cada persona tiene un 8% de probabilidad de no estar disponible en cada día.')],
            caveat: t('A simplified teaching model, not a clinical staffing system. Unfilled positions mean this heuristic did not find full coverage; they do not prove the instance is infeasible. Skills, preferences and labor regulations are not modeled.', 'Modelo simplificado para docencia, no un sistema de dotación clínica. Los puestos sin cubrir indican que la heurística no encontró cobertura completa; no demuestran que la instancia sea infactible. No se modelan competencias, preferencias ni normativa laboral.')
        },
        path: {
            title: t('Dijkstra’s algorithm', 'Algoritmo de Dijkstra'),
            description: t('Repeatedly settle the node with the smallest known distance from the start, and update the distances to its neighbors. Follow predecessor links back from the destination to recover the route.', 'Selecciona repetidamente el nodo con menor distancia conocida desde el origen y actualiza las distancias a sus vecinos. Reconstruye la ruta desde el destino siguiendo los nodos predecesores.'),
            rules: [t('An undirected, connected graph with positive integer edge costs.', 'Un grafo no dirigido y conectado, con costos enteros positivos en las aristas.'), t('Numbers along the edges are travel costs; the drawing is not a distance scale.', 'Los números en las aristas son costos de viaje; el dibujo no representa una escala de distancias.'), t('Change the origin and destination to explore different routes.', 'Cambia el origen y el destino para explorar diferentes rutas.')],
            caveat: t('Unlike the other two methods, Dijkstra is an exact algorithm: it guarantees a minimum-cost path for these positive edge weights.', 'A diferencia de los otros dos métodos, Dijkstra es un algoritmo exacto: garantiza un camino de costo mínimo con estos pesos positivos.')
        }
    };
    function numberField(id, label, min, max, value) {
        return `<label for="${id}">${label}</label><input id="${id}" name="${id}" type="number" min="${min}" max="${max}" step="1" value="${value}" required>`;
    }
    function configure() {
        $('problem-fields').innerHTML = problem === 'tsp'
            ? numberField('cities', t('Cities (5–60)', 'Ciudades (5–60)'), 5, 60, 20)
            : problem === 'nurses'
                ? numberField('nurses', t('Nurses (6–30)', 'Personal de enfermería (6–30)'), 6, 30, 12)
                + `<label for="days">${t('Planning horizon', 'Horizonte de planificación')}</label><select id="days"><option value="7">${t('7 days', '7 días')}</option><option value="14">${t('14 days', '14 días')}</option></select>`
                + numberField('demand', t('Nurses per shift (1–8)', 'Personas por turno (1–8)'), 1, 8, 3)
                : numberField('nodes', t('Nodes (5–20)', 'Nodos (5–20)'), 5, 20, 10)
                + `<label for="density">${t('Extra connections', 'Conexiones adicionales')}</label><select id="density"><option value="0">${t('None · ring only', 'Ninguna · solo anillo')}</option><option value="0.1" selected>${t('Few · 10% probability', 'Pocas · 10% de probabilidad')}</option><option value="0.2">${t('More · 20% probability', 'Más · 20% de probabilidad')}</option></select>`
                + numberField('source', t('Start node', 'Nodo de origen'), 1, 10, 1)
                + numberField('target', t('End node', 'Nodo de destino'), 1, 10, 6);
        $('visual-title').textContent = names[problem];
        const method = methods[problem];
        $('method-title').textContent = method.title;
        $('method-description').textContent = method.description;
        $('method-rules').innerHTML = method.rules.map(rule => `<li>${rule}</li>`).join('');
        $('method-caveat').textContent = method.caveat;
        generate();
    }
    function setStatus(message) { $('lab-status').textContent = message; }
    function syncNodeLimits() {
        if (problem !== 'path') return;
        const count = Number($('nodes').value);
        if (Number.isInteger(count) && count >= 5 && count <= 20) {
            for (const id of ['source', 'target']) {
                $(id).max = count;
                if (Number($(id).value) > count) $(id).value = count;
            }
        }
    }
    function generate() {
        syncNodeLimits();
        if (!$('instance-form').reportValidity()) return;
        const seed = Number($('seed').value);
        solution = null;
        if (problem === 'tsp') instance = E.generateTSP(Number($('cities').value), seed);
        if (problem === 'nurses') instance = E.generateNurses(Number($('nurses').value), Number($('days').value), Number($('demand').value), seed);
        if (problem === 'path') {
            instance = E.generateGraph(Number($('nodes').value), Number($('density').value), seed);
            endpoints = { source: Number($('source').value) - 1, target: Number($('target').value) - 1 };
        }
        $('solve').disabled = false;
        $('download').disabled = false;
        setStatus(t(`Instance ready · seed ${seed}. Press Solve to see the result.`, `Instancia lista · semilla ${seed}. Presiona Resolver para ver el resultado.`));
        render();
    }
    function legend(items) {
        $('legend').innerHTML = items.map(([type, label]) => `<span class="legend-item"><i class="legend-key ${type}" aria-hidden="true"></i>${label}</span>`).join('');
    }
    function metrics(items) {
        $('metrics').innerHTML = items.map(([value, label]) => `<div><span class="metric-value">${value}</span><span class="metric-label">${label}</span></div>`).join('');
    }
    function line(points, tour, className, closed = false) {
        const route = closed ? [...tour, tour[0]] : tour;
        return `<polyline class="${className}" points="${route.map(i => `${points[i].x},${points[i].y}`).join(' ')}"/>`;
    }
    function renderGraph() {
        const { points } = instance;
        let markup = '';
        if (problem === 'path') {
            markup += instance.edges.map(edge => `<line class="graph-edge" x1="${points[edge.a].x}" y1="${points[edge.a].y}" x2="${points[edge.b].x}" y2="${points[edge.b].y}"/>`).join('');
            if (solution) markup += line(points, solution.path, 'solution-line');
            markup += instance.edges.map(edge => `<text class="edge-label" x="${(points[edge.a].x + points[edge.b].x) / 2}" y="${(points[edge.a].y + points[edge.b].y) / 2 - 4}">${edge.weight}</text>`).join('');
        } else if (solution) {
            markup += line(points, solution.initialTour, 'tour-baseline', true);
            markup += line(points, solution.tour, 'solution-line', true);
        }
        markup += points.map((point, i) => {
            const endpoint = problem === 'path' ? i === endpoints.source || i === endpoints.target : i === 0;
            return `<circle class="node${endpoint ? ' endpoint' : ''}" cx="${point.x}" cy="${point.y}" r="12"/><text class="node-label${endpoint ? ' endpoint' : ''}" x="${point.x}" y="${point.y}">${i + 1}</text>`;
        }).join('');
        const description = problem === 'tsp'
            ? t('Numbered cities. After solving, a dashed initial tour and a solid improved tour are shown. Route details appear below.', 'Ciudades numeradas. Al resolver, se muestra el recorrido inicial discontinuo y el mejorado continuo. Los detalles aparecen debajo.')
            : t('An undirected weighted network. Filled nodes mark the endpoints; the solution route appears in green. Route details appear below.', 'Red no dirigida con pesos. Los nodos rellenos marcan los extremos; la solución aparece en verde. Los detalles aparecen debajo.');
        $('visualization').innerHTML = `<div class="graph-scroll" tabindex="0" role="region" aria-label="${t('Problem diagram, scroll horizontally on small screens', 'Diagrama del problema, desplázate horizontalmente en pantallas pequeñas')}"><svg viewBox="0 0 700 440" role="img" aria-labelledby="graph-title graph-description"><title id="graph-title">${names[problem]}</title><desc id="graph-description">${description}</desc>${markup}</svg></div>`;
        legend(problem === 'tsp' ? [[ 'baseline', t('Nearest neighbor', 'Vecino más cercano') ], [ '', t('Improved tour', 'Recorrido mejorado') ]] : [['', t('Minimum-cost path', 'Camino de costo mínimo')], ['off', t('Edge labels = cost', 'Etiquetas de aristas = costo')]]);
    }
    function renderSchedule() {
        const { nurses, days, availability, demand } = instance;
        const symbols = ['—', 'D', 'N'];
        const labels = [t('Off', 'Libre'), t('Day', 'Día'), t('Night', 'Noche')];
        let table = `<table class="schedule-table"><caption>${t('D = day, N = night, — = off, × = unavailable. Coverage is assigned / required.', 'D = día, N = noche, — = libre, × = no disponible. Cobertura: asignados / requeridos.')}</caption><thead><tr><th scope="col">${t('Nurse', 'Persona')}</th>`;
        for (let day = 0; day < days; day++) table += `<th scope="col">${t('D', 'D')}${day + 1}</th>`;
        table += `<th scope="col">${t('Total', 'Total')}</th></tr></thead><tbody>`;
        for (let nurse = 0; nurse < nurses; nurse++) {
            table += `<tr><th scope="row">${t('Nurse', 'Persona')} ${nurse + 1}</th>`;
            for (let day = 0; day < days; day++) {
                const shift = solution ? solution.schedule[nurse][day] : 0;
                const unavailable = !availability[nurse][day];
                const cellLabel = unavailable ? t('Unavailable', 'No disponible') : !solution ? t('Unassigned', 'Sin asignar') : labels[shift];
                table += `<td class="${unavailable ? 'unavailable' : ['', 'day', 'night'][shift]}" aria-label="${cellLabel}">${unavailable ? '×' : solution ? symbols[shift] : '·'}</td>`;
            }
            table += `<td>${solution ? solution.loads[nurse] : '—'}</td></tr>`;
        }
        table += '</tbody><tfoot>';
        for (const shift of [0, 1]) {
            table += `<tr><th scope="row">${t('Coverage', 'Cobertura')} ${shift === 0 ? 'D' : 'N'}</th>`;
            for (let day = 0; day < days; day++) {
                const shortage = solution ? solution.shortages[day][shift] : 0;
                table += `<td class="${shortage ? 'shortage' : ''}">${solution ? demand - shortage : '—'}/${demand}</td>`;
            }
            table += '<td>—</td></tr>';
        }
        table += '</tfoot></table>';
        $('visualization').innerHTML = `<div class="schedule-scroll" tabindex="0" role="region" aria-label="${t('Nurse schedule, scroll to explore', 'Calendario de enfermería, desplázate para explorar')}">${table}</div>`;
        legend([['day', t('Day shift', 'Turno de día')], ['night', t('Night shift', 'Turno de noche')], ['off', t('Off', 'Libre')], ['unavailable', t('Unavailable', 'No disponible')]]);
    }
    function render() {
        const warning = solution && problem === 'nurses' && solution.unfilled > 0;
        $('state-badge').textContent = !solution ? t('Ready to solve', 'Lista para resolver') : warning ? t('Partial coverage', 'Cobertura parcial') : t('Solved', 'Resuelto');
        $('state-badge').classList.toggle('warning', Boolean(warning));
        if (problem === 'nurses') renderSchedule(); else renderGraph();
        if (!solution) {
            if (problem === 'tsp') metrics([[instance.points.length, t('Cities', 'Ciudades')], ['2-opt', t('Improvement method', 'Método de mejora')], [instance.seed, t('Seed', 'Semilla')]]);
            if (problem === 'path') metrics([[instance.points.length, t('Nodes', 'Nodos')], [instance.edges.length, t('Edges', 'Aristas')], [`${endpoints.source + 1} → ${endpoints.target + 1}`, t('Start → end', 'Origen → destino')]]);
            if (problem === 'nurses') metrics([[instance.nurses, t('Nurses', 'Personas')], [instance.days * 2 * instance.demand, t('Positions to fill', 'Puestos por cubrir')], [instance.maxShifts, t('Max shifts / nurse', 'Máx. turnos / persona')]]);
            $('result-detail').textContent = t('Generate another instance or solve this one to inspect the result.', 'Genera otra instancia o resuelve esta para explorar el resultado.');
            return;
        }
        if (problem === 'tsp') {
            const improvement = 100 * (solution.initialLength - solution.length) / solution.initialLength;
            metrics([[format(solution.initialLength), t('Initial distance', 'Distancia inicial')], [format(solution.length), t('Improved distance', 'Distancia mejorada')], [`${format(improvement)}%`, t('Distance saved', 'Reducción de distancia')]]);
            $('result-detail').textContent = t(`${solution.swaps} improving swaps. Tour: `, `${solution.swaps} intercambios de mejora. Recorrido: `) + [...solution.tour, solution.tour[0]].map(i => i + 1).join(' → ');
        }
        if (problem === 'path') {
            metrics([[Number.isFinite(solution.distance) ? solution.distance : '∞', t('Total cost', 'Costo total')], [Math.max(0, solution.path.length - 1), t('Edges in path', 'Aristas en la ruta')], [solution.visited, t('Settled nodes', 'Nodos fijados')]]);
            $('result-detail').textContent = solution.path.length ? t('Optimal path: ', 'Camino óptimo: ') + solution.path.map(i => i + 1).join(' → ') : t('No path connects these nodes.', 'No existe un camino entre estos nodos.');
        }
        if (problem === 'nurses') {
            const total = instance.days * 2 * instance.demand;
            metrics([[`${format(100 * (total - solution.unfilled) / total)}%`, t('Coverage', 'Cobertura')], [solution.unfilled, t('Unfilled positions', 'Puestos sin cubrir')], [`${Math.min(...solution.loads)}–${Math.max(...solution.loads)}`, t('Shifts per nurse', 'Turnos por persona')]]);
            $('result-detail').textContent = warning
                ? t('Some positions remain unfilled. Try more nurses or lower demand. This heuristic may miss a feasible full-coverage roster.', 'Quedan puestos sin cubrir. Prueba con más personal o menor demanda. Esta heurística puede no encontrar un calendario factible con cobertura completa.')
                : t('All required positions are covered and all modeled hard constraints are satisfied. Best of 100 greedy constructions.', 'Todos los puestos requeridos están cubiertos y se cumplen todas las restricciones duras del modelo. Mejor resultado de 100 construcciones voraces.');
        }
    }
    $('instance-form').addEventListener('submit', event => { event.preventDefault(); generate(); });
    $('instance-form').addEventListener('input', () => {
        syncNodeLimits();
        $('solve').disabled = true;
        $('download').disabled = true;
        $('state-badge').textContent = t('Settings changed', 'Parámetros modificados');
        setStatus(t('Settings changed. Generate an instance to apply them; the previous instance is still shown.', 'Parámetros modificados. Genera una instancia para aplicarlos; aún se muestra la instancia anterior.'));
    });
    $('shuffle-seed').addEventListener('click', () => {
        const previous = Number($('seed').value);
        $('seed').value = (previous + 1 + Math.floor(Math.random() * 999999)) % 1000000;
        $('instance-form').dispatchEvent(new Event('input'));
        generate();
    });
    $('solve').addEventListener('click', () => {
        if (!instance || $('solve').disabled) return;
        solution = problem === 'tsp' ? E.solveTSP(instance) : problem === 'nurses' ? E.solveNurses(instance) : E.solvePath(instance, endpoints.source, endpoints.target);
        render();
        setStatus(t('Solved. ', 'Resuelto. ') + (problem === 'nurses'
            ? t(`${solution.unfilled} unfilled positions.`, `${solution.unfilled} puestos sin cubrir.`)
            : problem === 'tsp' ? t(`Tour distance: ${format(solution.length)}.`, `Distancia del recorrido: ${format(solution.length)}.`)
                : t(`Minimum cost: ${solution.distance}.`, `Costo mínimo: ${solution.distance}.`)));
    });
    $('problem-picker').addEventListener('click', event => {
        const button = event.target.closest('[data-problem]');
        if (!button || button.dataset.problem === problem) return;
        problem = button.dataset.problem;
        document.querySelectorAll('[data-problem]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
        configure();
    });
    $('download').addEventListener('click', () => {
        const data = { version: 1, note: 'Array indices are zero-based; displayed node labels are one-based. Nurse shifts: 0=off, 1=day, 2=night.', instance, ...(problem === 'path' ? { endpoints } : {}), solution };
        const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `${problem}-seed-${instance.seed}.json`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    $('problem-picker').setAttribute('aria-label', t('Choose a problem', 'Elige un problema'));
    $('metrics').setAttribute('aria-label', t('Results', 'Resultados'));
    if (es) {
        document.title = 'Laboratorio de optimización · Francisco Pérez-Galarce';
        document.querySelector('meta[name="description"]').content = 'Genera y resuelve instancias del viajante de comercio, turnos de enfermería y camino más corto en un laboratorio interactivo de Investigación de Operaciones.';
    }
    configure();
});
