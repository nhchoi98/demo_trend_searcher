import { join } from "node:path";
import type { FinderConfig } from "./config.ts";
import type { DecisionBackend } from "./llm/backend.ts";
import { triagePaper } from "./loops/triage.ts";
import { fetchByIds } from "./sources/arxiv.ts";
import { readJsonl, Store } from "./store.ts";
import type { DecisionRecord, GoldRecord, Paper, SeenRecord } from "./types.ts";
import { mapLimit } from "./util.ts";

export interface CompareOptions {
  rootDir: string;
  config: FinderConfig;
  /** Challengers to run, in order. Empty = only re-render the benchmark from the existing log. */
  backends: DecisionBackend[];
  /** Replay every paper of this runDate instead of the gold set. */
  date?: string;
  fetchPapers?: (ids: string[]) => Promise<Paper[]>;
}

type Answers = DecisionRecord["answers"];
type Pricing = NonNullable<FinderConfig["models"]["pricing"]>;

const pct = (n: number, d: number): string => (d ? `${Math.round((100 * n) / d)}%` : "-");
const mean = (xs: number[]): number => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0);
const keyOf = (d: { backend: string; model: string } | DecisionBackend): string => `${"backend" in d ? d.backend : d.id}:${d.model}`;

/** USD for one call, or undefined when the model has no price in the config. */
export function costUsd(inputTokens: number, outputTokens: number, model: string, pricing: Pricing | undefined): number | undefined {
  const p = pricing?.[model];
  return p && (inputTokens * p.input + outputTokens * p.output) / 1_000_000;
}

/**
 * Replays papers through challenger backends, logs their answers next to Jev's
 * in decisions.jsonl (same subjectId and inputHash, different backend), and
 * renders reports/bench.md: every backend:model in the log scored against
 * data/gold.jsonl, with tokens and estimated cost. Already-answered
 * (backend, paper) pairs are skipped, so runs accumulate and can be re-run.
 */
export async function compare(options: CompareOptions): Promise<string> {
  const { rootDir, config, backends, date } = options;
  const store = new Store(join(rootDir, "data"));
  const seen = await readJsonl<SeenRecord>(store.papersPath);
  const gold = new Map((await readJsonl<GoldRecord>(store.goldPath)).map((g) => [g.id, g.label]));
  const ids = date ? seen.filter((s) => s.runDate === date).map((s) => s.id) : [...gold.keys()];
  if (ids.length === 0) throw new Error(date ? `no papers with runDate ${date} in ${store.papersPath}` : `no gold labels in ${store.goldPath}`);

  const title = new Map(seen.filter((s) => s.title).map((s) => [s.id, s.title as string]));
  const answered = (key: string, log: DecisionRecord[]): Set<string> => new Set(log.filter((d) => keyOf(d) === key).map((d) => d.subjectId));

  if (backends.length > 0) {
    const log = await readJsonl<DecisionRecord>(store.decisionsPath);
    const done = new Map(backends.map((b) => [keyOf(b), answered(keyOf(b), log)]));
    const todoIds = ids.filter((id) => backends.some((b) => !done.get(keyOf(b))?.has(id)));
    const papers = todoIds.length ? await (options.fetchPapers ?? ((list) => fetchByIds(list, config)))(todoIds) : [];
    for (const p of papers) title.set(p.id, p.title);
    for (const backend of backends) {
      const todo = papers.filter((p) => !done.get(keyOf(backend))?.has(p.id));
      console.log(`[compare] ${ids.length} papers, ${todo.length} to ask ${keyOf(backend)}`);
      const results = await mapLimit(todo, config.concurrency, async (paper) => {
        const { log: records } = await triagePaper(paper, config, backend, undefined);
        await store.appendDecisions(records);
      });
      for (const r of results) if (!r.ok) console.warn(`[compare] ${keyOf(backend)} ${r.item.id} failed:`, r.error instanceof Error ? r.error.message : r.error);
    }
  }

  // Latest record per (model, paper). Jev's own escalation records, if any, are not a model of their own.
  const byModel = new Map<string, Map<string, DecisionRecord>>();
  for (const d of await readJsonl<DecisionRecord>(store.decisionsPath)) {
    if (d.loop !== "triage" || d.escalatedFrom) continue;
    const m = byModel.get(keyOf(d)) ?? new Map<string, DecisionRecord>();
    m.set(d.subjectId, d);
    byModel.set(keyOf(d), m);
  }
  return render(ids, gold, byModel, title, config);
}

