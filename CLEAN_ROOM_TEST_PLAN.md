# Clean-Room Migration Test Plan
## Verify Patches on Empty Database

**Date:** 2026-07-24  
**Purpose:** Verify all patches execute successfully on empty Supabase database  
**Status:** TEST PLAN

---

## Prerequisites

1. **Supabase Project**
   - Create new empty Supabase project
   - Obtain database connection string
   - Ensure PostgreSQL 14+ (Supabase default)

2. **Tools Required**
   - psql client installed
   - Database connection string configured

3. **Test Data Required**
   - At least one admin user in profiles table
   - Test data in submission_schedules, programs, accreditation_areas

---

## Test Environment Setup

### Step 1: Create Test Database

```bash
# Create new Supabase project via dashboard
# Project name: adams-clean-room-test
# Region: Select closest region
# Copy connection string from: Settings → Database → Connection string
```

### Step 2: Configure Connection

```bash
# Set environment variable
set SUPABASE_DB_URL=postgresql://postgres:[password]@[host]:5432/postgres

# Verify connection
psql %SUPABASE_DB_URL% -c "SELECT version();"
```

### Step 3: Prepare Test Data

```sql
-- Connect to database
psql %SUPABASE_DB_URL%

-- Create admin user (required for PATCH_018 fallback)
INSERT INTO profiles (id, name, email, role, institution, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'System Admin', 'admin@test.com', 'admin', 'Test University', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create test program with chair
INSERT INTO programs (id, name, code, chair, created_at) VALUES
  ('00000000-0000-0000-0000-000000000010', 'Test Program', 'TP1', '00000000-0000-0000-0000-000000000001', NOW());

-- Create test program WITHOUT chair (tests NULL fallback)
INSERT INTO programs (id, name, code, created_at) VALUES
  ('00000000-0000-0000-0000-000000000011', 'Test Program No Chair', 'TP2', NOW());

-- Create test accreditation area
INSERT INTO accreditation_areas (id, name, code, program_id, created_at) VALUES
  ('00000000-0000-0000-0000-000000000020', 'Test Area', 'TA1', '00000000-0000-0000-0000-000000000010', NOW());

-- Create test accreditation area for program without chair
INSERT INTO accreditation_areas (id, name, code, program_id, created_at) VALUES
  ('00000000-0000-0000-0000-000000000021', 'Test Area No Chair', 'TA2', '00000000-0000-0000-0000-000000000011', NOW());

-- Create test submission schedule for program WITH chair
INSERT INTO submission_schedules (id, program_id, area_id, due_date, status, submitted_at, created_at, updated_at) VALUES
  ('00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000020', 
   NOW() + INTERVAL '30 days', 'pending', NOW(), NOW(), NOW());

-- Create test submission schedule for program WITHOUT chair (tests NULL fallback)
INSERT INTO submission_schedules (id, program_id, area_id, due_date, status, submitted_at, created_at, updated_at) VALUES
  ('00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000021',
   NOW() + INTERVAL '30 days', 'pending', NOW(), NOW(), NOW());

-- Verify test data
SELECT 'programs' as table_name, COUNT(*) as count FROM programs
UNION ALL
SELECT 'accreditation_areas', COUNT(*) FROM accreditation_areas
UNION ALL
SELECT 'submission_schedules', COUNT(*) FROM submission_schedules
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles;
```

---

## Test Execution

### Step 4: Apply Patches to Migration Files

**Before running migrations, apply patches to source files:**

#### Patch 1: Fix Migration 015

**File:** `supabase/migrations/015_enhance_documents.sql`

**Original (line 7-8):**
```sql
ALTER TABLE documents 
  ADD COLUMN IF NOT EXISTS workflow_id UUID REFERENCES review_workflows(id) ON DELETE SET NULL,
```

**Replace with:**
```sql
ALTER TABLE documents 
  ADD COLUMN IF NOT EXISTS workflow_id UUID;
```

#### Patch 2: Add FK to Migration 016

**File:** `supabase/migrations/016_create_review_workflows.sql`

**Add at END of file (after line 32):**
```sql
-- Add FK constraint for documents.workflow_id
ALTER TABLE documents 
  ADD CONSTRAINT fk_documents_workflow 
  FOREIGN KEY (workflow_id) REFERENCES review_workflows(id) ON DELETE SET NULL;
```

#### Patch 3: Fix Migration 018

**File:** `supabase/migrations/018_deprecate_submission_schedules.sql`

