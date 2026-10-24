document.addEventListener('DOMContentLoaded', () => {
    'use strict';
    const E = window.MLEngine, $ = id => document.getElementById(id);
    const es = window.siteLanguage === 'es', t = (en, sp) => es ? sp : en;
    const percent = value => new Intl.NumberFormat(es ? 'es-CL' : 'en', { style: 'percent', maximumFractionDigits: 1 }).format(value);
    $('ml-form').setAttribute('aria-label', t('Experiment settings', 'Parámetros del experimento'));
    $('model-grid').setAttribute('aria-label', t('Model comparison', 'Comparación de modelos'));
    document.querySelector('.lab-tabs').setAttribute('aria-label', t('Playgrounds', 'Laboratorios'));
    const models = [
        { id: 'logistic', name: t('Logistic regression', 'Regresión logística'), note: t('One straight boundary. L2 regularization controls the size of the coefficients.', 'Una frontera recta. La regularización L2 controla el tamaño de los coeficientes.') },
        { id: 'knn', name: t('k-nearest neighbors', 'k vecinos más cercanos'), note: t('A local vote. Small k allows more intricate boundaries; large k smooths them.', 'Una votación local. Un k pequeño permite fronteras más complejas; un k grande las suaviza.') },
        { id: 'tree', name: t('Decision tree', 'Árbol de decisión'), note: t('Axis-aligned splits. Greater depth allows smaller, more specific regions.', 'Divisiones paralelas a los ejes. Una mayor profundidad permite regiones más pequeñas y específicas.') },
        { id: 'gaussianNB', name: 'Gaussian Naive Bayes', note: t('A Gaussian distribution per feature and class, assuming conditional independence.', 'Una distribución gaussiana por variable y clase, suponiendo independencia condicional.') }
    ];
    for (const model of models) {
        const card = document.createElement('article'); card.className = 'model-card';
        card.innerHTML = `<h2 id="title-${model.id}"></h2><p class="model-note"></p><canvas id="plot-${model.id}" width="520" height="390" role="img" aria-describedby="score-${model.id}"></canvas><p class="model-scores" id="score-${model.id}"></p>`;
        card.querySelector('h2').textContent = model.name;
        card.querySelector('.model-note').textContent = model.note;
        card.querySelector('canvas').textContent = t('The decision regions and accuracy are described below.', 'Las regiones de decisión y la exactitud se describen a continuación.');
        $('model-grid').appendChild(card);
    }
    function draw(canvas, predict, data, domain, name) {
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas is unavailable');
        const left = 44, top = 14, size = 330, width = 460, res = 80;
        const { xmin, xmax, ymin, ymax } = domain;
        const xx = x => left + (x - xmin) / (xmax - xmin) * width;
        const yy = y => top + (ymax - y) / (ymax - ymin) * size;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const regions = [];
        for (let y = 0; y < res; y++) {
            regions[y] = [];
            for (let x = 0; x < res; x++) {
                const c = Number(predict({ x: xmin + (x + 0.5) / res * (xmax - xmin), y: ymax - (y + 0.5) / res * (ymax - ymin) }) >= 0.5);
                regions[y][x] = c;
                ctx.fillStyle = c ? '#f7e2d1' : '#dcece5';
                ctx.fillRect(left + x / res * width, top + y / res * size, width / res + 0.5, size / res + 0.5);
            }
        }
        // Outline adjacent cells whose predicted labels differ (a sampled boundary).
        ctx.strokeStyle = '#435f59'; ctx.lineWidth = 1; ctx.beginPath();
        for (let y = 0; y < res; y++) for (let x = 0; x < res; x++) {
            const px = left + x / res * width, py = top + y / res * size;
            if (x && regions[y][x] !== regions[y][x - 1]) { ctx.moveTo(px, py); ctx.lineTo(px, py + size / res); }
            if (y && regions[y][x] !== regions[y - 1][x]) { ctx.moveTo(px, py); ctx.lineTo(px + width / res, py); }
        }
        ctx.stroke();
        for (const [rows, heldOut] of [[data.train, false], [data.test, true]]) {
            for (const p of rows) {
                ctx.beginPath();
                if (p.label) { ctx.rect(xx(p.x) - 3.4, yy(p.y) - 3.4, 6.8, 6.8); }
                else ctx.arc(xx(p.x), yy(p.y), 3.8, 0, Math.PI * 2);
                ctx.fillStyle = heldOut ? '#fff' : p.label ? '#99491c' : '#15665f';
                ctx.strokeStyle = p.label ? '#99491c' : '#15665f';
                ctx.lineWidth = 1.5; ctx.fill(); ctx.stroke();
            }
        }
        ctx.strokeStyle = '#9faea8'; ctx.lineWidth = 1; ctx.strokeRect(left, top, width, size);
        ctx.fillStyle = '#526365'; ctx.font = '12px system-ui';
        ctx.textAlign = 'center';
        for (let i = 0; i <= 4; i++) {
            const x = xmin + (xmax - xmin) * i / 4, y = ymin + (ymax - ymin) * i / 4;
            ctx.fillText(x.toFixed(1), xx(x), top + size + 18);
            ctx.textAlign = 'right'; ctx.fillText(y.toFixed(1), left - 7, yy(y) + 4); ctx.textAlign = 'center';
        }
        ctx.fillText(t('Feature 1', 'Variable 1'), left + width / 2, 385);
        ctx.save(); ctx.translate(12, top + size / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(t('Feature 2', 'Variable 2'), 0, 0); ctx.restore();
        canvas.setAttribute('aria-label', t(`${name}: predicted class 0 in green and class 1 in orange. Circles are class 0; squares are class 1. Hollow markers are test observations.`, `${name}: clase predicha 0 en verde y clase 1 en naranja. Círculos para la clase 0 y cuadrados para la clase 1. Los marcadores vacíos son observaciones de prueba.`));
    }
    function run() {
        if (!$('ml-form').reportValidity()) return;
        $('train-models').disabled = true;
        $('model-grid').setAttribute('aria-busy', 'true');
        $('ml-status').textContent = t('Training four models…', 'Entrenando cuatro modelos…');
        // Let the busy status paint before the bounded computation.
        setTimeout(() => {
            try {
                const data = E.generate($('dataset').value, Number($('samples').value), Number($('noise').value), Number($('ml-seed').value));
                const all = [...data.train, ...data.test];
                const xs = all.map(p => p.x), ys = all.map(p => p.y);
                const domain = { xmin: Math.min(...xs) - 0.3, xmax: Math.max(...xs) + 0.3, ymin: Math.min(...ys) - 0.3, ymax: Math.max(...ys) + 0.3 };
                const parameters = { logistic: Number($('penalty').value), knn: Number($('neighbors').value), tree: Number($('depth').value) };
                for (const model of models) {
                    const predict = E[model.id](data.train, parameters[model.id]);
                    draw($(`plot-${model.id}`), predict, data, domain, model.name);
                    const scores = $(`score-${model.id}`); scores.replaceChildren();
                    for (const [label, rows] of [[t('Train', 'Entrenamiento'), data.train], [t('Test', 'Prueba'), data.test]]) {
                        const span = document.createElement('span'); span.textContent = `${label}: ${percent(E.accuracy(predict, rows))}`; scores.appendChild(span);
                    }
                }
                $('ml-status').textContent = t(`Ready · ${data.train.length} training / ${data.test.length} test observations · seed ${$('ml-seed').value}.`, `Listo · ${data.train.length} observaciones de entrenamiento / ${data.test.length} de prueba · semilla ${$('ml-seed').value}.`);
            } catch (error) {
                $('ml-status').textContent = t('The models could not be drawn. Please reload and try again.', 'No se pudieron dibujar los modelos. Recarga e intenta nuevamente.');
                console.error(error);
            } finally {
                $('train-models').disabled = false; $('model-grid').setAttribute('aria-busy', 'false');
            }
        }, 30);
    }
    $('ml-form').addEventListener('submit', event => { event.preventDefault(); run(); });
    $('ml-form').addEventListener('input', () => {
        $('ml-status').textContent = t('Settings changed. Train models to update the plots.', 'Parámetros modificados. Entrena los modelos para actualizar los gráficos.');
    });
    run();
});
