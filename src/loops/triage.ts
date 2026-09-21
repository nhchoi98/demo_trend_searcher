import type { FinderConfig } from "../config.ts";
import type { AskResult, ChoiceQuestion, DecisionBackend, NoulQuestion, Questions, ScoreQuestion } from "../llm/backend.ts";
import { paperState } from "../paper.ts";
import type { DecisionRecord, Paper, RelevanceLabel, Triage } from "../types.ts";
import { sha256 } from "../util.ts";

const TAG_PREFIX = "tag:";

export const CONTRIBUTIONS = {
  method: "Proposes a new method, architecture or training recipe.",
  "model-release": "Releases or documents a model, model family or platform.",
  "dataset-benchmark": "Introduces a dataset, benchmark or evaluation protocol.",
  survey: "Survey, review, taxonomy or position paper.",
  application: "Applies existing techniques to a specific system or domain.",
  analysis: "Empirical or theoretical analysis of existing methods.",
} as const;

export const SIGNIFICANCE_LEVELS = [
  "Incremental: a narrow improvement or a routine application.",
  "Solid: a clear contribution that specialists in the area would want to know about.",
  "Notable: a new capability, a large-scale model or dataset, or markedly stronger results.",
  "Potentially field-shaping: likely to change how people in the area work.",
] as const;

/**
 * Loop 1 asks many small questions in ONE call ("fan-out") instead of one big
 * question. Each answer carries its own probability, so each can be thresholded,
 * logged and evaluated on its own.
 */
export function triageQuestions(config: FinderConfig): Questions {
  const label: ChoiceQuestion = {
    type: "choice",
    instructions: `A reader follows this research interest: ${config.interest}\nHow relevant is this paper to that interest? Most papers are unfiltered daily submissions, so most are irrelevant.`,
    options: {
      core: "Directly about the interest; the reader would want to read it.",
      adjacent: "A neighbouring area with a concrete, stated link to the interest.",
      irrelevant: "No real link to the interest, or only shared vocabulary.",
    },
  };
  const topic: ChoiceQuestion = {
    type: "choice",
    instructions: "Which one of these topics does the paper belong to?",
    options: {
      ...Object.fromEntries(config.topics.map((t) => [t.key, t.description])),
      none: "None of the topics above.",
    },
  };
  const contribution: ChoiceQuestion = {
    type: "choice",
    instructions: "What kind of contribution is this paper?",
    options: { ...CONTRIBUTIONS },
  };
  const significance: ScoreQuestion = {
    type: "score",
    instructions: "Judging only from what the abstract claims, how significant is the contribution for someone following the area?",
    levels: SIGNIFICANCE_LEVELS,
  };
  const tags = Object.fromEntries(
    Object.entries(config.tags).map(([key, statement]): [string, NoulQuestion] => [
      `${TAG_PREFIX}${key}`,
      { type: "noul", instructions: `Is this statement true of the paper? ${statement}` },
    ]),
  );
  return { label, topic, contribution, significance, ...tags };
}

const round = (n: number): number => Math.round(n * 1000) / 1000;

const LABEL_WEIGHT: Record<RelevanceLabel, number> = { core: 1, adjacent: 0.5, irrelevant: 0 };

/**
 * The judgments are combined HERE, in code, not by another model call: the
 * weights stay visible and tunable, and the rule cannot drift between runs.
 */
export function combine(result: AskResult<Questions>, config: FinderConfig): Triage {
  const { answers } = result;
  const label = answers.label;
  const topic = answers.topic;
  const contribution = answers.contribution;
  const significance = answers.significance;
  if (label?.type !== "choice" || topic?.type !== "choice" || contribution?.type !== "choice" || significance?.type !== "score") {
    throw new Error("triage: backend returned an incomplete answer set");
  }
  if (!(label.choice in LABEL_WEIGHT)) throw new Error(`triage: unknown label "${label.choice}"`);
  const relevance = label.choice as RelevanceLabel;

  const tags: string[] = [];
  for (const [name, answer] of Object.entries(answers)) {
    if (name.startsWith(TAG_PREFIX) && answer.type === "noul" && answer.probability >= config.gate.tagThreshold) {
      tags.push(name.slice(TAG_PREFIX.length));
    }
  }

  // Use the whole distribution when the backend provides one (Jev does), not just the winner.
  const p = label.probabilities;
  const hasDistribution = p !== undefined && Object.keys(p).length > 0;
  const includeProbability = hasDistribution
    ? config.gate.include.reduce((sum, l) => sum + (p[l] ?? 0), 0)
    : config.gate.include.includes(relevance) ? 1 : 0;
  const expectedRelevance = hasDistribution
    ? Object.entries(LABEL_WEIGHT).reduce((sum, [l, weight]) => sum + (p[l] ?? 0) * weight, 0)
    : LABEL_WEIGHT[relevance];
  const included = includeProbability >= config.gate.includeThreshold;

  const w = config.gate.priorityWeights;
  const significanceNorm = significance.score / (SIGNIFICANCE_LEVELS.length - 1);
  const priority = (w.label * expectedRelevance + w.significance * significanceNorm) / (w.label + w.significance);

  return {
    label: relevance,
    labelConfidence: label.confidence,
    includeProbability: round(includeProbability),
    included,
    borderline: included && label.confidence < config.gate.borderlineBelow,
    topic: topic.choice,
    tags,
    contribution: contribution.choice,
    significance: significance.score,
    priority: round(priority),
  };
}

function toRecord(paper: Paper, inputHash: string, result: AskResult<Questions>, escalatedFrom?: string): DecisionRecord {
  const answers: DecisionRecord["answers"] = {};
  for (const [name, a] of Object.entries(result.answers)) {
    answers[name] =
      a.type === "choice" ? [a.choice, round(a.confidence)] : a.type === "noul" ? [a.probability >= 0.5, round(a.probability)] : [round(a.score), round(a.confidence)];
  }
  return {
    ts: new Date().toISOString(),
    loop: "triage",
    subjectId: paper.id,
    backend: result.backend,
    model: result.model,
    inputHash,
    answers,
    inputTokens: result.inputTokens,
    ...(escalatedFrom ? { escalatedFrom } : {}),
  };
}

export interface TriageResult {
  triage: Triage;
  /** One record per backend call, including the pre-escalation one. */
  log: DecisionRecord[];
}

/**
 * Ask the primary backend (Jev when configured) and combine its answers.
 * Escalation only happens when gate.escalate is on AND an escalation backend was
 * wired in; see the note on gate.escalate for why it is off by default.
 */
export async function triagePaper(
  paper: Paper,
  config: FinderConfig,
  primary: DecisionBackend,
  escalation: DecisionBackend | undefined,
): Promise<TriageResult> {
  const questions = triageQuestions(config);
  const state = paperState(paper);
  const inputHash = sha256(JSON.stringify([questions, state]));

  const first = await primary.ask(state, questions);
  const firstTriage = combine(first, config);
  const log = [toRecord(paper, inputHash, first)];
  if (!config.gate.escalate || !escalation || firstTriage.labelConfidence >= config.gate.borderlineBelow) {
    return { triage: firstTriage, log };
  }
  const second = await escalation.ask(state, questions);
  log.push(toRecord(paper, inputHash, second, `${first.backend}:${first.model}`));
  return { triage: combine(second, config), log };
}
