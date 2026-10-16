import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getVPAADashboard } from '@/lib/api'

const uniqueByProgram = (items: any[]) => {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = String(item?.program_id ?? item?.programId ?? item?.program?.id ?? item?.program ?? item?.id ?? '')
    if (!key || seen.has(key)) return !key
    seen.add(key)
    return true
  })
}

export const useVPAADashboardStore = defineStore('vpaaDashboard', () => {
  const summary = ref({
    active_accreditations: 0,
    upcoming_accreditations: 0,
    ready_programs: 0,
    at_risk_programs: 0,
    expired_validity: 0,
    overall_readiness: 0,
    evidence_ready: 0,
    evidence_on_track: 0,
    evidence_behind: 0,
    evidence_not_started: 0,
    visits_within_60_days: 0,
    validity_expiring_90_days: 0,
    critical_programs: 0,
    high_programs: 0,
    watch_programs: 0,
  })

  const accreditations = ref<any[]>([])
  const upcoming = ref<any[]>([])
  const atRisk = ref<any[]>([])
  const colleges = ref<any[]>([])
  const alerts = ref<any[]>([])
  const readiness = ref({ overall: 0, programs: [] as any[] })
  const notifications = ref<any[]>([])
  const recentActivity = ref<any[]>([])
  const generatedAt = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchDashboard = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await getVPAADashboard()
      const payload = response?.data ?? response ?? {}

      summary.value = {
        active_accreditations: Number(payload.summary?.active_accreditations ?? payload.active_accreditations ?? 0),
        upcoming_accreditations: Number(payload.summary?.upcoming_accreditations ?? payload.upcoming_accreditations ?? 0),
        ready_programs: Number(payload.summary?.ready_programs ?? payload.ready_programs ?? 0),
        at_risk_programs: Number(payload.summary?.at_risk_programs ?? payload.at_risk_programs ?? 0),
        expired_validity: Number(payload.summary?.expired_validity ?? 0),
        overall_readiness: Number(payload.summary?.overall_readiness ?? payload.overall_readiness ?? 0),
        evidence_ready: Number(payload.summary?.evidence_ready ?? 0),
        evidence_on_track: Number(payload.summary?.evidence_on_track ?? 0),
        evidence_behind: Number(payload.summary?.evidence_behind ?? 0),
        evidence_not_started: Number(payload.summary?.evidence_not_started ?? 0),
        visits_within_60_days: Number(payload.summary?.visits_within_60_days ?? 0),
        validity_expiring_90_days: Number(payload.summary?.validity_expiring_90_days ?? 0),
        critical_programs: Number(payload.summary?.critical_programs ?? 0),
        high_programs: Number(payload.summary?.high_programs ?? 0),
        watch_programs: Number(payload.summary?.watch_programs ?? 0),
      }

      generatedAt.value = payload.generated_at ? String(payload.generated_at) : null
      accreditations.value = uniqueByProgram(Array.isArray(payload.accreditations) ? payload.accreditations : [])
      upcoming.value = uniqueByProgram(Array.isArray(payload.upcoming) ? payload.upcoming : [])
      atRisk.value = uniqueByProgram(Array.isArray(payload.at_risk) ? payload.at_risk : [])
      colleges.value = Array.isArray(payload.colleges) ? payload.colleges : []
      alerts.value = Array.isArray(payload.alerts) ? payload.alerts : []
      readiness.value = payload.readiness && typeof payload.readiness === 'object'
        ? {
            overall: Number(payload.readiness.overall ?? summary.value.overall_readiness ?? 0),
            programs: uniqueByProgram(Array.isArray(payload.readiness.programs) ? payload.readiness.programs : []),
          }
        : { overall: summary.value.overall_readiness, programs: [] }
      notifications.value = Array.isArray(payload.notifications) ? payload.notifications : []
      recentActivity.value = Array.isArray(payload.recent_activity) ? payload.recent_activity : []
    } catch (err: any) {
      error.value = err?.response?.data?.message || err?.message || 'Unable to load the VPAA dashboard.'
      summary.value = {
        active_accreditations: 0,
        upcoming_accreditations: 0,
        ready_programs: 0,
        at_risk_programs: 0,
        expired_validity: 0,
        overall_readiness: 0,
        evidence_ready: 0,
        evidence_on_track: 0,
        evidence_behind: 0,
        evidence_not_started: 0,
        visits_within_60_days: 0,
        validity_expiring_90_days: 0,
        critical_programs: 0,
        high_programs: 0,
        watch_programs: 0,
      }
      generatedAt.value = null
      accreditations.value = []
      upcoming.value = []
      atRisk.value = []
      colleges.value = []
      alerts.value = []
      readiness.value = { overall: 0, programs: [] }
      notifications.value = []
      recentActivity.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    summary,
    accreditations,
    upcoming,
    atRisk,
    colleges,
    alerts,
    readiness,
    notifications,
    recentActivity,
    generatedAt,
    loading,
    error,
    fetchDashboard,
  }
})
