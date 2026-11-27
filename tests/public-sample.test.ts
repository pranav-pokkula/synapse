import { afterEach, expect, it, vi } from "vitest";
import { browserSampleRequest } from "@/lib/browser-sample";
import { sampleSnapshot } from "@/lib/sample";
import { mastery, questions } from "@/lib/learning";
import { providerConfigured } from "@/lib/model-transport";
import { proxy } from "../proxy";
import type { Progress, TutorAnswer } from "@/lib/types";

const sample = sampleSnapshot();
function storage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
    key: (index) => [...data.keys()][index] ?? null,
  };
}
afterEach(() => vi.unstubAllEnvs());

it("keeps sample assessment and progress in separate browser stores; repeat answers do not inflate mastery", () => {
  const a = storage(),
    b = storage(),
    concept = sample.concepts[0],
    q = questions(concept)[0];
  const input = {
    projectId: "sample",
    conceptId: concept.id,
    questionId: q.id,
    answer: q.answer,
  };
  const first = browserSampleRequest("/api/assessment", input, sample, a) as {
    progress: Progress;
  };
  const again = browserSampleRequest("/api/assessment", input, sample, a) as {
    progress: Progress;
  };
  expect(mastery(again.progress, concept.id)).toBe(
    mastery(first.progress, concept.id),
  );
  expect(
    (
      browserSampleRequest(
        "/api/progress?projectId=sample",
        undefined,
        sample,
        b,
      ) as Progress
    ).attempts,
  ).toHaveLength(0);
  expect(
    (
      browserSampleRequest(
        "/api/progress?projectId=sample",
        undefined,
        sample,
        a,
      ) as Progress
    ).attempts,
  ).toHaveLength(2);
});
it("rejects imported project IDs and invalid assessments without saving", () => {
  const s = storage();
  expect(() =>
    browserSampleRequest(
      "/api/assessment",
      { projectId: "private" },
      sample,
      s,
    ),
  ).toThrow();
  expect(() => browserSampleRequest("/api/import", {}, sample, s)).toThrow(
    /protected/,
  );
  expect(s.length).toBe(0);
});
it("recovers malformed local state and deletes sample data without contacting accounts", () => {
  const s = storage();
  s.setItem("synapse-progress-v1:sample", '{"attempts":null}');
  expect(
    (
      browserSampleRequest(
        "/api/progress?projectId=sample",
        undefined,
        sample,
        s,
      ) as Progress
    ).attempts,
  ).toEqual([]);
  browserSampleRequest("/api/account", { action: "delete-data" }, sample, s);
  expect(s.length).toBe(0);
});
it("labels source guidance as a template and abstains on unsupported questions", () => {
  const answer = browserSampleRequest(
    "/api/tutor",
    {
      projectId: "sample",
      conceptId: sample.concepts[0].id,
      level: "beginner",
      question: "predict tomorrow's weather",
    },
    sample,
    storage(),
  ) as TutorAnswer;
  expect(answer.mode).toBe("source-template");
  expect(answer.insufficientEvidence).toBe(true);
});
it("makes short-answer practice ungraded and does not increase mastery", () => {
  const s = storage(),
    concept = sample.concepts[0],
    q = questions(concept).find((q) => q.kind === "short")!;
  const result = browserSampleRequest(
    "/api/assessment",
    {
      projectId: "sample",
      conceptId: concept.id,
      questionId: q.id,
      answer: "An import describes a source dependency.",
    },
    sample,
    s,
  );
  expect(result).toHaveProperty("ungraded", true);
  expect(s.length).toBe(0);
});
it("fails closed for production API access and model calls even if credentials are configured", async () => {
  vi.stubEnv("VERCEL_ENV", "production");
  vi.stubEnv("LLM_BASE_URL", "https://example.test");
  vi.stubEnv("LLM_API_KEY", "test-only");
  vi.stubEnv("LLM_MODEL", "test");
  expect(providerConfigured()).toBe(false);
  const response = proxy();
  expect(response.status).toBe(403);
  expect(await response.json()).toHaveProperty("code", "PUBLIC_SAMPLE_ONLY");
});
it("preserves access routing for the protected preview", () => {
  vi.stubEnv("VERCEL_ENV", "preview");
  expect(proxy().headers.get("x-middleware-next")).toBe("1");
});
