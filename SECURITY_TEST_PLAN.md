# ADAMS Security Test Plan
## RLS Policy Verification for Document Access

**Date:** 2026-07-24  
**Purpose:** Verify role-based document access controls  
**Status:** TEST PLAN

---

## Test Environment Setup

### Prerequisites

1. **Complete Clean-Room Migration Test First**
   - All migrations 001-026 must execute successfully
   - Database must be in clean state with all tables, policies, and data

2. **Create Test Users**
   
   Use Supabase Auth to create test users with specific roles:
   
   ```sql
   -- Insert test users into auth.users (via Supabase Auth API or admin)
   -- Then create corresponding profiles
   
   INSERT INTO profiles (id, name, email, role, institution, created_at) VALUES
   ('00000000-0000-0000-0000-000000000001', 'Admin User', 'admin@test.com', 'admin', 'Test University', NOW()),
   ('00000000-0000-0000-0000-000000000002', 'VPAA User', 'vpaa@test.com', 'vpaa', 'Test University', NOW()),
   ('00000000-0000-0000-0000-000000000003', 'Dean User', 'dean@test.com', 'dean', 'Test University', NOW()),
   ('00000000-0000-0000-0000-000000000004', 'QA User', 'qa@test.com', 'qa', 'Test University', NOW()),
   ('00000000-0000-0000-0000-000000000005', 'Area Chair User', 'areachair@test.com', 'area-chair', 'Test University', NOW()),
   ('00000000-0000-0000-0000-000000000006', 'Faculty User', 'faculty@test.com', 'faculty', 'Test University', NOW()),
   ('00000000-0000-0000-0000-000000000007', 'Accreditor User', 'accreditor@test.com', 'accreditor', 'Test University', NOW());
   ```

3. **Create Test Data**
   
   ```sql
   -- Create test college
   INSERT INTO colleges (id, name, code, dean_id, created_at) VALUES
   ('00000000-0000-0000-0000-000000000010', 'Test College', 'TC', '00000000-0000-0000-0000-000000000003', NOW());
   
   -- Create test program
   INSERT INTO programs (id, name, code, college_id, chair, created_at) VALUES
   ('00000000-0000-0000-0000-000000000020', 'Test Program', 'TP', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000005', NOW());
   
   -- Create test accreditation area
   INSERT INTO accreditation_areas (id, name, code, program_id, created_at) VALUES
   ('00000000-0000-0000-0000-000000000030', 'Test Area', 'TA', '00000000-0000-0000-0000-000000000020', NOW());
   
   -- Create test documents
   INSERT INTO documents (id, title, area, program, uploaded_by, file_url, status, created_at) VALUES
   ('00000000-0000-0000-0000-000000000040', 'Document for Program 1', 'Test Area', 'Test Program', '00000000-0000-0000-0000-000000000001', 'http://example.com/doc1', 'approved', NOW()),
   ('00000000-0000-0000-0000-000000000041', 'Document for Program 2', 'Test Area 2', 'Test Program 2', '00000000-0000-0000-0000-000000000001', 'http://example.com/doc2', 'approved', NOW()),
   ('00000000-0000-0000-0000-000000000042', 'Faculty Document', 'Test Area', 'Test Program', '00000000-0000-0000-0000-000000000006', 'http://example.com/doc3', 'pending', NOW());
   
   -- Create test role assignment for Accreditor
   INSERT INTO role_assignments (user_id, program_id, role, assignment_type, assigned_at, is_active) VALUES
   ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000020', 'accreditor', 'reviewer', NOW(), true);
   
   -- Create test area chair assignment
   INSERT INTO area_chair_assignments (area_id, chair_id, assigned_at, is_current) VALUES
   ('00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000005', NOW(), true);
   ```

---

## Test Execution

### Test 1: Admin Access

**Setup:**
- Authenticate as: Admin User (admin@test.com)
- User ID: `00000000-0000-0000-0000-000000000001`

**Test Query:**
```sql
SET LOCAL ROLE TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000001"}';

SELECT id, title, program FROM documents;
```

**Expected Result:**
- ✅ Returns ALL documents (all 3 test documents)
- ✅ No restrictions

**Pass Criteria:** Admin sees all documents

---

