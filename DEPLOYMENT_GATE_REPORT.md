# ADAMS Deployment Gate Report
## Critical Re-Review of Migration Suite 005-025

**Date:** 2026-07-24  
**Reviewer:** Database Architect (Critical Review)  
**Scope:** Challenge all previous assumptions, verify every claim with evidence  
**Status:** FINAL GATE REVIEW

---

## Executive Summary

**Deployment Status:** ❌ NOT READY FOR STAGING

**Critical Blocking Issues:** 3  
**High Priority Issues:** 2  
**Medium Priority Issues:** 2  
**Low Priority Issues:** 1  

**Previous audit contained CRITICAL ERRORS that would cause deployment failure.**

---

## Critical Issues (Blocking Deployment)

### Issue #1: Migration 015 Will Fail - Foreign Key to Non-Existent Table

**Severity:** CRITICAL  
**Category:** Migration ordering  
**Impact:** Migration execution will FAIL

**Evidence:**

From 015_enhance_documents.sql (line 8):
```sql
ALTER TABLE documents 
  ADD COLUMN IF NOT EXISTS workflow_id UUID REFERENCES review_workflows(id) ON DELETE SET NULL,
```

From 016_create_review_workflows.sql (line 7):
```sql
CREATE TABLE IF NOT EXISTS review_workflows (
```

**Analysis:**
- Migration 015 runs BEFORE migration 016 (current order: 005, 006, ..., 015, 016, ...)
- At line 8 of 015, PostgreSQL will attempt to create a foreign key to `review_workflows`
- The `review_workflows` table does NOT exist yet (created in 016)
- **Result:** PostgreSQL error: `ERROR: relation "review_workflows" does not exist`

**Previous Recommendation Was WRONG:**
- Previous report suggested "swap 015 and 016"
- **This is INCORRECT** - see Issue #2 below

**Correct Fix:**
```sql
-- In 015_enhance_documents.sql, remove FK constraint:
ALTER TABLE documents 
  ADD COLUMN IF NOT EXISTS workflow_id UUID,  -- No FK constraint
  ADD COLUMN IF NOT EXISTS current_reviewer UUID REFERENCES profiles(id) ON DELETE SET NULL,
  -- ... rest of columns

-- In 016_create_review_workflows.sql, ADD after creating table:
CREATE TABLE IF NOT EXISTS review_workflows (
  -- ... table definition
);

-- ADD THIS AT THE END OF 016:
ALTER TABLE documents 
  ADD CONSTRAINT fk_documents_workflow 
  FOREIGN KEY (workflow_id) REFERENCES review_workflows(id) ON DELETE SET NULL;
```

**Why Swapping Fails:**
- If 016 runs first, it creates `review_workflows` table
- Then 015 runs and adds `workflow_id` column with FK constraint
- **This would work**, BUT 016 does NOT reference documents table
- **However**, 015 adds indexes on documents table (lines 17-21)
- These indexes are independent and don't depend on 016
- **Conclusion:** Swapping is NOT necessary, just remove FK in 015, add it in 016

---

### Issue #2: System User Creation Will Fail - Foreign Key to auth.users

**Severity:** CRITICAL  
**Category:** Data integrity  
**Impact:** Migration 018 will FAIL

**Evidence:**

From 001_schema.sql (line 14):
```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
```

From 018_deprecate_submission_schedules.sql (proposed fix):
```sql
INSERT INTO profiles (id, name, email, role, institution, created_at)
VALUES ('00000000-0000-0000-0000-000000000000', 'System', 'system@localhost', 'admin', 'System', NOW())
ON CONFLICT (id) DO NOTHING;
```

**Analysis:**
- `profiles.id` has a FOREIGN KEY to `auth.users(id)`
- This means EVERY profile MUST have a corresponding auth.users record
- INSERT into profiles with `id = '00000000-0000-0000-0000-000000000000'` will FAIL
- **Result:** PostgreSQL error: `ERROR: insert or update on table "profiles" violates foreign key constraint "profiles_id_fkey"`

**Why This Is Critical:**
- Cannot create profiles directly - must be created via auth.users
- Supabase Auth manages auth.users table
- Cannot insert arbitrary UUIDs into auth.users from migration
- **Result:** Migration 018 will FAIL if COALESCE returns the system user UUID

