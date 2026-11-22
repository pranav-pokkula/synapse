import { z } from "zod";
import { sampleSnapshot } from "./sample";
import { getRecord, type Identity } from "./store";
import type { Snapshot } from "./types";
import { AppError } from "./errors";
export async function project(user: Identity, id: string) {
  if (id === "sample") return sampleSnapshot();
  z.uuid().parse(id);
  const snapshot = await getRecord<Snapshot>(user, "snapshot", id);
  if (!snapshot) throw new AppError("Project not found in this session.", 404);
  return snapshot;
}
