-- =====================================================
-- ADAMS - Row Level Security (RLS) Policies
-- Run this AFTER 001_schema.sql and 002_seed_data.sql
-- =====================================================

-- =====================================================
-- PROFILES
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Deans and admins can view all profiles
CREATE POLICY "Deans and admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('dean', 'admin')
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- PROGRAMS
-- =====================================================
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can view programs
CREATE POLICY "Authenticated users can view programs"
  ON programs FOR SELECT
  USING (auth.role() = 'authenticated');

-- Deans and admins can insert programs
CREATE POLICY "Deans and admins can insert programs"
  ON programs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('dean', 'admin')
    )
  );

-- Deans and admins can update programs
CREATE POLICY "Deans and admins can update programs"
  ON programs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('dean', 'admin')
    )
  );

-- Deans and admins can delete programs
CREATE POLICY "Deans and admins can delete programs"
  ON programs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('dean', 'admin')
    )
  );

-- =====================================================
-- ACCREDITATION AREAS
-- =====================================================
ALTER TABLE accreditation_areas ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view areas
CREATE POLICY "Authenticated users can view areas"
  ON accreditation_areas FOR SELECT
  USING (auth.role() = 'authenticated');

-- Deans and admins can CRUD areas
CREATE POLICY "Deans and admins can manage areas"
  ON accreditation_areas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('dean', 'admin')
    )
  );

CREATE POLICY "Deans and admins can update areas"
  ON accreditation_areas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('dean', 'admin')
    )
  );

CREATE POLICY "Deans and admins can delete areas"
  ON accreditation_areas FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('dean', 'admin')
    )
  );

-- =====================================================
-- DOCUMENTS
-- =====================================================
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view documents
CREATE POLICY "Authenticated users can view documents"
  ON documents FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can upload documents (insert)
CREATE POLICY "Users can upload documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

-- Users can update their own documents
CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = uploaded_by)
  WITH CHECK (auth.uid() = uploaded_by);

-- Deans can update any document status
CREATE POLICY "Deans can update any document"
  ON documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('dean', 'admin')
    )
  );

-- =====================================================
-- SUBMISSION SCHEDULES
-- =====================================================
ALTER TABLE submission_schedules ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view schedules
CREATE POLICY "Authenticated users can view schedules"
  ON submission_schedules FOR SELECT
  USING (auth.role() = 'authenticated');

-- Deans and admins can manage schedules
CREATE POLICY "Deans and admins can manage schedules"
  ON submission_schedules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('dean', 'admin')
    )
  );

CREATE POLICY "Deans and admins can update schedules"
  ON submission_schedules FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('dean', 'admin')
    )
  );

-- =====================================================
-- COMPLIANCE SCORES
-- =====================================================
ALTER TABLE compliance_scores ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view scores
CREATE POLICY "Authenticated users can view scores"
  ON compliance_scores FOR SELECT
  USING (auth.role() = 'authenticated');

-- Deans and admins can manage scores
CREATE POLICY "Deans and admins can manage scores"
  ON compliance_scores FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('dean', 'admin')
    )
  );

CREATE POLICY "Deans and admins can update scores"
  ON compliance_scores FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('dean', 'admin')
    )
  );

-- =====================================================
-- AUDIT LOGS
-- =====================================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Deans and admins can view audit logs
CREATE POLICY "Deans and admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('dean', 'admin')
    )
  );

-- Authenticated users can create audit logs
CREATE POLICY "Authenticated users can create audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- NOTIFICATIONS
-- =====================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- ACTIVITY LOG
-- =====================================================
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view activity log
CREATE POLICY "Authenticated users can view activity log"
  ON activity_log FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users can create activity log entries
CREATE POLICY "Authenticated users can create activity"
  ON activity_log FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');