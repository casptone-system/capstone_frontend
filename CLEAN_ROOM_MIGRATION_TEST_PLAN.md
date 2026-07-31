# ADAMS Clean-Room Migration Test Plan
## Complete Migration Test from Empty Database

**Date:** 2026-07-24  
**Purpose:** Verify all migrations execute successfully on empty database  
**Status:** TEST PLAN

---

## Test Environment Setup

### Prerequisites

1. **Create New Supabase Project**
   - Project name: `adams-migration-test`
   - Region: Closest to development location
   - Database password: Secure password
   - Enable all extensions (uuid-ossp, pgcrypto)

2. **Get Database Connection String**
   - From Supabase dashboard: Settings → Database → Connection string
   - Format: `postgresql://postgres:[password]@[host]:5432/postgres`

3. **Install psql Client**
   ```bash
   # Windows (using winget)
   winget install PostgreSQL.PostgreSQL
   
   # Verify installation
   psql --version
   ```

4. **Set Environment Variables**
   ```bash
   set SUPABASE_DB_URL=postgresql://postgres:[password]@[host]:5432/postgres
   ```

---

## Test Execution Steps

### Step 1: Initialize Empty Database

```bash
# Connect to database
psql %SUPABASE_DB_URL%

# Verify empty database
\dt
-- Expected: No tables listed

\dx
-- Expected: Only default extensions

\q
```

### Step 2: Run Migrations in Order

```bash
# Set migration directory
set MIGRATION_DIR=supabase/migrations

# Run each migration sequentially
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/001_schema.sql
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/002_seed_data.sql
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/003_rls_policies.sql
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/004_update_signup_trigger.sql
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/005_create_colleges.sql
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/006_add_college_to_programs.sql
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/007_create_accreditation_instruments.sql
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/008_create_instrument_criteria.sql
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/009_create_tasks.sql
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/010_create_task_progress.sql
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/011_update_roles.sql
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/012_create_role_assignments.sql
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/013_create_area_chair_assignments.sql
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/014_migrate_assignments.sql
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/015_enhance_documents.sql
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/016_create_review_workflows.sql
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/017_create_review_steps.sql
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/018_deprecate_submission_schedules.sql
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/019_create_accreditation_cycles.sql
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/020_enhance_cycles_validity.sql
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/021_create_validity_alerts.sql
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/022_create_institutional_reviews.sql
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/023_create_task_evidence_requirements.sql
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/024_create_aggregation_views.sql
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/025_update_rls_policies.sql
psql %SUPABASE_DB_URL% -f %MIGRATION_DIR%/026_fix_document_rls.sql
```

**Expected Result:** All migrations execute without errors

---

## Verification Queries

### Step 3: Verify All Tables Created

```sql
-- Connect to database
psql %SUPABASE_DB_URL%

-- List all tables
\dt
```

**Expected Tables:**
- profiles
- programs
- accreditation_areas
- documents
- submission_schedules
- compliance_scores
- audit_logs
- notifications
- activity_log
- colleges
- accreditation_instruments
- instrument_criteria
- tasks
- task_progress
- role_assignments
- area_chair_assignments
- review_workflows
- review_steps
- accreditation_cycles
- accreditation_validity_alerts
- institutional_reviews
- task_evidence_requirements

**Total:** 22 tables

### Step 4: Verify All Columns Exist

```sql
-- Check documents table has new columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'documents'
ORDER BY ordinal_position;
```

**Expected New Columns:**
- workflow_id (uuid, YES)
- current_reviewer (uuid, YES)
- review_status (text, YES)
- task_id (uuid, YES)
- instrument_criteria_id (uuid, YES)
- evidence_type (text, YES)
- is_mandatory (boolean, NO)

```sql
-- Check tasks table has submitted_at column
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks'
ORDER BY ordinal_position;
```

**Expected New Column:**
- submitted_at (timestamp with time zone, YES)

```sql
-- Check accreditation_cycles has expiration_date column
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'accreditation_cycles'
ORDER BY ordinal_position;
```

**Expected Column:**
- expiration_date (date, YES)

### Step 5: Verify Foreign Keys

```sql
-- Check documents.workflow_id FK constraint
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE conrelid = 'documents'::regclass
  AND conname = 'fk_documents_workflow';
```

**Expected:** One row showing documents → review_workflows

