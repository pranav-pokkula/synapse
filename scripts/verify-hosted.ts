import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!,
  key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
if (new URL(url).hostname !== "fcwyithhipsimrnccqsy.supabase.co")
  throw new Error(
    "This verification is restricted to the verified SYNAPSE project.",
  );
const client = () =>
  createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (url, init) =>
        fetch(url, { ...init, signal: AbortSignal.timeout(10000) }),
    },
  });
const a = client(),
  b = client(),
  loggedOut = client();
const checks: { name: string; passed: boolean }[] = [];
const report: Record<string, unknown> = {
  recordedAt: new Date().toISOString(),
  project: "TraceEval / synapse-learning",
  projectRef: "fcwyithhipsimrnccqsy",
  authentication:
    "Two real independent Supabase anonymous accounts; not simulated JWTs or email-OTP verification",
  checks,
};
const record = "verification-" + crypto.randomUUID();
function check(name: string, passed: boolean) {
  checks.push({ name, passed });
  console.log(name + ": " + (passed ? "PASS" : "FAIL"));
  if (!passed) throw new Error(name + " failed");
}
try {
  const ar = await a.auth.signInAnonymously(),
    br = await b.auth.signInAnonymously();
  check(
    "Two independent hosted identities",
    !ar.error &&
      !br.error &&
      Boolean(ar.data.user?.id) &&
      Boolean(br.data.user?.id) &&
      ar.data.user!.id !== br.data.user!.id,
  );
  const aid = ar.data.user!.id,
    bid = br.data.user!.id;
  const insert = await a.from("learning_records").insert({
    owner_id: aid,
    kind: "progress",
    id: record,
    payload: {
      level: "advanced",
      visited: ["modules"],
      attempts: [],
      updatedAt: new Date().toISOString(),
    },
  });
  check("Owner can save progress", !insert.error);
  const read = await a
    .from("learning_records")
    .select("payload")
    .eq("id", record);
  check(
    "Owner can reload persisted progress",
    !read.error && read.data?.[0]?.payload.level === "advanced",
  );
  const other = await b
    .from("learning_records")
    .select("id")
    .eq("owner_id", aid)
    .eq("id", record);
  check("B cannot read A records", !other.error && other.data?.length === 0);
  const update = await b
    .from("learning_records")
    .update({ payload: { forged: true } })
    .eq("owner_id", aid)
    .eq("id", record)
    .select("id");
  check(
    "B cannot modify A records",
    !update.error && update.data?.length === 0,
  );
  const remove = await b
    .from("learning_records")
    .delete()
    .eq("owner_id", aid)
    .eq("id", record)
    .select("id");
  check(
    "B cannot delete A records",
    !remove.error && remove.data?.length === 0,
  );
  const forged = await b.from("learning_records").insert({
    owner_id: aid,
    kind: "progress",
    id: record + "-forged",
    payload: {},
  });
  check("Forged ownership rejected", Boolean(forged.error));
  const reassign = await a
    .from("learning_records")
    .update({ owner_id: bid })
    .eq("id", record);
  check("Ownership reassignment rejected", Boolean(reassign.error));
  const unauth = await loggedOut
    .from("learning_records")
    .select("id")
    .eq("id", record);
  check("Logged-out table access denied", Boolean(unauth.error));
  const refreshed = await a.auth.refreshSession();
  const current = await a.auth.getUser();
  check(
    "Session refresh preserves identity",
    !refreshed.error && !current.error && current.data.user?.id === aid,
  );
  const tokenA = crypto.randomUUID(),
    tokenB = crypto.randomUUID(),
    lock = "import:" + record;
  const [one, two] = await Promise.all([
    a.rpc("acquire_learning_lock", { lock_key: lock, lease_token: tokenA }),
    a.rpc("acquire_learning_lock", { lock_key: lock, lease_token: tokenB }),
  ]);
  check(
    "Concurrent hosted workers have one winner",
    !one.error &&
      !two.error &&
      [one.data, two.data].filter(Boolean).length === 1,
  );
  const winner = one.data ? tokenA : tokenB,
    loser = one.data ? tokenB : tokenA;
  const stale = await a.rpc("put_locked_learning_record", {
    lock_key: lock,
    lease_token: loser,
    record_kind: "progress",
    record_id: record,
    record_payload: { forged: true },
  });
  check("Stale hosted worker cannot write", Boolean(stale.error));
  await a.rpc("release_learning_lock", { lock_key: lock, lease_token: winner });
  const quota = await a.from("learning_quotas").delete().eq("owner_id", aid);
  check("Users cannot reset their quota counters", Boolean(quota.error));
  const noQuota = await loggedOut.rpc("consume_learning_global_quota", {
    bucket_name: "model-day",
  });
  check("Logged-out users cannot reserve global usage", Boolean(noQuota.error));
  // Exercise only the minute window, never consume the daily spend reservation.
  // Run while no app/model workers are active; two identities share one ceiling.
  const reservations = await Promise.all(
    Array.from({ length: 9 }, (_, i) =>
      (i % 2 ? a : b).rpc("consume_learning_global_quota", {
        bucket_name: "model-minute",
      }),
    ),
  );
  check(
    "Deployment-wide minute limit is atomic across identities",
    reservations.every((r) => !r.error) &&
      reservations.filter((r) => r.data === true).length === 8 &&
      reservations.filter((r) => r.data === false).length === 1,
  );
  const deleted = await a
    .from("learning_records")
    .delete()
    .eq("owner_id", aid)
    .eq("id", record);
  const after = await a.from("learning_records").select("id").eq("id", record);
  check(
    "Owner deletion persists",
    !deleted.error && !after.error && after.data?.length === 0,
  );
  report.complete = true;
} catch (error) {
  report.complete = false;
  report.error = (error as Error).message;
  process.exitCode = 1;
} finally {
  // Each client can delete only its own isolated verification records.
  for (const c of [a, b]) {
    await c.from("learning_records").delete().eq("id", record);
    await c.auth.signOut({ scope: "local" });
  }
  report.limitations = [
    "Disposable anonymous Auth users remain; no service-role key is used to delete accounts.",
    "Email delivery/OTP sign-in is not exercised by this test.",
  ];
  await writeFile(
    "evidence/hosted-database-results.json",
    JSON.stringify(report, null, 2),
  );
}
