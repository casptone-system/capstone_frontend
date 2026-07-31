-- =====================================================
-- PATCH 018: Fix NULL Constraint Violation and Data Loss
-- =====================================================
--
-- ISSUES:
-- 1. COALESCE(aca.chair_id, p.chair) can return NULL
--    - tasks.assigned_to is NOT NULL
--    - tasks.assigned_by is NOT NULL
--    - Will cause: ERROR: null value in column "assigned_to" violates not-null constraint
--
-- 2. submission_schedules.submitted_at not migrated
--    - Data loss: submission timestamps will be lost
-- So, if you can't always support each other, enco So if you can't always support each other, encourage each other breakfast with energy. I need to make sure your citations are solid. Grammarly can help citation finder identify.
-- FIX:
-- 1. Add submitted_at column to tasks table
-- 2. Use admin fallback instead of COALESCE that can return NULL
-- 3. Migrate submitted_at data
--
-- AFFECTED MIGRATION: 018_deprecate_submission_schedules.sql
-- LINES TO MODIFY: 11-38
-- =====================================================

-- =====================================================
-- ORIGINAL SQL (from 018_deprecate_submission_schedules.sql lines 11-38)
-- =====================================================
-- INSERT INTO tasks (
--   title, 
--   description, 
--   program_id, 
--   area_id, 
--   assigned_to, 
--   assigned_by, 
--   due_date, 
--   status,
--   created_at,
--   updated_at
-- )
-- SELECT 
--   'Submission: ' || aa.name,
--   'Submit accreditation area documentation',
--   ss.program_id,
--   ss.area_id,
--   COALESCE(aca.chair_id, p.chair),
--   COALESCE(aca.chair_id, p.chair),
--   ss.due_date,
--   CASE ss.status 
--     WHEN 'submitted' THEN 'completed'
--     WHEN 'approved' THEN 'completed'
--     WHEN 'rejected' THEN 'cancelled'
--     ELSE 'not-started'
--   END,
--   ss.created_at,
--   ss.updated_at
-- FROM submission_schedules ss
-- JOIN accreditation_areas aa ON aa.id = ss.area_id
-- JOIN programs p ON p.id = ss.program_id
-- LEFT JOIN area_chair_assignments aca ON aca.area_id = aa.id AND aca.is_current = true

-- =====================================================
-- REPLACEMENT SQL
-- =====================================================

-- Step 1: Add submitted_at column to preserve submission timestamp
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;

-- Step 2: Pre-flight validation
-- Verify that at least one admin profile exists for task assignment fallback
-- This ensures COALESCE will always return a valid profile UUID
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM profiles
    WHERE role = 'admin'
  ) THEN
    RAISE EXCEPTION
      'Migration 018 requires at least one admin profile for task assignment fallback. '
      'Please create an admin user via Supabase Auth UI before running this migration.';
  END IF;
END $$;

-- Step 3: Migrate existing submission_schedules to tasks
-- This is a one-time migration
-- IMPORTANT: Task ownership is REQUIRED by business rules (NOT NULL constraints)
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
  COALESCE(aca.chair_id, p.chair, (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),  -- Use chair or admin fallback
  COALESCE(aca.chair_id, p.chair, (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),  -- Use chair or admin fallback
  ss.due_date,
  CASE ss.status 
    WHEN 'submitted' THEN 'completed'
    WHEN 'approved' THEN 'completed'
    WHEN 'rejected' THEN 'cancelled'
    ELSE 'not-started'
  END,
  ss.submitted_at,  -- Preserve submission timestamp
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

-- =====================================================
-- EXPLANATION
-- =====================================================
--
-- ISSUE 1: NULL Constraint Violation
-- ----------------------------------
-- The original COALESCE(aca.chair_id, p.chair) can return NULL when:
-- - aca.chair_id is NULL (no current area chair assignment from LEFT JOIN)
-- - AND p.chair is NULL (program has no chair)
--
-- Evidence:
-- - programs.chair is nullable (001_schema.sql line 51: no NOT NULL constraint)
-- - tasks.assigned_to is NOT NULL (009_create_tasks.sql line 14)
-- - tasks.assigned_by is NOT NULL (009_create_tasks.sql line 15)
--
-- When COALESCE returns NULL, PostgreSQL errors:
-- ERROR: null value in column "assigned_to" violates not-null constraint
--
-- FIX:
-- Added fallback: (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
-- This ensures COALESCE always returns a valid profile UUID
-- If no admin exists, the subquery returns NULL, but this is extremely unlikely
-- in a production system (admin should always exist)
--
-- FOREIGN KEY INTEGRITY: Preserved - always references valid profiles.id
-- DATA INTEGRITY: Preserved - NOT NULL constraint satisfied
-- SUPABASE COMPATIBILITY: Compatible - uses standard SQL
-- ROLLBACK SAFETY: Safe - can drop submitted_at column if needed
--
-- ISSUE 2: Data Loss
-- ------------------
-- The original migration does not include submitted_at column
-- Source: submission_schedules.submitted_at (001_schema.sql line 100)
-- Destination: tasks table had no submitted_at column
--
-- FIX:
-- Added submitted_at column to tasks table
-- Migrated submitted_at data from submission_schedules
-- Preserves submission timestamps
--
-- DATA INTEGRITY: Preserved - submitted_at data migrated
-- BACKWARD COMPATIBILITY: Maintained - new column is nullable
-- =====================================================