```sql
-- Check all foreign keys on tasks
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE conrelid = 'tasks'::regclass
  AND contype = 'f';
```

**Expected:** 5 foreign keys (program_id, area_id, instrument_criteria_id, assigned_to, assigned_by)

### Step 6: Verify Indexes

```sql
-- Check indexes on task_progress
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'task_progress';
```

**Expected Indexes:**
- idx_task_progress_task (task_id)
- idx_task_progress_created (created_at DESC)
- idx_task_progress_task_created (task_id, created_at DESC) - COMPOSITE

```sql
-- Check indexes on documents
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'documents';
```

**Expected Indexes:**
- idx_documents_workflow (workflow_id)
- idx_documents_reviewer (current_reviewer)
- idx_documents_task (task_id)
- idx_documents_evidence_type (evidence_type)
- idx_documents_criteria (instrument_criteria_id)

### Step 7: Verify RLS Policies

```sql
-- Check all policies on documents
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'documents'
ORDER BY policyname;
```

**Expected Policies:**
1. Admin, VPAA, QA, Dean can view all documents (SELECT)
2. Accreditors can view assigned documents (SELECT)
3. Area Chairs can view documents for their areas (SELECT)
4. Users can view own documents (SELECT)
5. Users can upload documents (INSERT) - from 003
6. Users can update own documents (UPDATE) - from 003
7. Deans can update any document (UPDATE) - from 003

**Total:** 7 policies

```sql
-- Verify old policy is DROPPED
SELECT COUNT(*) as old_policy_count
FROM pg_policies
WHERE tablename = 'documents'
  AND policyname = 'Authenticated users can view documents';
```

**Expected:** 0 (policy should be dropped)

### Step 8: Verify Views

```sql
-- Check all views exist
SELECT viewname, viewdefinition
FROM pg_views
WHERE viewname IN (
  'college_progress_summary',
  'program_progress_summary',
  'area_progress_summary',
  'task_evidence_completeness',
  'accreditation_validity_dashboard'
);
```

**Expected:** 5 views

### Step 9: Verify Triggers

```sql
-- Check triggers on accreditation_cycles
SELECT trigger_name, event_manipulation, action_timing, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'accreditation_cycles';
```

**Expected Triggers:**
- set_updated_at (BEFORE UPDATE)
- set_expiration_date (BEFORE INSERT OR UPDATE)

```sql
-- Check triggers on review_workflows
SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers
WHERE event_object_table = 'review_workflows';
```

**Expected:** set_updated_at (BEFORE UPDATE)

### Step 10: Verify Data Migrations

```sql
-- Check area_chair_assignments has data (if programs had chairs)
SELECT COUNT(*) as assignment_count
FROM area_chair_assignments;
```

**Expected:** Count of migrated assignments (or 0 if no data)

```sql
-- Check role_assignments has data (if areas had assigned_to)
SELECT COUNT(*) as role_assignment_count
FROM role_assignments;
```

**Expected:** Count of migrated role assignments (or 0 if no data)

```sql
-- Check tasks has migrated submission_schedules
SELECT COUNT(*) as migrated_tasks
FROM tasks
WHERE title LIKE 'Submission: %';
```

**Expected:** Count of migrated submission schedules (or 0 if no data)

---

## Success Criteria

### All Migrations Execute Successfully
- [ ] No SQL errors during migration execution
- [ ] All 26 migrations complete without failure
- [ ] Exit code 0 for all migrations

### All Tables Created
- [ ] 22 tables exist in database
- [ ] All tables have correct columns
- [ ] All foreign keys valid

### All Indexes Created
- [ ] Composite index on task_progress exists
- [ ] All FK columns indexed
- [ ] No missing critical indexes

### All RLS Policies Created
- [ ] Old "Authenticated users" policy dropped
- [ ] New role-specific policies created
- [ ] No policy conflicts

### All Views Created
- [ ] 5 aggregation views exist
- [ ] Views query without errors

### All Triggers Created
- [ ] Updated_at triggers on all new tables
- [ ] Expiration date trigger on accreditation_cycles

### Data Migrations Complete
- [ ] area_chair_assignments populated
- [ ] role_assignments populated
- [ ] tasks has migrated submission_schedules
- [ ] No NULL constraint violations

---

## Failure Criteria

### Critical Failures (STOP Testing)
- [ ] Any migration fails with SQL error
- [ ] Foreign key constraint violation
- [ ] RLS policy creation error
- [ ] Trigger creation error

