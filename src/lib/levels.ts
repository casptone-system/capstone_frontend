import { getAccreditationLevels } from '@/lib/api'

/**
 * Shared, cached source of accreditation level names (e.g. Preliminary,
 * Level I-IV), in sequence order. Backed by GET /accreditation-levels so
 * the frontend never has to hardcode the level list/count — adding a
 * future level on the backend is enough for it to show up everywhere
 * that uses this helper.
 */

const FALLBACK_LEVELS = ['Preliminary', 'Level I', 'Level II', 'Level III', 'Level IV']

let cachedLevels: string[] | null = null
let pendingRequest: Promise<string[]> | null = null

export const fetchAccreditationLevels = async (options: { force?: boolean } = {}): Promise<string[]> => {
  if (!options.force && cachedLevels) {
    return cachedLevels
  }

  if (!options.force && pendingRequest) {
    return pendingRequest
  }

  pendingRequest = getAccreditationLevels()
    .then((levels) => {
      cachedLevels = levels.length > 0 ? levels : FALLBACK_LEVELS
      return cachedLevels
    })
    .catch(() => {
      cachedLevels = FALLBACK_LEVELS
      return cachedLevels
    })
    .finally(() => {
      pendingRequest = null
    })

  return pendingRequest
}

/** Synchronous best-effort read; falls back to the known level list until the API call resolves. */
export const getCachedAccreditationLevels = (): string[] => cachedLevels ?? FALLBACK_LEVELS
