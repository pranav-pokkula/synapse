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
import { supabase, cloudConfigured } from "./supabase";
import { AppError } from "./errors";
export type Identity = {
  id: string;
  email?: string;
  cloud: boolean;
  anonymous: boolean;
};
const uuid =
  /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
export async function identity(): Promise<Identity> {
  const db = await supabase();
  if (db) {
    const {
      data: { user },
    } = await db.auth.getUser();
    if (user)
      return {
        id: user.id,
        email: user.email,
        cloud: true,
        anonymous: Boolean(user.is_anonymous),
      };
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
) {
  if (user.cloud) {
    const db = await supabase();
    const { error } = await db!
      .from("learning_records")
      .upsert(
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
  await rm(path.dirname(path.dirname(location(user.id, "progress", "all"))), {
    recursive: true,
    force: true,
  });
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
  if (cloudConfigured()) {
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
