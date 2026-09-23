import { join } from "node:path";
import type { FinderConfig } from "./config.ts";
import type { DecisionBackend } from "./llm/backend.ts";
import { triagePaper } from "./loops/triage.ts";
import { fetchByIds } from "./sources/arxiv.ts";
import { readJsonl, Store } from "./store.ts";
import type { DecisionRecord, Paper, SeenRecord } from "./types.ts";
import { mapLimit } from "./util.ts";

export interface CompareOptions {
  rootDir: string;
  config: FinderConfig;
  /** The challenger. Jev's records for the same papers are already in decisions.jsonl. */
  backend: DecisionBackend;
  /** runDate of the papers to replay. */
  date: string;
  fetchPapers?: (ids: string[]) => Promise<Paper[]>;
}

type Answers = DecisionRecord["answers"];

const pct = (n: number, d: number): string => (d ? `${Math.round((100 * n) / d)}%` : "-");

/**
 * Replays one day's papers through another decision backend, logs its answers
 * next to Jev's in decisions.jsonl (same subjectId and inputHash, different
 * backend), and renders where the two disagree. Already-answered papers are
 * skipped, so a failed run can simply be re-run.
 */
export async function compare(options: CompareOptions): Promise<string> {
  const { rootDir, config, backend, date } = options;
  const store = new Store(join(rootDir, "data"));
  const ids = (await readJsonl<SeenRecord>(store.papersPath)).filter((s) => s.runDate === date).map((s) => s.id);
  if (ids.length === 0) throw new Error(`no papers with runDate ${date} in ${store.papersPath}`);

  const isChallenger = (d: DecisionRecord): boolean => d.backend === backend.id && d.model === backend.model;
  const done = new Set((await readJsonl<DecisionRecord>(store.decisionsPath)).filter(isChallenger).map((d) => d.subjectId));
  const papers = await (options.fetchPapers ?? ((list) => fetchByIds(list, config)))(ids);
  const todo = papers.filter((p) => !done.has(p.id));
  console.log(`[compare] ${date}: ${ids.length} papers, ${todo.length} to ask ${backend.id}:${backend.model}`);

  const results = await mapLimit(todo, config.concurrency, async (paper) => {
    const { log } = await triagePaper(paper, config, backend, undefined);
    await store.appendDecisions(log);
  });
  for (const r of results) if (!r.ok) console.warn(`[compare] ${r.item.id} failed:`, r.error instanceof Error ? r.error.message : r.error);

  // Latest record per (paper, side). Jev's own escalation records, if any, are not the baseline.
  const jev = new Map<string, Answers>();
  const other = new Map<string, Answers>();
  for (const d of await readJsonl<DecisionRecord>(store.decisionsPath)) {
    if (d.backend === "jev" && !d.escalatedFrom) jev.set(d.subjectId, d.answers);
    else if (isChallenger(d)) other.set(d.subjectId, d.answers);
  }
  const title = new Map(papers.map((p) => [p.id, p.title]));
  return render(ids.filter((id) => jev.has(id) && other.has(id)), jev, other, title, backend, config);
}

function render(
  ids: string[],
  jev: Map<string, Answers>,
  other: Map<string, Answers>,
  title: Map<string, string>,
  backend: DecisionBackend,
  config: FinderConfig,
): string {
  const a = (m: Map<string, Answers>, id: string, q: string): [string | number | boolean, number] => m.get(id)?.[q] ?? ["?", 0];
  const agree = (q: string): number => ids.filter((id) => a(jev, id, q)[0] === a(other, id, q)[0]).length;
  const inc = (m: Map<string, Answers>, id: string): boolean => config.gate.include.includes(String(a(m, id, "label")[0]) as never);
  const sigDiff = ids.map((id) => Math.abs(Number(a(jev, id, "significance")[0]) - Number(a(other, id, "significance")[0])));
  const labels = [...config.gate.include, "irrelevant"];

  const lines = [
    `# Jev vs ${backend.id}:${backend.model}`,
    "",
    `${ids.length} papers answered by both. Jev is the baseline; the other column is a generative model imitating the same questions, so its confidences are self-reported and not comparable.`,
    "",
    "| question | agreement |",
    "|---|---|",
    ...["label", "topic", "contribution"].map((q) => `| ${q} | ${pct(agree(q), ids.length)} |`),
    `| include (label in ${config.gate.include.join("/")}) | ${pct(ids.filter((id) => inc(jev, id) === inc(other, id)).length, ids.length)} |`,
    `| significance, mean abs level diff | ${(sigDiff.reduce((s, d) => s + d, 0) / (ids.length || 1)).toFixed(2)} |`,
    "",
    "## label confusion (rows Jev, columns other)",
    "",
    `| | ${labels.join(" | ")} |`,
    `|---|${labels.map(() => "---").join("|")}|`,
    ...labels.map(
      (row) => `| ${row} | ${labels.map((col) => ids.filter((id) => a(jev, id, "label")[0] === row && a(other, id, "label")[0] === col).length).join(" | ")} |`,
    ),
    "",
    "## label disagreements",
    "",
    "| id | Jev | other | title |",
    "|---|---|---|---|",
  ];
  for (const id of ids) {
    const [jl, jc] = a(jev, id, "label");
    const [ol, oc] = a(other, id, "label");
    if (jl === ol) continue;
    lines.push(`| [${id}](https://arxiv.org/abs/${id}) | ${jl} (${jc}) | ${ol} (${oc}) | ${title.get(id) ?? ""} |`);
  }
  return lines.join("\n") + "\n";
}
