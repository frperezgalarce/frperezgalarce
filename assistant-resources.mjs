import { readingForFaq, recommendedFaqId } from './assistant-readings.mjs?v=math-resources-quiz3';

// Verified 2026-10-30 against the linked course/author pages and article records.
// YouTube is restricted to Ivy League teaching; papers are not institution-restricted.
const focus = (es, en) => ({ es, en });
const harvard = (title, video, week, guidance) => ({ title: `CS50 AI: ${title}`, authors: 'Brian Yu', publication: 'Harvard University · CS50, 2020', institution: 'Harvard University', type: 'video', access: 'free', language: 'en', url: `https://www.youtube.com/watch?v=${video}`, sourceUrl: `https://cs50.harvard.edu/ai/weeks/${week}/`, focus: guidance });
export const resourceCatalog = Object.freeze({
    search: harvard('Search', 'WbzNRTTrX0g', 0, focus('Observa cómo se exploran caminos y cómo las heurísticas orientan la búsqueda.', 'Watch how paths are explored and how heuristics guide search.')),
    optimization: harvard('Optimization', 'qK46ET1xk2A', 3, focus('Relaciona búsqueda local, programación lineal y satisfacción de restricciones con el laboratorio.', 'Connect local search, linear programming, and constraint satisfaction with the lab.')),
    learning: harvard('Learning', '-g0iJjnO2_w', 4, focus('Revisa clasificación, vecinos cercanos y evaluación fuera de los datos de entrenamiento.', 'Review classification, nearest neighbors, and evaluation beyond the training data.')),
    networks: harvard('Neural Networks', 'J1QD9hLDEDY', 5, focus('Observa cómo las capas y activaciones permiten fronteras no lineales.', 'Watch how layers and activations allow nonlinear decision boundaries.')),
    uncertainty: harvard('Uncertainty', 'D8RRq3TbtHU', 2, focus('Revisa probabilidad condicional, regla de Bayes y muestreo.', 'Review conditional probability, Bayes’ rule, and sampling.')),
    probability: { title: 'Probability — full course', authors: 'Santosh S. Venkatesh', publication: 'University of Pennsylvania', institution: 'University of Pennsylvania', type: 'video', access: 'free', language: 'en', url: 'https://www.youtube.com/playlist?list=PLhCDzMM3Yov0ZIaxcUlsHh2T9XmiVqgMi', sourceUrl: 'https://www.santoshvenkatesh.com/video-lectures', focus: focus('Empieza por la introducción y continúa con variables aleatorias y esperanza; se recomienda cálculo básico.', 'Start with the introduction, then random variables and expectation; basic calculus is recommended.') },
    convex: { title: 'Convex Optimization', authors: 'Stephen Boyd & Lieven Vandenberghe', publication: 'Cambridge University Press, 2004 · author-hosted book', type: 'book', access: 'open', url: 'https://web.stanford.edu/~boyd/cvxbook/', focus: focus('Consulta formulación de problemas, programación lineal y dualidad. El libro completo está disponible en la página de los autores.', 'Explore problem formulation, linear programming, and duality. The full book is available on the authors’ page.') },
    combinatorial: { title: 'Machine Learning for Combinatorial Optimization: a Methodological Tour d’Horizon', authors: 'Yoshua Bengio, Andrea Lodi & Antoine Prouvost', publication: 'arXiv:1811.06128 · manuscript, revised 2020', type: 'paper', access: 'open', archive: 'arXiv', url: 'https://arxiv.org/abs/1811.06128', focus: focus('Ampliación avanzada: conecta heurísticas y optimización combinatoria con aprendizaje automático; empieza por la introducción.', 'Advanced extension: connect heuristics and combinatorial optimization with machine learning; start with the introduction.') },
    validation: { title: 'A survey of cross-validation procedures for model selection', authors: 'Sylvain Arlot & Alain Celisse', publication: 'Statistics Surveys, 2010 · arXiv:0907.4728 manuscript', type: 'paper', access: 'open', archive: 'arXiv', url: 'https://arxiv.org/abs/0907.4728', focus: focus('Profundiza en evaluación y selección de modelos; distingue estimar el error de elegir hiperparámetros.', 'Go deeper into evaluation and model selection; distinguish estimating error from choosing hyperparameters.') },
    tuning: { title: 'Random Search for Hyper-Parameter Optimization', authors: 'James Bergstra & Yoshua Bengio', publication: 'Journal of Machine Learning Research, 13, 281–305, 2012', type: 'paper', access: 'open', url: 'https://jmlr.org/papers/v13/bergstra12a.html', focus: focus('Compara búsqueda aleatoria y grillas con un presupuesto limitado de experimentos.', 'Compare random search and grids under a limited experiment budget.') },
    interpretation: { title: 'The Mythos of Model Interpretability', authors: 'Zachary C. Lipton', publication: 'arXiv:1606.03490 · manuscript, revised 2017', type: 'paper', access: 'open', archive: 'arXiv', url: 'https://arxiv.org/abs/1606.03490', focus: focus('Distingue transparencia, explicaciones posteriores y lo que una explicación permite concluir.', 'Distinguish transparency, post-hoc explanations, and what an explanation lets you conclude.') },
    fairnessOpen: { title: 'Equality of Opportunity in Supervised Learning', authors: 'Moritz Hardt, Eric Price & Nathan Srebro', publication: 'NeurIPS, 2016 · arXiv:1610.02413 manuscript', type: 'paper', access: 'open', archive: 'arXiv', url: 'https://arxiv.org/abs/1610.02413', focus: focus('Lee la versión abierta y compara igualdad de oportunidades con igualdad de odds.', 'Read the open manuscript and compare equality of opportunity with equalized odds.') },
    montecarlo: { title: 'Introduction to Monte Carlo Methods', authors: 'Helmut G. Katzgraber', publication: 'arXiv:0905.1629 · lecture manuscript, revised 2011', type: 'paper', access: 'open', archive: 'arXiv', url: 'https://arxiv.org/abs/0905.1629', focus: focus('Ampliación avanzada con ejemplos de física: muestreo, cadenas de Markov y supuestos de una simulación.', 'Advanced extension using physics examples: sampling, Markov chains, and simulation assumptions.') },
    features: { title: 'An Introduction to Variable and Feature Selection', authors: 'Isabelle Guyon & André Elisseeff', publication: 'Journal of Machine Learning Research, 3, 1157–1182, 2003', type: 'paper', access: 'open', url: 'https://jmlr.org/papers/v3/guyon03a.html', focus: focus('Explora cómo elegir y representar características influye en la predicción y la evaluación.', 'Explore how selecting and representing features affects prediction and evaluation.') }
});

