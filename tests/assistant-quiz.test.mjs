import test from 'node:test';
import assert from 'node:assert/strict';
import { knowledge } from '../assistant-knowledge.mjs';
import { quizBank, quizForFaq, recommendedQuiz, gradeQuiz } from '../assistant-quiz.mjs';

test('every FAQ gets five unique bilingual questions with grounded explanations', () => {
    for (const [topic, items] of Object.entries(knowledge)) {
        assert.deepEqual(Object.keys(quizBank[topic]), items.map(item => item.id));
        for (const item of items) {
            const quiz = quizForFaq(topic, item.id);
            assert.equal(quiz.length, 5);
            assert.equal(new Set(quiz.map(question => question.id)).size, 5);
            assert.equal(quiz[0].id, item.id);
            for (const question of quiz) {
                assert.equal(typeof question.answer, 'boolean');
                const faq = items.find(entry => entry.id === question.id);
                for (const language of ['es', 'en']) {
                    assert.ok(question.statement[language]);
                    assert.equal(question.explanation[language], faq[language].a);
                }
            }
            for (const language of ['es', 'en']) assert.deepEqual(recommendedQuiz(topic, item[language].q, [], language), quiz);
        }
    }
});

test('free-form and follow-up quizzes keep the selected subject', () => {
    assert.equal(recommendedQuiz('ml', 'Explain logistic regression', [], 'en')[0].id, 'logistic');
    assert.equal(recommendedQuiz('or', 'Give me another example', [{ role: 'user', content: 'Explain Dijkstra' }], 'en')[0].id, 'path');
    assert.equal(quizForFaq('ml', 'unknown').length, 5);
    assert.deepEqual(quizForFaq('__proto__', 'unknown'), []);
});

test('grading requires five boolean answers and reports each correction', () => {
    const questions = quizForFaq('ml', 'supervised');
    const answers = questions.map(question => question.answer);
    assert.equal(gradeQuiz(questions, answers).score, 5);
    assert.equal(gradeQuiz(questions, answers.map(answer => !answer)).score, 0);
    answers[2] = !answers[2];
    assert.deepEqual(gradeQuiz(questions, answers), { score: 4, total: 5, correct: [true, true, false, true, true] });
    assert.equal(gradeQuiz(questions, answers.slice(1)), null);
    assert.equal(gradeQuiz(questions, [true, true, null, false, false]), null);
    assert.equal(gradeQuiz(questions, ['true', true, true, false, false]), null);
});
