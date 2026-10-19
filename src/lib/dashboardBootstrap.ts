/**
 * Aggregated parallel bootstraps for role dashboards (client-side).
 * Uses existing authorized APIs only — no new privilege surface.
 */
import {
  getDashboard,
  getDeanDashboard,
  getMyAreas,
  getProgramChairAreas,
  getProgramFaculty,
  getQaDashboard,
} from '@/lib/api'

export async function bootstrapFacultyDashboard() {
  const [dashboard, areas] = await Promise.all([
    getDashboard(),
    getMyAreas(),
  ])
  return { dashboard, areas }
}

export async function bootstrapProgramChairDashboard(programId?: number | string) {
  const [areas, faculty, myAreas] = await Promise.all([
    getProgramChairAreas(programId),
    getProgramFaculty(),
    getMyAreas(),
  ])
  return { areas, faculty, myAreas }
}

export async function bootstrapDeanDashboard() {
  return getDeanDashboard()
}

export async function bootstrapQaDashboard() {
  return getQaDashboard()
}
