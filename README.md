# SYNAPSE

**Build knowledge from what you build.**

A Next.js learning studio that turns public JavaScript and TypeScript repositories into source-linked architecture maps, prioritized concepts, animated lessons, and practical assessments.

![SYNAPSE learning studio](evidence/overview-1366.png)

Connect a repository, inspect the static architecture, follow a prerequisite-aware learning path, and read/watch/listen to a concept at your chosen depth. Open exact source excerpts, ask the Prune-backed tutor for context, and practice with deterministic feedback. The studio includes light/dark themes, mobile layouts, a transcript, and owner-isolated hosted learner history (or local history without credentials).

## Run locally

Requires Node.js 22 and npm.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open http://127.0.0.1:3000. The interactive Fieldnotes sample, public GitHub imports, template lessons, browser narration, and local progress work without paid APIs. No imported code is executed or installed. Local records live in ignored `.synapse/`, with a browser progress mirror.

## Current service boundaries

- **Source templates and the embedded teaching fixture are explicitly labeled.** They are not live model output. The fixture's hash identifies its contents, not a GitHub commit.
- Live tutor integration accepts an OpenAI-compatible chat-completions endpoint via `LLM_BASE_URL`, `LLM_MODEL`, and `LLM_API_KEY`. Prune is the primary gateway, using `gemini/gemini-flash-lite-latest` (observed serving `gemini-3.5-flash-lite`). Tutoring and safe generated lessons are live-tested; failures preserve source lessons. Native Gemini and OpenAI response envelopes are supported. Set `LLM_ALLOW_LOCAL=true` for an explicitly configured localhost model.
- Supabase integration uses a publishable key and user cookies, with owner RLS. Both reviewed migrations are applied to dedicated TraceEval / `synapse-learning` (`fcwyithhipsimrnccqsy`). Real anonymous Auth, persistence, RLS, refresh and distributed limits passed hosted tests. Email OTP delivery remains unverified. For a fresh installation, review both migrations, enable anonymous sign-in, and configure callback URLs; never use an unrelated database. Set the two `NEXT_PUBLIC_SUPABASE_*` variables.
- `APP_ORIGIN` must match the browser origin exactly. For the documented local command it is `http://127.0.0.1:3000`.
- `GITHUB_TOKEN` is optional and server-only. Public import does not require GitHub user authentication. Unauthenticated GitHub API quotas can limit repeated imports.
- Vercel cannot use local filesystem persistence. The dedicated protected project is configured with preview-only credentials. After the user approved a protected first-deployment bootstrap with no production service credentials and no domain aliases, the configured preview passed 16 primary end-to-end checks plus six hosted grading/concurrency checks. No domain promotion occurred. [Open the protected preview](https://synapse-learning-qr1qac164-pranav-pokkulas-projects.vercel.app) with the authorized Vercel account.
- Shared hosted limits: 8 model reservations/minute, 50/day UTC, 55 GitHub requests/hour; per-user model limit 20/day. Prune Shield has a user-confirmed $1/day cap, 10/minute limit and anomaly detection; an uncached probe observed a real Shield 429. `PRUNE_SHIELD_VERIFIED` gates hosted live calls. No unrestricted public AI is enabled.

## Supported limits

Public GitHub root URLs only; up to 150 MB repository metadata size, 15,000 tree entries, 48 selected source files, 80 KB per file, and 1 MB indexed input. Six files are fetched per checkpoint. Partial coverage is visible. The static import graph resolves relative and conventional `@/` imports; runtime topology and arbitrary aliases are not inferred. Presence of tests does not establish that they pass.

## Verification

```sh
npm run typecheck
npm run lint
npm test
npm run build
# With the app running and Chrome available:
npm run test:e2e
npm run verify:live
# Broader live Next.js import (additional GitHub API quota):
npx tsx scripts/verify-next.ts
npm run evaluate
npm audit
```

Browser tests use installed Google Chrome by default. CI installs Chromium and selects it through `PLAYWRIGHT_CHROMIUM=1`. Live verification contacts public GitHub repositories and consumes API quota. The original fixture evaluation defaults to deterministic checks. The explicit `npx tsx scripts/evaluate-stage2.ts` command makes twenty paced Prune requests under hosted quotas; its frozen protocol and raw final outputs are in `evidence/stage2-evaluation-*.json`. Human scoring remains pending.

Stage 2: 91 unit/SQL/security tests, 12 isolated browser regression/accessibility checks, 16 actual hosted database checks, typecheck, lint, webpack build, and a dependency audit with zero reported vulnerabilities. Separate real-service Chrome checks exercised generated teaching, tutoring and hosted cache persistence. Live examples include three JS libraries and a 37-file Next.js dashboard. [GitHub Actions](https://github.com/pranav-pokkula/synapse/actions) runs the automated checks on every push.

The Stage 1 captioned demo is `evidence/synapse-demo.mp4` (2:44, excluded from Git). The completed Stage 2 recording is `evidence/synapse-stage2-demo.mp4` (3:03, silent captions), showing real saved AI lessons and hosted records. Reproduce it with `scripts/record-demo-stage2.ts`. Recreate the capture with `npx tsx scripts/record-demo.ts` while the app is running; see [demo notes](docs/DEMO_SCRIPT.md). Public video upload and human review remain pending.

See [release audit](docs/RELEASE_AUDIT.md), [evaluation report](docs/EVALUATION_REPORT.md), and [architecture](docs/ARCHITECTURE.md) for measured status and limitations. This is a release candidate with live services verified locally; independent content review and production promotion remain separate gates.
