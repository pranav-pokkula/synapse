import { NextResponse } from "next/server";
import { z } from "zod";
import { levelSchema } from "@/lib/types";
import { makeLesson } from "@/lib/learning";
import { identity, putRecord } from "@/lib/store";
import { project } from "@/lib/project";
import { failure, readBody } from "@/lib/http";
import { AppError } from "@/lib/errors";
export async function POST(request: Request) {
  try {
    const body = z
      .object({
        projectId: z.string().max(50),
        conceptId: z.string().max(30),
        level: levelSchema,
      })
      .strict()
      .parse(await readBody(request));
    const user = await identity();
    const snapshot = await project(user, body.projectId);
    const concept = snapshot.concepts.find((c) => c.id === body.conceptId);
    if (!concept) throw new AppError("Concept not found.", 404);
    const lesson = makeLesson(snapshot, concept, body.level);
    await putRecord(
      user,
      "lesson",
      `${snapshot.id}-${concept.id}-${body.level}`,
      lesson,
    );
    return NextResponse.json(lesson);
  } catch (e) {
    return failure(e);
  }
}
