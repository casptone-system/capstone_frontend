export type UserRole = 'dean' | 'program-chair' | 'faculty' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  institution: string
  avatar?: string
  createdAt?: string
}

export interface Program {
  id: string
  name: string
  code: string
  chair: string
  accreditationStatus: 'compliant' | 'at-risk' | 'non-compliant'
  complianceScore: number
}

export interface AccreditationArea {
  id: string
  name: string
  code: string
  description: string
  assignedTo: string[]
  status: 'not-started' | 'in-progress' | 'completed' | 'submitted'
  dueDate: string
}

export interface AppDocument {
  id: string
  title: string
  area: string
  program: string
  uploadedBy: string
  uploadedAt: string
  fileUrl?: string
  fileSize?: number
  version: number
  status: 'pending' | 'approved' | 'rejected' | 'revision'
}

export interface SubmissionSchedule {
  id: string
  areaId: string
  programId: string
  dueDate: string
  status: 'pending' | 'submitted' | 'approved' | 'rejected'
  submittedAt?: string
}

export interface ComplianceScore {
  areaId: string
  programId: string
  score: number
  lastUpdated: string
  trend: number // percentage change
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  entityType: string
  entityId: string
  timestamp: string
  details: Record<string, any>
}

export interface NotificationMessage {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
  actionUrl?: string
}

export interface DashboardMetrics {
  totalPrograms: number
  totalAreas: number
  complianceScore: number
  pendingSubmissions: number
  assignmentCompletion: number
  performanceTrend: number
}
