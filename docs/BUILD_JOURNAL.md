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
