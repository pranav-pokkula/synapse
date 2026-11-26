# Build journal

## 2026-11-25 — live services and hosted controls (M2–M5)

Verified TraceEval / synapse-learning (`fcwyithhipsimrnccqsy`) through the authenticated Supabase CLI. The connector remains scoped to Adugu; no unrelated project was changed. A remote dry run listed exactly the two reviewed migrations. The user approved them, and both were applied unchanged. Advisors returned no findings. A subsequent configuration diff and push changed only `auth.enable_anonymous_sign_ins`; eleven undeclared remote settings were left unchanged.

Sixteen hosted checks passed with two actual anonymous identities: persistence, ownership isolation, forged-owner rejection, refresh, concurrent locks, stale-worker fencing, protected quotas, deletion, and an atomic deployment-wide 8/minute ceiling. Email OTP delivery is not covered. A real hosted import persisted 37 files, 48 edges and 11 valid source citations at pinned SHA `fe026711c19ac3ee4589c86a738f59b84e611559`, over seven checkpoints; another session received 404.

Prune's Gemini route returned a native Gemini envelope despite accepting the chat-completions request shape. Added a bounded parser for both formats, ignoring thought parts/signatures. A real source-grounded response passed and its full receipt was verified through Prune's verification endpoint. The user personally reviewed the saved actual-key Shield configuration: $1/day UTC, 10/minute, anomaly detection enabled, successful Gemini requests. This is human configuration review, not human review of generated teaching or code.

The initial 25-second lesson attempt timed out safely. A 45-second configured limit produced three actual lesson levels; each passed exact citation checks. One later tutor output failed exact citation validation and was rejected. Another real-repository tutor answer and generated animation/transcript completed in Chrome; the saved lesson reloaded from hosted storage. Visual inspection found repetitive generated step captions, so the lesson contract and prompt were tightened to require distinct narration, with cache versioning and a regression test. This is agent review, not independent human scoring.

The bounded exact-cache Shield probe returned one provider response and ten zero-estimated-cost cache hits without 429. It demonstrates caching, not uncached rate enforcement. Initial probe timeout and subsequent negative tests remain in the evidence. No spend cap was deliberately exhausted.

The original 88 unit/SQL checks, 12 browser regression/accessibility checks, typecheck, lint, webpack build, and dependency audit passed. The distinct-caption regression is being checked separately before preview. Browser regression used isolated development services disabled; hosted live checks used the compiled production server. Stage 2 model evaluation questions were committed in `8dbde47` before execution. Human content review and scoring remain pending.

Created only the new protected Vercel project `synapse-learning`, with Node 22 and preview-only environment values transferred via CLI stdin. `.env.local`, raw receipts, auth state, and local storage are excluded from uploads. Production is not promoted.

## 2026-11-25 — Stage 2 environment audit (M1)

Remote `main` still points to `1aa32d9cef8bb64f4b336d3068401b2c4bd8430c`. Work continues on `stage2/live-intelligence`; the existing generated `next-env.d.ts` development-path change was present before this stage. Re-ran strict typecheck, lint, and all 68 unit/integration/security tests successfully. Browser/build counts from November 22 remain historical until rerun.

Required Prune and Supabase environment entries are present; values were not printed. The Prune endpoint and observed model match the user's requested configuration. The connected Supabase account still exposes only Adugu and its unrelated project, not TraceEval / Synapse learning. Requested reconnection or confirmation of the dedicated local project identity; no database changes were made. The intended Vercel team was verified and has no existing SYNAPSE project.

Rechecked the official event page, rules, and full rubric: November 28 at 6 PM Eastern; 20/30/30/20 scoring; public source, a 2–4 minute demo, accurate disclosures, team roster, and individual contact forms remain required. Prune usage must be demonstrated for its sponsor award. Production promotion and Devpost submission require the user's explicit approval.

## 2026-11-22 — isolated project start

Workspace was empty. Node 22.22.0 is installed. No pre-existing project code was copied. Official Devpost rules and full rubric checked. Only connected Supabase project belongs to ADUGU and will not be touched. No model API credentials are present in the environment.

