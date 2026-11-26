import { chromium } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import { validCitation } from "../lib/analysis";
import type { Snapshot } from "../lib/types";
const baseURL = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000";
const snapshot = JSON.parse(
  await readFile(".synapse/hosted/snapshot.json", "utf8"),
) as Snapshot;
const browser = await chromium.launch({ channel: "chrome" });
const report: Record<string, unknown> = {
  recordedAt: new Date().toISOString(),
  baseURL,
  repository: `${snapshot.owner}/${snapshot.repo}`,
  sha: snapshot.sha,
  complete: false,
};
try {
  const context = await browser.newContext({
    storageState: ".synapse/hosted/browser-state.json",
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(baseURL + "/learn");
  await page.evaluate(
    (id) => localStorage.setItem("synapse-project", id),
    snapshot.id,
  );
  await page.reload();
  await page.getByRole("heading", { name: /nextjs-postgres/ }).waitFor();
  await page
    .getByRole("button", { name: "Start learning", exact: true })
    .click();
  const pending = page.waitForResponse((r) => r.url().endsWith("/api/lesson"), {
    timeout: 60000,
  });
  await page.getByRole("button", { name: "Personalize with AI" }).click();
  const response = await pending;
  const lesson = await response.json();
  report.lesson = lesson;
  if (!response.ok() || lesson.mode !== "live-model")
    throw new Error(lesson.fallbackReason ?? "Live lesson failed");
  if (
    !lesson.citations.every((c: Parameters<typeof validCitation>[0]) =>
      validCitation(c, snapshot),
    )
  )
    throw new Error("Invalid lesson citation");
  await page
    .getByRole("button", { name: "Play animation", exact: true })
    .click();
  await page.waitForFunction(
    () =>
      document
        .querySelector('[data-testid="animation-stage"]')
        ?.getAttribute("data-step") === "1",
    null,
    { timeout: 15000 },
  );
  await page.getByRole("button", { name: "Pause animation" }).click();
  await page.locator(".transcript summary").click();
  await page.screenshot({
    path: "evidence/stage2-live-lesson.png",
    fullPage: true,
  });
  const r = await context.request.post(baseURL + "/api/tutor", {
    headers: { Origin: new URL(baseURL).origin },
    data: {
      projectId: snapshot.id,
      conceptId: "auth",
      question:
        "Which provider does lib/auth.ts configure, and what does the visible source not establish?",
      level: "beginner",
    },
    timeout: 60000,
  });
  const tutor = await r.json();
  report.tutor = tutor;
  if (!r.ok() || tutor.mode !== "live-model")
    throw new Error(`Tutor rejected: ${tutor.code ?? r.status()}`);
  const cached = await context.request.post(baseURL + "/api/lesson", {
    headers: { Origin: new URL(baseURL).origin },
    data: { projectId: snapshot.id, conceptId: "modules", level: "beginner" },
    timeout: 60000,
  });
  report.cacheReload = (await cached.json()).cached === true;
  report.browserErrors = errors;
  report.complete = errors.length === 0 && report.cacheReload;
  if (!report.complete)
    throw new Error("Browser or persistence validation failed");
} catch (error) {
  report.error = (error as Error).message;
  process.exitCode = 1;
} finally {
  await browser.close();
  await writeFile(
    "evidence/stage2-browser-results.json",
    JSON.stringify(report, null, 2),
  );
  console.log(
    JSON.stringify({
      complete: report.complete,
      error: report.error,
      cacheReload: report.cacheReload,
    }),
  );
}
