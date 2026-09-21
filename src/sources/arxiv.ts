import { XMLParser } from "fast-xml-parser";
import type { FinderConfig, TopicConfig } from "../config.ts";
import type { Paper } from "../types.ts";
import { collapseWhitespace, sleep } from "../util.ts";

const API = "https://export.arxiv.org/api/query";

export function buildQuery(topic: TopicConfig, categories: readonly string[]): string {
  const phrases = topic.phrases
    .map((p) => `ti:"${p}" OR abs:"${p}"`)
    .join(" OR ");
  if (categories.length === 0) return `(${phrases})`;
  const cats = categories.map((c) => `cat:${c}`).join(" OR ");
  return `(${phrases}) AND (${cats})`;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  // These can legitimately appear once or many times per entry.
  isArray: (name) => ["entry", "author", "category", "link"].includes(name),
});

interface AtomEntry {
  id: string;
  title: string;
  summary: string;
  published: string;
  updated: string;
  author?: Array<{ name: string }>;
  category?: Array<{ "@_term": string }>;
  link?: Array<{ "@_href": string; "@_title"?: string; "@_rel"?: string }>;
}

/** Parse an arXiv Atom feed. Exported separately so it can be tested offline. */
export function parseFeed(xml: string, topicKey: string): Paper[] {
  const doc = parser.parse(xml) as { feed?: { entry?: AtomEntry[] } };
  const entries = doc.feed?.entry ?? [];
  const papers: Paper[] = [];
  for (const entry of entries) {
    // id looks like http://arxiv.org/abs/2501.03575v2 (or abs/cs/0112017v1 for old ids)
    const match = /abs\/(.+?)(?:v(\d+))?$/.exec(String(entry.id));
    if (!match?.[1]) continue;
    const id = match[1];
    const pdf = entry.link?.find((l) => l["@_title"] === "pdf")?.["@_href"];
    papers.push({
      id,
      version: match[2] ? Number(match[2]) : 1,
      title: collapseWhitespace(String(entry.title)),
      abstract: collapseWhitespace(String(entry.summary)),
      authors: (entry.author ?? []).map((a) => collapseWhitespace(String(a.name))),
      published: String(entry.published),
      updated: String(entry.updated),
      categories: (entry.category ?? []).map((c) => c["@_term"]),
      url: `https://arxiv.org/abs/${id}`,
      pdfUrl: pdf ?? `https://arxiv.org/pdf/${id}`,
      matchedTopics: [topicKey],
    });
  }
  return papers;
}

async function fetchWithRetry(url: string, attempts = 3): Promise<string> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "trend-finder (https://github.com; daily research digest)" },
        signal: AbortSignal.timeout(30_000),
      });
      if (response.ok) return await response.text();
      lastError = new Error(`arXiv responded ${response.status}`);
      // 4xx other than 429 will not get better by retrying.
      if (response.status < 500 && response.status !== 429) break;
    } catch (error) {
      lastError = error;
    }
    await sleep(5_000 * attempt);
  }
  throw lastError;
}

/**
 * Query every topic, keep papers submitted inside the lookback window, and
 * merge papers hit by several topics into one record.
 */
export async function fetchArxiv(config: FinderConfig, now: Date = new Date()): Promise<Paper[]> {
  const since = now.getTime() - config.arxiv.lookbackDays * 86_400_000;
  const byId = new Map<string, Paper>();

  for (const [index, topic] of config.topics.entries()) {
    if (index > 0) await sleep(config.arxiv.requestDelayMs);
    const params = new URLSearchParams({
      search_query: buildQuery(topic, config.arxiv.categories),
      sortBy: "submittedDate",
      sortOrder: "descending",
      start: "0",
      max_results: String(config.arxiv.maxResultsPerTopic),
    });
    const xml = await fetchWithRetry(`${API}?${params}`);
    const papers = parseFeed(xml, topic.key);
    let kept = 0;
    for (const paper of papers) {
      if (Date.parse(paper.published) < since) continue;
      kept++;
      const existing = byId.get(paper.id);
      if (existing) {
        if (!existing.matchedTopics.includes(topic.key)) existing.matchedTopics.push(topic.key);
      } else {
        byId.set(paper.id, paper);
      }
    }
    console.log(`[arxiv] ${topic.key}: ${papers.length} fetched, ${kept} inside ${config.arxiv.lookbackDays}d window`);
    if (papers.length === config.arxiv.maxResultsPerTopic && kept === papers.length) {
      console.warn(`[arxiv] ${topic.key}: window may be truncated; raise maxResultsPerTopic or narrow phrases`);
    }
  }
  return [...byId.values()];
}
