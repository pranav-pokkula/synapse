# Stage 2 demonstration — 3:03

Completed actual screen capture: `evidence/synapse-stage2-demo.mp4` (182.80 seconds, 1440 × 1000, silent with explanatory captions). The WebM original and MP4 export are local and excluded from Git. The app uses real saved Prune-generated lessons and hosted Supabase records from the previously imported pinned Next.js dashboard. Cached output is visibly labeled; this is not presented as a fresh import or a fresh model generation on every click.

Reproduce after the hosted import/browser setup with `npx tsx scripts/record-demo-stage2.ts` while the local production build is running. This recorder uses only its own ignored verification account state. It can make real model requests if the appropriate cache is absent. Do not run it on an unrelated account.

The recording covers landing, real repository overview, static architecture and source inspection, saved AI teaching, animation and distinct captions, transcript, source claims, actual tutor output, deterministic assessment feedback, hosted progress and reload. Final metadata: `evidence/stage2-demo-recording.json`; final screenshot: `evidence/stage2-demo-final.png`.

Two incomplete attempts preceded the final capture. One stopped at an overly strict navigation selector. The second encountered an actual recoverable `409/JOB_BUSY` when grading overlapped progress persistence. The updated recorder follows the UI’s retry instruction once if needed; a separate six-check hosted assessment run verified safe retry and persisted grades. The final recording completed the full sequence.

The video has **no captured audio**. Browser narration shares the displayed captions, and native speech callbacks were separately checked; human listening review remains pending. Review the final video and generated explanations before submitting or uploading. No public video upload or Devpost submission has occurred.

The historical Stage 1 recording remains `evidence/synapse-demo.mp4` (2:44); it demonstrates template mode and local storage and should not be used as proof of Stage 2 services.

## Final submission inspection

Full MP4 decoding passed; no audio stream is present. The saved lesson portion visibly shows a temporary sync warning. Keep it visible. The exact smallest clarification, included in the final Devpost answer, is: “During the lesson, a progress sync request temporarily failed and progress remained in the browser; the graded result is saved to Supabase and reloaded later in the recording.” Alternatively add that sentence to the existing caption near 1:20. No new recording, synthetic frame or cinematic edit is needed. Human review of the entire video remains pending.

## Owner approval — November 26, 2026

The owner states that they watched and approved the complete 3:03 silent, captioned Stage 2 recording and separately tested and approved browser narration. This does not establish completion of the five-explanation or three-code-change review. The existing video is retained unchanged. Its temporary sync warning is explained in the submission; public production is a browser-only sample while this recording shows the full protected experience.
