import { sleep } from "../util.ts";

const API = "https://api.semanticscholar.org/graph/v1/paper/batch";
const BATCH = 500;

export interface S2Paper {
  citationCount?: number;
  influentialCitationCount?: number;
  authors?: Array<{ hIndex?: number | null; affiliations?: string[] | null }>;
}

export interface AuthorSignals {
  /** Highest h-index among the authors. */
  hIndex: number;
  /** Distinct affiliations, in author order. Often empty: Semantic Scholar rarely has them. */
  affiliations: string[];
}

export interface LookupOptions {
  apiKey?: string;
  fetchImpl?: typeof fetch;
}

/**
 * One POST per 500 arXiv ids. Papers Semantic Scholar has not indexed yet
 * (common in the first days after submission) are absent from the result.
 */
export async function lookup(ids: readonly string[], fields: string, options: LookupOptions = {}): Promise<Map<string, S2Paper>> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const out = new Map<string, S2Paper>();
  for (let i = 0; i < ids.length; i += BATCH) {
    const chunk = ids.slice(i, i + BATCH);
    if (i > 0) await sleep(1000); // the shared unauthenticated pool allows about one request per second
    const post = (): Promise<Response> =>
      fetchImpl(`${API}?fields=${fields}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(options.apiKey ? { "x-api-key": options.apiKey } : {}) },
        body: JSON.stringify({ ids: chunk.map((id) => `ARXIV:${id}`) }),
        signal: AbortSignal.timeout(30_000),
      });
    let response = await post();
    if (response.status === 429) {
      // Even keyed requests get throttled right after a burst; one patient retry usually clears it.
      await sleep(5_000);
      response = await post();
    }
    if (!response.ok) {
      const detail = (await response.text().catch(() => "")).slice(0, 200);
      throw new Error(`Semantic Scholar responded ${response.status}: ${detail}`);
    }
    const rows = (await response.json()) as Array<S2Paper | null>;
    rows.forEach((row, j) => {
      if (row) out.set(chunk[j] as string, row);
    });
  }
  return out;
}

/** Author h-index and affiliations, for every paper Semantic Scholar knows. One batch call. */
export async function authorSignals(ids: readonly string[], options: LookupOptions = {}): Promise<Map<string, AuthorSignals>> {
  const rows = await lookup(ids, "authors.hIndex,authors.affiliations", options);
  return new Map(
    [...rows].map(([id, row]) => {
      const authors = row.authors ?? [];
      return [id, { hIndex: Math.max(0, ...authors.map((a) => a.hIndex ?? 0)), affiliations: [...new Set(authors.flatMap((a) => a.affiliations ?? []))] }];
    }),
  );
}
