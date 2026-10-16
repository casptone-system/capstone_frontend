import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  createUser as createAdminUser,
  updateUser as updateAdminUser,
  deleteUser as deleteAdminUser,
  getAdminDashboard,
  getUsers,
  getAuditLogs,
  getLoginHistory,
  getReports,
  resetPassword as resetAdminPassword,
  activateUser,
  deactivateUser,
  lockUser,
  unlockUser,
  restoreUser as restoreAdminUser,
} from '@/lib/api'

export interface SuperAdminStats {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  lockedAccounts: number
  pendingAccounts: number
  totalPrograms: number
  totalAreas: number
  totalDocuments: number
  uploadCount: number
  storageUsed: number
  storageAvailable: number
  activeSessions: number
  failedLogins: number
  auditEvents: number
  pendingReviews: number
}

export interface SuperAdminUserRecord {
  id: number | string
  name: string
  email: string
  firstName?: string
  lastName?: string
  middleName?: string
  role: string
  roles?: string[]
  department?: string
  collegeId?: number | string | null
  programId?: number | string | null
  teamId?: number | string | null
  status?: string
  deletedAt?: string | null
  lockStatus?: string
  lastLogin?: string
  createdAt?: string
}

export const useSuperAdminStore = defineStore('super-admin', () => {
  const stats = ref<SuperAdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    lockedAccounts: 0,
    pendingAccounts: 0,
    totalPrograms: 0,
    totalAreas: 0,
    totalDocuments: 0,
    uploadCount: 0,
    storageUsed: 0,
    storageAvailable: 0,
    activeSessions: 0,
    failedLogins: 0,
    auditEvents: 0,
    pendingReviews: 0,
  })

  const users = ref<SuperAdminUserRecord[]>([])
  const auditLogs = ref<any[]>([])
  const loginHistory = ref<any[]>([])
  const reports = ref<any[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isSubmitting = ref(false)

  const securityStatus = computed(() => {
    if (stats.value.failedLogins > 0) return 'Attention required'
    if (stats.value.lockedAccounts > 0) return 'Review required'
    return 'Stable'
  })

  const fetchAdminOverview = async () => {
    isLoading.value = true
    error.value = null

    try {
      const dashboardResponse = await getAdminDashboard()
      const dashboard = dashboardResponse?.data?.summary || dashboardResponse?.summary || dashboardResponse?.data || dashboardResponse
      const usersResponse = await getUsers({ per_page: 200 })
      const auditResponse = await getAuditLogs({ per_page: 8 })
      const loginResponse = await getLoginHistory({ per_page: 6 })
      const reportsResponse = await getReports()

      const userData = Array.isArray(usersResponse?.data?.users)
        ? usersResponse.data.users
        : Array.isArray(usersResponse?.users)
          ? usersResponse.users
          : []
      const auditData = Array.isArray(auditResponse?.data)
        ? auditResponse.data
        : Array.isArray(auditResponse?.data?.data)
          ? auditResponse.data.data
          : []
      const loginData = Array.isArray(loginResponse?.data)
        ? loginResponse.data
        : Array.isArray(loginResponse?.data?.data)
          ? loginResponse.data.data
          : []
      const reportData = Array.isArray(reportsResponse?.data)
        ? reportsResponse.data
        : Array.isArray(reportsResponse?.data?.data)
          ? reportsResponse.data.data
          : []

      const signedInUsers = userData.filter((user: any) => user.last_login_at).length
      const failedLogins = loginData.filter((entry: any) => String(entry.status || '').toLowerCase() === 'failed').length
      const totalUsers = Number(dashboard?.totalUsers ?? usersResponse?.data?.meta?.total ?? userData.length) || 0

      stats.value = {
        totalUsers,
        activeUsers: signedInUsers,
        inactiveUsers: Math.max(0, userData.length - signedInUsers),
        lockedAccounts: 0,
        pendingAccounts: Math.max(0, userData.length - signedInUsers),
        totalPrograms: Number(dashboard?.totalPrograms || 0),
        totalAreas: Number(dashboard?.totalAreas || 0),
        totalDocuments: Number(dashboard?.totalEvidence || 0),
        uploadCount: Number(dashboard?.totalEvidence || 0),
        storageUsed: 0,
        storageAvailable: 0,
        activeSessions: 0,
        failedLogins,
        auditEvents: Number(auditResponse?.meta?.total ?? auditData.length) || 0,
        pendingReviews: Number(dashboard?.pendingReviews || 0),
      }

      users.value = userData.map((user: any) => {
        const deletedAt = user.deletedAt || user.deleted_at || null
        const status = user.status || (deletedAt ? 'Inactive' : 'Active')

        return {
          id: user.id,
          name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
          email: user.email,
          firstName: user.first_name || user.firstName || '',
          lastName: user.last_name || user.lastName || '',
          middleName: user.middle_name || user.middleName || '',
          role: user.role || user.roles?.[0] || 'faculty',
          roles: user.roles || [],
          department: user.department || user.college?.name || user.program_name || user.team_name || '',
          collegeId: user.collegeId || user.college_id || null,
          programId: user.programId || user.program_id || null,
          teamId: user.teamId || user.team_id || null,
          status,
          deletedAt,
          lockStatus: user.lock_status || 'Unlocked',
          lastLogin: user.last_login_at || null,
          createdAt: user.created_at || null,
        }
      })

      auditLogs.value = auditData
      loginHistory.value = loginData
      reports.value = reportData
    } catch (err: any) {
      error.value = err.message || 'Unable to load System Admin overview.'
    } finally {
      isLoading.value = false
    }
  }

  const createUser = async (payload: Record<string, any>) => {
    isSubmitting.value = true
    error.value = null

    try {
      const response = await createAdminUser(payload)
      await fetchAdminOverview()
      return response
    } catch (err: any) {
      error.value = err.message || 'Unable to create user.'
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  const updateUser = async (id: number | string, payload: Record<string, any>) => {
    isSubmitting.value = true
    error.value = null

    try {
      const response = await updateAdminUser(id, payload)
      await fetchAdminOverview()
      return response
    } catch (err: any) {
      error.value = err.message || 'Unable to update user.'
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  const deleteUser = async (id: number | string) => {
    isSubmitting.value = true
    error.value = null

    try {
      const response = await deleteAdminUser(id)
      await fetchAdminOverview()
      return response
    } catch (err: any) {
      error.value = err.message || 'Unable to delete user.'
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  const restoreUser = async (id: number | string) => {
    isSubmitting.value = true
    error.value = null

    try {
      const response = await restoreAdminUser(id)
      await fetchAdminOverview()
      return response
    } catch (err: any) {
      error.value = err.message || 'Unable to restore user.'
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  const activateUserAccount = async (id: number | string) => {
    isSubmitting.value = true
    error.value = null

    try {
      const response = await activateUser(id)
      await fetchAdminOverview()
      return response
    } catch (err: any) {
      error.value = err.message || 'Unable to activate user.'
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  const deactivateUserAccount = async (id: number | string) => {
    isSubmitting.value = true
    error.value = null

    try {
      const response = await deactivateUser(id)
      await fetchAdminOverview()
      return response
    } catch (err: any) {
      error.value = err.message || 'Unable to deactivate user.'
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  const lockUserAccount = async (id: number | string) => {
    isSubmitting.value = true
    error.value = null

    try {
      const response = await lockUser(id)
      await fetchAdminOverview()
      return response
    } catch (err: any) {
      error.value = err.message || 'Unable to lock user.'
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  const unlockUserAccount = async (id: number | string) => {
    isSubmitting.value = true
    error.value = null

    try {
      const response = await unlockUser(id)
      await fetchAdminOverview()
      return response
    } catch (err: any) {
      error.value = err.message || 'Unable to unlock user.'
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  const resetPassword = async (id: number | string, password?: string) => {
    isSubmitting.value = true
    error.value = null

    try {
      const response = await resetAdminPassword(id, password)
      await fetchAdminOverview()
      return response
    } catch (err: any) {
      error.value = err.message || 'Unable to reset password.'
      throw err
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    stats,
    users,
    auditLogs,
    loginHistory,
    reports,
    isLoading,
    isSubmitting,
    error,
    securityStatus,
    fetchAdminOverview,
    createUser,
    updateUser,
    deleteUser,
    restoreUser,
    activateUserAccount,
    deactivateUserAccount,
    lockUserAccount,
    unlockUserAccount,
    resetPassword,
  }
})
