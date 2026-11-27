# Release audit

SYNAPSE has two distinct deployment scopes: a public browser-only sample and a protected full workspace with live GitHub imports, Prune/Gemini and Supabase persistence. I chose this separation to make the learning interface accessible without exposing unrestricted paid AI or anonymous cloud storage.

## Release identity

As verified on November 27, 2026, [public production](https://synapse-learning-one.vercel.app) resolves to deployment `dpl_83XkKZzzHaFUAjSreuJay4zXFWj8`, built from main commit `3adf40500cbbaf4695496f67a28284c2ffac6cb0`. Its application implementation matches merged PR #1 at `84983f462eca9ac660836f9029fc560a75da8df0`. The subsequent founder-voice cleanup changes documentation and evidence organization only; it does not require a new application deployment.

The [protected preview](https://synapse-learning-qr1qac164-pranav-pokkulas-projects.vercel.app), deployment `dpl_EHvrfHud13EAYEsVv3qYCvt6V5r2`, runs the verified full-workspace implementation `ef87c9f`. Production adds the browser-only sample and defensive production guards. This distinction is intentional; the preview is not a public demonstration of unrestricted AI.

Vercel Standard Protection remains `all_except_custom_domains`, protecting preview and generated deployment URLs while allowing the public production domain. Production has only the nonsecret sample switch; model and database credentials are preview-only. The project is not connected to Git deployment automation. See [configuration and reproduction](PUBLIC_RELEASE.md).

## Executed evidence

These results cover the November 25–26 implementation and release checks. Historical artifacts retain their original dates and counts.

| Capability | Actual result | Evidence |
|---|---|---|
| Hosted database | 16 checks with two real anonymous accounts: refresh, persistence, ownership isolation, forged-owner rejection, deletion, locks, stale-worker fencing and atomic global limits | [Hosted results](../evidence/hosted-database-results.json) |
| Repository import | Seven checkpoints persisted 37 files, 48 static edges and 11 exact citations; reload passed; another identity received 404 | [Hosted import](../evidence/hosted-import-results.json) |
| Generated teaching | Three explanation levels passed schema/source checks; native Gemini parsing and distinct-caption contract verified; timeouts and citation failures retained | [Live results](../evidence/stage2-live-results.json) |
| Prune | Full receipt verification returned `valid:true`; saved $1/day UTC, 10/minute and anomaly settings inspected; uncached probe observed 9 successes, 1 Shield 429 and 1 timeout | [Receipt](../evidence/prune-receipt-verification.json), [uncached probe](../evidence/prune-shield-uncached-results.json) |
| Paired experiment | 20 attempted calls: 16 structurally accepted, 3 upstream 503s, 1 citation rejection; no independent accuracy scores | [Original results](../evidence/stage2-evaluation-results.json), [interpretation](EVALUATION_REPORT.md) |
| Unit/SQL/security | 98 tests passed, including production guards; strict typecheck and lint passed | [Tests](../tests), [CI workflow](../.github/workflows/ci.yml) |
| Full browser regression | 12 checks with external services disabled | [Browser results](../evidence/release-browser-results.json) |
| Protected preview | 16 end-to-end checks plus 6 additional hosted assessment checks: private sessions, live lessons/tutoring, isolation, mobile layout, recoverable grading conflict, reload and deletion | [Preview results](../evidence/preview-results.json), [assessment results](../evidence/preview-assessment-results.json) |
| Public production | 22 signed-out browser/security checks: sample behavior, storage separation, accessibility and API/auth denial | [Production results](../evidence/production-verification.json) |
| Build/dependencies | Full and public webpack builds passed; dependency audit reported zero vulnerabilities at release | [CI](https://github.com/pranav-pokkula/synapse/actions), pinned lockfile |
| Secrets | No configured server secrets or private-key blocks found in the scanned tracked text/client chunks | [Bounded scan](../evidence/secret-scan-results.json) |

Merged-main CI run [45919319963](https://github.com/pranav-pokkula/synapse/actions/runs/45919319963) and subsequent main run [45920048482](https://github.com/pranav-pokkula/synapse/actions/runs/45920048482) passed. These are historical run identities, not a claim about unexecuted later commits. Error/fatal runtime-log queries returned no entries in the inspected verification windows; that observation does not guarantee future requests cannot fail.

## Security boundaries and limitations

Imported source is data, never executed. Fixed GitHub hosts, refused redirects, byte/file limits, safe JSON scenes, React escaping, origin checks and private/no-store API responses constrain inputs. Per-request validated Supabase identities and RLS enforce ownership. No service-role key is used. Expiring owner-scoped leases and fenced writes prevent stale checkpoint overwrites; direct quota modification is denied. The two migrations remain unchanged and apply only to the dedicated TraceEval / synapse-learning project.

PostgreSQL enforces 8 model reservations/minute, 50/day UTC, 55 GitHub requests/hour and per-user model quotas. Unavailable controls fail closed. An authenticated client can consume reservation quota to deny availability, but cannot enlarge the ceilings. The $0.01 internal reservation is accounting, not a provider-price guarantee. The saved $1 Shield cap was inspected, not deliberately exhausted; cache-hit behavior does not prove uncached rate enforcement.

Learning-data deletion does not remove Auth users or revoke JWTs; an operation already in flight can recreate data afterward. Email OTP delivery, guest-to-account migration and account revocation are not verified; CAPTCHA is not implemented. Rapid navigation followed immediately by grading can return `409/JOB_BUSY`; the UI requests a retry and hosted checks verified recovery without inflated mastery.

Citation matching checks source text, not semantic accuracy, runtime behavior or educational benefit. Static indexing and bounded excerpts can miss important functions. The audit reviewed relevant boundaries against tests and hosted results; it is not a comprehensive penetration test or independent accuracy assessment.

## Demonstration and review scope

The local demo is H.264, 1440 × 1000, 182.80 seconds, 3,068,348 bytes, with no audio stream. Full decode and sampled readability inspection passed. It shows the full protected workspace. A temporary progress-sync warning remains visible; later grading saves to Supabase and survives reload. [Demonstration notes](DEMO_SCRIPT.md) explain the sequence. The [gallery image](../evidence/devpost-gallery.png) is an unmodified screenshot of a real generated lesson.

I reviewed product behavior throughout development and personally tested browser narration and approved the complete silent demo on November 26. Those reviews do not constitute independent benchmark scoring or a formal security audit. The twenty-call dataset remains unscored for factual accuracy and educational outcomes. Raw native receipt envelopes and authentication state remain ignored locally; public receipts are redacted and are not independently verifiable signature payloads.

## Documentation cleanup verification — November 27, 2026

The founder-voice cleanup preserved application source, tests, CI, verification scripts, migrations, original evaluation data, receipts and screenshots. Internal handoff documents and blank review worksheets were archived locally before removal from the current tree; no Git history was rewritten.

Local verification passed all 98 tests, lint, typecheck and the public production webpack build. The existing browser verifier passed all 22 checks against the live public domain; its fresh report is [`founder-cleanup-public-verification.json`](../evidence/founder-cleanup-public-verification.json). Original screenshots were retained unchanged. Local documentation targets resolved, external documentation links responded successfully, public production returned 200 and the signed-out preview redirected to Vercel SSO. Vercel's deployment identity, protection policy and environment targeting were unchanged. No paid model evaluation, database change or deployment was performed for this cleanup.

The configured-secret scan found zero matches in tracked/unignored text and generated client chunks; its exact scope and counts are recorded in [`secret-scan-results.json`](../evidence/secret-scan-results.json). The scan is bounded and does not replace a security audit.
