import MarkdownIt from './vendor/markdown-it.mjs';

// Disable raw HTML and remote images before parsing untrusted assistant output.
const markdown = new MarkdownIt({ html: false, breaks: true, linkify: false });
markdown.disable('image');
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
