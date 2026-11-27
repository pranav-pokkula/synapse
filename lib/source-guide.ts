import { makeLesson } from "./learning";
import type { Citation, Concept, Level, Snapshot, TutorAnswer } from "./types";

// Shared deterministic guide: no model, network, or server storage.
export function sourceGuide(
  snapshot: Snapshot,
  concept: Concept,
  question: string,
  level: Level,
  citations: Citation[] = concept.evidence,
): TutorAnswer {
  const lesson = makeLesson(snapshot, concept, level);
  const intent = question.toLowerCase();
  const known =
    /explain|five|simple|analogy|real life|where|code|source|fail|why|test|understand|trade.?off/.test(
      intent,
    );
  const answer = !known
    ? "The source guide cannot answer that question reliably. Live AI is not configured. You can inspect the cited source or ask for an explanation, analogy, source location, or failure considerations."
    : /analogy|real life|five/.test(intent)
      ? lesson.analogy
      : /fail|trade.?off/.test(intent)
        ? lesson.tradeoffs.join(" ")
        : /where|source|code/.test(intent)
          ? `Start with ${citations[0]?.path}. The excerpt below is pinned to the indexed snapshot.`
          : /why/.test(intent)
            ? concept.why
            : /test/.test(intent)
              ? `Try this: ${concept.objective} Then identify one thing the excerpt cannot prove.`
              : lesson.summary;
  return {
    answer,
    claims: known
      ? [
          {
            text: answer,
            kind: /where|source|code/.test(intent) ? "verified" : "general",
            citations: /where|source|code/.test(intent)
              ? citations.slice(0, 1)
              : [],
          },
        ]
      : [
          {
            text: "There is insufficient evidence for a reliable answer.",
            kind: "unknown",
            citations: [],
          },
        ],
    insufficientEvidence: !known,
    mode: "source-template",
  };
}
