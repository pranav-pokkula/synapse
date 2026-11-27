# Final human review packet

Plan: about 25 minutes. You do not need to understand every file. Read the quoted explanation, look at the small source excerpt, and write what you actually found. “Unsure” is a useful answer. Nothing below is a completed human review or a score.

Owner-reported checks completed November 26, 2026: browser narration tested and approved; complete 3:03 silent captioned demo watched and approved. The five-explanation and three-code-change reviews below remain uncompleted unless the owner records findings.

Reviewer: ______  Date: ______  Version reviewed: ______

## Step 1 — Read five real AI explanations (10 minutes)

These are the five non-abstaining, structurally accepted answers from the recorded experiment, selected for easy comparison. They are not a representative accuracy estimate. The other failures and abstentions remain in the [complete results](../evidence/stage2-evaluation-results.json). The first three examples are from the clearly labeled Fieldnotes teaching fixture, not a real external repository. Its hash identifies fixture content. The last two use a real pinned GitHub repository.

A matching quotation means the text exists. You must still decide whether it supports the explanation. Do not mark an answer correct just because the app calls a claim “verified.”

### 1. Sign-in before saving

Recorded output: `dev-identity`, condition `synapse`, in [original results](../evidence/stage2-evaluation-results.json) (search for that ID).

**AI explanation, unchanged:**

> The API route handler verifies user authentication by calling getUser before parsing or inserting a new note.

**AI claim:** The POST route handler calls db.auth.getUser() to retrieve the user object before performing further operations.

[Source: app/api/notes/route.ts, excerpt lines 4–7](../lib/sample.ts) · snapshot `8aefd6113809f700adc03f3d4f29e6a030165cea`

```ts
export async function POST(request: Request) {
  const db = await getDatabase();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return Response.json({ error: 'Sign in required' }, { status: 401 });
```

**AI claim:** If the user is not found, the route immediately returns a 401 status response requiring sign-in.

[Source: app/api/notes/route.ts, excerpt lines 7–7](../lib/sample.ts) · snapshot `8aefd6113809f700adc03f3d4f29e6a030165cea`

```ts
  if (!user) return Response.json({ error: 'Sign in required' }, { status: 401 });
```

**Your simple check:** Can you find getUser before the insert? Does the missing-user branch return 401?

My verdict (supported / misleading / unsure): ______

What I found, in my own words: ______

Keep / change / reject, and why: ______

### 2. Only your notes, at most twenty

Recorded output: `dev-query`, condition `synapse`, in [original results](../evidence/stage2-evaluation-results.json) (search for that ID).

**AI explanation, unchanged:**

> The listNotes function retrieves notes by authenticating the current user and querying the database with specific filtering and limit constraints.

**AI claim:** The listNotes function checks for an authenticated user before querying the database.

[Source: lib/notes.ts, excerpt lines 2–5](../lib/sample.ts) · snapshot `8aefd6113809f700adc03f3d4f29e6a030165cea`

```ts
export async function listNotes() {
  const db = await getDatabase();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return [];
```

**AI claim:** The database query filters notes by matching the user_id column to the authenticated user's id.

[Source: lib/notes.ts, excerpt lines 6–7](../lib/sample.ts) · snapshot `8aefd6113809f700adc03f3d4f29e6a030165cea`

```ts
  const { data, error } = await db.from('notes').select('id, body')
    .eq('user_id', user.id).limit(20);
```

**AI claim:** The query restricts the number of returned results to a maximum of 20 items.

[Source: lib/notes.ts, excerpt lines 6–7](../lib/sample.ts) · snapshot `8aefd6113809f700adc03f3d4f29e6a030165cea`

```ts
  const { data, error } = await db.from('notes').select('id, body')
    .eq('user_id', user.id).limit(20);
```

**Your simple check:** Can you find user_id and limit(20)? Does that alone prove the database has secure ownership policies?

My verdict (supported / misleading / unsure): ______

What I found, in my own words: ______

Keep / change / reject, and why: ______

### 3. What a test actually checks

Recorded output: `dev-tests`, condition `synapse`, in [original results](../evidence/stage2-evaluation-results.json) (search for that ID).

**AI explanation, unchanged:**

> The provided test file checks that empty notes fail schema validation using Vitest.

**AI claim:** The test asserts that empty notes are rejected by the note schema.

[Source: tests/validation.test.ts, excerpt lines 3–5](../lib/sample.ts) · snapshot `8aefd6113809f700adc03f3d4f29e6a030165cea`

```ts
test('empty notes are rejected', () => {
  expect(noteSchema.safeParse({ body: '' }).success).toBe(false);
});
```

