import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import baseConfig from "../finder.config.ts";
import { checkCitations } from "./citations.ts";
import { compare } from "./compare.ts";
import { applyEnv } from "./config.ts";
import { createJevClient, JevDecisionBackend } from "./llm/jev.ts";
import { createOpenAIClient, OpenAIDecisionBackend, OpenAITextBackend } from "./llm/openai.ts";
import { run, type Backends } from "./pipeline.ts";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");

function reportBaseUrl(env: NodeJS.ProcessEnv): string | undefined {
  if (env.REPORT_BASE_URL) return env.REPORT_BASE_URL;
  const { GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_REF_NAME } = env;
  if (GITHUB_SERVER_URL && GITHUB_REPOSITORY && GITHUB_REF_NAME) {
    return `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/blob/${GITHUB_REF_NAME}/reports`;
  }
  return undefined;
}

async function main(): Promise<number> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      "dry-run": { type: "boolean", default: false },
      "after-days": { type: "string", default: "30" },
      date: { type: "string" },
      model: { type: "string" },
    },
  });
  const env = process.env;
  const s2Key = env.SEMANTIC_SCHOLAR_API_KEY ? { semanticScholarApiKey: env.SEMANTIC_SCHOLAR_API_KEY } : {};

  if (positionals[0] === "citations") {
    await checkCitations({ rootDir, afterDays: Number(values["after-days"]), ...(s2Key.semanticScholarApiKey ? { apiKey: s2Key.semanticScholarApiKey } : {}) });
    return 0;
  }
  if (positionals[0] === "compare") {
    const models = values.model?.split(",").map((m) => m.trim()).filter(Boolean) ?? [];
    if (models.length && !env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY not set");
      return 2;
    }
    const config = applyEnv(baseConfig, env);
    const backends = models.map((m) => new OpenAIDecisionBackend(createOpenAIClient(env.OPENAI_API_KEY as string), m));
    const markdown = await compare({ rootDir, config, backends, ...(values.date ? { date: values.date } : {}) });
    const path = join(rootDir, "reports", "bench.md");
    await writeFile(path, markdown);
    console.log(markdown.split("\n## ")[0]);
    console.log(`[compare] wrote ${path}`);
    return 0;
  }
  if (positionals[0] !== "run") {
    console.error(
      [
        "usage: node src/cli.ts run [--dry-run]",
        "       node src/cli.ts citations [--after-days 30]",
        "       node src/cli.ts compare [--model gpt-5-mini,gpt-5-nano] [--date YYYY-MM-DD]",
        "  --dry-run     fetch and dedupe only: no LLM calls, no writes, no posting",
        "  citations     record citation counts of papers reported --after-days ago (data/citations.jsonl)",
        "  compare       judge the gold set (or one day's papers) with OpenAI models, score every model in the log (reports/bench.md)",
      ].join("\n"),
    );
    return 2;
  }

  const config = applyEnv(baseConfig, env);
  const dryRun = values["dry-run"];

  let backends: Backends | undefined;
  if (!dryRun) {
    const missing = ["OPENAI_API_KEY", "TYPESAFE_API_KEY"].filter((k) => !env[k]);
    if (missing.length) {
      console.error(`${missing.join(", ")} not set: loop 1 needs TypeSafe Jev, loop 2 needs OpenAI (use --dry-run to test collection only)`);
      return 2;
    }
    const openai = createOpenAIClient(env.OPENAI_API_KEY as string);
    const text = new OpenAITextBackend(openai, config.models.summary);
    // Jev is the only judge. GPT re-judging is opt-in (gate.escalate).
    backends = {
      decide: new JevDecisionBackend(createJevClient(env.TYPESAFE_API_KEY as string), config.models.jev),
      text,
      ...(config.gate.escalate ? { escalate: new OpenAIDecisionBackend(openai, config.models.escalate) } : {}),
    };
    console.log(
      `[cli] loop 1: ${backends.decide.id}:${backends.decide.model}` +
        (backends.escalate ? ` -> escalates to ${backends.escalate.id}:${backends.escalate.model}` : "") +
        ` | loop 2: ${text.id}:${text.model}`,
    );
  }

  const base = reportBaseUrl(env);
  const result = await run({
    config,
    rootDir,
    dryRun,
    ...(backends ? { backends } : {}),
    ...(env.TEAMS_WEBHOOK_URL ? { teamsWebhookUrl: env.TEAMS_WEBHOOK_URL } : {}),
    ...s2Key,
    ...(env.GITHUB_TOKEN ? { githubToken: env.GITHUB_TOKEN } : {}),
    ...(base ? { reportBaseUrl: base } : {}),
  });

  // State is already saved at this point; a non-zero exit just makes the
  // problem visible in the Actions run list.
  if (result.sinkError) return 1;
  const attempted = result.stats.fresh - result.stats.deferred;
  if (attempted > 0 && result.stats.failed === attempted) return 1;
  return 0;
}

main().then(
  (code) => {
    process.exitCode = code;
  },
  (error) => {
    console.error(error);
    process.exitCode = 1;
  },
);
