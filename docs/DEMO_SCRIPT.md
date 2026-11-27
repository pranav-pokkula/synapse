# Demonstration

The 3:03 recording follows a real imported Next.js dashboard through architecture, source inspection, saved Gemini teaching, animation, tutoring, practice and reloaded hosted progress. I reviewed and approved the complete recording on November 26, 2026. It is **silent with explanatory captions**; browser narration was tested separately.

The public video URL has not yet been published. The local recording is `evidence/synapse-stage2-demo.mp4`: H.264, 1440 × 1000, 182.80 seconds, with no audio stream. The MP4 and WebM source are excluded from Git. [Capture metadata](../evidence/stage2-demo-recording.json) and a [final progress screenshot](../evidence/stage2-demo-final.png) are available in the repository.

## What the recording demonstrates

| Sequence | Behavior |
|---|---|
| Project and architecture | A previously imported repository pinned to an exact commit; static relationships and source excerpts |
| Lesson | Saved Prune-generated teaching, conceptual animation, distinct captions and a transcript |
| Tutor | Actual recorded model output linked to indexed source |
| Practice and progress | Deterministic feedback, hosted records and progress after reload |

Saved output is labeled. The recording does not imply that each click makes a fresh import or model request. It shows the **protected full workspace**; the [public application](https://synapse-learning-one.vercel.app) provides browser-only sample learning, with live AI, imports and cloud history disabled.

A temporary progress-sync warning remains visible during the lesson. Progress stayed in the browser during that failure; the graded result was subsequently saved to Supabase and reloaded. The recording therefore does not establish uninterrupted cloud synchronization.

Two incomplete captures preceded the final video: a navigation selector stopped one attempt, and overlapping grading/progress persistence produced a recoverable `409/JOB_BUSY` in another. The recorder follows the displayed retry path; a separate [six-check hosted assessment run](../evidence/preview-assessment-results.json) verified persistence and non-inflating mastery after retry. These failures remain part of the engineering record.

## Reproduction

`scripts/record-demo-stage2.ts` captures the full workflow using its ignored verification account state and a configured local production build. It may make provider requests when cached teaching is unavailable. The historical Stage 1 recorder demonstrates template/local-storage behavior and is not evidence of hosted Stage 2 services.

The [gallery image](../evidence/devpost-gallery.png) is an unchanged application capture of a generated lesson in the protected workspace.
