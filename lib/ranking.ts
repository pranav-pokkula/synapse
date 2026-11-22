import type { Concept } from "./types";
export function rankConcepts(
  concepts: Concept[],
  gaps: Record<string, number> = {},
) {
  const remaining = [...concepts],
    ordered: Concept[] = [];
  while (remaining.length) {
    const ready = remaining.filter((c) =>
      c.prerequisites.every((p) => !remaining.some((r) => r.id === p)),
    );
    const choices = ready.length ? ready : remaining;
    choices.sort(
      (a, b) =>
        b.importance +
          (gaps[b.id] ?? 0) * 20 -
          b.difficulty * 2 -
          (a.importance + (gaps[a.id] ?? 0) * 20 - a.difficulty * 2) ||
        a.id.localeCompare(b.id),
    );
    const c = choices[0];
    ordered.push(c);
    remaining.splice(remaining.indexOf(c), 1);
  }
  return ordered;
}
