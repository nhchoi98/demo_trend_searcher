import type { Artifacts } from "./sources/artifacts.ts";

/** A candidate item found by a source (currently arXiv only). */
export interface Paper {
  /** Version-less arXiv id, e.g. "2501.03575". Used as the dedupe key. */
  id: string;
  version: number;
  title: string;
  abstract: string;
  authors: string[];
  /** ISO timestamps from the feed. */
  published: string;
  updated: string;
  categories: string[];
  url: string;
  pdfUrl: string;
  /** Keys of the config topics whose query matched this paper. */
  matchedTopics: string[];
}

export type RelevanceLabel = "core" | "adjacent" | "irrelevant";

/** Result of loop 1. Every field but `priority` is one answer from the decision backend. */
export interface Triage {
  label: RelevanceLabel;
  /** Confidence of the `label` answer. */
  labelConfidence: number;
  /** Summed probability of the labels in gate.include (or 1 / 0 when the backend gives no distribution). */
  includeProbability: number;
  /** includeProbability reached gate.includeThreshold. */
  included: boolean;
  /** Included, but labelConfidence is under gate.borderlineBelow: the reader should make the call. */
  borderline: boolean;
  /** Key of the config topic the paper belongs to, or "none". Decides the report section. */
  topic: string;
  /** Config tags whose yes-probability reached gate.tagThreshold. */
  tags: string[];
  contribution: string;
  /** Probability-weighted significance level, 0 .. SIGNIFICANCE_LEVELS-1. */
  significance: number;
  /** 0..1, combined IN CODE from expected relevance, significance and (when known) author h-index with the weights in the config. */
  priority: number;
  /** Highest h-index among the authors (Semantic Scholar). Absent when the paper is not indexed yet. */
  authorHIndex?: number;
  /** Entries of gate.affiliations that matched an author affiliation (priority was boosted). */
  affiliations?: string[];
}

export interface Summary {
  oneLiner: string;
  problem: string;
  method: string;
  results: string;
  whyItMatters: string;
}

/** A paper that passed the gate and was summarized. */
export interface ReportItem {
  paper: Paper;
  triage: Triage;
  summary: Summary;
  /** Author affiliations as listed on the paper (arXiv HTML), or from Semantic Scholar. */
  affiliations: string[];
  artifacts: Artifacts;
}

/**
 * One line of data/papers.jsonl: everything we have ever looked at.
 * Papers judged irrelevant are stored slim (no title/url/tags): in "category"
 * mode they are the vast majority and only need to be remembered as seen.
 */
export interface SeenRecord {
  id: string;
  version: number;
  label: RelevanceLabel;
  confidence: number;
  /** What the include decision was based on; lets you replay other gate.includeThreshold values. */
  includeProbability: number;
  /** Topics a keyword search would have matched. Empty = keyword mode would have missed it. */
  matchedTopics: string[];
  authorHIndex?: number;
  reported: boolean;
  runDate: string;
  title?: string;
  url?: string;
  published?: string;
  topic?: string;
  tags?: string[];
  contribution?: string;
  significance?: number;
  priority?: number;
  borderline?: boolean;
  affiliations?: string[];
  artifacts?: Artifacts;
}

/** One line of data/gold.jsonl: a human (or panel) label used to score every backend in reports/bench.md. */
export interface GoldRecord {
  id: string;
  label: RelevanceLabel;
  /** "panel": blind majority vote on a Jev/GPT disagreement; "agreed": Jev and GPT gave the same label, sampled. */
  source: "panel" | "agreed";
  runDate: string;
}

/** One line of data/citations.jsonl: a reported paper's citation count, looked up once, `daysAfter` its run. */
export interface CitationRecord {
  id: string;
  runDate: string;
  checkedAt: string;
  daysAfter: number;
  citationCount: number;
  influentialCitationCount: number;
}

/**
 * One line of data/decisions.jsonl: one backend call, all of its answers.
 * `answers` maps question name -> [value, certainty], where certainty is the
 * confidence of a choice/score or the yes-probability of a noul.
 */
export interface DecisionRecord {
  ts: string;
  loop: string;
  subjectId: string;
  backend: string;
  model: string;
  inputHash: string;
  answers: Record<string, [string | number | boolean, number]>;
  inputTokens: number;
  /** Absent in records written before the benchmark fields were added; read as 0. */
  outputTokens?: number;
  latencyMs?: number;
  /** What the endpoint said it ran, when it differs from `model` (see AskResult.served). */
  served?: string;
  escalatedFrom?: string;
}
