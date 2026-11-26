import { createHash } from "node:crypto";
import { AppError } from "./errors";
import type { ModelTelemetry } from "./types";

export const PROMPT_VERSION = "synapse-2026-11-25-v1";
export function providerConfigured() {
  return Boolean(
    process.env.LLM_BASE_URL &&
    process.env.LLM_MODEL &&
    (process.env.LLM_API_KEY || process.env.LLM_ALLOW_LOCAL === "true"),
  );
}
export function modelConfiguration() {
  const base = new URL(
    process.env.LLM_BASE_URL ?? "https://unconfigured.invalid",
  );
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname);
  if (
    base.username ||
    base.password ||
    base.search ||
    base.hash ||
    (base.protocol !== "https:" &&
      !(local && process.env.LLM_ALLOW_LOCAL === "true"))
  )
    throw new AppError(
      "The model endpoint configuration is invalid.",
      503,
      "MODEL_CONFIG",
    );
  const prune = base.origin === "https://api.withprune.com";
  const configured = process.env.LLM_MODEL ?? "";
  // Prune's /v1/models advertises this namespace for its Gemini route.
  const model =
    prune && configured.startsWith("gemini-")
      ? `gemini/${configured}`
      : configured;
  return { base, prune, model };
}
export function modelCacheIdentity(value: unknown) {
  const { base, model } = modelConfiguration();
  return createHash("sha256")
    .update(
      JSON.stringify({
        value,
        endpoint: base.href,
        model,
        version: PROMPT_VERSION,
        temperature: 0,
        routePolicy: "off",
        cachePolicy: "exact",
      }),
    )
    .digest("hex");
}
const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
const number = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;

