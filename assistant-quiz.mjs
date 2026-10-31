import { knowledge } from './assistant-knowledge.mjs';
import { recommendedFaqId } from './assistant-readings.mjs?v=math-resources-quiz3';

// Each statement is checked against its FAQ. Explanations reuse that reviewed text.
const statement = (answer, es, en) => ({ answer, statement: { es, en } });
export const quizBank = {
    or: {
        model: statement(true, 'Un modelo de optimización define variables, objetivo y restricciones.', 'An optimization model defines variables, an objective, and constraints.'),
        variable: statement(false, 'Una variable de decisión siempre debe ser continua.', 'A decision variable must always be continuous.'),
        objective: statement(true, 'El objetivo puede minimizar un costo o maximizar un beneficio.', 'An objective can minimize cost or maximize profit.'),
        constraint: statement(false, 'Una solución factible puede ignorar una restricción si mejora el objetivo.', 'A feasible solution may ignore a constraint if that improves the objective.'),
        linear: statement(false, 'El producto de dos variables de decisión, xy, es una expresión lineal.', 'The product of two decision variables, xy, is a linear expression.'),
        integer: statement(false, 'Redondear una solución continua siempre produce una solución entera factible.', 'Rounding a continuous solution always produces a feasible integer solution.'),
        feasible: statement(false, 'Toda solución factible también es óptima.', 'Every feasible solution is also optimal.'),
        infeasible: statement(true, 'Un modelo es infactible si ninguna solución cumple todas sus restricciones simultáneamente.', 'A model is infeasible if no solution satisfies all its constraints simultaneously.'),
        unbounded: statement(false, 'Una región factible no acotada implica siempre un objetivo no acotado.', 'An unbounded feasible region always implies an unbounded objective.'),
        heuristic: statement(false, 'Una heurística siempre certifica el óptimo global.', 'A heuristic always certifies the global optimum.'),
        gap: statement(true, 'La brecha de optimalidad compara una solución factible con una cota del óptimo.', 'The optimality gap compares a feasible objective value with a bound on the optimum.'),
        tsp: statement(true, 'En el problema del viajante, el recorrido regresa a la ciudad inicial.', 'In the traveling salesman problem, the tour returns to the starting city.'),
        nearest: statement(false, 'Elegir siempre la ciudad no visitada más cercana garantiza el mejor recorrido global.', 'Always choosing the nearest unvisited city guarantees the best overall tour.'),
        twoopt: statement(false, 'Si 2-opt ya no encuentra mejoras, el recorrido debe ser globalmente óptimo.', 'If 2-opt finds no further improvements, the tour must be globally optimal.'),
        path: statement(true, 'Dijkstra requiere costos de aristas no negativos.', 'Dijkstra requires nonnegative edge costs.'),
        nurses: statement(true, 'El laboratorio de turnos prioriza reducir puestos sin cubrir antes que equilibrar cargas.', 'The scheduling lab prioritizes reducing uncovered positions before balancing workloads.'),
        coverage: statement(false, 'Los turnos sin cubrir en el resultado de la heurística prueban que no existe una asignación completa.', 'Uncovered shifts in the heuristic result prove that no complete assignment exists.'),
        seed: statement(true, 'La misma semilla y los mismos parámetros permiten reproducir la instancia del laboratorio.', 'The same seed and parameters reproduce the lab instance.'),
        sensitivity: statement(false, 'Los precios sombra de programación lineal se aplican automáticamente a modelos enteros.', 'Linear-programming shadow prices automatically apply to integer models.'),
        simulation: statement(false, 'Simulación y optimización son lo mismo: ambas eligen necesariamente la mejor decisión.', 'Simulation and optimization are identical: both necessarily choose the best decision.')
    },
    ml: {
        supervised: statement(true, 'El aprendizaje supervisado utiliza ejemplos con una etiqueta o respuesta observada.', 'Supervised learning uses examples with an observed label or target.'),
        split: statement(false, 'Evaluar únicamente con datos usados para ajustar el modelo mide de forma independiente su generalización.', 'Evaluating only on data used to fit a model independently measures its generalization.'),
        overfit: statement(false, 'Una exactitud de entrenamiento alta garantiza buen desempeño en datos nuevos.', 'High training accuracy guarantees good performance on new data.'),
        underfit: statement(true, 'Un modelo con poca flexibilidad puede fallar incluso al capturar patrones del entrenamiento.', 'An insufficiently flexible model can fail to capture even the training patterns.'),
        logistic: statement(true, 'La regresión logística puede modelar una probabilidad para clasificar.', 'Logistic regression can model a probability for classification.'),
        knn: statement(false, 'En este laboratorio, kNN decide usando exclusivamente el ejemplo de entrenamiento más lejano.', 'In this lab, kNN decides using only the farthest training example.'),
        tree: statement(true, 'Aumentar la profundidad de un árbol puede aumentar el sobreajuste.', 'Increasing tree depth can increase overfitting.'),
        bayes: statement(true, 'Naive Bayes supone independencia condicional de las características dada la clase.', 'Naive Bayes assumes features are conditionally independent given the class.'),
        accuracy: statement(false, 'La exactitud global siempre revela el mal desempeño en clases minoritarias.', 'Overall accuracy always reveals poor performance on minority classes.'),
        precision: statement(false, 'El denominador de precisión es el número de positivos reales.', 'The denominator of precision is the number of actual positives.'),
        cv: statement(true, 'En validación cruzada, el preprocesamiento debe ajustarse dentro de cada partición de entrenamiento.', 'In cross-validation, preprocessing must be fitted within each training fold.'),
        leakage: statement(true, 'Ajustar el escalador usando datos de prueba puede introducir fuga de información.', 'Fitting a scaler using test data can introduce data leakage.'),
        scaling: statement(false, 'La escala de las características no afecta las distancias en kNN.', 'Feature scales do not affect distances in kNN.'),
        regularization: statement(true, 'Una regularización L2 demasiado fuerte puede causar subajuste.', 'Excessively strong L2 regularization can cause underfitting.'),
        boundary: statement(false, 'El fondo de los gráficos del laboratorio muestra regiones de confianza.', 'The lab plot background shows confidence regions.'),
        noise: statement(true, 'Un modelo flexible puede ajustarse al ruido del entrenamiento.', 'A flexible model can fit training noise.'),
        xor: statement(false, 'Una sola recta en las dos características originales separa perfectamente XOR.', 'A single line in the two original features perfectly separates XOR.'),
        tuning: statement(false, 'Elegir repetidamente parámetros según la prueba conserva una evaluación final independiente.', 'Repeatedly selecting parameters using test results preserves an independent final evaluation.'),
        explain: statement(false, 'Explicar qué variables usa un modelo demuestra el efecto de intervenir sobre ellas.', 'Explaining which variables a model uses proves the effect of intervening on them.'),
        fairness: statement(false, 'Una exactitud alta garantiza que un modelo sea justo para todos los grupos.', 'High accuracy guarantees that a model is fair for every group.')
    }
};

