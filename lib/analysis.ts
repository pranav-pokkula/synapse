import ts from "typescript";
import path from "node:path";
import type { Citation, Concept, Snapshot, SourceFile } from "./types";

export const LIMITS = {
  files: 48,
  fileBytes: 80_000,
  totalBytes: 1_000_000,
  treeEntries: 15_000,
  batch: 6,
  repoKb: 150_000,
};
const excluded =
  /(^|\/)(node_modules|vendor|dist|build|coverage|\.git|\.next|\.env[^/]*|__snapshots__|generated|fixtures)(\/|$)|(^|\/)(package-lock|pnpm-lock|yarn\.lock|bun\.lock)|\.(min\.[jt]s|map|lock|pem|key|crt)$/i;
export function isEligible(filePath: string, size: number) {
  return (
    size > 0 &&
    size <= LIMITS.fileBytes &&
    !excluded.test(filePath) &&
    !filePath.includes("..") &&
    /\.(tsx?|jsx?|mjs|cjs|json|sql|css)$/.test(filePath)
  );
}
export function filePriority(p: string) {
  return /(^|\/)package\.json$/.test(p)
    ? 100
    : /((^|\/)app\/.*(page|route|layout)\.[tj]sx?$|(^|\/)src\/index|(^|\/)index\.[tj]s)/.test(
          p,
        )
      ? 90
      : /(auth|api|server|db|schema|store|lib)\//.test(p)
        ? 80
        : /test|spec/.test(p)
          ? 30
          : /config/.test(p)
            ? 40
            : 60;
}
export function indexFile(
  filePath: string,
  content: string,
  sha: string,
): SourceFile {
  const imports: string[] = [],
    exports: string[] = [];
  const source = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  function walk(node: ts.Node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    )
      imports.push(node.moduleSpecifier.text);
    if (
      ts.isCallExpression(node) &&
      node.arguments.length &&
      ts.isStringLiteral(node.arguments[0]) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) &&
          node.expression.text === "require"))
    )
      imports.push(node.arguments[0].text);
    if (
      (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) &&
      node.name &&
      node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    )
      exports.push(node.name.text);
    ts.forEachChild(node, walk);
  }
  if (/\.[cm]?[jt]sx?$/.test(filePath)) walk(source);
  const category = /test|spec/.test(filePath)
    ? "test"
    : /route\.[tj]s$|\/api\//.test(filePath)
      ? "server"
      : /auth|session|middleware/.test(filePath)
        ? "auth"
        : /db|database|schema|\.sql$/.test(filePath)
          ? "data"
          : /\.[tj]sx$/.test(filePath)
            ? "interface"
            : "module";
  return {
    path: filePath,
    content,
    sha,
    imports: [...new Set(imports)],
    exports,
    category,
  };
}
export function citation(
  file: SourceFile,
  sha: string,
  pattern?: RegExp,
): Citation {
  const lines = file.content.split("\n");
  const found = pattern ? lines.findIndex((l) => pattern.test(l)) : 0;
  const start = Math.max(1, found + 1);
  const end = Math.min(lines.length, start + 7);
  return {
    path: file.path,
    sha,
    start,
    end,
    quote: lines.slice(start - 1, end).join("\n"),
  };
}
export function validCitation(
  c: Citation,
  snapshot: Pick<Snapshot, "sha" | "files">,
): boolean {
  const f = snapshot.files.find((f) => f.path === c.path);
  if (
    !f ||
    c.sha !== snapshot.sha ||
    !Number.isInteger(c.start) ||
    !Number.isInteger(c.end) ||
    c.start < 1 ||
    c.end < c.start
  )
    return false;
  const lines = f.content.split("\n");
  return (
    c.end <= lines.length &&
    lines.slice(c.start - 1, c.end).join("\n") === c.quote &&
    c.quote.trim().length > 0
  );
}
const definitions = [
  {
    id: "modules",
    title: "How the pieces connect",
    kind: "modules",
    objective:
      "Trace a module dependency and explain what crosses that boundary.",
    why: "Module boundaries are the starting point for reading unfamiliar code.",
    difficulty: 1,
    importance: 95,
    prerequisites: [],
    match: (f: SourceFile) => f.imports.length > 0,
    pattern: /import |require\(/,
  },
  {
    id: "interface",
    title: "From interface to interaction",
    kind: "interface",
    objective: "Explain how a component turns data and user input into a view.",
    why: "The interface connects implementation details to the experience a user sees.",
    difficulty: 1,
    importance: 85,
    prerequisites: ["modules"],
    match: (f: SourceFile) => f.category === "interface",
    pattern: /function |=>|useState|return/,
  },
  {
    id: "requests",
    title: "The life of a request",
    kind: "requests",
    objective: "Trace an HTTP request through its handler and response.",
    why: "Request boundaries connect user actions to server behavior and failure handling.",
    difficulty: 2,
    importance: 98,
    prerequisites: ["modules"],
    match: (f: SourceFile) =>
      /export\s+(async\s+)?function\s+(GET|POST|PUT|DELETE)|app\.(get|post|use)\(|fetch\(/.test(
        f.content,
      ),
    pattern: /function (GET|POST|PUT|DELETE)|app\.(get|post|use)|fetch\(/,
  },
  {
    id: "validation",
    title: "Trust starts with validation",
    kind: "validation",
    objective:
      "Identify an input boundary and explain how validation rejects unsafe data.",
    why: "Untrusted inputs are a common source of reliability and security defects.",
    difficulty: 2,
    importance: 92,
    prerequisites: ["modules"],
    match: (f: SourceFile) =>
      /\.safeParse\(|\.parse\(|z\.object\(|Joi\.|yup\.|validate\(/.test(
        f.content,
      ),
    pattern: /safeParse|\.parse\(|z\.object|validate\(/,
  },
  {
    id: "auth",
    title: "Identity and access",
    kind: "auth",
    objective:
      "Distinguish authentication from authorization in the indexed code.",
    why: "Understanding who can access data matters more than merely having a sign-in screen.",
    difficulty: 3,
    importance: 94,
    prerequisites: ["modules"],
    match: (f: SourceFile) =>
      /getUser\(|getSession\(|auth\(|signIn|auth\.uid\(|jwt\.verify/.test(
        f.content,
      ),
    pattern: /getUser|getSession|auth\(|signIn|auth\.uid|jwt\.verify/,
  },
  {
    id: "data",
    title: "Where your data lives",
    kind: "data",
    objective: "Follow a data query and identify its persistence boundary.",
    why: "Data access connects application state with correctness and ownership.",
    difficulty: 2,
    importance: 89,
    prerequisites: ["modules"],
    match: (f: SourceFile) =>
      /\.from\(['"]|prisma\.|CREATE TABLE|create table|\.query\(|mongoose\./.test(
        f.content,
      ),
    pattern:
      /\.from\(|prisma\.|[Cc][Rr][Ee][Aa][Tt][Ee] [Tt][Aa][Bb][Ll][Ee]|\.query\(/,
  },
  {
    id: "state",
    title: "State that stays in sync",
    kind: "state",
    objective: "Describe what changes state and what is rendered as a result.",
    why: "State transitions explain how an interactive application behaves over time.",
    difficulty: 2,
    importance: 79,
    prerequisites: ["interface"],
    match: (f: SourceFile) =>
      /useState\(|useReducer\(|createStore\(|configureStore\(/.test(f.content),
    pattern: /useState|useReducer|createStore|configureStore/,
  },
  {
    id: "tests",
    title: "Confidence through testing",
    kind: "tests",
    objective: "Read a test assertion and identify the behavior it protects.",
    why: "Tests are executable examples, but their presence does not prove they pass.",
    difficulty: 2,
    importance: 74,
    prerequisites: ["modules"],
    match: (f: SourceFile) =>
      f.category === "test" && /\bit\(|\btest\(|\bdescribe\(/.test(f.content),
    pattern: /\bit\(|\btest\(|\bexpect\(/,
  },
];
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
export function analyze(
  input: Omit<Snapshot, "dependencies" | "frameworks" | "concepts" | "edges">,
): Snapshot {
  const deps = new Set<string>();
  for (const f of input.files.filter((f) =>
    /(^|\/)package.json$/.test(f.path),
  )) {
    try {
      const p = JSON.parse(f.content);
      Object.keys({ ...p.dependencies, ...p.devDependencies }).forEach((x) =>
        deps.add(x),
      );
    } catch {
      /* Invalid manifests remain source evidence, not dependency facts. */
    }
  }
  const concepts = definitions.flatMap((d) => {
    const files = input.files.filter(d.match);
    return files.length
      ? [
          {
            id: d.id,
            title: d.title,
            kind: d.kind,
            objective: d.objective,
            why: d.why,
            difficulty: d.difficulty,
            importance: d.importance,
            prerequisites: d.prerequisites,
            evidence: files
              .slice(0, 3)
              .map((f) => citation(f, input.sha, d.pattern)),
            minutes: 4 + d.difficulty * 2,
          },
        ]
      : [];
  });
  if (!concepts.length && input.files.length)
    concepts.push({
      id: "structure",
      title: "Reading the project structure",
      kind: "modules",
      objective:
        "Locate source files and describe an observable implementation detail.",
      why: "Start with what the indexed source can establish.",
      difficulty: 1,
      importance: 90,
      prerequisites: [],
      evidence: [citation(input.files[0], input.sha)],
      minutes: 6,
    });
  for (const c of concepts)
    c.prerequisites = c.prerequisites.filter((p) =>
      concepts.some((c) => c.id === p),
    );
  const paths = new Set(input.files.map((f) => f.path)),
    edges: { from: string; to: string }[] = [];
  for (const f of input.files)
    for (const imp of f.imports) {
      if (!imp.startsWith(".") && !imp.startsWith("@/")) continue;
      const bases = imp.startsWith("@/")
        ? [imp.slice(2), "src/" + imp.slice(2)]
        : [
            path.posix.normalize(
              path.posix.join(path.posix.dirname(f.path), imp),
            ),
          ];
      const target = bases
        .flatMap((base) => [
          base,
          ...[
            ".ts",
            ".tsx",
            ".js",
            ".jsx",
            "/index.ts",
            "/index.tsx",
            "/index.js",
          ].map((ext) => base + ext),
        ])
        .find((p) => paths.has(p));
      if (target && !edges.some((e) => e.from === f.path && e.to === target))
        edges.push({ from: f.path, to: target });
    }
  return {
    ...input,
    dependencies: [...deps].sort(),
    frameworks: [
      "next",
      "react",
      "vue",
      "express",
      "fastify",
      "@supabase/supabase-js",
      "zod",
    ].filter((d) => deps.has(d)),
    concepts: rankConcepts(concepts),
    edges,
  };
}
export function retrieve(snapshot: Snapshot, query: string, limit = 4) {
  const stop = new Set(['the','and','what','where','does','how','which','this','that','with','from','into','are','its','for','when','can','use','before']);
  const stem = (word:string) => word.replace(/(ation|ated|ating)$/,'').replace(/s$/,'');
  const tokens = (text:string) => (text.replace(/([a-z])([A-Z])/g,'$1 $2').toLowerCase().match(/[a-z][a-z0-9_]{2,}/g)??[]).filter(t=>!stop.has(t)).map(stem);
  const terms = [...new Set(tokens(query))];
  const indexed=snapshot.files.map(file=>({file,pathTerms:new Set(tokens(file.path)),contentTerms:new Set(tokens(file.content))}));
  const weights=new Map(terms.map(t=>[t,Math.log(1+indexed.length/(1+indexed.filter(f=>f.pathTerms.has(t)||f.contentTerms.has(t)).length))]));
  return indexed
    .map(({file,pathTerms,contentTerms}) => ({
      file,
      score: terms.reduce(
        (score, t) =>
          score +
          ((pathTerms.has(t) ? 5 : 0) +
          (contentTerms.has(t) ? 1 : 0)) * (weights.get(t)??1),
        0,
      ) * (file.category === 'test' && !/test|spec|assert/.test(query.toLowerCase()) ? 0.75 : 1),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.file.path.localeCompare(b.file.path))
    .slice(0, limit)
    .map(({ file }) =>
      citation(
        file,
        snapshot.sha,
        new RegExp(
          terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
          "i",
        ),
      ),
    );
}
