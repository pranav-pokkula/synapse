# Evaluation report

Measured on 2026-11-22. Reproduce with `npm ci`, `npm test`, `npm run evaluate`, and the browser/live commands in the README. Node 22; pinned dependencies in the lockfile. All counts below refer to executed checks, not planned checks.

| Check | Observed result | Evidence |
|---|---|---|
| Unit / integration / security | 68 passed | `tests/*.test.ts`; Vitest execution |
| Browser journeys | 12 passed against the production build in installed Chrome | `evidence/playwright-results.json` |
| Viewports | 390, 768, 1366, 1920 px; no document overflow | `evidence/overview-*.png`, `lesson-*.png` |
| Accessibility | No axe WCAG A/AA violations in scanned overview, light lesson, dark lesson | Browser accessibility check; not a full accessibility certification |
| Native narration | 180 available voices; observed native start and end callbacks | `evidence/narration-results.json`; audible quality not human-reviewed |
| SQL ownership | Read/delete isolation, forged insert denial, reassignment denial, anonymous denial, quota permissions | PGlite tests with stub `auth.uid()`; hosted Auth not tested |
| Dependency audit | 0 reported vulnerabilities | `npm audit --json` |
| Production build | Passed with webpack | `npm run build`; Turbopack failure disclosed in journal |

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

## LLM comparison: incomplete

No provider/model was selected, no live model calls were executed, and no product-model costs were incurred by this run. The primary same-model baseline experiment has **no results yet**. Accuracy, unsupported-claim rate, model latency, token usage, usefulness, pedagogical clarity, and open-answer grading quality are unmeasured. The harness records these boundaries honestly rather than substituting deterministic template results for AI results.

## Human review: pending

No learner study, outside tester, person-reviewed AI contribution, or human listening review has occurred in this session. Review the fixture, citations, model benchmark outputs when available, and the demo before submission.
