import type {
  User,
  Program,
  AccreditationArea,
  AppDocument,
  SubmissionSchedule,
  ComplianceScore,
  AuditLog,
  NotificationMessage,
  DashboardMetrics,
  College
} from '@/types'

const programs: Program[] = [
  { id: '1', name: 'Bachelor of Science in Computer Science', code: 'BSCS', status: 'active', chair: 'Dr. John Smith', accreditationStatus: 'compliant', complianceScore: 92 },
  { id: '2', name: 'Bachelor of Science in Engineering', code: 'BSEng', status: 'active', chair: 'Dr. Maria Cruz', accreditationStatus: 'at-risk', complianceScore: 68 },
  { id: '3', name: 'Bachelor of Science in Nursing', code: 'BSN', status: 'active', chair: 'Dr. Ana Santos', accreditationStatus: 'compliant', complianceScore: 88 }
]

const accreditationAreas: AccreditationArea[] = [
  { id: '1', name: 'Student Learning Outcomes', code: 'SLO-001', description: 'Assessment of student learning outcomes', assignedTo: [], status: 'in-progress', dueDate: '2026-03-15' },
  { id: '2', name: 'Faculty Development', code: 'FD-002', description: 'Faculty qualifications and development', assignedTo: [], status: 'in-progress', dueDate: '2026-04-01' }
]

const documents: AppDocument[] = [
  { id: '1', title: 'Program Learning Outcomes 2023-24', area: 'Student Learning', program: 'Computer Science', uploadedBy: 'Dr. John Smith', uploadedAt: '2024-05-15', version: 3, status: 'approved' },
  { id: '2', title: 'Assessment Results Summary', area: 'Program Effectiveness', program: 'Engineering', uploadedBy: 'Dr. Sarah Johnson', uploadedAt: '2024-05-18', version: 2, status: 'pending' }
]

async function delay(ms = 120) {
  await new Promise(resolve => setTimeout(resolve, ms))
}

export async function getProfile(userId: string) {
  await delay()
  return { id: userId, name: 'Local User', email: 'local@example.com', role: 'faculty', institution: 'State University' } as User
}

export async function updateProfile(userId: string, updates: Partial<User>) {
  await delay()
  return { id: userId, name: 'Local User', email: 'local@example.com', role: 'faculty', institution: 'State University', ...updates } as User
}

export async function getPrograms() {
  await delay()
  return programs
}

export async function getProgram(id: string) {
  await delay()
  return programs.find(program => program.id === id) || null
}

export async function createProgram(program: Omit<Program, 'id'>) {
  await delay()
  const newProgram: Program = { id: `${Date.now()}`, ...program }
  programs.push(newProgram)
  return newProgram
}

export async function updateProgram(id: string, updates: Partial<Program>) {
  await delay()
  const index = programs.findIndex(program => program.id === id)
  if (index === -1) throw new Error('Program not found')
  programs[index] = { ...programs[index], ...updates }
  return programs[index]
}

export async function deleteProgram(id: string) {
  await delay()
  const index = programs.findIndex(program => program.id === id)
  if (index !== -1) programs.splice(index, 1)
  return true
}

export async function getAccreditationAreas() {
  await delay()
  return accreditationAreas
}

export async function getAccreditationArea(id: string) {
  await delay()
  return accreditationAreas.find(area => area.id === id) || null
}

export async function createAccreditationArea(area: Omit<AccreditationArea, 'id'>) {
  await delay()
  const newArea: AccreditationArea = { id: `${Date.now()}`, ...area }
  accreditationAreas.push(newArea)
  return newArea
}

export async function updateAccreditationArea(id: string, updates: Partial<AccreditationArea>) {
  await delay()
  const index = accreditationAreas.findIndex(area => area.id === id)
  if (index === -1) throw new Error('Area not found')
  accreditationAreas[index] = { ...accreditationAreas[index], ...updates }
  return accreditationAreas[index]
}

export async function getDocuments() {
  await delay()
  return documents
}

export async function getDocument(id: string) {
  await delay()
  return documents.find(document => document.id === id) || null
}

export async function searchDocuments(query: string) {
  await delay()
  return documents.filter(document =>
    document.title.toLowerCase().includes(query.toLowerCase()) ||
    document.area.toLowerCase().includes(query.toLowerCase()) ||
    document.program.toLowerCase().includes(query.toLowerCase())
  )
}