**Your simple check:** Does this code check an empty note? Does seeing the test mean somebody ran it?

My verdict (supported / misleading / unsure): ______

What I found, in my own words: ______

Keep / change / reject, and why: ______

### 4. GitHub sign-in configuration

Recorded output: `held-auth`, condition `synapse`, in [original results](../evidence/stage2-evaluation-results.json) (search for that ID).

**AI explanation, unchanged:**

> The file lib/auth.ts configures NextAuth with a specific authentication provider and exports standard authentication helpers for application use.

**AI claim:** lib/auth.ts configures NextAuth with the GitHub provider.

[Source: lib/auth.ts, excerpt lines 1–7](https://github.com/vercel/nextjs-postgres-nextauth-tailwindcss-template/blob/fe026711c19ac3ee4589c86a738f59b84e611559/lib/auth.ts#L1-L7) · snapshot `fe026711c19ac3ee4589c86a738f59b84e611559`

```ts
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub]
});

```

**AI claim:** lib/auth.ts exports handlers, signIn, signOut, and auth helpers.

[Source: lib/auth.ts, excerpt lines 4–6](https://github.com/vercel/nextjs-postgres-nextauth-tailwindcss-template/blob/fe026711c19ac3ee4589c86a738f59b84e611559/lib/auth.ts#L4-L6) · snapshot `fe026711c19ac3ee4589c86a738f59b84e611559`

```ts
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub]
});
```

**Your simple check:** Can you find GitHub and the four exported helper names? Does configuration prove deployed sign-in works?

My verdict (supported / misleading / unsure): ______

What I found, in my own words: ______

Keep / change / reject, and why: ______

### 5. Comments are not actions

Recorded output: `held-delete`, condition `synapse`, in [original results](../evidence/stage2-evaluation-results.json) (search for that ID).

**AI explanation, unchanged:**

> The deleteProduct server action currently comments out the logic for deleting a database row and does not execute the deletion or revalidate the page in active code.

**AI claim:** The deleteProduct function is defined as a server action, but the database deletion logic inside it is commented out.

[Source: app/(dashboard)/actions.ts, excerpt lines 6–8](https://github.com/vercel/nextjs-postgres-nextauth-tailwindcss-template/blob/fe026711c19ac3ee4589c86a738f59b84e611559/app/%28dashboard%29/actions.ts#L6-L8) · snapshot `fe026711c19ac3ee4589c86a738f59b84e611559`

```ts
export async function deleteProduct(formData: FormData) {
  // let id = Number(formData.get('id'));
  // await deleteProductById(id);
```

**AI claim:** The revalidatePath function is imported in actions.ts, but there is no evidence in the provided snippet that it is currently called within deleteProduct.

[Source: app/(dashboard)/actions.ts, excerpt lines 4–8](https://github.com/vercel/nextjs-postgres-nextauth-tailwindcss-template/blob/fe026711c19ac3ee4589c86a738f59b84e611559/app/%28dashboard%29/actions.ts#L4-L8) · snapshot `fe026711c19ac3ee4589c86a738f59b84e611559`

```ts
import { revalidatePath } from 'next/cache';

export async function deleteProduct(formData: FormData) {
  // let id = Number(formData.get('id'));
  // await deleteProductById(id);
```

**Your simple check:** Which lines begin with //? Does importing a delete helper mean it is called? The excerpt is short: inspect the full linked function before accepting the overview.

My verdict (supported / misleading / unsure): ______

What I found, in my own words: ______

Keep / change / reject, and why: ______

## Step 2 — Inspect three Codex-assisted changes (7 minutes)

Open [PR #1](https://github.com/pranav-pokkula/synapse/pull/1/files). These are suggestions for where to look, not findings attributed to you.

| Change | Open and search | What to check in plain English | Expected behavior |
|---|---|---|---|
| Reject invented evidence | [lib/provider.ts](../lib/provider.ts), `validateAnswer`; [security tests](../tests/security.test.ts), `fabricated citations` | Find the call to `validCitation`. Is a mismatching reference rejected instead of presented as reliable? | Invalid citation produces an error; a source-text match still does not prove factual accuracy. |
| Keep learner records separate and writes orderly | [migration](../supabase/migrations/20261122102555_learning_records.sql), `own_learning_records`; [write-lock migration](../supabase/migrations/20261125202233_cloud_concurrency_and_budget.sql), `put_locked_record` | Look for `auth.uid()` compared with the owner, and the token/expiry check before writing. Think “my notebook, my key.” | Another account cannot edit your records; an outdated writer cannot overwrite a newer checkpoint. A busy write may ask you to retry. |
| Make generated animation safe | [lib/lesson-provider.ts](../lib/lesson-provider.ts), `validateGeneratedLesson`; [tests](../tests/generated-lessons.test.ts) | Find the three-node limit, source validation and repeated-caption rejection. Does the model supply data rather than executable scripts? | Unsupported scenes are rejected; the previous/source lesson stays usable. |

For EACH change, fill one row yourself:

| Change | What I actually opened or tried | What I found | Keep / change / reject | Why |
|---|---|---|---|---|
| Citation checking | ______ | ______ | ______ | ______ |
| Ownership/write locks | ______ | ______ | ______ | ______ |
| Safe generated scenes | ______ | ______ | ______ | ______ |

If you cannot understand a check, record “unsure” and ask for an explanation. Do not claim a security audit. Your earlier Shield dashboard review is already documented separately and does not substitute for inspecting generated code or explanations.

## Step 3 — Browser narration (owner approved November 26)

Open the [protected preview](https://synapse-learning-qr1qac164-pranav-pokkulas-projects.vercel.app) with your authorized Vercel account. Choose **Explore the sample / Start learning**. Source lessons suffice for this check; do not generate extra AI output just to test audio.

- [ ] Turn on narration, then play. I actually heard speech.
- [ ] Compare one spoken sentence with the caption/transcript: same words, understandable pronunciation.
- [ ] Pause; speech stops. Move to another step and resume; no overlapping old speech.
- [ ] Turn narration off; captions/transcript still explain the lesson.

Browser/device: ______  Sentence I checked: ______
What sounded confusing or failed: ______  Keep/change decision: ______

The MP4 is silent. Watching it does not test narration.

## Step 4 — Demo (owner approved November 26; 3:03)

Open [the local MP4](../evidence/synapse-stage2-demo.mp4). It is intentionally excluded from Git; use the file on your computer.

- [ ] At normal playback speed and full-screen, I can read the headings and captions.
- [ ] I understand this uses a previously imported real repository and saved AI output, not a fresh request at every click.
- [ ] Architecture, source evidence, generated lesson, tutor, assessment and reloaded progress are visible.
- [ ] I noticed the temporary sync warning; I do not interpret the video as uninterrupted successful cloud sync.
- [ ] I understand that speech is available in the browser but is not recorded in this video.
- [ ] No personal information or credentials are visible.

What was unclear (timestamp + issue): ______
Approve video as-is / approve after the small caption below / needs correction: ______

**Smallest presentation correction:** during the existing “Step through the concept” caption (around 1:20), add: “A progress sync request temporarily failed; progress remained in the browser. The graded result is saved to Supabase and reloaded later.” Keep the visible warning; do not hide it. Alternatively retain the video and place that exact clarification immediately beside its embedded link in the description. No cinematic editing or new recording is needed. Human approval of that choice: ______

## Step 5 — Confirm the honest limits (2 minutes)

- The 20-call experiment had **three upstream 503 failures and one rejected citation**. Accepted responses are not independently fact-checked scores. [Results](EVALUATION_REPORT.md).
- The baseline had deliberately limited context and all nine accepted outputs abstained. This is not proof SYNAPSE beats general-purpose assistants.
- Generated scenes are conceptual. The example `held-delete` needs a full-function check before accepting the overview; its cited excerpt ends before the function does.
- A progress save and grading can collide (`409`); wait and retry. Data deletion does not delete the Auth account and an already running write can recreate records.
- Email OTP, human learning gains and direct Gemini-versus-Prune savings remain unverified. These are not reasons to add features before submission.

I accept these disclosed limits / want these corrections first: ______

## Actual review record to use in the submission

Do not fill this until you have done the steps above:

“On ______, I reviewed ______. I checked ______ against ______. I found ______. I kept/changed/rejected ______ because ______. The remaining uncertainty is ______.”

Optional detailed scores: [blank review sheet](../evidence/human-review-sheet.csv). Scores are optional; do not guess numbers to complete the form.

## Finish the entry

- [ ] Read the five final answers in [DEVPOST_SUBMISSION.md](DEVPOST_SUBMISSION.md); add only true human-review findings.
- [ ] Verify eligibility, list every teammate, and complete each participant’s private contact form.
- [ ] You upload the approved video to YouTube/Vimeo, enable embedding and test it signed out. Paste the real URL into the placeholder.
- [ ] Use the final main-branch and release links in FINAL_SUBMISSION_HANDOFF.md.
- [ ] Personally approve the final entry and submit before November 28, 2026, 6 PM Eastern.

Public production hosting, email OTP and merging PR #1 are not prerequisites for this entry. The agent has not uploaded or submitted anything.
