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

export interface RelevanceValue {
  label: RelevanceLabel;
  /** Subset of the tags defined in the config. */
  tags: string[];
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
  relevance: RelevanceValue;
  confidence: number;
  summary: Summary;
}

/** One line of data/papers.jsonl: everything we have ever looked at. */
export interface SeenRecord {
  id: string;
  version: number;
  title: string;
  url: string;
  published: string;
  matchedTopics: string[];
  label: RelevanceLabel;
  tags: string[];
  confidence: number;
  reported: boolean;
  runDate: string;
}

/** One line of data/decisions.jsonl: the raw log used to compare backends. */
export interface DecisionRecord {
  ts: string;
  loop: string;
  subjectId: string;
  backend: string;
  model: string;
  inputHash: string;
  value: unknown;
  confidence: number;
  reason?: string;
  escalatedFrom?: string;
}