export async function filterDocuments(filters: { area?: string; program?: string; status?: string }) {
  await delay()
  return documents.filter(document => {
    if (filters.area && document.area !== filters.area) return false
    if (filters.program && document.program !== filters.program) return false
    if (filters.status && document.status !== filters.status) return false
    return true
  })
}

export async function uploadDocument(file: File, metadata: { title: string; area: string; program: string; uploadedBy: string }) {
  await delay()
  const newDocument: AppDocument = {
    id: `${Date.now()}`,
    title: metadata.title,
    area: metadata.area,
    program: metadata.program,
    uploadedBy: metadata.uploadedBy,
    uploadedAt: new Date().toISOString().split('T')[0],
    fileSize: file.size,
    version: 1,
    status: 'pending'
  }
  documents.unshift(newDocument)
  return newDocument
}

export async function updateDocumentStatus(id: string, status: string) {
  await delay()
  const document = documents.find(item => item.id === id)
  if (!document) throw new Error('Document not found')
  document.status = status as AppDocument['status']
  return document
}

export async function getSubmissionSchedules(): Promise<SubmissionSchedule[]> {
  await delay()
  return []
}

export async function getComplianceScores(): Promise<ComplianceScore[]> {
  await delay()
  return []
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  await delay()
  return {
    totalPrograms: programs.length,
    totalAreas: accreditationAreas.length,
    complianceScore: 91,
    pendingSubmissions: documents.filter(item => item.status === 'pending').length,
    assignmentCompletion: 84,
    performanceTrend: 14
  }
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  await delay()
  return []
}

export async function createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
  await delay()
  return { id: `${Date.now()}`, timestamp: new Date().toISOString(), ...log } as AuditLog
}

export async function getNotifications(userId: string): Promise<NotificationMessage[]> {
  await delay()
  void userId
  return [{
    id: '1',
    userId,
    title: 'Local backend ready',
    message: 'The application is now using the local Laravel-ready data layer.',
    type: 'info',
    read: false,
    createdAt: new Date().toISOString()
  }]
}

export async function markNotificationRead(id: string) {
  await delay()
  return { id, userId: 'local', title: 'Updated', message: 'Marked as read', type: 'info', read: true, createdAt: new Date().toISOString() }
}

export async function markAllNotificationsRead(userId: string) {
  await delay()
  void userId
  return true
}

export async function getRecentActivity(limit = 10) {
  await delay()
  return [
    { id: '1', title: 'Laravel backend prepared', status: 'completed', icon: 'checkmark-circle-outline', color: 'rgba(34, 197, 94, 0.1)', created_at: new Date().toISOString() }
  ].slice(0, limit)
}

export async function deleteFile(fileUrl: string) {
  await delay()
  return fileUrl ? true : false
}

export async function getFileUrl(filePath: string) {
  await delay()
  return `/${filePath}`
}

const colleges: College[] = [
  { id: '1', name: 'College of Engineering', code: 'COE', description: 'Engineering programs', dean: 'Dr. Maria Cruz', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', name: 'College of Nursing', code: 'CON', description: 'Nursing programs', dean: 'Dr. Ana Santos', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '3', name: 'College of Computer Studies', code: 'CCS', description: 'Computer and IT programs', dean: 'Dr. John Smith', createdAt: '2024-01-01', updatedAt: '2024-01-01' }
]

export async function getColleges() {
  await delay()
  return colleges
}

export async function getCollege(id: string) {
  await delay()
  return colleges.find(college => college.id === id) || null
}

export async function createCollege(college: Omit<College, 'id'>) {
  await delay()
  const newCollege: College = { id: `${Date.now()}`, ...college }
  colleges.push(newCollege)
  return newCollege
}

export async function updateCollege(id: string, updates: Partial<College>) {
  await delay()
  const index = colleges.findIndex(college => college.id === id)
  if (index === -1) throw new Error('College not found')
  colleges[index] = { ...colleges[index], ...updates, updatedAt: new Date().toISOString() }
  return colleges[index]
}

export async function deleteCollege(id: string) {
  await delay()
  const index = colleges.findIndex(college => college.id === id)
  if (index !== -1) colleges.splice(index, 1)
  return true
}
