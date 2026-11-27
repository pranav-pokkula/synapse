import { NextResponse } from "next/server";
import { z } from "zod";
import { levelSchema, type Progress } from "@/lib/types";
import { emptyProgress } from "@/lib/learning";
import { identity, getRecord, putRecord, withLease } from "@/lib/store";
import { project } from "@/lib/project";
import { failure, readBody } from "@/lib/http";
export async function GET(request: Request) {
  try {
    const id = z
      .string()
      .max(50)
      .parse(new URL(request.url).searchParams.get("projectId"));
    const user = await identity();
    await project(user, id);
    return NextResponse.json(
      (await getRecord<Progress>(user, "progress", id)) ?? emptyProgress(),
    );
  } catch (e) {
    return failure(e);
  }
}
export async function POST(request: Request) {
  try {
    const { projectId, level, visited } = z
      .object({
        projectId: z.string().max(50),
        level: levelSchema,
        visited: z.array(z.string().max(30)).max(30),
      })
      .strict()
      .parse(await readBody(request));
    const user = await identity();
    const snapshot = await project(user, projectId);
    return await withLease(user, `progress:${projectId}`, async (lease) => {
      const progress =
        (await getRecord<Progress>(user, "progress", projectId)) ??
        emptyProgress();
      progress.level = level;
      progress.visited = [
        ...new Set([
          ...progress.visited,
          ...visited.filter((v) => snapshot.concepts.some((c) => c.id === v)),
        ]),
      ];
      progress.updatedAt = new Date().toISOString();
      await putRecord(user, "progress", projectId, progress, lease);
      return NextResponse.json(progress);
    });
  } catch (e) {
    return failure(e);
  }
}