**Replace lines 11-38 with:**
```sql
-- Add submitted_at column to preserve submission timestamp
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;

-- Migrate existing submission_schedules to tasks
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
  ss.submitted_at,
  ss.created_at,
  ss.updated_at
FROM submission_schedules ss
JOIN accreditation_areas aa ON aa.id = ss.area_id
JOIN programs p ON p.id = ss.program_id
LEFT JOIN area_chair_assignments aca ON aca.area_id = aa.id AND aca.is_current = true
WHERE NOT EXISTS (
  SELECT 1 FROM tasks t 
  WHERE t.title = 'Submission: ' || aa.name
    AND t.program_id = ss.program_id
    AND t.area_id = ss.area_id
)
ON CONFLICT DO NOTHING;
```

#### Create Migration 026

**File:** `supabase/migrations/026_fix_document_rls.sql`

**Create new file with content from MIGRATION_026.sql**

---

### Step 5: Run Migrations

```bash
# Set migration directory
set MIGRATION_DIR=supabase/migrations

# Run migrations sequentially
echo "Running migration 001..."
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/001_schema.sql
if %ERRORLEVEL% NEQ 0 exit /b 1

echo "Running migration 002..."
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/002_seed_data.sql
if %ERRORLEVEL% NEQ 0 exit /b 1

echo "Running migration 003..."
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/003_rls_policies.sql
if %ERRORLEVEL% NEQ 0 exit /b 1

echo "Running migration 004..."
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/004_update_signup_trigger.sql
if %ERRORLEVEL% NEQ 0 exit /b 1

echo "Running migration 005..."
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/005_create_colleges.sql
if %ERRORLEVEL% NEQ 0 exit /b 1

echo "Running migration 006..."
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/006_add_college_to_programs.sql
if %ERRORLEVEL% NEQ 0 exit /b 1

echo "Running migration 007..."
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/007_create_accreditation_instruments.sql
if %ERRORLEVEL% NEQ 0 exit /b 1

echo "Running migration 008..."
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/008_create_instrument_criteria.sql
if %ERRORLEVEL% NEQ 0 exit /b 1

echo "Running migration 009..."
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/009_create_tasks.sql
if %ERRORLEVEL% NEQ 0 exit /b 1

echo "Running migration 010..."
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/010_create_task_progress.sql
if %ERRORLEVEL% NEQ 0 exit /b 1

echo "Running migration 011..."
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/011_update_roles.sql
if %ERRORLEVEL% NEQ 0 exit /b 1

echo "Running migration 012..."
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/012_create_role_assignments.sql
if %ERRORLEVEL% NEQ 0 exit /b 1

echo "Running migration 013..."
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/013_create_area_chair_assignments.sql
if %ERRORLEVEL% NEQ 0 exit /b 1

echo "Running migration 014..."
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/014_migrate_assignments.sql
if %ERRORLEVEL% NEQ 0 exit /b 1

echo "Running migration 015 (PATCHED)..."
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/015_enhance_documents.sql
if %ERRORLEVEL% NEQ 0 exit /b 1

echo "Running migration 016 (PATCHED)..."
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/016_create_review_workflows.sql
if %ERRORLEVEL% NEQ 0 exit /b 1

echo "Running migration 017..."
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/017_create_review_steps.sql
if %ERRORLEVEL% NEQ 0 exit /b 1

echo "Running migration 018 (PATCHED)..."
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/018_deprecate_submission_schedules.sql
if %ERRORLEVEL% NEQ 0 exit /b 1

echo "Running migration 019..."
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/019_create_accreditation_cycles.sql
if %ERRORLEVEL% NEQ 0 exit /b 1

echo "Running migration 020..."
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/020_enhance_cycles_validity.sql
if %ERRORLEVEL% NEQ 0 exit /b 1

echo "Running migration 021..."
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/021_create_validity_alerts.sql
if %ERRORLEVEL% NEQ 0 exit /b 1

echo "Running migration 022..."
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/022_create_institutional_reviews.sql
if %ERRORLEVEL% NEQ 0 exit /b 1

echo "Running migration 023..."
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/023_create_task_evidence_requirements.sql
if %ERRORLEVEL% NEQ 0 exit /b 1

echo "Running migration 024..."
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/024_create_aggregation_views.sql
if %ERRORLEVEL% NEQ 0 exit /b 1

echo "Running migration 025..."
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/025_update_rls_policies.sql
if %ERRORLEVEL% NEQ 0 exit /b 1

echo "Running migration 026..."
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/026_fix_document_rls.sql
if %ERRORLEVEL% NEQ 0 exit /b 1

echo "All migrations completed successfully!"
```

**Expected Result:** All migrations execute without errors

---

## Verification Queries

### Step 6: Verify Migration 015 Fix

