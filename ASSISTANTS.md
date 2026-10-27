# tokensforlearning learning assistants

Two assistants are embedded in `playground.html` (Operations Research) and `machine-learning.html` (Machine Learning), with links on the home page. Each has 20 bilingual FAQ drafts, searchable without AI or a backend. Review the educational text in `assistant-knowledge.mjs` before publishing it as your own reference material. The AI receives four relevant FAQ entries and up to two previous exchanges; it cannot see live lab settings or execute a solver.

## Recommended readings

Every educational FAQ answer and successful AI answer includes a recommended reading with title, authors, publication, a source link, and a Spanish/English focus note. The welcome message and transient error/status messages are not educational answers.

`assistant-readings.mjs` contains nine verified classic books and foundational papers, with an explicit mapping for all 40 FAQs. Readings include Hillier and Lieberman; Nemhauser and Wolsey; Croes (1958); Dijkstra (1959); Hastie, Tibshirani and Friedman; James et al.; Bishop; Pearl; and Hardt, Price and Srebro (2016). Links point to publishers, author pages, conference proceedings or DOIs. Access conditions depend on the linked source.

The Worker always returns a `recommendedReading` object from this catalog, independently of the model's answer. The frontend derives the same recommendation locally, so missing, malformed or model-invented citation URLs cannot suppress or replace it. Free-form questions use subject keywords, FAQ relevance and brief follow-up context; these are suggestions for further study, not claims that a source verifies every sentence of an AI response. The system prompt tells the model to leave bibliography generation to the application. Editorial focus notes are not quotations and do not invent page numbers.

Update the catalog/mappings and tests together when adding topics. Deploy the Worker and publish the static assets for reading changes.

## Public configuration

Edit `assistant-config.js`:

- `apiUrl`: absolute HTTPS Worker URL ending in `/chat`. Empty means FAQ-only mode, explicitly shown in the interface. HTTP is accepted only for localhost development.
- `supportUrl`: the owner's verified payment URL, currently `https://paypal.me/tokensforlearning`. Empty hides the support card. Only HTTPS URLs without embedded credentials are accepted.
- `supportName`: initiative name, currently `tokensforlearning`.

The contribution is voluntary support for the author's work and the educational project. It does not buy tokens, guarantee availability, unlock chat, or trigger an API billing upgrade. PayPal receives payments in the owner's account; this repository does not process payments, perform transfers, allocate proceeds, invest funds, or store financial records. Keep private financial arrangements and bookkeeping outside the public repository.

Never add provider credentials to public configuration, HTML, or tracked files.

## Deploy the Groq proxy

The static website runs on GitHub Pages. The backend is deployed at `https://tokensforlearning-chat.tokensforlearning-chat.workers.dev/chat` in the personal Cloudflare account specified in `worker/wrangler.toml`, with AI chat enabled. The Groq key and IP-hashing secret are stored as Cloudflare Worker secrets, never in this repository. A SQLite-backed Durable Object provides shared persistent quotas.

The following steps document redeployment and setup in a new account. For the current deployment, use `npm ci` and `npm run deploy` from `worker/`; existing secrets are retained. To disable AI, set `CHAT_ENABLED = "false"` and redeploy. Clear `apiUrl` to show FAQ-only mode in the browser.

Install Node.js 22 or newer. From `worker/`, install the pinned deployment tools and sign in:

```sh
npm ci
npm test
npm run check
npx wrangler login
npx wrangler secret put GROQ_API_KEY
npx wrangler secret put IP_HASH_SECRET
```

Enter each secret at the prompt. Use a long random value for `IP_HASH_SECRET`; do not put either value in shell history, chat, or this repository. If the Worker does not exist yet, allow Wrangler to create it when prompted. Use a dedicated Groq project/key so other uses do not share the site's budget.

Review `wrangler.toml`:

1. Set `ALLOWED_ORIGINS` to the exact published website origin(s), comma-separated, without path or trailing slash. The initial value is the repository owner's GitHub Pages origin; update it if a custom domain is used.
2. Verify that `GROQ_MODEL` is available to your account's free tier. The initial model is `openai/gpt-oss-20b`. Provider model availability and quotas can change.
3. Review the limits below and set `CHAT_ENABLED = "true"` when ready. `false` is an emergency stop.
4. Run `npm run deploy` and put the returned Worker URL plus `/chat` in `apiUrl`.
5. Publish the changed static files through your normal website workflow. Test a real Spanish and English question in both assistants and a follow-up before announcing availability.

