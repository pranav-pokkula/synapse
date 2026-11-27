# SYNAPSE — final Devpost copy

Prepared November 26, 2026. Final release status and URLs are in FINAL_SUBMISSION_HANDOFF.md. Copy the field values below, then the five numbered answers. Replace the video placeholder before submission. The owner approved browser narration and the complete silent demo; separate explanation/code review remains outstanding.

## Submission fields — copy these values

**Project title:** SYNAPSE

**Tagline:** Build knowledge from what you build.

**Project summary:** SYNAPSE helps students understand software they have built with AI assistance. It turns a public JavaScript or TypeScript repository into a source-linked learning path, with Prune-backed Gemini explanations, constrained animated lessons, optional browser narration and practice. Exact source excerpts make answers inspectable, while saved progress helps learners decide what to revisit. The current release includes honest failure reporting and a small, recorded baseline experiment; it does not claim measured learning gains.

**Built with:** Next.js, React, TypeScript, Tailwind CSS, Node.js, Supabase, PostgreSQL, Prune, Google Gemini, GitHub REST API, Vercel, Zod, Web Speech API, Playwright, Vitest. **Development assistance:** OpenAI Codex. Momen was not integrated; do not add it as a technology or award entry.

**GitHub repository:** https://github.com/pranav-pokkula/synapse

**Submitted code:** https://github.com/pranav-pokkula/synapse/tree/main

**Review PR:** https://github.com/pranav-pokkula/synapse/pull/1

**Public website:** https://synapse-learning-one.vercel.app — working browser-only sample, no sign-in or paid AI.

**Release implementation commit:** https://github.com/pranav-pokkula/synapse/commit/84983f462eca9ac660836f9029fc560a75da8df0

**Verified release CI:** https://github.com/pranav-pokkula/synapse/actions/runs/45919319963

**Protected full-workspace link:** https://synapse-learning-qr1qac164-pranav-pokkulas-projects.vercel.app

**Access disclosure:** Protected preview; requires authorized Vercel sign-in. The full AI/import/cloud workflow requires this protected access. The public browser-only sample at https://synapse-learning-one.vercel.app passed signed-out verification.

**Video URL:** [REPLACE WITH THE REAL YOUTUBE OR VIMEO URL AFTER YOU UPLOAD AND TEST EMBEDDING]

**Local video:** `evidence/synapse-stage2-demo.mp4` — 182.80 seconds, H.264, 1440 × 1000, silent captions; not an audio narration recording.

**Gallery image:** [devpost-gallery.png](../evidence/devpost-gallery.png), a genuine screenshot of the real imported repository’s generated lesson. It is a gallery image, not a 3:2 crop. Source: `evidence/stage2-live-lesson.png`; no synthetic elements or fabricated results added. Optional additional gallery: [mobile preview](../evidence/preview-mobile.png) and [progress](../evidence/stage2-demo-final.png).

## Award recommendations — not claims of winning or eligibility approval

