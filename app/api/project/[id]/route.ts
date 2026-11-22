import { NextResponse } from "next/server";
import { z } from "zod";
import { sampleSnapshot } from "@/lib/sample";
import { getRecord, identity } from "@/lib/store";
import type { Snapshot } from "@/lib/types";
import { AppError } from "@/lib/errors";
import { failure } from "@/lib/http";
export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    if (id === "sample") return NextResponse.json(sampleSnapshot());
    z.uuid().parse(id);
    const snapshot = await getRecord<Snapshot>(
      await identity(),
      "snapshot",
      id,
    );
    if (!snapshot)
      throw new AppError(
        "This project is unavailable in the current session. Import it again or return to the sample.",
        404,
      );
    return NextResponse.json(snapshot, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (e) {
    return failure(e);
  }
}
