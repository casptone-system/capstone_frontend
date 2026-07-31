# ADAMS Final Deployment Patches
## Authoritative Patch Set for Migrations 005-026

**Date:** 2026-07-24  
**Status:** FINAL - READY FOR APPLICATION  
**Purpose:** Fix all critical, high, and medium issues identified in deployment gate review

---

## Patch Summary

| Patch | File(s) | Issue | Severity | Status |
|-------|---------|-------|----------|--------|
| 1 | 015_enhance_documents.sql, 016_create_review_workflows.sql | FK constraint to non-existent table | CRITICAL | REQUIRED |
| 2 | 014_migrate_assignments.sql | NULL area_id risk | HIGH | REQUIRED |
| 3 | 018_deprecate_submission_schedules.sql | submitted_at data loss | HIGH | REQUIRED |
| 4 | 018_deprecate_submission_schedules.sql | System user FK violation | CRITICAL | REQUIRED |
| 5 | 026_fix_document_rls.sql (NEW) | RLS security vulnerability | CRITICAL | REQUIRED |
| 6 | 019_create_accreditation_cycles.sql | Generated column compatibility | LOW | RECOMMENDED |
| 7 | Rollback script | Orphaned objects | MEDIUM | REQUIRED |

---

## Patch 1: Fix Foreign Key Dependency (CRITICAL)

**Files:** 015_enhance_documents.sql, 016_create_review_workflows.sql

### A. Modify 015_enhance_documents.sql

**Original (lines 7-8):**
```sql
ALTER TABLE documents 
  ADD COLUMN IF NOT EXISTS workflow_id UUID REFERENCES review_workflows(id) ON DELETE SET NULL,
```

**Replace with:**
```sql
ALTER TABLE documents 
  ADD COLUMN IF NOT EXISTS workflow_id UUID,  -- Removed FK constraint temporarily
```

**Reason:** review_workflows table doesn't exist yet (created in 016)

### B. Modify 016_create_review_workflows.sql

**Add at the END of the file (after line 32):**
```sql
-- =====================================================
-- ADD FOREIGN KEY CONSTRAINT FOR DOCUMENTS
-- =====================================================
-- This is done here to ensure review_workflows table exists first
-- Migration 015 adds the workflow_id column without FK constraint
ALTER TABLE documents 
  ADD CONSTRAINT fk_documents_workflow 
  FOREIGN KEY (workflow_id) REFERENCES review_workflows(id) ON DELETE SET NULL;
```

**Reason:** review_workflows table now exists, safe to add FK constraint

---

## Patch 2: Fix NULL area_id Risk (HIGH)

**File:** 014_migrate_assignments.sql

**Original (lines 8-19):**
```sql
INSERT INTO area_chair_assignments (area_id, chair_id, assigned_by, assigned_at, is_current, notes)
SELECT 
  (SELECT id FROM accreditation_areas WHERE program_id = p.id LIMIT 1),
  p.chair,
  NULL,
  p.created_at,
  true,
  'Migrated from programs.chair'
FROM programs p
WHERE p.chair IS NOT NULL
  AND EXISTS (SELECT 1 FROM accreditation_areas WHERE program_id = p.id LIMIT 1)
ON CONFLICT DO NOTHING;
```

**Replace with:**
```sql
INSERT INTO area_chair_assignments (area_id, chair_id, assigned_by, assigned_at, is_current, notes)
SELECT 
  first_area.area_id,
  p.chair,
  NULL, -- System migration, no assigner
  p.created_at,
  true,
  'Migrated from programs.chair'
FROM programs p
JOIN (
  -- Get first area for each program to ensure area_id is not NULL
  SELECT DISTINCT ON (program_id) id AS area_id, program_id
  FROM accreditation_areas
  ORDER BY program_id, created_at
) first_area ON first_area.program_id = p.id
WHERE p.chair IS NOT NULL
ON CONFLICT DO NOTHING;

-- Add comment about NULL assigned_by
COMMENT ON COLUMN area_chair_assignments.assigned_by IS 'NULL for system migrations';
```

**Reason:** Subquery may return NULL, causing INSERT to fail. JOIN guarantees area_id exists.

---

## Patch 3: Fix submitted_at Data Loss (HIGH)

