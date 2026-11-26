import { NextResponse } from "next/server";
import { identity, listRecords, getRecord, putRecord } from "@/lib/store";
import { cloudConfigured } from "@/lib/supabase";
import { providerConfigured } from "@/lib/provider";
import { failure } from "@/lib/http";
import type { Snapshot } from "@/lib/types";
export async function GET() {
  try {
    const user = await identity({ createGuest: true });
    if (!(await getRecord(user, "profile", "learner")))
      await putRecord(user, "profile", "learner", {
        createdAt: new Date().toISOString(),
        defaultLevel: "beginner",
      });
    const snapshots = await listRecords<Snapshot>(user, "snapshot");
    return NextResponse.json(
      {
        user: { email: user.email, anonymous: user.anonymous },
        storage: user.cloud ? "cloud" : "local",
        ai: providerConfigured(),
        auth: cloudConfigured(),
        projects: snapshots.map((s) => ({
          id: s.id,
          owner: s.owner,
          repo: s.repo,
          sha: s.sha,
        })),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return failure(e);
  }
}
