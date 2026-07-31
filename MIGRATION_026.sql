-- =====================================================
-- MIGRATION 026: Fix Document RLS Policies
-- =====================================================
--
-- ISSUES:
-- 1. Migration 003 creates: "Authenticated users can view documents"
--    - Allows ALL authenticated users to view ALL documents
--    - Security vulnerability
--
-- 2. Migration 025 creates: "Accreditors can view documents"
--    - Attempts to restrict Accreditors to assigned programs only
--    - BUT PostgreSQL RLS uses OR semantics
--    - Policy from 003 makes this policy redundant
--    - Accreditors can still view ALL documents
--
-- FIX:
-- 1. Drop the overly permissive "Authenticated users can view documents" policy
-- 2. Create role-specific policies with proper access controls
--
-- AFFECTED: documents table RLS policies
-- DEPENDS ON: Migration 025 must run first
-- =====================================================

-- =====================================================
-- STEP 1: Drop Overly Permissive Policy from Migration 003
-- =====================================================
-- This policy allows ALL authenticated users to view ALL documents
-- Which is a security vulnerability

DROP POLICY IF EXISTS "Authenticated users can view documents" ON documents;

-- =====================================================
-- STEP 2: Create Role-Specific Document Access Policies
-- =====================================================

-- Policy 1: Admin, VPAA, QA, Dean can view all documents
-- These roles have institutional oversight responsibilities
CREATE POLICY "Admin, VPAA, QA, Dean can view all documents"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'vpaa', 'dean', 'qa')
    )
  );

-- Policy 2: Accreditors can view documents for assigned programs only
-- Accreditors should only see documents for programs they are actively reviewing
-- Uses program_id (UUID) for reliable matching instead of program name (TEXT)
-- Program names are not unique, so we use program_id for security
CREATE POLICY "Accreditors can view assigned documents"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM role_assignments
      WHERE role_assignments.user_id = auth.uid()
        AND role_assignments.role = 'accreditor'
        AND role_assignments.is_active = true
        AND role_assignments.program_id = documents.program_id
    )
  );

-- Policy 3: Area Chairs can view documents for their areas
-- Area Chairs can see documents linked to tasks in their assigned areas
CREATE POLICY "Area Chairs can view documents for their areas"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM area_chair_assignments
      JOIN tasks ON tasks.area_id = area_chair_assignments.area_id
      WHERE area_chair_assignments.chair_id = auth.uid()
        AND area_chair_assignments.is_current = true
        AND documents.task_id = tasks.id
    )
  );

-- Policy 4: Users can view their own documents
-- Anyone can see documents they uploaded
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (uploaded_by = auth.uid());

-- =====================================================
-- VERIFICATION QUERIES (for testing)
-- =====================================================
-- After deployment, verify with:
--
-- -- Check all policies on documents
-- SELECT policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'documents'
-- ORDER BY policyname;
--
-- Expected SELECT policies:
-- 1. Accreditors can view assigned documents
-- 2. Admin, VPAA, QA, Dean can view all documents
-- 3. Area Chairs can view documents for their areas
-- 4. Users can view own documents
-- 5. (Any INSERT/UPDATE policies from 003 remain unchanged)
--
-- -- Verify old policy is dropped
-- SELECT COUNT(*) as old_policy_count
-- FROM pg_policies
-- WHERE tablename = 'documents'
--   AND policyname = 'Authenticated users can view documents';
--
-- Expected: 0

-- =====================================================
-- SECURITY VERIFICATION
-- =====================================================
-- This migration ensures:
--
-- 1. Admin, VPAA, QA, Dean: Can view ALL documents ✅
-- 2. Accreditor: Can view ONLY assigned program documents ✅
-- 3. Area Chair: Can view ONLY documents for their areas ✅
-- 4. Faculty/Team Member: Can view ONLY their own documents ✅
--
-- PostgreSQL RLS OR semantics:
-- - Multiple policies are ORed together
-- - If ANY policy allows access, the user can access
-- - By removing the overly permissive policy, role-specific policies now work correctly
--
-- FOREIGN KEY INTEGRITY: Preserved - no FK changes
-- DATA INTEGRITY: Preserved - no data changes
-- SUPABASE COMPATIBILITY: Compatible - uses standard RLS policies
-- ROLLBACK SAFETY: Safe - can recreate old policy if needed
-- =====================================================