**File:** 018_deprecate_submission_schedules.sql

**Original (lines 11-38):**
```sql
INSERT INTO tasks (
  title, 
  description, 
  program_id, 
  area_id, 
  assigned_to, 
  assigned_by, 
  due_date, 
  status,
  created_at,
  updated_at
)
SELECT 
  'Submission: ' || aa.name,
  'Submit accreditation area documentation',
  ss.program_id,
  ss.area_id,
  COALESCE(aca.chair_id, p.chair),
  COALESCE(aca.chair_id, p.chair),
  ss.due_date,
  CASE ss.status 
    WHEN 'submitted' THEN 'completed'
    WHEN 'approved' THEN 'completed'
    WHEN 'rejected' THEN 'cancelled'
    ELSE 'not-started'
  END,
  ss.created_at,
  ss.updated_at
FROM submission_schedules ss
```

**Replace with:**
```sql
-- Add submitted_at column to preserve submission timestamp
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;

-- Migrate existing submission_schedules to tasks
-- This is a one-time migration
INSERT INTO tasks (
  title, 
  description, 
  program_id, 
  area_id, 
  assigned_to, 
  assigned_by, 
  due_date, 
  status,
  submitted_at,
  created_at,
  updated_at
)
SELECT 
  'Submission: ' || aa.name,
  'Submit accreditation area documentation',
  ss.program_id,
  ss.area_id,
  COALESCE(aca.chair_id, p.chair, (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
  COALESCE(aca.chair_id, p.chair, (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
  ss.due_date,
  CASE ss.status 
    WHEN 'submitted' THEN 'completed'
    WHEN 'approved' THEN 'completed'
    WHEN 'rejected' THEN 'cancelled'
    ELSE 'not-started'
  END,
  ss.submitted_at, -- Preserve submission timestamp
  ss.created_at,
  ss.updated_at
FROM submission_schedules ss
JOIN accreditation_areas aa ON aa.id = ss.area_id
JOIN programs p ON p.id = ss.program_id
LEFT JOIN area_chair_assignments aca ON aca.area_id = aa.id AND aca.is_current = true
WHERE NOT EXISTS (
  -- Avoid duplicate migrations
  SELECT 1 FROM tasks t 
  WHERE t.title = 'Submission: ' || aa.name
    AND t.program_id = ss.program_id
    AND t.area_id = ss.area_id
)
ON CONFLICT DO NOTHING;
```

**Reason:** 
1. submitted_at column exists in submission_schedules but not migrated
2. System user creation violates FK constraint to auth.users
3. Use admin fallback instead

---

## Patch 4: Fix Document RLS Policies (CRITICAL)

**File:** 026_fix_document_rls.sql (NEW FILE)

**Create this new migration:**

```sql
-- =====================================================
-- ADAMS - Fix Document RLS Policies
-- Phase 5: Security (Correction)
-- =====================================================

-- Drop overly permissive policy from migration 003
-- This policy allows ALL authenticated users to view ALL documents
-- Which is a security vulnerability
DROP POLICY IF EXISTS "Authenticated users can view documents" ON documents;

-- Create role-specific document access policies

-- Admin, VPAA, QA, Dean can view all documents
CREATE POLICY "Admin, VPAA, QA, Dean can view all documents"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'vpaa', 'dean', 'qa')
    )
  );

-- Accreditors can view documents for assigned programs only
CREATE POLICY "Accreditors can view assigned documents"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM role_assignments
      JOIN programs ON programs.id = role_assignments.program_id
      WHERE role_assignments.user_id = auth.uid()
        AND role_assignments.role = 'accreditor'
        AND role_assignments.is_active = true
        AND documents.program = programs.name
    )
  );

-- Area Chairs can view documents for their areas
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

-- Users can view their own documents
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (uploaded_by = auth.uid());
```

**Reason:** 
- Migration 003 creates overly permissive policy
- Accreditors can view ALL documents (security breach)
- Need role-specific policies with proper restrictions

---

## Patch 5: Fix Generated Column (LOW - RECOMMENDED)

**File:** 019_create_accreditation_cycles.sql

