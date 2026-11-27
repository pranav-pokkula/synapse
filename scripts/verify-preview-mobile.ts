import { chromium } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
process.loadEnvFile(".env.local");
const base =
  "https://synapse-learning-qr1qac164-pranav-pokkulas-projects.vercel.app";
const browser = await chromium.launch({ channel: "chrome" });
const state = JSON.parse(
  await readFile(".synapse/hosted/browser-state.json", "utf8"),
);
// Reuse only this verifier's own guest identity; do not copy Vercel or user cookies.
state.cookies = state.cookies
  .filter((c: { name: string }) => c.name.startsWith("sb-"))
  .map((c: object) => ({ ...c, domain: new URL(base).hostname, secure: true }));
try {
  const context = await browser.newContext({
    storageState: state,
    viewport: { width: 390, height: 844 },
  });
  await context.route("**/*", (r) =>
    r.continue({
      headers: {
        ...r.request().headers(),
        ...(new URL(r.request().url()).origin === base
          ? {
              "x-vercel-trusted-oidc-idp-token": process.env.VERCEL_OIDC_TOKEN!,
            }
          : {}),
      },
    }),
  );
  const page = await context.newPage();
  await page.goto(base + "/learn");
  const snapshot = JSON.parse(
    await readFile(".synapse/hosted/snapshot.json", "utf8"),
  );
  await page.evaluate(
    (id) => localStorage.setItem("synapse-project", id),
    snapshot.id,
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Start learning", exact: true })
    .click();
  await page.getByLabel("Explanation depth").selectOption("beginner");
  const pending = page.waitForResponse((r) => r.url().endsWith("/api/lesson"), {
    timeout: 65000,
  });
  await page.getByRole("button", { name: "Personalize with AI" }).click();
  const lesson = await (await pending).json();
  if (lesson.mode !== "live-model") throw new Error("AI lesson unavailable");
  await page.waitForFunction(
    () =>
      (document.querySelector(".sidebar")?.getBoundingClientRect().right ??
        1) <= 0,
  );
  const noOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= innerWidth,
  );
  await page.screenshot({
    path: "evidence/preview-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
  await writeFile(
    "evidence/preview-mobile-check.json",
    JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        url: base,
        noOverflow,
        sidebarHidden: true,
        lessonMode: lesson.mode,
        cached: lesson.cached,
        scope:
          "Real preview with the verification account; screenshot taken after responsive sidebar transition settled",
      },
      null,
      2,
    ),
  );
  if (!noOverflow) throw new Error("Mobile overflow");
  console.log("Settled mobile layout: PASS");
} finally {
  await browser.close();
}
