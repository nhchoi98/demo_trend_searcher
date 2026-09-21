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

export function renderMarkdown(date: string, items: readonly ReportItem[], stats: RunStats, config: FinderConfig): string {
  const labels = labelsFor(config.report.language);
  const lines: string[] = [`# ${labels.title} · ${date}`, "", labels.stats(stats, items.length), ""];
  if (items.length === 0) {
    lines.push(labels.none, "");
    return lines.join("\n");
  }

  // One flat list, highest priority first. The topic is shown per paper instead of as a section.
  const references: string[] = [];
  for (const { paper, summary, triage } of sortItems(items)) {
    const ref = references.push(formatReference(references.length + 1, paper));
    const topic = config.topics.find((t) => t.key === triage.topic)?.title ?? labels.other;
    const tags = triage.tags.length ? ` · ${triage.tags.join(", ")}` : "";
    const miss = stats.keywordMissed !== undefined && paper.matchedTopics.length === 0 ? ` · ${labels.keywordMiss}` : "";
    lines.push(
      `### ${paper.title} [${ref}]`,
      "",
      `priority ${triage.priority.toFixed(2)} · ${topic} · ${triage.label} (${triage.labelConfidence.toFixed(2)})${triage.borderline ? ` · ${labels.borderline}` : ""} · ${triage.contribution}${triage.authorHIndex !== undefined ? ` · h-index ${triage.authorHIndex}` : ""} · ${authorLine(paper)} · ${paper.published.slice(0, 10)} · [arXiv:${paper.id}](${paper.url})${tags}${miss}`,
      "",
      `**${summary.oneLiner}**`,
      "",
      [summary.problem, summary.method, summary.results, summary.whyItMatters].filter(Boolean).join(" "),
      "",
    );
  }
  lines.push(`## ${labels.references}`, "", ...references, "");
  return lines.join("\n");
}
