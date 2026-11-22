import { describe, it, expect } from "vitest";
import { parseGitHubUrl } from "@/lib/github";
import {
  isEligible,
  LIMITS,
  indexFile,
  validCitation,
  rankConcepts,
  retrieve,
} from "@/lib/analysis";
import { sampleSnapshot } from "@/lib/sample";
import {
  makeLesson,
  questions,
  scoreChoice,
  mastery,
  emptyProgress,
  scoreShort,
} from "@/lib/learning";
import { storyboardSchema } from "@/lib/types";
import { validateAnswer } from "@/lib/provider";
const snapshot = sampleSnapshot();
describe("public URL boundary", () => {
  it.each([
    "https://github.com/owner/repo",
    "https://github.com/owner/repo.git",
    "https://github.com/owner/repo/",
  ])("accepts %s", (url) =>
    expect(parseGitHubUrl(url)).toEqual({ owner: "owner", repo: "repo" }),
  );
  it.each([
    "http://github.com/a/b",
    "https://github.com.evil.test/a/b",
    "https://github.com@127.0.0.1/a/b",
    "https://127.0.0.1/a/b",
    "file:///etc/passwd",
    "https://github.com/a/b/tree/main",
    "https://github.com/a/b?token=x",
    "https://u:p@github.com/a/b",
    "https://github.com:8443/a/b",
    "https://github.com/a/../b",
    "https://github.com/a/b#fragment",
    "x".repeat(300),
  ])("rejects %s", (url) => expect(() => parseGitHubUrl(url)).toThrow());
});
describe("bounded structural indexing", () => {
  it.each([
    "node_modules/a.ts",
    "dist/index.js",
    ".env",
    "src/.env.ts",
    "key.pem",
    "src/bundle.min.js",
    "package-lock.json",
    "src/../secret.ts",
    "public/image.png",
  ])("filters %s", (path) => expect(isEligible(path, 100)).toBe(false));
  it("rejects oversized and empty sources", () => {
    expect(isEligible("app/page.tsx", LIMITS.fileBytes + 1)).toBe(false);
    expect(isEligible("app/page.tsx", 0)).toBe(false);
    expect(isEligible("app/page.tsx", 100)).toBe(true);
  });
  it("parses imports, re-exports, require and dynamic imports without executing", () => {
    const f = indexFile(
      "src/main.ts",
      `import {x} from './a'; export {y} from './b'; const z=require('./c'); import('./d'); export function main(){}; // import './fake'`,
      snapshot.sha,
    );
    expect(f.imports).toEqual(["./a", "./b", "./c", "./d"]);
    expect(f.exports).toContain("main");
    expect(f.imports).not.toContain("./fake");
  });
  it("discovers actual local relationships and frameworks", () => {
    expect(snapshot.edges).toContainEqual({
      from: "app/api/notes/route.ts",
      to: "lib/validation.ts",
    });
    expect(snapshot.frameworks).toContain("next");
    expect(snapshot.concepts.map((c) => c.id)).toContain("auth");
  });
  it("orders prerequisites before dependents even with large mastery gaps", () => {
    const ranked = rankConcepts(snapshot.concepts, { state: 100 });
    for (const [i, c] of ranked.entries())
      for (const p of c.prerequisites)
        expect(ranked.findIndex((x) => x.id === p)).toBeLessThan(i);
  });
  it("retrieves source for a specific question", () =>
    expect(retrieve(snapshot, "noteSchema validation")[0].path).toBe(
      "lib/validation.ts",
    ));
});
describe("evidence and safe storyboards", () => {
  it("validates every concept citation against source", () => {
    for (const c of snapshot.concepts)
      for (const e of c.evidence) expect(validCitation(e, snapshot)).toBe(true);
  });
  it.each(["wrong-path", "wrong-sha", "wrong-line", "wrong-quote"])(
    "rejects %s",
    (kind) => {
      const c = { ...snapshot.concepts[0].evidence[0] };
      if (kind === "wrong-path") c.path = "missing.ts";
      if (kind === "wrong-sha") c.sha = "0".repeat(40);
      if (kind === "wrong-line") c.end = 100000;
      if (kind === "wrong-quote") c.quote = "invented code";
      expect(validCitation(c, snapshot)).toBe(false);
    },
  );
  it("creates consistent multi-step scenes at each explanation depth", () => {
    for (const c of snapshot.concepts)
      for (const level of ["beginner", "intermediate", "advanced"] as const) {
        const l = makeLesson(snapshot, c, level);
        expect(storyboardSchema.safeParse(l.board).success).toBe(true);
        expect(l.board.steps[0].caption).toContain(l.summary);
        expect(l.board.steps.length).toBeGreaterThan(2);
      }
  });
  it("rejects executable payloads and dangling nodes", () => {
    const l = makeLesson(snapshot, snapshot.concepts[0], "beginner");
    expect(
      storyboardSchema.safeParse({
        ...l.board,
        html: "<script>alert(1)</script>",
      }).success,
    ).toBe(false);
    expect(
      storyboardSchema.safeParse({
        ...l.board,
        steps: [{ ...l.board.steps[0], active: ["missing"] }, l.board.steps[1]],
      }).success,
    ).toBe(false);
  });
  it("rejects duplicate visual node ids", () => {
    const b = makeLesson(snapshot, snapshot.concepts[0], "beginner").board;
    expect(
      storyboardSchema.safeParse({ ...b, nodes: [b.nodes[0], b.nodes[0]] })
        .success,
    ).toBe(false);
  });
  it("rejects fabricated model citations and uncited verified claims", () => {
    expect(() =>
      validateAnswer(
        {
          answer: "claim",
          insufficientEvidence: false,
          claims: [
            { text: "production is secure", kind: "verified", citations: [] },
          ],
        },
        snapshot,
      ),
    ).toThrow();
    expect(() =>
      validateAnswer(
        {
          answer: "claim",
          insufficientEvidence: false,
          claims: [
            {
              text: "claim",
              kind: "verified",
              citations: [
                { ...snapshot.concepts[0].evidence[0], quote: "invented" },
              ],
            },
          ],
        },
        snapshot,
      ),
    ).toThrow();
  });
  it("accepts honest abstention", () =>
    expect(
      validateAnswer(
        {
          answer: "Unknown",
          claims: [
            {
              text: "Deployment cannot be verified",
              kind: "unknown",
              citations: [],
            },
          ],
          insufficientEvidence: true,
        },
        snapshot,
      ).insufficientEvidence,
    ).toBe(true));
});
describe("assessment integrity", () => {
  it("scores known choices deterministically", () => {
    for (const c of snapshot.concepts) {
      const q = questions(c)[0];
      expect(scoreChoice(q, q.answer!)).toBe(1);
      expect(scoreChoice(q, (q.answer! + 1) % 3)).toBe(0);
    }
  });
  it("repeating a question cannot inflate mastery", () => {
    const p = emptyProgress();
    p.attempts = Array.from({ length: 10 }, (_, i) => ({
      id: String(i),
      conceptId: "modules",
      questionId: "same",
      correct: true,
      score: 1,
      at: new Date().toISOString(),
      kind: "choice" as const,
    }));
    expect(mastery(p, "modules")).toBe(50);
    p.attempts.push({ ...p.attempts[0], id: "new", correct: false, score: 0 });
    expect(mastery(p, "modules")).toBe(0);
  });
  it("does not claim keyword checks are correctness grading", () => {
    const result = scoreShort(
      questions(snapshot.concepts[0])[2],
      "The source import cannot prove runtime execution.",
    );
    expect(result.checks.every((c) => c.met)).toBe(true);
    expect(result.note).toContain("not a reliable correctness grade");
  });
});
