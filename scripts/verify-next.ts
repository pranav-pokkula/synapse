import { chromium, request } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { validCitation } from "../lib/analysis";
import type { Snapshot } from "../lib/types";

// Separate from the quick live suite: this consumes one GitHub request per
// selected source blob, plus metadata, commit, and tree requests.
const baseURL = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000";
const url =
  "https://github.com/vercel/nextjs-postgres-nextauth-tailwindcss-template";
const client = await request.newContext({
  baseURL,
  extraHTTPHeaders: { Origin: new URL(baseURL).origin },
});
const start = performance.now();
const report: Record<string, unknown> = {
  recordedAt: new Date().toISOString(),
  url,
  network: "Actual public GitHub API; imported code is never executed",
};
try {
  await client.get("/api/session");
  const response = await client.post("/api/import", { data: { url } });
  let job = await response.json();
  if (!response.ok()) throw new Error(job.error);
  let checkpoints = 0;
  while (job.status !== "complete" && checkpoints < 12) {
    const result = await client.post(`/api/import/${job.id}`, { data: {} });
    job = await result.json();
    checkpoints++;
    if (!result.ok() || job.status === "failed")
      throw new Error(job.error ?? "Checkpoint failed");
  }
  if (job.status !== "complete") throw new Error("Import did not finish");
  const snapshotResponse = await client.get(
    `/api/project/${job.snapshotId ?? job.id}`,
  );
  const snapshot = (await snapshotResponse.json()) as Snapshot;
  if (!snapshotResponse.ok()) throw new Error("Snapshot could not be loaded");
  const citations = snapshot.concepts.flatMap((concept) => concept.evidence);
  if (!citations.length || !citations.every((c) => validCitation(c, snapshot)))
    throw new Error("Source citation validation failed");
  if (!snapshot.files.some((f) => /(^|\/)app\/.*page\.[tj]sx$/.test(f.path)))
    throw new Error("No actual App Router page was indexed");
  const concept = snapshot.concepts.find((c) => c.kind === "interface");
  if (!concept) throw new Error("React interface concept missing");
  const lessonResponse = await client.post("/api/lesson", {
    data: {
      projectId: snapshot.id,
      conceptId: concept.id,
      level: "intermediate",
    },
  });
  if (!lessonResponse.ok()) throw new Error("Imported-project lesson failed");
  const lesson = await lessonResponse.json();
  const browser = await chromium.launch({
    channel: process.env.PLAYWRIGHT_CHROMIUM ? "chromium" : "chrome",
  });
  try {
    const context = await browser.newContext({
      storageState: await client.storageState(),
      viewport: { width: 1440, height: 1000 },
    });
    const page = await context.newPage();
    await page.goto(baseURL + "/learn");
    await page.evaluate(
      (id) => localStorage.setItem("synapse-project", id),
      snapshot.id,
    );
    await page.reload();
    await page.getByRole("heading", { name: /nextjs-postgres/ }).waitFor();
    await page.screenshot({
      path: "evidence/next-import-desktop.png",
      fullPage: true,
    });
  } finally {
    await browser.close();
  }
  Object.assign(report, {
    observed: "pass",
    sha: snapshot.sha,
    files: snapshot.files.length,
    coverage: snapshot.coverage,
    concepts: snapshot.concepts.map((c) => c.id),
    edges: snapshot.edges.length,
    validCitations: citations.length,
    checkpoints,
    lessonMode: lesson.mode,
    lessonSteps: lesson.board.steps.length,
    ms: Math.round(performance.now() - start),
  });
} catch (error) {
  Object.assign(report, {
    observed: "failed",
    error: (error as Error).message,
  });
  process.exitCode = 1;
} finally {
  await client.dispose();
  await writeFile(
    "evidence/next-import-results.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
}
