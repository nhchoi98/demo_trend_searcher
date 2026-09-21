import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import baseConfig from "../finder.config.ts";
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
      console.error("OPENAI_API_KEY is not set: summaries need it even when Jev does the judging (use --dry-run to test collection only)");
      return 2;
    }
    const openai = createOpenAIClient(env.OPENAI_API_KEY);
    const text = new OpenAITextBackend(openai, config.models.summary);
    if (env.TYPESAFE_API_KEY) {
      // Intended setup: Jev is the only judge. GPT re-judging is opt-in (gate.escalate).
      backends = {
        decide: new JevDecisionBackend(createJevClient(env.TYPESAFE_API_KEY), config.models.jev),
        text,
        ...(config.gate.escalate ? { escalate: new OpenAIDecisionBackend(openai, config.models.escalate) } : {}),
      };
    } else {
      console.warn("[cli] TYPESAFE_API_KEY is not set: loop 1 runs on OpenAI instead of Jev");
      backends = {
        decide: new OpenAIDecisionBackend(openai, config.models.decide),
        text,
        // No point escalating to the same model.
        ...(config.gate.escalate && config.models.escalate !== config.models.decide
          ? { escalate: new OpenAIDecisionBackend(openai, config.models.escalate) }
          : {}),
      };
    }
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
