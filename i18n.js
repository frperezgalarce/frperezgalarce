(function () {
    const requestedLanguage = new URLSearchParams(window.location.search).get('lang');
    let savedLanguage;
    try { savedLanguage = localStorage.getItem('site-language'); } catch (_) { /* Language links work without storage. */ }
    const language = requestedLanguage === 'es' || requestedLanguage === 'en' ? requestedLanguage : (savedLanguage === 'en' || savedLanguage === 'es' ? savedLanguage : 'es');
    window.siteLanguage = language;
    document.documentElement.lang = language;
    try { localStorage.setItem('site-language', language); } catch (_) { /* Storage is optional. */ }

    document.addEventListener('DOMContentLoaded', function () {
        addLanguageSwitch();
        if (language !== 'es') return;

        translateCommon();
        translateExactText();
        translateExperience();
        translateProjects();
        translateTeaching();
        translateResearch();
        // Contact content uses explicit bilingual labels in site.js.
        document.title = document.title
            .replace('Home', 'Inicio')
            .replace('Experience', 'Experiencia')
            .replace('Projects', 'Proyectos')
            .replace('Teaching', 'Docencia')
            .replace('Research', 'Investigación')
            .replace('Current Project', 'Proyecto Actual')
            .replace('Technology Transfer', 'Transferencia Tecnológica')
            .replace('Links', 'Contacto');
    });

    function addLanguageSwitch() {
        const switcher = document.createElement('div');
        switcher.className = 'language-switcher';
        switcher.setAttribute('aria-label', language === 'es' ? 'Seleccionar idioma' : 'Select language');
        const page = window.location.pathname.split('/').pop() || 'index.html';
        switcher.innerHTML = `<a href="${page}?lang=en${window.location.hash}" lang="en"${language === 'en' ? ' aria-current="true"' : ''}>EN</a><span aria-hidden="true">/</span><a href="${page}?lang=es${window.location.hash}" lang="es"${language === 'es' ? ' aria-current="true"' : ''}>ES</a>`;
        (document.getElementById('language-slot') || document.body).appendChild(switcher);
    }

    function translateCommon() {
        const nav = {
            'index.html': 'Inicio',
            'experience.html': 'Trayectoria',
            'projects.html': 'Proyectos aplicados',
            'teaching.html': 'Docencia',
            'research.html': 'Investigación',
            'current-project.html': 'Proyecto actual',
            'technology-transfer.html': 'Transferencia tecnológica',
            'links.html': 'Contacto'
        };
        document.querySelectorAll('nav a').forEach(link => {
            const path = link.getAttribute('href');
            if (nav[path]) link.textContent = nav[path];
            link.href = `${path}?lang=es`;
        });
        const headerSubtitle = document.querySelector('header > p');
        if (headerSubtitle) headerSubtitle.textContent = 'Científico de Datos | Investigador';
        document.querySelectorAll('footer p').forEach(p => p.textContent = p.textContent.replace('All rights reserved.', 'Todos los derechos reservados.'));
    }

    function translateExactText() {
        const translations = new Map(Object.entries({
            'Current research project': 'Proyecto de investigación actual',
            'Fair and interpretable survival models for kidney transplantation': 'Modelos de supervivencia justos e interpretables para el trasplante renal',
            'Developing machine-learning methods that account for competing risks while improving predictive performance, transparency, and fairness in clinical transplant decisions.': 'Desarrollo de métodos de aprendizaje automático que consideran riesgos competitivos y mejoran el desempeño predictivo, la transparencia y la equidad en decisiones clínicas de trasplante.',
            'Survival analysis': 'Análisis de supervivencia',
            'Competing risks': 'Riesgos competitivos',
            'Machine learning': 'Aprendizaje automático',
            'Health equity': 'Equidad en salud',
            'Clinical focus': 'Foco clínico',
            'Kidney transplantation': 'Trasplante renal',
            'Decision support for deceased-donor waiting lists and living-donor kidney exchange programs.': 'Apoyo a decisiones en listas de espera de donante fallecido y programas de intercambio renal con donantes vivos.',
            'The challenge': 'El desafío',
            'Better predictions must also be explainable and fair': 'Mejores predicciones también deben ser explicables y justas',
            'Conventional survival models are valuable in health research but may be limited by linearity, proportional-hazards assumptions, and single-outcome formulations. In transplantation, competing events such as patient death and graft failure require models that represent clinical reality more faithfully.': 'Los modelos de supervivencia convencionales son valiosos en investigación en salud, pero pueden estar limitados por la linealidad, los supuestos de riesgos proporcionales y las formulaciones de un único resultado. En trasplantes, eventos competitivos como la muerte del paciente y la falla del injerto requieren modelos que representen mejor la realidad clínica.',
            'Flexible machine-learning approaches can capture complex patterns, but their black-box behavior and susceptibility to bias can limit clinical adoption. This project addresses those tensions together rather than treating accuracy, interpretability, and fairness as separate objectives.': 'Los enfoques flexibles de aprendizaje automático pueden capturar patrones complejos, pero su comportamiento de caja negra y su susceptibilidad al sesgo pueden limitar la adopción clínica. Este proyecto aborda estas tensiones de forma integrada, en lugar de tratar la precisión, la interpretabilidad y la equidad como objetivos separados.',
            'Core objective': 'Objetivo central',
            'Create survival models that support consequential decisions': 'Crear modelos de supervivencia que apoyen decisiones de alto impacto',
            'The project develops and evaluates new survival-analysis methods for competing risks, combining mathematical programming and deep learning to improve discrimination, calibration, explainability, and fairness.': 'El proyecto desarrolla y evalúa nuevos métodos de análisis de supervivencia para riesgos competitivos, combinando programación matemática y aprendizaje profundo para mejorar la discriminación, calibración, explicabilidad y equidad.',
            'Research pathway': 'Ruta de investigación',
            'From model formulation to clinical utility': 'De la formulación del modelo a la utilidad clínica',
            'Two complementary modelling tracks converge in real-world decision simulations.': 'Dos líneas complementarias de modelamiento convergen en simulaciones de decisiones reales.',
            'Mathematical programming': 'Programación matemática',
            'Extend optimal survival trees and survival support vector machines to competing risks, with objective functions and constraints that explicitly address fairness.': 'Extender árboles óptimos de supervivencia y máquinas de vectores de soporte de supervivencia a riesgos competitivos, con funciones objetivo y restricciones que aborden explícitamente la equidad.',
            'Optimal survival trees': 'Árboles óptimos de supervivencia',
            'Survival SVM formulations': 'Formulaciones SVM de supervivencia',
            'Fairness-aware constraints': 'Restricciones sensibles a la equidad',
            'Deep survival learning': 'Aprendizaje profundo de supervivencia',
            'Develop architectures inspired by DeepSurv and DeepHit, using specialized learning strategies to represent competing outcomes and mitigate bias.': 'Desarrollar arquitecturas inspiradas en DeepSurv y DeepHit, usando estrategias especializadas de aprendizaje para representar resultados competitivos y mitigar sesgos.',
            'Curriculum learning': 'Aprendizaje curricular',
            'Dual and multi-task learning': 'Aprendizaje dual y multitarea',
            'Custom fairness objectives': 'Objetivos de equidad personalizados',
            'Explainability': 'Explicabilidad',
            'Investigate how specific donor, recipient, and compatibility variables influence predictions through complementary explanation techniques.': 'Investigar cómo variables específicas del donante, receptor y compatibilidad influyen en las predicciones mediante técnicas complementarias de explicación.',
            'Counterfactual explanations': 'Explicaciones contrafactuales',
            'Layer-wise relevance propagation': 'Propagación de relevancia por capas',
            'Local model-agnostic methods': 'Métodos locales agnósticos al modelo',
            'Data and validation': 'Datos y validación',
            'Testing with the UNOS transplantation database': 'Validación con la base de datos de trasplantes UNOS',
            'Models will use pre-transplant information about donors, recipients, and compatibility, including human leukocyte antigen compatibility. Evaluation extends beyond predictive metrics to simulation frameworks that emulate allocation systems.': 'Los modelos usarán información pretrasplante de donantes, receptores y compatibilidad, incluida la compatibilidad de antígenos leucocitarios humanos. La evaluación irá más allá de las métricas predictivas mediante marcos de simulación que emulan sistemas de asignación.',
            'Priority decision settings': 'Contextos prioritarios de decisión',
            'Transplant waiting lists': 'Listas de espera de trasplante',
            'Supporting prioritization policies for deceased-donor kidneys.': 'Apoyo a políticas de priorización de riñones de donantes fallecidos.',
            'Kidney exchange programs': 'Programas de intercambio renal',
            'Improving allocation decisions for compatible living-donor exchanges.': 'Mejora de decisiones de asignación en intercambios compatibles de donantes vivos.',
            'Expected contribution': 'Contribución esperada',
            'Evidence for responsible deployment': 'Evidencia para una implementación responsable',
            'By evaluating predictive performance and downstream allocation outcomes together, the project aims to produce decision-support tools with demonstrable clinical utility and policy relevance - while reducing bias and making model behavior easier to understand.': 'Al evaluar conjuntamente el desempeño predictivo y los resultados posteriores de asignación, el proyecto busca producir herramientas de apoyo a decisiones con utilidad clínica y relevancia para políticas, reduciendo sesgos y facilitando la comprensión del comportamiento del modelo.',
            'Research into practice': 'De la investigación a la práctica',
            'From analytical models to working decision tools': 'De modelos analíticos a herramientas de decisión operativas',
            'Advanced analytics creates value when rigorous methods become usable products. These examples show how predictive and optimization research can be transferred into tools that support operational and policy decisions.': 'La analítica avanzada crea valor cuando los métodos rigurosos se convierten en productos utilizables. Estos ejemplos muestran cómo la investigación predictiva y de optimización puede transferirse a herramientas que apoyan decisiones operacionales y de política.',
            'Product examples': 'Ejemplos de productos',
            'Two complementary technology families': 'Dos familias tecnológicas complementarias',
            'Predictive analytics': 'Analítica predictiva',
            'Predictive Intelligence Platform': 'Plataforma de inteligencia predictiva',
            'A configurable product for estimating risk, forecasting demand, and identifying early-warning signals from operational and historical data.': 'Un producto configurable para estimar riesgos, pronosticar demanda e identificar señales de alerta temprana a partir de datos operacionales e históricos.',
            'Transfer output': 'Resultado de transferencia',
            'Model service + monitoring dashboard': 'Servicio de modelos + panel de monitoreo',
            'Core capabilities': 'Capacidades centrales',
            'Application examples': 'Ejemplos de aplicación',
            'Classification, forecasting, and time-to-event prediction': 'Clasificación, pronóstico y predicción de tiempo hasta un evento',
            'Uncertainty, calibration, and data-shift assessment': 'Evaluación de incertidumbre, calibración y cambio de distribución',
            'Fairness diagnostics and explainable predictions': 'Diagnósticos de equidad y predicciones explicables',
            'Model monitoring and periodic retraining workflows': 'Monitoreo de modelos y flujos de reentrenamiento periódico',
            'Patient and graft survival after transplantation': 'Supervivencia del paciente y del injerto tras el trasplante',
            'Emergency-unit severity and length-of-stay forecasting': 'Pronóstico de gravedad y duración de estadía en urgencias',
            'Customer churn and energy-demand prediction': 'Predicción de fuga de clientes y demanda energética',
            'Agricultural disease and production early-warning systems': 'Sistemas de alerta temprana de enfermedades y producción agrícola',
            'Optimization models': 'Modelos de optimización',
            'Optimization Decision Engine': 'Motor de decisiones de optimización',
            'A scenario-based decision-support product that recommends allocations, schedules, routes, or team configurations under operational constraints and uncertainty.': 'Un producto de apoyo a decisiones basado en escenarios que recomienda asignaciones, programas, rutas o configuraciones de equipos bajo restricciones operacionales e incertidumbre.',
            'Optimization API + scenario workspace': 'API de optimización + espacio de escenarios',
            'Resource allocation and scheduling': 'Asignación de recursos y programación',
            'Network design, routing, and facility location': 'Diseño de redes, ruteo y localización de instalaciones',
            'Multi-objective and fairness-aware optimization': 'Optimización multiobjetivo sensible a la equidad',
            'Robust planning under uncertain conditions': 'Planificación robusta bajo incertidumbre',
            'Kidney exchange and health-resource allocation': 'Intercambio renal y asignación de recursos sanitarios',
            'Collaborative learning team formation in schools': 'Formación de equipos de aprendizaje colaborativo en escuelas',
            'Vaccination-center and emergency-shelter planning': 'Planificación de centros de vacunación y refugios de emergencia',
            'Agricultural harvest and warehouse operations': 'Operaciones de cosecha agrícola y almacenamiento',
            'Transfer pathway': 'Ruta de transferencia',
            'A practical route from problem to pilot': 'Una ruta práctica desde el problema hasta el piloto',
            'Frame the decision': 'Definir la decisión',
            'Define the operational problem, users, constraints, and success criteria.': 'Definir el problema operacional, los usuarios, las restricciones y los criterios de éxito.',
            'Assess data readiness': 'Evaluar la preparación de los datos',
            'Evaluate available data, quality, governance, bias, and integration needs.': 'Evaluar los datos disponibles, su calidad, gobernanza, sesgos y necesidades de integración.',
            'Build and validate': 'Construir y validar',
            'Develop a reproducible prototype and compare it with current practice.': 'Desarrollar un prototipo reproducible y compararlo con la práctica actual.',
            'Pilot in context': 'Pilotear en contexto',
            'Integrate the tool into a real workflow, monitor outcomes, and prepare scaling.': 'Integrar la herramienta en un flujo real, monitorear resultados y preparar su escalamiento.',
            'Possible deliverables': 'Entregables posibles',
            'Designed for adoption': 'Diseñado para la adopción',
            'Proof of concept': 'Prueba de concepto',
            'Decision-support web application': 'Aplicación web de apoyo a decisiones',
            'Model or optimization API': 'API de modelos u optimización',
            'Reproducible analytical package': 'Paquete analítico reproducible',
            'Documentation and training': 'Documentación y capacitación',
            'Impact-evaluation framework': 'Marco de evaluación de impacto',
            'Collaboration': 'Colaboración',
            'Have a decision problem worth translating?': '¿Tiene un problema de decisión que valga la pena transformar?',
            'I am interested in collaborations where advanced analytics can move from a research result to a tested, useful technology.': 'Me interesan colaboraciones donde la analítica avanzada pueda avanzar desde un resultado de investigación hasta una tecnología útil y validada.',
            'Discuss a technology-transfer opportunity': 'Conversemos sobre una oportunidad de transferencia tecnológica'
        }));
        walkText(document.body, text => translations.get(text) || text);
    }

    function translateExperience() {
        if (!document.body.classList.contains('experience-page')) return;
        setText('.section-eyebrow', 'Trayectoria profesional');
        setText('.text-page-intro h1', 'Trayectoria');
        setText('.text-page-intro > p:last-child', 'Investigación académica, ciencia de datos aplicada y liderazgo analítico en salud, astronomía, educación, energía y agroindustria.');
        const titles = [
            'Profesor Asistente. Facultad de Ingeniería y Negocios. Universidad de Las Américas (marzo de 2025 - presente)',
            'Investigador - Universidad Adolfo Ibáñez (marzo de 2024 - febrero de 2025)',
            'Pasante remoto - Bay Area Environmental Research Institute (agosto de 2023 - diciembre de 2023)',
            'Jefe de Analítica Avanzada - Brave Up (2022 - junio de 2024)',
            'Científico de Datos Senior - Brave Up (enero de 2022 - 2024)',
            'Científico de Datos - Lipigas Empresas (2020 - 2021)',
            'Investigación doctoral - Departamento de Ciencia de la Computación, PUC Chile',
            'Ingeniero de I+D - CEAP (2014 - 2016)',
            'Ingeniero de Proyecto - CCMaule, Facultad de Economía, Universidad de Talca (2013 - 2014)'
        ];
        const descriptions = [
            'Integro el cuerpo académico central del Magíster en Ciencia de Datos y miembro de la Unidad de Investigación en Ciencia de Datos. También he contribuido a procesos de acreditación académica y actualmente dicto cursos de pregrado y posgrado en aprendizaje automático e investigación de operaciones.',
            'Diseñé e implementé modelos de supervivencia para trasplantes renales, incluidos modelos de Cox, riesgos competitivos, árboles de supervivencia y aprendizaje profundo. Colaboré con equipos internacionales para mejorar las políticas de programas de intercambio renal.',
            'Participé en una pasantía remota de 18 semanas en NASA Ames bajo la supervisión del Dr. Jorge Martinez Palomera. Trabajé en el problema de cambio de distribución en astronomía mediante una estrategia de entrenamiento que integra muestras sintéticas de modelos generativos profundos.',
            'Lideré el equipo de analítica de una iniciativa contra el acoso escolar. Desarrollé estrategias para identificar y prevenir situaciones de bullying y ciberbullying, facilitando intervenciones proactivas y entornos escolares más inclusivos.',
            'Desarrollé herramientas basadas en análisis de redes sociales, aprendizaje automático y optimización para detectar patrones en interacciones sociales y apoyar iniciativas contra el acoso escolar.',
            'Diseñé e implementé soluciones de aprendizaje automático con datos a gran escala para deserción de clientes y pronóstico de demanda, fortaleciendo la toma de decisiones empresariales.',
            'Desarrollé y evalué modelos de aprendizaje automático capaces de adaptarse a nuevos entornos y distribuciones cambiantes, integrando modelamiento probabilístico y conocimiento experto.',
            'Lideré proyectos de I+D para organizaciones agroindustriales, desarrollando modelos de planificación de producción y cosecha, gestión de bodegas y predicción del impacto de plagas.',
            'Apoyé la toma de decisiones regional mediante la recopilación y difusión de información en informes técnicos, presentaciones y reuniones con actores clave.'
        ];
        document.querySelectorAll('.experience-timeline > li').forEach((item, index) => {
            if (titles[index]) item.querySelector('strong').textContent = titles[index];
            if (descriptions[index]) item.querySelector('p').textContent = descriptions[index];
        });
    }

    function translateProjects() {
        if (!document.body.classList.contains('projects-page')) return;
        setText('.section-eyebrow', 'Trabajo seleccionado');
        setText('.text-page-intro h1', 'Investigación y proyectos aplicados');
        setText('.text-page-intro > p:last-child', 'Iniciativas de investigación y aplicación donde el aprendizaje automático, la optimización y la analítica apoyan decisiones en contextos complejos.');
        const titles = [
            'Aprendizaje automático justo y explicable para predecir supervivencia en trasplante renal (2026-2029)',
            'Mejora de efectividad y equidad en programas de intercambio renal (2024)',
            'Generador de equipos para la cohesión escolar (2022)',
            'Pipeline de aprendizaje automático para clasificar estrellas variables (2018-2022)',
            'Sistema de alerta temprana para la industria chilena de pasta de tomate (2014-2016)',
            'Sistema web de apoyo a decisiones de optimización para plantas procesadoras de alimentos del Maule (2014-2016)',
            'Una clase de problemas de optimización combinatoria robusta (2012-2013)'
        ];
        const descriptions = [
            'Como investigador principal, desarrollo modelos de supervivencia justos, interpretables y precisos para trasplante renal. El proyecto aborda riesgos competitivos y evalúa árboles óptimos de supervivencia, SVM de supervivencia y arquitecturas profundas con datos UNOS.',
            'Como asistente de investigación, participé en el diseño e implementación de modelos de supervivencia para trasplantes renales.',
            'Lideré el desarrollo de un generador de equipos financiado por CORFO para mejorar la cohesión escolar, optimizando la composición de grupos a partir de métricas sociales y académicas.',
            'Desarrollé un pipeline para clasificar estrellas variables, diseñado principalmente para enfrentar cambios de distribución en observaciones astronómicas.',
            'Colaboré en un sistema de alerta temprana financiado por FIA para controlar Alternaria alternata mediante tecnologías no destructivas y reducir pérdidas en la industria.',
            'Dirigí el desarrollo de un sistema web de optimización financiado por GORE Maule para planificar operaciones en plantas procesadoras de alimentos.',
            'Investigué problemas de camino y árbol de mínimo arrepentimiento e interdicción de caminos, buscando soluciones robustas bajo incertidumbre.'
        ];
        document.querySelectorAll('.project-card-grid > li').forEach((item, index) => {
            if (titles[index]) item.querySelector('strong').textContent = titles[index];
            if (descriptions[index]) item.querySelector('p').textContent = descriptions[index];
        });
    }

    function translateTeaching() {
        if (!document.body.classList.contains('teaching-page')) return;
        setText('.section-eyebrow', 'Docencia y mentoría');
        setText('.text-page-intro h1', 'Docencia');
        setText('.text-page-intro > p:last-child', 'Me apasiona enseñar y compartir conocimiento. Mi enfoque busca hacer accesibles y prácticos los conceptos complejos para que los estudiantes puedan aplicarlos en situaciones reales.');
        const headings = ['Profesor Asistente', 'Profesor Adjunto', 'Supervisión'];
        document.querySelectorAll('#teaching > h3').forEach((heading, index) => {
            const number = heading.querySelector('span');
            heading.lastChild.textContent = ` ${headings[index]}`;
            if (number) heading.prepend(number);
        });
        const courses = [
            "Aprendizaje Automático I. Facultad de Ingeniería y Negocios. Universidad de Las Américas.",
            "Aprendizaje Automático II. Magíster en Ciencia de Datos. Facultad de Ingeniería y Negocios. Universidad de Las Américas.",
            "Investigación de Operaciones. Escuela de Ingeniería. Facultad de Ingeniería y Negocios. Universidad de Las Américas.",
            "Gestión de Operaciones. Escuela de Ingeniería. Facultad de Ingeniería y Negocios. Universidad de Las Américas.",
            "Estadística y Probabilidad. IMFE. Facultad de Ingeniería y Negocios. Universidad de Las Américas.",
            "Inteligencia Artificial y Ciencia de Datos con Python. Educación Profesional UC, Facultad de Ingeniería, Pontificia Universidad Católica de Chile.",
            "Python para Machine Learning (en línea). Educación Profesional UC, Facultad de Ingeniería, Pontificia Universidad Católica de Chile.",
            "Inteligencia Artificial. Facultad de Ingeniería, Universidad Santo Tomás.",
            "Modelos Deterministas. Facultad de Ingeniería, Universidad Santo Tomás.",
            "Procesos Estocásticos y Simulación. Facultad de Ingeniería, Universidad Santo Tomás.",
            "Resolución de Modelos de Gran Escala en Investigación de Operaciones. Facultad de Ingeniería, Universidad de Talca.",
            "Métodos de Optimización. Facultad de Economía, Universidad de Talca.",
            "Operaciones y Logística. Facultad de Economía, Universidad de Talca.",
            "Simulación de Procesos de Negocio. Facultad de Ingeniería, Universidad Autónoma de Chile.",
            "Proyecto de Título. Facultad de Ingeniería, Universidad de Talca.",
            "Enrique Esis Sulbarán, Magíster en Ciencia de Datos, Universidad de Las Américas (cosupervisión con R. Coronado). Predicción de cortes de energía en la Región Metropolitana mediante modelos de series de tiempo y Machine Learning para apoyar la planificación de cuadrillas.",
            "Jorge Cáceres Barrales, Magíster en Ciencia de Datos, Universidad de Las Américas (cosupervisión con C. Pieringer). Estimación de la propensión de clientes a aceptar aumentos del límite de sus tarjetas de crédito mediante modelos de Machine Learning.",
            "Daniela Fuentealba Dote, Ingeniería Industrial, Universidad de Talca. Estudio de pérdidas en el sistema de refrigeración de COEXCA S.A.",
            "Marcelo Aguilera, Ingeniería Industrial, Universidad de Talca. Plan de implementación de TPM para aumentar la disponibilidad de equipos mediante manufactura esbelta en Codelco Chile, División El Teniente.",
            "Cristian Catalán, Ingeniería Industrial, Universidad de Talca. Aplicación de herramientas de manufactura esbelta para aumentar el tiempo efectivo en obras civiles de desarrollos mineros en Codelco Chile, División El Teniente.",
            "David Revillot, tesis de Magíster en Gestión de Operaciones, Universidad de Talca (cosupervisión con E. Álvarez-Miranda). Modelos y algoritmos para la gestión de almacenamiento de congelados.",
            "Celso Herrera, tesis de Magíster en Gestión de Operaciones, Universidad de Talca (cosupervisión con A. Candia-Véjar). Optimización de la planificación de cosecha en la producción de aceite de oliva."
];
        document.querySelectorAll('#teaching > ul > li').forEach((item, index) => {
            if (!courses[index]) return;
            const date = item.querySelector('strong');
            item.replaceChildren(date, document.createTextNode(' ' + courses[index]));
        });
    }

    function translateResearch() {
        if (!document.body.classList.contains('research-page-body')) return;
        const headings = document.querySelectorAll('#research > h2');
        if (headings[0]) headings[0].textContent = ' Artículos en revistas';
        if (headings[1]) headings[1].textContent = 'Conferencias y preprints';
        document.querySelectorAll('#research button').forEach(button => button.textContent = 'Mostrar/ocultar resumen');
        const graphHeading = document.querySelector('#collaboration-title');
        if (graphHeading) graphHeading.textContent = 'Colaboraciones por tema';
        const graphIntro = document.querySelector('.collaboration-heading p:not(.eyebrow)');
        if (graphIntro) graphIntro.textContent = 'Explore una red de coautoría construida desde los artículos, conferencias y preprints listados. Las regiones muestran comunidades temáticas y los enlaces representan trabajos compartidos.';
        const eyebrow = document.querySelector('.collaboration-heading .eyebrow');
        if (eyebrow) eyebrow.textContent = 'Red de investigación';
        const statSpans = document.querySelectorAll('.collaboration-stats span');
        if (statSpans[0]) statSpans[0].lastChild.textContent = ' colaboradores';
        if (statSpans[1]) statSpans[1].lastChild.textContent = ' vínculos de coautoría';
    }

    function setText(selector, value) {
        const element = document.querySelector(selector);
        if (element) element.textContent = value;
    }

    function walkText(root, transform) {
        if (!root) return;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach(node => {
            if (node.parentElement && ['SCRIPT', 'STYLE'].includes(node.parentElement.tagName)) return;
            const trimmed = node.textContent.trim();
            if (!trimmed) return;
            const translated = transform(trimmed);
            if (translated !== trimmed) node.textContent = node.textContent.replace(trimmed, translated);
        });
    }
})();
