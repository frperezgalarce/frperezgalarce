import { gradeQuiz } from './assistant-quiz.mjs?v=math-resources-quiz3';

let quizId = 0;
export function createQuiz(questions, language) {
    const copy = (es, en) => language === 'es' ? es : en;
    const prefix = `quiz-${++quizId}`;
    const details = document.createElement('details');
    details.className = 'chat-quiz';
    const summary = document.createElement('summary');
    summary.textContent = copy('Practicar con una trivia de 5 preguntas', 'Try a 5-question trivia quiz');
    const intro = document.createElement('p');
    intro.textContent = copy('Opcional · Verdadero o falso sobre este tema y conceptos relacionados. Sin consumir IA.', 'Optional · True or false on this topic and related concepts. No AI usage.');
    const form = document.createElement('form');
    const feedback = [];
    const fields = questions.map((question, index) => {
        const field = document.createElement('fieldset');
        const legend = document.createElement('legend');
        legend.textContent = `${index + 1}. ${question.statement[language]}`;
        field.append(legend);
        for (const value of [true, false]) {
            const label = document.createElement('label');
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = `${prefix}-${index}`;
            radio.value = String(value);
            radio.required = true;
            label.append(radio, document.createTextNode(value ? copy('Verdadero', 'True') : copy('Falso', 'False')));
            field.append(label);
        }
        const explanation = document.createElement('p');
        explanation.className = 'quiz-feedback';
        explanation.hidden = true;
        explanation.id = `${prefix}-feedback-${index}`;
        field.append(explanation);
        feedback.push(explanation);
        form.append(field);
        return field;
    });
    const result = document.createElement('p');
    result.className = 'quiz-result';
    result.setAttribute('role', 'status');
    result.tabIndex = -1;
    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.textContent = copy('Revisar respuestas', 'Check answers');
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.textContent = copy('Intentar de nuevo', 'Try again');
    retry.hidden = true;
    form.append(submit, retry, result);
    form.addEventListener('submit', event => {
        event.preventDefault();
        const data = new FormData(form);
        const answers = questions.map((_, index) => data.get(`${prefix}-${index}`));
        if (answers.some(answer => answer === null)) { form.reportValidity(); return; }
        const grade = gradeQuiz(questions, answers.map(answer => answer === 'true'));
        questions.forEach((question, index) => {
            const verdict = grade.correct[index] ? copy('Correcto.', 'Correct.') : copy('Incorrecto.', 'Incorrect.');
            const answer = question.answer ? copy('Verdadero.', 'True.') : copy('Falso.', 'False.');
            feedback[index].textContent = `${verdict} ${copy('Respuesta:', 'Answer:')} ${answer} ${question.explanation[language]}`;
            feedback[index].hidden = false;
            fields[index].disabled = true;
            fields[index].setAttribute('aria-describedby', feedback[index].id);
        });
        result.textContent = copy(`Resultado: ${grade.score} de 5 correctas. Revisa las explicaciones de cada pregunta.`, `Score: ${grade.score} of 5 correct. Review each question’s explanation.`);
        submit.hidden = true;
        retry.hidden = false;
        result.focus();
    });
    retry.addEventListener('click', () => {
        form.reset();
        fields.forEach((field, index) => {
            field.disabled = false;
            field.removeAttribute('aria-describedby');
            feedback[index].hidden = true;
            feedback[index].textContent = '';
        });
        result.textContent = '';
        submit.hidden = false;
        retry.hidden = true;
        fields[0].querySelector('input').focus();
    });
    details.append(summary, intro, form);
    return details;
}
