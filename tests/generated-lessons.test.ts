import { describe, it, expect } from "vitest";
import { validateGeneratedLesson, learnerContext } from "@/lib/lesson-provider";
import { makeLesson, emptyProgress } from "@/lib/learning";
import { sampleSnapshot } from "@/lib/sample";
const snapshot = sampleSnapshot(),
  concept = snapshot.concepts.find((c) => c.id === "requests")!;
function valid() {
  const lesson = makeLesson(snapshot, concept, "beginner");
  return {
    summary: lesson.summary,
    analogy: lesson.analogy,
    claims: [
      {
        text: "The indexed code contains a request handler.",
        kind: "verified",
        citations: [concept.evidence[0]],
      },
    ],
    tradeoffs: lesson.tradeoffs,
    board: lesson.board,
  };
}
describe("safe generated lesson contract", () => {
  it("shares the exact storyboard captions with the narration renderer", () => {
    const input = valid();
    const result = validateGeneratedLesson(
      input,
      snapshot,
      concept,
      "beginner",
    );
    expect(result.board).toEqual(input.board);
    expect(result.citations).toEqual(concept.evidence.slice(0, 1));
    expect(result.mode).toBe("live-model");
  });
  it("rejects a fabricated source reference", () => {
    const input = valid();
    input.claims[0].citations[0] = {
      ...input.claims[0].citations[0],
      path: "fabricated.ts",
    };
    expect(() =>
      validateGeneratedLesson(input, snapshot, concept, "beginner"),
    ).toThrow(/citation/);
  });
  it("rejects diagrams outside the renderer geometry", () => {
    const input = valid();
    input.board.nodes.push({ id: "extra", label: "Extra", kind: "output" });
    expect(() =>
      validateGeneratedLesson(input, snapshot, concept, "beginner"),
    ).toThrow(/layout/);
  });
  it("rejects arrows the renderer cannot represent", () => {
    const input = valid();
    input.board.steps[0].from = "output";
    input.board.steps[0].to = "input";
    expect(() =>
      validateGeneratedLesson(input, snapshot, concept, "beginner"),
    ).toThrow(/movement/);
  });
  it("rejects nonexistent scene citation indexes", () => {
    const input = valid();
    input.board.steps[0].citationIndex = 99;
    expect(() =>
      validateGeneratedLesson(input, snapshot, concept, "beginner"),
    ).toThrow(/missing evidence/);
  });
  it("rejects repeated narration across different animation steps", () => {
    const input = valid();
    input.board.steps[1].caption = input.board.steps[0].caption;
    expect(() =>
      validateGeneratedLesson(input, snapshot, concept, "beginner"),
    ).toThrow(/repeated/);
  });
  it("rejects executable fields instead of evaluating them", () => {
    expect(() =>
      validateGeneratedLesson(
        { ...valid(), script: "alert(1)" },
        snapshot,
        concept,
        "beginner",
      ),
    ).toThrow(/format/);
  });
  it("adapts the prompt context to prerequisite and recent assessment history", () => {
    const p = emptyProgress();
    p.attempts.push({
      id: "one",
      questionId: "requests-foundation",
      conceptId: "requests",
      correct: false,
      score: 0,
      kind: "choice",
      at: new Date().toISOString(),
    });
    const context = learnerContext(p, concept);
    expect(context.prerequisites).toEqual(concept.prerequisites);
    expect(context.recentChecks[0].correct).toBe(false);
    expect(context.estimatedMastery).toBe(0);
  });
});
