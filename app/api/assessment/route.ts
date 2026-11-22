import { NextResponse } from "next/server";
import { z } from "zod";
import {
  questions,
  scoreChoice,
  scoreShort,
  emptyProgress,
  mastery,
} from "@/lib/learning";
import {
  consume,
  getRecord,
  identity,
  putRecord,
  serialized,
} from "@/lib/store";
import { project } from "@/lib/project";
import type { Progress } from "@/lib/types";
import { failure, readBody } from "@/lib/http";
import { AppError } from "@/lib/errors";
export async function POST(request: Request) {
  try {
    const b = z
      .object({
        projectId: z.string().max(50),
        conceptId: z.string().max(30),
        questionId: z.string().max(70),
        answer: z.union([
          z.number().int().min(0).max(3),
          z.string().min(1).max(2000),
        ]),
      })
      .strict()
      .parse(await readBody(request));
    const user = await identity();
    await consume(user, "assessments", 120, 3600);
    const snapshot = await project(user, b.projectId);
    const concept = snapshot.concepts.find((c) => c.id === b.conceptId);
    const q = concept && questions(concept).find((q) => q.id === b.questionId);
    if (!q) throw new AppError("Question not found.", 404);
    if (q.kind === "short" && typeof b.answer !== "string")
      throw new AppError("Write a technical explanation for this question.");
    if (q.kind === "short" && typeof b.answer === "string") {
      const feedback = {
        ...scoreShort(q, b.answer),
        explanation: q.explanation,
        ungraded: true,
      };
      await putRecord(user, "attempt", crypto.randomUUID(), {
        projectId: snapshot.id,
        conceptId: concept!.id,
        questionId: q.id,
        kind: "short",
        answer: b.answer,
        feedback,
        at: new Date().toISOString(),
      });
      return NextResponse.json(feedback);
    }
    if (typeof b.answer !== "number") throw new AppError("Choose one answer.");
    if (b.answer >= (q.options?.length ?? 0))
      throw new AppError("Choose an available answer.");
    const score = scoreChoice(q, b.answer);
    return await serialized(`${user.id}:progress:${b.projectId}`, async () => {
      const progress =
        (await getRecord<Progress>(user, "progress", b.projectId)) ??
        emptyProgress();
      const attempt = {
        id: crypto.randomUUID(),
        conceptId: b.conceptId,
        questionId: q.id,
        correct: score === 1,
        score,
        at: new Date().toISOString(),
        kind: "choice" as const,
      };
      progress.attempts = [...progress.attempts, attempt].slice(-200);
      progress.updatedAt = new Date().toISOString();
      await putRecord(user, "attempt", attempt.id, attempt);
      await putRecord(user, "progress", b.projectId, progress);
      return NextResponse.json({
        score,
        correct: score === 1,
        correctAnswer: q.answer,
        explanation: q.explanation,
        progress,
        mastery: mastery(progress, b.conceptId),
        nextConcept: snapshot.concepts.find(
          (c) => mastery(progress, c.id) < 100,
        )?.id,
      });
    });
  } catch (e) {
    return failure(e);
  }
}
