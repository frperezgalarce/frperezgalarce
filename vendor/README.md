# Markdown parser

`markdown-it.mjs` is the unmodified browser ES module from `markdown-it@15.0.3`, downloaded from the npm registry and verified against its published SHA-512 integrity hash. Its MIT license is included in `markdown-it.LICENSE`.

The bundle is served locally so chat formatting works without a third-party CDN or a build step. When updating, replace the bundle and license together, then run `node --test tests/assistant-markdown.test.mjs` and the browser harness. Keep raw HTML and images disabled in `assistant-markdown.mjs`.

## Equation rendering

`katex/` contains the unmodified ES module, CSS, fonts and MIT license from `katex@0.19.1`. The npm tarball was checked against its published SHA-512 integrity:

```
sha512-jG8uKntjSEcm2EpQOh0XturpPuuC9r3Sq5HLHdsFdWZT27E672SF19QEi+of0/YeOy15lDgRhKvr5614uRrEfA==
```

Source: https://registry.npmjs.org/katex/-/katex-0.19.1.tgz

Keep the module, CSS and fonts at the same version. Math rules in `assistant-markdown.mjs` recognize LaTeX before Markdown consumes backslashes, underscores or asterisks. KaTeX uses `trust: false`, strict parsing, bounded expansion and fresh per-formula macros. Unsupported formulas fall back to escaped text; code stays literal. HTML + MathML output provides visual typesetting and accessible math. All assets are served locally without third-party font requests. Options: https://katex.org/docs/options
