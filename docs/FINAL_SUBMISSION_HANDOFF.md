# SYNAPSE — final submission handoff

Prepared November 26, 2026. **Deadline: November 28, 6 PM Eastern.** Nothing has been submitted to Devpost or uploaded to YouTube by the agent.

## Links and release status

- **Public website: [https://synapse-learning-one.vercel.app](https://synapse-learning-one.vercel.app)** — signed-out browser-only sample; all 22 production checks passed.
- [Final source — main](https://github.com/pranav-pokkula/synapse/tree/main)
- [README](https://github.com/pranav-pokkula/synapse#readme)
- [PR #1](https://github.com/pranav-pokkula/synapse/pull/1): **merged successfully** after passing PR CI.
- Release implementation/merge SHA: [`84983f462eca9ac660836f9029fc560a75da8df0`](https://github.com/pranav-pokkula/synapse/commit/84983f462eca9ac660836f9029fc560a75da8df0). Subsequent handoff updates change only documentation/evidence; [current main commit](https://github.com/pranav-pokkula/synapse/commit/main).
- [Passing merged-main CI](https://github.com/pranav-pokkula/synapse/actions/runs/45919319963) · [passing PR CI](https://github.com/pranav-pokkula/synapse/actions/runs/45919031836) · [latest main checks](https://github.com/pranav-pokkula/synapse/actions?query=branch%3Amain)
- [Full protected AI workspace](https://synapse-learning-qr1qac164-pranav-pokkulas-projects.vercel.app): authorized Vercel sign-in required.
- Video URL: **PASTE YOUR REAL UNLISTED YOUTUBE URL HERE**.

## Copy these project fields

| Field | Value |
|---|---|
| Project name | SYNAPSE |
| Tagline | Build knowledge from what you build. |
| Summary | SYNAPSE helps students understand software they have built with AI assistance. It turns a public JavaScript or TypeScript repository into a source-linked learning path, with Prune-backed Gemini explanations, constrained animated lessons, optional browser narration and practice. Exact source excerpts make answers inspectable. The public edition offers a working browser-only sample; real imports, paid AI and cloud history remain in the protected workspace. A recorded baseline experiment preserves successes and failures without claiming independent factual accuracy or learning gains. |
| Built with | Next.js, React, TypeScript, Tailwind CSS, Node.js, Supabase, PostgreSQL, Prune, Google Gemini, GitHub REST API, Vercel, Zod, Web Speech API, Playwright, Vitest |
| Development assistance | OpenAI Codex |
| Suggested awards | Best Use of Prune; Best Developer Tool; Best AI Knowledge & Research Tool; optionally Best Design & User Experience, if available in the form |
| Website | https://synapse-learning-one.vercel.app |
| Source link | https://github.com/pranav-pokkula/synapse/tree/main |

Momen was not integrated. Do not select its award or add it as a technology.

## Five final answers — copy the corresponding section

1. [Who it is for and why](DEVPOST_SUBMISSION.md#1-who-is-your-project-for-and-why-would-they-use-it)
2. [What was built during the hackathon](DEVPOST_SUBMISSION.md#2-what-did-your-team-build-or-improve-during-the-hackathon)
3. [How AI was used](DEVPOST_SUBMISSION.md#3-how-did-your-team-use-ai)
4. [Access and actual results](DEVPOST_SUBMISSION.md#4-how-can-people-access-and-use-the-project-and-what-results-does-it-achieve)
5. [Limitations and failures](DEVPOST_SUBMISSION.md#5-what-are-the-current-limitations-and-what-happens-when-something-goes-wrong)

Optional supporting material: [exact experiment table](DEVPOST_SUBMISSION.md#exact-experiment-figures--supporting-table-for-answer-4) and [ready-to-copy Prune award explanation](DEVPOST_SUBMISSION.md#best-use-of-prune--copy-this-sponsor-explanation). These preserve all 20 attempts: baseline 9 accepted abstentions + 1 upstream 503; SYNAPSE 5 accepted non-abstaining answers + 2 abstentions + 2 upstream 503s + 1 rejected citation. Structural validation is not independent factual accuracy scoring. No direct Gemini-versus-Prune savings are claimed.

Prune evidence: [verified receipt record](../evidence/prune-receipt-verification.json), [observed Shield rate limit](../evidence/prune-shield-uncached-results.json), [cache probe](../evidence/prune-shield-results.json).

## Approved assets and truthful review disclosure

- Gallery: [evidence/devpost-gallery.png](../evidence/devpost-gallery.png), a real generated-lesson screenshot from the protected workspace.
- Demo on this computer: `evidence/synapse-stage2-demo.mp4`, **3:03, H.264, 1440 × 1000, silent and captioned**. The MP4 is intentionally not committed to GitHub.
- Owner tested and approved browser narration on **November 26, 2026**.
- Owner watched and approved the entire demo on **November 26, 2026**. It is unchanged.
- The five-explanation and three-code-change review remains outstanding. Do not invent findings or accuracy scores. [Optional review record](FINAL_REVIEW_PACKET.md).

Retain this clarification beside the video: **“The recording shows the full protected AI workspace. During the lesson, a progress sync request temporarily failed and progress remained in the browser; the graded result is saved to Supabase and reloaded later. Public production provides the browser-only sample, with live AI and imports disabled.”**

## Remaining personal actions, in order

1. Open YouTube Studio → Create → Upload videos. Choose `evidence/synapse-stage2-demo.mp4`. Suggested title: **SYNAPSE — Build knowledge from what you build | Global AI Builder’s Challenge**. Use the clarification above in its description. Answer YouTube’s audience and other account questions truthfully. Set visibility to **Unlisted**. Under Show more, ensure **Allow embedding** is enabled. Finish processing and save.
2. Open the resulting watch URL in a signed-out/private browser window. Confirm it plays, captions are readable, and Devpost can embed it. Paste that real URL into Devpost's video field and replace the placeholder in your submission copy. An unlisted video is accessible to anyone with its link.
3. Upload `evidence/devpost-gallery.png` to the Devpost gallery.
4. Copy the project fields above and the five linked answers. Use the verified public website URL when present; retain the protected-workspace disclosure and video clarification.
5. Complete the actual team roster, participant eligibility and every participant's required private contact form.
6. Select the applicable award categories listed above. Do not claim eligibility approval or awards won.
7. Preview the entry, submit before **November 28, 6 PM Eastern**, and confirm Devpost shows it as submitted. Check the embedded video and links one final time.

Email OTP, independent learning gains and additional human content/code review remain unverified. Public hosting is optional for entry; a hosting failure would not justify delaying the submission. No public paid AI access is authorized by this release.

YouTube instructions checked against [official visibility guidance](https://support.google.com/youtube/answer/157177?hl=en) and [embedding guidance](https://support.google.com/youtube/answer/171780?hl=en).

## Verified release safeguards

98 unit/SQL/security/public-mode tests, 12 full-studio browser checks and 22 production browser/security checks passed. Typecheck, lint, both builds and deterministic evaluation passed; dependency audit and configured-secret scans found no issues. The existing ESLint 9 deprecation is a maintenance warning, not a reported vulnerability.

Vercel uses the existing active Hobby project. Standard Authentication protects previews and generated deployment URLs; the production domain is public. Production has no Prune or Supabase credentials, blocks all server API/auth routes and saves sample progress in the visitor's browser. The full protected AI workspace retains its existing quotas and Shield policy. The temporary CLI-created automation bypass was revoked. No database changes or paid evaluations were performed. [Production checks](../evidence/production-verification.json) · [client-secret/protection check](../evidence/production-security.json).

No technical submission blocker remains. The missing video URL and personal Devpost/account steps above remain yours. Separate explanation/code review and email OTP are still unverified and must not be claimed as complete.
