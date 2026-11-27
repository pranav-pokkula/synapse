# Development approach and AI disclosure

I am Pranav Pokkula, the creator and developer of SYNAPSE. I established the project's direction, guided its product and technical decisions, and take responsibility for the finished application. I reviewed the work and product behavior throughout development, using OpenAI Codex as an assistant for implementation, debugging, tests, documentation and refinement.

The project began in an empty workspace on November 22, 2026, during the Global AI Builder's Challenge. Its application, teaching fixture, tests and evaluation harness were developed for the event. Frameworks, libraries and hosted services are pre-existing tools; no code was reused from my other projects. This was AI-assisted development, not a claim that I manually wrote every line.

## Decisions that shaped the implementation

**Make explanations inspectable.** I wanted learning to begin with the actual project. Bounded GitHub imports and a TypeScript structural index produce commit-pinned excerpts. Generated claims are checked against those excerpts, while the interface keeps references visible. Exact matches establish that quoted text exists; they do not independently validate the interpretation.

**Keep generation separate from execution.** Codex assisted the provider adapter, citation validation and constrained lesson schema. Gemini supplies text and scene data; application code handles indexing, validation, animation and scoring. No imported repository code or model-generated script is executed.

**Handle provider differences without weakening validation.** The first integration exposed a mismatch between OpenAI-style and native Gemini response formats. Supporting both envelopes preserved one validation contract, while excluding thought parts and signatures. Subsequent checks retained timeouts and invalid-citation failures rather than treating every response as a success.

**Preserve progress under concurrent work.** The hosted workspace uses Supabase ownership policies, expiring leases and fenced writes. These protect records across application instances. A simultaneous progress save and assessment can still return a recoverable conflict; hosted checks verified retry and persistence without inflating mastery.

**Make the public experience useful without exposing paid AI.** I chose a browser-only sample for public access and retained the complete AI/import/cloud workflow behind Vercel Authentication. The sample reuses the same deterministic learning components; production server routes fail closed.

## AI inside SYNAPSE

Google Gemini, accessed through Prune, generates structured tutoring and learning scenes from retrieved source excerpts. The observed serving model was `gemini-3.5-flash-lite`. Output validation, owner-scoped caching, bounded requests and usage limits surround generation. Clearly labeled source templates remain available without a model.

Codex's development assistance is distinct from this product integration. Repository indexing, source matching, rendering, quota enforcement and assessment scoring follow explicit application logic. Momen was not integrated.

## Review and evidence

I worked through the architecture, implementation choices and product behavior during development. I personally checked the saved Prune Shield settings and successful requests. On November 26, 2026, I tested browser narration and reviewed and approved the complete 3:03 silent, captioned demonstration.

Those checks and my ongoing involvement are distinct from an independently scored benchmark or a formal security audit. The recorded experiment measured structural acceptance and source matching; it did not independently score factual accuracy or educational outcomes.

Codex-assisted automated verification covered unit/SQL/security tests, browser workflows, accessibility scans, real imports, hosted isolation and provider integration. The [evaluation report](EVALUATION_REPORT.md), [experiment notes](EXPERIMENT_NOTES.md) and [release audit](RELEASE_AUDIT.md) distinguish measured results, failures and remaining limits.
