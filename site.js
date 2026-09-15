document.addEventListener('DOMContentLoaded', () => {
    const language = window.siteLanguage || 'es';
    const homeEnglish = {
    "PhD en Ciencias de la Computación": "PhD in Computer Science",
    "Machine Learning": "Machine Learning",
    "explicable y justo.": "explainable and fair.",
    "Investigación para": "Research for",
    "decisiones complejas.": "complex decisions.",
    "Investigo cómo desarrollar y evaluar modelos que combinen capacidad predictiva, explicabilidad y equidad, con especial interés en análisis de supervivencia y decisiones en salud.": "I investigate how to develop and evaluate models that combine predictive performance, explainability and fairness, with a particular interest in survival analysis and healthcare decisions.",
    "Publicaciones seleccionadas ↗": "Selected publications ↗",
    "Líneas de investigación ↓": "Research areas ↓",
    "Profesor Asistente · Universidad de Las Américas, Chile": "Assistant Professor · Universidad de Las Américas, Chile",
    "Facultad de Ingeniería y Negocios": "Faculty of Engineering and Business",
    "Perfiles académicos": "Academic profiles",
    "Agenda científica": "Research agenda",
    "Comprender, evaluar y decidir.": "Understand, evaluate and decide.",
    "Explorar investigación ↗": "Explore research ↗",
    "01 / EXPLICABILIDAD": "01 / EXPLAINABILITY",
    "Modelos que podemos comprender": "Models we can understand",
    "Modelos y métodos para interpretar predicciones y examinar su relación con el conocimiento del dominio, especialmente en análisis de supervivencia.": "Models and methods to interpret predictions and examine their relationship with domain knowledge, particularly in survival analysis.",
    "02 / EQUIDAD": "02 / FAIRNESS",
    "Evaluación entre subpoblaciones": "Evaluation across subpopulations",
    "Cómo medir y contextualizar las diferencias de desempeño predictivo entre grupos, considerando los límites de las métricas utilizadas.": "How to measure and contextualize differences in predictive performance across groups, considering the limits of evaluation metrics.",
    "03 / DECISIONES": "03 / DECISIONS",
    "De la predicción a la asignación": "From prediction to allocation",
    "Machine Learning e Investigación de Operaciones para estudiar decisiones que incorporen incertidumbre, restricciones y criterios de equidad.": "Machine Learning and Operations Research to study decisions that incorporate uncertainty, constraints and fairness criteria.",
    "Proyecto actual · 2026–2029": "Current project · 2026–2029",
    "Modelos justos e interpretables para la supervivencia en trasplante renal.": "Fair and interpretable survival models for kidney transplantation.",
    "Como investigador principal, desarrollo modelos de supervivencia que consideran riesgos competitivos y su relevancia para decisiones clínicas y políticas de trasplante.": "As principal investigator, I develop survival models that account for competing risks and their relevance to clinical decisions and transplant policy.",
    "Conocer objetivos y metodología ↗": "Explore objectives and methods ↗",
    "Predicción con contexto clínico.": "Prediction in a clinical context.",
    "Una agenda de investigación que conecta el rigor metodológico con preguntas relevantes para la salud.": "A research agenda connecting methodological rigor with relevant healthcare questions.",
    "Supervivencia": "Survival analysis",
    "Riesgos competitivos": "Competing risks",
    "Equidad": "Fairness",
    "Contribuciones": "Contributions",
    "Publicaciones seleccionadas": "Selected publications",
    "Ver todas las publicaciones ↗": "View all publications ↗",
    "ARTÍCULO": "JOURNAL ARTICLE",
    "Felipe Simon, Francisco Pérez-Galarce y Joris van de Klundert · arXiv": "Felipe Simon, Francisco Pérez-Galarce and Joris van de Klundert · arXiv",
    "Límites del índice de concordancia para contextualizar la discriminación predictiva y sus diferencias entre subpoblaciones.": "Concordance-index bounds to contextualize predictive discrimination and its differences across subpopulations.",
    "Leer trabajo ↗": "Read preprint ↗",
    "Francisco Pérez-Galarce, Jorge Martínez-Palomera, Karim Pichara, Pablo Huijse y Márcio Catelan · Monthly Notices of the Royal Astronomical Society": "Francisco Pérez-Galarce, Jorge Martínez-Palomera, Karim Pichara, Pablo Huijse and Márcio Catelan · Monthly Notices of the Royal Astronomical Society",
    "Entrenamiento autorregulado con muestras sintéticas para abordar sesgos y cambios de distribución en datos astronómicos.": "Self-regulated training with synthetic samples to address biases and distribution shifts in astronomical data.",
    "Leer artículo ↗": "Read article ↗",
    "Colaboración y transferencia": "Collaboration & technology transfer",
    "Investigar juntos.": "Research together.",
    "Llevar los modelos a la práctica.": "Bring models into practice.",
    "Colaboro con equipos de investigación y organizaciones en estudios aplicados, desarrollo de sistemas de apoyo a decisiones y asesorías especializadas en Machine Learning e Investigación de Operaciones.": "I collaborate with research teams and organizations on applied studies, decision-support systems and specialist advice in Machine Learning and Operations Research.",
    "Contactar por correo ↗": "Contact by email ↗",
    "Ver proyectos aplicados ↗": "View applied projects ↗"
};
    document.querySelectorAll('[data-es]').forEach(element => {
        if (language === 'es') element.textContent = element.dataset.es;
    });
    if (language === 'en' && document.body.classList.contains('home-page')) {
        const walker = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
            const node = walker.currentNode;
            const text = node.textContent.trim();
            if (homeEnglish[text]) node.textContent = node.textContent.replace(text, homeEnglish[text]);
        }
        document.querySelector('.portrait').alt = 'Portrait of Francisco Pérez-Galarce';
    }
    document.querySelectorAll('a[href]').forEach(link => {
        const raw = link.getAttribute('href');
        if (!raw || raw.startsWith('#') || !/^[^:?#]*\.html(?:[?#]|$)/.test(raw)) return;
        const url = new URL(raw, location.href);
        url.searchParams.set('lang', language);
        link.setAttribute('href', url.pathname.split('/').pop() + url.search + url.hash);
    });
    document.querySelectorAll('.language-switcher a').forEach(link => {
        const url = new URL(link.href);
        url.searchParams.set('lang', link.lang);
        link.href = url.pathname + url.search + location.hash;
    });
    const titles = {
        'index.html': ['Machine Learning explicable y justo', 'Explainable and fair Machine Learning'],
        'research.html': ['Investigación y publicaciones', 'Research & publications'],
        'projects.html': ['Investigación y proyectos aplicados', 'Research & applied projects'],
        'teaching.html': ['Docencia y supervisión', 'Teaching & supervision'],
        'experience.html': ['Trayectoria', 'Career'],
        'links.html': ['Contacto', 'Contact'],
        'current-project.html': ['Proyecto de investigación actual', 'Current research project'],
        'technology-transfer.html': ['Transferencia tecnológica', 'Technology transfer'],
        'algornia.html': ['AlgornIA', 'AlgornIA']
    };
    const page = location.pathname.split('/').pop() || 'index.html';
    if (titles[page]) document.title = titles[page][language === 'es' ? 0 : 1] + ' · Francisco Pérez-Galarce';
    const spanishDescriptions = {
    "index.html": "Investigación en Machine Learning explicable y justo, análisis de supervivencia y apoyo a decisiones. Francisco Pérez-Galarce, PhD.",
    "research.html": "Investigación y publicaciones sobre Machine Learning, explicabilidad, equidad, análisis de supervivencia y optimización.",
    "projects.html": "Proyectos de investigación y aplicación en Machine Learning, optimización y sistemas de apoyo a decisiones.",
    "experience.html": "Trayectoria académica y experiencia en ciencia de datos aplicada en salud, astronomía, educación, energía y agroindustria.",
    "current-project.html": "Proyecto de investigación en modelos de supervivencia justos e interpretables para trasplante renal.",
    "links.html": "Contacto para colaboraciones científicas, proyectos aplicados y asesorías en Machine Learning e Investigación de Operaciones.",
    "algornia.html": "Ciencia de datos aplicada mediante formación, desarrollo de herramientas y estudios de datos.",
    "technology-transfer.html": "Transferencia de modelos predictivos y de optimización a herramientas de apoyo a decisiones y estudios aplicados.",
    "teaching.html": "Docencia universitaria y supervisión de tesis en Machine Learning, ciencia de datos e Investigación de Operaciones."
};
    if (language === 'es' && spanishDescriptions[page]) {
        document.querySelector('meta[name="description"]')?.setAttribute('content', spanishDescriptions[page]);
    }
    document.querySelector('nav')?.setAttribute('aria-label', language === 'es' ? 'Navegación principal' : 'Main navigation');
    document.querySelectorAll('#research button[onclick]').forEach(button => {
        const match = button.getAttribute('onclick').match(/getElementById\('([^']+)'\)/);
        if (!match) return;
        button.setAttribute('aria-controls', match[1]);
        button.setAttribute('aria-expanded', 'false');
        button.addEventListener('click', () => {
            button.setAttribute('aria-expanded', String(document.getElementById(match[1]).style.display !== 'none'));
        });
    });
});