const groups = {
    or: [
        ['model', 'variable', 'objective', 'constraint', 'linear'],
        ['integer', 'feasible', 'infeasible', 'unbounded', 'gap'],
        ['tsp', 'nearest', 'twoopt', 'path', 'heuristic'],
        ['nurses', 'coverage', 'seed', 'sensitivity', 'simulation']
    ],
    ml: [
        ['supervised', 'overfit', 'underfit', 'regularization', 'noise'],
        ['logistic', 'knn', 'tree', 'bayes', 'scaling', 'boundary', 'xor'],
        ['split', 'cv', 'leakage', 'tuning', 'accuracy', 'precision'],
        ['explain', 'fairness', 'accuracy', 'precision', 'bayes']
    ]
};

export function quizForFaq(topic, faqId) {
    if (!Object.hasOwn(quizBank, topic)) return [];
    const group = groups[topic].find(ids => ids.includes(faqId)) || groups[topic][0];
    const selected = [...new Set([...(Object.hasOwn(quizBank[topic], faqId) ? [faqId] : []), ...group])].slice(0, 5);
    return selected.map(id => {
        const faq = knowledge[topic].find(item => item.id === id);
        return { id, ...quizBank[topic][id], explanation: { es: faq.es.a, en: faq.en.a } };
    });
}

export function recommendedQuiz(topic, question, history = [], language = 'es') {
    return quizForFaq(topic, recommendedFaqId(topic, question, history, language));
}

export function gradeQuiz(questions, answers) {
    if (questions.length !== 5 || answers.length !== 5 || answers.some(answer => typeof answer !== 'boolean')) return null;
    const correct = questions.map((question, index) => question.answer === answers[index]);
    return { correct, score: correct.filter(Boolean).length, total: 5 };
}
