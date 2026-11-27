# Repository inventory and deletion record

Audited all 135 tracked files at `8600782` before final release edits. New public-mode implementation, tests and release documents are intentional additions and appear in the release diff.

**Deleted files: none.** No tracked artifact was confirmed unnecessary. Similar screenshots cover different viewport sizes, themes, versions or verification runs. Initial and final experiment records preserve failures and tuning history. The gallery copy is retained as the stable submission filename explicitly requested by the owner. Test tools and migrations are retained for reproducibility.

Private `.env*` files (except the blank template), `.synapse/`, `.vercel/`, Supabase CLI temporary state, browser traces and local video recordings remain ignored. `.vercelignore` additionally excludes documentation, research evidence, tests, CI, scripts and migration assets from deployment uploads; they remain in GitHub. No database, migration or historical dataset was deleted.

## Application and UI (35)

<details>
<summary>File inventory</summary>

- `app/api/account/route.ts`
- `app/api/assessment/route.ts`
- `app/api/import/[id]/route.ts`
- `app/api/import/route.ts`
- `app/api/lesson/route.ts`
- `app/api/progress/route.ts`
- `app/api/project/[id]/route.ts`
- `app/api/session/route.ts`
- `app/api/tutor/route.ts`
- `app/auth/callback/route.ts`
- `app/error.tsx`
- `app/globals.css`
- `app/icon.svg`
- `app/layout.tsx`
- `app/learn/page.tsx`
- `app/not-found.tsx`
- `app/page.tsx`
- `components/architecture.tsx`
- `components/brand.tsx`
- `components/player.tsx`
- `components/studio.tsx`
- `lib/analysis.ts`
- `lib/errors.ts`
- `lib/github.ts`
- `lib/http.ts`
- `lib/learning.ts`
- `lib/lesson-provider.ts`
- `lib/model-transport.ts`
- `lib/project.ts`
- `lib/provider.ts`
- `lib/ranking.ts`
- `lib/sample.ts`
- `lib/store.ts`
- `lib/supabase.ts`
- `lib/types.ts`

</details>

## Runtime/build configuration (10)

<details>
<summary>File inventory</summary>

- `.env.example`
- `.gitignore`
- `.vercelignore`
- `eslint.config.mjs`
- `next-env.d.ts`
- `next.config.ts`
- `package-lock.json`
- `package.json`
- `postcss.config.mjs`
- `tsconfig.json`

</details>

## Tests and CI (10)

<details>
<summary>File inventory</summary>

- `.github/workflows/ci.yml`
- `e2e/journey.spec.ts`
- `playwright.config.ts`
- `tests/cloud-controls.test.ts`
- `tests/core.test.ts`
- `tests/generated-lessons.test.ts`
- `tests/ingestion.test.ts`
- `tests/persistence.test.ts`
- `tests/security.test.ts`
- `vitest.config.ts`

</details>

## Supabase migrations/config (3)

<details>
<summary>File inventory</summary>

- `supabase/config.toml`
- `supabase/migrations/20261122102555_learning_records.sql`
- `supabase/migrations/20261125202233_cloud_concurrency_and_budget.sql`

</details>

## Reproduction and verification scripts (17)

<details>
<summary>File inventory</summary>

- `scripts/configure-preview.mjs`
- `scripts/evaluate-stage2.ts`
- `scripts/evaluate.ts`
- `scripts/probe-prune.ts`
- `scripts/record-demo-stage2.ts`
- `scripts/record-demo.ts`
- `scripts/scan-secrets.mjs`
- `scripts/verify-hosted-assessment.ts`
- `scripts/verify-hosted-import.ts`
- `scripts/verify-hosted.ts`
- `scripts/verify-live-browser.ts`
- `scripts/verify-live.ts`
- `scripts/verify-next.ts`
- `scripts/verify-preview-mobile.ts`
- `scripts/verify-preview.ts`
- `scripts/verify-prune-limits.ts`
- `scripts/verify-stage2.ts`

</details>

## Research and presentation evidence (49)

<details>
<summary>File inventory</summary>

- `evidence/demo-animation.png`
- `evidence/demo-final.png`
- `evidence/demo-opening.png`
- `evidence/demo-recording.json`
- `evidence/devpost-gallery.png`
- `evidence/evaluation-initial.json`
- `evidence/evaluation-results.json`
- `evidence/hosted-database-results.json`
- `evidence/hosted-import-results.json`
- `evidence/human-review-sheet.csv`
- `evidence/import-error.png`
- `evidence/lesson-1366.png`
- `evidence/lesson-1920.png`
- `evidence/lesson-390.png`
- `evidence/lesson-768.png`
- `evidence/lesson-dark.png`
- `evidence/live-import-desktop.png`
- `evidence/live-import-results.json`
- `evidence/live-lesson-desktop.png`
- `evidence/narration-results.json`
- `evidence/next-import-desktop.png`
- `evidence/next-import-results.json`
- `evidence/overview-1366.png`
- `evidence/overview-1920.png`
- `evidence/overview-390.png`
- `evidence/overview-768.png`
- `evidence/playwright-results.json`
- `evidence/preview-assessment-results.json`
- `evidence/preview-desktop.png`
- `evidence/preview-mobile-check.json`
- `evidence/preview-mobile.png`
- `evidence/preview-results.json`
- `evidence/progress-desktop.png`
- `evidence/prune-receipt-verification.json`
- `evidence/prune-shield-results.json`
- `evidence/prune-shield-uncached-results.json`
- `evidence/secret-scan-results.json`
- `evidence/stage2-browser-initial.json`
- `evidence/stage2-browser-results.json`
- `evidence/stage2-demo-final.png`
- `evidence/stage2-demo-recording.json`
- `evidence/stage2-deployment.json`
- `evidence/stage2-evaluation-manifest.json`
- `evidence/stage2-evaluation-results.json`
- `evidence/stage2-evaluation-summary.json`
- `evidence/stage2-live-initial-timeout.json`
- `evidence/stage2-live-lesson.png`
- `evidence/stage2-live-results.json`
- `evidence/vitest-results.json`

</details>

## Documentation and instructions (11)

<details>
<summary>File inventory</summary>

- `AGENTS.md`
- `README.md`
- `docs/AI_DEVELOPMENT_LOG.md`
- `docs/ARCHITECTURE.md`
- `docs/BUILD_JOURNAL.md`
- `docs/DEMO_SCRIPT.md`
- `docs/DEVPOST_SUBMISSION.md`
- `docs/EVALUATION_REPORT.md`
- `docs/EXPERIMENT_NOTES.md`
- `docs/FINAL_REVIEW_PACKET.md`
- `docs/RELEASE_AUDIT.md`

</details>