Prioritize **Best Use of Prune**, **Best Developer Tool**, and **Best AI Knowledge & Research Tool**: they match the implemented gateway, repository-learning workflow and visible source evidence. **Best Design & User Experience** is a reasonable additional choice based on the existing interface and accessibility checks. Do not select Best Use of Momen. Do not portray this as an autonomous AI agent or a proven learning-outcome intervention. Confirm available selections in the submission form. [Official award descriptions](https://global-ai-builders-challenge.devpost.com/).

## Best Use of Prune — copy this sponsor explanation

Prune is SYNAPSE’s actual Gemini gateway for tutoring and structured lesson generation, not only a development tool. Requests use feature identifiers, explicit cache settings and routing disabled to keep the chosen model clear. We adapted the response parser to Prune’s observed native Gemini envelope and keep safe request, model, latency, usage and receipt metadata. Prune’s verification endpoint accepted the complete receipt for request `e31c8055-d45b-40e4-b510-35416b8ae0dc`; the public evidence is a redacted excerpt, not an offline-verifiable full payload. The builder personally checked the key’s saved $1/day cap, 10/minute limit and anomaly detection. A bounded uncached test observed nine successes, one Shield `429/rate_limit` and one timeout. An exact-cache probe separately observed ten cache hits with zero gateway-estimated cost. These observations demonstrate integration and enforcement; they do not establish token savings, reconciled billing savings or a direct-Gemini cost advantage. Application-level owner quotas and centralized limits remain in force alongside Shield.

Evidence: [receipt](https://github.com/pranav-pokkula/synapse/blob/main/evidence/prune-receipt-verification.json), [uncached Shield test](https://github.com/pranav-pokkula/synapse/blob/main/evidence/prune-shield-uncached-results.json), [cache probe](https://github.com/pranav-pokkula/synapse/blob/main/evidence/prune-shield-results.json).

## Five official questions — copy the following five answers

## 1. Who is your project for, and why would they use it?

SYNAPSE is for students and early-career developers who can build software with AI assistance but want to explain the code and technical choices themselves. A learner brings a public repository, follows its module relationships, studies foundational concepts through source-linked lessons, and practices explaining what the code establishes.

The concrete use case is preparing to discuss a project in class or an interview. Compared with manually opening files and repeatedly pasting fragments into a general chatbot, SYNAPSE retains a reproducible source snapshot, organizes prerequisites, exposes the evidence beside explanations, and connects reading, animation, narration, and assessment in one workspace. This is a workflow comparison; no measured time savings or user-study benefit is claimed. The need is the project's motivating hypothesis, not validated user research.

## 2. What did your team build or improve during the hackathon?

This project began in an empty workspace on November 22, 2026. We built a Next.js learning studio, bounded public GitHub import, TypeScript structural indexing, static dependency diagrams, evidence-linked concept ranking, three explanation depths, an actual SVG animation engine, browser narration, deterministic assessments, progress persistence, and a transparent source guide. Stage 2 added actual Gemini tutoring through Prune, safe model-generated scenes and captions, hosted Supabase persistence, distributed write fencing and shared abuse limits.

The source fixture, app code, tests, and documentation were created during the event. Next.js, React, Supabase client libraries, TypeScript, and other dependencies are pre-existing tools. No existing YUMORPH, ADUGU, PanelRush, or TraceEval code was reused.

## 3. How did your team use AI?

Codex assisted implementation, testing, debugging, design, and documentation, including citation validation, owner-isolated storage and constrained lesson scenes. Automated and agent-performed checks are not human review. Its concrete contributions and executed checks are listed in [AI_DEVELOPMENT_LOG.md](https://github.com/pranav-pokkula/synapse/blob/main/docs/AI_DEVELOPMENT_LOG.md). The builder personally checked the saved Prune settings and successful requests in its dashboard. The owner separately tested and approved browser narration and watched and approved the entire 3:03 silent, captioned demo on November 26, 2026. The five-explanation and three-code-change review remains outstanding; we make no claim to completed independent accuracy scoring. The prepared review packet provides source comparisons and blank records for those findings.

In the product, a configurable OpenAI-compatible tutor adapter retrieves bounded excerpts, requires structured claim categories, checks exact citations, limits requests, caches successful answers, and abstains when evidence is missing. Prune is the primary gateway; the configured Gemini alias served `gemini-3.5-flash-lite` in observed requests. Real structured tutoring, three generated lesson levels and a twenty-call paired experiment ran. Full gateway receipt verification succeeded; saved $1/day Shield settings were personally reviewed by the user and a real rate-limit denial was observed. Source templates remain labeled fallbacks. We chose bounded text generation to explain source in plain language and produce structured scene data; deterministic code handles indexing, validation, rendering and scoring. The controlled comparison supports the usefulness of relevant excerpts for some questions, not the superiority of this model over other models. Browser speech reads shared scene captions. Prune integration is demonstrated; eligibility and independent judging are not guaranteed.

## 4. How can people access and use the project, and what results does it achieve?

Public code: [pranav-pokkula/synapse](https://github.com/pranav-pokkula/synapse), published and verified public. The submitted release is on [`main`](https://github.com/pranav-pokkula/synapse/tree/main); release history and commit details are linked in the final handoff. Automated quality checks run in [GitHub Actions](https://github.com/pranav-pokkula/synapse/actions).

To review the submitted version, select the `main` branch. Run locally with Node 22: `npm ci`, copy `.env.example` to `.env.local`, then `npm run dev`; open `http://127.0.0.1:3000`. The sample and public imports do not require paid APIs; imports require internet access. Live tutoring requires Prune/Gemini credentials, and hosted persistence requires Supabase configuration. Provider usage charges may apply to a self-hosted installation. Browser narration depends on the voices available on the device. A [protected Vercel preview](https://synapse-learning-qr1qac164-pranav-pokkulas-projects.vercel.app) passed 16 end-to-end checks; it requires authorized Vercel sign-in. The [public website](https://synapse-learning-one.vercel.app) is a separate browser-only sample: architecture, source templates, animation, narration and deterministic practice, with progress saved on the device. Imports, paid generation and cloud accounts are unavailable there; production server APIs fail closed.

The final release passes 98 unit/SQL/security/public-mode tests (including the original 91), 12 browser regression/accessibility checks, 16 hosted database checks and separate real-service browser checks. The public release additionally passed 22 signed-out browser/security checks, including local progress persistence, browser separation, mobile accessibility and denial of direct server API calls. Three public JS libraries and a 37-file Next.js dashboard imported successfully; a repeated import reused the exact commit snapshot. The Next.js case produced 48 static module relationships and 11 citations matching source. Invalid-host and nonexistent-repository failures produced corrective errors. The small development retrieval set improved from 4/5 to 5/5 expected-source hits after a disclosed fix, and prerequisite ordering reduced two alphabetical inversions to zero. These results do not establish model accuracy or improved learner outcomes. The twenty-call paired experiment used the same model/prompt/settings with caches and routing disabled: baseline 9 valid abstentions and 1 upstream 503; SYNAPSE 5 non-abstaining answers, 2 valid abstentions, 2 upstream 503s and 1 rejected citation. Model-response structural validation is not independent factual accuracy scoring. It checks format and whether quoted source text exists, not whether every interpretation is correct. The small baseline deliberately has limited context; no broad superiority or learning gain is claimed.

The updated 3:03 actual app recording is saved locally as `evidence/synapse-stage2-demo.mp4`. It shows real saved Prune-generated teaching, tutoring and hosted progress. It is silent with captions; the owner watched and approved it on November 26. Browser narration was separately tested and approved that day. The owner must still upload the approved recording and provide an embeddable video link. It shows the full protected experience, not the restricted public sample. During the lesson, a progress sync request temporarily failed and progress remained in the browser; the graded result is saved to Supabase and reloaded later in the recording.

Evidence: [evaluation report](https://github.com/pranav-pokkula/synapse/blob/main/docs/EVALUATION_REPORT.md), [live import results](https://github.com/pranav-pokkula/synapse/blob/main/evidence/live-import-results.json), and browser screenshots in `evidence/`.

## 5. What are the current limitations, and what happens when something goes wrong?

Only public JS/TS repositories are supported. Indexing is bounded and partial coverage is labeled. Static relationships cannot prove runtime call order, production infrastructure, test success, or security guarantees. Citations validate source text but not semantic correctness. Template answers and ungraded short-answer practice are labeled explicitly.

GitHub rate limits, invalid URLs, missing repositories, timeouts, malformed model outputs, and oversized data have clear recovery paths. Imports save checkpoints; failed operations preserve earlier work. Narration has captions and a transcript fallback. Local progress is isolated and durable on the current machine. Dedicated TraceEval / synapse-learning now passes hosted anonymous Auth, refresh, RLS and persistence tests. Email OTP and human teaching review remain unverified. PostgreSQL enforces 8 model reservations/minute, 50/day and owner quotas; Shield adds the user-confirmed $1/day cap. The full AI workspace remains protected. Public production uses browser-only sample storage, contains no Prune/Supabase credentials, and denies server API/auth routes. No unrestricted public AI is enabled.

## Exact experiment figures — supporting table for answer 4

Same observed serving model (`gemini-3.5-flash-lite`), prompt, intermediate level, temperature 0 and 1,800 output cap; routing and gateway/app caches disabled. Ten questions, two conditions, alternating order, no retries. Baseline: first two indexed files. SYNAPSE: top three retrieved excerpts. Six development questions and four questions held out from prior retrieval tuning; the builder inspected the source, so this is not independently authored evaluation.

| Measure | Baseline | SYNAPSE |
|---|---:|---:|
| Attempts | 10 | 10 |
| Structurally accepted | 9 | 7 |
| Accepted abstentions | 9 | 2 |
| Accepted non-abstaining answers | 0 | 5 |
| Upstream HTTP 503 | 1 | 2 |
| Rejected citation | 0 | 1 |
| Median wall latency, all attempts | 2,876.5 ms | 2,790 ms |
| Input tokens, accepted only | 8,108 | 5,630 |
| Output tokens, accepted only | 1,025 | 1,751 |
| Gateway estimated cost, accepted only | $0.001026 | $0.001150 |

The small, intentionally limited-context baseline is not a comparison against a fully supplied general assistant. Token and cost totals omit rejected/failed calls and unreported thought tokens. Cost figures are estimates, not reconciled bills. No token-saving, speed-superiority, independently scored accuracy or learning-gain claim is made. Direct Gemini versus Prune was not tested because no direct Gemini credential was configured outside Prune Vault.

[Complete original results](https://github.com/pranav-pokkula/synapse/blob/main/evidence/stage2-evaluation-results.json) · [frozen protocol](https://github.com/pranav-pokkula/synapse/blob/main/evidence/stage2-evaluation-manifest.json).

## Your final completion checklist — do not paste unchecked promises as facts

- [ ] Complete [FINAL_REVIEW_PACKET.md](FINAL_REVIEW_PACKET.md). Add your actual findings to answer 3; otherwise retain its honest pending-review disclosure.
- [x] Owner watched and approved the complete silent demo and separately tested browser narration on November 26, 2026. Retain the sync-warning clarification in answer 4.
- [ ] Personally upload the video, enable embedding and test the URL while signed out; replace the placeholder. The agent has not uploaded it.
- [ ] Confirm eligibility, complete the public team roster and each person’s private participant contact form.
- [ ] Review all five answers, choose only justified awards, and personally approve/submit the entry.

Deadline: November 28, 2026, **6 PM Eastern**. Public hosting and email OTP are not mandatory entry conditions. Human review supports the rubric and truthful claims; it is not grounds to invent a completed check. [Rules](https://global-ai-builders-challenge.devpost.com/rules) · [Rubric](https://global-ai-builders-challenge.devpost.com/resources) · [Submission questions and video instructions](https://global-ai-builders-challenge.devpost.com/), checked November 26.
