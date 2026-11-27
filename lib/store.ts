import { publicServerMode } from "./deployment-mode";
import { cookies } from "next/headers";
import {
  mkdir,
  readFile,
  writeFile,
  rename,
  rm,
  readdir,
} from "node:fs/promises";
import path from "node:path";
import { supabase } from "./supabase";
import { AppError } from "./errors";
export type Identity = {
  id: string;
  email?: string;
  cloud: boolean;
  anonymous: boolean;
};
export type Lease = { key: string; token: string };
const uuid =
  /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
export async function identity(
  options: { createGuest?: boolean } = {},
): Promise<Identity> {
  if (publicServerMode())
    throw new AppError(
      "Server features are disabled in the public sample.",
      403,
      "PUBLIC_SAMPLE_ONLY",
    );
  const db = await supabase();
  if (db) {
    const {
      data: { user },
      error,
    } = await db.auth.getUser();
    if (user)
      return {
        id: user.id,
        email: user.email,
        cloud: true,
        anonymous: Boolean(user.is_anonymous),
      };
    const jar = await cookies();
    const previousSession = jar
      .getAll()
      .some((c) => /^sb-.+-auth-token/.test(c.name));
    if (previousSession)
      throw new AppError(
        error?.status && error.status >= 500
          ? "Authentication is temporarily unavailable. Your cloud history has been preserved; retry shortly."
          : "Your session has expired. Sign out and start a new session, or sign in again to restore your account history.",
        error?.status && error.status >= 500 ? 503 : 401,
        "AUTH_SESSION",
      );
    if (!options.createGuest)
      throw new AppError(
        "Open the learning workspace to start a session before using this feature.",
        401,
        "AUTH_REQUIRED",
      );
    const result = await db.auth.signInAnonymously();
    if (result.error || !result.data.user)
      throw new AppError(
        "Cloud guest sessions are unavailable. Enable anonymous sign-ins in Supabase, or explore the browser-only sample.",
        503,
        "AUTH_CONFIG",
      );
    return { id: result.data.user.id, cloud: true, anonymous: true };
  }
  if (process.env.VERCEL)
    throw new AppError(
      "Cloud storage is not configured. The interactive sample remains available.",
      503,
      "STORAGE_CONFIG",
    );
  const jar = await cookies();
  let id = jar.get("synapse-guest")?.value;
  if (!id || !uuid.test(id)) {
    id = crypto.randomUUID();
    jar.set("synapse-guest", id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return { id, cloud: false, anonymous: true };
}
function location(user: string, kind: string, id: string) {
  if (
    !/^[a-f0-9-]{36}$/i.test(user) ||
    !/^[a-z-]{1,30}$/.test(kind) ||
    !/^[a-zA-Z0-9_.-]{1,100}$/.test(id) ||
    id === ".."
  )
    throw new AppError("Invalid storage key");
  return path.join(process.cwd(), ".synapse", user, kind, `${id}.json`);
}
export async function getRecord<T>(
  user: Identity,
  kind: string,
  id: string,
): Promise<T | null> {
  if (user.cloud) {
    const db = await supabase();
    const { data, error } = await db!
      .from("learning_records")
      .select("payload")
      .eq("owner_id", user.id)
      .eq("kind", kind)
      .eq("id", id)
      .maybeSingle();
    if (error)
      throw new AppError(
        "Cloud data could not be loaded. Please retry.",
        503,
        "STORAGE_ERROR",
      );
    return (data?.payload as T) ?? null;
  }
  try {
    return JSON.parse(await readFile(location(user.id, kind, id), "utf8")) as T;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw e;
  }
}
export async function putRecord(
  user: Identity,
  kind: string,
  id: string,
  payload: unknown,
  lease?: Lease,
) {
  if (user.cloud) {
    const db = await supabase();
    if (lease) {
      const { error } = await db!.rpc("put_locked_learning_record", {
        lock_key: lease.key,
        lease_token: lease.token,
        record_kind: kind,
        record_id: id,
        record_payload: payload,
      });
      if (error)
        throw new AppError(
          "This operation could not save its current checkpoint. Retry to resume safely.",
          error.code === "40001" ? 409 : 503,
          "CHECKPOINT_CONFLICT",
        );
      return;
    }
    const { error } = await db!.from("learning_records").upsert(
      {
        owner_id: user.id,
        kind,
        id,
        payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "owner_id,kind,id" },
    );
    if (error)
      throw new AppError(
        "Cloud changes could not be saved. Please retry.",
        503,
        "STORAGE_ERROR",
      );
    return;
  }
  const target = location(user.id, kind, id);
  await mkdir(path.dirname(target), { recursive: true, mode: 0o700 });
  const temp = target + "." + crypto.randomUUID() + ".tmp";
  await writeFile(temp, JSON.stringify(payload), { mode: 0o600 });
  await rename(temp, target);
}
export async function listRecords<T>(
  user: Identity,
  kind: string,
): Promise<T[]> {
  if (user.cloud) {
    const db = await supabase();
    const { data, error } = await db!
      .from("learning_records")
      .select("payload")
      .eq("owner_id", user.id)
      .eq("kind", kind)
      .order("updated_at", { ascending: false })
      .limit(30);
    if (error) throw new AppError("Saved projects could not be loaded.", 503);
    return data.map((row) => row.payload as T);
  }
  const directory = path.dirname(location(user.id, kind, "list"));
  try {
    const files = await readdir(directory);
    const records = await Promise.all(
      files
        .filter((f) => f.endsWith(".json"))
        .slice(-30)
        .map((f) =>
          readFile(path.join(directory, f), "utf8").then(
            (s) => JSON.parse(s) as T,
          ),
        ),
    );
    return records;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw e;
  }
}
export async function deleteRecords(user: Identity) {
  if (user.cloud) {
    const db = await supabase();
    const { error } = await db!
      .from("learning_records")
      .delete()
      .eq("owner_id", user.id);
    if (error)
      throw new AppError(
        "Your learning data could not be deleted. Please retry.",
        503,
      );
    return;
  }
  const root = path.dirname(path.dirname(location(user.id, "progress", "all")));
  const entries = await readdir(root).catch(() => []);
  for (const entry of entries)
    if (entry !== "quota")
      await rm(path.join(root, entry), { recursive: true, force: true });
}
const locks = new Map<string, Promise<unknown>>();
export async function serialized<T>(
  key: string,
  task: () => Promise<T>,
): Promise<T> {
  const previous = locks.get(key) ?? Promise.resolve();
  const pending = previous.catch(() => {}).then(task);
  locks.set(key, pending);
  try {
    return await pending;
  } finally {
    if (locks.get(key) === pending) locks.delete(key);
  }
}
export async function consume(
  user: Identity,
  bucket: string,
  max: number,
  windowSeconds: number,
) {
  if (user.cloud) {
    const db = await supabase();
    const { data, error } = await db!.rpc("consume_learning_quota", {
      bucket_name: bucket,
      max_count: max,
      window_seconds: windowSeconds,
    });
    if (error)
      throw new AppError(
        "Usage checks are unavailable. Try again shortly.",
        503,
        "QUOTA_UNAVAILABLE",
      );
    if (data !== true)
      throw new AppError(
        "You have reached this feature’s usage limit. Try again after the limit resets.",
        429,
        "USAGE_LIMIT",
      );
    return;
  }
  await serialized(`${user.id}:${bucket}`, async () => {
    const now = Date.now();
    const old = await getRecord<{ count: number; reset: number }>(
      user,
      "quota",
      bucket,
    );
    const current =
      old && old.reset > now
        ? old
        : { count: 0, reset: now + windowSeconds * 1000 };
    if (current.count >= max)
      throw new AppError(
        "Usage limit reached. Try again after the limit resets.",
        429,
        "USAGE_LIMIT",
      );
    await putRecord(user, "quota", bucket, {
      ...current,
      count: current.count + 1,
    });
  });
}

export async function withLease<T>(
  user: Identity,
  key: string,
  task: (lease?: Lease) => Promise<T>,
): Promise<T> {
  if (!user.cloud) return serialized(`${user.id}:${key}`, () => task());
  const db = await supabase();
  const lease = { key, token: crypto.randomUUID() };
  const args = { lock_key: key, lease_token: lease.token };
  const { data, error } = await db!.rpc("acquire_learning_lock", args);
  if (error)
    throw new AppError(
      "Cloud coordination is unavailable. Please retry shortly.",
      503,
      "LOCK_UNAVAILABLE",
    );
  if (data !== true)
    throw new AppError(
      "This operation is already running. Wait a moment, then retry to resume it.",
      409,
      "JOB_BUSY",
    );
  try {
    return await task(lease);
  } finally {
    try {
      await db!.rpc("release_learning_lock", args);
    } catch {
      /* Expiring lease remains safe if release is unavailable. */
    }
  }
}

export async function consumeGlobal(
  user: Identity,
  bucket: "model-day" | "model-minute" | "github-hour",
) {
  if (user.cloud) {
    const db = await supabase();
    const { data, error } = await db!.rpc("consume_learning_global_quota", {
      bucket_name: bucket,
    });
    if (error)
      throw new AppError(
        "Shared usage protection is unavailable. Live requests are paused; your saved lessons remain available.",
        503,
        "GLOBAL_LIMIT_UNAVAILABLE",
      );
    if (data !== true)
      throw new AppError(
        "SYNAPSE has reached its shared request allowance. Please use saved lessons and retry after the limit resets.",
        429,
        "GLOBAL_LIMIT",
      );
    return;
  }
  if (process.env.VERCEL)
    throw new AppError(
      "Hosted requests need centralized usage protection.",
      503,
      "GLOBAL_LIMIT_UNAVAILABLE",
    );
  const cap = bucket === "model-day" ? 50 : bucket === "model-minute" ? 8 : 55;
  const duration =
    bucket === "model-day"
      ? 86400000
      : bucket === "model-minute"
        ? 60000
        : 3600000;
  const globalUser: Identity = {
    id: "00000000-0000-4000-8000-000000000000",
    cloud: false,
    anonymous: true,
  };
  await serialized(`global:${bucket}`, async () => {
    const window = Math.floor(Date.now() / duration) * duration;
    const old = await getRecord<{ window: number; count: number }>(
      globalUser,
      "quota",
      bucket,
    );
    const count = old?.window === window ? old.count : 0;
    if (count >= cap)
      throw new AppError(
        "SYNAPSE has reached its shared request allowance. Retry after the limit resets.",
        429,
        "GLOBAL_LIMIT",
      );
    await putRecord(globalUser, "quota", bucket, { window, count: count + 1 });
  });
}

export async function reserveModelCall(user: Identity) {
  if (process.env.VERCEL && process.env.PRUNE_SHIELD_VERIFIED !== "true")
    throw new AppError(
      "Live AI is paused until gateway spending protection is verified. Source lessons remain available.",
      503,
      "SPEND_PROTECTION",
    );
  await consume(
    user,
    "model-daily",
    Math.min(20, Math.max(1, Number(process.env.LLM_DAILY_CALL_LIMIT) || 20)),
    86400,
  );
  await consumeGlobal(user, "model-minute");
  await consumeGlobal(user, "model-day");
}
