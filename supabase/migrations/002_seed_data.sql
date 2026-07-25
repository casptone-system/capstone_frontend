-- =====================================================
-- ADAMS - Seed Data
-- Run this AFTER 001_schema.sql in Supabase SQL Editor
-- NOTE: Auth users must be created first via Supabase Auth UI
-- =====================================================

-- Fix: Remove NOT NULL constraint from notifications.user_id (for existing tables)
ALTER TABLE notifications ALTER COLUMN user_id DROP NOT NULL;

-- =====================================================
-- 1. DEMO PROFILES (insert manually when users are created)
-- These are placeholders - actual user IDs come from auth.users
-- After creating users in Supabase Auth dashboard, update these IDs
-- =====================================================

-- Sample Programs
INSERT INTO programs (id, name, code, accreditation_status, compliance_score) VALUES
  ('a1000001-0000-0000-0000-000000000001', 'Bachelor of Science in Computer Science', 'BSCS', 'compliant', 92),
  ('a1000001-0000-0000-0000-000000000002', 'Bachelor of Science in Engineering', 'BSEng', 'at-risk', 68),
  ('a1000001-0000-0000-0000-000000000003', 'Bachelor of Science in Nursing', 'BSN', 'compliant', 88),
  ('a1000001-0000-0000-0000-000000000004', 'Bachelor of Business Administration', 'BBA', 'non-compliant', 45),
  ('a1000001-0000-0000-0000-000000000005', 'Bachelor of Arts in Education', 'BAEd', 'compliant', 95)
ON CONFLICT (id) DO NOTHING;

-- Sample Accreditation Areas
INSERT INTO accreditation_areas (id, name, code, description, assigned_to, status, due_date, program_id) VALUES
  ('b2000001-0000-0000-0000-000000000001', 'Student Learning Outcomes', 'SLO-001', 'Assessment of student learning outcomes across all programs', '{}', 'in-progress', '2026-03-15', 'a1000001-0000-0000-0000-000000000001'),
  ('b2000001-0000-0000-0000-000000000002', 'Faculty Development', 'FD-002', 'Faculty qualifications, development programs, and performance evaluation', '{}', 'in-progress', '2026-04-01', 'a1000001-0000-0000-0000-000000000001'),
  ('b2000001-0000-0000-0000-000000000003', 'Curriculum Design', 'CD-003', 'Curriculum relevance, industry alignment, and continuous improvement', '{}', 'not-started', '2026-05-01', 'a1000001-0000-0000-0000-000000000002'),
  ('b2000001-0000-0000-0000-000000000004', 'Research Output', 'RO-004', 'Faculty and student research publications and citations', '{}', 'completed', '2025-12-15', 'a1000001-0000-0000-0000-000000000003'),
  ('b2000001-0000-0000-0000-000000000005', 'Community Engagement', 'CE-005', 'Extension programs and community outreach activities', '{}', 'in-progress', '2026-06-01', 'a1000001-0000-0000-0000-000000000004'),
  ('b2000001-0000-0000-0000-000000000006', 'Library Resources', 'LR-006', 'Library facilities, resources, and information access', '{}', 'not-started', '2026-07-01', 'a1000001-0000-0000-0000-000000000005'),
  ('b2000001-0000-0000-0000-000000000007', 'Laboratory Facilities', 'LF-007', 'Laboratory equipment, safety standards, and utilization', '{}', 'submitted', '2026-02-01', 'a1000001-0000-0000-0000-000000000001'),
  ('b2000001-0000-0000-0000-000000000008', 'Student Services', 'SS-008', 'Student support services, guidance, and extracurricular activities', '{}', 'in-progress', '2026-08-01', 'a1000001-0000-0000-0000-000000000003')
ON CONFLICT (id) DO NOTHING;

