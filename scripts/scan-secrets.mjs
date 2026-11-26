import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const secrets = [
  "LLM_API_KEY",
  "GITHUB_TOKEN",
  "VERCEL_OIDC_TOKEN",
  "SUPABASE_SERVICE_ROLE_KEY",
]
  .map((k) => process.env[k])
  .filter((v) => v && v.length > 12);
const files = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { encoding: "utf8" },
)
  .split("\0")
  .filter(Boolean);
const findings = [];
let checked = 0;
for (const file of files) {
  if (/\.(png|mp4|webm|woff2?)$/.test(file)) continue;
  const s = readFileSync(file, "utf8");
  checked++;
  if (
    secrets.some((value) => s.includes(value)) ||
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(s)
  )
    findings.push(file);
}
function walk(dir) {
  return existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory()
          ? walk(path.join(dir, e.name))
          : [path.join(dir, e.name)],
      )
    : [];
}
const chunks = walk(".next/static").filter((f) => f.endsWith(".js"));
const clientFindings = chunks.filter((f) =>
  secrets.some((value) => readFileSync(f, "utf8").includes(value)),
);
const report = {
  recordedAt: new Date().toISOString(),
  candidateFilesChecked: checked,
  clientChunksChecked: chunks.length,
  findings,
  clientFindings,
  scope:
    "Exact configured server secret values and private-key blocks; ignored local state/credentials are intentionally excluded. This is not a complete security audit.",
};
writeFileSync(
  "evidence/secret-scan-results.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report));
if (findings.length || clientFindings.length) process.exitCode = 1;
