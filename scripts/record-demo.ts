import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const base = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000";
await mkdir("evidence/demo", { recursive: true });
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHROMIUM ? "chromium" : "chrome",
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  recordVideo: { dir: "evidence/demo", size: { width: 1440, height: 1000 } },
});
const page = await context.newPage();
const start = Date.now();
let complete = false;
const scenes: { title: string; seconds: number }[] = [];
async function caption(title: string, detail: string, seconds: number) {
  console.log(title);
  scenes.push({ title, seconds });
  await page.evaluate(
    ({ title, detail }) => {
      document.getElementById("demo-caption")?.remove();
      const box = document.createElement("div");
      box.id = "demo-caption";
      Object.assign(box.style, {
        position: "fixed",
        bottom: "15px",
        left: "260px",
        right: "25px",
        zIndex: "100",
        background: "#20273fee",
        color: "#fff",
        border: "1px solid #7d87ab",
        borderRadius: "12px",
        padding: "16px 22px",
        boxShadow: "0 8px 30px #0003",
        pointerEvents: "none",
        fontFamily: "system-ui",
      });
      const h = document.createElement("div");
      h.textContent = title;
      Object.assign(h.style, {
        fontSize: "19px",
        fontWeight: "650",
        marginBottom: "5px",
      });
      const p = document.createElement("div");
      p.textContent = detail;
      Object.assign(p.style, { fontSize: "14px", color: "#d7deef" });
      box.append(h, p);
      document.body.append(box);
    },
    { title, detail },
  );
  await page.waitForTimeout(seconds * 1000);
}
try {
  await page.goto(base);
  await caption(
    "You built it. Now understand it.",
    "SYNAPSE turns the code you already have into a source-linked learning journey.",
    12,
  );
  await page
    .getByRole("link", { name: "Connect a repository", exact: true })
    .click();
  await caption(
    "Start with a real public repository",
    "This recording imports live GitHub source. Imported code is read, never executed.",
    8,
  );
  await page
    .getByLabel("Public repository URL")
    .fill("https://github.com/sindresorhus/is-plain-obj");
  await page.getByRole("button", { name: "Analyze repository" }).click();
  await page
    .getByRole("heading", { name: /sindresorhus/ })
    .waitFor({ timeout: 60000 });
  await caption(
    "Pinned to an exact commit",
    "The importer inspects actual implementation files, dependencies, and tests. Coverage and snapshot identity remain visible.",
    12,
  );
  await page.getByRole("button", { name: "Explore map" }).click();
  await page.locator(".arch-node").first().click();
  await caption(
    "Architecture from source relationships",
    "Select a module to highlight resolved imports. This graph does not claim to reveal production infrastructure.",
    12,
  );
  await page.getByRole("button", { name: "View source", exact: true }).click();
  await caption(
    "Every reference has a source trail",
    "Inspect the exact lines and GitHub commit. Matching text verifies the excerpt, not every claim about its behavior.",
    10,
  );
  await page.keyboard.press("Escape");
  await page.getByLabel("Current project").selectOption("sample");
  await page.getByRole("heading", { name: "Let’s make it click." }).waitFor();
  await caption(
    "A clearly labeled teaching fixture",
    "Fieldnotes is an embedded example for the richer request, validation, and access-control journey. It is not a live AI result.",
    10,
  );
  await page
    .getByRole("button", { name: "Learning journey", exact: false })
    .first()
    .click();
  await caption(
    "The foundations first",
    "The path respects prerequisites and prioritizes architectural and security relevance. Practice reveals what to review next.",
    10,
  );
  await page
    .locator(".concept-row")
    .filter({ hasText: "The life of a request" })
    .click();
  await caption(
    "One idea, three ways to learn",
    "The written explanation, animated scene captions, and optional browser narration share the same lesson content.",
    10,
  );
  await page
    .getByRole("button", { name: "Play animation", exact: true })
    .click();
  await caption(
    "A real animation, not a static diagram",
    "Requests move between nodes. Step through the sequence, pause, change speed, or use the accessible transcript.",
    15,
  );
  await page
    .getByRole("button", { name: "Pause animation", exact: true })
    .click()
    .catch(() => {});
  await page.getByLabel("Explanation depth").selectOption("advanced");
  await page.locator(".written-lesson").scrollIntoViewIfNeeded();
  await caption(
    "Adjust the explanation depth",
    "Advanced mode adds engineering trade-offs and explicit limits to what the source can establish.",
    10,
  );
  await page
    .getByRole("button", { name: "Give me a real-life analogy" })
    .click();
  await page.locator(".assistant-message").waitFor();
  await page.locator(".tutor").scrollIntoViewIfNeeded();
  await caption(
    "Helpful without pretending",
    "The guide is visibly in template mode. A configurable live tutor exists, but no model provider has been selected or benchmarked.",
    10,
  );
  await page.getByRole("button", { name: "Practice this concept" }).click();
  await caption(
    "Check understanding against the idea",
    "Deterministic concept checks explain correct and incorrect answers. Source comprehension is a separate check.",
    8,
  );
  await page
    .getByText("Inputs, responses, and failure behavior", { exact: true })
    .click();
  await page.getByRole("button", { name: "Check understanding" }).click();
  await page.getByRole("heading", { name: "That’s the connection." }).waitFor();
  await caption(
    "Feedback, then a next step",
    "Your latest answer counts. Repeating the same question cannot stack mastery points.",
    10,
  );
  await page
    .getByRole("button", { name: "Your progress", exact: true })
    .click();
  await caption(
    "Progress that survives a return",
    "This recording uses isolated local server storage. Hosted Supabase setup is blocked by the account’s free-project limit.",
    10,
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Your progress", exact: true })
    .click();
  await page.locator(".activity-list").waitFor();
  await caption(
    "Built to be inspected",
    "Real imports, source matching, safe failure cases, responsive browser tests, and a reproducible evaluation harness. Cloud auth, live AI, and human review remain pending.",
    12,
  );
  await page.screenshot({ path: "evidence/demo-final.png", fullPage: true });
  complete = true;
} finally {
  await page.close();
  const video = page.video();
  await context.close();
  if (video) await video.saveAs("evidence/synapse-demo.webm");
  await browser.close();
  await writeFile(
    "evidence/demo-recording.json",
    JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        complete,
        durationSeconds: Math.round((Date.now() - start) / 1000),
        audio:
          "Silent screen capture with explanatory captions; no recorded narration",
        source:
          "Actual local application and live public GitHub import; sample fixture explicitly labeled",
        scenes,
      },
      null,
      2,
    ),
  );
}
