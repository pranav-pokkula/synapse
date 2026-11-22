import { NextResponse } from "next/server";
import { z } from "zod";
import { beginImport } from "@/lib/github";
import { consume, identity, putRecord, listRecords } from "@/lib/store";
import type { Snapshot } from "@/lib/types";
import { failure, readBody } from "@/lib/http";
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    const { url } = z
      .object({ url: z.string().max(240) })
      .strict()
      .parse(await readBody(request));
    const user = await identity();
    await consume(user, "imports-hour", 5, 3600);
    const job = await beginImport(url);
    const cached = (await listRecords<Snapshot>(user, "snapshot")).find(
      (s) =>
        s.owner.toLowerCase() === job.owner.toLowerCase() &&
        s.repo.toLowerCase() === job.repo.toLowerCase() &&
        s.sha === job.sha,
    );
    if (cached) {
      job.status = "complete";
      job.snapshotId = cached.id;
      job.cursor = job.queue.length;
    }
    await putRecord(user, "import", job.id, job);
    return NextResponse.json({
      id: job.id,
      status: job.status,
      total: job.queue.length,
      processed: job.cursor,
      sha: job.sha,
      snapshotId: job.snapshotId,
      cached: Boolean(cached),
    });
  } catch (e) {
    return failure(e);
  }
}
