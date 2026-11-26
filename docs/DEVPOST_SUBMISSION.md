# SYNAPSE — submission draft

**Tagline:** Build knowledge from what you build.

**Draft status:** Not yet submitted. Live Prune-backed tutoring, generated lessons, hosted authentication and ownership controls have actual test evidence. Human content review, the final public video link and submission approval remain incomplete. Update this draft with actual results before submitting; do not claim eligibility for integrated-AI awards based only on AI-assisted development.

## 1. Who is your project for, and why would they use it?

SYNAPSE is for students and early-career developers who can build software with AI assistance but want to explain the code and technical choices themselves. A learner brings a public repository, follows its module relationships, studies foundational concepts through source-linked lessons, and practices explaining what the code establishes.

The concrete use case is preparing to discuss a project in class or an interview. Compared with manually opening files and repeatedly pasting fragments into a general chatbot, SYNAPSE retains a reproducible source snapshot, organizes prerequisites, exposes the evidence beside explanations, and connects reading, animation, narration, and assessment in one workspace. This is a workflow comparison; no measured time savings or user-study benefit is claimed. The need is the project's motivating hypothesis, not validated user research.

## 2. What did your team build or meaningfully improve during the hackathon?

This project began in an empty workspace on November 22, 2026. We built a Next.js learning studio, bounded public GitHub import, TypeScript structural indexing, static dependency diagrams, evidence-linked concept ranking, three explanation depths, an actual SVG animation engine, browser narration, deterministic assessments, progress persistence, and a transparent source guide. Stage 2 added actual Gemini tutoring through Prune, safe model-generated scenes and captions, hosted Supabase persistence, distributed write fencing and shared abuse limits.

The source fixture, app code, tests, and documentation were created during the event. Next.js, React, Supabase client libraries, TypeScript, and other dependencies are pre-existing tools. No existing YUMORPH, ADUGU, PanelRush, or TraceEval code was reused.

## 3. How did your team use AI?

Codex assisted implementation, testing, debugging, design, and documentation. Its concrete contributions and executed checks are listed in [AI_DEVELOPMENT_LOG.md](AI_DEVELOPMENT_LOG.md). Human review remains pending and must be recorded honestly.

In the product, a configurable OpenAI-compatible tutor adapter retrieves bounded excerpts, requires structured claim categories, checks exact citations, limits requests, caches successful answers, and abstains when evidence is missing. Prune is the primary gateway; the configured Gemini alias served `gemini-3.5-flash-lite` in observed requests. Real structured tutoring, three generated lesson levels and a twenty-call paired experiment ran. Full gateway receipt verification succeeded; saved $1/day Shield settings were personally reviewed by the user and a real rate-limit denial was observed. Source templates remain labeled fallbacks. Browser speech reads shared scene captions. Prune integration is demonstrated; eligibility and independent judging are not guaranteed.

## 4. How can people access and use the project, and what results does it achieve?

Public code: [pranav-pokkula/synapse](https://github.com/pranav-pokkula/synapse), published and verified public. Stage 2 work is on [`stage2/live-intelligence`](https://github.com/pranav-pokkula/synapse/tree/stage2/live-intelligence); `main` remains the historical Stage 1 release. Automated quality checks run in [GitHub Actions](https://github.com/pranav-pokkula/synapse/actions).

Run locally with Node 22: `npm ci`, copy `.env.example` to `.env.local`, then `npm run dev`; open `http://127.0.0.1:3000`. The sample and public imports do not require paid APIs. A [protected Vercel preview](https://synapse-learning-qr1qac164-pranav-pokkulas-projects.vercel.app) passed 16 end-to-end checks; it requires authorized Vercel sign-in and is not a public production release.

Stage 2 verification includes 91 unit/SQL/security tests, 12 browser regression/accessibility checks, 16 hosted database checks and separate real-service browser checks. Three public JS libraries and a 37-file Next.js dashboard imported successfully; a repeated import reused the exact commit snapshot. The Next.js case produced 48 static module relationships and 11 citations matching source. Invalid-host and nonexistent-repository failures produced corrective errors. The small development retrieval set improved from 4/5 to 5/5 expected-source hits after a disclosed fix, and prerequisite ordering reduced two alphabetical inversions to zero. These results do not establish model accuracy or improved learner outcomes. The twenty-call paired experiment used the same model/prompt/settings with caches and routing disabled: baseline 9 valid abstentions and 1 upstream 503; SYNAPSE 5 non-abstaining answers, 2 valid abstentions, 2 upstream 503s and 1 rejected citation. Acceptance is structural validation, not human-rated accuracy. The small baseline deliberately has limited context; no broad superiority or learning gain is claimed.

The updated 3:03 actual app recording is saved locally as `evidence/synapse-stage2-demo.mp4`. It shows real saved Prune-generated teaching, tutoring and hosted progress. It is silent with captions and has not been uploaded; human review and a public video link remain required.

Evidence: [evaluation report](EVALUATION_REPORT.md), [live import results](../evidence/live-import-results.json), and browser screenshots in `evidence/`.

## 5. What are the current limitations, and what happens when something goes wrong?

Only public JS/TS repositories are supported. Indexing is bounded and partial coverage is labeled. Static relationships cannot prove runtime call order, production infrastructure, test success, or security guarantees. Citations validate source text but not semantic correctness. Template answers and ungraded short-answer practice are labeled explicitly.

GitHub rate limits, invalid URLs, missing repositories, timeouts, malformed model outputs, and oversized data have clear recovery paths. Imports save checkpoints; failed operations preserve earlier work. Narration has captions and a transcript fallback. Local progress is isolated and durable on the current machine. Dedicated TraceEval / synapse-learning now passes hosted anonymous Auth, refresh, RLS and persistence tests. Email OTP and human teaching review remain unverified. PostgreSQL enforces 8 model reservations/minute, 50/day and owner quotas; Shield adds the user-confirmed $1/day cap. Access remains protected, with no unrestricted public AI.

## Official requirements verified

Rechecked November 25 against the [rules](https://global-ai-builders-challenge.devpost.com/rules), [full rubric](https://global-ai-builders-challenge.devpost.com/resources), and [event page](https://global-ai-builders-challenge.devpost.com/). Deadline: **November 28, 2026, 6:00 PM Eastern**. Participation is student-only, ages 13+, subject to eligibility restrictions, with up to six team members. Required materials include public code, a 2–4 minute demo, project description, accurate development/AI disclosures, public roster, and individual contact forms. Hosting is optional. Scoring weights are 20/30/30/20 for value, AI, functionality, and design. Prune use has actual evidence; award eligibility is subject to the event rules and review.

## Submission checklist

- [x] Publish and verify the public source repository; final handoff identifies the commit.
- [ ] Upload and verify the actual 2–4 minute demo; replace local artifact with its public video link.
- [x] Configure and test actual Prune-backed product AI; retain quality limits and unsuccessful calls.
- [ ] Complete actual human review and record its findings.
- [ ] Add accurate team roster; each participant completes their own contact form.
- [ ] Replace pending configuration/test statements with observed outcomes only.
- [ ] Submit Devpost before the deadline; no submission has occurred in this session.
