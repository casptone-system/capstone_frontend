import type { DashboardMetrics, NotificationMessage } from '@/types'

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  return {
    totalPrograms: 12,
    totalAreas: 36,
    complianceScore: 87,
    pendingSubmissions: 5,
    assignmentCompletion: 82,
    performanceTrend: 3
  }
}

export async function getRecentActivity(): Promise<NotificationMessage[]> {
  return [
    {
      id: '1',
      userId: 'system',
      title: 'Program approval pending',
      message: 'A new program submission requires your review.',
      type: 'info',
      read: false,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      userId: 'system',
      title: 'Document review completed',
      message: 'Your evidence submission was reviewed successfully.',
      type: 'success',
      read: false,
      createdAt: new Date().toISOString()
    }
  ]
}
