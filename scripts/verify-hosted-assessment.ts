import { request } from "@playwright/test";
import { writeFile } from "node:fs/promises";
process.loadEnvFile(".env.local");
const baseURL =
  "https://synapse-learning-qr1qac164-pranav-pokkulas-projects.vercel.app";
const client = await request.newContext({
  baseURL,
  extraHTTPHeaders: {
    Origin: baseURL,
    "x-vercel-trusted-oidc-idp-token": process.env.VERCEL_OIDC_TOKEN!,
  },
  timeout: 30000,
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
const answer = {
  projectId: "sample",
  conceptId: "modules",
  questionId: "modules-foundation",
  answer: 1,
};
try {
  const sessionResponse = await client.get("/api/session");
  const session = sessionResponse
    .headers()
    ["content-type"]?.includes("application/json")
    ? await sessionResponse.json()
    : null;
  check(
    "Hosted assessment identity created",
    sessionResponse.ok() && session?.storage === "cloud",
  );
  const concurrent = await Promise.all([
    client.post("/api/progress", {
      data: { projectId: "sample", level: "beginner", visited: ["modules"] },
    }),
    client.post("/api/assessment", { data: answer }),
  ]);
  report.concurrentStatuses = concurrent.map((r) => r.status());
  check(
    "Concurrent progress and grading stay bounded",
    concurrent.every((r) => [200, 409].includes(r.status())) &&
      concurrent.some((r) => r.status() === 200),
  );
  // Responses are complete, so the winning writer has released its lease.
  const retry = await client.post("/api/assessment", { data: answer });
  const graded = await retry.json();
  check(
    "Grading succeeds after the conflicting write finishes",
    retry.ok() && graded.correct === true && graded.mastery === 50,
  );
  const repeat = await (
    await client.post("/api/assessment", { data: answer })
  ).json();
  check(
    "Repeated correct answer does not inflate mastery",
    repeat.mastery === 50,
  );
  const saved = await (
    await client.get("/api/progress?projectId=sample")
  ).json();
  check(
    "Hosted graded attempts survive reload",
    saved.attempts.length >= 2 && saved.attempts.at(-1).correct === true,
  );
  const deleted = await client.post("/api/account", {
    data: { action: "delete-data" },
  });
  check("Assessment verification records can be deleted", deleted.ok());
  report.complete = true;
} catch (error) {
  report.error = (error as Error).message;
  process.exitCode = 1;
} finally {
  await client.dispose();
  await writeFile(
    "evidence/preview-assessment-results.json",
    JSON.stringify(report, null, 2),
  );
}
