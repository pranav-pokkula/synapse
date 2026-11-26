import { chromium, request } from "@playwright/test";
import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const baseURL = process.env.TEST_BASE_URL!;
if (
  !baseURL ||
  !new URL(baseURL).hostname.startsWith("synapse-learning-") ||
  !new URL(baseURL).hostname.endsWith(".vercel.app")
)
  throw new Error("Exact SYNAPSE preview URL required");
const token = process.env.VERCEL_OIDC_TOKEN;
if (!token) throw new Error("Short-lived Vercel OIDC authentication required");
const origin = new URL(baseURL).origin;
const headers = { Origin: origin, "x-vercel-trusted-oidc-idp-token": token };
const a = await request.newContext({
  baseURL,
  extraHTTPHeaders: headers,
  timeout: 65000,
});
const b = await request.newContext({
  baseURL,
  extraHTTPHeaders: headers,
  timeout: 65000,
});
const checks: { name: string; passed: boolean }[] = [];
const report: Record<string, unknown> = {
  recordedAt: new Date().toISOString(),
  baseURL,
  checks,
  complete: false,
};
function check(name: string, passed: boolean) {
  checks.push({ name, passed });
  console.log(`${name}: ${passed ? "PASS" : "FAIL"}`);
  if (!passed) throw new Error(name);
}
try {
  const protectedResponse = await fetch(baseURL, {
    redirect: "manual",
    signal: AbortSignal.timeout(15000),
  });
  check(
    "Unauthenticated preview is protected",
    protectedResponse.status === 401 ||
      protectedResponse.status === 403 ||
      protectedResponse.status === 307,
  );
  const sr = await a.get("/api/session");
  const session = await sr.json();
  check(
    "Preview creates hosted authenticated session",
    sr.ok() && session.storage === "cloud" && session.ai === true,
  );
  check(
    "Preview session is private and uncached",
    /no-store/.test(sr.headers()["cache-control"] ?? ""),
  );
  const other = await b.get("/api/session");
  check("Second preview session starts independently", other.ok());
  const progress = await a.post("/api/progress", {
    data: { projectId: "sample", level: "advanced", visited: ["modules"] },
  });
  check("Preview saves progress", progress.ok());
  const reload = await (await a.get("/api/progress?projectId=sample")).json();
  check("Preview reload preserves saved level", reload.level === "advanced");
  const isolated = await (await b.get("/api/progress?projectId=sample")).json();
  check(
    "Other preview session cannot see progress",
    isolated.level === "beginner" && isolated.visited.length === 0,
  );
  const csrf = await a.post("/api/tutor", {
    headers: { Origin: "https://evil.example" },
    data: {},
  });
  check("Cross-origin mutation is denied", csrf.status() === 403);
  const lr = await a.post("/api/lesson", {
    data: { projectId: "sample", conceptId: "modules", level: "beginner" },
  });
  const lesson = await lr.json();
  report.lesson = lesson;
  check(
    "Preview generates a real Prune lesson",
    lr.ok() && lesson.mode === "live-model",
  );
  check(
    "Generated narration distinguishes each step",
    new Set(lesson.board.steps.map((s: { caption: string }) => s.caption))
      .size === lesson.board.steps.length,
  );
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    const context = await browser.newContext({
      storageState: await a.storageState(),
      viewport: { width: 1440, height: 1000 },
    });
    // Scope short-lived protection credentials to this exact deployment origin.
    await context.route("**/*", (route) =>
      route.continue({
        headers: {
          ...route.request().headers(),
          ...(new URL(route.request().url()).origin === origin
            ? { "x-vercel-trusted-oidc-idp-token": token }
            : {}),
        },
      }),
    );
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(baseURL + "/learn");
    await page
      .getByRole("button", { name: "Start learning", exact: true })
      .click();
    await page.getByLabel("Explanation depth").selectOption("beginner");
    const pending = page.waitForResponse(
      (r) => r.url().endsWith("/api/lesson"),
      { timeout: 65000 },
    );
    await page.getByRole("button", { name: "Personalize with AI" }).click();
    const cached = await (await pending).json();
    check(
      "Browser loads persisted personalized lesson",
      cached.cached === true,
    );
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
    await page.screenshot({
      path: "evidence/preview-desktop.png",
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    check(
      "Personalized mobile lesson has no page overflow",
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.screenshot({
      path: "evidence/preview-mobile.png",
      fullPage: true,
    });
    check("Preview browser has no runtime errors", errors.length === 0);
  } finally {
    await browser.close();
  }
  const tr = await a.post("/api/tutor", {
    data: {
      projectId: "sample",
      conceptId: "modules",
      question:
        "Where is the note body validated? Explain the observed length limits and what this does not establish.",
      level: "beginner",
    },
  });
  const tutor = await tr.json();
  report.tutor = tutor;
  check(
    "Preview tutor returns validated live answer",
    tr.ok() && tutor.mode === "live-model",
  );
  const deleted = await a.post("/api/account", {
    data: { action: "delete-data" },
  });
  const after = await (await a.get("/api/progress?projectId=sample")).json();
  check(
    "Preview learner-data deletion persists",
    deleted.ok() && after.visited.length === 0 && after.level === "beginner",
  );
  await a.post("/api/account", { data: { action: "sign-out" } });
  const denied = await a.post("/api/lesson", {
    data: { projectId: "sample", conceptId: "modules", level: "beginner" },
  });
  check(
    "Signed-out AI request cannot create an implicit session",
    denied.status() === 401,
  );
  report.complete = true;
} catch (error) {
  report.error = (error as Error).message;
  process.exitCode = 1;
} finally {
  await a.dispose();
  await b.dispose();
  await writeFile(
    "evidence/preview-results.json",
    JSON.stringify(report, null, 2),
  );
}
