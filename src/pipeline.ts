import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FinderConfig } from "./config.ts";
import type { DecisionBackend, TextBackend } from "./llm/backend.ts";
import { triagePaper } from "./loops/triage.ts";
import { summarize } from "./loops/summarize.ts";
import { renderMarkdown, type RunStats } from "./report.ts";
import { buildCard, postToTeams } from "./sinks/teams.ts";
import { fetchArxiv } from "./sources/arxiv.ts";
import { authorHIndex } from "./sources/semanticscholar.ts";
import { costUsd } from "./compare.ts";
import { Store } from "./store.ts";
import type { Paper, ReportItem, SeenRecord } from "./types.ts";
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
  semanticScholarApiKey?: string;
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
  item: ReportItem;
}

export async function run(options: RunOptions): Promise<RunResult> {
  const { config, rootDir, dryRun } = options;
  const date = localDate(config.report.timezone, options.now);
  const store = new Store(join(rootDir, "data"));

  const fetched = options.fetchPapers ? await options.fetchPapers(config) : await fetchArxiv(config, options.now);
  const seenIds = await store.loadSeenIds();
  const fresh = fetched
    .filter((p) => !seenIds.has(p.id))
    .sort((a, b) => Date.parse(b.published) - Date.parse(a.published));
  // Cost guard. Deferred papers stay unseen, so later runs pick them up.
  const batch = fresh.slice(0, config.gate.maxNewPerRun);
  const deferred = fresh.length - batch.length;
  console.log(`[run] ${date}: ${fetched.length} fetched, ${fresh.length} new` + (deferred ? `, ${deferred} deferred to the next run` : ""));

  const baseStats = { fetched: fetched.length, fresh: fresh.length, deferred };
  if (dryRun) {
    for (const p of batch) console.log(`  - ${p.id} [${p.matchedTopics.join(",") || "-"}] ${p.title}`);
    return { date, stats: { ...baseStats, failed: 0 }, items: [] };
  }

  const backends = options.backends;
  if (!backends) throw new Error("backends are required unless dryRun is set");

  // Author track record: one batch lookup for the whole run. Papers Semantic Scholar
  // has not indexed yet, or a failed lookup, just leave the author term out of priority.
  let hIndex = new Map<string, number>();
  if (config.gate.priorityWeights.author > 0) {
    try {
      hIndex = await authorHIndex(
        batch.map((p) => p.id),
        options.semanticScholarApiKey ? { apiKey: options.semanticScholarApiKey } : {},
      );
      console.log(`[run] author h-index known for ${hIndex.size}/${batch.length} papers`);
    } catch (error) {
      console.warn("[run] Semantic Scholar lookup failed; priority uses label and significance only:", error instanceof Error ? error.message : error);
    }
  }

  // Decision-backend usage per "backend:model", for a cost line at the end of the run.
  const usage = new Map<string, { calls: number; inputTokens: number; outputTokens: number; model: string }>();

  const results = await mapLimit(batch, config.concurrency, async (paper): Promise<Processed | undefined> => {
    const h = hIndex.get(paper.id);
    const { triage, log } = await triagePaper(paper, config, backends.decide, backends.escalate, h !== undefined ? { authorHIndex: h } : {});
    await store.appendDecisions(log);
    for (const record of log) {
      const key = `${record.backend}:${record.model}`;
      const entry = usage.get(key) ?? { calls: 0, inputTokens: 0, outputTokens: 0, model: record.model };
      entry.calls++;
      entry.inputTokens += record.inputTokens;
      entry.outputTokens += record.outputTokens ?? 0;
      usage.set(key, entry);
    }
    const seen: SeenRecord = {
      id: paper.id,
      version: paper.version,
      label: triage.label,
      confidence: triage.labelConfidence,
      includeProbability: triage.includeProbability,
      matchedTopics: paper.matchedTopics,
      ...(triage.authorHIndex !== undefined ? { authorHIndex: triage.authorHIndex } : {}),
      reported: false,
      runDate: date,
    };
    if (!triage.included) {
      // Rejected papers are the bulk of a "category" run and need nothing more:
      // record them right away so a crash later does not pay for them twice.
      await store.appendSeen([seen]);
      return undefined;
    }
    const summary = await summarize(paper, config, backends.text);
    return {
      item: { paper, triage, summary },
      seen: {
        ...seen,
        reported: true,
        title: paper.title,
        url: paper.url,
        published: paper.published,
        topic: triage.topic,
        tags: triage.tags,
        contribution: triage.contribution,
        significance: triage.significance,
        priority: triage.priority,
        ...(triage.borderline ? { borderline: true } : {}),
      },
    };
  });

  const done: Processed[] = [];
  let failed = 0;
  for (const result of results) {
    if (result.ok) {
      if (result.value) done.push(result.value);
    } else {
      // Not marked as seen, so the next run picks it up again.
      failed++;
      console.error(`[run] ${result.item.id} failed:`, result.error instanceof Error ? result.error.message : result.error);
    }
  }

  for (const [key, u] of usage) {
    const usd = costUsd(u.inputTokens, u.outputTokens, u.model, config.models.pricing);
    console.log(`[run] loop 1 usage ${key}: ${u.calls} calls, ${u.inputTokens} input tokens` + (usd === undefined ? "" : `, est. $${usd.toFixed(2)}`));
  }

  const items = done.map((d) => d.item);
  const stats: RunStats = {
    ...baseStats,
    failed,
    // Only meaningful when collection was not keyword-filtered to begin with.
    ...(config.arxiv.mode === "category"
      ? { keywordMissed: items.filter((i) => i.paper.matchedTopics.length === 0).length }
      : {}),
  };

  // Reported papers are persisted only now, together, and BEFORE notifying:
  // a failed Teams post must not cause them to be summarized and posted again,
  // and a crash mid-run must not mark a paper "reported" that never reached a report.
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