**Original (lines 16-18):**
```sql
expiration_date DATE GENERATED ALWAYS AS (
  start_date + (COALESCE(validity_period_years, 5) || ' years')::INTERVAL
) STORED,
```

**Replace with:**
```sql
expiration_date DATE,
```

**Add at the END of 019_create_accreditation_cycles.sql:**
```sql
-- =====================================================
-- EXPIRATION DATE TRIGGER
-- =====================================================
-- Using trigger instead of generated column for better compatibility

CREATE OR REPLACE FUNCTION calculate_expiration_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expiration_date := NEW.start_date + (COALESCE(NEW.validity_period_years, 5) || ' years')::INTERVAL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_expiration_date ON accreditation_cycles;
CREATE TRIGGER set_expiration_date
  BEFORE INSERT OR UPDATE ON accreditation_cycles
  FOR EACH ROW
  EXECUTE FUNCTION calculate_expiration_date();
```

**Reason:** Generated columns with COALESCE may not work on all PostgreSQL versions

---

## Patch 6: Update Rollback Script (MEDIUM)

**File:** ROLLBACK_SCRIPT.sql (NEW FILE)

**Create this file:**

```sql
-- =====================================================
-- ADAMS - Complete Rollback Script
-- Use this to rollback all migrations 005-026
-- =====================================================

-- =====================================================
-- 1. DROP POLICIES (from 025 and 026)
-- =====================================================

-- Colleges policies
DROP POLICY IF EXISTS "Authenticated users can view colleges" ON colleges;
DROP POLICY IF EXISTS "VPAA and admin can manage colleges" ON colleges;

-- Role assignments policies
DROP POLICY IF EXISTS "Users can view own assignments" ON role_assignments;
DROP POLICY IF EXISTS "VPAA, Dean, and admin can view all assignments" ON role_assignments;
DROP POLICY IF EXISTS "VPAA and admin can create assignments" ON role_assignments;
DROP POLICY IF EXISTS "VPAA and admin can update assignments" ON role_assignments;

-- Area chair assignments policies
DROP POLICY IF EXISTS "Authenticated users can view area chair assignments" ON area_chair_assignments;
DROP POLICY IF EXISTS "Dean and admin can manage area chair assignments" ON area_chair_assignments;

-- Accreditation instruments policies
DROP POLICY IF EXISTS "Authenticated users can view active instruments" ON accreditation_instruments;
DROP POLICY IF EXISTS "VPAA and admin can manage instruments" ON accreditation_instruments;

-- Instrument criteria policies
DROP POLICY IF EXISTS "Authenticated users can view instrument criteria" ON instrument_criteria;
DROP POLICY IF EXISTS "VPAA and admin can manage instrument criteria" ON instrument_criteria;

-- Tasks policies
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Area Chairs can view tasks for their areas" ON tasks;
DROP POLICY IF EXISTS "Deans can view tasks for their college" ON tasks;
DROP POLICY IF EXISTS "VPAA, QA, and admin can view all tasks" ON tasks;
DROP POLICY IF EXISTS "Area Chairs can create tasks for their areas" ON tasks;
DROP POLICY IF EXISTS "Area Chairs can update tasks for their areas" ON tasks;
DROP POLICY IF EXISTS "Users can update own task status" ON tasks;

-- Task progress policies
DROP POLICY IF EXISTS "Users can view progress for own tasks" ON task_progress;
DROP POLICY IF EXISTS "Area Chairs can view progress for their area tasks" ON task_progress;
DROP POLICY IF EXISTS "Deans can view progress for their college tasks" ON task_progress;
DROP POLICY IF EXISTS "VPAA, QA, and admin can view all progress" ON task_progress;
DROP POLICY IF EXISTS "Users can create progress for own tasks" ON task_progress;

-- Review workflows policies
DROP POLICY IF EXISTS "Users can view workflows for their programs" ON review_workflows;
DROP POLICY IF EXISTS "Users can create workflows for their entities" ON review_workflows;
DROP POLICY IF EXISTS "Authorized users can update workflows" ON review_workflows;

-- Review steps policies
DROP POLICY IF EXISTS "Users can view assigned review steps" ON review_steps;
DROP POLICY IF EXISTS "Users can view steps for their workflows" ON review_steps;
DROP POLICY IF EXISTS "VPAA, QA, and admin can view all steps" ON review_steps;
DROP POLICY IF EXISTS "Users can update assigned review steps" ON review_steps;

-- Accreditation cycles policies
DROP POLICY IF EXISTS "Users can view cycles for their college" ON accreditation_cycles;
DROP POLICY IF EXISTS "VPAA and admin can manage cycles" ON accreditation_cycles;
DROP POLICY IF EXISTS "Accreditors can view assigned cycles" ON accreditation_cycles;

-- Accreditation validity alerts policies
DROP POLICY IF EXISTS "VPAA and admin can view all alerts" ON accreditation_validity_alerts;
DROP POLICY IF EXISTS "Deans can view alerts for their college" ON accreditation_validity_alerts;

-- Institutional reviews policies
DROP POLICY IF EXISTS "VPAA and admin can manage institutional reviews" ON institutional_reviews;
DROP POLICY IF EXISTS "QA can view institutional reviews" ON institutional_reviews;

-- Task evidence requirements policies
DROP POLICY IF EXISTS "Users can view evidence requirements for their tasks" ON task_evidence_requirements;
DROP POLICY IF EXISTS "Area Chairs can view evidence requirements for their area tasks" ON task_evidence_requirements;
DROP POLICY IF EXISTS "Area Chairs can create evidence requirements for their area tasks" ON task_evidence_requirements;
DROP POLICY IF EXISTS "Area Chairs can update evidence requirements for their area tasks" ON task_evidence_requirements;

-- Document policies (from 003 and 026)
DROP POLICY IF EXISTS "Authenticated users can view documents" ON documents;
DROP POLICY IF EXISTS "Admin, VPAA, QA, Dean can view all documents" ON documents;
DROP POLICY IF EXISTS "Accreditors can view assigned documents" ON documents;
DROP POLICY IF EXISTS "Area Chairs can view documents for their areas" ON documents;
DROP POLICY IF EXISTS "Users can view own documents" ON documents;

-- =====================================================
-- 2. DROP TRIGGERS AND FUNCTIONS
-- =====================================================

-- Triggers from new tables
DROP TRIGGER IF EXISTS set_updated_at ON review_workflows;
DROP TRIGGER IF EXISTS set_updated_at ON review_steps;
DROP TRIGGER IF EXISTS set_updated_at ON accreditation_cycles;
DROP TRIGGER IF EXISTS set_updated_at ON accreditation_validity_alerts;
DROP TRIGGER IF EXISTS set_updated_at ON institutional_reviews;
DROP TRIGGER IF EXISTS set_expiration_date ON accreditation_cycles;

-- Functions
DROP FUNCTION IF EXISTS calculate_expiration_date();

-- =====================================================
-- 3. DROP VIEWS
-- =====================================================

DROP VIEW IF EXISTS accreditation_validity_dashboard;
DROP VIEW IF EXISTS task_evidence_completeness;
DROP VIEW IF EXISTS area_progress_summary;
DROP VIEW IF EXISTS program_progress_summary;
DROP VIEW IF EXISTS college_progress_summary;

-- =====================================================
-- 4. DROP TABLES (reverse order - children first)
-- =====================================================

DROP TABLE IF EXISTS task_evidence_requirements CASCADE;
DROP TABLE IF EXISTS institutional_reviews CASCADE;
DROP TABLE IF EXISTS accreditation_validity_alerts CASCADE;
DROP TABLE IF EXISTS accreditation_cycles CASCADE;
DROP TABLE IF EXISTS review_steps CASCADE;
DROP TABLE IF EXISTS review_workflows CASCADE;
DROP TABLE IF EXISTS task_progress CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS instrument_criteria CASCADE;
DROP TABLE IF EXISTS accreditation_instruments CASCADE;
DROP TABLE IF EXISTS area_chair_assignments CASCADE;
DROP TABLE IF EXISTS role_assignments CASCADE;
DROP TABLE IF EXISTS colleges CASCADE;

-- =====================================================
-- 5. REMOVE TABLE MODIFICATIONS
-- =====================================================

ALTER TABLE programs DROP COLUMN IF EXISTS college_id;
ALTER TABLE programs DROP COLUMN IF EXISTS level;
ALTER TABLE programs DROP COLUMN IF EXISTS duration_years;

ALTER TABLE documents DROP COLUMN IF EXISTS workflow_id;
ALTER TABLE documents DROP COLUMN IF EXISTS current_reviewer;
ALTER TABLE documents DROP COLUMN IF EXISTS review_status;
ALTER TABLE documents DROP COLUMN IF EXISTS task_id;
ALTER TABLE documents DROP COLUMN IF EXISTS instrument_criteria_id;
ALTER TABLE documents DROP COLUMN IF EXISTS evidence_type;
ALTER TABLE documents DROP COLUMN IF EXISTS is_mandatory;

-- =====================================================
-- 6. RESTORE ORIGINAL ROLE CONSTRAINT
-- =====================================================

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('dean', 'program-chair', 'faculty', 'admin'));

UPDATE profiles SET role = 'program-chair' WHERE role = 'area-chair';
```

