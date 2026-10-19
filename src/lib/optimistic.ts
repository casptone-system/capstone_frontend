/**
 * Instant UI for the acting user: apply locally, confirm with the server,
 * roll back + surface an error if the server rejects.
 */

export type OptimisticResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: unknown }

export function cloneState<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value)
    } catch {
      // non-cloneable values fall through to JSON
    }
  }
  return JSON.parse(JSON.stringify(value)) as T
}

export function apiErrorMessage(err: unknown, fallback: string): string {
  const anyErr = err as any
  return anyErr?.response?.data?.message || anyErr?.message || fallback
}

export async function runOptimistic<T>(options: {
  apply: () => void
  rollback: () => void
  request: () => Promise<T>
  reconcile?: (data: T) => void
}): Promise<OptimisticResult<T>> {
  options.apply()
  try {
    const data = await options.request()
    options.reconcile?.(data)
    return { ok: true, data }
  } catch (error) {
    options.rollback()
    return { ok: false, error }
  }
}
