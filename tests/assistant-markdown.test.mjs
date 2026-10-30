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