The browser calls your Worker, which calls Groq. No browser request contains the Groq key. The Worker returns only the answer or a generic error code, never provider diagnostics or secrets.

### First-time account setup

1. Create or sign in to [Cloudflare](https://dash.cloudflare.com/sign-up) and [Groq](https://console.groq.com/). Complete any email verification yourself.
2. In Groq, create a dedicated project/API key. Keep the key in your password manager or the ignored `worker/.dev.vars` file as `GROQ_API_KEY=your_key`; never commit it or paste it into chat.
3. Complete `npx wrangler login` in your browser. If prompted during deployment, choose your Cloudflare account and register a Workers subdomain.
4. Upload both secrets with the commands above, enable chat, deploy the Worker, and update the public endpoint. Keep `apiUrl` empty until the backend passes a real request test.

The static site publishes automatically from the root of `main` to `https://frperezgalarce.github.io/frperezgalarce/`. Pushing the assistant files publishes the FAQ interface even before the AI backend is connected.

## Consumption limits

Both subjects share one durable quota authority. Default limits:

- 200 upstream attempts per UTC day, across all visitors.
- 12 upstream attempts per UTC day per hashed IP address; at least five seconds between attempts. Visitors sharing a network also share this limit.
- 1,000,000 conservative token units per UTC month.
- 1,500 characters per message, at most four historical messages, at most 32 KiB request body and 1,400 completion tokens per response.

Reservations occur atomically before calling Groq. They count UTF-8 input bytes as token units plus output capacity and a framing allowance, rather than estimating ordinary text at four characters per token. Failed requests are not refunded. These deliberately conservative units are not a measured token balance or a currency-denominated spending limit. Set the provider's own hard spending limit before enabling paid billing, and account separately for hosting charges. Upgrading is manual; donations never change billing settings. The site does not automatically switch to paid usage or rotate accounts to bypass free-tier limits.

CORS checks limit which browser origins can call the endpoint, but are not authentication: non-browser clients can forge Origin. Shared persistent quotas provide the overall cap. IP limits are a basic abuse control, not a guarantee against distributed abuse. Reduce limits or disable chat if needed.

Provider 429 responses, exhausted site budgets, network errors and unconfigured services leave the FAQ available. The interface preserves the unsent/failed question for retry. Replies use `textContent`, so generated HTML and scripts are never executed.

## Privacy

Conversation state is kept only in page memory and cleared on reload or with “Clear conversation”. Typed non-FAQ questions and recent exchanges are sent to Groq. Selecting FAQ entries does not contact the provider. A selected FAQ exchange may become context if a later AI question is submitted.

The Worker stores only usage counters and HMAC-hashed IP identifiers, with a daily salt component; it does not save chat text or raw IP addresses. Visitor counters reset on the next UTC day with a request. A monthly alarm removes stale records; a delayed alarm cannot erase the new month's quota. Provider and hosting infrastructure may have their own retention practices. Observability is disabled in the supplied Worker configuration. Do not send personal or confidential data through this educational chat.

## Checks and local preview

```sh
node --test tests/assistant.test.mjs
node tests/ml-engine.test.cjs
node tests/playground-engine.test.cjs
python3 -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/machine-learning.html?lang=es#learning-assistant` or the optimization lab. Tests cover validation, prompt context, persistent quota behavior using a transactional storage double, daily/monthly resets, simultaneous reservations, HTTP origin checks, provider failures, and secret-safe responses. They do not replace a live Cloudflare/Groq smoke test after deployment.

For local Worker integration, use `npx wrangler dev`, put secrets in ignored `worker/.dev.vars`, allow `http://127.0.0.1:8765`, and temporarily set the public `apiUrl` to `http://127.0.0.1:8787/chat`. Do not publish localhost settings.

Official references: [Groq model catalog](https://console.groq.com/docs/models), [Groq API compatibility](https://console.groq.com/docs/openai), [Groq spend limits](https://console.groq.com/docs/spend-limits), [Cloudflare SQLite-backed storage](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/), [PayPal.Me in Chile](https://www.paypal.com/cl/cshelp/article/%C2%BFqu%C3%A9-es-paypalme-help432).

For browser checks, open `tests/assistant-browser.html` through the local server. This explicitly labeled harness simulates success, quota exhaustion, service errors and delayed responses without contacting Groq. Verify FAQ clicks leave Requests at zero, HTML-like output stays literal, failed questions remain editable, and clearing an in-flight conversation cancels the request.
