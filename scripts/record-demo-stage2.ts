import { chromium } from "@playwright/test";
import { mkdir, writeFile, readFile } from "node:fs/promises";
const base = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000";
await mkdir("evidence/demo", { recursive: true });
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHROMIUM ? "chromium" : "chrome",
});
const snapshot = JSON.parse(
  await readFile(".synapse/hosted/snapshot.json", "utf8"),
);
const context = await browser.newContext({
  storageState: ".synapse/hosted/browser-state.json",
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
    "SYNAPSE connects repository evidence, explanation, animation and practice.",
    10,
  );
  await page.goto(base + "/learn");
  await page.evaluate(
    (id) => localStorage.setItem("synapse-project", id),
    snapshot.id,
  );
  await page.reload();
  await page.getByRole("heading", { name: /nextjs-postgres/ }).waitFor();
  await caption(
    "A real repository, saved in the cloud",
    "This previously imported Next.js dashboard contains 37 indexed files at a pinned GitHub commit. It is not an invented teaching example.",
    12,
  );
  await page.getByRole("button", { name: "Explore map" }).click();
  await page.locator(".arch-node").first().click();
  await caption(
    "Understand the static relationships",
    "The graph shows source imports. Imported code is never installed or executed.",
    10,
  );
  await page.getByRole("button", { name: "View source", exact: true }).click();
  await caption(
    "Inspect the evidence",
    "Every reference includes exact lines and a source snapshot. Text matching does not prove every interpretation is correct.",
    10,
  );
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Project overview", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Start learning", exact: true })
    .click();
  await page.getByLabel("Explanation depth").selectOption("beginner");
  await page.getByRole("button", { name: "Personalize with AI" }).click();
  await page.getByText(/SAVED AI LESSON/).waitFor({ timeout: 60000 });
  await caption(
    "Real Gemini teaching through Prune",
    "This saved AI lesson was generated from this repository, selected depth and learner context. Its source citations passed validation.",
    12,
  );
  await page
    .getByRole("button", { name: "Play animation", exact: true })
    .click();
  await caption(
    "Step through the concept",
    "Generated captions describe each stage. A constrained renderer draws the scene; the model cannot execute code.",
    14,
  );
  await page
    .getByRole("button", { name: "Pause animation", exact: true })
    .click()
    .catch(() => {});
  await page.locator(".transcript summary").click();
  await caption(
    "Read, watch, or listen",
    "The visible captions and optional browser narration use the same text. This screen recording itself has no audio track.",
    10,
  );
  await page.locator(".written-lesson").scrollIntoViewIfNeeded();
  await caption(
    "Claims stay beside their source trail",
    "The lesson distinguishes source observations from inference and general teaching. Independent human accuracy review is still pending.",
    12,
  );
  await page
    .getByRole("button", { name: "Learning journey", exact: false })
    .first()
    .click();
  await page
    .locator(".concept-row")
    .filter({
      hasText: snapshot.concepts.find((c: { id: string }) => c.id === "auth")
        .title,
    })
    .click();
  await page
    .getByPlaceholder("Make a connection…")
    .fill(
      "Which provider does lib/auth.ts configure, and what does the visible source not establish?",
    );
  await page.getByRole("button", { name: "Send question" }).click();
  await page.locator(".assistant-message").waitFor({ timeout: 60000 });
  await page.locator(".tutor").scrollIntoViewIfNeeded();
  await caption(
    "A contextual tutor with limits",
    "The live-model answer uses actual auth source. Saved responses are labeled, and invented citations are rejected rather than shown as evidence.",
    14,
  );
  await page
    .getByRole("button", { name: "Learning journey", exact: false })
    .first()
    .click();
  await page
    .locator(".concept-row")
    .filter({
      hasText: snapshot.concepts.find((c: { id: string }) => c.id === "modules")
        .title,
    })
    .click();
  await page.getByRole("button", { name: "Practice this concept" }).click();
  await page
    .getByText("A dependency between source modules", { exact: true })
    .click();
  const graded = page.waitForResponse((r) =>
    r.url().endsWith("/api/assessment"),
  );
  await page.getByRole("button", { name: "Check understanding" }).click();
  const gradeResponse = await graded;
  if (gradeResponse.status() === 409) {
    await caption(
      "A safe pause during a concurrent save",
      "A progress checkpoint was still running. The app asks us to retry after it finishes; earlier work remains intact.",
      5,
    );
    await page.getByRole("button", { name: "Check understanding" }).click();
  }
  await page.getByRole("heading", { name: "That’s the connection." }).waitFor();
  await caption(
    "Check understanding, then choose what to revisit",
    "Scored checks use deterministic answers. Repeating one question cannot stack mastery points; open explanations remain ungraded practice.",
    12,
  );
  await page
    .getByRole("button", { name: "Your progress", exact: true })
    .click();
  await caption(
    "Progress persisted with Supabase",
    "Two-account hosted tests verified isolation, refresh, deletion and concurrent-write protection.",
    10,
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Your progress", exact: true })
    .click();
  await page.locator(".activity-list").waitFor();
  await caption(
    "Built to be inspected",
    "Real model outputs, Prune receipts and baseline failures are recorded. Access is protected; human scoring and final submission approval remain pending.",
    14,
  );
  await page.screenshot({
    path: "evidence/stage2-demo-final.png",
    fullPage: true,
  });
  complete = true;
} finally {
  await writeFile(
    ".synapse/hosted/browser-state.json",
    JSON.stringify(await context.storageState()),
    { mode: 0o600 },
  );
  await page.close();
  const video = page.video();
  await context.close();
  if (video) await video.saveAs("evidence/synapse-stage2-demo.webm");
  await browser.close();
  await writeFile(
    "evidence/stage2-demo-recording.json",
    JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        complete,
        durationSeconds: Math.round((Date.now() - start) / 1000),
        audio:
          "Silent actual screen recording with captions; no captured narration",
        source:
          "Actual local production build with real Prune-generated saved lessons and hosted Supabase records; imported repository was previously indexed",
        scenes,
      },
      null,
      2,
    ),
  );
}