-- Sample Documents
INSERT INTO documents (id, title, area, program, file_url, file_size, version, status, created_at) VALUES
  ('c3000001-0000-0000-0000-000000000001', 'Program Learning Outcomes 2025-26', 'Student Learning Outcomes', 'Computer Science', '/documents/sample/PLO_2025_26.pdf', 2457600, 3, 'approved', '2026-01-15T08:00:00Z'),
  ('c3000001-0000-0000-0000-000000000002', 'Assessment Results Summary', 'Faculty Development', 'Computer Science', '/documents/sample/Assessment_Summary.pdf', 1835008, 2, 'pending', '2026-02-20T10:30:00Z'),
  ('c3000001-0000-0000-0000-000000000003', 'Faculty Development Plan', 'Faculty Development', 'Engineering', '/documents/sample/Faculty_Dev_Plan.pdf', 1048576, 1, 'revision', '2026-03-05T14:00:00Z'),
  ('c3000001-0000-0000-0000-000000000004', 'Lab Equipment Inventory', 'Laboratory Facilities', 'Computer Science', '/documents/sample/Lab_Inventory.xlsx', 524288, 4, 'approved', '2026-01-10T09:00:00Z'),
  ('c3000001-0000-0000-0000-000000000005', 'Research Publication List', 'Research Output', 'Nursing', '/documents/sample/Research_Pubs.pdf', 2097152, 2, 'approved', '2025-12-01T11:00:00Z'),
  ('c3000001-0000-0000-0000-000000000006', 'Curriculum Map 2025', 'Curriculum Design', 'Engineering', '/documents/sample/Curriculum_Map_2025.pdf', 3145728, 1, 'pending', '2026-03-10T16:00:00Z'),
  ('c3000001-0000-0000-0000-000000000007', 'Community Extension Report', 'Community Engagement', 'Business Administration', '/documents/sample/Extension_Report.pdf', 1572864, 2, 'revision', '2026-02-28T13:00:00Z'),
  ('c3000001-0000-0000-0000-000000000008', 'Library Usage Statistics', 'Library Resources', 'Education', '/documents/sample/Library_Stats.pdf', 786432, 1, 'pending', '2026-03-20T08:30:00Z')
ON CONFLICT (id) DO NOTHING;

-- Submission Schedules
INSERT INTO submission_schedules (id, area_id, program_id, due_date, status, submitted_at) VALUES
  ('d4000001-0000-0000-0000-000000000001', 'b2000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001', '2026-03-15', 'pending', NULL),
  ('d4000001-0000-0000-0000-000000000002', 'b2000001-0000-0000-0000-000000000004', 'a1000001-0000-0000-0000-000000000003', '2025-12-15', 'submitted', '2025-12-10T09:00:00Z'),
  ('d4000001-0000-0000-0000-000000000003', 'b2000001-0000-0000-0000-000000000007', 'a1000001-0000-0000-0000-000000000001', '2026-02-01', 'submitted', '2026-01-28T14:00:00Z'),
  ('d4000001-0000-0000-0000-000000000004', 'b2000001-0000-0000-0000-000000000003', 'a1000001-0000-0000-0000-000000000002', '2026-05-01', 'pending', NULL),
  ('d4000001-0000-0000-0000-000000000005', 'b2000001-0000-0000-0000-000000000002', 'a1000001-0000-0000-0000-000000000001', '2026-04-01', 'pending', NULL)
ON CONFLICT (id) DO NOTHING;

