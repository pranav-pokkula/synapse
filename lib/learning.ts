import {
  storyboardSchema,
  type Concept,
  type Lesson,
  type Level,
  type Progress,
  type Snapshot,
} from "./types";

const teaching: Record<
  string,
  {
    simple: string;
    technical: string;
    advanced: string;
    analogy: string;
    steps: string[];
    labels: string[];
    tradeoff: string;
  }
> = {
  modules: {
    simple:
      "A project is a team of small pieces. An import lets one piece use something another piece provides.",
    technical:
      "Modules expose explicit exports and consume imports. Following those references reveals compile-time dependencies, not necessarily runtime call order.",
    advanced:
      "Import graphs expose coupling and potential change impact. Dynamic resolution, dependency injection, aliases, and runtime dispatch can make a static graph incomplete.",
    analogy:
      "Think of a workshop: each workbench has a specialty. Importing a tool is asking another workbench for its capability.",
    steps: [
      "Find the importing module.",
      "Resolve the module path.",
      "Use an exported capability.",
      "Return to the caller with the result.",
    ],
    labels: ["Caller", "Dependency", "Result"],
    tradeoff:
      "More boundaries can improve reuse but also add indirection. An import alone does not establish that a particular function runs.",
  },
  interface: {
    simple:
      "A component describes a small part of the screen. It uses data to decide what to show.",
    technical:
      "React components return a render description. Props carry inputs; events and state changes can trigger a new render.",
    advanced:
      "Rendering should remain pure. Effects synchronize with external systems; server and client boundaries determine which APIs and data are available.",
    analogy:
      "A component is a reusable recipe card: the same recipe can make different dishes when the ingredients change.",
    steps: [
      "Receive the component inputs.",
      "Build the view from those inputs.",
      "Display the resulting interface.",
      "Handle the next interaction.",
    ],
    labels: ["Inputs", "Component", "View"],
    tradeoff:
      "A component existing in source does not prove its accessibility or runtime performance. Those need direct tests.",
  },
  requests: {
    simple:
      "A request is a message asking a program for something. A handler reads the message and sends a response.",
    technical:
      "An HTTP boundary separates a caller from a handler. Inputs, status codes, response bodies, and failure paths form the observable contract.",
    advanced:
      "Treat input, identity, timeout, idempotency, and error disclosure as separate concerns. A handler signature cannot prove production infrastructure or authorization.",
    analogy:
      "Like ordering at a café: you make a request, the counter checks it, and you receive either your order or an explanation of what went wrong.",
    steps: [
      "The caller prepares a request.",
      "The handler receives the input.",
      "Work produces a response.",
      "If work fails, the caller needs a clear error.",
    ],
    labels: ["Caller", "Handler", "Response"],
    tradeoff:
      "This is a conceptual request model. Source citations establish the indexed request code; they do not establish a deployment topology.",
  },
  validation: {
    simple:
      "Validation checks whether information has the shape a program expects before it uses it.",
    technical:
      "A schema or parsing boundary transforms unknown input into validated data, or returns an explicit validation failure.",
    advanced:
      "Syntax and shape validation do not establish authorization, business invariants, or safe downstream semantics. Keep parsing bounded and errors non-sensitive.",
    analogy:
      "A ticket checker verifies the ticket format before admitting it to the next step. A valid-looking ticket still needs the right permissions.",
    steps: [
      "Receive untrusted input.",
      "Check its expected shape.",
      "Pass accepted data onward.",
      "Reject a malformed input.",
    ],
    labels: ["Input", "Validator", "Accepted data"],
    tradeoff:
      "Successful parsing is evidence about input shape, not proof that the input is authorized or safe in every context.",
  },
  auth: {
    simple:
      "Authentication asks who you are. Authorization asks what you may do.",
    technical:
      "Identity checks validate the current user or session. Ownership and permission checks separately constrain access to a resource.",
    advanced:
      "Enforce authorization at each data boundary. Session freshness, tenant ownership, token expiry, and row-level policies need independent verification.",
    analogy:
      "A building badge identifies you, while the permissions on each door determine where you can go.",
    steps: [
      "Present an identity or session.",
      "Check the identity at a trust boundary.",
      "Apply permission rules to the resource.",
      "Deny access when a required check fails.",
    ],
    labels: ["Identity", "Access check", "Resource"],
    tradeoff:
      "The source pattern establishes identity-related code. It does not, by itself, prove complete authorization or effective RLS.",
  },
  data: {
    simple:
      "Data access lets an application read or save information beyond one screen.",
    technical:
      "A query boundary connects application logic to a data store. Query parameters, result shapes, ownership checks, and errors define the contract.",
    advanced:
      "Transactions, isolation, indexing, pagination, and authorization affect correctness. Source queries alone do not establish deployed schema or production durability.",
    analogy:
      "A library catalog helps you request a specific book. The catalog, the shelves, and the lending rules each have different responsibilities.",
    steps: [
      "Prepare a bounded data operation.",
      "Send the operation to the data boundary.",
      "Read the result back into the application.",
      "Handle missing data or a failed operation.",
    ],
    labels: ["Application", "Data access", "Result"],
    tradeoff:
      "A database client import or query does not prove that the remote database is configured or reachable.",
  },
  state: {
    simple:
      "State is information a screen remembers. Updating it helps the screen reflect what just happened.",
    technical:
      "A state transition changes a value, causing dependent UI to render again. Derived state should stay consistent with its source.",
    advanced:
      "Avoid stale closures and duplicated sources of truth. Async updates need ordering, cancellation, and explicit loading or error states.",
    analogy:
      "A scoreboard remembers the score. Each valid play updates it, and the display reflects the new total.",
    steps: [
      "Read the current state.",
      "Receive an event or update.",
      "Compute the next state.",
      "Render the new view.",
    ],
    labels: ["Current state", "Update", "New view"],
    tradeoff:
      "Browser state is not automatically durable. Persistence and synchronization must be implemented separately.",
  },
  tests: {
    simple: "A test checks an example against a result you expect.",
    technical:
      "A test arranges inputs, exercises a behavior, and asserts an outcome. Focused assertions explain what contract should remain stable.",
    advanced:
      "Distinguish deterministic unit evidence from integration and system evidence. Mocks test assumptions; deployed verification tests actual service boundaries.",
    analogy:
      "A smoke alarm test checks a specific circuit. Passing that check does not prove the whole building is safe.",
    steps: [
      "Arrange a known input.",
      "Exercise the behavior.",
      "Compare actual and expected results.",
      "Investigate a failing assertion.",
    ],
    labels: ["Input", "Behavior", "Assertion"],
    tradeoff:
      "Indexed tests are not executed. Their presence must never be reported as passing test results.",
  },
};
export function makeLesson(
  snapshot: Snapshot,
  concept: Concept,
  level: Level,
): Lesson {
  const t = teaching[concept.kind] ?? teaching.modules;
  const summary =
    level === "beginner"
      ? t.simple
      : level === "intermediate"
        ? t.technical
        : t.advanced;
  const ids = ["input", "process", "output"];
  const captions = [
    `${t.steps[0]} ${summary}`,
    t.steps[1],
    t.steps[2],
    t.steps[3],
  ];
  const board = storyboardSchema.parse({
    nodes: t.labels.map((label, i) => ({
      id: ids[i],
      label,
      kind: ["client", "server", "output"][i],
    })),
    steps: captions.map((caption, i) => ({
      id: `step-${i}`,
      title: t.steps[i],
      caption,
      active:
        i === 0
          ? ["input"]
          : i === 1
            ? ["input", "process"]
            : i === 2
              ? ["process", "output"]
              : ["process"],
      from: i === 1 ? "input" : i === 2 ? "process" : undefined,
      to: i === 1 ? "process" : i === 2 ? "output" : undefined,
      state:
        i === 3 &&
        ["requests", "validation", "auth", "data", "tests"].includes(
          concept.kind,
        )
          ? "failure"
          : i === 2
            ? "success"
            : "working",
      citationIndex: i === 1 ? 0 : undefined,
    })),
  });
  return {
    conceptId: concept.id,
    level,
    title: concept.title,
    summary,
    analogy: t.analogy,
    details: [
      concept.objective,
      `Source observation: ${concept.evidence[0]?.path ?? "indexed source"} contains the code excerpt shown below. The highlighted excerpt is the evidence for this lesson's connection to your project.`,
      level === "beginner" ? t.simple : t.technical,
    ],
    tradeoffs: [t.tradeoff, ...(level === "advanced" ? [t.advanced] : [])],
    citations: concept.evidence,
    board,
    mode: snapshot.sample ? "reviewed-sample" : "source-template",
  };
}
export type Question = {
  id: string;
  conceptId: string;
  kind: "choice" | "short";
  prompt: string;
  options?: string[];
  answer?: number;
  explanation: string;
  rubric?: { phrase: string; alternatives: string[] }[];
};
export function questions(concept: Concept): Question[] {
  const pairs: Record<string, [string, string, string, string]> = {
    modules: [
      "What can an import relationship establish?",
      "A dependency between source modules",
      "The exact order of every runtime call",
      "The production deployment topology",
    ],
    requests: [
      "What should you check at an HTTP boundary?",
      "Inputs, responses, and failure behavior",
      "Only the visual design of the caller",
      "Only whether the README mentions an API",
    ],
    validation: [
      "What does successful shape validation establish?",
      "The input matches the expected schema",
      "The caller owns every requested resource",
      "Every downstream operation will succeed",
    ],
    auth: [
      "How does authorization differ from authentication?",
      "It decides what an identified caller may access",
      "It only confirms who the caller is",
      "It makes all signed-in users administrators",
    ],
    data: [
      "What does a query in source prove?",
      "The indexed code contains that data operation",
      "The production database is reachable",
      "All stored data is correctly isolated",
    ],
    interface: [
      "What is the role of a component?",
      "Describe a view from its inputs and state",
      "Guarantee database persistence",
      "Automatically authorize each request",
    ],
    state: [
      "What happens when relevant React state changes?",
      "The dependent view can render again",
      "The value is automatically saved to a database",
      "All network requests become synchronous",
    ],
    tests: [
      "What can you conclude from indexed test source?",
      "The project defines checks for those behaviors",
      "All tests passed in production",
      "Every possible failure is covered",
    ],
  };
  const p = pairs[concept.kind] ?? pairs.modules;
  // Rotate the correct choice reproducibly so position cannot be used as a shortcut.
  const offset =
    concept.id.split("").reduce((n, c) => n + c.charCodeAt(0), 0) % 3;
  const options = [p[1], p[2], p[3]];
  const rotated = [...options.slice(offset), ...options.slice(0, offset)];
  return [
    {
      id: `${concept.id}-foundation`,
      conceptId: concept.id,
      kind: "choice",
      prompt: p[0],
      options: rotated,
      answer: rotated.indexOf(p[1]),
      explanation: `${p[1]}. ${teaching[concept.kind]?.tradeoff ?? teaching.modules.tradeoff}`,
    },
    {
      id: `${concept.id}-evidence`,
      conceptId: concept.id,
      kind: "choice",
      prompt: `Which indexed file supports this lesson?`,
      options: [
        concept.evidence[0]?.path ?? "No evidence",
        "unverified/production-deployment.yaml",
        "unverified/generated-answer.md",
      ],
      answer: 0,
      explanation:
        "The cited path and exact line range are validated against this commit. Unindexed paths cannot support a repository claim.",
    },
    {
      id: `${concept.id}-explain`,
      conceptId: concept.id,
      kind: "short",
      prompt: `Explain ${concept.title.toLowerCase()} using one observed source detail and one limitation of what it proves.`,
      explanation:
        "A strong answer connects an observed implementation detail to the concept and states a limit to the evidence.",
      rubric: [
        {
          phrase: "Source detail",
          alternatives: [
            concept.evidence[0]?.path.split("/").pop() ?? "source",
            "source",
            "line",
            "import",
            "function",
            "query",
            "schema",
          ],
        },
        {
          phrase: "Limitation",
          alternatives: [
            "does not",
            "cannot",
            "not prove",
            "doesn’t",
            "not guarantee",
            "unverified",
            "limitation",
            "unknown",
            "not necessarily",
          ],
        },
      ],
    },
  ];
}
export function scoreChoice(q: Question, answer: number) {
  return q.kind === "choice" && answer === q.answer ? 1 : 0;
}
export function scoreShort(q: Question, answer: string) {
  const lower = answer.toLowerCase();
  const checks = (q.rubric ?? []).map((r) => ({
    criterion: r.phrase,
    met: r.alternatives.some((a) => lower.includes(a.toLowerCase())),
  }));
  return {
    score: checks.length
      ? checks.filter((c) => c.met).length / checks.length
      : 0,
    checks,
    note: "Practice rubric only: keyword coverage is not a reliable correctness grade. This answer does not change estimated mastery until model-assisted or human review is available.",
  };
}
export function mastery(progress: Progress, conceptId: string) {
  const attempts = progress.attempts.filter(
    (a) => a.conceptId === conceptId && a.kind === "choice",
  );
  const unique = new Map(attempts.map((a) => [a.questionId, a]));
  const current = [...unique.values()];
  return current.length
    ? Math.round(
        (current.reduce((n, a) => n + a.score, 0) /
          Math.max(2, current.length)) *
          100,
      )
    : 0;
}
export function emptyProgress(): Progress {
  return {
    attempts: [],
    visited: [],
    level: "beginner",
    updatedAt: new Date().toISOString(),
  };
}
