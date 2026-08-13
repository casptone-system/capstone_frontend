// User and Authentication
export type UserRole = 'dean' | 'program-chair' | 'faculty' | 'admin' | 'staff'

export interface User {
  id: string
  name: string
  first_name?: string
  middle_name?: string
  last_name?: string
  email: string
  teamId?: string
  role: UserRole
  role_slug?: string
  institution?: string
  avatar?: string
  profilePhoto?: string | null
  profilePhotoPath?: string | null
  createdAt?: string
  programId?: string
}

// Programs
export interface Program {
  id: string
  name: string
  code?: string
  status: 'active' | 'inactive' | 'archived' | 'pending'
  description?: string
  chair?: string
  chairId?: string | number | null
  accreditationStatus?: string
  complianceScore?: number
}

export interface Team {
  id: string
  name: string
  code: string
  programId: string
  program?: Program
}

// Reports
export interface Report {
  id: string
  title: string
  description?: string
  generatedDate: string
  generatedBy: string
  type: string
  downloadUrl?: string
}

// Documents
export interface AppDocument {
  id: string
  title: string
  area: string
  program: string
  uploadedBy: string
  uploadedAt: string
  fileName?: string
  size?: string | number
  fileSize?: number
  version: number
  status: 'pending' | 'approved' | 'rejected' | 'revision'
  downloadUrl?: string
}

// Submissions
export interface Submission {
  id: string
  programId: string
  documentId: string
  status: 'pending' | 'submitted' | 'approved' | 'rejected'
  submittedAt?: string
}

export interface SubmissionSchedule {
  id: string
  programId: string
  dueDate: string
  status: string
}

export interface ComplianceScore {
  programId: string
  score: number
}

// Employees
export interface Employee {
  id: string
  name: string
  email: string
  role: string
  department?: string
  status: 'active' | 'inactive'
}

// Audit Log
export interface AuditLog {
  id: string
  action: string
  user: string
  timestamp: string
  details: string
  status: 'success' | 'failed'
}

// QA Review
export interface QAReview {
  id: string
  itemTitle: string
  reviewer: string
  reviewDate: string
  status: 'passed' | 'failed' | 'pending'
  feedback: string
}

// Accreditation Management
export interface Accreditation {
  id: string
  name: string
  code: string
  description: string
  status: 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected' | 'renewal'
  programId?: string
  startDate: string
  expiryDate: string
  reviewerName?: string
  reviewerEmail?: string
  reviewDate?: string
  comments?: string
  attachments: AccreditationFile[]
  standards: AccreditationStandard[]
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface AccreditationFile {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  uploadDate: string
  uploadedBy: string
  fileUrl: string
  category: 'evidence' | 'support' | 'clarification' | 'response'
  description?: string
}

export interface AccreditationStandard {
  id: string
  standardNumber: string
  standardName: string
  description: string
  complianceStatus: 'compliant' | 'partial' | 'non-compliant' | 'pending'
  evidence: string
  notes?: string
}

export interface AccreditationComment {
  id: string
  accreditationId: string
  author: string
  content: string
  timestamp: string
  type: 'comment' | 'review' | 'clarification'
}

// ✅ Added missing AccreditationArea type
export interface AccreditationArea {
  id: string
  name: string
  code?: string
  description?: string
  assignedTo?: string[]
  dueDate?: string
  status: 'pending' | 'submitted' | 'in-progress' | 'not-started' | 'completed' | 'compliant' | 'at-risk' | 'non-compliant'
  programId?: string
}

// ✅ Added missing NotificationMessage type
export interface NotificationMessage {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  read: boolean
  createdAt: string
}

export interface DashboardSummary {
  totalPrograms: number
  totalAreas: number
  totalEvidence: number
  totalCycles: number
  compliancePercent: number
  readinessPercent: number
  pendingReviews: number
  overdueTasks: number
}

// ✅ Added missing DashboardMetrics type
export interface DashboardMetrics {
  totalPrograms: number
  totalAreas: number
  complianceScore: number
  pendingSubmissions: number
  assignmentCompletion: number
  performanceTrend: number
}

export interface AccreditationReview {
  id: string
  accreditationId: string
  reviewerId: string
  reviewerName: string
  reviewDate: string
  rating: number
  status: 'approved' | 'revision-required' | 'rejected'
  feedback: string
  recommendations?: string
}

export interface College {
  id: string
  name: string
  code: string
  description?: string
  dean?: string
  createdAt?: string
  updatedAt?: string
}
