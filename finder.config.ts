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
      phrases: ["world model", "world models", "world foundation model", "learned simulator"],
    },
    {
      key: "physical-ai",
      title: "Physical AI / Embodied AI",
      phrases: ["physical AI", "embodied AI", "vision-language-action", "robot foundation model"],
    },
    {
      key: "nvidia-cosmos",
      title: "NVIDIA Cosmos",
      phrases: ["NVIDIA Cosmos", "Cosmos-Predict", "Cosmos-Transfer", "Cosmos-Reason", "Cosmos world foundation"],
    },
  ],

  tags: [
    "world-model",
    "video-generation",
    "vla",
    "robot-manipulation",
    "autonomous-driving",
    "sim2real",
    "synthetic-data",
    "physical-reasoning",
    "benchmark",
    "survey",
    "cosmos",
  ],

  arxiv: {
    categories: ["cs.CV", "cs.RO", "cs.LG", "cs.AI"],
    lookbackDays: 4,
    maxResultsPerTopic: 100,
    requestDelayMs: 3100,
  },

  gate: {
    include: ["core", "adjacent"],
    escalateBelow: 0.7,
  },

  // Override with FINDER_*_MODEL env vars. Check your account's model list;
  // use a small model for decisions and a stronger one for prose.
  models: {
    decide: "gpt-5-mini",
    escalate: "gpt-5",
    summary: "gpt-5",
  },

  report: {
    language: "Korean",
    timezone: "Asia/Seoul",
    teamsMaxItems: 10,
  },

  concurrency: 4,
});
