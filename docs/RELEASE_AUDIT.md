# Release audit — Stage 2, November 25, 2026

Live services are verified locally and the protected Vercel preview is deployed; all 16 preview end-to-end checks passed. This is not a claim of production or submission readiness.

## Executed evidence

| Capability | Actual result |
|---|---|
| Dedicated Supabase | Verified TraceEval / synapse-learning, `fcwyithhipsimrnccqsy`; both explicitly approved migrations applied unchanged; advisors found no issues |
| Auth and persistence | 16 real hosted anonymous-account checks passed; refresh, RLS, forged ownership, deletion, concurrency and global minute ceiling included |
| Repository import | Hosted seven-checkpoint import: 37 files, 48 edges, 11 exact citations; reload passed; other identity received 404 |
| Prune tutoring | Native Gemini parser fixed; real source-grounded answers passed; malformed citations rejected |
| Generated teaching | Three levels generated; safe three-node scenes, distinct captions, shared narration, versioned cache; real repository browser flow passed |
| Shield | User-confirmed saved $1/day UTC, 10/minute and anomaly detection; uncached rate probe observed real `429/rate_limit`; one timeout retained |
| Central limits | Fixed PostgreSQL limits of 8 model reservations/minute, 50/day UTC, 55 GitHub requests/hour; per-user limits retained; unavailable controls fail closed |
| Unit/security/SQL | 91 passed across six files; strict typecheck and lint passed |
| Browser/accessibility | 12 regression checks passed in isolated development mode; separate actual-service Chrome checks passed against compiled local app |
| Build/dependencies | Webpack build passed; audit reported zero vulnerabilities |
| Baseline | 20 real paired calls completed; all outcomes retained; 16 accepted responses, 3 upstream 503s, 1 citation rejection; human scoring pending |
| Hosting | Protected first bootstrap expressly approved, created with --skip-domain and no production service credentials; aliases empty. Protected preview built from implementation `ef87c9f`; 16 primary checks plus 6 hosted-assessment checks passed, including private sessions, isolation, live lessons/tutoring, mobile layout, grading retries, deletion and signed-out denial |

## Security boundaries and residual risks

Imported source is data, never executed. Fixed GitHub host, redirects refused, byte/file limits, safe JSON scene schema, React escaping, origin checks, private/no-store API responses and per-request validated Supabase clients remain in place. The web app has no service-role key. Owner-scoped expiring locks and fenced writes prevent stale checkpoint overwrites; direct quota modification is denied.

An authenticated user can consume reservation quota to deny availability, but cannot enlarge the ceilings. Anonymous users and JWTs are not removed by learner-data deletion; an operation already in flight can recreate data after deletion. Email OTP delivery, account migration/revocation and CAPTCHA remain unverified. Source citation matching does not establish semantic accuracy, safe runtime behavior or learning benefit. Static indexing and selected excerpts can miss important functions. Cached-output revalidation checks source matches, not claim entailment.

The $0.01 internal per-call reservation is accounting, not a provider-price guarantee. The $1 Shield setting was personally reviewed by the user and not deliberately exhausted. Cache hits did not trigger the uncached rate limit. No unrestricted public AI, unrelated project changes or production domain promotion occurred.

## Remaining human gates

Independent source/teaching review and benchmark scoring; human narration listening; final demo review/public video upload; team roster and contact forms; explicit approval before production promotion or Devpost submission. The user’s configuration review does not fulfill the event’s separate code/content human-review criterion.

Evidence lives in `evidence/hosted-*.json`, `stage2-*.json`, `prune-*.json`, screenshots and the evaluation report. Raw native receipts, authentication state and environment credentials remain ignored locally. Reported cost figures are gateway estimates, not independently reconciled billing.

Protected preview: [https://synapse-learning-qr1qac164-pranav-pokkulas-projects.vercel.app](https://synapse-learning-qr1qac164-pranav-pokkulas-projects.vercel.app). Runtime error/fatal log query returned no entries during the verification window; this is not a guarantee that future requests cannot fail. Initial screenshot capture caught a responsive sidebar transition; the settled mobile layout was separately verified and recaptured.

Rapid navigation followed immediately by grading can return a safe `409/JOB_BUSY` while progress saves; the UI asks for a retry. The added six-check hosted assessment run verified retry after the winning write, persisted attempts, non-inflating mastery and cleanup. No automatic model retry was added.

Completed local demo: `evidence/synapse-stage2-demo.mp4`, 182.80 seconds, silent with captions. Public upload and human review remain pending.

## Final submission preparation audit — November 26, 2026

Audited PR head `0833acd215ca021c082eb9f80a3d9233e8fb78c5`: both push and PR CI runs succeeded. Vercel reports protected preview `dpl_EHvrfHud13EAYEsVv3qYCvt6V5r2` READY at `ef87c9f58d8d7fb0cfa4249b0bc860fe414c66ec`. Compared app, components, lib, Next configuration, package manifest and lockfile: no differences. Subsequent submission preparation changes only documents and evidence. A new protected preview is unnecessary.

Reviewed source/citation rejection, safe scene validation, origin/body limits, authenticated identity, ownership policies, locks and quotas against the existing security tests and hosted results. No new release-blocking application defect was identified in this focused audit; this is not a comprehensive penetration test. Existing privacy/concurrency limits above remain disclosed. Reran the secret-value scan with zero findings and the 91-test suite; no new model evaluation, provider charge, migration or deployment was initiated.

The MP4 exists: H.264 video, 1440 × 1000, 182.80 seconds, 3,068,348 bytes, no audio stream. Full decode passed. Sampled frames show readable overview, saved lesson and captions; earlier verified frames show grading and reloaded cloud progress. This is sampled visual inspection, not human listening or a completed human video review. A visible temporary sync warning needs the short explanatory text supplied in FINAL_REVIEW_PACKET.md and the final Devpost answer. The smallest correction is that clarification next to the embedded video; no re-recording is required. The video itself is unchanged.

Prepared a genuine gallery image at `evidence/devpost-gallery.png`, copied without modification from the actual generated-lesson screenshot. It is suitable as a gallery image; it is not labeled a 3:2 thumbnail. No synthetic UI or claims were inserted.

Entry-material blockers: an accessible embedded video URL (user upload), verified participant eligibility/roster/private forms, final truthful copy review and submission approval. Human content/code/audio review remains a requested review action and scoring limitation, not an invented entry requirement. Public production hosting, email OTP and merging PR #1 are not entry blockers. PR remains draft and unmerged; it can be marked ready for code review without authorizing merge or promotion.
