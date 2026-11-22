import { z } from "zod";
import { AppError } from "./errors";
import {
  analyze,
  filePriority,
  indexFile,
  isEligible,
  LIMITS,
} from "./analysis";
import type { ImportJob, Snapshot } from "./types";

export function parseGitHubUrl(input: string) {
  if (input.length > 240) throw new AppError("Repository URL is too long.");
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    throw new AppError(
      "Enter a full URL such as https://github.com/owner/repository.",
    );
  }
  if (
    url.protocol !== "https:" ||
    url.hostname !== "github.com" ||
    url.port ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw new AppError(
      "Use a public https://github.com/owner/repository URL without credentials or extra parameters.",
    );
  const match = url.pathname.match(
    /^\/([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))\/([A-Za-z0-9_.-]{1,100})\/?$/,
  );
  if (!match || match[2] === "." || match[2] === "..")
    throw new AppError(
      "Use the repository root URL, without a branch or file path.",
    );
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}
async function boundedText(response: Response, max: number) {
  if (Number(response.headers.get("content-length") ?? 0) > max) {
    await response.body?.cancel();
    throw new AppError(
      "GitHub returned data beyond the import limit.",
      413,
      "SIZE_LIMIT",
    );
  }
  const reader = response.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > max) {
      await reader.cancel();
      throw new AppError(
        "GitHub response exceeded the import limit.",
        413,
        "SIZE_LIMIT",
      );
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}
export async function githubGet(
  endpoint: string,
  max = 3_000_000,
): Promise<unknown> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "Synapse-Learning",
  };
  if (process.env.GITHUB_TOKEN)
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  let response: Response;
  try {
    response = await fetch(`https://api.github.com${endpoint}`, {
      headers,
      redirect: "error",
      signal: AbortSignal.timeout(12_000),
      cache: "no-store",
    });
  } catch {
    throw new AppError(
      "GitHub could not be reached within 12 seconds. Retry this import.",
      503,
      "GITHUB_UNAVAILABLE",
    );
  }
  if (response.status === 404)
    throw new AppError(
      "Repository not found or not public. Check the URL; private repositories are not supported.",
      404,
      "REPO_NOT_FOUND",
    );
  if (response.status === 403 || response.status === 429)
    throw new AppError(
      "GitHub is limiting requests. Wait for its rate limit to reset, or configure a server-side GitHub token.",
      429,
      "GITHUB_RATE_LIMIT",
    );
  if (!response.ok)
    throw new AppError(
      "GitHub could not complete the request. Your saved progress is safe; retry shortly.",
      502,
      "GITHUB_ERROR",
    );
  return JSON.parse(await boundedText(response, max));
}
const repoSchema = z.object({
  private: z.boolean(),
  default_branch: z.string().max(200),
  size: z.number(),
  description: z.string().nullable(),
});
const commitSchema = z.object({ sha: z.string().regex(/^[a-f0-9]{40}$/) });
const treeSchema = z.object({
  truncated: z.boolean(),
  tree: z.array(
    z.object({
      path: z.string(),
      type: z.string(),
      sha: z.string(),
      size: z.number().optional(),
      mode: z.string().optional(),
    }),
  ),
});
export async function beginImport(url: string): Promise<ImportJob> {
  const { owner, repo } = parseGitHubUrl(url);
  const base = `/repos/${owner}/${repo}`;
  const info = repoSchema.parse(await githubGet(base));
  if (info.private)
    throw new AppError(
      "Private repositories are outside this release. Use a public repository.",
      403,
      "PRIVATE_REPO",
    );
  if (info.size > LIMITS.repoKb)
    throw new AppError(
      "This repository is larger than the supported 150 MB repository limit. Try a smaller project.",
      413,
      "SIZE_LIMIT",
    );
  const commit = commitSchema.parse(
    await githubGet(
      `${base}/commits/${encodeURIComponent(info.default_branch)}`,
    ),
  );
  const tree = treeSchema.parse(
    await githubGet(`${base}/git/trees/${commit.sha}?recursive=1`),
  );
  if (tree.tree.length > LIMITS.treeEntries)
    throw new AppError(
      "This repository has more than 15,000 tree entries. Choose a smaller repository.",
      413,
      "SIZE_LIMIT",
    );
  const eligible = tree.tree
    .filter(
      (f) =>
        f.type === "blob" &&
        f.mode !== "120000" &&
        isEligible(f.path, f.size ?? 0),
    )
    .sort(
      (a, b) =>
        filePriority(b.path) - filePriority(a.path) ||
        a.path.localeCompare(b.path),
    );
  if (!eligible.some((f) => /\.[cm]?[jt]sx?$/.test(f.path)))
    throw new AppError(
      "No supported JavaScript or TypeScript implementation files were found. This release prioritizes JS/TS projects.",
      422,
      "UNSUPPORTED_REPO",
    );
  let bytes = 0;
  const queue = eligible
    .filter((f) => {
      if (bytes + (f.size ?? 0) > LIMITS.totalBytes) return false;
      bytes += f.size ?? 0;
      return true;
    })
    .slice(0, LIMITS.files)
    .map((f) => ({ path: f.path, sha: f.sha, size: f.size ?? 0 }));
  return {
    id: crypto.randomUUID(),
    owner,
    repo,
    branch: info.default_branch,
    sha: commit.sha,
    description: info.description ?? "",
    status: "fetching",
    queue,
    files: [],
    cursor: 0,
    total: tree.tree.filter((f) => f.type === "blob").length,
    eligible: eligible.length,
    skipped: tree.truncated
      ? ["GitHub returned a truncated tree; coverage is incomplete."]
      : [],
    createdAt: new Date().toISOString(),
    revision: 0,
  };
}
export async function advanceImport(
  job: ImportJob,
): Promise<{ job: ImportJob; snapshot?: Snapshot }> {
  if (job.status === "complete") return { job };
  const next: ImportJob = {
    ...job,
    files: [...job.files],
    skipped: [...job.skipped],
    status: "fetching",
    error: undefined,
    revision: job.revision + 1,
  };
  const items = job.queue.slice(job.cursor, job.cursor + LIMITS.batch);
  const results = await Promise.allSettled(
    items.map(async (file) => {
      const blob = z
        .object({ content: z.string(), encoding: z.string(), size: z.number() })
        .parse(
          await githubGet(
            `/repos/${job.owner}/${job.repo}/git/blobs/${file.sha}`,
            LIMITS.fileBytes * 2,
          ),
        );
      if (blob.encoding !== "base64" || blob.size > LIMITS.fileBytes)
        throw new AppError("Unsupported or oversized file", 413);
      const buffer = Buffer.from(blob.content, "base64");
      if (buffer.length > LIMITS.fileBytes || buffer.includes(0))
        throw new AppError("Binary or oversized file", 413);
      return indexFile(file.path, buffer.toString("utf8"), file.sha);
    }),
  );
  // Preserve successes but keep a failed batch resumable at the same cursor.
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === "fulfilled") {
      if (!next.files.some((f) => f.path === r.value.path))
        next.files.push(r.value);
    } else if (r.reason instanceof AppError && r.reason.status === 413) {
      next.skipped.push(items[i].path);
    } else {
      next.status = "failed";
      next.error =
        r.reason instanceof AppError
          ? r.reason.message
          : "A source file could not be retrieved. Retry the import.";
    }
  }
  if (next.status === "failed") return { job: next };
  next.cursor += items.length;
  if (next.cursor < next.queue.length) return { job: next };
  if (!next.files.some((f) => /\.[cm]?[jt]sx?$/.test(f.path))) {
    next.status = "failed";
    next.error = "No usable implementation source was retrieved.";
    return { job: next };
  }
  const snapshot = analyze({
    id: job.id,
    owner: job.owner,
    repo: job.repo,
    branch: job.branch,
    sha: job.sha,
    description: job.description,
    files: next.files,
    coverage: {
      total: job.total,
      eligible: job.eligible,
      indexed: next.files.length,
      partial: next.files.length < job.eligible || next.skipped.length > 0,
      skipped: next.skipped,
    },
    createdAt: job.createdAt,
  });
  next.status = "complete";
  next.snapshotId = snapshot.id;
  return { job: next, snapshot };
}
