# Markdown parser

`markdown-it.mjs` is the unmodified browser ES module from `markdown-it@15.0.3`, downloaded from the npm registry and verified against its published SHA-512 integrity hash. Its MIT license is included in `markdown-it.LICENSE`.

The bundle is served locally so chat formatting works without a third-party CDN or a build step. When updating, replace the bundle and license together, then run `node --test tests/assistant-markdown.test.mjs` and the browser harness. Keep raw HTML and images disabled in `assistant-markdown.mjs`.
