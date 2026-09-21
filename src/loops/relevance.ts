import type { FinderConfig } from "../config.ts";
import type { Decision, DecisionBackend, DecisionSpec } from "../llm/backend.ts";
import type { DecisionRecord, Paper, RelevanceValue } from "../types.ts";
import { sha256 } from "../util.ts";

export function relevanceSpec(config: FinderConfig): DecisionSpec {
  return {
    name: "relevance",
    instruction: [
      "You triage new research papers for a reader with this interest:",
      config.interest,
      "",
      "Label the paper:",
      "- core: directly about the reader's interest; they would want to read it.",
      "- adjacent: a neighbouring area with a concrete link to the interest.",
      "- irrelevant: keyword overlap only, or no real link.",
      "Pick every tag that applies from the allowed list; pick none if none applies.",
    ].join("\n"),
    valueSchema: {
      type: "object",
      additionalProperties: false,
      required: ["label", "tags"],
      properties: {
        label: { type: "string", enum: ["core", "adjacent", "irrelevant"] },
        tags: { type: "array", items: { type: "string", enum: config.tags } },
      },
    },
  };
}

export function paperState(paper: Paper): string {
  return [
    `Title: ${paper.title}`,
    `Categories: ${paper.categories.join(", ")}`,
    `Abstract: ${paper.abstract}`,
  ].join("\n");
}

export interface RelevanceResult {
  decision: Decision<RelevanceValue>;
  /** One record per backend call, including the pre-escalation one. */
  log: DecisionRecord[];
}

/**
 * Loop 1: relevance gate. Cheap model first; when it is unsure, ask the
 * stronger one. Both answers are logged so thresholds can be tuned later.
 */
export async function judgeRelevance(
  paper: Paper,
  config: FinderConfig,
  primary: DecisionBackend,
  escalation: DecisionBackend | undefined,
): Promise<RelevanceResult> {
  const spec = relevanceSpec(config);
  const state = paperState(paper);
  const inputHash = sha256(`${spec.instruction}\n${state}`);
  const toRecord = (d: Decision<RelevanceValue>, escalatedFrom?: string): DecisionRecord => ({
    ts: new Date().toISOString(),
    loop: spec.name,
    subjectId: paper.id,
    backend: d.backend,
    model: d.model,
    inputHash,
    value: d.value,
    confidence: d.confidence,
    ...(d.reason ? { reason: d.reason } : {}),
    ...(escalatedFrom ? { escalatedFrom } : {}),
  });

  const first = await primary.decide<RelevanceValue>(spec, state);
  const log = [toRecord(first)];
  if (!escalation || first.confidence >= config.gate.escalateBelow) {
    return { decision: first, log };
  }
  const second = await escalation.decide<RelevanceValue>(spec, state);
  log.push(toRecord(second, `${first.backend}:${first.model}`));
  return { decision: second, log };
}