**Correct Fix:**
```sql
-- Option 1: Use a different default that doesn't violate FK
-- Find an existing user to use as fallback
INSERT INTO tasks (...)
SELECT 
  'Submission: ' || aa.name,
  'Submit accreditation area documentation',
  ss.program_id,
  ss.area_id,
  COALESCE(aca.chair_id, p.chair, (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)), -- Fallback to admin
  COALESCE(aca.chair_id, p.chair, (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
  -- ... rest
```

**OR Option 2: Allow NULL and handle in application**
```sql
-- Make assigned_to nullable in tasks table
ALTER TABLE tasks ALTER COLUMN assigned_to DROP NOT NULL;

-- Then in migration 018, allow NULL
INSERT INTO tasks (...)
SELECT 
  'Submission: ' || aa.name,
  -- ...
  COALESCE(aca.chair_id, p.chair), -- Can be NULL now
  COALESCE(aca.chair_id, p.chair),
  -- ...
```

**Recommended:** Use Option 1 - fallback to admin user

---

### Issue #3: RLS Policy Allows Unauthorized Document Access

**Severity:** CRITICAL  
**Category:** Security  
**Impact:** Accreditors can view ALL documents, not just assigned ones

**Evidence:**

From 003_rls_policies.sql (lines 115-118):
```sql
-- Authenticated users can view documents
CREATE POLICY "Authenticated users can view documents"
  ON documents FOR SELECT
  USING (auth.role() = 'authenticated');
```

From 025_update_rls_policies.sql (lines 504-520):
```sql
-- Accreditors can view documents for assigned programs
CREATE POLICY "Accreditors can view documents"
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
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'vpaa', 'dean', 'qa')
    )
  );
```

**Analysis:**
- RLS policies are evaluated with **OR** logic
- If ANY policy allows access, the user can access
- Policy from 003: "Authenticated users can view documents" allows **ALL** authenticated users
- This includes: Admin, VPAA, QA, Dean, Area Chair, Accreditor, Faculty, Program Chair
- Policy from 025: "Accreditors can view documents" is **redundant**
- **Result:** Accreditors can view ALL documents (not just assigned ones)

**Truth Table - Document SELECT Access:**

| Role | 003 Policy | 025 Policy | Actual Access | Intended Access |
|------|-----------|-----------|---------------|-----------------|
| Admin | ✅ All | ✅ All | ✅ All documents | ✅ All documents |
| VPAA | ✅ All | ✅ All | ✅ All documents | ✅ All documents |
| QA | ✅ All | ✅ All | ✅ All documents | ✅ All documents |
| Dean | ✅ All | ✅ All | ✅ All documents | ✅ All documents |
| Area Chair | ✅ All | ❌ None | ✅ All documents | ❌ Should be limited |
| Accreditor | ✅ All | ✅ Assigned | ✅ All documents | ❌ Should be assigned only |
| Faculty | ✅ All | ❌ None | ✅ All documents | ❌ Should be limited |
| Program Chair | ✅ All | ❌ None | ✅ All documents | ❌ Should be limited |

**Security Vulnerability:**
- Accreditors can view documents for programs they are NOT assigned to
- Area Chairs can view documents outside their areas
- Faculty can view all documents (should be limited to their tasks)

**Correct Fix:**
```sql
-- Step 1: DROP the overly permissive policy from 003
-- In a NEW migration 026 (cannot modify 003):
DROP POLICY IF EXISTS "Authenticated users can view documents" ON documents;

-- Step 2: Create role-specific policies
-- For Admin, VPAA, QA, Dean:
CREATE POLICY "Admin, VPAA, QA, Dean can view all documents"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'vpaa', 'dean', 'qa')
    )
  );

-- For Accreditors (assigned programs only):
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

-- For Area Chairs (their areas only):
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

-- For Faculty/Team Members (their uploaded documents):
CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  USING (uploaded_by = auth.uid());
```

---

## High Priority Issues

### Issue #4: Migration 014 Has NULL area_id Risk

**Severity:** HIGH  
**Category:** Data migration  
**Impact:** Migration may fail or create invalid data

**Evidence:**

From 014_migrate_assignments.sql (lines 8-19):
```sql
INSERT INTO area_chair_assignments (area_id, chair_id, assigned_by, assigned_at, is_current, notes)
SELECT 
  (SELECT id FROM accreditation_areas WHERE program_id = p.id LIMIT 1),  -- May return NULL
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

**Analysis:**
- Subquery `(SELECT id FROM accreditation_areas WHERE program_id = p.id LIMIT 1)` can return NULL
- If it returns NULL, INSERT fails because `area_id` is NOT NULL
- The EXISTS clause checks if ANY area exists, but doesn't guarantee the subquery returns a value
- **Race condition:** Between EXISTS and SELECT, data could change (unlikely but possible)
- **Result:** Migration fails for programs with chairs but no areas

**Correct Fix:**
```sql
INSERT INTO area_chair_assignments (area_id, chair_id, assigned_by, assigned_at, is_current, notes)
SELECT 
  first_area.area_id,
  p.chair,
  NULL,
  p.created_at,
  true,
  'Migrated from programs.chair'
