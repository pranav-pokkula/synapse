# Verification and experiment evidence

These artifacts preserve both successful and unsuccessful runs. Dates and counts belong to the recorded run; an early timeout or failed check is not replaced by a later success. The [evaluation report](../docs/EVALUATION_REPORT.md), [experiment notes](../docs/EXPERIMENT_NOTES.md) and [release audit](../docs/RELEASE_AUDIT.md) explain the scope and current conclusions.

| Evidence | Scope |
|---|---|
| `stage2-evaluation-manifest.json`, `stage2-evaluation-results.json`, `stage2-evaluation-summary.json` | Frozen twenty-call paired experiment, original generated answers/contexts, all failure outcomes and aggregate telemetry |
| `evaluation-initial.json`, `evaluation-results.json`, `release-deterministic-results.json` | Development-set retrieval and prerequisite ordering; not independent learning or accuracy measurements |
| `prune-receipt-verification.json` | Gateway verification of a full receipt; published excerpt is redacted, not an offline-verifiable signature payload |
| `prune-shield-results.json`, `prune-shield-uncached-results.json` | Separate exact-cache and uncached rate probes, including Shield 429 and timeout |
| `stage2-live-initial-timeout.json`, `stage2-live-results.json`, `stage2-browser-initial.json`, `stage2-browser-results.json` | Live integration attempts, generated lessons and browser outcomes, including earlier failures |
| `hosted-database-results.json`, `hosted-import-results.json` | Actual Supabase identities, persistence, ownership, concurrency, quotas and imported-source checks |
| `preview-results.json`, `preview-mobile-check.json`, `preview-assessment-results.json` | Protected deployment checks, settled responsive layout and grading-conflict recovery |
| `release-browser-results.json`, `public-verification.json`, `production-verification.json`, `production-security.json` | Full-workspace regressions, browser-only public behavior and deployed security checks |
| `live-import-results.json`, `next-import-results.json`, `playwright-results.json`, `vitest-results.json`, `narration-results.json` | Earlier imports, regression results and native speech callbacks; historical counts are preserved |
| `stage2-deployment.json` | Historical protected deployment metadata; current release identity is in the release audit |
| `demo-recording.json`, `stage2-demo-recording.json` | Recording metadata; videos are local, ignored artifacts rather than repository downloads |
| `founder-cleanup-public-verification.json` | Fresh 22-check run against public production during documentation cleanup; original screenshots retained |
| `secret-scan-results.json` | Latest bounded configured-secret and private-key scan; not a comprehensive security audit |
| PNG screenshots | Genuine application captures across versions, widths, themes, errors and live/generated flows |

The twenty-call experiment measured structural acceptance and exact source matching, not independently scored factual accuracy. Historical phrases such as “review pending” in raw outputs describe that capture's state. Later founder review of narration and the demo is documented separately and does not supply missing independent accuracy scores.

`devpost-gallery.png` is the actual generated-lesson gallery image. `preview-desktop.png` and `stage2-demo-final.png` show the protected workspace; `public-sample-desktop.png`, `public-architecture.png` and `public-sample-mobile.png` show the browser-only release. Earlier screenshots are retained where they support historical verification rather than presented as the latest UI.

Raw provider envelopes, unredacted signatures, credentials, browser authentication state and local learner records are excluded from Git. Benchmark text is retained as recorded, including rejected citations and upstream failures.
