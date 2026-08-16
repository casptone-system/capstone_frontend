import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getVPAADashboard } from '@/lib/api'

export const useVPAADashboardStore = defineStore('vpaaDashboard', () => {
  const summary = ref({
    active_accreditations: 0,
    upcoming_accreditations: 0,
    ready_programs: 0,
    at_risk_programs: 0,
    overall_readiness: 0,
  })

  const accreditations = ref<any[]>([])
  const upcoming = ref<any[]>([])
  const atRisk = ref<any[]>([])
  const readiness = ref({ overall: 0, programs: [] as any[] })
  const notifications = ref<any[]>([])
  const recentActivity = ref<any[]>([])
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
        overall_readiness: Number(payload.summary?.overall_readiness ?? payload.overall_readiness ?? 0),
      }

      accreditations.value = Array.isArray(payload.accreditations) ? payload.accreditations : []
      upcoming.value = Array.isArray(payload.upcoming) ? payload.upcoming : []
      atRisk.value = Array.isArray(payload.at_risk) ? payload.at_risk : []
      readiness.value = payload.readiness && typeof payload.readiness === 'object'
        ? {
            overall: Number(payload.readiness.overall ?? summary.value.overall_readiness ?? 0),
            programs: Array.isArray(payload.readiness.programs) ? payload.readiness.programs : [],
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
        overall_readiness: 0,
      }
      accreditations.value = []
      upcoming.value = []
      atRisk.value = []
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
    readiness,
    notifications,
    recentActivity,
    loading,
    error,
    fetchDashboard,
  }
})
