# Evaluation report

The table and repository timings below are historical Stage 1 measurements from 2026-11-22; Stage 2 results are recorded separately below. Reproduce with `npm ci`, `npm test`, `npm run evaluate`, and the browser/live commands in the README. Node 22; pinned dependencies in the lockfile. All counts below refer to executed checks, not planned checks.

| Check | Observed result | Evidence |
|---|---|---|
| Unit / integration / security | 68 passed | `tests/*.test.ts`; Vitest execution |
| Browser journeys | 12 passed against the production build in installed Chrome | `evidence/playwright-results.json` |
| Viewports | 390, 768, 1366, 1920 px; no document overflow | `evidence/overview-*.png`, `lesson-*.png` |
| Accessibility | No axe WCAG A/AA violations in scanned overview, light lesson, dark lesson | Browser accessibility check; not a full accessibility certification |
| Native narration | 180 available voices; observed native start and end callbacks | `evidence/narration-results.json`; callbacks only in this Stage 1 run; later listening review below |
| SQL ownership | Read/delete isolation, forged insert denial, reassignment denial, anonymous denial, quota permissions | PGlite tests with stub `auth.uid()`; hosted Auth not tested in Stage 1; later hosted checks below |
| Dependency audit | 0 reported vulnerabilities | `npm audit --json` |
| Production build | Passed with webpack | `npm run build`; Turbopack failure documented in experiment notes |

## Real GitHub examples

No imported code was executed. All calls used the public GitHub REST API. Times are observed on this machine and are not service-level promises.

| Case | Snapshot | Indexed files | Citations matching source | Observed |
|---|---|---:|---:|---|
| `sindresorhus/is-absolute-url` | `5fc796fd8b7d320d7304e15e8151120b6b987e16` | 4 | 2/2 | Complete, 1,775 ms |
| `sindresorhus/is-plain-obj` | `666df7c10035f7e26f27ec214fe5ae3173435f34` | 6 | 4/4 | Complete, 710 ms |
| Repeat first repository | Same exact snapshot | 4 | 2/2 | Cache reused, 81 ms |
| `lukeed/clsx` | `925494cf31bcd97d3337aacd34e659e80cae7fe2` | 10 | 6/6 | Complete over multiple batches, 931 ms |
| `vercel/nextjs-postgres-nextauth-tailwindcss-template` | `fe026711c19ac3ee4589c86a738f59b84e611559` | 37 | 11/11 | Complete over seven checkpoints; import, lesson, and browser verification in 4,135 ms |
| Invalid fetch host | — | — | — | 400 with corrective message |
| Nonexistent repository | — | — | — | 404 with corrective message |

Raw results: [`live-import-results.json`](../evidence/live-import-results.json), [`next-import-results.json`](../evidence/next-import-results.json). Screenshots: [`live import`](../evidence/live-import-desktop.png), [`live lesson`](../evidence/live-lesson-desktop.png), [`Next.js dashboard`](../evidence/next-import-desktop.png). The Next.js case indexed all 37 eligible files from 46 total files, produced five concepts and 48 import edges, and generated a four-step source-template lesson. Reproduce with `npx tsx scripts/verify-next.ts` while the app is running. This broadens coverage beyond small libraries but does not validate arbitrary large monorepos or the imported application's runtime correctness.

## Retrieval and ordering

| Metric | Initial approach | Current approach |
|---|---:|---:|
| Expected file in top-three results, five development questions | 4/5 | 5/5 |
| Exact source matching for retrieved excerpts | All matched | All matched |
| Prerequisite inversions | Alphabetical: 2 | Ranked: 0 |

See [experiment notes](EXPERIMENT_NOTES.md) and raw `evidence/evaluation-*.json`. The same questions informed the retrieval fix, so this is not an unbiased generalization estimate. Citation existence does not prove citation relevance, claim accuracy, or useful pedagogy.

## Stage 2 paired model experiment — November 25, 2026

Frozen protocol: [`stage2-evaluation-manifest.json`](../evidence/stage2-evaluation-manifest.json), committed before execution in `8dbde47`. Ten questions × two conditions, same Gemini alias, intermediate prompt, temperature 0, 1,800 output cap, schema/citation validator, cache off and routing off. Calls were paced and charged against hosted quotas. The actual observed serving model was `gemini-3.5-flash-lite`. Four questions use a real pinned repository held out from the earlier retrieval tuning; its source was inspected during development, so it is not an independently authored dataset.

| Observed measure | Limited-context baseline | SYNAPSE retrieval |
|---|---:|---:|
| Attempted calls | 10 | 10 |
| Schema/citation-accepted responses | 9 | 7 |
| Accepted abstentions | 9 | 2 |
| Accepted non-abstaining answers | 0 | 5 |
| Upstream HTTP 503 | 1 | 2 |
| Invalid-citation rejection | 0 | 1 |
| Median wall latency, all attempts | 2,876.5 ms | 2,790 ms |
| Input tokens, accepted responses only | 8,108 | 5,630 |
| Candidate output tokens, accepted only | 1,025 | 1,751 |
| Gateway cost estimates, accepted only | $0.001026 | $0.001150 |