```sql
-- Verify workflow_id column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'documents'
  AND column_name = 'workflow_id';

-- Expected: workflow_id | uuid | YES

-- Verify FK constraint exists (added in 016)
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE conrelid = 'documents'::regclass
  AND conname = 'fk_documents_workflow';

-- Expected: 1 row showing documents → review_workflows
```

**Pass Criteria:**
- ✅ workflow_id column exists
- ✅ FK constraint exists and is valid

---

### Step 7: Verify Migration 018 Fix

```sql
-- Verify submitted_at column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks'
  AND column_name = 'submitted_at';

-- Expected: submitted_at | timestamp with time zone | YES

-- Verify migrated tasks exist
SELECT COUNT(*) as migrated_count
FROM tasks
WHERE title LIKE 'Submission: %';

-- Expected: 2 (one for each test submission_schedule)

-- Verify submitted_at data preserved
SELECT t.id, t.title, t.submitted_at, ss.submitted_at as original_submitted_at
FROM tasks t
JOIN submission_schedules ss ON ss.program_id = t.program_id AND ss.area_id = t.area_id
WHERE t.title LIKE 'Submission: %';

-- Expected: submitted_at values match original_submitted_at

-- Verify assigned_to is NOT NULL
SELECT COUNT(*) as null_assigned_to
FROM tasks
WHERE assigned_to IS NULL;

-- Expected: 0

-- Verify assigned_by is NOT NULL
SELECT COUNT(*) as null_assigned_by
FROM tasks
WHERE assigned_by IS NULL;

-- Expected: 0

-- Verify admin fallback worked (for program without chair)
SELECT t.id, t.title, t.assigned_to, p.role
FROM tasks t
JOIN profiles p ON p.id = t.assigned_to
WHERE t.title = 'Submission: Test Area No Chair';

-- Expected: assigned_to = admin user ID, role = 'admin'
```

**Pass Criteria:**
- ✅ submitted_at column exists
- ✅ 2 tasks migrated
- ✅ submitted_at values preserved
- ✅ No NULL assigned_to
- ✅ No NULL assigned_by
- ✅ Admin fallback used for program without chair

---

### Step 8: Verify Migration 026 Fix

```sql
-- Verify old policy is dropped
SELECT COUNT(*) as old_policy_count
FROM pg_policies
WHERE tablename = 'documents'
  AND policyname = 'Authenticated users can view documents';

-- Expected: 0

-- Verify new policies exist
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'documents'
  AND cmd = 'SELECT'
ORDER BY policyname;

-- Expected: 4 policies
-- 1. Accreditors can view assigned documents
-- 2. Admin, VPAA, QA, Dean can view all documents
-- 3. Area Chairs can view documents for their areas
-- 4. Users can view own documents

-- Verify no overly permissive policies
SELECT COUNT(*) as permissive_count
FROM pg_policies
WHERE tablename = 'documents'
  AND cmd = 'SELECT'
  AND qual LIKE '%authenticated%';

-- Expected: 0
```

**Pass Criteria:**
- ✅ Old policy dropped
- ✅ 4 new role-specific policies exist
- ✅ No overly permissive policies

---

## Success Criteria

### All Migrations Execute Successfully
- [ ] Migration 001-026 all complete with exit code 0
- [ ] No SQL errors during execution
- [ ] No FK constraint violations
- [ ] No NULL constraint violations

### Migration 015 Fix Verified
- [ ] workflow_id column exists in documents
- [ ] FK constraint to review_workflows exists
- [ ] No "relation does not exist" error

### Migration 018 Fix Verified
- [ ] submitted_at column exists in tasks
- [ ] 2 tasks migrated from submission_schedules
- [ ] submitted_at data preserved
- [ ] No NULL assigned_to or assigned_by
- [ ] Admin fallback works for programs without chairs

### Migration 026 Fix Verified
- [ ] Old "Authenticated users" policy dropped
- [ ] 4 new role-specific policies created
- [ ] No overly permissive policies remain

---

## Failure Criteria

### Critical Failures (STOP Testing)
- [ ] Any migration fails with SQL error
- [ ] FK constraint violation
- [ ] NULL constraint violation
- [ ] RLS policy creation error

### High Priority Failures (FIX Required)
- [ ] Missing columns
- [ ] Missing FK constraints
- [ ] Data migration failures
- [ ] Old policy not dropped

---

## Rollback Test

### Step 9: Test Rollback