---

## Complete Migration Order (FINAL)

```sql
-- Phase 0: Foundation
005_create_colleges.sql
006_add_college_to_programs.sql
007_create_accreditation_instruments.sql
008_create_instrument_criteria.sql
009_create_tasks.sql
010_create_task_progress.sql (apply Patch 3 - composite index)

-- Phase 1: Role Management
011_update_roles.sql
012_create_role_assignments.sql
013_create_area_chair_assignments.sql
014_migrate_assignments.sql (apply Patch 2 - JOIN fix)

-- Phase 2: Review Workflows (NO SWAP)
015_enhance_documents.sql (apply Patch 1 - remove FK)
016_create_review_workflows.sql (apply Patch 1 - add FK at end)
017_create_review_steps.sql
018_deprecate_submission_schedules.sql (apply Patch 3 and 4 - submitted_at + admin fallback)

-- Phase 3: Accreditation Cycles
019_create_accreditation_cycles.sql (apply Patch 5 - trigger instead of generated column)
020_enhance_cycles_validity.sql
021_create_validity_alerts.sql

-- Phase 4: Role-Specific Features
022_create_institutional_reviews.sql
023_create_task_evidence_requirements.sql
024_create_aggregation_views.sql

-- Phase 5: Security
025_update_rls_policies.sql
026_fix_document_rls.sql (NEW - Patch 4)
```