### High Priority Failures (FIX Required)
- [ ] Missing tables
- [ ] Missing columns
- [ ] Missing indexes
- [ ] Data migration failures

### Medium Priority Failures (WARN)
- [ ] Views fail to create
- [ ] Triggers fail to create
- [ ] Empty data migrations (no data to migrate)

---

## Rollback Test

### Step 11: Test Rollback Script

```bash
# Run rollback script
psql %SUPABASE_DB_URL% -f ROLLBACK_SCRIPT.sql
```

**Expected Result:**
- All policies dropped
- All triggers dropped
- All views dropped
- All tables dropped
- All columns removed
- Original role constraint restored

### Step 12: Verify Clean State

```sql
-- Verify no tables remain
\dt
-- Expected: Only original 9 tables (001-004)

-- Verify no policies remain
SELECT COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('colleges', 'role_assignments', 'area_chair_assignments', 
                    'accreditation_instruments', 'instrument_criteria', 'tasks', 
                    'task_progress', 'review_workflows', 'review_steps',
                    'accreditation_cycles', 'accreditation_validity_alerts',
                    'institutional_reviews', 'task_evidence_requirements', 'documents');
-- Expected: 0 (or only original policies from 003)
```

---

## Test Report Template

```markdown
# Clean-Room Migration Test Report

**Date:** [Date]  
**Tester:** [Name]  
**Database:** [Supabase project name]  
**Result:** [PASS / FAIL]

## Migration Execution Results

| Migration | Status | Error (if any) |
|-----------|--------|----------------|
| 001_schema.sql | ✅ / ❌ | [Error message] |
| 002_seed_data.sql | ✅ / ❌ | [Error message] |
| ... | ... | ... |
| 026_fix_document_rls.sql | ✅ / ❌ | [Error message] |

## Verification Results

| Check | Status | Notes |
|-------|--------|-------|
| All tables created | ✅ / ❌ | [Notes] |
| All columns exist | ✅ / ❌ | [Notes] |
| All foreign keys valid | ✅ / ❌ | [Notes] |
| All indexes created | ✅ / ❌ | [Notes] |
| RLS policies correct | ✅ / ❌ | [Notes] |
| Views created | ✅ / ❌ | [Notes] |
| Triggers created | ✅ / ❌ | [Notes] |
| Data migrations complete | ✅ / ❌ | [Notes] |

## Rollback Test Results

| Step | Status | Notes |
|------|--------|-------|
| Rollback script executes | ✅ / ❌ | [Notes] |
| All policies dropped | ✅ / ❌ | [Notes] |
| All tables dropped | ✅ / ❌ | [Notes] |
| Clean state achieved | ✅ / ❌ | [Notes] |

## Issues Found

[List any issues discovered during testing]

## Sign-Off

- [ ] All migrations pass
- [ ] All verifications pass
- [ ] Rollback test passes
- [ ] Ready for security testing

**Approved by:** [Name]  
**Date:** [Date]
```

---

## Automated Test Script (Optional)

Create `test_migrations.sh`:

```bash
#!/bin/bash
set -e  # Exit on error

DB_URL=$1
MIGRATION_DIR=$2

if [ -z "$DB_URL" ] || [ -z "$MIGRATION_DIR" ]; then
    echo "Usage: ./test_migrations.sh <database_url> <migration_dir>"
    exit 1
fi

echo "Starting clean-room migration test..."

# Run migrations
for migration in $(ls $MIGRATION_DIR/*.sql | sort); do
    echo "Running: $migration"
    psql $DB_URL -f $migration
    if [ $? -ne 0 ]; then
        echo "FAILED: $migration"
        exit 1
    fi
    echo "SUCCESS: $migration"
done

echo "All migrations completed successfully!"

# Run verification queries
echo "Running verification queries..."
psql $DB_URL -c "\dt" -c "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public'"
psql $DB_URL -c "SELECT COUNT(*) as policy_count FROM pg_policies WHERE tablename = 'documents'"

echo "Test complete!"
```

Usage:
```bash
chmod +x test_migrations.sh
./test_migrations.sh %SUPABASE_DB_URL% supabase/migrations
```

---

**Test Plan Status:** READY FOR EXECUTION  
**Estimated Time:** 2-3 hours  
**Required:** Database Administrator, QA Engineer