// Small, stable sets: one reference reading, one Ivy League video, one open resource.
const extras = {
    or: {
        model: ['optimization', 'convex'], variable: ['optimization', 'convex'], objective: ['optimization', 'convex'], constraint: ['optimization', 'convex'], linear: ['optimization', 'convex'],
        integer: ['optimization', 'combinatorial'], feasible: ['optimization', 'convex'], infeasible: ['optimization', 'convex'], unbounded: ['optimization', 'convex'],
        heuristic: ['optimization', 'combinatorial'], gap: ['optimization', 'combinatorial'], tsp: ['search', 'combinatorial'], nearest: ['search', 'combinatorial'], twoopt: ['optimization', 'combinatorial'], path: ['search', 'combinatorial'],
        nurses: ['optimization', 'combinatorial'], coverage: ['optimization', 'combinatorial'], seed: ['probability', 'montecarlo'], sensitivity: ['optimization', 'convex'], simulation: ['probability', 'montecarlo']
    },
    ml: {
        supervised: ['learning', 'validation'], split: ['learning', 'validation'], overfit: ['learning', 'validation'], underfit: ['learning', 'validation'], logistic: ['learning', 'validation'], knn: ['learning', 'features'], tree: ['learning', 'interpretation'], bayes: ['uncertainty', 'validation'],
        accuracy: ['learning', 'validation'], precision: ['learning', 'validation'], cv: ['learning', 'validation'], leakage: ['learning', 'validation'], scaling: ['learning', 'features'], regularization: ['learning', 'validation'], boundary: ['learning', 'validation'], noise: ['probability', 'validation'], xor: ['networks', 'features'], tuning: ['learning', 'tuning'], explain: ['learning', 'interpretation'], fairness: ['learning', 'fairnessOpen']
    }
};

export function resourcesForFaq(topic, faqId) {
    const selected = Object.hasOwn(extras, topic) && Object.hasOwn(extras[topic], faqId) ? extras[topic][faqId] : topic === 'or' ? extras.or.model : extras.ml.supervised;
    const primary = readingForFaq(topic, faqId);
    // The open manuscript replaces the same fairness paper's proceedings entry.
    if (primary.id === 'fairness') return [selected[1], selected[0]].map(id => ({ id, ...resourceCatalog[id] }));
    return [primary, ...selected.map(id => ({ id, ...resourceCatalog[id] }))];
}

export function recommendedResources(topic, question, history = [], language = 'es') {
    return resourcesForFaq(topic, recommendedFaqId(topic, question, history, language));
}
