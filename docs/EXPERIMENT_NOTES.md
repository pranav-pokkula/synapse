# Experiment notes

## 2026-11-22: retrieval and learning-order checks

Hypothesis: structural indexing and selective retrieval can surface implementation evidence more reliably than a constrained overview; prerequisite-aware order avoids introducing dependencies before foundations.

Dataset: the embedded nine-file Fieldnotes teaching fixture, content hash `8aefd6113809f700adc03f3d4f29e6a030165cea`. Six predeclared questions: five source-location questions plus an unanswerable production-region/uptime question. This small author-created dataset is not independently reviewed.

Procedure: `npm run evaluate`. For each answerable question, check whether the expected file appears in the top three retrieved excerpts, validate exact citation text, and record retrieval time. Compare alphabetically ordered concepts with prerequisite-aware order using prerequisite inversions. These proxy metrics do not measure teaching effectiveness.

Initial result: 4/5 retrieval hits. “Where is the note body validated and what limits are applied?” missed `lib/validation.ts`. Generic question words matched larger files, and “validated” did not match “validation.” The initial measurements are preserved in `evidence/evaluation-initial.json`.

Change: remove common question words, split camelCase, normalize a limited set of suffixes, weight rarer terms, and de-prioritize test files unless the query asks about tests. Result on the same development questions: 5/5 top-three hits; every returned excerpt matches source. This is **development-set tuning**, not a held-out improvement claim. Alphabetical order had two prerequisite inversions; SYNAPSE had zero. No measured learner outcome is claimed.

## From deterministic checks to a paired model experiment

The initial November 22 evaluation covered retrieval and ordering without model calls. An optional twelve-call harness exists in `scripts/evaluate.ts`, but it is not the source of the model results reported here. The later frozen protocol in `scripts/evaluate-stage2.ts` executed twenty calls on November 25, with all outcomes retained. See the [evaluation report](EVALUATION_REPORT.md) for the exact figures and the difference between source validation and independent accuracy scoring.

I kept the deterministic checks separate from generated-answer evaluation so a retrieval fix would not be presented as a measured improvement in teaching quality. Independent reference answers and learner studies would be needed to test that broader claim.

## Failure and implementation findings

- TypeScript 7 compiler API incompatibility: fixed by pinning TypeScript 6.
- Browser POSTs initially rejected due to origin mismatch: documented exact `APP_ORIGIN` and verified the complete flow after correction.
- Badge contrast failures: measured by axe, fixed, and rerun in light/dark lesson views.
- Retrieval unit check initially ranked a validation test above its implementation: fixed with intent-sensitive test weighting.
- Turbopack production worker failed even after permitted retry: supported webpack build succeeded.
- Supabase quoted $0 but rejected creation due to account-wide active-project quota. Existing projects were left untouched; SQL semantics were initially checked in PGlite. The later dedicated TraceEval / synapse-learning project passed 16 hosted authentication, persistence, isolation and concurrency checks.
- Native Chrome speech emitted start and end events. I subsequently tested audible browser narration on November 26. The separate demonstration file is silent.

## Stage 2 protocol and measured failures — November 25, 2026

Protocol committed as `8dbde47` before paired execution. Ten questions (six prior development fixture questions, four real-repository questions held out from retrieval tuning), two conditions, same model alias/prompt/schema/level/temperature/output cap. Condition order alternates. Baseline supplies the first two files; SYNAPSE supplies three retrieved excerpts. App and gateway caches are bypassed and routing is off. Calls are paced at least nine seconds apart and consume hosted daily/minute quotas. No retries or model self-grading. Source was inspected during development; this is not independently authored or adjudicated evaluation.

Raw final model text, excerpts, validation outcomes and per-call telemetry are retained in `stage2-evaluation-results.json`; full native envelopes remain ignored locally because they may contain hidden signatures and tenant identifiers. Direct Gemini-versus-Prune is not run because the Gemini credential is held in Prune Vault and no direct credential is configured. Gateway estimates are not reconciled bills. Valid citations do not establish learning gains or factual accuracy.

Failures observed before the benchmark: initial 25-second connectivity/lesson timeouts; Prune native Gemini envelope rejected by the old OpenAI-only parser (fixed); one actual tutor response rejected for invalid citation; four repeated generated narration captions (prompt/contract corrected). The exact-cache rate probe had ten cache hits and no 429. The separate uncached probe produced nine 200s, one Shield 429 (`rate_limit`) and one 45-second timeout. No dollar cap was deliberately exhausted. I confirmed the saved $1/day, 10/minute and anomaly settings for the actual key.

The configured 45-second timeout allowed three source-validated lesson levels: observed response latencies 37,384 / 4,157 / 3,594 ms and candidate output tokens 533 / 735 / 594. These are individual observations, not a statistically controlled level comparison. The first result may include startup/network variance; its cause is unproven. These results have no independent factual-accuracy or pedagogy ratings; the separate browser narration review does not supply those ratings.

## Reliability findings retained from development

- The first demo exposed a persistent `?connect=1` entry parameter that reopened the import dialog on reload. Consuming the parameter and adding a regression check corrected that behavior.
- A transient contrast failure during theme interpolation was resolved by removing the background-color transition. Invalid answer types and nonexistent choice indexes were rejected; short-answer practice was kept separate from scored mastery; replay and stale import notices were corrected.
- Repeated upstream model 503s led to a clearer temporary-gateway error message, separate from credential/configuration errors. The original three benchmark 503s and one rejected citation remain in the dataset.
- Preview verification initially treated only one protection-response form as valid; it was corrected to recognize the actual Vercel SSO redirect. A later expired verification token reached a sign-in page; requiring a cloud JSON response prevented its HTTP 200 from being mistaken for successful application authentication.
- An early mobile capture caught the sidebar during a transition. A separate settled-layout check verified its hidden geometry and captured the hosted lesson again.
- The updated demo first stopped at an overly strict navigation selector, then encountered a real `409/JOB_BUSY` while navigation progress held the grading lease. The final recorder follows the visible retry instruction after a bounded pause. Six additional hosted checks verified retry, durable attempts, non-inflating mastery and deletion; the application did not require a concurrency change.
- The final 182.80-second recording retains a temporary progress-sync warning. Progress stayed in the browser during that request; the graded result subsequently saved to hosted storage and survived reload. See the [demonstration notes](DEMO_SCRIPT.md).

The original measurements, rejected responses and failure artifacts are retained in [`evidence/`](../evidence/README.md). Historical records describe the state when captured; later results do not retroactively turn an earlier failure into a pass.
