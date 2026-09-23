import { defineConfig } from "./src/config.ts";

// This is the only file you need to edit to point the finder at your own topics.
export default defineConfig({
  interest:
    "Research on world models, physical AI / embodied AI, and the NVIDIA Cosmos " +
    "world foundation model family: learned simulators and video world models, " +
    "vision-language-action models, sim-to-real transfer, synthetic data for robotics " +
    "and autonomous driving. Generic video generation or LLM papers with no link to " +
    "physical-world modelling or embodied agents are NOT of interest.",

  topics: [
    {
      key: "world-model",
      title: "World Models",
      description: "Learned models of environment dynamics: world models, video or latent simulators, world foundation models.",
      phrases: ["world model", "world models", "world foundation model", "learned simulator"],
    },
    {
      key: "physical-ai",
      title: "Physical AI / Embodied AI",
      description: "Agents that perceive and act in the physical world: robot learning, vision-language-action models, embodied reasoning, autonomous driving.",
      phrases: ["physical AI", "embodied AI", "vision-language-action", "robot foundation model"],
    },
    {
      key: "nvidia-cosmos",
      title: "NVIDIA Cosmos",
      description: "Work that builds on, evaluates or extends the NVIDIA Cosmos models (Predict, Transfer, Reason) or their tooling.",
      phrases: ["NVIDIA Cosmos", "Cosmos-Predict", "Cosmos-Transfer", "Cosmos-Reason", "Cosmos world foundation"],
    },
  ],

  // key -> statement judged as a yes/no question for every paper.
  tags: {
    "world-model": "The paper learns or uses a model that predicts how an environment evolves.",
    "video-generation": "The paper generates or predicts video.",
    vla: "The paper proposes, trains or evaluates a vision-language-action model.",
    "robot-manipulation": "The paper addresses robot manipulation.",
    "autonomous-driving": "The paper addresses autonomous driving.",
    sim2real: "The paper addresses transfer from simulation to the real world.",
    "synthetic-data": "The paper generates or relies on synthetic training data.",
    "physical-reasoning": "The paper studies reasoning about physics, space or physical commonsense.",
    benchmark: "The paper introduces a benchmark or dataset.",
    survey: "The paper is a survey or review.",
    cosmos: "The paper uses or mentions NVIDIA Cosmos.",
    "code-release": "The paper states that its code or model weights are publicly released.",
  },

  arxiv: {
    // "category": fetch every new paper in the categories and let the gate select.
    // "keyword":  fetch only papers containing a topic phrase (cheap, but blind to new terms).
    mode: "category",
    categories: ["cs.CV", "cs.RO", "cs.LG", "cs.AI"],
    lookbackDays: 4,
    maxResultsPerTopic: 100,
    pageSize: 200,
    maxPapers: 5000,
    requestDelayMs: 3100,
  },

  gate: {
    include: ["core", "adjacent"],
    includeThreshold: 0.5,
    borderlineBelow: 0.85,
    escalate: false,
    tagThreshold: 0.5,
    priorityWeights: { label: 0.6, significance: 0.4, author: 0.15 },
    authorHIndexCap: 40,
    minPriority: 0.82,
    // Papers from these organizations get +affiliationBoost priority (they still pass the same gate).
    affiliations: ["NVIDIA"],
    affiliationBoost: 0.05,
    // Upper bound on gate calls (and therefore cost) per run. The very first
    // run sees the whole lookback window at once, so it may take 2-3 runs to catch up.
    maxNewPerRun: 1500,
  },

  // Loop 1 runs on Jev, loop 2 on OpenAI. `escalate` is only used when gate.escalate
  // is turned on. Override with FINDER_*_MODEL env vars and check your account's model list.
  models: {
    jev: "jev-latest",
    escalate: "gpt-5",
    summary: "gpt-5",
    // USD per 1M tokens. Check your provider's current price list; these are placeholders
    // to fill in. Keys are the model names as they appear in data/decisions.jsonl.
    pricing: {
      "jev-1.13.0": { input: 0, output: 0 },
      "gpt-5": { input: 0, output: 0 },
      "gpt-5-mini": { input: 0, output: 0 },
    },
  },

  report: {
    language: "Korean",
    timezone: "Asia/Seoul",
    teamsMaxItems: 10,
  },

  concurrency: 8,
});
