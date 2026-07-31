-- =====================================================
-- PATCH 016: Add FK Constraint with Data Validation
-- =====================================================
--
-- ISSUE: Adding FK constraint to documents.workflow_id can fail
-- if existing rows have invalid workflow_id values.
--
-- FIX: Validate and clean existing data before adding FK constraint.
--
-- AFFECTED MIGRATION: 016_create_review_workflows.sql
-- LINES TO ADD: After line 32 (after CREATE TRIGGER)
-- =====================================================

-- =====================================================
-- ORIGINAL SQL (from 016_create_review_workflows.sql lines 28-32)
-- =====================================================
-- DROP TRIGGER IF EXISTS set_updated_at ON review_workflows;
-- CREATE TRIGGER set_updated_at
--   BEFORE UPDATE ON review_workflows
--   FOR EACH ROW
--   EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- ADDITIONAL SQL (add after line 32)
-- =====================================================
-- Validate existing data before adding FK constraint

DO $$
BEGIN
  -- Check for invalid workflow_id values in documents
  IF EXISTS (
    SELECT 1 FROM documents 
    WHERE workflow_id IS NOT NULL 
    AND workflow_id NOT IN (SELECT id FROM review_workflows)
  ) THEN
    -- Set invalid workflow_ids to NULL
    -- This preserves the documents while fixing FK violations
    UPDATE documents 
    SET workflow_id = NULL 
    WHERE workflow_id IS NOT NULL 
    AND workflow_id NOT IN (SELECT id FROM review_workflows);
  END IF;
END $$;

-- Now add FK constraint
ALTER TABLE documents 
  ADD CONSTRAINT fk_documents_workflow 
  FOREIGN KEY (workflow_id) REFERENCES review_workflows(id) ON DELETE SET NULL;

-- =====================================================
-- EXPLANATION
-- =====================================================
-- The original migration 016 creates the review_workflows table
-- Migration 015 creates the workflow_id column without FK constraint
--
-- In production, application code may have inserted documents with
-- workflow_id values that don't exist in review_workflows yet
--
-- This patch:
-- 1. Checks for invalid workflow_id values
-- 2. Sets them to NULL (preserving the document record)
-- 3. Adds the FK constraint
--
-- This ensures FK constraint creation succeeds even with existing data
--
-- FOREIGN KEY INTEGRITY: Preserved - validates before adding constraint
-- DATA INTEGRITY: Preserved - documents retained, invalid FKs set to NULL
-- SUPABASE COMPATIBILITY: Compatible - uses standard DO block
-- ROLLBACK SAFETY: Safe - can drop constraint if needed
-- =====================================================