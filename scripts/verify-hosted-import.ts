import { request } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { validCitation } from "../lib/analysis";
import type { Snapshot } from "../lib/types";
const baseURL = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000";
const client = await request.newContext({
  baseURL,
  extraHTTPHeaders: { Origin: new URL(baseURL).origin },
  timeout: 60000,
});
const report: Record<string, unknown> = {
  recordedAt: new Date().toISOString(),
  baseURL,
  repository: "vercel/nextjs-postgres-nextauth-tailwindcss-template",
  complete: false,
};
try {
  const session = await (await client.get("/api/session")).json();
  if (session.storage !== "cloud")
    throw new Error("Hosted persistence required");
  let response = await client.post("/api/import", {
    data: {
      url: "https://github.com/vercel/nextjs-postgres-nextauth-tailwindcss-template",
    },
  });
  let job = await response.json();
  if (!response.ok()) throw new Error(job.error);
  for (let i = 0; job.status !== "complete" && i < 15; i++) {
    response = await client.post(`/api/import/${job.id}`, { data: {} });
    job = await response.json();
    if (!response.ok() || job.status === "failed")
      throw new Error(job.error ?? "Checkpoint failed");
    console.log(`Hosted import checkpoint ${i + 1}: ${job.status}`);
  }
  if (job.status !== "complete") throw new Error("Import did not finish");
  const id = job.snapshotId ?? job.id;
  const snapshot = (await (
    await client.get(`/api/project/${id}`)
  ).json()) as Snapshot;
  const citations = snapshot.concepts.flatMap((c) => c.evidence);
  if (
    !snapshot.files.length ||
    !citations.length ||
    !citations.every((c) => validCitation(c, snapshot))
  )
    throw new Error("Snapshot evidence invalid");
  const second = await request.newContext({
    baseURL,
    storageState: await client.storageState(),
  });
  const reload = await (await second.get(`/api/project/${id}`)).json();
  await second.dispose();
  if (reload.sha !== snapshot.sha) throw new Error("Snapshot did not persist");
  const stranger = await request.newContext({ baseURL });
  await stranger.get("/api/session");
  const denied = await stranger.get(`/api/project/${id}`);
  await stranger.dispose();
  if (denied.status() !== 404)
    throw new Error("Cross-session snapshot exposed");
  await mkdir(".synapse/hosted", { recursive: true, mode: 0o700 });
  await writeFile(".synapse/hosted/snapshot.json", JSON.stringify(snapshot), {
    mode: 0o600,
  });
  await writeFile(
    ".synapse/hosted/browser-state.json",
    JSON.stringify(await client.storageState()),
    { mode: 0o600 },
  );
  Object.assign(report, {
    complete: true,
    sha: snapshot.sha,
    files: snapshot.files.length,
    edges: snapshot.edges.length,
    concepts: snapshot.concepts.map((c) => c.id),
    validCitations: citations.length,
    reload: true,
    crossSessionStatus: denied.status(),
    snapshotId: id,
  });
} catch (error) {
  report.error = (error as Error).message;
  process.exitCode = 1;
} finally {
  await writeFile(
    "evidence/hosted-import-results.json",
    JSON.stringify(report, null, 2),
  );
  await client.dispose();
  console.log(JSON.stringify(report));
}
