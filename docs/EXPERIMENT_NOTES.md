# Experiment notes

## 2026-11-22: retrieval and learning-order checks

Hypothesis: structural indexing and selective retrieval can surface implementation evidence more reliably than a constrained overview; prerequisite-aware order avoids introducing dependencies before foundations.

Dataset: the embedded nine-file Fieldnotes teaching fixture, content hash `8aefd6113809f700adc03f3d4f29e6a030165cea`. Six predeclared questions: five source-location questions plus an unanswerable production-region/uptime question. This small author-created dataset is not independently reviewed.

Procedure: `npm run evaluate`. For each answerable question, check whether the expected file appears in the top three retrieved excerpts, validate exact citation text, and record retrieval time. Compare alphabetically ordered concepts with prerequisite-aware order using prerequisite inversions. These proxy metrics do not measure teaching effectiveness.

Initial result: 4/5 retrieval hits. “Where is the note body validated and what limits are applied?” missed `lib/validation.ts`. Generic question words matched larger files, and “validated” did not match “validation.” The initial measurements are preserved in `evidence/evaluation-initial.json`.

Change: remove common question words, split camelCase, normalize a limited set of suffixes, weight rarer terms, and de-prioritize test files unless the query asks about tests. Result on the same development questions: 5/5 top-three hits; every returned excerpt matches source. This is **development-set tuning**, not a held-out improvement claim. Alphabetical order had two prerequisite inversions; SYNAPSE had zero. No measured learner outcome is claimed.

## Primary LLM baseline experiment — not executed

The harness is ready to call the same configured model under two conditions: first-two-file overview versus retrieved source excerpts. Both use the same output schema, question set, explanation level, output ceiling, and citation validator. Provider selection was explicitly deferred by the user. There are no model-quality results, latency comparisons, token costs, or human scores to report.

After configuration, opt in with `RUN_LLM_EVAL=1 npm run evaluate`. This requests up to twelve model calls. The evaluator must manually rate accuracy, unsupported claims, citation relevance, usefulness, and pedagogical clarity against source; the harness deliberately does not let the model grade itself. Add held-out real repositories, adversarial comments, and independently reviewed references before claiming generalization.

## Failure and implementation findings

- TypeScript 7 compiler API incompatibility: fixed by pinning TypeScript 6.
- Browser POSTs initially rejected due to origin mismatch: documented exact `APP_ORIGIN` and verified the complete flow after correction.
- Badge contrast failures: measured by axe, fixed, and rerun in light/dark lesson views.
- Retrieval unit check initially ranked a validation test above its implementation: fixed with intent-sensitive test weighting.
- Turbopack production worker failed even after permitted retry: supported webpack build succeeded.
- Supabase quoted $0 but rejected creation due to account-wide active-project quota. Existing projects were left untouched; SQL semantics were checked in PGlite instead. Hosted authentication remains untested.
- Native Chrome speech emitted start and end events; human listening review remains pending.

## Stage 2 protocol and measured failures — November 25, 2026

Protocol committed as `8dbde47` before paired execution. Ten questions (six prior development fixture questions, four real-repository questions held out from retrieval tuning), two conditions, same model alias/prompt/schema/level/temperature/output cap. Condition order alternates. Baseline supplies the first two files; SYNAPSE supplies three retrieved excerpts. App and gateway caches are bypassed and routing is off. Calls are paced at least nine seconds apart and consume hosted daily/minute quotas. No retries or model self-grading. Source was inspected by the building agent; this is not independently authored or adjudicated evaluation.

Raw final model text, excerpts, validation outcomes and per-call telemetry are retained in `stage2-evaluation-results.json`; full native envelopes remain ignored locally because they may contain hidden signatures and tenant identifiers. Direct Gemini-versus-Prune is not run because the Gemini credential is held in Prune Vault and no direct credential is configured. Gateway estimates are not reconciled bills. Do not infer learning gains or accuracy from valid citations.

Failures observed before the benchmark: initial 25-second connectivity/lesson timeouts; Prune native Gemini envelope rejected by the old OpenAI-only parser (fixed); one actual tutor response rejected for invalid citation; four repeated generated narration captions (prompt/contract corrected). The exact-cache rate probe had ten cache hits and no 429. The separate uncached probe produced nine 200s, one Shield 429 (`rate_limit`) and one 45-second timeout. No dollar cap was deliberately exhausted. User review confirms saved $1/day, 10/minute and anomaly settings for the actual key.

The configured 45-second timeout allowed three source-validated lesson levels: observed response latencies 37,384 / 4,157 / 3,594 ms and candidate output tokens 533 / 735 / 594. These are individual observations, not a statistically controlled level comparison. The first result may include startup/network variance; its cause is unproven. Independent human ratings and audible narration review remain pending.
