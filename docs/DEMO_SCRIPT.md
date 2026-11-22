# Demonstration — approximately 3 minutes

Use the actual running app, with a real public import and the clearly labeled teaching fixture. The automated recorder is `scripts/record-demo.ts`; it produces a silent captioned screen capture, not a narrated or submitted Devpost video. Human review and a public upload are still required.

| Time | On screen | Message |
|---|---|---|
| 0:00–0:20 | Landing, connect dialog | “You built it. Now understand it.” Students can learn from their own implementation. |
| 0:20–0:45 | Live GitHub import, source-based overview, map | Actual source is bounded, indexed, and pinned to a commit. No code is executed. |
| 0:45–1:00 | Exact source excerpt | Show file, lines, commit, and the limits of text matching. |
| 1:00–1:20 | Switch to Fieldnotes fixture and learning path | Explicitly call out the teaching fixture; prerequisites guide the route through concepts. |
| 1:20–1:50 | Request lesson, animation, advanced explanation | Real packet motion and state changes; controls and shared narration/transcript content. |
| 1:50–2:15 | Source guide | Clearly labeled template mode. Live provider selection and benchmark are pending. |
| 2:15–2:40 | Quiz and feedback | Deterministic correctness, explanation, and evidence. Short answers are practice-only. |
| 2:40–3:00 | Progress and reload | Saved learning history, measured checks, honest remaining limits. |

Narration control can be demonstrated live; browser video recording does not capture system audio. Native Chrome speech start/end events are separately recorded in `evidence/narration-results.json`. Do not imply human listening review has happened.

If GitHub is rate-limited, say so and use an already imported pinned snapshot, explicitly identifying it as cached. Do not represent sample output or cached responses as fresh model generation.

Final spoken or captioned disclosure: “Current release: tested local learning flow. Model provider, primary LLM benchmark, hosted authentication, public deployment, and human review remain pending.” Update this only when those steps actually complete.
