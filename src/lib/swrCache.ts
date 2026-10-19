/**
 * Stale-while-revalidate helpers for Pinia stores.
 * Show cached data immediately; refresh in the background when TTL expires.
 */

export type SwrMeta = {
  fetchedAt: number
  refreshing: boolean
}

export function isFresh(fetchedAt: number, ttlMs: number): boolean {
  return Boolean(fetchedAt) && Date.now() - fetchedAt < ttlMs
}

export function isStale(fetchedAt: number, ttlMs: number): boolean {
  return Boolean(fetchedAt) && !isFresh(fetchedAt, ttlMs)
}

/** Default TTLs (ms). Short enough for accreditation workflows; long enough to skip remount thrash. */
export const SWR_TTL = {
  dashboard: 45_000,
  areas: 30_000,
  notifications: 20_000,
  facultyAreas: 30_000,
} as const
