import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
process.loadEnvFile(".env.local");
const link = JSON.parse(readFileSync(".vercel/project.json", "utf8"));
if (
  link.projectId !== "prj_RMwgdJSer7ZTDao4j96JlivYdWaG" ||
  link.orgId !== "team_hyDyuYXt4tQ5Ui1y2SkdmeYs"
)
  throw new Error("SYNAPSE Vercel target mismatch");
if (
  new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname !==
  "fcwyithhipsimrnccqsy.supabase.co"
)
  throw new Error("SYNAPSE Supabase target mismatch");
const values = {
  LLM_BASE_URL: process.env.LLM_BASE_URL,
  LLM_MODEL: process.env.LLM_MODEL,
  LLM_API_KEY: process.env.LLM_API_KEY,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  LLM_TIMEOUT_MS: "45000",
  LLM_DAILY_CALL_LIMIT: "20",
  PRUNE_SHIELD_VERIFIED: "true",
};
// Values enter the authenticated CLI through stdin, never command arguments,
// repository files, console output, or model-visible tool responses.
for (const [key, value] of Object.entries(values)) {
  if (!value) throw new Error(`Missing ${key}`);
  const r = spawnSync(
    "npx",
    [
      "--yes",
      "vercel@67.0.0",
      "env",
      "add",
      key,
      "--environment",
      "preview",
      "--project",
      link.projectId,
      "--scope",
      "pranav-pokkulas-projects",
      "--type",
      key === "LLM_API_KEY" ? "secret" : "config",
      "--yes",
      "--non-interactive",
    ],
    { input: value, encoding: "utf8", timeout: 45000 },
  );
  console.log(
    `${key}: ${r.status === 0 ? "configured for preview" : "failed"}`,
  );
  if (r.status !== 0)
    throw new Error(
      "Environment configuration failed; inspect variable names with vercel env ls. Values and subprocess output intentionally withheld.",
    );
}
