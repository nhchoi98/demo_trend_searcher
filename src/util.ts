import { createHash } from "node:crypto";

export const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

export function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex").slice(0, 16);
}

/** YYYY-MM-DD in the given IANA timezone. */
export function localDate(timezone: string, now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Run `fn` over `items` with at most `limit` in flight. Failures are returned,
 * not thrown, so one bad paper cannot sink the whole daily run.
 */
export async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<Array<{ item: T; ok: true; value: R } | { item: T; ok: false; error: unknown }>> {
  const results = new Array<{ item: T; ok: true; value: R } | { item: T; ok: false; error: unknown }>(items.length);
  let next = 0;
  const worker = async (): Promise<void> => {
    while (next < items.length) {
      const index = next++;
      const item = items[index] as T;
      try {
        results[index] = { item, ok: true, value: await fn(item) };
      } catch (error) {
        results[index] = { item, ok: false, error };
      }
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, worker));
  return results;
}
