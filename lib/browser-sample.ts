import { z } from "zod";
import { emptyProgress, questions, scoreChoice, scoreShort } from "./learning";
import { sourceGuide } from "./source-guide";
import { levelSchema, type Progress, type Snapshot } from "./types";

const key = "synapse-progress-v1:sample";
const progressSchema = z.object({
  level: levelSchema,
  visited: z.array(z.string()).max(100),
  updatedAt: z.string(),
  attempts: z
    .array(
      z.object({
        id: z.string(),
        conceptId: z.string(),
        questionId: z.string(),
        correct: z.boolean(),
        score: z.number(),
        at: z.string(),
        kind: z.enum(["choice", "short"]),
      }),
    )
    .max(200),
});

function read(storage: Storage): Progress {
  try {
    return progressSchema.parse(JSON.parse(storage.getItem(key) ?? "null"));
  } catch {
    return emptyProgress();
  }
}
function save(storage: Storage, progress: Progress) {
  try {
    storage.setItem(key, JSON.stringify(progress));
  } catch {
    throw new Error(
      "Browser storage is unavailable. Enable site storage to save sample progress.",
    );
  }
}

// Public presentation uses only the embedded fixture and this browser's storage.
// No fetch, cookies, auth accounts, server filesystem, or paid services.
export function browserSampleRequest(
  url: string,
  body: unknown,
  snapshot: Snapshot,
  storage: Storage,
): unknown {
  if (!snapshot.sample || snapshot.id !== "sample")
    throw new Error("Only the teaching sample is available publicly.");
  if (url === "/api/session")
    return {
      user: { anonymous: true },
      storage: "browser",
      ai: false,
      auth: false,
      projects: [],
    };
  if (url === "/api/account") {
    const { action } = z
      .object({ action: z.literal("delete-data") })
      .parse(body);
    if (action === "delete-data") storage.removeItem(key);
    return { ok: true };
  }
  if (url === "/api/progress?projectId=sample") return read(storage);
  if (url === "/api/progress") {
    const input = z
      .object({
        projectId: z.literal("sample"),
        level: levelSchema,
        visited: z.array(z.string()).max(100),
      })
      .parse(body);
    const progress = read(storage);
    progress.level = input.level;
    progress.visited = [
      ...new Set([...progress.visited, ...input.visited]),
    ].filter((id) => snapshot.concepts.some((c) => c.id === id));
    progress.updatedAt = new Date().toISOString();
    save(storage, progress);
    return progress;
  }
  if (url === "/api/tutor") {
    const input = z
      .object({
        projectId: z.literal("sample"),
        conceptId: z.string(),
        question: z.string().min(3).max(1500),
        level: levelSchema,
      })
      .parse(body);
    const concept = snapshot.concepts.find((c) => c.id === input.conceptId);
    if (!concept) throw new Error("Concept not found.");
    return sourceGuide(snapshot, concept, input.question, input.level);
  }
  if (url === "/api/assessment") {
    const input = z
      .object({
        projectId: z.literal("sample"),
        conceptId: z.string(),
        questionId: z.string(),
        answer: z.union([
          z.number().int().min(0).max(3),
          z.string().min(1).max(2000),
        ]),
      })
      .parse(body);
    const concept = snapshot.concepts.find((c) => c.id === input.conceptId);
    const question =
      concept && questions(concept).find((q) => q.id === input.questionId);
    if (!question) throw new Error("Question not found.");
    if (question.kind === "short") {
      if (typeof input.answer !== "string")
        throw new Error("Write an explanation.");
      return {
        ...scoreShort(question, input.answer),
        explanation: question.explanation,
        ungraded: true,
      };
    }
    if (
      typeof input.answer !== "number" ||
      input.answer >= (question.options?.length ?? 0)
    )
      throw new Error("Choose an available answer.");
    const score = scoreChoice(question, input.answer);
    const progress = read(storage);
    progress.attempts = [
      ...progress.attempts,
      {
        id: crypto.randomUUID(),
        conceptId: concept!.id,
        questionId: question.id,
        correct: score === 1,
        score,
        at: new Date().toISOString(),
        kind: "choice" as const,
      },
    ].slice(-200);
    progress.updatedAt = new Date().toISOString();
    save(storage, progress);
    return {
      score,
      correct: score === 1,
      correctAnswer: question.answer,
      explanation: question.explanation,
      progress,
    };
  }
  throw new Error(
    "Repository imports, cloud accounts, and live AI are available only in the protected workspace or a configured local installation.",
  );
}
