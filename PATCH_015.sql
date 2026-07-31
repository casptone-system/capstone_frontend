-- =====================================================
-- PATCH 015: Fix Foreign Key Dependency
-- =====================================================
--
-- ISSUE: Migration 015 references review_workflows table
-- before it is created in migration 016.
--
-- FIX: Remove FK constraint in 015, add it in 016
--
-- AFFECTED MIGRATION: 015_enhance_documents.sql
-- LINES TO MODIFY: 7-8
-- =====================================================

-- =====================================================
-- ORIGINAL SQL (from 015_enhance_documents.sql lines 7-8)
-- =====================================================
-- ALTER TABLE documents 
--   ADD COLUMN IF NOT EXISTS workflow_id UUID REFERENCES review_workflows(id) ON DELETE SET NULL,

-- =====================================================
-- REPLACEMENT SQL
-- =====================================================
-- Remove FK constraint temporarily - review_workflows doesn't exist yet
-- FK constraint will be added in migration 016 after table creation

ALTER TABLE documents 
  ADD COLUMN IF NOT EXISTS workflow_id UUID;

-- =====================================================
-- EXPLANATION
-- =====================================================
-- The original SQL creates a foreign key constraint to review_workflows(id)
-- However, review_workflows table is created in migration 016, which runs AFTER 015
-- This causes: ERROR: relation "review_workflows" does not exist
--
-- The fix removes the FK constraint from 015 and adds it in 016
-- The column is still created, just without the constraint initially
-- The constraint is added immediately after in migration 016
--
-- IMPORTANT FOR PRODUCTION: Migration 016 must validate existing data before adding FK
-- See PATCH_016.sql for data validation step
--
-- FOREIGN KEY INTEGRITY: Preserved - FK added in 016
-- DATA INTEGRITY: Preserved - column created in 015, constraint in 016
-- SUPABASE COMPATIBILITY: Compatible - uses standard ALTER TABLE
-- ROLLBACK SAFETY: Safe - can drop column if needed
-- =====================================================
