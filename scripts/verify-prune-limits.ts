import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
if (
  process.env.LLM_BASE_URL?.replace(/\/$/, "") !==
  "https://api.withprune.com/v1"
)
  throw new Error("Prune endpoint required");
// Bounded authorized negative test: at most 11 tiny requests, no retries and no
// attempt to exhaust the dollar cap. The user's saved policy is 10/minute.
const body = JSON.stringify({
  model: "gemini/gemini-flash-lite-latest",
  temperature: 0,
  max_tokens: 16,
  response_format: { type: "json_object" },
  messages: [{ role: "user", content: 'Return exactly {"connected":true}' }],
});
const cacheMode = process.env.SHIELD_CACHE_OFF === "1" ? "off" : "exact";
async function call() {
  const start = performance.now();
  try {
    const r = await fetch("https://api.withprune.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.LLM_API_KEY}`,
        "Content-Type": "application/json",
        "X-Prune-Feature-Id": "synapse-shield-verification",
        "X-Prune-Cache": cacheMode,
        "X-Prune-Model-Policy": "off",
      },
      body,
      signal: AbortSignal.timeout(45000),
    });
    const data = await r.json();
    return {
      status: r.status,
      ms: Math.round(performance.now() - start),
      shieldCode: r.headers.get("x-prune-shield-code"),
      cacheHit: r.headers.get("x-prune-cache-hit"),
      errorCode: data.code ?? data.error?.code ?? null,
      estimatedCostUsd: data.prune_metadata?.cost_with_prune_usd ?? null,
      requestId: data.prune_metadata?.receipt_request_id ?? null,
    };
  } catch (error) {
    return {
      status: 0,
      error: (error as Error).name,
      ms: Math.round(performance.now() - start),
    };
  }
}
const start = performance.now();
const first = await call();
const rest =
  first.status === 200
    ? await Promise.all(Array.from({ length: 10 }, call))
    : [];
const outcomes = [first, ...rest];
const report = {
  recordedAt: new Date().toISOString(),
  scope:
    "Actual configured SYNAPSE Prune key; at most 11 requests, at most 16 requested output tokens each",
  attempted: outcomes.length,
  cacheMode,
  elapsedMs: Math.round(performance.now() - start),
  outcomes,
  rateLimitObserved: outcomes.some((x) => x.status === 429),
  spendCap:
    "$1 per UTC day and anomaly detection personally confirmed by user in saved Shield settings; not exhausted as a test",
  limitations: [
    "A rate denial alone does not independently establish the precise dollar cap.",
    "Reported cost is an estimate, not an independently reconciled bill.",
  ],
};
await mkdir("evidence", { recursive: true });
await writeFile(
  cacheMode === "off"
    ? "evidence/prune-shield-uncached-results.json"
    : "evidence/prune-shield-results.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
if (!report.rateLimitObserved) process.exitCode = 1;
