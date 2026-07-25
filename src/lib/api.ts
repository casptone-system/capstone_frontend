import { supabase } from './supabase'
import type {
  User,
  Program,
  AccreditationArea,
  AppDocument,
  SubmissionSchedule,
  ComplianceScore,
  AuditLog,
  NotificationMessage,
  DashboardMetrics
} from '@/types'

// ==================== PROFILES ====================

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data as User
}

export async function updateProfile(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data as User
}

// ==================== PROGRAMS ====================

export async function getPrograms() {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .order('name')
  if (error) throw error
  return data as Program[]
}

export async function getProgram(id: string) {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Program
}

export async function createProgram(program: Omit<Program, 'id'>) {
  const { data, error } = await supabase
    .from('programs')
    .insert(program)
    .select()
    .single()
  if (error) throw error
  return data as Program
}

export async function updateProgram(id: string, updates: Partial<Program>) {
  const { data, error } = await supabase
    .from('programs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Program
}

export async function deleteProgram(id: string) {
  const { error } = await supabase
    .from('programs')
    .delete()
    .eq('id', id)
  if (error) throw error
  return true
}

// ==================== ACCREDITATION AREAS ====================

export async function getAccreditationAreas() {
  const { data, error } = await supabase
    .from('accreditation_areas')
    .select('*')
    .order('name')
  if (error) throw error
  return data as AccreditationArea[]
}

export async function getAccreditationArea(id: string) {
  const { data, error } = await supabase
    .from('accreditation_areas')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as AccreditationArea
}

export async function createAccreditationArea(area: Omit<AccreditationArea, 'id'>) {
  const { data, error } = await supabase
    .from('accreditation_areas')
    .insert(area)
    .select()
    .single()
  if (error) throw error
  return data as AccreditationArea
}

export async function updateAccreditationArea(id: string, updates: Partial<AccreditationArea>) {
  const { data, error } = await supabase
    .from('accreditation_areas')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as AccreditationArea
}

// ==================== DOCUMENTS ====================

export async function getDocuments() {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as AppDocument[]
}

export async function getDocument(id: string) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as AppDocument
}

export async function searchDocuments(query: string) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .or(`title.ilike.%${query}%,area.ilike.%${query}%,program.ilike.%${query}%`)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as AppDocument[]
}

export async function filterDocuments(filters: {
  area?: string
  program?: string
  status?: string
}) {
  let query = supabase.from('documents').select('*')

  if (filters.area) query = query.eq('area', filters.area)
  if (filters.program) query = query.eq('program', filters.program)
  if (filters.status) query = query.eq('status', filters.status)

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data as AppDocument[]
}

export async function uploadDocument(
  file: File,
  metadata: {
    title: string
    area: string
    program: string
    uploadedBy: string
  }
) {
  // 1. Upload file to Supabase Storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}_${metadata.title.replace(/\s+/g, '_')}.${fileExt}`
  const filePath = `documents/${metadata.uploadedBy}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  // 2. Get the public URL
  const { data: urlData } = supabase.storage
    .from('documents')
    .getPublicUrl(filePath)

  // 3. Create document record
  const { data, error } = await supabase
    .from('documents')
    .insert({
      title: metadata.title,
      area: metadata.area,
      program: metadata.program,
      uploaded_by: metadata.uploadedBy,
      file_url: urlData.publicUrl,
      file_size: file.size,
      version: 1,
      status: 'pending'
    })
    .select()
    .single()

  if (error) throw error
  return data as AppDocument
}

export async function updateDocumentStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from('documents')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as AppDocument
}

// ==================== SUBMISSION SCHEDULES ====================

export async function getSubmissionSchedules() {
  const { data, error } = await supabase
    .from('submission_schedules')
    .select('*')
    .order('due_date')
  if (error) throw error
  return data as SubmissionSchedule[]
}

// ==================== COMPLIANCE SCORES ====================

export async function getComplianceScores() {
  const { data, error } = await supabase
    .from('compliance_scores')
    .select('*')
  if (error) throw error
  return data as ComplianceScore[]
}

// ==================== DASHBOARD METRICS ====================

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  // Get counts from multiple tables
  const [
    { count: totalPrograms },
    { count: totalAreas },
    { data: complianceData },
    { count: pendingSubmissions }
  ] = await Promise.all([
    supabase.from('programs').select('*', { count: 'exact', head: true }),
    supabase.from('accreditation_areas').select('*', { count: 'exact', head: true }),
    supabase.from('compliance_scores').select('score'),
    supabase.from('documents').select('*', { count: 'exact', head: true }).eq('status', 'pending')
  ])

  // Calculate average compliance score
  const scores = complianceData?.map((c: any) => c.score) || []
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
    : 0

  return {
    totalPrograms: totalPrograms || 0,
    totalAreas: totalAreas || 0,
    complianceScore: avgScore,
    pendingSubmissions: pendingSubmissions || 0,
    assignmentCompletion: 0, // Will be calculated from area assignments
    performanceTrend: 0 // Will be calculated from historical data
  }
}

// ==================== AUDIT LOGS ====================

export async function getAuditLogs() {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data as AuditLog[]
}

export async function createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
  const { data, error } = await supabase
    .from('audit_logs')
    .insert({
      user_id: log.userId,
      action: log.action,
      entity_type: log.entityType,
      entity_id: log.entityId,
      details: log.details
    })
    .select()
    .single()
  if (error) throw error
  return data as AuditLog
}

// ==================== NOTIFICATIONS ====================

export async function getNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) throw error
  return data as NotificationMessage[]
}

export async function markNotificationRead(id: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as NotificationMessage
}

export async function markAllNotificationsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)
  if (error) throw error
  return true
}

// ==================== ACTIVITY LOG (for dashboard) ====================

export async function getRecentActivity(limit = 10) {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

// ==================== STORAGE HELPERS ====================

export async function deleteFile(fileUrl: string) {
  // Extract path from URL
  const pathMatch = fileUrl.match(/\/documents\/(.+)/)
  if (!pathMatch) throw new Error('Invalid file URL')

  const { error } = await supabase.storage
    .from('documents')
    .remove([pathMatch[1]])

  if (error) throw error
  return true
}

export async function getFileUrl(filePath: string) {
  const { data } = supabase.storage
    .from('documents')
    .getPublicUrl(filePath)
  return data.publicUrl
}