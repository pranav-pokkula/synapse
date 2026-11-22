import { NextResponse } from "next/server";
import { z } from "zod";
import { levelSchema } from "@/lib/types";
import { identity, consume, putRecord } from "@/lib/store";
import { project } from "@/lib/project";
import { tutor } from "@/lib/provider";
import { failure, readBody } from "@/lib/http";
import { AppError } from "@/lib/errors";
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    const b = z
      .object({
        projectId: z.string().max(50),
        conceptId: z.string().max(30),
        question: z.string().trim().min(3).max(1500),
        level: levelSchema,
        history: z
          .array(
            z
              .object({
                role: z.enum(["user", "assistant"]),
                content: z.string().max(2000),
              })
              .strict(),
          )
          .max(4)
          .default([]),
      })
      .strict()
      .parse(await readBody(request));
    const user = await identity();
    await consume(user, "tutor", 40, 3600);
    const snapshot = await project(user, b.projectId);
    const concept = snapshot.concepts.find((c) => c.id === b.conceptId);
    if (!concept) throw new AppError("Concept not found.", 404);
    const result = await tutor(
      user,
      snapshot,
      concept,
      b.question,
      b.level,
      b.history,
    );
    await putRecord(user, "tutor", crypto.randomUUID(), {
      projectId: snapshot.id,
      conceptId: concept.id,
      question: b.question,
      result,
      at: new Date().toISOString(),
    });
    return NextResponse.json(result);
  } catch (e) {
    return failure(e);
  }
}
