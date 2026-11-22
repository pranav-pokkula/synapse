import { z } from "zod";

export const levelSchema = z.enum(["beginner", "intermediate", "advanced"]);
export type Level = z.infer<typeof levelSchema>;
export type SourceFile = {
  path: string;
  content: string;
  sha: string;
  imports: string[];
  exports: string[];
  category: string;
};
export const citationSchema = z
  .object({
    path: z.string().min(1).max(240),
    sha: z.string().regex(/^[a-f0-9]{40}$/),
    start: z.number().int().positive(),
    end: z.number().int().positive(),
    quote: z.string().min(1).max(4000),
  })
  .strict();
export type Citation = z.infer<typeof citationSchema>;
export type Concept = {
  id: string;
  title: string;
  objective: string;
  why: string;
  prerequisites: string[];
  difficulty: number;
  importance: number;
  evidence: Citation[];
  minutes: number;
  kind: string;
};
export type Snapshot = {
  id: string;
  owner: string;
  repo: string;
  branch: string;
  sha: string;
  description: string;
  files: SourceFile[];
  dependencies: string[];
  frameworks: string[];
  concepts: Concept[];
  edges: { from: string; to: string }[];
  coverage: {
    total: number;
    eligible: number;
    indexed: number;
    partial: boolean;
    skipped: string[];
  };
  createdAt: string;
  sample?: boolean;
};
export const sceneSchema = z
  .object({
    id: z.string().max(60),
    title: z.string().max(120),
    caption: z.string().min(1).max(900),
    active: z.array(z.string().max(60)).max(8),
    from: z.string().max(60).optional(),
    to: z.string().max(60).optional(),
    state: z.enum(["idle", "working", "success", "failure"]),
    citationIndex: z.number().int().min(0).optional(),
  })
  .strict();
export const storyboardSchema = z
  .object({
    nodes: z
      .array(
        z
          .object({
            id: z.string().max(60),
            label: z.string().max(60),
            kind: z.enum(["client", "server", "data", "output"]),
          })
          .strict(),
      )
      .min(2)
      .max(6),
    steps: z.array(sceneSchema).min(2).max(12),
  })
  .strict()
  .superRefine((board, ctx) => {
    const ids = new Set(board.nodes.map((n) => n.id));
    if (ids.size !== board.nodes.length)
      ctx.addIssue({ code: "custom", message: "Duplicate scene node IDs" });
    for (const step of board.steps)
      for (const id of [
        ...step.active,
        ...(step.from ? [step.from] : []),
        ...(step.to ? [step.to] : []),
      ])
        if (!ids.has(id))
          ctx.addIssue({
            code: "custom",
            message: "Scene references an unknown node",
          });
  });
export type Storyboard = z.infer<typeof storyboardSchema>;
export type Lesson = {
  conceptId: string;
  level: Level;
  title: string;
  summary: string;
  analogy: string;
  details: string[];
  tradeoffs: string[];
  citations: Citation[];
  board: Storyboard;
  mode: "reviewed-sample" | "source-template" | "live-model";
  model?: string;
};
export type Attempt = {
  id: string;
  conceptId: string;
  questionId: string;
  correct: boolean;
  score: number;
  at: string;
  kind: "choice" | "short";
};
export type Progress = {
  attempts: Attempt[];
  visited: string[];
  level: Level;
  updatedAt: string;
};
export type ImportJob = {
  id: string;
  owner: string;
  repo: string;
  branch: string;
  sha: string;
  description: string;
  status: "fetching" | "analyzing" | "complete" | "failed";
  queue: { path: string; sha: string; size: number }[];
  files: SourceFile[];
  cursor: number;
  total: number;
  eligible: number;
  skipped: string[];
  error?: string;
  snapshotId?: string;
  createdAt: string;
  revision: number;
};
export const modelAnswerSchema = z
  .object({
    answer: z.string().min(1).max(6000),
    claims: z
      .array(
        z
          .object({
            text: z.string().max(1500),
            kind: z.enum(["verified", "inference", "general", "unknown"]),
            citations: z.array(citationSchema).max(5),
          })
          .strict(),
      )
      .max(8),
    insufficientEvidence: z.boolean(),
  })
  .strict();
export type TutorAnswer = z.infer<typeof modelAnswerSchema> & {
  mode: "source-template" | "live-model";
  model?: string;
  usage?: { input: number; output: number };
};
