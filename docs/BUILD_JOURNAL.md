# Build journal

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
