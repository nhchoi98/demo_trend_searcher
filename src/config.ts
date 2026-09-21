import type { RelevanceLabel } from "./types.ts";

export interface TopicConfig {
  /** Stable key, used in data files and as a report section id. */
  key: string;
  /** Section heading in the report. */
  title: string;
  /** One sentence saying what belongs here. Shown to the decision model as the option's meaning. */
  description: string;
  /** Phrases searched in title + abstract (OR-ed together). */
  phrases: string[];
}

export interface FinderConfig {
  /** Plain-language description of what the reader cares about. Fed to the relevance gate. */
  interest: string;
  topics: TopicConfig[];
  /**
   * Closed tag vocabulary: key -> a statement that is true of a paper carrying the tag.
   * Each becomes one yes/no question, so write the statement the way you want it judged.
   * The keys become the axis for trend counts later.
   */
  tags: Record<string, string>;
  arxiv: {
    /**
     * - "keyword":  one query per topic; only papers whose title/abstract contain a
     *               topic phrase are fetched. Few papers, but blind to new vocabulary.
     * - "category": every new paper in `categories` is fetched and the relevance gate
     *               does the selecting. Complete, but hundreds of gate calls per day.
     */
    mode: "keyword" | "category";
    /** arXiv categories to search. Must be non-empty in "category" mode. */
    categories: string[];
    /** Look this many days back. Overlap is safe: seen papers are skipped. */
    lookbackDays: number;
    /** "keyword" mode: results per topic query. */
    maxResultsPerTopic: number;
    /** "category" mode: page size and a hard stop for pagination. */
    pageSize: number;
    maxPapers: number;
    /** arXiv asks for ~3s between API requests. */
    requestDelayMs: number;
  };
  gate: {
    /** Labels that make it into the report. */
    include: RelevanceLabel[];
    /**
     * A paper is reported when the summed probability of the `include` labels reaches
     * this. Uses the backend's probability distribution, so a paper whose single most
     * likely label is "irrelevant" can still get in if core + adjacent outweigh it.
     * Backends that give no distribution fall back to "is the chosen label in `include`".
     */
    includeThreshold: number;
    /**
     * Reported papers whose label confidence is below this are marked as borderline in
     * the report, so the reader makes the final call. (Jev derives confidence from its
     * probability distribution: for 3 options, 0.7 means the top option holds 80%.)
     */
    borderlineBelow: number;
    /**
     * Off by default. When on, papers below `borderlineBelow` are re-judged by the
     * OpenAI escalation model and ITS answers are used. That swaps a calibrated
     * "not sure" for a self-reported number from a second judge, and mixes two judges
     * in the data, so turn it on only to compare the two backends side by side.
     */
    escalate: boolean;
    /** A tag is attached when its yes-probability reaches this. */
    tagThreshold: number;
    /** priority = weighted mean of relevance (core 1, adjacent 0.5) and normalized significance. Orders the report. */
    priorityWeights: { label: number; significance: number };
    /**
     * Cost guard: at most this many new papers are judged per run, newest first.
     * The rest stay unseen and are picked up by later runs while inside the window.
     */
    maxNewPerRun: number;
  };
  models: {
    /** TypeSafe model for loop 1. */
    jev: string;
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
      jev: env.FINDER_JEV_MODEL || config.models.jev,
      escalate: env.FINDER_ESCALATE_MODEL || config.models.escalate,
      summary: env.FINDER_SUMMARY_MODEL || config.models.summary,
    },
  };
}