These are single-run observations, not statistically reliable speed, cost or accuracy gains. The baseline's first two files supplied insufficient evidence for all nine completed answers; the retrieval condition provided usable evidence for five accepted answers. The pagination case still abstained because its retrieved excerpt did not contain the relevant function. One returned answer fabricated or miscopied a citation and was rejected. Valid citations only prove text matches. No independent technical-accuracy, relevance, unsupported-claim or pedagogical scores have been assigned.

Full final answer text, contexts, failure outcomes and telemetry: [`stage2-evaluation-results.json`](../evidence/stage2-evaluation-results.json). Summary: [`stage2-evaluation-summary.json`](../evidence/stage2-evaluation-summary.json). Private native envelopes retain complete gateway receipts locally and are not published. Reported totals exclude failed/rejected responses, are gateway estimates rather than invoices, and exclude unreported thought tokens. No retries or successful-only substitutions were made.

Direct Gemini-versus-Prune was **not run**: no direct Gemini credential is available outside Prune Vault. The cache probe separately observed ten exact-cache hits with zero estimated cost; it is not an uncached latency comparison or proof of financial savings.

## Stage 2 hosted and live checks

- 91 unit/SQL/security tests passed; typecheck, lint and webpack build passed; dependency audit reported zero vulnerabilities.
- Twelve regression/accessibility browser checks passed with external services disabled. Separate Chrome checks used the compiled app, actual Prune calls and hosted Supabase records.
- Sixteen hosted database checks passed with two real anonymous accounts, including RLS, forged ownership, refresh, deletion, lock contention, stale-worker fencing, protected quota counters and deployment-wide atomic minute limits. Email delivery was not tested.
- A real hosted Next.js import persisted 37 files, 48 edges and 11 valid citations, survived client reload, and returned 404 to another session.
- Three generated lesson levels passed source validation. A 25-second timeout and an invalid tutor citation are retained as failures; increasing the configured maximum to 45 seconds allowed the larger response. Visual inspection identified repeated narration; the prompt/schema and cache version were corrected and the real browser flow passed again.
- Prune receipt verification returned `valid:true` for the full receipt; the public artifact is a redacted excerpt, not an independently verifiable signature payload. Dashboard inspection confirmed $1/day, 10/minute and anomaly settings. A bounded uncached test produced 9 successes, 1 actual Shield `429/rate_limit`, and 1 timeout. The spend cap was not exhausted.

## Protected preview verification

The [preview](https://synapse-learning-qr1qac164-pranav-pokkulas-projects.vercel.app) passed 16 checks: Vercel Authentication redirect, hosted session and no-store responses, two-account persistence/isolation, CSRF, real generated lesson and distinct narration, persisted cache, real browser animation and mobile layout, live tutoring, deletion and signed-out denial. `evidence/preview-results.json` records outcomes; `preview-mobile-check.json` separately verifies the settled responsive layout. Error/fatal runtime-log lookup returned no entries in the inspected window. Six further actual preview assessment checks passed: new hosted identity, bounded concurrent progress/grading, retry after the winning write, repeated-answer mastery unchanged, attempts surviving reload, and record deletion. See `preview-assessment-results.json`. These checks do not include real email OTP delivery.

## Review and interpretation

I reviewed SYNAPSE's development and product behavior throughout the project. On November 26, 2026, I personally tested browser narration and watched and approved the complete 3:03 silent demonstration. That ongoing review is distinct from an independently scored evaluation: there is no recorded independent factual-accuracy benchmark, learner study, or formal scoring of the selected explanations and code changes.

Model-response structural validation is **not independent factual accuracy scoring**. It checks output shape and source quotation, not whether every interpretation is correct. I interpret the paired experiment as evidence that selecting relevant excerpts can make a small, constrained tutor more useful than supplying the first two files. It does not establish superiority over an assistant given the full repository, or improved learning outcomes.

## Public sample release — November 26, 2026

The expanded suite passed 98 unit/SQL/security/public-mode tests, 12 full-studio browser regressions and 22 signed-out public-sample browser/security checks. These counts describe separate scopes, not a single count of independent experiments. The public checks cover animation, source-template guidance, practice/reload, browser isolation, mobile accessibility and direct API/auth denial. They do not exercise paid AI or hosted storage. Results are in [`release-browser-results.json`](../evidence/release-browser-results.json) and [`production-verification.json`](../evidence/production-verification.json); the current configuration is documented in the [release audit](RELEASE_AUDIT.md).
