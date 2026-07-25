// User and Authentication
export interface User {
  id: string
  name: string
  email: string
  role: string
}

// Documents
export interface Document {
  id: string
  title: string
  fileName: string
  fileSize: number
  uploadedBy: string
  uploadedDate: string
  status: 'approved' | 'pending' | 'rejected' | 'archived'
  description?: string
}

// Programs
export interface Program {
  id: string
  name: string
  code?: string
  status: string
  description?: string
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

<<<<<<< HEAD
// Submissions
export interface Submission {
=======
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
>>>>>>> 3c4a98959b6b6532b97c22c03523a7964c38f154
  id: string
  programId: string
  documentId: string
  status: 'pending' | 'submitted' | 'approved' | 'rejected'
  submittedAt?: string
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