### Test 2: VPAA Access

**Setup:**
- Authenticate as: VPAA User (vpaa@test.com)
- User ID: `00000000-0000-0000-0000-000000000002`

**Test Query:**
```sql
SET LOCAL ROLE TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000002"}';

SELECT id, title, program FROM documents;
```

**Expected Result:**
- ✅ Returns ALL documents (all 3 test documents)
- ✅ No restrictions

**Pass Criteria:** VPAA sees all documents

---

### Test 3: QA Access

**Setup:**
- Authenticate as: QA User (qa@test.com)
- User ID: `00000000-0000-0000-0000-000000000004`

**Test Query:**
```sql
SET LOCAL ROLE TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000004"}';

SELECT id, title, program FROM documents;
```

**Expected Result:**
- ✅ Returns ALL documents (all 3 test documents)
- ✅ No restrictions

**Pass Criteria:** QA sees all documents

---

### Test 4: Dean Access

**Setup:**
- Authenticate as: Dean User (dean@test.com)
- User ID: `00000000-0000-0000-0000-000000000003`

**Test Query:**
```sql
SET LOCAL ROLE TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000003"}';

SELECT id, title, program FROM documents;
```

**Expected Result:**
- ✅ Returns ALL documents (all 3 test documents)
- ✅ No restrictions

**Pass Criteria:** Dean sees all documents

---

### Test 5: Accreditor Access (CRITICAL SECURITY TEST)

**Setup:**
- Authenticate as: Accreditor User (accreditor@test.com)
- User ID: `00000000-0000-0000-0000-000000000007`
- Accreditor is assigned to: Test Program only

**Test Query:**
```sql
SET LOCAL ROLE TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000007"}';

SELECT id, title, program FROM documents;
```

**Expected Result:**
- ✅ Returns ONLY documents where program = 'Test Program'
- ✅ Returns Document 1 (program = 'Test Program')
- ❌ Does NOT return Document 2 (program = 'Test Program 2')
- ❌ Does NOT return Document 3 (program = 'Test Program')

**Pass Criteria:** Accreditor sees ONLY assigned program documents

**FAIL CRITERIA (BLOCKING):**
- ❌ If Accreditor sees Document 2 (unassigned program) → SECURITY BREACH
- ❌ If Accreditor sees Document 3 (even though same program, different uploader) → Check if this is intended

**Note:** Document 3 has program = 'Test Program' (same as Document 1), so Accreditor SHOULD see it if the policy matches on program name.

---

### Test 6: Area Chair Access

**Setup:**
- Authenticate as: Area Chair User (areachair@test.com)
- User ID: `00000000-0000-0000-0000-000000000005`
- Area Chair is assigned to: Test Area

**Test Query:**
```sql
SET LOCAL ROLE TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000005"}';

SELECT d.id, d.title, d.program, d.task_id
FROM documents d
WHERE d.task_id IN (
  SELECT t.id FROM tasks t
  JOIN area_chair_assignments aca ON aca.area_id = t.area_id
  WHERE aca.chair_id = '00000000-0000-0000-0000-000000000005'
    AND aca.is_current = true
);
```

**Expected Result:**
- ✅ Returns ONLY documents linked to tasks in Test Area
- ✅ If Document 1 has task_id linked to Test Area task, it should be visible
- ❌ Does NOT return documents not linked to their tasks

**Pass Criteria:** Area Chair sees only documents for their assigned areas

---

### Test 7: Faculty Access

**Setup:**
- Authenticate as: Faculty User (faculty@test.com)
- User ID: `00000000-0000-0000-0000-000000000006`

**Test Query:**
```sql
SET LOCAL ROLE TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000006"}';

SELECT id, title, program FROM documents;
```

**Expected Result:**
- ✅ Returns ONLY documents where uploaded_by = '00000000-0000-0000-0000-000000000006'
- ✅ Returns Document 3 (uploaded by faculty)
- ❌ Does NOT return Document 1 (uploaded by admin)
- ❌ Does NOT return Document 2 (uploaded by admin)

**Pass Criteria:** Faculty sees only their own uploaded documents

---

### Test 8: Program Chair Access

**Setup:**
- Authenticate as: Program Chair (areachair@test.com - same user as Area Chair in this test)
- User ID: `00000000-0000-0000-0000-000000000005`