function render(ids: string[], gold: Map<string, string>, byModel: Map<string, Map<string, DecisionRecord>>, title: Map<string, string>, config: FinderConfig): string {
  const labels = [...config.gate.include, "irrelevant"];
  const inc = (label: unknown): boolean => config.gate.include.includes(String(label) as never);
  const label = (d: DecisionRecord | undefined): string => String(d?.answers.label?.[0] ?? "?");
  const models = [...byModel.keys()].sort((a, b) => (a.startsWith("jev:") ? -1 : 1) - (b.startsWith("jev:") ? -1 : 1) || a.localeCompare(b));
  const jevKey = models.find((m) => m.startsWith("jev:"));
  const jev = jevKey ? byModel.get(jevKey) : undefined;

  const lines = [
    "# Loop 1 benchmark",
    "",
    `${ids.length} papers, ${gold.size} with a gold label (data/gold.jsonl). Jev's confidences come from its probability distribution; generative models write theirs down themselves, so only labels are compared. "served as" is what the endpoint reported running when it differs from the requested name (a dated snapshot, or the upstream model/provider behind a router). Cost is estimated from models.pricing in finder.config.ts.`,
    "",
    "| model | served as | n (gold) | label acc | include acc | include precision | include recall | in tok | out tok | latency | est. $/1000 papers |",
    "|---|---|---|---|---|---|---|---|---|---|---|",
  ];
  for (const key of models) {
    const m = byModel.get(key) as Map<string, DecisionRecord>;
    const rows = ids.filter((id) => gold.has(id) && m.has(id)).map((id) => [gold.get(id) as string, label(m.get(id))] as const);
    const tp = rows.filter(([g, p]) => inc(g) && inc(p)).length;
    const predInc = rows.filter(([, p]) => inc(p)).length;
    const goldInc = rows.filter(([g]) => inc(g)).length;
    const all = ids.map((id) => m.get(id)).filter((d): d is DecisionRecord => d !== undefined);
    const inTok = mean(all.map((d) => d.inputTokens));
    const outTok = mean(all.map((d) => d.outputTokens ?? 0));
    const lat = all.filter((d) => d.latencyMs !== undefined).map((d) => d.latencyMs as number);
    const usd = costUsd(inTok, outTok, key.slice(key.indexOf(":") + 1), config.models.pricing);
    const served = [...new Set(all.map((d) => d.served).filter(Boolean))].join(", ") || "-";
    lines.push(
      `| ${key} | ${served} | ${rows.length} | ${pct(rows.filter(([g, p]) => g === p).length, rows.length)} | ${pct(rows.filter(([g, p]) => inc(g) === inc(p)).length, rows.length)} | ${pct(tp, predInc)} | ${pct(tp, goldInc)} | ${Math.round(inTok)} | ${Math.round(outTok)} | ${lat.length ? `${Math.round(mean(lat))} ms` : "-"} | ${usd === undefined ? "-" : `$${(usd * 1000).toFixed(2)}`} |`,
    );
  }

  for (const key of models) {
    const m = byModel.get(key) as Map<string, DecisionRecord>;
    const rows = ids.filter((id) => gold.has(id) && m.has(id));
    if (rows.length === 0) continue;
    lines.push("", `## ${key}: label confusion (rows gold, columns ${key})`, "", `| | ${labels.join(" | ")} |`, `|---|${labels.map(() => "---").join("|")}|`);
    for (const g of labels) lines.push(`| ${g} | ${labels.map((p) => rows.filter((id) => gold.get(id) === g && label(m.get(id)) === p).length).join(" | ")} |`);
  }

  if (jev) {
    for (const key of models) {
      if (key === jevKey) continue;
      const m = byModel.get(key) as Map<string, DecisionRecord>;
      const diff = ids.filter((id) => jev.has(id) && m.has(id) && label(jev.get(id)) !== label(m.get(id)));
      lines.push("", `## ${jevKey} vs ${key}: label disagreements (${diff.length})`, "", "| id | gold | Jev | other | title |", "|---|---|---|---|---|");
      for (const id of diff) {
        const [jl, jc] = jev.get(id)?.answers.label ?? ["?", 0];
        const [ol, oc] = m.get(id)?.answers.label ?? ["?", 0];
        lines.push(`| [${id}](https://arxiv.org/abs/${id}) | ${gold.get(id) ?? "-"} | ${jl} (${jc}) | ${ol} (${oc}) | ${title.get(id) ?? ""} |`);
      }
    }
  }
  return lines.join("\n") + "\n";
}
