import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { modelRequest } from "../lib/provider";
import { sampleSnapshot } from "../lib/sample";
import { retrieve } from "../lib/analysis";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
if (
  process.env.LLM_BASE_URL?.replace(/\/$/, "") !==
  "https://api.withprune.com/v1"
)
  throw new Error("This probe requires the configured Prune endpoint.");
const originalFetch = globalThis.fetch;
let observed: Record<string, unknown> = {};
globalThis.fetch = async (...args) => {
  const response = await originalFetch(...args);
  const body = await response.clone().json();
  const headers = Object.fromEntries(
    [...response.headers].filter(([name]) =>
      /^x-prune-(provider|cache-hit|cache-type|pipeline-mode|pipeline-label|shield-code|request-id)$/.test(
        name,
      ),
    ),
  );
  observed = { status: response.status, headers, body };
  return response;
};
const started = performance.now();
const snapshot = sampleSnapshot();
const question =
  "Where is the note body validated? Explain the observed length limits and what this does not establish.";
try {
  const answer = await modelRequest(
    snapshot,
    question,
    JSON.stringify(retrieve(snapshot, question, 3)),
    "beginner",
  );
  observed.validation = {
    passed: true,
    claims: answer.claims.length,
    insufficientEvidence: answer.insufficientEvidence,
    usage: answer.usage,
  };
} catch (error) {
  observed.validation = {
    passed: false,
    error: error instanceof Error ? error.message : "Unknown error",
  };
  process.exitCode = 1;
} finally {
  globalThis.fetch = originalFetch;
  observed.ms = Math.round(performance.now() - started);
  await mkdir(".synapse/probes", { recursive: true, mode: 0o700 });
  await writeFile(
    ".synapse/probes/prune-initial.json",
    JSON.stringify(observed, null, 2),
    { mode: 0o600 },
  );
  const body = observed.body as Record<string, unknown> | undefined;
  console.log(
    JSON.stringify(
      {
        status: observed.status,
        headers: observed.headers,
        validation: observed.validation,
        ms: observed.ms,
        responseKeys: Object.keys(body ?? {}),
        metadataKeys: Object.keys((body?.prune_metadata ?? {}) as object),
      },
      null,
      2,
    ),
  );
}
