import type { FinderConfig } from "./config.ts";
import type { Paper, ReportItem } from "./types.ts";

export interface RunStats {
  fetched: number;
  fresh: number;
  failed: number;
  /** New papers left for a later run by gate.maxNewPerRun. */
  deferred: number;
  /** "category" mode only: reported papers that no topic phrase would have matched. */
  keywordMissed?: number;
}

interface Labels {
  title: string;
  keywordMiss: string;
  borderline: string;
  stats: (s: RunStats, reported: number) => string;
  none: string;
  other: string;
  references: string;
}

const LABELS: Record<string, Labels> = {
  Korean: {
    title: "리서치 트렌드 리포트",
    keywordMiss: "키워드 미매칭",
    borderline: "경계(직접 판단 필요)",
    stats: (s, n) =>
      `수집 ${s.fetched}건 · 신규 ${s.fresh}건 · 리포트 대상 ${n}건` +
      (s.keywordMissed !== undefined ? ` · 그중 키워드 검색이었다면 놓쳤을 논문 ${s.keywordMissed}건` : "") +
      (s.deferred ? ` · 다음 실행으로 이월 ${s.deferred}건` : "") +
      (s.failed ? ` · 처리 실패 ${s.failed}건(다음 실행에서 재시도)` : ""),
    none: "오늘은 기준을 통과한 신규 논문이 없습니다.",
    other: "기타",
    references: "References",
  },
  default: {
    title: "Research Trend Report",
    keywordMiss: "no keyword match",
    borderline: "borderline (your call)",
    stats: (s, n) =>
      `${s.fetched} fetched · ${s.fresh} new · ${n} reported` +
      (s.keywordMissed !== undefined ? ` · ${s.keywordMissed} of them invisible to keyword search` : "") +
      (s.deferred ? ` · ${s.deferred} deferred to the next run` : "") +
      (s.failed ? ` · ${s.failed} failed (retried next run)` : ""),
    none: "No new papers passed the gate today.",
    other: "Other",
    references: "References",
  },
};

export function labelsFor(language: string): Labels {
  return LABELS[language] ?? (LABELS.default as Labels);
}

function authorLine(paper: Paper): string {
  if (paper.authors.length <= 3) return paper.authors.join(", ");
  return `${paper.authors.slice(0, 3).join(", ")} et al.`;
}

/** Built from feed metadata only, never from model output. */
export function formatReference(index: number, paper: Paper): string {
  const date = paper.published.slice(0, 10);
  return `${index}. ${authorLine(paper)}. "${paper.title}." arXiv:${paper.id} (${date}). ${paper.url}`;
}

/** Highest priority first (priority is computed in loops/triage.ts). Ties: more confident first. */
export function sortItems(items: readonly ReportItem[]): ReportItem[] {
  return [...items].sort(
    (a, b) => b.triage.priority - a.triage.priority || b.triage.labelConfidence - a.triage.labelConfidence,
  );
}

/**
 * Each paper appears once: under the topic the gate assigned, else the first
 * topic whose phrases matched, else "other".
 */
export function groupByTopic(
  items: readonly ReportItem[],
  config: FinderConfig,
): Array<{ title: string; items: ReportItem[] }> {
  const labels = labelsFor(config.report.language);
  const groups = config.topics.map((t) => ({ key: t.key, title: t.title, items: [] as ReportItem[] }));
  const other = { key: "_other", title: labels.other, items: [] as ReportItem[] };
  for (const item of sortItems(items)) {
    const group =
      groups.find((g) => g.key === item.triage.topic) ??
      groups.find((g) => item.paper.matchedTopics.includes(g.key)) ??
      other;
    group.items.push(item);
  }
  return [...groups, other].filter((g) => g.items.length > 0);
}

export function renderMarkdown(date: string, items: readonly ReportItem[], stats: RunStats, config: FinderConfig): string {
  const labels = labelsFor(config.report.language);
  const lines: string[] = [`# ${labels.title} · ${date}`, "", labels.stats(stats, items.length), ""];
  if (items.length === 0) {
    lines.push(labels.none, "");
    return lines.join("\n");
  }

  const references: string[] = [];
  for (const group of groupByTopic(items, config)) {
    lines.push(`## ${group.title}`, "");
    for (const item of group.items) {
      const { paper, summary, triage } = item;
      const ref = references.push(formatReference(references.length + 1, paper));
      const tags = triage.tags.length ? ` · ${triage.tags.join(", ")}` : "";
      const miss = stats.keywordMissed !== undefined && paper.matchedTopics.length === 0 ? ` · ${labels.keywordMiss}` : "";
      lines.push(
        `### ${paper.title} [${ref}]`,
        "",
        `${authorLine(paper)} · ${paper.published.slice(0, 10)} · [arXiv:${paper.id}](${paper.url}) · ${triage.label} (${triage.labelConfidence.toFixed(2)})${triage.borderline ? ` · ${labels.borderline}` : ""} · ${triage.contribution} · priority ${triage.priority.toFixed(2)}${tags}${miss}`,
        "",
        `**${summary.oneLiner}**`,
        "",
        [summary.problem, summary.method, summary.results, summary.whyItMatters].join(" "),
        "",
      );
    }
  }
  lines.push(`## ${labels.references}`, "", ...references, "");
  return lines.join("\n");
}
