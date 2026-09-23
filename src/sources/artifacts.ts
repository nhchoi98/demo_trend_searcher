import type { Paper } from "../types.ts";

export interface Artifact {
  url: string;
  /** SPDX id or Hugging Face license tag. Absent when the repo declares none. */
  license?: string;
}

/** Public code, model weights and a representative image for a reported paper. */
export interface Artifacts {
  code?: Artifact;
  weights?: Artifact;
  /** Figure 1 from the arXiv HTML page, else the first image of the code repo's README. */
  imageUrl?: string;
}

export interface ArtifactOptions {
  /** Raises the GitHub API limit from 60 to 5000 requests per hour. */
  githubToken?: string;
  fetchImpl?: typeof fetch;
}

const GITHUB = /https?:\/\/(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]*[\w-])/;
const HF_MODEL = /https?:\/\/huggingface\.co\/(?!papers|datasets|spaces|docs|blog|collections)([\w.-]+\/[\w.-]+)/;

async function getJson<T>(fetchImpl: typeof fetch, url: string, headers: Record<string, string>): Promise<T | undefined> {
  const response = await fetchImpl(url, { headers: { "User-Agent": "trend-finder", ...headers }, signal: AbortSignal.timeout(20_000) });
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error(`${url} responded ${response.status}`);
  return (await response.json()) as T;
}

const BADGE = /shields\.io|badge|\.svg(?:[?#]|$)/i;

/** First real (non-badge) markdown or HTML image in a README, made absolute against the repo. */
export function readmeImage(readme: string, owner: string, repo: string): string | undefined {
  const sources = [...readme.matchAll(/!\[[^\]]*\]\(\s*<?([^)\s>]+)|<img[^>]+src=["']([^"']+)/gi)].map((m) => (m[1] ?? m[2]) as string);
  const src = sources.find((s) => !BADGE.test(s));
  if (!src) return undefined;
  return /^https?:/.test(src) ? src : `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${src.replace(/^\.?\//, "")}`;
}

/**
 * Best-effort, for reported papers only (a handful per day). Each lookup that
 * fails is logged and left out; nothing here can fail the run.
 */
export async function fetchArtifacts(paper: Paper, links: readonly string[], options: ArtifactOptions = {}): Promise<Artifacts> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const text = `${paper.abstract} ${links.join(" ")}`;
  const out: Artifacts = {};
  const attempt = async (what: string, fn: () => Promise<void>): Promise<void> => {
    try {
      await fn();
    } catch (error) {
      console.warn(`[artifacts] ${paper.id} ${what}: ${error instanceof Error ? error.message : error}`);
    }
  };

  const gh = GITHUB.exec(text);
  if (gh) {
    const [, owner, repo] = gh as unknown as [string, string, string];
    const name = `${owner}/${repo.replace(/\.git$/, "")}`;
    const headers = { Accept: "application/vnd.github+json", ...(options.githubToken ? { Authorization: `Bearer ${options.githubToken}` } : {}) };
    await attempt("github", async () => {
      const info = await getJson<{ html_url: string; license?: { spdx_id?: string } | null }>(fetchImpl, `https://api.github.com/repos/${name}`, headers);
      if (!info) return;
      const spdx = info.license?.spdx_id;
      out.code = { url: info.html_url, ...(spdx && spdx !== "NOASSERTION" ? { license: spdx } : {}) };
      const readme = await getJson<{ content?: string }>(fetchImpl, `https://api.github.com/repos/${name}/readme`, headers);
      const image = readme?.content && readmeImage(Buffer.from(readme.content, "base64").toString("utf8"), owner, repo);
      if (image) out.imageUrl = image;
    });
  }

  await attempt("huggingface", async () => {
    const linked = await getJson<{ models?: Array<{ id: string; tags?: string[] }> }>(fetchImpl, `https://huggingface.co/api/arxiv/${paper.id}/repos`, {});
    const model = linked?.models?.[0];
    const id = model?.id ?? HF_MODEL.exec(text)?.[1];
    if (!id) return;
    const tags = model?.tags ?? (await getJson<{ tags?: string[] }>(fetchImpl, `https://huggingface.co/api/models/${id}`, {}))?.tags ?? [];
    const license = tags.find((t) => t.startsWith("license:"))?.slice("license:".length);
    out.weights = { url: `https://huggingface.co/${id}`, ...(license ? { license } : {}) };
  });
  return out;
}
