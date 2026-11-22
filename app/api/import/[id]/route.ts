import { NextResponse } from "next/server";
import { z } from "zod";
import { advanceImport } from "@/lib/github";
import {
  consume,
  getRecord,
  identity,
  putRecord,
  serialized,
} from "@/lib/store";
import { failure, readBody } from "@/lib/http";
import { AppError } from "@/lib/errors";
import type { ImportJob } from "@/lib/types";
export const maxDuration = 60;
type Context = { params: Promise<{ id: string }> };
function summarize(job: ImportJob) {
  return {
    id: job.id,
    status: job.status,
    total: job.queue.length,
    processed: job.cursor,
    sha: job.sha,
    error: job.error,
    snapshotId: job.snapshotId,
    revision: job.revision,
  };
}
export async function GET(_request: Request, ctx: Context) {
  try {
    const id = z.uuid().parse((await ctx.params).id);
    const user = await identity();
    const job = await getRecord<ImportJob>(user, "import", id);
    if (!job) throw new AppError("Import not found in this session.", 404);
    return NextResponse.json(summarize(job));
  } catch (e) {
    return failure(e);
  }
}
export async function POST(request: Request, ctx: Context) {
  try {
    await readBody(request);
    const id = z.uuid().parse((await ctx.params).id);
    const user = await identity();
    await consume(user, "import-steps", 60, 3600);
    return await serialized(`${user.id}:import:${id}`, async () => {
      const job = await getRecord<ImportJob>(user, "import", id);
      if (!job) throw new AppError("Import not found in this session.", 404);
      const result = await advanceImport(job);
      if (result.snapshot)
        await putRecord(user, "snapshot", id, result.snapshot);
      await putRecord(user, "import", id, result.job);
      return NextResponse.json(summarize(result.job));
    });
  } catch (e) {
    return failure(e);
  }
}