```bash
# Disable all RLS policies first
psql %SUPABASE_DB_URL% -c "DROP POLICY IF EXISTS \"Admin, VPAA, QA, Dean can view all documents\" ON documents;"
psql %SUPABASE_DB_URL% -c "DROP POLICY IF EXISTS \"Accreditors can view assigned documents\" ON documents;"
psql %SUPABASE_DB_URL% -c "DROP POLICY IF EXISTS \"Area Chairs can view documents for their areas\" ON documents;"
psql %SUPABASE_DB_URL% -c "DROP POLICY IF EXISTS \"Users can view own documents\" ON documents;"

-- Drop added columns
psql %SUPABASE_DB_URL% -c "ALTER TABLE documents DROP COLUMN IF EXISTS workflow_id;"
psql %SUPABASE_DB_URL% -c "ALTER TABLE tasks DROP COLUMN IF EXISTS submitted_at;"

-- Verify clean state
\dt
-- Expected: Only original 9 tables (001-004)

-- Verify no new policies
SELECT COUNT(*) FROM pg_policies WHERE tablename = 'documents';
-- Expected: 4 (original policies from 003 only)
```

**Pass Criteria:**
- [ ] All added columns dropped
- [ ] All new policies dropped
- [ ] Database returns to pre-patch state

---

## Test Report Template

```markdown
# Clean-Room Test Report

**Date:** [Date]  
**Tester:** [Name]  
**Database:** [Supabase project name]  
**Result:** [PASS / FAIL]

## Migration Execution

| Migration | Status | Error |
|-----------|--------|-------|
| 001 | ✅ / ❌ | - |
| ... | ... | ... |
| 015 (PATCHED) | ✅ / ❌ | - |
| 016 (PATCHED) | ✅ / ❌ | - |
| 018 (PATCHED) | ✅ / ❌ | - |
| 026 | ✅ / ❌ | - |

## Verification Results

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| workflow_id column | Exists | [Result] | [ ] Pass [ ] Fail |
| FK constraint | Exists | [Result] | [ ] Pass [ ] Fail |
| submitted_at column | Exists | [Result] | [ ] Pass [ ] Fail |
| Migrated tasks | 2 | [Result] | [ ] Pass [ ] Fail |
| NULL assigned_to | 0 | [Result] | [ ] Pass [ ] Fail |
| Old policy dropped | 0 | [Result] | [ ] Pass [ ] Fail |
| New policies | 4 | [Result] | [ ] Pass [ ] Fail |

## Issues Found

[List any issues]

## Sign-Off

- [ ] All migrations pass
- [ ] All verifications pass
- [ ] Ready for security testing

**Approved by:** [Name]  
**Date:** [Date]
```

---

## Automated Test Script

Create `run_clean_room_test.sh`:

```bash
#!/bin/bash
set -e

DB_URL=$1
MIGRATION_DIR=$2

if [ -z "$DB_URL" ] || [ -z "$MIGRATION_DIR" ]; then
    echo "Usage: ./run_clean_room_test.sh <database_url> <migration_dir>"
    exit 1
fi

echo "=== Starting Clean-Room Migration Test ==="
echo ""

# Run migrations
for migration in $(ls $MIGRATION_DIR/*.sql | sort); do
    echo "Running: $migration"
    if ! psql $DB_URL -f $migration 2>&1; then
        echo "FAILED: $migration"
        exit 1
    fi
    echo "SUCCESS: $migration"
done

echo ""
echo "=== All Migrations Completed ==="
echo ""

# Run verification queries
echo "=== Running Verification Queries ==="

echo "Check 1: workflow_id column"
psql $DB_URL -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'workflow_id';"

echo "Check 2: FK constraint"
psql $DB_URL -c "SELECT conname FROM pg_constraint WHERE conrelid = 'documents'::regclass AND conname = 'fk_documents_workflow';"

echo "Check 3: submitted_at column"
psql $DB_URL -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'submitted_at';"

echo "Check 4: Migrated tasks count"
psql $DB_URL -c "SELECT COUNT(*) FROM tasks WHERE title LIKE 'Submission: %';"

echo "Check 5: NULL assigned_to"
psql $DB_URL -c "SELECT COUNT(*) FROM tasks WHERE assigned_to IS NULL;"

echo "Check 6: Old policy dropped"
psql $DB_URL -c "SELECT COUNT(*) FROM pg_policies WHERE tablename = 'documents' AND policyname = 'Authenticated users can view documents';"

echo "Check 7: New policies count"
psql $DB_URL -c "SELECT COUNT(*) FROM pg_policies WHERE tablename = 'documents' AND cmd = 'SELECT';"

echo ""
echo "=== Clean-Room Test Complete ==="
```

Usage:
```bash
chmod +x run_clean_room_test.sh
./run_clean_room_test.sh %SUPABASE_DB_URL% supabase/migrations
```

---

**Test Plan Status:** READY FOR EXECUTION  
**Estimated Time:** 2-3 hours  
**Required:** Database Administrator