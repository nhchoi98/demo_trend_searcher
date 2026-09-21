import type { RelevanceLabel } from "./types.ts";

export interface TopicConfig {
  /** Stable key, used in data files and as a report section id. */
  key: string;
  /** Section heading in the report. */
  title: string;
  /** Phrases searched in title + abstract (OR-ed together). */
  phrases: string[];
}

export interface FinderConfig {
  /** Plain-language description of what the reader cares about. Fed to the relevance gate. */
  interest: string;
  topics: TopicConfig[];
  /** Closed tag vocabulary for the relevance gate. Becomes the axis for trend counts later. */
  tags: string[];
  arxiv: {
    /** arXiv categories to restrict the search to. Empty = all categories. */
    categories: string[];
    /** Look this many days back. Overlap is safe: seen papers are skipped. */
    lookbackDays: number;
    maxResultsPerTopic: number;
    /** arXiv asks for ~3s between API requests. */
    requestDelayMs: number;
  };
  gate: {
    /** Labels that make it into the report. */
    include: RelevanceLabel[];
    /** Below this confidence the decision is re-asked on the escalation model. */
    escalateBelow: number;
  };
  models: {
    decide: string;
    escalate: string;
    summary: string;
  };
  report: {
    /** Language of the written summaries, e.g. "Korean". */
    language: string;
    /** IANA timezone used for the report date. */
    timezone: string;
    /** Max papers listed in the Teams card (the markdown report has all of them). */
    teamsMaxItems: number;
  };
  /** Parallel LLM calls. */
  concurrency: number;
}

export function defineConfig(config: FinderConfig): FinderConfig {
  return config;
}

/** Env overrides so forks can switch models without editing code. */
export function applyEnv(config: FinderConfig, env: NodeJS.ProcessEnv): FinderConfig {
  return {
    ...config,
    models: {
      decide: env.FINDER_DECIDE_MODEL || config.models.decide,
      escalate: env.FINDER_ESCALATE_MODEL || config.models.escalate,
      summary: env.FINDER_SUMMARY_MODEL || config.models.summary,
    },
  };
}