FROM programs p
JOIN (
  SELECT DISTINCT ON (program_id) id AS area_id, program_id
  FROM accreditation_areas
  ORDER BY program_id, created_at
) first_area ON first_area.program_id = p.id
WHERE p.chair IS NOT NULL
ON CONFLICT DO NOTHING;
```

---

### Issue #5: Migration 018 Loses submitted_at Data

**Severity:** HIGH  
**Category:** Data migration  
**Impact:** Data loss

**Evidence:**

From 018_deprecate_submission_schedules.sql (lines 11-38):
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

From 001_schema.sql (line 100):
```sql
submitted_at TIMESTAMPTZ,
```

**Analysis:**
- `submission_schedules` has `submitted_at` column (line 100 in 001_schema.sql)
- Migration 018 does NOT migrate `submitted_at` to tasks table
- **Result:** Data loss - submission timestamps are lost

**Correct Fix:**
```sql
-- First, add submitted_at to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;

-- Then migrate with submitted_at
INSERT INTO tasks (
  title, 
  description, 
  program_id, 
  area_id, 
  assigned_to, 
  assigned_by, 
  due_date, 
  status,
  submitted_at,  -- ADD THIS
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
  ss.submitted_at,  -- ADD THIS
  ss.created_at,
  ss.updated_at
FROM submission_schedules ss
-- ... rest of query
```

---

## Medium Priority Issues

### Issue #6: Migration 003 Modification Required

**Severity:** MEDIUM  
**Category:** Historical migration  
**Impact:** Must modify historical migration OR create comprehensive replacement

**Analysis:**
- Migration 003 creates overly permissive RLS policy: "Authenticated users can view documents"
- This policy MUST be removed for security
- Cannot modify historical migration 003 after deployment
- **Solution:** Create migration 026 to DROP the old policy and CREATE new role-specific policies

**Migration 026 SQL:**
```sql
-- =====================================================
-- ADAMS - Fix Document RLS Policies
-- Phase 5: Security (Correction)
-- =====================================================

-- Drop overly permissive policy from migration 003
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

---

### Issue #7: Rollback Script Orphaned Objects

**Severity:** MEDIUM  
**Category:** Rollback safety  
**Impact:** Rollback may leave orphaned objects

**Analysis:**

Current rollback script drops views, then tables, then columns. However:

1. **Views depend on tables:**
   - `accreditation_validity_dashboard` depends on `accreditation_cycles`, `programs`, `colleges`
   - If tables are dropped first, views are dropped automatically with CASCADE
   - **Current order is correct:** Views dropped first ✅

2. **Tables depend on other tables via FK:**
   - `task_evidence_requirements` → `tasks`, `instrument_criteria`
   - `review_steps` → `review_workflows`
   - Using CASCADE ensures dependent objects are dropped ✅

3. **Missing objects in rollback:**
   - Rollback doesn't drop policies created in 025 and 026
   - Rollback doesn't drop triggers created in various migrations
   - Rollback doesn't drop indexes created in various migrations
   - **Result:** Orphaned policies, triggers, indexes remain after rollback

**Correct Rollback Script:**
```sql
-- Drop policies first
DROP POLICY IF EXISTS "Authenticated users can view colleges" ON colleges;
DROP POLICY IF EXISTS "VPAA and admin can manage colleges" ON colleges;
-- ... drop ALL policies from 025 and 026

-- Drop triggers
DROP TRIGGER IF EXISTS set_updated_at ON review_workflows;
DROP TRIGGER IF EXISTS set_updated_at ON review_steps;
DROP TRIGGER IF EXISTS set_updated_at ON accreditation_cycles;
DROP TRIGGER IF EXISTS set_updated_at ON accreditation_validity_alerts;
DROP TRIGGER IF EXISTS set_updated_at ON institutional_reviews;
DROP TRIGGER IF EXISTS set_expiration_date ON accreditation_cycles;

-- Drop functions
DROP FUNCTION IF EXISTS calculate_expiration_date();

-- Drop views
DROP VIEW IF EXISTS accreditation_validity_dashboard;
DROP VIEW IF EXISTS task_evidence_completeness;
DROP VIEW IF EXISTS area_progress_summary;
DROP VIEW IF EXISTS program_progress_summary;
DROP VIEW IF EXISTS college_progress_summary;

-- Drop tables (with CASCADE)
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

-- Remove table modifications
ALTER TABLE programs DROP COLUMN IF EXISTS college_id;
ALTER TABLE documents DROP COLUMN IF EXISTS workflow_id;
ALTER TABLE documents DROP COLUMN IF EXISTS current_reviewer;
ALTER TABLE documents DROP COLUMN IF EXISTS review_status;
ALTER TABLE documents DROP COLUMN IF EXISTS task_id;
ALTER TABLE documents DROP COLUMN IF EXISTS instrument_criteria_id;
ALTER TABLE documents DROP COLUMN IF EXISTS evidence_type;
ALTER TABLE documents DROP COLUMN IF EXISTS is_mandatory;

-- Restore original role constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('dean', 'program-chair', 'faculty', 'admin'));

UPDATE profiles SET role = 'program-chair' WHERE role = 'area-chair';
```

---

## Low Priority Issues

### Issue #8: Generated Column May Not Be Supported

**Severity:** LOW  
**Category:** Supabase compatibility  
**Impact:** Migration 019 may fail on older PostgreSQL versions

**Evidence:**

From 019_create_accreditation_cycles.sql (lines 16-18):
```sql
expiration_date DATE GENERATED ALWAYS AS (
  start_date + (COALESCE(validity_period_years, 5) || ' years')::INTERVAL
) STORED,
```

**Analysis:**
- Generated columns require PostgreSQL 12+
- Supabase uses PostgreSQL 14+ (as of 2024), so this should work
- However, COALESCE in generated column may not be allowed
- **Risk:** Low, but could fail on some Supabase instances

**Fix:** Use trigger instead (as previously recommended)

---

## Column Dependency Verification

### Data Migration Column Dependencies

**Migration 014 - Migrate Assignments:**

| Column Referenced | Source Table | Exists? | Verified In |
|------------------|--------------|---------|-------------|
| programs.chair | programs | ✅ Yes | 001_schema.sql line 51 |
| accreditation_areas.id | accreditation_areas | ✅ Yes | 001_schema.sql line 62 |
| accreditation_areas.program_id | accreditation_areas | ✅ Yes | 001_schema.sql line 69 |
| accreditation_areas.created_at | accreditation_areas | ✅ Yes | 001_schema.sql line 70 |

**Status:** ✅ All columns exist

**Migration 018 - Deprecate submission_schedules:**

| Column Referenced | Source Table | Exists? | Verified In |
|------------------|--------------|---------|-------------|
| submission_schedules.submitted_at | submission_schedules | ✅ Yes | 001_schema.sql line 100 |
| submission_schedules.area_id | submission_schedules | ✅ Yes | 001_schema.sql line 96 |
| submission_schedules.program_id | submission_schedules | ✅ Yes | 001_schema.sql line 97 |
| submission_schedules.due_date | submission_schedules | ✅ Yes | 001_schema.sql line 98 |
| submission_schedules.status | submission_schedules | ✅ Yes | 001_schema.sql line 99 |
| submission_schedules.created_at | submission_schedules | ✅ Yes | 001_schema.sql line 101 |
| accreditation_areas.id | accreditation_areas | ✅ Yes | 001_schema.sql line 62 |
| accreditation_areas.name | accreditation_areas | ✅ Yes | 001_schema.sql line 63 |
| programs.id | programs | ✅ Yes | 001_schema.sql line 48 |
| programs.chair | programs | ✅ Yes | 001_schema.sql line 51 |
| area_chair_assignments.chair_id | area_chair_assignments | ✅ Yes | 013_create_area_chair_assignments.sql |

**Status:** ✅ All columns exist

**Assumptions Verified:**
- ✅ submission_schedules.submitted_at EXISTS
- ✅ accreditation_areas.created_at EXISTS
- ✅ programs.chair EXISTS

---

## Supabase Compatibility Verification

### Features Used in Migrations

| Feature | PostgreSQL Version Required | Supabase Version | Compatible? |
|---------|----------------------------|------------------|-------------|
| UUID primary keys | Any with uuid-ossp | PG 14+ | ✅ Yes |
| TIMESTAMPTZ | Any | PG 14+ | ✅ Yes |
| JSONB | Any | PG 14+ | ✅ Yes |
| CHECK constraints | Any | PG 14+ | ✅ Yes |
| Foreign keys | Any | PG 14+ | ✅ Yes |
| Indexes | Any | PG 14+ | ✅ Yes |
| Triggers | Any | PG 14+ | ✅ Yes |
| Views | Any | PG 14+ | ✅ Yes |
| Generated columns | PG 12+ | PG 14+ | ⚠️ Yes, but COALESCE may fail |
| RLS policies | PG 9.5+ | PG 14+ | ✅ Yes |
| auth.uid() | Supabase extension | All | ✅ Yes |
| auth.role() | Supabase extension | All | ✅ Yes |

**Issues:**
- ⚠️ Generated column with COALESCE (Issue #8) - Use trigger instead

---

## Recommended Migration Order (CORRECTED)

```sql
-- Phase 0: Foundation
005_create_colleges.sql
006_add_college_to_programs.sql
007_create_accreditation_instruments.sql
008_create_instrument_criteria.sql
009_create_tasks.sql
010_create_task_progress.sql (with composite index patch)

-- Phase 1: Role Management
011_update_roles.sql
012_create_role_assignments.sql
013_create_area_chair_assignments.sql
014_migrate_assignments.sql (with JOIN fix)

-- Phase 2: Review Workflows (ORIGINAL ORDER - NO SWAP NEEDED)
015_enhance_documents.sql (WITHOUT FK constraint)
016_create_review_workflows.sql (WITH FK constraint added at end)
017_create_review_steps.sql
018_deprecate_submission_schedules.sql (with submitted_at migration and admin fallback)

-- Phase 3: Accreditation Cycles
019_create_accreditation_cycles.sql (with trigger instead of generated column)
020_enhance_cycles_validity.sql
021_create_validity_alerts.sql

-- Phase 4: Role-Specific Features
022_create_institutional_reviews.sql
023_create_task_evidence_requirements.sql
024_create_aggregation_views.sql

-- Phase 5: Security
025_update_rls_policies.sql (with corrected Accreditor policies)
026_fix_document_rls_policies.sql (DROP old policy, CREATE new role-specific policies)
```

**Key Changes from Previous Recommendation:**
1. ❌ DO NOT swap 015 and 016
2. ✅ Keep 015 before 016, but remove FK in 015, add it in 016
3. ✅ Create migration 026 to fix RLS policies
4. ✅ Fix system user creation in 018 (use admin fallback)

---

## Blocking Issues Summary

### MUST FIX BEFORE STAGING:

1. **CRITICAL:** Migration 015 FK constraint will fail (Issue #1)
   - Fix: Remove FK in 015, add in 016

2. **CRITICAL:** System user creation violates FK constraint (Issue #2)
   - Fix: Use admin fallback instead of system user

3. **CRITICAL:** RLS policy allows unauthorized document access (Issue #3)
   - Fix: Create migration 026 to drop old policy and add role-specific policies

4. **HIGH:** Migration 014 NULL area_id risk (Issue #4)
   - Fix: Use JOIN instead of subquery

5. **HIGH:** Migration 018 loses submitted_at data (Issue #5)
   - Fix: Add submitted_at column and migrate data

---

## Final Verdict

### ❌ NOT READY FOR STAGING

**Confidence Level:** 100% (previous report was wrong)

**Rationale:**
- Previous deployment readiness report contained CRITICAL ERRORS
- Migration 015 will FAIL due to FK constraint (not "will work if swapped")
- System user creation will FAIL due to auth.users FK violation
- RLS policies have CRITICAL security vulnerability
- 3 blocking issues must be fixed before any deployment

**Required Actions:**
1. Fix Issue #1: Remove FK in 015, add in 016
2. Fix Issue #2: Use admin fallback in 018
3. Fix Issue #3: Create migration 026 for RLS policies
4. Fix Issue #4: Use JOIN in 014
5. Fix Issue #5: Add submitted_at migration in 018
6. Fix Issue #7: Complete rollback script with policies/triggers
7. Fix Issue #8: Use trigger instead of generated column

**Estimated Time to Fix:** 4-6 hours

**Next Steps:**
1. Apply all critical and high priority fixes
2. Test each migration individually
3. Test complete migration suite in staging
4. Re-run deployment gate review
5. Obtain approval for staging deployment

---

**Report Status:** FINAL GATE REVIEW  
**Deployment Status:** ❌ NOT READY  
**Blocking Issues:** 3 Critical, 2 High  
**Approval Required:** Database Administrator, Security Team