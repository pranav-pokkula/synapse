import { existsSync } from "node:fs";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { sampleSnapshot } from "../lib/sample";
import { retrieve } from "../lib/analysis";
import { modelRequest } from "../lib/provider";
import type { Snapshot } from "../lib/types";
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
if (
  new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname !==
  "fcwyithhipsimrnccqsy.supabase.co"
)
  throw new Error("SYNAPSE target required");
const manifestText = await readFile(
  "evidence/stage2-evaluation-manifest.json",
  "utf8",
);
const manifest = JSON.parse(manifestText);
const real = JSON.parse(
  await readFile(
    process.env.EVAL_SNAPSHOT ??
      ".synapse/f599e9dc-dd12-4ea6-a3fb-05766e8c192c/snapshot/01160c03-e5d7-4642-b676-3870c49475ac.json",
    "utf8",
  ),
) as Snapshot;
if (real.sha !== manifest.heldOutSha)
  throw new Error("Predeclared source SHA mismatch");
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const login = await db.auth.signInAnonymously();
if (login.error) throw new Error("Evaluation authentication failed");
const outputs: Record<string, unknown>[] = [];
const report = {
  recordedAt: new Date().toISOString(),
  manifestHash: createHash("sha256").update(manifestText).digest("hex"),
  manifestVersion: manifest.version,
  requestedModel: process.env.LLM_MODEL,
  outputs,
  humanScores: null,
  complete: false,
};
await mkdir(".synapse/evaluation", { recursive: true, mode: 0o700 });
const originalFetch = globalThis.fetch;
let observed: Record<string, unknown> | null = null;
globalThis.fetch = async (...args) => {
  const response = await originalFetch(...args);
  if (String(args[0]).includes("api.withprune.com/v1/chat/completions")) {
    const body = await response.clone().json();
    observed = { status: response.status, body };
  }
  return response;
};
let lastStarted = 0;
try {
  for (const [index, c] of manifest.cases.entries()) {
    const snapshot = c.dataset === "development" ? sampleSnapshot() : real;
    for (const condition of index % 2
      ? ["synapse", "baseline"]
      : ["baseline", "synapse"]) {
      // Pace the bounded evaluation below the shared minute ceiling; no retries.
      await new Promise((r) =>
        setTimeout(r, Math.max(0, 9000 - (Date.now() - lastStarted))),
      );
      for (const bucket_name of ["model-minute", "model-day"]) {
        const quota = await db.rpc("consume_learning_global_quota", {
          bucket_name,
        });
        if (quota.error || quota.data !== true)
          throw new Error("Shared evaluation quota unavailable or exhausted");
      }
      const quota = await db.rpc("consume_learning_quota", {
        bucket_name: "model-daily",
        max_count: 20,
        window_seconds: 86400,
      });
      if (quota.error || quota.data !== true)
        throw new Error("Evaluation account quota exhausted");
      const context =
        condition === "baseline"
          ? snapshot.files
              .slice(0, 2)
              .map((f) => ({ path: f.path, content: f.content }))
          : retrieve(snapshot, c.question, 3);
      observed = null;
      lastStarted = Date.now();
      const outcome: Record<string, unknown> = {
        id: c.id,
        dataset: c.dataset,
        condition,
        question: c.question,
        context,
        sourceSha: snapshot.sha,
        humanScores: null,
      };
      try {
        outcome.answer = await modelRequest(
          snapshot,
          c.question,
          JSON.stringify(context),
          "intermediate",
          [],
          { cacheMode: "off", feature: "synapse-evaluation" },
        );
        outcome.valid = true;
      } catch (error) {
        outcome.valid = false;
        outcome.error = (error as Error).message;
      }
      outcome.ms = Date.now() - lastStarted;
      // Keep the complete native gateway envelope private; it can include thought signatures and tenant IDs.
      const raw = observed as {
        status: number;
        body: Record<string, unknown>;
      } | null;
      if (raw) {
        await writeFile(
          `.synapse/evaluation/${c.id}-${condition}.json`,
          JSON.stringify(raw, null, 2),
          { mode: 0o600 },
        );
        outcome.httpStatus = raw.status;
        const body = raw.body as {
          choices?: { message?: { content?: string } }[];
          candidates?: {
            content?: { parts?: { text?: string; thought?: boolean }[] };
          }[];
        };
        outcome.rawModelText =
          body.choices?.[0]?.message?.content ??
          body.candidates?.[0]?.content?.parts
            ?.filter((p) => !p.thought)
            .map((p) => p.text ?? "")
            .join("") ??
          null;
      }
      outputs.push(outcome);
      await writeFile(
        "evidence/stage2-evaluation-results.json",
        JSON.stringify(report, null, 2),
      );
      console.log(
        `${c.id} ${condition}: ${outcome.valid ? "validated" : "rejected"} (${outcome.ms}ms)`,
      );
    }
  }
  report.complete = true;
} catch (error) {
  outputs.push({ executionError: (error as Error).message });
  process.exitCode = 1;
} finally {
  globalThis.fetch = originalFetch;
  await db.auth.signOut({ scope: "local" });
  await writeFile(
    "evidence/stage2-evaluation-results.json",
    JSON.stringify(report, null, 2),
  );
}
