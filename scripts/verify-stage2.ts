import { chromium, request } from "@playwright/test";
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
  checks: [],
  lessons: [],
};
const checks = report.checks as { name: string; passed: boolean }[];
function check(name: string, passed: boolean) {
  checks.push({ name, passed });
  console.log(`${name}: ${passed ? "PASS" : "FAIL"}`);
  if (!passed) throw new Error(name);
}
async function post(path: string, data: unknown) {
  const r = await client.post(path, { data });
  const body = await r.json();
  if (!r.ok()) throw new Error(`${path}: ${r.status()} ${body.code ?? ""}`);
  return body;
}
try {
  const sr = await client.get("/api/session");
  const session = await sr.json();
  check(
    "App creates a real hosted guest session",
    sr.ok() && session.storage === "cloud",
  );
  check(
    "Session response cannot be cached",
    /no-store/.test(sr.headers()["cache-control"] ?? ""),
  );
  const source = (await (
    await client.get("/api/project/sample")
  ).json()) as Snapshot;
  for (const level of ["beginner", "intermediate", "advanced"]) {
    const lesson = await post("/api/lesson", {
      projectId: "sample",
      conceptId: "modules",
      level,
    });
    (report.lessons as unknown[]).push(lesson);
    check(`Real generated ${level} lesson`, lesson.mode === "live-model");
    check(
      `${level} exact citations`,
      lesson.citations.length > 0 &&
        lesson.citations.every((c: Parameters<typeof validCitation>[0]) =>
          validCitation(c, source),
        ),
    );
  }
  const cached = await post("/api/lesson", {
    projectId: "sample",
    conceptId: "modules",
    level: "beginner",
  });
  check("Generated lesson reloads from hosted cache", cached.cached === true);
  const tutor = await post("/api/tutor", {
    projectId: "sample",
    conceptId: "modules",
    question:
      "Where is the note body validated and what length limits are visible?",
    level: "beginner",
  });
  report.tutor = tutor;
  check(
    "Tutor uses real Prune-backed Gemini",
    tutor.mode === "live-model" &&
      tutor.telemetry?.prune?.provider === "gemini",
  );
  const denied = await client.post("/api/lesson", {
    headers: { Origin: "https://evil.example" },
    data: { projectId: "sample", conceptId: "modules", level: "beginner" },
  });
  check("Cross-origin AI mutation rejected", denied.status() === 403);
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    const context = await browser.newContext({
      storageState: await client.storageState(),
      viewport: { width: 1440, height: 1000 },
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(baseURL + "/learn");
    await page
      .getByRole("button", { name: "Start learning", exact: true })
      .click();
    await page.getByRole("button", { name: "Personalize with AI" }).click();
    await page
      .getByText(/SAVED AI LESSON/)
      .waitFor({ timeout: 60000 });
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
    check(
      "Generated captions and transcript visible",
      await page.locator(".transcript ol").isVisible(),
    );
    await page.screenshot({
      path: "evidence/stage2-live-lesson.png",
      fullPage: true,
    });
    check(
      "Generated lesson browser has no runtime errors",
      errors.length === 0,
    );
  } finally {
    await browser.close();
  }
  report.complete = true;
} catch (error) {
  report.complete = false;
  report.error = (error as Error).message;
  process.exitCode = 1;
} finally {
  await mkdir("evidence", { recursive: true });
  await writeFile(
    "evidence/stage2-live-results.json",
    JSON.stringify(report, null, 2),
  );
  await client.dispose();
}