Architecture: Next.js App Router, TypeScript structural parsing, bounded GitHub REST ingestion, safe structured lessons and SVG scenes, browser speech synthesis, Supabase per-owner persistence with a local filesystem fallback for development. Models remain optional for the supported sample; fixture and deterministic output are explicitly labeled.

External setup pending: separate Supabase project / organization choice; model provider credentials; public repository and hosting after verification.

## First working vertical slice — source to learning

Implemented the isolated Next.js app, public landing page, learning studio, fixture, safe animation player, narration controls, assessments, local per-session persistence, GitHub batch ingestion, static import graph, citation validation, and source template guide. Supabase project creation was attempted only after the user authorized a free project; the quoted cost was $0 but the account-wide two-project limit blocked creation. No existing project was paused, changed, or removed. The user deferred model selection.

Verification: 57 unit/integration tests passed, including actual SQL RLS semantics in PGlite with a stub auth identity. Browser sample journey, four responsive sizes, and cross-session isolation passed. Axe contrast failures were found and fixed, then the accessibility test passed. Local POSTs initially failed because the expected origin differed; `.env.local` now explicitly sets the documented origin. TypeScript 7 lacked the compiler API, so TypeScript 6 was pinned. Turbopack production CSS worker failed despite an escalated retry; the supported webpack build is being verified.

Live imports succeeded for `sindresorhus/is-absolute-url` (4 files), `sindresorhus/is-plain-obj` (6), and `lukeed/clsx` (10). Reimport reused the exact first snapshot. Invalid host returned 400 and nonexistent repository returned 404. Raw outcomes: `evidence/live-import-results.json`.

Initial retrieval evaluation retrieved the expected file in 4/5 top-three results; the validation question failed. Stopwords and morphological differences were investigated; token normalization and inverse-frequency weighting are being tested against the same questions. This is development-set tuning, not held-out evidence.

## Reliability and evaluation milestone

Commit `8392bdf` records the first working slice. Expanded security coverage reached 68 passing tests. The development browser suite reached 10 passing checks, including native narration start/end events, actual animation packet movement, source-output escaping, data deletion, four responsive sizes, and axe scans. The webpack production build passed. Dependency audit reported zero vulnerabilities. Retrieval tuning reached 5/5 on the same development questions; human/held-out and model evaluation remain pending.

The first real demo recording uncovered a persistent `?connect=1` deep link that reopened the import dialog after a later reload. Fixed by consuming the entry parameter and added a regression test. That failed recording is not a completed deliverable. A corrected recording is in progress.

## Production verification and demonstration

The corrected production build passed all 11 Chrome checks. A transient contrast failure during theme color interpolation was eliminated by removing the background-color transition; both settled and changing themes retain legibility. Typecheck, lint, 68 unit/integration/security checks, and webpack build passed. The corrected real demo recorder completed its full sequence, including import, animation, feedback, and progress after reload. It is a silent captioned capture; no public video upload or Devpost submission has occurred.

## Publication and final local verification

Commit `c4a2f36` published the implementation and measured evidence to the new public `pranav-pokkula/synapse` repository. Its GitHub Actions run `45041176859` passed. No existing repository was modified.

Final fixes reject invalid assessment answer types and nonexistent choice indexes, persist ungraded short-answer practice separately, restart replay even when the first step is already playing, and clear stale import notices when changing projects. The compiled production build passed 12 browser checks; strict checking, lint, and all 68 Vitest checks also passed. The corrected captioned demo is 163.84 seconds; it has no captured narration or public upload.

Added and executed a separate real Next.js import check against Vercel's public dashboard template at `fe026711c19ac3ee4589c86a738f59b84e611559`. Seven saved checkpoints indexed 37 eligible files, discovered 48 import edges and five concepts, validated 11 citations, and returned an intermediate four-step lesson. Inspected the actual imported-project screenshot. This does not establish correctness of that application's auth/database runtime or generalize to all monorepos.
