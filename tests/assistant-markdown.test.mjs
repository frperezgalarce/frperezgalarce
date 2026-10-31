import test from 'node:test';
import assert from 'node:assert/strict';
import { renderMarkdown } from '../assistant-markdown.mjs';

test('renders structured explanations, nested lists, code and tables', () => {
    const html = renderMarkdown('# Concept\n\n**Bold** and *emphasis* with `x < y`.\n\n1. First\n2. Second\n   - Nested\n\n> Note\n\n```python\nprint("<safe>")\n```\n\n| A | B |\n| --- | --- |\n| 1 | 2 |');
    for (const tag of ['h1', 'strong', 'em', 'code', 'ol', 'ul', 'blockquote', 'pre', 'table', 'th', 'td']) {
        assert.match(html, new RegExp(`<${tag}[ >]`));
    }
    assert.match(html, /x &lt; y/);
    assert.match(html, /&lt;safe&gt;/);
});

test('keeps raw HTML literal and never emits embedded media or active content', () => {
    for (const input of ['<script>alert(1)</script>', '<img src=x onerror=alert(1)>', '<svg onload=alert(1)>', '<iframe src="https://example.com"></iframe>', '![tracking](https://example.com/pixel)', '<a href="javascript:alert(1)">Click</a>']) {
        const html = renderMarkdown(input);
        assert.doesNotMatch(html, /<(?:script|img|svg|iframe)\b/i);
        assert.doesNotMatch(html, /href="javascript:/i);
    }
});

test('rejects dangerous, relative and credential-bearing links', () => {
    for (const href of ['javascript:alert%281%29', 'jav&#x61;script:alert%281%29', 'data:text/html,hello', 'vbscript:hello', 'file:///tmp/example', '//example.com', '/relative', 'https://user:password@example.com']) {
        assert.doesNotMatch(renderMarkdown(`[Click](${href})`), /<a\b/);
    }
    const html = renderMarkdown('[Safe](https://example.com/?a=1&b=2)');
    assert.match(html, /href="https:\/\/example.com\/\?a=1&amp;b=2"/);
    assert.match(html, /target="_blank"/);
    assert.match(html, /rel="noopener noreferrer"/);
});

test('handles ordinary bilingual text and incomplete Markdown', () => {
    for (const text of ['Una heurística no garantiza optimalidad.', 'An exact method proves optimality.', '**Unfinished', '```python\nx = 1']) {
        assert.ok(renderMarkdown(text).length > 0);
    }
    assert.match(renderMarkdown('Line one\nLine two'), /<br>/);
});

test('renders all four LaTeX delimiters with accessible math', () => {
    for (const formula of [String.raw`\(x_i^2 + \frac{1}{2}\)`, '$x_i^2$', '$2$', '$2 x + 1$', String.raw`\[\sum_{i=1}^{n} x_i\]`, '$$x^2$$']) {
        const html = renderMarkdown(formula);
        assert.match(html, /class="katex"/);
        assert.match(html, /<math /);
        assert.doesNotMatch(html, /math-fallback/);
    }
    const html = renderMarkdown(String.raw`Before.

\[
\begin{aligned}
\min_x &\quad c^T x \\
\text{subject to} &\quad Ax \le b
\end{aligned}
\]

After **the equation**.`);
    assert.match(html, /<div class="chat-math chat-math-display">/);
    assert.match(html, /<strong>the equation<\/strong>/);
    assert.doesNotMatch(html, /math-fallback/);
});

test('math coexists with lists, blockquotes, tables, code and currency', () => {
    assert.match(renderMarkdown(String.raw`- Probability \(p(y=1)\)`), /<li>Probability <span class="chat-math">/);
    assert.match(renderMarkdown('> $$\nx^2\n$$'), /<blockquote>\n<div class="chat-math/);
    assert.match(renderMarkdown('| Value |\n| --- |\n| $x_i$ |'), /<td><span class="chat-math/);
    for (const text of ['`$x$`', '```latex\n\\[x^2\\]\n```', '    $x^2$', 'Costs $5 and $10 today.', String.raw`Escaped \$x\$`, '$ incomplete', String.raw`\(unfinished`]) {
        assert.doesNotMatch(renderMarkdown(text), /class="katex/);
    }
});

test('invalid and adversarial math falls back safely without breaking surrounding text', () => {
    for (const formula of [String.raw`\invalid{<img src=x onerror=alert(1)>}`, String.raw`\frac{`, String.raw`\def\x{\x}\x`, String.raw`\href{javascript:alert(1)}{click}`, String.raw`\includegraphics{https://example.com/tracker}`, String.raw`\htmlClass{evil}{x}`]) {
        const html = renderMarkdown(`Before \\(${formula}\\) after **safe**.`);
        assert.doesNotMatch(html, /<(?:script|img|iframe)\b|href="javascript:|class="evil"/);
        assert.match(html, /<strong>safe<\/strong>/);
    }
    assert.doesNotMatch(renderMarkdown(String.raw`\(\gdef\foo{1}\foo\) then \(\foo\)`), /undefined/);
    assert.match(renderMarkdown(String.raw`\(\foo\)`), /math-fallback/);
});
