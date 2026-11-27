import { PGlite } from "@electric-sql/pglite";
import { readFile, readdir } from "node:fs/promises";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
let db: PGlite;
const alice = "11111111-1111-4111-8111-111111111111",
  bob = "22222222-2222-4222-8222-222222222222";
const leaseA = "33333333-3333-4333-8333-333333333333",
  leaseB = "44444444-4444-4444-8444-444444444444";
beforeAll(async () => {
  db = new PGlite();
  await db.exec(
    `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;insert into auth.users values('${alice}'),('${bob}');`,
  );
  for (const file of (await readdir("supabase/migrations"))
    .filter((f) => f.endsWith(".sql"))
    .sort())
    await db.exec(await readFile(`supabase/migrations/${file}`, "utf8"));
}, 30000);
afterAll(async () => {
  await db.close();
});
async function asUser(id: string) {
  await db.exec(
    `reset role;set role authenticated;select set_config('request.jwt.claim.sub','${id}',false);`,
  );
}
async function acquire(key: string, token: string) {
  return (
    await db.query<{ ok: boolean }>(
      "select acquire_learning_lock($1,$2) as ok",
      [key, token],
    )
  ).rows[0].ok;
}
async function write(token: string) {
  await db.query(
    "select put_locked_learning_record('import:fixture',$1,'import','fixture','{\"cursor\":6}'::jsonb)",
    [token],
  );
}
describe("cloud coordination SQL in local Postgres (hosted verification is separate)", () => {
  it("allows only one active worker per owner and lock", async () => {
    await asUser(alice);
    expect(await acquire("import:fixture", leaseA)).toBe(true);
    expect(await acquire("import:fixture", leaseB)).toBe(false);
  });
  it("rejects writes from a worker with the wrong fence", async () => {
    await expect(write(leaseB)).rejects.toThrow(/Lease expired/);
    await write(leaseA);
  });
  it("keeps another owner's locks and writes independent", async () => {
    await asUser(bob);
    expect(await acquire("import:fixture", leaseB)).toBe(true);
    await expect(write(leaseA)).rejects.toThrow(/Lease expired/);
    await write(leaseB);
    const rows = await db.query<{ owner_id: string }>(
      "select owner_id from learning_records",
    );
    expect(rows.rows.map((r) => r.owner_id)).toEqual([bob]);
  });
  it("rejects late writes after a lease expires and can resume with a fresh fence", async () => {
    await db.exec(
      "reset role;update synapse_private.learning_locks set expires_at=now()-interval '1 second'",
    );
    await asUser(alice);
    await expect(write(leaseA)).rejects.toThrow(/Lease expired/);
    expect(await acquire("import:fixture", leaseB)).toBe(true);
    await expect(write(leaseA)).rejects.toThrow(/Lease expired/);
    await write(leaseB);
  });
  it("an old worker cannot release its replacement's lease", async () => {
    await db.query("select release_learning_lock('import:fixture',$1)", [
      leaseA,
    ]);
    expect(await acquire("import:fixture", leaseA)).toBe(false);
    await db.query("select release_learning_lock('import:fixture',$1)", [
      leaseB,
    ]);
    expect(await acquire("import:fixture", leaseA)).toBe(true);
  });
  it("global model-minute limits span independent users", async () => {
    for (let i = 0; i < 8; i++) {
      await asUser(i % 2 ? alice : bob);
      expect(
        (
          await db.query<{ ok: boolean }>(
            "select consume_learning_global_quota('model-minute') as ok",
          )
        ).rows[0].ok,
      ).toBe(true);
    }
    expect(
      (
        await db.query<{ ok: boolean }>(
          "select consume_learning_global_quota('model-minute') as ok",
        )
      ).rows[0].ok,
    ).toBe(false);
  });
  it("global daily reservations cannot be refunded or reset by users", async () => {
    for (let i = 0; i < 50; i++)
      expect(
        (
          await db.query<{ ok: boolean }>(
            "select consume_learning_global_quota('model-day') as ok",
          )
        ).rows[0].ok,
      ).toBe(true);
    await asUser(bob);
    expect(
      (
        await db.query<{ ok: boolean }>(
          "select consume_learning_global_quota('model-day') as ok",
        )
      ).rows[0].ok,
    ).toBe(false);
    await expect(
      db.query("delete from synapse_private.global_usage"),
    ).rejects.toThrow(/permission denied/);
    await expect(
      db.query("select consume_learning_global_quota('invented')"),
    ).rejects.toThrow(/Unknown global quota/);
  });
  it("logged-out roles cannot consume quotas or acquire locks", async () => {
    await db.exec("reset role;set role anon;");
    await expect(
      db.query("select consume_learning_global_quota('model-day')"),
    ).rejects.toThrow(/permission denied/);
    await expect(acquire("import:fixture", leaseA)).rejects.toThrow(
      /permission denied/,
    );
  });
});
