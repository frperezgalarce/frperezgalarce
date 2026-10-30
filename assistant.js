import { renderMarkdown } from './assistant-markdown.mjs';
import { knowledge, normalize } from './assistant-knowledge.mjs';
import { readingForFaq, recommendedReading } from './assistant-readings.mjs';

const lang = window.siteLanguage === 'en' ? 'en' : 'es';
const copy = (es, en) => lang === 'es' ? es : en;
const config = window.learningAssistantConfig || {};
function safeUrl(value, local = false) {
    try {
        const url = new URL(value);
        if (url.username || url.password) return '';
        return url.protocol === 'https:' || (local && url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)) ? url.href : '';
    } catch { return ''; }
}
const endpoint = safeUrl(config.apiUrl, true);
const root = document.querySelector('[data-learning-assistant]');
if (root) initialize(root);

function initialize(root) {
    const topic = root.dataset.learningAssistant;
    if (!knowledge[topic]) return;
    const faqs = knowledge[topic];
    const title = topic === 'or' ? copy('Pregunta sobre Investigación de Operaciones.', 'Ask about Operations Research.') : copy('Pregunta sobre Machine Learning.', 'Ask about Machine Learning.');
    root.className = 'learning-assistant';
    root.setAttribute('aria-labelledby', 'assistant-title');
    // This template contains only fixed interface strings, never model or visitor text.
    root.innerHTML = `
        <div class="assistant-heading"><div><p class="eyebrow">${copy('Sigue aprendiendo', 'Keep learning')} · tokensforlearning</p><h2 id="assistant-title">${title}</h2></div><span class="assistant-badge">${copy('20 preguntas frecuentes', '20 frequently asked questions')}</span></div>
        <p class="assistant-intro">${copy('Explora conceptos, entiende los métodos y conecta las respuestas con este laboratorio.', 'Explore concepts, understand the methods, and connect answers to this lab.')}</p>
        <div class="assistant-layout">
            <aside class="assistant-faq" aria-labelledby="faq-heading"><h3 id="faq-heading">${copy('Empieza por una pregunta', 'Start with a question')}</h3>
                <label for="faq-search">${copy('Buscar en las FAQ', 'Search the FAQs')}</label><input type="search" id="faq-search" placeholder="${copy('Ej. restricciones, sobreajuste…', 'E.g. constraints, overfitting…')}">
                <p class="faq-count" id="faq-count" role="status"></p><div class="faq-list" id="faq-list"></div>
            </aside>
            <div class="assistant-chat"><div class="chat-toolbar"><span>${copy('Tu conversación', 'Your conversation')}</span><button type="button" id="chat-clear">${copy('Borrar conversación', 'Clear conversation')}</button></div>
                <div id="chat-log" class="chat-log" role="log" aria-live="polite" aria-relevant="additions" aria-label="${copy('Conversación con el asistente', 'Assistant conversation')}"></div>
                <p id="chat-status" class="chat-status" role="status"></p>
                <form id="chat-form"><label for="chat-question">${copy('Tu pregunta', 'Your question')}</label><textarea id="chat-question" rows="3" maxlength="1500" required aria-describedby="chat-privacy" placeholder="${copy('¿Qué te gustaría comprender?', 'What would you like to understand?')}"></textarea><div class="chat-actions"><small>${copy('Hasta 1.500 caracteres', 'Up to 1,500 characters')}</small><button class="feature-button" type="submit" id="chat-send">${copy('Preguntar', 'Ask')}</button></div></form>
                <p class="chat-privacy" id="chat-privacy">${copy('Las FAQ se consultan en tu navegador. Al enviar otra pregunta, se comparte con Groq junto con los últimos mensajes. No incluyas datos personales. Las respuestas de IA pueden contener errores.', 'FAQs stay in your browser. Sending another question shares it and recent messages with Groq. Do not include personal data. AI answers can contain errors.')} <a href="https://console.groq.com/docs/your-data" target="_blank" rel="noopener noreferrer">${copy('Privacidad de Groq ↗', 'Groq privacy ↗')}</a></p>
            </div>
        </div>`;
    const $ = id => root.querySelector(`#${id}`);
    let history = [];
    let controller;
    let generation = 0;
    const idleStatus = endpoint ? copy('Puedes consultar las FAQ o hacer tu propia pregunta.', 'Browse the FAQs or ask your own question.') : copy('Por ahora están disponibles las FAQ. El chat con IA aún no está activado.', 'FAQs are available now. The AI chat has not been activated yet.');
    function message(role, text, source, recommended) {
        const article = document.createElement('article');
        article.className = `chat-message ${role}`;
        const label = document.createElement('strong');
        label.textContent = role === 'user' ? copy('Tú', 'You') : source || copy('Asistente · IA', 'Assistant · AI');
        const body = document.createElement('div');
        body.className = 'chat-body';
        if (role === 'assistant') body.innerHTML = renderMarkdown(text);
        else body.textContent = text;
        article.append(label, body);
        if (recommended) {
            const section = document.createElement('aside');
            section.className = 'chat-reading';
            const heading = document.createElement('strong');
            heading.textContent = copy('Lectura recomendada', 'Recommended reading');
            const link = document.createElement('a');
            link.href = recommended.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = recommended.title + ' ↗';
            const citation = document.createElement('p');
            citation.className = 'reading-citation';
            citation.textContent = `${recommended.authors} · ${recommended.publication}`;
            const focus = document.createElement('p');
            focus.textContent = recommended.focus[lang];
            section.append(heading, link, citation, focus);
            article.append(section);
        }
        $('chat-log').append(article);
        // Bound visible and transmitted history; nothing is saved to browser storage.
        while ($('chat-log').children.length > 30) $('chat-log').firstElementChild.remove();
        $('chat-log').scrollTop = $('chat-log').scrollHeight;
    }
    function remember(question, answer) {
        history.push({ role: 'user', content: question.slice(0, 1500) }, { role: 'assistant', content: answer.slice(0, 1500) });
        history = history.slice(-4);
    }
    function showFaq(item) {
        if (controller) return;
        message('user', item[lang].q);
        message('assistant', item[lang].a, copy('FAQ · respuesta de referencia', 'FAQ · reference answer'), readingForFaq(topic, item.id));
        remember(item[lang].q, item[lang].a);
        $('chat-status').textContent = idleStatus;
    }
    function renderFaqs() {
        const query = normalize($('faq-search').value);
        const matches = faqs.filter(item => normalize(`${item[lang].q} ${item[lang].a}`).includes(query));
        $('faq-list').replaceChildren();
        for (const item of matches) {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = item[lang].q;
            button.disabled = Boolean(controller);
            button.addEventListener('click', () => showFaq(item));
            $('faq-list').append(button);
        }
        $('faq-count').textContent = matches.length ? copy(`${matches.length} ${matches.length === 1 ? "pregunta" : "preguntas"} · sin consumir IA`, `${matches.length} ${matches.length === 1 ? "question" : "questions"} · no AI usage`) : copy('No encontramos coincidencias. Prueba otra palabra.', 'No matches. Try another word.');
    }
    function reset() {
        generation++;
        controller?.abort();
        controller = undefined;
        history = [];
        $('chat-log').replaceChildren();
        $('chat-question').value = '';
        $('chat-send').disabled = false;
        $('chat-log').setAttribute('aria-busy', 'false');
        $('chat-status').textContent = idleStatus;
        message('assistant', copy('Selecciona una pregunta frecuente para ver su respuesta, o escribe tu duda sobre este tema.', 'Select a frequently asked question to read its answer, or write a question about this topic.'), copy('Guía de aprendizaje', 'Learning guide'));
        renderFaqs();
    }
    $('faq-search').addEventListener('input', renderFaqs);
    $('chat-clear').addEventListener('click', () => { reset(); $('chat-question').focus(); });
    $('chat-form').addEventListener('submit', async event => {
        event.preventDefault();
        if (controller) return;
        const question = $('chat-question').value.trim();
        if (!question) return;
        const exact = faqs.find(item => normalize(item[lang].q) === normalize(question));
        if (exact) { showFaq(exact); $('chat-question').value = ''; return; }
        if (!endpoint) { $('chat-status').textContent = copy('El chat con IA aún no está activado. Puedes buscar y seleccionar una de las FAQ.', 'AI chat is not activated yet. You can search and select an FAQ.'); return; }
        const current = ++generation;
        const requestController = new AbortController();
        controller = requestController;
        const submittedDraft = $('chat-question').value;
        const timer = setTimeout(() => requestController.abort(), 30000);
        $('chat-send').disabled = true;
        $('chat-log').setAttribute('aria-busy', 'true');
        $('chat-status').textContent = copy('Preparando una explicación…', 'Preparing an explanation…');
        renderFaqs();
        message('user', question);
        try {
            const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic, language: lang, message: question, history }), signal: controller.signal, credentials: 'omit' });
            const data = await response.json();
            if (generation !== current) return;
            if (!response.ok) {
                if (response.status === 429) throw new Error('quota');
                throw new Error('service');
            }
            if (typeof data.answer !== 'string' || !data.answer.trim() || data.answer.length > 12000) throw new Error('service');
            // Always derive the reading from our trusted catalog, not response URLs.
            message('assistant', data.answer, undefined, recommendedReading(topic, question, history, lang));
            remember(question, data.answer);
            if ($('chat-question').value === submittedDraft) $('chat-question').value = '';
            $('chat-status').textContent = idleStatus;
        } catch (error) {
            if (generation !== current) return;
            $('chat-status').textContent = error.message === 'quota'
                ? copy('Alcanzamos un límite de consultas. Las FAQ siguen disponibles; puedes volver a intentar más tarde.', 'A query limit has been reached. FAQs remain available; please try again later.')
                : copy('No pudimos obtener una respuesta. Conservamos tu pregunta para que puedas reintentar; las FAQ siguen disponibles.', 'We could not get an answer. Your question is preserved so you can retry; FAQs remain available.');
        } finally {
            clearTimeout(timer);
            if (generation === current) {
                controller = undefined;
                $('chat-send').disabled = false;
                $('chat-log').setAttribute('aria-busy', 'false');
                renderFaqs();
            }
        }
    });
    reset();
}
