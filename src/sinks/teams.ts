import type { FinderConfig } from "../config.ts";
import { labelsFor, sortItems, type RunStats } from "../report.ts";
import type { ReportItem } from "../types.ts";

/** Teams rejects webhook payloads over ~28 KB; stay well under it. */
const MAX_PAYLOAD_BYTES = 24_000;

type CardElement = Record<string, unknown>;

function escapeMd(text: string): string {
  return text.replace(/([\[\]_*])/g, "\\$1");
}

export function buildCard(
  date: string,
  items: readonly ReportItem[],
  stats: RunStats,
  config: FinderConfig,
  reportUrl: string | undefined,
): unknown {
  const labels = labelsFor(config.report.language);
  const header: CardElement[] = [
    { type: "TextBlock", text: `${labels.title} · ${date}`, weight: "Bolder", size: "Large", wrap: true },
    { type: "TextBlock", text: labels.stats(stats, items.length), isSubtle: true, wrap: true, spacing: "None" },
  ];
  if (items.length === 0) header.push({ type: "TextBlock", text: labels.none, wrap: true });

  const make = (count: number): unknown => {
    const shown = sortItems(items).slice(0, count);
    const body: CardElement[] = [...header];
    for (const { paper, summary, relevance } of shown) {
      body.push(
        {
          type: "TextBlock",
          text: `[${escapeMd(paper.title)}](${paper.url})`,
          weight: "Bolder",
          wrap: true,
          separator: true,
        },
        { type: "TextBlock", text: summary.oneLiner, wrap: true, spacing: "Small" },
        {
          type: "TextBlock",
          text: `arXiv:${paper.id} · ${paper.published.slice(0, 10)} · ${relevance.label}`,
          isSubtle: true,
          size: "Small",
          spacing: "Small",
          wrap: true,
        },
      );
    }
    if (items.length > shown.length) {
      body.push({ type: "TextBlock", text: `+${items.length - shown.length}`, isSubtle: true, separator: true });
    }
    return {
      type: "message",
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          contentUrl: null,
          content: {
            $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
            type: "AdaptiveCard",
            version: "1.4",
            msteams: { width: "Full" },
            body,
            ...(reportUrl ? { actions: [{ type: "Action.OpenUrl", title: "Full report", url: reportUrl }] } : {}),
          },
        },
      ],
    };
  };

  // Shrink the list until the payload fits.
  let count = Math.min(items.length, config.report.teamsMaxItems);
  let payload = make(count);
  while (count > 1 && Buffer.byteLength(JSON.stringify(payload)) > MAX_PAYLOAD_BYTES) {
    payload = make(--count);
  }
  return payload;
}

/** Posts to a Teams "Workflows" (Power Automate) webhook. */
export async function postToTeams(webhookUrl: string, payload: unknown): Promise<void> {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    // Never log the URL: it is a bearer secret.
    const detail = (await response.text().catch(() => "")).slice(0, 300);
    throw new Error(`Teams webhook responded ${response.status}: ${detail}`);
  }
}
