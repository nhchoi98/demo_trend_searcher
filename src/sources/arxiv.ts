import { XMLParser } from "fast-xml-parser";
import type { FinderConfig, TopicConfig } from "../config.ts";
import type { Paper } from "../types.ts";
import { collapseWhitespace, sleep } from "../util.ts";

const API = "https://export.arxiv.org/api/query";

function categoryClause(categories: readonly string[]): string {
  return `(${categories.map((c) => `cat:${c}`).join(" OR ")})`;
}

/** "keyword" mode query: topic phrases in title/abstract, restricted to categories. */
export function buildQuery(topic: TopicConfig, categories: readonly string[]): string {
  const phrases = topic.phrases.map((p) => `ti:"${p}" OR abs:"${p}"`).join(" OR ");
  if (categories.length === 0) return `(${phrases})`;
  return `(${phrases}) AND ${categoryClause(categories)}`;
}

/** arXiv's submittedDate filter wants GMT as YYYYMMDDHHMM. */
function stamp(date: Date): string {
  return date.toISOString().replace(/[-:T]/g, "").slice(0, 12);
}

/** "category" mode query: everything submitted to the categories inside the window. */
export function buildCategoryQuery(categories: readonly string[], since: Date, until: Date): string {
  return `${categoryClause(categories)} AND submittedDate:[${stamp(since)} TO ${stamp(until)}]`;
}

/**
 * Which topics would a keyword search have matched? Computed locally so that in
 * "category" mode every paper still records whether keyword mode would have found it.
 */
export function matchTopics(paper: Pick<Paper, "title" | "abstract">, topics: readonly TopicConfig[]): string[] {
  const haystack = `${paper.title} ${paper.abstract}`.toLowerCase();
  return topics.filter((t) => t.phrases.some((p) => haystack.includes(p.toLowerCase()))).map((t) => t.key);
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

export interface ParsedFeed {
  papers: Paper[];
  /** Total matches reported by arXiv, or undefined if the feed did not say. */
  totalResults: number | undefined;
}

export function parseFeedPage(xml: string, matchedTopics: readonly string[]): ParsedFeed {
  const doc = parser.parse(xml) as { feed?: { entry?: AtomEntry[]; "opensearch:totalResults"?: unknown } };
  const rawTotal = doc.feed?.["opensearch:totalResults"];
  // The element carries an xmlns attribute, so it parses to { "#text": n, ... }.
  const totalValue = typeof rawTotal === "object" && rawTotal !== null ? (rawTotal as Record<string, unknown>)["#text"] : rawTotal;
  const total = Number(totalValue);

  const papers: Paper[] = [];
  for (const entry of doc.feed?.entry ?? []) {
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
      matchedTopics: [...matchedTopics],
    });
  }
  return { papers, totalResults: Number.isFinite(total) && totalValue !== undefined ? total : undefined };
}

/** Parse an arXiv Atom feed. Exported separately so it can be tested offline. */
export function parseFeed(xml: string, topicKey: string): Paper[] {
  return parseFeedPage(xml, [topicKey]).papers;
}

export type FetchText = (url: string) => Promise<string>;

export async function fetchWithRetry(url: string, attempts = 3): Promise<string> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "trend-finder (https://github.com; daily research digest)" },
        signal: AbortSignal.timeout(60_000),
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

function queryUrl(searchQuery: string, start: number, maxResults: number): string {
  const params = new URLSearchParams({
    search_query: searchQuery,
    sortBy: "submittedDate",
    sortOrder: "descending",
    start: String(start),
    max_results: String(maxResults),
  });
  return `${API}?${params}`;
}

/** One query per topic; papers hit by several topics are merged into one record. */
async function fetchByKeyword(config: FinderConfig, since: Date, fetchText: FetchText): Promise<Paper[]> {
  const byId = new Map<string, Paper>();
  for (const [index, topic] of config.topics.entries()) {
    if (index > 0) await sleep(config.arxiv.requestDelayMs);
    const xml = await fetchText(queryUrl(buildQuery(topic, config.arxiv.categories), 0, config.arxiv.maxResultsPerTopic));
    const papers = parseFeed(xml, topic.key);
    let kept = 0;
    for (const paper of papers) {
      if (Date.parse(paper.published) < since.getTime()) continue;
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

/** Page through everything submitted to the categories inside the window. */
async function fetchByCategory(config: FinderConfig, since: Date, until: Date, fetchText: FetchText): Promise<Paper[]> {
  const { categories, pageSize, maxPapers, requestDelayMs } = config.arxiv;
  if (categories.length === 0) throw new Error(`arxiv.mode "category" needs at least one category`);
  const query = buildCategoryQuery(categories, since, until);
  const byId = new Map<string, Paper>();
  let total: number | undefined;
  let start = 0;
  let emptyRetries = 0;

  while (start < maxPapers) {
    if (start > 0 || emptyRetries > 0) await sleep(requestDelayMs);
    const page = parseFeedPage(await fetchText(queryUrl(query, start, pageSize)), []);
    total = page.totalResults ?? total;

    if (page.papers.length === 0) {
      // The arXiv API intermittently returns an empty page in the middle of a
      // result set. Only believe it when the reported total agrees.
      const expectMore = total !== undefined && start < total;
      if (expectMore && emptyRetries < 3) {
        emptyRetries++;
        console.warn(`[arxiv] empty page at start=${start} (total ${total}); retry ${emptyRetries}/3`);
        continue;
      }
      if (expectMore) throw new Error(`arXiv kept returning an empty page at start=${start} of ${total}`);
      break;
    }
    emptyRetries = 0;

    for (const paper of page.papers) {
      if (byId.has(paper.id)) continue;
      paper.matchedTopics = matchTopics(paper, config.topics);
      byId.set(paper.id, paper);
    }
    start += page.papers.length;
    if (total !== undefined && start >= total) break;
  }

  console.log(`[arxiv] category mode: ${byId.size} papers in ${config.arxiv.lookbackDays}d window (arXiv total ${total ?? "?"})`);
  if (total !== undefined && total > maxPapers) {
    console.warn(`[arxiv] window holds ${total} papers but maxPapers is ${maxPapers}; the oldest were not fetched`);
  }
  return [...byId.values()];
}

export async function fetchArxiv(
  config: FinderConfig,
  now: Date = new Date(),
  fetchText: FetchText = fetchWithRetry,
): Promise<Paper[]> {
  const since = new Date(now.getTime() - config.arxiv.lookbackDays * 86_400_000);
  return config.arxiv.mode === "category"
    ? fetchByCategory(config, since, now, fetchText)
    : fetchByKeyword(config, since, fetchText);
}

/** Re-fetch known papers by id (for replaying decisions on another backend). */
export async function fetchByIds(ids: readonly string[], config: FinderConfig, fetchText: FetchText = fetchWithRetry): Promise<Paper[]> {
  const out: Paper[] = [];
  for (let i = 0; i < ids.length; i += 100) {
    if (i > 0) await sleep(config.arxiv.requestDelayMs);
    const chunk = ids.slice(i, i + 100);
    const params = new URLSearchParams({ id_list: chunk.join(","), max_results: String(chunk.length) });
    for (const paper of parseFeedPage(await fetchText(`${API}?${params}`), []).papers) {
      paper.matchedTopics = matchTopics(paper, config.topics);
      out.push(paper);
    }
  }
  return out;
}
