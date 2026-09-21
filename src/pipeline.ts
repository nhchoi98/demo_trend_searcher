import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FinderConfig } from "./config.ts";
import type { DecisionBackend, TextBackend } from "./llm/backend.ts";
import { judgeRelevance } from "./loops/relevance.ts";
import { summarize } from "./loops/summarize.ts";
import { renderMarkdown, type RunStats } from "./report.ts";
import { buildCard, postToTeams } from "./sinks/teams.ts";
import { fetchArxiv } from "./sources/arxiv.ts";
import { Store } from "./store.ts";
import type { DecisionRecord, Paper, ReportItem, SeenRecord } from "./types.ts";
import { localDate, mapLimit } from "./util.ts";

export interface Backends {
  decide: DecisionBackend;
  escalate?: DecisionBackend;
  text: TextBackend;
}

export interface RunOptions {
  config: FinderConfig;
  rootDir: string;
  dryRun: boolean;
  /** Required unless dryRun. */
  backends?: Backends;
  teamsWebhookUrl?: string;
  reportBaseUrl?: string;
  /** Injectable for tests. */
  fetchPapers?: (config: FinderConfig) => Promise<Paper[]>;
  now?: Date;
}

export interface RunResult {
  date: string;
  stats: RunStats;
  items: ReportItem[];
  reportPath?: string;
  sinkError?: unknown;
}

interface Processed {
  seen: SeenRecord;
  log: DecisionRecord[];
  item?: ReportItem;
}

export async function run(options: RunOptions): Promise<RunResult> {
  const { config, rootDir, dryRun } = options;
  const date = localDate(config.report.timezone, options.now);
  const store = new Store(join(rootDir, "data"));

  const fetched = await (options.fetchPapers ?? fetchArxiv)(config);
  const seenIds = await store.loadSeenIds();
  const fresh = fetched.filter((p) => !seenIds.has(p.id));
  console.log(`[run] ${date}: ${fetched.length} fetched, ${fresh.length} new`);

  if (dryRun) {
    for (const p of fresh) console.log(`  - ${p.id} [${p.matchedTopics.join(",")}] ${p.title}`);
    return { date, stats: { fetched: fetched.length, fresh: fresh.length, failed: 0 }, items: [] };
  }

  const backends = options.backends;
  if (!backends) throw new Error("backends are required unless dryRun is set");

  const results = await mapLimit(fresh, config.concurrency, async (paper): Promise<Processed> => {
    const { decision, log } = await judgeRelevance(paper, config, backends.decide, backends.escalate);
    const include = config.gate.include.includes(decision.value.label);
    const summary = include ? await summarize(paper, config, backends.text) : undefined;
    return {
      log,
      seen: {
        id: paper.id,
        version: paper.version,
        title: paper.title,
        url: paper.url,
        published: paper.published,
        matchedTopics: paper.matchedTopics,
        label: decision.value.label,
        tags: decision.value.tags,
        confidence: decision.confidence,
        reported: include,
        runDate: date,
      },
      ...(summary
        ? { item: { paper, relevance: decision.value, confidence: decision.confidence, summary } }
        : {}),
    };
  });

  const done: Processed[] = [];
  let failed = 0;
  for (const result of results) {
    if (result.ok) {
      done.push(result.value);
    } else {
      // Not marked as seen, so the next run picks it up again.
      failed++;
      console.error(`[run] ${result.item.id} failed:`, result.error instanceof Error ? result.error.message : result.error);
    }
  }

  const items = done.flatMap((d) => (d.item ? [d.item] : []));
  const stats: RunStats = { fetched: fetched.length, fresh: fresh.length, failed };

  // Persist state BEFORE notifying: a failed Teams post must not cause the
  // same papers to be summarized and posted again tomorrow.
  await store.appendDecisions(done.flatMap((d) => d.log));
  await store.appendSeen(done.map((d) => d.seen));

  if (items.length === 0) {
    console.log("[run] nothing to report today");
    return { date, stats, items };
  }

  const reportsDir = join(rootDir, "reports");
  await mkdir(reportsDir, { recursive: true });
  const reportPath = join(reportsDir, `${date}.md`);
  await writeFile(reportPath, renderMarkdown(date, items, stats, config), "utf8");
  console.log(`[run] wrote ${reportPath} (${items.length} papers)`);

  let sinkError: unknown;
  if (options.teamsWebhookUrl) {
    const reportUrl = options.reportBaseUrl ? `${options.reportBaseUrl.replace(/\/$/, "")}/${date}.md` : undefined;
    try {
      await postToTeams(options.teamsWebhookUrl, buildCard(date, items, stats, config, reportUrl));
      console.log("[run] posted to Teams");
    } catch (error) {
      sinkError = error;
      console.error("[run] Teams post failed:", error instanceof Error ? error.message : error);
    }
  }
  return { date, stats, items, reportPath, ...(sinkError ? { sinkError } : {}) };
}
