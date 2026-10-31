import MarkdownIt from './vendor/markdown-it.mjs';
import katex from './vendor/katex/katex.mjs';

// Disable raw HTML and remote images before parsing untrusted assistant output.
const markdown = new MarkdownIt({ html: false, breaks: true, linkify: false });
markdown.disable('image');

// Parse math before Markdown escapes/emphasis can consume LaTeX syntax.
// Code spans and fenced blocks retain their normal, literal behavior.
const delimiters = [['$$', '$$', true], ['\\[', '\\]', true], ['\\(', '\\)', false], ['$', '$', false]];
function closingDelimiter(source, close, start) {
    let end = source.indexOf(close, start);
    while (end !== -1) {
        let slashes = 0;
        for (let i = end - 1; i >= 0 && source[i] === '\\'; i--) slashes++;
        if (slashes % 2 === 0) return end;
        end = source.indexOf(close, end + close.length);
    }
    return -1;
}
markdown.inline.ruler.before('escape', 'math', (state, silent) => {
    const start = state.pos;
    const delimiter = delimiters.find(([open]) => state.src.startsWith(open, start));
    if (!delimiter) return false;
    const [open, close, display] = delimiter;
    const contentStart = start + open.length;
    if (open === '$' && /\s/.test(state.src[contentStart] || ' ')) return false;
    const end = closingDelimiter(state.src, close, contentStart);
    if (end === -1 || end >= state.posMax || end === contentStart) return false;
    const content = state.src.slice(contentStart, end);
    if (!display && content.includes('\n')) return false;
    // Avoid treating ordinary currency such as "$5 and $10" as math.
    if (open === '$' && (/\s/.test(content.at(-1)) || /\d/.test(state.src[end + 1] || ''))) return false;
    if (!silent) {
        const token = state.push('math_inline', 'math', 0);
        token.content = content;
        token.meta = { display };
        token.markup = open;
    }
    state.pos = end + close.length;
    return true;
});
markdown.block.ruler.before('fence', 'math_block', (state, startLine, endLine, silent) => {
    if (state.sCount[startLine] - state.blkIndent >= 4) return false;
    const start = state.bMarks[startLine] + state.tShift[startLine];
    const open = state.src.slice(start, start + 2);
    if (!['$$', '\\['].includes(open)) return false;
    const close = open === '$$' ? '$$' : '\\]';
    const end = closingDelimiter(state.src, close, start + 2);
    if (end === -1) return false;
    let lastLine = startLine;
    while (lastLine < endLine && state.eMarks[lastLine] < end + 2) lastLine++;
    if (lastLine >= endLine || state.src.slice(end + 2, state.eMarks[lastLine]).trim()) return false;
    if (silent) return true;
    const token = state.push('math_block', 'math', 0);
    token.block = true;
    token.content = state.getLines(startLine, lastLine + 1, state.blkIndent, false).trim().slice(2, -2).trim();
    token.map = [startLine, lastLine + 1];
    token.meta = { display: true };
    state.line = lastLine + 1;
    return true;
}, { alt: ['paragraph', 'reference', 'blockquote', 'list'] });
function renderMath(tokens, index) {
    const token = tokens[index];
    try {
        // Fresh macros per formula; no links, images, HTML extensions or unbounded expansion.
        const html = katex.renderToString(token.content, { displayMode: token.meta.display, output: 'htmlAndMathml', trust: false, strict: 'error', throwOnError: true, maxExpand: 200, maxSize: 20, macros: {} });
        return `<${token.block ? 'div' : 'span'} class="chat-math${token.meta.display ? ' chat-math-display' : ''}">${html}</${token.block ? 'div' : 'span'}>`;
    } catch {
        return `<code class="math-fallback">${markdown.utils.escapeHtml(token.content)}</code>`;
    }
}
markdown.renderer.rules.math_inline = renderMath;
markdown.renderer.rules.math_block = renderMath;
markdown.validateLink = href => {
    try {
        const url = new URL(href);
        return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password;
    } catch { return false; }
};
markdown.renderer.rules.link_open = (tokens, index, options, env, renderer) => {
    tokens[index].attrSet('target', '_blank');
    tokens[index].attrSet('rel', 'noopener noreferrer');
    return renderer.renderToken(tokens, index, options);
};

export function renderMarkdown(text) {
    return markdown.render(text);
}
