# Release audit — 2026-11-22

**Status: working local release candidate; not submission-ready or production-ready.** Live AI configuration/evaluation, hosted Supabase authentication, public hosting verification, and human review remain incomplete. The account-wide free Supabase project limit blocked a new project; no existing project was changed.

## Feature status

| Capability | Status |
|---|---|
| Public JS/TS GitHub import, real blobs, exact SHA | Implemented; three real repositories verified |
| Bounded batches, saved cursor, retry, partial coverage | Implemented; controlled failure/recovery tested |
| Source index, relative import graph, dependency detection | Implemented; static-analysis limits disclosed |
| Prioritized concepts, prerequisites, practice-gap recommendation | Implemented; deterministic ranking tested |
| Beginner/intermediate/advanced written lessons | Implemented source templates; not model-generated lessons |
| Animated SVG, movement, pause/replay/steps/speed/captions/transcript | Implemented; real browser movement verified |
| Browser narration | Native Chrome callbacks verified; human audio review pending |
| Contextual guide | Source templates working; live model adapter implemented but unverified |
| Multiple-choice and code-comprehension assessments | Implemented; server scoring and persistence verified |
| Short-answer / architecture explanation practice | Rubric feedback only; model grading incomplete |
| Local profiles, projects, lessons, attempts, progress, tutor records | Implemented; server/browser persistence verified |
| Supabase Auth and RLS | Code and migration prepared; SQL isolation checked locally; hosted auth unverified |
| Learner-data deletion | Implemented; browser verified; does not delete auth account |
| Light/dark and four viewport sizes | Browser screenshots inspected; no page overflow; scanned axe checks pass |
| LLM baseline evaluation | Harness ready; not run because model selection was deferred |
| Public code / demo / Devpost | Materials prepared; publication and recording results tracked below |

## Executed quality gates

- TypeScript strict checking passed.
- ESLint passed; final unused import removed.
- Vitest: 68 passed across four files.
- Playwright: 11 passed in installed Chrome, including source inspection, real packet movement, native narration callbacks, persistence, two-session isolation, recovery, data deletion, and safe text rendering.
- Production build passed using webpack. Turbopack failed in the CSS worker even after permitted retry; no failure is hidden.
- npm dependency audit: zero reported vulnerabilities.
- Initial tracked-file secret-pattern scan: zero findings; `.env.local` and `.synapse/` excluded. Pattern scanning is not a guarantee against all secrets.
- PostgreSQL RLS verified in PGlite using the actual migration and a stub `auth.uid()`; this is not an end-to-end Supabase authentication result.

## Release risks and evidence

| Risk | Tested mitigation | Residual limitation |
|---|---|---|
| A: incorrect explanations | Exact citation validation, unknown behavior, invalid model-output rejection; `core`/`security` tests | Semantic accuracy not established by text matching; real LLM quality unmeasured |
| B: import failures | Real imports and 404/400 handling; mocked 429/timeouts and resumable failures | GitHub quotas still apply; no private repos |
| C: repository overload | Size, type, file, byte, stream, and tree bounds; partial flag tests | Selection can omit important modules; only small real repos checked so far |
| D: audio/animation failure | Movement observed; native speech start/end; captions/transcript remain usable | Browser voices vary; no human listening review |
| E: provider failure | Mocked timeout, 429, invalid JSON, excessive output, fabricated citations | No live provider configured; model-assisted lesson/short-answer generation incomplete |
| F: serverless limits | Six-file checkpoints, bounded source requests, persisted jobs | Local process locks are not distributed locks; multi-instance conflicts need testing |
| G: exposure and ownership | RLS owner policies, local isolation, CSRF, URL restrictions, escaped output, key exclusion | Hosted Auth unverified; anonymous churn can evade per-session quotas; no deployment-wide spending cap |
| H: demo failure | Interactive fixture, deterministic templates, local persistence, complete browser journey | Live GitHub can rate-limit; record fallback honestly; video has no captured audio |

## Remaining acceptance blockers

1. Choose and configure a provider, verify model availability, set a hard spending cap, and run the baseline experiment with independent human scoring.
2. Supply a new Supabase project within authorized free capacity. Apply the migration and verify real anonymous/email auth, cross-account isolation, session refresh, quota RPCs, deletion, and reconnect behavior.
3. Add distributed checkpoint/progress concurrency protections and deployment-wide abuse limits before public cloud use with a paid provider.
4. Validate at least one substantial Next.js app and held-out repositories. Current real samples are small JS libraries.
5. Human-review source claims, generated contributions, audio, and the submission video; complete team roster/contact forms. The official human-review rubric item is not satisfied by Codex checking itself.
6. Verify a Vercel deployment only after durable storage is configured. No live deployed URL is claimed.

See [evaluation report](EVALUATION_REPORT.md) for measured cases and [Devpost draft](DEVPOST_SUBMISSION.md) for submission boundaries. Do not mark the full master directive complete while these items remain.