export function parseCompletionEnvelope(raw: unknown, allowGemini: boolean) {
  const data = object(raw);
  const first = object(
    Array.isArray(data.choices) ? data.choices[0] : undefined,
  );
  let content = object(first.message).content;
  let finish = first.finish_reason;
  let model = typeof data.model === "string" ? data.model : undefined;
  let usage = {
    input: number(object(data.usage).prompt_tokens),
    output: number(object(data.usage).completion_tokens),
  };
  if (content === undefined && allowGemini) {
    const candidate = object(
      Array.isArray(data.candidates) ? data.candidates[0] : undefined,
    );
    const parts = object(candidate.content).parts;
    content = Array.isArray(parts)
      ? parts
          .map(object)
          .filter((p) => p.thought !== true && typeof p.text === "string")
          .map((p) => p.text)
          .join("")
      : undefined;
    finish = candidate.finishReason;
    model =
      typeof data.modelVersion === "string" ? data.modelVersion : undefined;
    usage = {
      input: number(object(data.usageMetadata).promptTokenCount),
      output: number(object(data.usageMetadata).candidatesTokenCount),
    };
  }
  if (finish === "length" || finish === "MAX_TOKENS")
    throw new AppError(
      "The AI answer exceeded its output allowance. The source lesson is still available.",
      502,
      "MODEL_OUTPUT",
    );
  if (typeof content !== "string" || !content.trim())
    throw new AppError(
      "The model returned an unsupported response format. Your saved work is safe.",
      502,
      "MODEL_OUTPUT",
    );
  let parsed: unknown;
  try {
    parsed = JSON.parse(
      content
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/\s*```$/, ""),
    );
  } catch {
    throw new AppError(
      "The model returned unreadable JSON. Try again or use the source lesson.",
      502,
      "MODEL_OUTPUT",
    );
  }
  return { parsed, model, usage };
}

// Deliberately exclude tenant/customer/session IDs, prompt content, and hidden
// reasoning signatures. Full gateway receipts are captured only by explicit
// verification scripts into ignored local files, never application logs.
export function pruneTelemetry(
  raw: unknown,
  headers: Headers,
): ModelTelemetry["prune"] {
  const m = object(raw);
  if (!Object.keys(m).length) return undefined;
  const text = (key: string) =>
    typeof m[key] === "string" ? (m[key] as string).slice(0, 500) : undefined;
  return {
    provider: text("provider") ?? headers.get("x-prune-provider") ?? undefined,
    cacheHit: m.cache_hit === true,
    cacheType: text("cache_type"),
    routeApplied: m.route_applied === true,
    originalModel: text("original_model"),
    routedModel: text("routed_model"),
    routeReason: text("route_reason"),
    fallbackUsed:
      m.route_fallback_used === true || m.cross_provider_fallback_used === true,
    pipelineMode: text("pipeline_mode"),
    estimatedCostUsd:
      typeof m.cost_with_prune_usd === "number"
        ? number(m.cost_with_prune_usd)
        : undefined,
    counterfactualCostUsd:
      typeof m.cost_without_prune_usd === "number"
        ? number(m.cost_without_prune_usd)
        : undefined,
    optimizations: Array.isArray(m.optimizations_applied)
      ? m.optimizations_applied
          .filter((v): v is string => typeof v === "string")
          .slice(0, 20)
      : [],
    requestId: text("receipt_request_id"),
    receiptSignature: text("receipt_signature"),
    receiptVersion: text("receipt_fields_version"),
    receiptSignedAt: text("receipt_signed_at"),
    receiptVerified: false,
  };
}

type RequestOptions = {
  system: string;
  prompt: string;
  history?: { role: "user" | "assistant"; content: string }[];
  maxTokens?: number;
  feature?: string;
  cacheMode?: "exact" | "off";
  userScope?: string;
};
export async function completionRequest(options: RequestOptions) {
  if (!providerConfigured())
    throw new AppError(
      "Live AI is not configured. Set LLM_BASE_URL, LLM_MODEL, and LLM_API_KEY on the server. Source lessons remain available.",
      503,
      "MODEL_CONFIG",
    );
  const { base, prune, model } = modelConfiguration();
  const start = performance.now();
  const timeout = Math.min(
    45_000,
    Math.max(1_000, Number(process.env.LLM_TIMEOUT_MS) || 25_000),
  );
  let response: Response;
  try {
    response = await fetch(base.href.replace(/\/$/, "") + "/chat/completions", {
      method: "POST",
      redirect: "error",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.LLM_API_KEY
          ? { Authorization: `Bearer ${process.env.LLM_API_KEY}` }
          : {}),
        ...(prune
          ? {
              "X-Prune-Cache": options.cacheMode ?? "exact",
              "X-Prune-Model-Policy": "off",
              "X-Prune-Feature-Id": options.feature ?? "synapse-tutor",
              ...(options.userScope
                ? { "X-Prune-Customer-Id": options.userScope }
                : {}),
            }
          : {}),
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        messages: [
          { role: "system", content: options.system },
          ...(options.history ?? [])
            .slice(-4)
            .map((m) => ({ ...m, content: m.content.slice(0, 1500) })),
          { role: "user", content: options.prompt },
        ],
        response_format: { type: "json_object" },
        max_tokens: Math.min(3200, options.maxTokens ?? 1800),
      }),
      signal: AbortSignal.timeout(timeout),
    });
  } catch {
    throw new AppError(
      `The AI provider did not respond within ${timeout / 1000} seconds. Your lesson and progress are safe.`,
      503,
      "MODEL_TIMEOUT",
    );
  }
  if (!response.ok) {
    await response.body?.cancel();
    const shield = response.headers.get("x-prune-shield-code");
    if (shield || response.status === 402)
      throw new AppError(
        "Prune has paused this request under its usage or spending policy. Your source lessons and progress remain available. Retry after the limit resets.",
        429,
        "PRUNE_LIMIT",
      );
    if (response.status >= 500)
      throw new AppError(
        "The AI gateway is temporarily unavailable. Your saved lessons and progress remain available. Retry later.",
        503,
        "MODEL_UNAVAILABLE",
      );
    throw new AppError(
      response.status === 429
        ? "The model provider has reached its usage limit. Use the source lesson or retry later."
        : "The AI provider rejected this request. Check its configured endpoint, key, and model.",
      502,
      "MODEL_PROVIDER",
    );
  }
  const chunks: Uint8Array[] = [];
  let size = 0;
  const reader = response.body?.getReader();
  try {
    if (reader)
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 48_000) {
          await reader.cancel();
          throw new AppError(
            "The model output exceeded the response limit.",
            502,
            "MODEL_OUTPUT",
          );
        }
        chunks.push(value);
      }
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError(
      "The AI response stream stopped before it completed. Your saved work is safe.",
      503,
      "MODEL_TIMEOUT",
    );
  }
  let data: Record<string, unknown>;
  try {
    data = object(JSON.parse(Buffer.concat(chunks).toString("utf8")));
  } catch {
    throw new AppError(
      "The model returned unreadable JSON. Use the source lesson or retry later.",
      502,
      "MODEL_OUTPUT",
    );
  }
  const parsed = parseCompletionEnvelope(data, prune);
  const gateway = prune
    ? pruneTelemetry(data.prune_metadata, response.headers)
    : undefined;
  if (
    gateway?.provider &&
    gateway.provider !== "gemini" &&
    model.startsWith("gemini/")
  )
    throw new AppError(
      "The gateway changed the requested provider. The answer was rejected; use the source lesson.",
      502,
      "MODEL_ROUTE",
    );
  const telemetry: ModelTelemetry = {
    requestedModel: model,
    servedModel: parsed.model ?? model,
    latencyMs: Math.round(performance.now() - start),
    usage: parsed.usage,
    prune: gateway,
  };
  return { value: parsed.parsed, telemetry };
}
