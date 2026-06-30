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

// Submissions
export interface Submission {
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
