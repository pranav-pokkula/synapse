import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";

const baseURL = process.env.PUBLIC_TEST_URL ?? "http://127.0.0.1:3001";
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHROMIUM ? undefined : "chrome",
});
const results: { check: string; passed: boolean }[] = [];
const errors: string[] = [];
async function check(name: string, action: () => Promise<void>) {
  await action();
  results.push({ check: name, passed: true });
  console.log(`PASS ${name}`);
}
try {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  const apiRequests: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.startsWith("/api/"))
      apiRequests.push(request.url());
  });
  await check("signed-out landing and truthful availability", async () => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { name: "You built it. Now understand it." }),
    ).toBeVisible();
    await expect(page.locator(".hero-note")).toContainText(
      "live AI remain protected",
    );
    await expect(
      page.getByRole("link", { name: "View on GitHub" }),
    ).toHaveAttribute("href", "https://github.com/pranav-pokkula/synapse");
  });
  await check("public sample opens without a server session", async () => {
    await page
      .getByRole("link", { name: "Explore the sample", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Let’s make it click." }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Imports · protected workspace" }),
    ).toBeDisabled();
    await expect(
      page.getByText("Browser-only progress", { exact: true }),
    ).toBeVisible();
  });
  await expect(
    page.getByRole("button", { name: "Imports require protected access" }),
  ).toBeDisabled();
  await check("architecture renders", async () => {
    await page
      .getByRole("button", { name: "Architecture", exact: true })
      .click();
    await expect(page.locator(".graph-canvas")).toBeVisible();
    await page.screenshot({
      path: "evidence/public-architecture.png",
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "Project overview", exact: true })
      .click();
  });
  await check("source lesson animation advances", async () => {
    await page
      .getByRole("button", { name: "Start learning", exact: true })
      .click();
    await expect(page.getByTestId("animation-stage")).toHaveAttribute(
      "data-step",
      "0",
    );
    await page.getByRole("button", { name: "Next step", exact: true }).click();
    await expect(page.getByTestId("animation-stage")).toHaveAttribute(
      "data-step",
      "1",
    );
    await expect(
      page.getByRole("button", { name: "Personalize with AI" }),
    ).toHaveCount(0);
  });
  await check("source evidence, transcript and narration control", async () => {
    await page.locator(".source-title").click();
    await expect(page.locator(".modal .source-code")).toContainText("import");
    await page.keyboard.press("Escape");
    await page.locator(".transcript summary").click();
    await expect(page.locator(".transcript ol")).toBeVisible();
    await page.getByRole("button", { name: "Toggle narration" }).click();
    await expect(
      page.getByRole("button", { name: "Toggle narration" }),
    ).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Toggle narration" }).click();
  });
  await check("source guide is visibly a template", async () => {
    await page
      .getByRole("button", { name: "Give me a real-life analogy" })
      .click();
    await expect(page.locator(".assistant-message")).toContainText(
      "Source template",
    );
    await page.screenshot({
      path: "evidence/public-sample-desktop.png",
      fullPage: true,
    });
  });
  await check("practice grades and survives reload", async () => {
    await page.getByRole("button", { name: "Practice this concept" }).click();
    await page
      .getByText("A dependency between source modules", { exact: true })
      .click();
    await page.getByRole("button", { name: "Check understanding" }).click();
    await expect(
      page.getByRole("heading", { name: "That’s the connection." }),
    ).toBeVisible();
    await page.reload();
    await page
      .getByRole("button", { name: "Your progress", exact: true })
      .click();
    await expect(page.locator(".activity-list")).toContainText(
      "How the pieces connect",
    );
  });
  await check("no sample operation calls server APIs", async () => {
    expect(apiRequests).toEqual([]);
  });
  await check("separate browser has no learner history", async () => {
    const other = await browser.newContext({ baseURL });
    const tab = await other.newPage();
    await tab.goto("/learn");
    await expect(
      tab.getByText("Browser-only progress", { exact: true }),
    ).toBeVisible();
    expect(
      await tab.evaluate(
        () =>
          JSON.parse(
            localStorage.getItem("synapse-progress-v1:sample") ?? "null",
          )?.attempts ?? [],
      ),
    ).toEqual([]);
    await other.close();
  });
  await check("public settings do not offer email authentication", async () => {
    await page.getByRole("button", { name: "Account and settings" }).click();
    await expect(
      page.getByRole("button", { name: "Send sign-in link" }),
    ).toHaveCount(0);
    await page.keyboard.press("Escape");
  });
  await check("mobile layout and accessibility", async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/learn");
    await expect(
      page.getByRole("heading", { name: "Let’s make it click." }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.screenshot({
      path: "evidence/public-sample-mobile.png",
      fullPage: true,
    });
  });
  for (const route of [
    "/api/session",
    "/api/project/sample",
    "/api/progress?projectId=sample",
    "/auth/callback?code=fake",
  ]) {
    await check(`server GET denied: ${route.split("?")[0]}`, async () => {
      const response = await context.request.get(route);
      expect(response.status()).toBe(403);
      expect(await response.json()).toHaveProperty(
        "code",
        "PUBLIC_SAMPLE_ONLY",
      );
    });
  }
  for (const route of [
    "/api/tutor",
    "/api/lesson",
    "/api/import",
    "/api/account",
    "/api/assessment",
    "/api/progress",
  ]) {
    await check(`server POST denied: ${route}`, async () => {
      const response = await context.request.post(route, { data: {} });
      expect(response.status()).toBe(403);
      expect(await response.json()).toHaveProperty(
        "code",
        "PUBLIC_SAMPLE_ONLY",
      );
    });
  }
  await check("no browser runtime errors", async () => {
    expect(errors).toEqual([]);
  });
} finally {
  await browser.close();
  await writeFile(
    process.env.PUBLIC_REPORT_PATH ?? "evidence/public-verification.json",
    JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        baseURL,
        checks: results,
        errors,
        scope:
          "Unauthenticated sample/browser and API-denial checks. Narration control tested; no automated claim of audible speech.",
      },
      null,
      2,
    ),
  );
}
