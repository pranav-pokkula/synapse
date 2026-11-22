# SYNAPSE — submission draft

**Tagline:** Build knowledge from what you build.

**Draft status:** Not yet submitted. The current local release is useful and tested, but live AI, hosted authentication, human review, and the final public video link remain incomplete. Update this draft with actual results before submitting; do not claim eligibility for integrated-AI awards based only on AI-assisted development.

## 1. Who is your project for, and why would they use it?

SYNAPSE is for students and early-career developers who can build software with AI assistance but want to explain the code and technical choices themselves. A learner brings a public repository, follows its module relationships, studies foundational concepts through source-linked lessons, and practices explaining what the code establishes.

The concrete use case is preparing to discuss a project in class or an interview. Compared with manually opening files and repeatedly pasting fragments into a general chatbot, SYNAPSE retains a reproducible source snapshot, organizes prerequisites, exposes the evidence beside explanations, and connects reading, animation, narration, and assessment in one workspace. This is a workflow comparison; no measured time savings or user-study benefit is claimed. The need is the project's motivating hypothesis, not validated user research.

## 2. What did your team build or meaningfully improve during the hackathon?

This project began in an empty workspace on November 22, 2026. We built a Next.js learning studio, bounded public GitHub import, TypeScript structural indexing, static dependency diagrams, evidence-linked concept ranking, three explanation depths, an actual SVG animation engine, browser narration, deterministic assessments, progress persistence, and a transparent source guide. We also prepared Supabase ownership policies and a configurable model adapter.

The source fixture, app code, tests, and documentation were created during the event. Next.js, React, Supabase client libraries, TypeScript, and other dependencies are pre-existing tools. No existing YUMORPH, ADUGU, PanelRush, or TraceEval code was reused.

## 3. How did your team use AI?

Codex assisted implementation, testing, debugging, design, and documentation. Its concrete contributions and executed checks are listed in [AI_DEVELOPMENT_LOG.md](AI_DEVELOPMENT_LOG.md). Human review remains pending and must be recorded honestly.

In the product, a configurable OpenAI-compatible tutor adapter retrieves bounded excerpts, requires structured claim categories, checks exact citations, limits requests, caches successful answers, and abstains when evidence is missing. **No live model is currently selected or evaluated.** The demonstrated source guide and lessons use visibly labeled templates. Browser speech synthesis is the baseline narration mechanism. There is no paid video-generation requirement and no sponsor integration claim.

## 4. How can people access and use the project, and what results does it achieve?

Public code: [pranav-pokkula/synapse](https://github.com/pranav-pokkula/synapse), published and verified public. The default branch is `main`; automated quality checks run in [GitHub Actions](https://github.com/pranav-pokkula/synapse/actions).

Run locally with Node 22: `npm ci`, copy `.env.example` to `.env.local`, then `npm run dev`; open `http://127.0.0.1:3000`. The sample and public imports do not require paid APIs. No verified public deployment is available yet.

Executed verification includes 68 unit/integration/security tests and 12 production-browser checks. Three public JS libraries and a 37-file Next.js dashboard imported successfully; a repeated import reused the exact commit snapshot. The Next.js case produced 48 static module relationships and 11 citations matching source. Invalid-host and nonexistent-repository failures produced corrective errors. The small development retrieval set improved from 4/5 to 5/5 expected-source hits after a disclosed fix, and prerequisite ordering reduced two alphabetical inversions to zero. These results do not establish model accuracy or improved learner outcomes. The primary same-model LLM baseline has not run.

A 2:44 captioned recording of the actual app is saved locally as `evidence/synapse-demo.mp4`. It is silent and has not been uploaded; a public video link remains required.

Evidence: [evaluation report](EVALUATION_REPORT.md), [live import results](../evidence/live-import-results.json), and browser screenshots in `evidence/`.

## 5. What are the current limitations, and what happens when something goes wrong?

Only public JS/TS repositories are supported. Indexing is bounded and partial coverage is labeled. Static relationships cannot prove runtime call order, production infrastructure, test success, or security guarantees. Citations validate source text but not semantic correctness. Template answers and ungraded short-answer practice are labeled explicitly.

GitHub rate limits, invalid URLs, missing repositories, timeouts, malformed model outputs, and oversized data have clear recovery paths. Imports save checkpoints; failed operations preserve earlier work. Narration has captions and a transcript fallback. Local progress is isolated and durable on the current machine. Hosted Supabase setup was blocked by the account’s free-project limit, so hosted Auth and Vercel deployment remain unverified. Per-session usage limits require stronger deployment-wide controls before public paid-model access.

## Official requirements verified

Checked November 22 against the [rules](https://global-ai-builders-challenge.devpost.com/rules), [full rubric](https://global-ai-builders-challenge.devpost.com/resources), and [event page](https://global-ai-builders-challenge.devpost.com/). Deadline: **November 28, 2026, 6:00 PM Eastern**. Participation is student-only, ages 13+, subject to eligibility restrictions, with up to six team members. Required materials include public code, a 2–4 minute demo, project description, accurate development/AI disclosures, public roster, and individual contact forms. Hosting is optional. Scoring weights are 20/30/30/20 for value, AI, functionality, and design. No sponsor tools or eligibility are claimed.

## Submission checklist

- [x] Publish and verify the public source repository; final handoff identifies the commit.
- [ ] Upload and verify the actual 2–4 minute demo; replace local artifact with its public video link.
- [ ] Configure/test live product AI or retain the explicit limitation and adjust award selections.
- [ ] Complete actual human review and record its findings.
- [ ] Add accurate team roster; each participant completes their own contact form.
- [ ] Replace pending configuration/test statements with observed outcomes only.
- [ ] Submit Devpost before the deadline; no submission has occurred in this session.