**Test Query:**
```sql
SET LOCAL ROLE TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000005"}';

SELECT id, title, program FROM documents;
```

**Expected Result:**
- ✅ Same as Area Chair (same user, same role)
- ✅ Returns documents for their areas

**Pass Criteria:** Program Chair (area-chair role) sees area documents

---

## Security Test Matrix

| Role | Expected Document Access | Test Result | Status |
|------|-------------------------|-------------|--------|
| Admin | All documents | [ ] Pass [ ] Fail | |
| VPAA | All documents | [ ] Pass [ ] Fail | |
| QA | All documents | [ ] Pass [ ] Fail | |
| Dean | All documents | [ ] Pass [ ] Fail | |
| Accreditor | Assigned programs only | [ ] Pass [ ] Fail | **CRITICAL** |
| Area Chair | Their areas only | [ ] Pass [ ] Fail | |
| Faculty | Own documents only | [ ] Pass [ ] Fail | |

---

## Negative Test Cases

### Test 9: Accreditor Cannot Access Unassigned Program

**Setup:**
- Authenticate as: Accreditor User
- Try to access Document 2 (program = 'Test Program 2')

**Direct Query:**
```sql
SET LOCAL ROLE TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000007"}';

SELECT * FROM documents WHERE id = '00000000-0000-0000-0000-000000000041';
```

**Expected Result:**
- ❌ Returns 0 rows (no access)
- ✅ Or returns error: "permission denied"

**Pass Criteria:** Accreditor cannot access unassigned program documents

---

### Test 10: Faculty Cannot Access Others' Documents

**Setup:**
- Authenticate as: Faculty User
- Try to access Document 1 (uploaded by admin)

**Direct Query:**
```sql
SET LOCAL ROLE TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000006"}';

SELECT * FROM documents WHERE id = '00000000-0000-0000-0000-000000000040';
```

**Expected Result:**
- ❌ Returns 0 rows (no access)
- ✅ Or returns error: "permission denied"

**Pass Criteria:** Faculty cannot access other users' documents

---

### Test 11: Area Chair Cannot Access Unrelated Areas

**Setup:**
- Authenticate as: Area Chair User
- Try to access document for area they are NOT assigned to

**Direct Query:**
```sql
SET LOCAL ROLE TO authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "00000000-0000-0000-0000-000000000005"}';

-- Try to access document linked to different area
SELECT * FROM documents WHERE id = '00000000-0000-0000-0000-000000000041';
```

**Expected Result:**
- ❌ Returns 0 rows (no access)
- ✅ Or returns error: "permission denied"

**Pass Criteria:** Area Chair cannot access documents outside their areas

---

## Policy Verification Queries

### Verify Old Policy is Dropped

```sql
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'documents'
  AND policyname = 'Authenticated users can view documents';
```

**Expected:** 0 rows

### Verify New Policies Exist

```sql
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'documents'
  AND cmd = 'SELECT'
ORDER BY policyname;
```

**Expected Policies:**
1. Accreditors can view assigned documents
2. Admin, VPAA, QA, Dean can view all documents
3. Area Chairs can view documents for their areas
4. Users can view own documents

**Total:** 4 SELECT policies

### Verify Policy Definitions

```sql
-- Check Accreditor policy
SELECT policyname, pg_get_policydef(oid) as policy_definition
FROM pg_policy
WHERE tablename = 'documents'
  AND policyname = 'Accreditors can view assigned documents';
```

**Expected:** Policy should reference role_assignments table and check for 'accreditor' role

---

## Automated Security Test Script

Create `test_security.sql`:

```sql
-- =====================================================
-- ADAMS Security Test Script
-- =====================================================

\echo '=== Security Test for Document RLS Policies ==='
\echo ''

-- Test 1: Verify old policy is dropped
\echo 'Test 1: Verify old policy is dropped'
SELECT COUNT(*) as old_policy_count
FROM pg_policies
WHERE tablename = 'documents'
  AND policyname = 'Authenticated users can view documents';
\echo ''

-- Test 2: Verify new policies exist
\echo 'Test 2: Verify new policies exist'
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'documents'
  AND cmd = 'SELECT'
ORDER BY policyname;
\echo ''

-- Test 3: Count total policies on documents
\echo 'Test 3: Total policies on documents'
SELECT COUNT(*) as total_policies
FROM pg_policies
WHERE tablename = 'documents';
\echo ''

-- Test 4: Verify no overly permissive policies
\echo 'Test 4: Check for overly permissive policies'
SELECT policyname, qual
FROM pg_policies
WHERE tablename = 'documents'
  AND cmd = 'SELECT'
  AND qual LIKE '%authenticated%';
\echo ''

\echo '=== Security Test Complete ==='
```

Run with:
```bash
psql %SUPABASE_DB_URL% -f test_security.sql
```

---

## Test Report Template

```markdown
# Security Test Report

**Date:** [Date]  
**Tester:** [Name]  
**Database:** [Supabase project name]  
**Result:** [PASS / FAIL]

## Test Results

| Test | Role | Expected Access | Actual Access | Status |
|------|------|-----------------|---------------|--------|
| 1 | Admin | All documents | [Result] | [ ] Pass [ ] Fail |
| 2 | VPAA | All documents | [Result] | [ ] Pass [ ] Fail |
| 3 | QA | All documents | [Result] | [ ] Pass [ ] Fail |
| 4 | Dean | All documents | [Result] | [ ] Pass [ ] Fail |
| 5 | Accreditor | Assigned only | [Result] | [ ] Pass [ ] Fail |
| 6 | Area Chair | Their areas | [Result] | [ ] Pass [ ] Fail |
| 7 | Faculty | Own documents | [Result] | [ ] Pass [ ] Fail |
| 8 | Program Chair | Their areas | [Result] | [ ] Pass [ ] Fail |
| 9 | Accreditor (negative) | No access to unassigned | [Result] | [ ] Pass [ ] Fail |
| 10 | Faculty (negative) | No access to others' | [Result] | [ ] Pass [ ] Fail |
| 11 | Area Chair (negative) | No access to unrelated | [Result] | [ ] Pass [ ] Fail |

## Policy Verification

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| Old policy dropped | 0 policies | [Count] | [ ] Pass [ ] Fail |
| New policies created | 4 policies | [Count] | [ ] Pass [ ] Fail |
| No overly permissive policies | 0 policies | [Count] | [ ] Pass [ ] Fail |

## Security Issues Found

[List any security vulnerabilities discovered]

## Sign-Off

- [ ] All security tests pass
- [ ] No unauthorized access detected
- [ ] Role-based access control verified
- [ ] Ready for production deployment

**Approved by:** [Name]  
**Date:** [Date]
```

---

## Critical Security Checks

### MUST PASS Before Deployment

1. **Accreditor Access Test (Test 5)**
   - Accreditor MUST NOT see documents for unassigned programs
   - This is a CRITICAL security requirement
   - If this test fails, deployment is BLOCKED

2. **Faculty Access Test (Test 7)**
   - Faculty MUST NOT see other users' documents
   - Prevents data leakage

3. **Policy Verification**
   - Old "Authenticated users" policy MUST be dropped
   - New role-specific policies MUST exist
   - No overly permissive policies

---

## Troubleshooting

### If Accreditor Can See All Documents

**Diagnosis:**
```sql
-- Check if old policy still exists
SELECT policyname FROM pg_policies
WHERE tablename = 'documents'
  AND policyname = 'Authenticated users can view documents';
```

**Fix:**
- Re-run migration 026
- Verify DROP POLICY executes successfully
- Verify new policies are created

### If Policies Not Working

**Diagnosis:**
```sql
-- Check RLS is enabled
SELECT relname, relrowsecurity FROM pg_class
WHERE relname = 'documents';
-- Expected: relrowsecurity = true

-- Check policies are attached
SELECT policyname, tablename FROM pg_policies
WHERE tablename = 'documents';
```

**Fix:**
- Ensure RLS is enabled: `ALTER TABLE documents ENABLE ROW LEVEL SECURITY;`
- Re-create policies

---

**Test Plan Status:** READY FOR EXECUTION  
**Estimated Time:** 1-2 hours  
**Required:** Security Tester, Database Administrator  
**BLOCKING:** Accreditor access test MUST pass before deployment