-- Compliance Scores
INSERT INTO compliance_scores (id, area_id, program_id, score, trend, last_updated) VALUES
  ('e5000001-0000-0000-0000-000000000001', 'b2000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001', 92, 5, '2026-03-01T00:00:00Z'),
  ('e5000001-0000-0000-0000-000000000002', 'b2000001-0000-0000-0000-000000000002', 'a1000001-0000-0000-0000-000000000001', 78, -2, '2026-03-01T00:00:00Z'),
  ('e5000001-0000-0000-0000-000000000003', 'b2000001-0000-0000-0000-000000000003', 'a1000001-0000-0000-0000-000000000002', 55, 10, '2026-03-01T00:00:00Z'),
  ('e5000001-0000-0000-0000-000000000004', 'b2000001-0000-0000-0000-000000000004', 'a1000001-0000-0000-0000-000000000003', 95, 3, '2026-03-01T00:00:00Z'),
  ('e5000001-0000-0000-0000-000000000005', 'b2000001-0000-0000-0000-000000000005', 'a1000001-0000-0000-0000-000000000004', 40, -8, '2026-03-01T00:00:00Z'),
  ('e5000001-0000-0000-0000-000000000006', 'b2000001-0000-0000-0000-000000000006', 'a1000001-0000-0000-0000-000000000005', 88, 12, '2026-03-01T00:00:00Z'),
  ('e5000001-0000-0000-0000-000000000007', 'b2000001-0000-0000-0000-000000000007', 'a1000001-0000-0000-0000-000000000001', 90, 0, '2026-03-01T00:00:00Z'),
  ('e5000001-0000-0000-0000-000000000008', 'b2000001-0000-0000-0000-000000000008', 'a1000001-0000-0000-0000-000000000003', 72, 15, '2026-03-01T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Activity Log
INSERT INTO activity_log (id, title, status, icon, color, created_at) VALUES
  ('f6000001-0000-0000-0000-000000000001', 'Program Learning Outcomes approved', 'approved', 'checkmark-circle-outline', 'rgba(34, 197, 94, 0.1)', NOW() - INTERVAL '2 hours'),
  ('f6000001-0000-0000-0000-000000000002', 'Assessment report submitted', 'submitted', 'document-outline', 'rgba(59, 130, 246, 0.1)', NOW() - INTERVAL '5 hours'),
  ('f6000001-0000-0000-0000-000000000003', 'Revision requested for outcomes document', 'revision', 'alert-circle-outline', 'rgba(245, 158, 11, 0.1)', NOW() - INTERVAL '1 day'),
  ('f6000001-0000-0000-0000-000000000004', 'New faculty member added to program', 'completed', 'person-add-outline', 'rgba(34, 197, 94, 0.1)', NOW() - INTERVAL '2 days'),
  ('f6000001-0000-0000-0000-000000000005', 'Lab inspection completed successfully', 'completed', 'flask-outline', 'rgba(34, 197, 94, 0.1)', NOW() - INTERVAL '3 days'),
  ('f6000001-0000-0000-0000-000000000006', 'Compliance report generated for Dean review', 'submitted', 'bar-chart-outline', 'rgba(59, 130, 246, 0.1)', NOW() - INTERVAL '4 days'),
  ('f6000001-0000-0000-0000-000000000007', 'Curriculum changes submitted for approval', 'submitted', 'layers-outline', 'rgba(59, 130, 246, 0.1)', NOW() - INTERVAL '5 days'),
  ('f6000001-0000-0000-0000-000000000008', 'Extension program completed with 200+ beneficiaries', 'completed', 'heart-outline', 'rgba(34, 197, 94, 0.1)', NOW() - INTERVAL '6 days')
ON CONFLICT (id) DO NOTHING;

-- Notifications
INSERT INTO notifications (id, user_id, title, message, type, read, created_at) VALUES
  ('a7000001-0000-0000-0000-000000000001', NULL, 'Submission Deadline Approaching', 'The submission deadline for "Student Learning Outcomes" is in 7 days.', 'warning', false, NOW() - INTERVAL '1 day'),
  ('a7000001-0000-0000-0000-000000000002', NULL, 'Document Approved', 'Your document "Program Learning Outcomes 2025-26" has been approved.', 'success', false, NOW() - INTERVAL '3 days'),
  ('a7000001-0000-0000-0000-000000000003', NULL, 'Revision Requested', 'The Dean has requested revisions on "Faculty Development Plan".', 'info', true, NOW() - INTERVAL '5 days'),
  ('a7000001-0000-0000-0000-000000000004', NULL, 'New Accreditation Area Assigned', 'You have been assigned to "Laboratory Facilities" accreditation area.', 'info', false, NOW() - INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;