---

## Application Instructions

### Step 1: Apply Patches to Existing Files

1. **015_enhance_documents.sql** - Remove FK constraint (Patch 1A)
2. **016_create_review_workflows.sql** - Add FK constraint at end (Patch 1B)
3. **014_migrate_assignments.sql** - Use JOIN (Patch 2)
4. **018_deprecate_submission_schedules.sql** - Add submitted_at + admin fallback (Patch 3)
5. **019_create_accreditation_cycles.sql** - Replace generated column with trigger (Patch 5)

### Step 2: Create New Files

1. **026_fix_document_rls.sql** - Fix document RLS policies (Patch 4)
2. **ROLLBACK_SCRIPT.sql** - Complete rollback script (Patch 6)

### Step 3: Test in Clean-Room Environment

1. Create new empty Supabase project
2. Run migrations 001 → 026 in order
3. Verify all migrations succeed
4. Test RLS policies with test users
5. Verify data migrations
6. Test rollback

### Step 4: Deploy to Staging

1. Backup production database
2. Apply patches to migration files
3. Run migrations in staging
4. Execute security tests
5. Validate functionality
6. Obtain approval

---

## Verification Checklist

Before deployment, verify:

- [ ] Migration 015 runs without FK error
- [ ] Migration 016 adds FK constraint successfully
- [ ] Migration 014 completes without NULL area_id errors
- [ ] Migration 018 preserves submitted_at data
- [ ] Migration 018 does not create system user
- [ ] Migration 026 drops old document policy
- [ ] Migration 026 creates role-specific policies
- [ ] All migrations run on empty database
- [ ] RLS policies pass security tests
- [ ] Rollback script executes successfully
- [ ] No orphaned objects after rollback

---

**Patch Status:** READY FOR APPLICATION  
**Estimated Time:** 4-6 hours  
**Testing Required:** Yes - Clean-room migration + Security tests  
**Approval Required:** Database Administrator, Security Team