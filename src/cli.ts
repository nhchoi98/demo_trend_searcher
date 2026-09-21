import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import baseConfig from "../finder.config.ts";
import { applyEnv } from "./config.ts";
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
    options: { "dry-run": { type: "boolean", default: false } },
  });
  if (positionals[0] !== "run") {
    console.error("usage: node src/cli.ts run [--dry-run]\n  --dry-run  fetch and dedupe only: no LLM calls, no writes, no posting");
    return 2;
  }

  const env = process.env;
  const config = applyEnv(baseConfig, env);
  const dryRun = values["dry-run"];

  let backends: Backends | undefined;
  if (!dryRun) {
    if (!env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set (use --dry-run to test collection without an LLM)");
      return 2;
    }
    const client = createOpenAIClient(env.OPENAI_API_KEY);
    backends = {
      decide: new OpenAIDecisionBackend(client, config.models.decide),
      text: new OpenAITextBackend(client, config.models.summary),
      // No point escalating to the same model.
      ...(config.models.escalate !== config.models.decide
        ? { escalate: new OpenAIDecisionBackend(client, config.models.escalate) }
        : {}),
    };
  }

  const base = reportBaseUrl(env);
  const result = await run({
    config,
    rootDir,
    dryRun,
    ...(backends ? { backends } : {}),
    ...(env.TEAMS_WEBHOOK_URL ? { teamsWebhookUrl: env.TEAMS_WEBHOOK_URL } : {}),
    ...(base ? { reportBaseUrl: base } : {}),
  });

  // State is already saved at this point; a non-zero exit just makes the
  // problem visible in the Actions run list.
  if (result.sinkError) return 1;
  if (result.stats.fresh > 0 && result.stats.failed === result.stats.fresh) return 1;
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
