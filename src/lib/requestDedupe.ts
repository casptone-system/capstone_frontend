/**
 * Deduplicate identical in-flight GET-style requests so dashboards that fire
 * the same call from multiple mounts share one network round-trip.
 */
const inflight = new Map<string, Promise<unknown>>()

export function dedupeRequest<T>(key: string, factory: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key)
  if (existing) {
    return existing as Promise<T>
  }

  const pending = factory().finally(() => {
    inflight.delete(key)
  })
  inflight.set(key, pending)
  return pending
}

export function clearDedupe(prefix?: string): void {
  if (!prefix) {
    inflight.clear()
    return
  }
  for (const key of inflight.keys()) {
    if (key.startsWith(prefix)) {
      inflight.delete(key)
    }
  }
}
