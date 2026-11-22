import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("sample: explore, animate, inspect source, tutor, practice, persist", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "You built it. Now understand it." }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Explore the sample", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Let’s make it click." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Start learning", exact: true })
    .click();
  await expect(page.getByTestId("animation-stage")).toHaveAttribute(
    "data-step",
    "0",
  );
  await page
    .getByRole("button", { name: "Play animation", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Pause animation" }),
  ).toBeVisible();
  await expect(page.getByTestId("animation-stage")).toHaveAttribute(
    "data-step",
    "1",
    { timeout: 15000 },
  );
  await page.getByRole("button", { name: "Pause animation" }).click();
  await page.getByRole("button", { name: "Next step", exact: true }).click();
  await expect(page.getByTestId("animation-stage")).toHaveAttribute(
    "data-step",
    "2",
  );
  await page
    .getByRole("button", { name: "Previous step", exact: true })
    .click();
  await expect(page.getByTestId("animation-stage")).toHaveAttribute(
    "data-step",
    "1",
  );
  await page.getByRole("button", { name: "Toggle captions" }).click();
  await expect(
    page.getByRole("button", { name: "Toggle captions" }),
  ).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Toggle narration" }).click();
  await expect(
    page.getByRole("button", { name: "Toggle narration" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.locator(".transcript summary").click();
  await expect(page.locator(".transcript ol")).toBeVisible();
  await page.locator(".source-title").click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".modal .source-code")).toContainText("import");
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Give me a real-life analogy" })
    .click();
  await expect(page.locator(".assistant-message")).toContainText(
    "Source template",
  );
  await page.getByRole("button", { name: "Practice this concept" }).click();
  await page
    .getByText("A dependency between source modules", { exact: true })
    .click();
  await page.getByRole("button", { name: "Check understanding" }).click();
  await expect(
    page.getByRole("heading", { name: "That’s the connection." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Your progress", exact: true })
    .click();
  await expect(page.locator(".progress-metrics")).toContainText("1");
  await page.reload();
  await page
    .getByRole("button", { name: "Your progress", exact: true })
    .click();
  await expect(page.locator(".activity-list")).toContainText(
    "How the pieces connect",
  );
  await page.screenshot({
    path: "evidence/progress-desktop.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("invalid repository error is recoverable and preserves the sample", async ({
  page,
}) => {
  await page.goto("/learn");
  await page
    .getByRole("button", { name: "Connect repository", exact: true })
    .last()
    .click();
  await page
    .getByLabel("Public repository URL")
    .fill("https://github.com.evil.test/owner/repo");
  await page.getByRole("button", { name: "Analyze repository" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "public https://github.com",
  );
  await page.screenshot({ path: "evidence/import-error.png", fullPage: true });
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(
    page.getByRole("heading", { name: "Let’s make it click." }),
  ).toBeVisible();
});
for (const viewport of [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1366, height: 900 },
  { width: 1920, height: 1080 },
])
  test(`responsive ${viewport.width}: overview and lesson have no page overflow`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/learn");
    await expect(
      page.getByRole("heading", { name: "Let’s make it click." }),
    ).toBeVisible();
    await page.screenshot({
      path: `evidence/overview-${viewport.width}.png`,
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("button", { name: "Start learning", exact: true })
      .click();
    await expect(page.getByTestId("animation-stage")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `evidence/lesson-${viewport.width}.png`,
      fullPage: true,
    });
  });
test("keyboard dialog, themes, and accessibility scan", async ({ page }) => {
  await page.goto("/learn");
  await page.getByRole("button", { name: "Use dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Use light theme" }).click();
  await page.getByRole("button", { name: "Account and settings" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});
test("cross-session projects and progress stay isolated", async ({
  browser,
}) => {
  const a = await browser.newContext();
  const b = await browser.newContext();
  const pa = await a.newPage();
  const pb = await b.newPage();
  await pa.goto("/learn");
  await pb.goto("/learn");
  await pa.request.get("/api/session");
  await pb.request.get("/api/session");
  const update = await pa.request.post("/api/progress", {
    data: { projectId: "sample", level: "advanced", visited: ["modules"] },
  });
  expect(update.ok()).toBe(true);
  const other = await pb.request.get("/api/progress?projectId=sample");
  expect((await other.json()).visited).toEqual([]);
  expect((await other.json()).level).toBe("beginner");
  const cross = await pb.request.get(
    "/api/project/00000000-0000-4000-8000-000000000001",
  );
  expect(cross.status()).toBe(404);
  await a.close();
  await b.close();
});
