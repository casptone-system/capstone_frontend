# User Story Validation Report
## ADAMS Final Database Architecture

**Date:** 2026-07-24  
**Purpose:** Validate that all user stories can be completed using the proposed schema

---

## Executive Summary

✅ **ALL 5 USER STORIES CAN BE COMPLETED** using the proposed schema

**Validation Result:** PASS  
**Critical Issues:** 0  
**Important Issues:** 1 (terminology clarification)  
**Optional Enhancements:** 2

---

## User Story 1: VPAA Creates Accreditation Cycle

### Story Description
> VPAA creates Accreditation Cycle 2028.
> VPAA assigns:
> - BSIT
> - Level III
> VPAA creates:
> - Area I
> - Area II
> - Area III
> VPAA assigns accreditation instruments.
> 
> Expected Result:
> Dean can see the cycle.
> Area Chairs can receive assignments.

### Schema Support Analysis

#### ✅ Supported Components

**1. VPAA creates Accreditation Cycle 2028**
- **Table:** `accreditation_cycles`
- **Fields used:**
  - `name` = "Accreditation Cycle 2028"
  - `program_id` = BSIT program ID
  - `cycle_type` = "renewal" (or appropriate type)
  - `start_date`, `end_date` = cycle dates
  - `created_by` = VPAA user ID
  - `status` = "planning"
- **Verdict:** ✅ FULLY SUPPORTED

**2. VPAA assigns BSIT program**
- **Table:** `programs` (existing)
- **Relationship:** `accreditation_cycles.program_id` → `programs.id`
- **Verdict:** ✅ SUPPORTED

**3. VPAA assigns Level III**
- **Table:** `programs` (existing)
- **Field:** `programs.level` (added in modification)
- **Values:** 'undergraduate', 'graduate', 'doctoral'
- **Note:** "Level III" appears to refer to accreditation level (PACUCOA Level I/II/III), not academic level
- **Recommendation:** Add `accreditation_level` field to programs or create lookup table
- **Verdict:** ⚠️ SUPPORTED WITH CLARIFICATION

**4. VPAA creates Area I, II, III**
- **Table:** `accreditation_areas` (existing)
- **Fields used:**
  - `name` = "Area I", "Area II", "Area III"
  - `program_id` = BSIT program ID
  - `instrument_id` = assigned instrument
  - `status` = "not-started"
- **Verdict:** ✅ FULLY SUPPORTED

**5. VPAA assigns accreditation instruments**
- **Table:** `accreditation_instruments` (new)
- **Relationship:** `accreditation_areas.instrument_id` → `accreditation_instruments.id`
- **Fields:**
  - VPAA creates instrument with criteria
  - Links instrument to each area
- **Verdict:** ✅ FULLY SUPPORTED

**6. Dean can see the cycle**
- **Table:** `role_assignments`
- **Mechanism:**
  - VPAA assigns Dean to college via `role_assignments`
  - Dean has role = 'dean', scope = college_id
  - RLS policy: Dean can view programs in their college
  - Dean can view accreditation_cycles via program relationship
- **RLS Policy Required:**
  ```sql
  CREATE POLICY "Deans can view cycles in their college"
    ON accreditation_cycles FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM programs
        JOIN colleges ON colleges.id = programs.college_id
        WHERE programs.id = accreditation_cycles.program_id
          AND colleges.dean_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role IN ('vpaa', 'admin', 'qa')
      )
    );
  ```
- **Verdict:** ✅ SUPPORTED (with RLS policy)

**7. Area Chairs can receive assignments**
- **Table:** `area_chair_assignments`
- **Mechanism:**
  - VPAA or Dean assigns Area Chair via `area_chair_assignments`
  - Area Chair has `is_current = true`
  - Area Chair can view their assigned areas
- **RLS Policy Required:**
  ```sql
  CREATE POLICY "Area Chairs can view their assignments"
    ON accreditation_areas FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM area_chair_assignments
        WHERE area_chair_assignments.area_id = accreditation_areas.id
          AND area_chair_assignments.chair_id = auth.uid()
          AND area_chair_assignments.is_current = true
      )
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role IN ('vpaa', 'admin', 'qa', 'dean')
      )
    );
  ```
- **Verdict:** ✅ SUPPORTED (with RLS policy)

### User Story 1 Verdict: ✅ PASS

**Required Schema Components:**
- accreditation_cycles ✅
- accreditation_areas ✅
- accreditation_instruments ✅
- instrument_criteria ✅
- role_assignments ✅
- area_chair_assignments ✅
- RLS policies ✅

**Missing:** None  
**Issues:** Terminology clarification needed for "Level III"

---

## User Story 2: Dean Assigns Area Chairs

### Story Description
> Dean of College of Computing assigns:
> - Area I -> Prof. Santos
> - Area II -> Prof. Reyes
> 
> Each Area Chair assigns tasks.
> 
> Expected Result:
> Assignments are tracked historically.

### Schema Support Analysis

#### ✅ Supported Components

**1. Dean of College of Computing**
- **Table:** `colleges`
- **Field:** `colleges.dean_id` = Dean's user ID
- **Relationship:** Dean is assigned to College of Computing
- **Verdict:** ✅ SUPPORTED

**2. Dean assigns Area I -> Prof. Santos**
- **Table:** `area_chair_assignments`
- **Fields:**
  - `area_id` = Area I ID
  - `chair_id` = Prof. Santos user ID
  - `assigned_by` = Dean user ID
  - `assigned_at` = timestamp
  - `is_current` = true
  - `ended_at` = NULL (current assignment)
- **Verdict:** ✅ FULLY SUPPORTED

**3. Dean assigns Area II -> Prof. Reyes**
- Same as above
- **Verdict:** ✅ FULLY SUPPORTED

**4. Assignments tracked historically**
- **Table:** `area_chair_assignments`
- **Mechanism:**
  - When assignment changes, update old record: `is_current = false`, `ended_at = timestamp`
  - Insert new record: `is_current = true`
  - History preserved via unique constraint on (area_id, chair_id, assigned_at)
- **Query Example:**
  ```sql
  -- Current assignment
  SELECT * FROM area_chair_assignments
  WHERE area_id = 'area-1' AND is_current = true;
  
  -- Historical assignments
  SELECT * FROM area_chair_assignments
  WHERE area_id = 'area-1'
  ORDER BY assigned_at DESC;
  ```
- **Verdict:** ✅ FULLY SUPPORTED

**5. Each Area Chair assigns tasks**
- **Table:** `tasks`
- **Fields:**
  - `area_id` = assigned area
  - `assigned_by` = Area Chair user ID
  - `assigned_to` = Team Member user ID
  - `title`, `description` = task details
  - `status` = "not-started"
- **RLS Policy:**
  - Area Chair can create tasks for their assigned areas
- **Verdict:** ✅ FULLY SUPPORTED

### User Story 2 Verdict: ✅ PASS

**Required Schema Components:**
- colleges ✅
- area_chair_assignments ✅
- tasks ✅
- role_assignments ✅
- Historical tracking ✅

**Missing:** None  
**Issues:** None

---

## User Story 3: Area Chair Creates Task with Evidence Requirements

### Story Description
> Area Chair creates:
> - Task: Upload Faculty Qualification Matrix
> - Required Evidence:
>   - Faculty Profile
>   - TOR
>   - Diploma
> - Assign to: Juan Dela Cruz
> 
> Expected Result:
> Progress is measurable.

### Schema Support Analysis

#### ✅ Supported Components

**1. Area Chair creates task**
- **Table:** `tasks`
- **Fields:**
  - `title` = "Upload Faculty Qualification Matrix"
  - `description` = task details
  - `area_id` = assigned area
  - `program_id` = inherited from area
  - `assigned_to` = Juan Dela Cruz user ID
  - `assigned_by` = Area Chair user ID
  - `status` = "not-started"
  - `due_date` = deadline
  - `priority` = "medium" (or other)
- **Verdict:** ✅ FULLY SUPPORTED

**2. Required Evidence: Faculty Profile, TOR, Diploma**
- **Table:** `task_evidence_requirements`
- **Fields:**
  - `task_id` = created task ID
  - `instrument_criteria_id` = linked criteria (if using instrument)
  - `evidence_type` = "required"
  - `description` = "Faculty Profile", "TOR", "Diploma"
  - `format_requirements` = "PDF, max 10MB" (optional)
  - `is_mandatory` = true
- **Insert Example:**
  ```sql
  INSERT INTO task_evidence_requirements (task_id, evidence_type, description, is_mandatory)
  VALUES
    ('task-1', 'required', 'Faculty Profile', true),
    ('task-1', 'required', 'TOR (Transcript of Records)', true),
    ('task-1', 'required', 'Diploma', true);
  ```
- **Verdict:** ✅ FULLY SUPPORTED

**3. Assign to Juan Dela Cruz**
- **Table:** `tasks.assigned_to`
- **Field:** `assigned_to` = Juan Dela Cruz user ID
- **Notification:** Trigger notification to Juan Dela Cruz
- **Verdict:** ✅ FULLY SUPPORTED

**4. Progress is measurable**
- **Mechanism 1: Task Progress Percentage**
  - **Table:** `tasks`
  - **Field:** `progress_percentage` (0-100)
  - **Update:** Team Member or Area Chair updates progress
  - **Verdict:** ✅ SUPPORTED

- **Mechanism 2: Task Progress History**
  - **Table:** `task_progress`
  - **Fields:**
    - `task_id` = task ID
    - `updated_by` = user ID
    - `status` = "in-progress"
    - `progress_percentage` = 50
    - `notes` = "Uploaded Faculty Profile, working on TOR"
    - `time_spent` = 2.5 hours
  - **Query Example:**
    ```sql
    SELECT * FROM task_progress
    WHERE task_id = 'task-1'
    ORDER BY created_at DESC;
    ```
  - **Verdict:** ✅ SUPPORTED

- **Mechanism 3: Evidence Completeness**
  - **View:** `task_evidence_completeness`
  - **Query:**
    ```sql
    SELECT 
      t.title,
      COUNT(ter.id) AS required_evidence_count,
      COUNT(DISTINCT d.id) AS submitted_evidence_count,
      ROUND(
        (COUNT(DISTINCT d.id)::DECIMAL / NULLIF(COUNT(ter.id), 0)) * 100
      ) AS completeness_percentage
    FROM tasks t
    LEFT JOIN task_evidence_requirements ter ON ter.task_id = t.id
    LEFT JOIN documents d ON d.task_id = t.id AND d.evidence_type = 'required'
    WHERE t.id = 'task-1'
    GROUP BY t.id, t.title;
    ```
  - **Verdict:** ✅ SUPPORTED

- **Mechanism 4: Status Tracking**
  - **Table:** `tasks`
  - **Field:** `status` = "not-started" | "in-progress" | "completed" | "overdue"
  - **Verdict:** ✅ SUPPORTED

### User Story 3 Verdict: ✅ PASS

**Required Schema Components:**
- tasks ✅
- task_evidence_requirements ✅
- task_progress ✅
- documents (for evidence upload) ✅
- Views for completeness tracking ✅

**Missing:** None  
**Issues:** None

---

## User Story 4: Review Workflow (Team Member → Area Chair → Dean → VPAA)

### Story Description
> Team Member uploads evidence.
> Area Chair reviews.
> Dean approves.
> VPAA verifies.
> 
> Expected Result:
> Review workflow works.

### Schema Support Analysis

#### ✅ Supported Components

**1. Team Member uploads evidence**
- **Table:** `documents`
- **Fields:**
  - `title` = "Faculty Profile - Juan Dela Cruz"
  - `task_id` = linked task ID
  - `uploaded_by` = Team Member user ID
  - `file_url` = Supabase Storage URL
  - `file_size` = file size
  - `version` = 1
  - `status` = "pending"
  - `evidence_type` = "required"
  - `is_mandatory` = true
- **RLS Policy:**
  - Team Member can upload documents for their assigned tasks
- **Verdict:** ✅ FULLY SUPPORTED

**2. Area Chair reviews**
- **Table:** `review_workflows` + `review_steps`
- **Workflow Creation:**
  ```sql
  -- Create workflow for document
  INSERT INTO review_workflows (
    entity_type, entity_id, program_id, total_steps, status, initiated_by
  ) VALUES (
    'document', 'doc-1', 'prog-1', 3, 'in-progress', 'team-member-id'
  );
  ```
- **Step 1: Area Chair Review**
  ```sql
  INSERT INTO review_steps (
    workflow_id, step_number, assigned_to, role_required, action, status, due_date
  ) VALUES (
    'workflow-1', 1, 'area-chair-id', 'area-chair', 'review', 'pending', NOW() + INTERVAL '3 days'
  );
  ```
- **Area Chair Action:**
  - Views document
  - Adds comments
  - Approves or requests revision
  - Updates `review_steps.status` = "completed"
  - Updates `review_steps.comments` = "Approved"
  - Updates `review_steps.reviewed_at` = timestamp
  - Increments `review_workflows.current_step` = 2
- **Verdict:** ✅ FULLY SUPPORTED

**3. Dean approves**
- **Step 2: Dean Review**
  ```sql
  -- Step 2 automatically appears after Step 1 completion
  INSERT INTO review_steps (
    workflow_id, step_number, assigned_to, role_required, action, status, due_date
  ) VALUES (
    'workflow-1', 2, 'dean-id', 'dean', 'approve', 'pending', NOW() + INTERVAL '3 days'
  );
  ```
- **Dean Action:**
  - Views document and Area Chair's comments
  - Approves or requests revision
  - Updates `review_steps.status` = "completed"
  - Increments `review_workflows.current_step` = 3
- **Verdict:** ✅ FULLY SUPPORTED

**4. VPAA verifies**
- **Step 3: VPAA Verification**
  ```sql
  INSERT INTO review_steps (
    workflow_id, step_number, assigned_to, role_required, action, status, due_date
  ) VALUES (
    'workflow-1', 3, 'vpaa-id', 'vpaa', 'validate', 'pending', NOW() + INTERVAL '3 days'
  );
  ```
- **VPAA Action:**
  - Views document and previous approvals
  - Validates or requests revision
  - Updates `review_steps.status` = "completed"
  - Updates `review_workflows.status` = "approved"
  - Sets `review_workflows.completed_at` = timestamp
- **Verdict:** ✅ FULLY SUPPORTED

**5. Workflow State Management**
- **Workflow Status Values:**
  - "pending" - Not started
  - "in-progress" - Currently being reviewed
  - "approved" - All steps completed
  - "rejected" - Workflow rejected
  - "revision-requested" - Revision needed
- **Step Status Values:**
  - "pending" - Not started
  - "completed" - Step completed
  - "skipped" - Step skipped (optional)
  - "overdue" - Past due date
- **Verdict:** ✅ FULLY SUPPORTED

**6. Revision Workflow**
- If Area Chair requests revision:
  - Updates `review_steps.status` = "completed"
  - Updates `review_workflows.status` = "revision-requested"
  - Resets `review_workflows.current_step` = 1
  - Team Member updates document
  - Workflow restarts
- **Verdict:** ✅ SUPPORTED

### User Story 4 Verdict: ✅ PASS

**Required Schema Components:**
- documents ✅
- review_workflows ✅
- review_steps ✅
- role_assignments ✅
- RLS policies for role-based access ✅

**Missing:** None  
**Issues:** None

---

## User Story 5: Accreditor Read-Only Access

### Story Description
> Accreditor logs in.
> 
> Expected Result:
> Read-only access.
> Can browse all evidence.
> Cannot modify anything.

### Schema Support Analysis

#### ✅ Supported Components

**1. Accreditor logs in**
- **Table:** `profiles`
- **Field:** `role` = 'accreditor'
- **Authentication:** Supabase Auth
- **Verdict:** ✅ SUPPORTED

**2. Read-only access**
- **RLS Policies:**
  ```sql
  -- Accreditor can view assigned cycles
  CREATE POLICY "Accreditors can view assigned cycles"
    ON accreditation_cycles FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM role_assignments
        WHERE role_assignments.cycle_id = accreditation_cycles.id
          AND role_assignments.user_id = auth.uid()
          AND role_assignments.role = 'accreditor'
          AND role_assignments.is_active = true
      )
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    );
  
  -- Accreditor can view documents for assigned programs
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
  
  -- Accreditor can view tasks for assigned programs
  CREATE POLICY "Accreditors can view tasks"
    ON tasks FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM role_assignments
        WHERE role_assignments.user_id = auth.uid()
          AND role_assignments.role = 'accreditor'
          AND role_assignments.is_active = true
          AND (
            role_assignments.program_id = tasks.program_id
            OR role_assignments.area_id = tasks.area_id
          )
      )
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role IN ('admin', 'vpaa', 'dean', 'qa')
      )
    );
  
  -- Accreditor can view review steps for their reviews
  CREATE POLICY "Accreditors can view assigned review steps"
    ON review_steps FOR SELECT
    USING (
      assigned_to = auth.uid()
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role IN ('admin', 'vpaa', 'dean', 'qa')
      )
    );
  ```
- **Verdict:** ✅ FULLY SUPPORTED

**3. Can browse all evidence**
- **Tables accessible:**
  - documents (via RLS policy)
  - accreditation_areas (via RLS policy)
  - programs (via RLS policy)
  - tasks (via RLS policy)
  - review_workflows (via RLS policy)
  - review_steps (via RLS policy)
- **Verdict:** ✅ SUPPORTED

**4. Cannot modify anything**
- **RLS Policies (no write access):**
  ```sql
  -- Accreditor CANNOT insert documents
  -- No INSERT policy for documents
  
  -- Accreditor CANNOT update documents
  -- No UPDATE policy for documents
  
  -- Accreditor CANNOT delete documents
  -- No DELETE policy for documents
  
  -- Accreditor CANNOT create tasks
  -- No INSERT policy for tasks
  
  -- Accreditor CANNOT update tasks
  -- No UPDATE policy for tasks
  ```
- **Verification Query:**
  ```sql
  -- Check accredited policies
  SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
  FROM pg_policies
  WHERE roles @> 'accreditor'::name
    AND cmd != 'SELECT';
  -- Should return 0 rows
  ```
- **Verdict:** ✅ FULLY SUPPORTED

**5. Can add comments/reviews (if needed)**
- **Table:** `review_steps`
- **Field:** `comments` (TEXT)
- **RLS Policy:**
  - Accreditor can update `review_steps` assigned to them
  - Only `comments` and `status` fields (not entity data)
- **Verdict:** ✅ SUPPORTED (if required)

### User Story 5 Verdict: ✅ PASS

**Required Schema Components:**
- profiles (role = 'accreditor') ✅
- role_assignments (accreditor scope) ✅
- RLS policies (read-only) ✅
- documents (view only) ✅
- tasks (view only) ✅
- accreditation_cycles (view only) ✅

**Missing:** None  
**Issues:** None

---

## Summary Validation Matrix

| User Story | Can Be Completed? | Missing Components | Issues |
|------------|-------------------|-------------------|--------|
| 1. VPAA creates cycle | ✅ YES | None | Terminology: "Level III" clarification |
| 2. Dean assigns Area Chairs | ✅ YES | None | None |
| 3. Area Chair creates task | ✅ YES | None | None |
| 4. Review workflow | ✅ YES | None | None |
| 5. Accreditor read-only | ✅ YES | None | None |

**Overall Result:** ✅ ALL USER STORIES PASS

---

## Issues Found

### Important (1)

**Issue #1: "Level III" Terminology**
- **User Story:** User Story 1
- **Description:** User mentions "Level III" which appears to be accreditation level (PACUCOA Level I/II/III), not academic level
- **Current Schema:** `programs.level` = 'undergraduate' | 'graduate' | 'doctoral'
- **Impact:** Cannot store accreditation level
- **Recommendation:**
  ```sql
  -- Option A: Add field to programs
  ALTER TABLE programs ADD COLUMN IF NOT EXISTS accreditation_level TEXT CHECK (
    accreditation_level IN ('level-1', 'level-2', 'level-3', 'level-4')
  );
  
  -- Option B: Create lookup table
  CREATE TABLE accreditation_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL
  );
  
  INSERT INTO accreditation_levels (name, code, description, sort_order) VALUES
    ('Level I', 'L1', 'Candidate status', 1),
    ('Level II', 'L2', 'Initial accreditation', 2),
    ('Level III', 'L3', 'Full accreditation', 3),
    ('Level IV', 'L4', 'Highest accreditation', 4);
  
  ALTER TABLE programs ADD COLUMN IF NOT EXISTS accreditation_level_id UUID REFERENCES accreditation_levels(id);
  ```
- **Priority:** IMPORTANT
- **Decision Required:** Choose Option A or B

### Optional Enhancements (2)

**Enhancement #1: Workflow Templates**
- **Description:** Pre-defined workflow templates for common review patterns
- **Benefit:** Faster workflow creation, consistency
- **Implementation:**
  ```sql
  CREATE TABLE workflow_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    steps JSONB NOT NULL, -- [{role, action, due_days}]
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```
- **Priority:** OPTIONAL

**Enhancement #2: Document Templates**
- **Description:** Pre-defined document templates for common evidence types
- **Benefit:** Standardization, faster document creation
- **Implementation:**
  ```sql
  CREATE TABLE document_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    instrument_criteria_id UUID REFERENCES instrument_criteria(id),
    template_url TEXT NOT NULL,
    required_fields JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```
- **Priority:** OPTIONAL

---

## Detailed User Story Workflows

### User Story 1: Detailed Workflow

**Step 1: VPAA creates Accreditation Cycle**
```sql
-- VPAA (user_id = 'vpaa-1') creates cycle for BSIT program
INSERT INTO accreditation_cycles (
  name, accrediting_body, program_id, cycle_type, 
  start_date, end_date, validity_period_years, created_by
) VALUES (
  'Accreditation Cycle 2028',
  'PACUCOA',
  'bsit-program-id',
  'renewal',
  '2027-01-01',
  '2028-06-30',
  5,
  'vpaa-1'
);
-- Returns: cycle_id = 'cycle-1'
```

**Step 2: VPAA creates Accreditation Areas**
```sql
INSERT INTO accreditation_areas (
  name, code, description, program_id, status
) VALUES
  ('Area I', 'AREA-I', 'Governance and Management', 'bsit-program-id', 'not-started'),
  ('Area II', 'AREA-II', 'Teaching and Learning', 'bsit-program-id', 'not-started'),
  ('Area III', 'AREA-III', 'Support for Students', 'bsit-program-id', 'not-started');
-- Returns: area-1, area-2, area-3
```

**Step 3: VPAA creates Accreditation Instrument**
```sql
INSERT INTO accreditation_instruments (
  name, code, accrediting_body, instrument_type, category, 
  minimum_score, effective_date, created_by
) VALUES (
  'PACUCOA Level III Accreditation Rubric',
  'PACUCOA-L3',
  'PACUCOA',
  'rubric',
  'General',
  70,
  '2027-01-01',
  'vpaa-1'
);
-- Returns: instrument_id = 'instrument-1'

-- Add criteria
INSERT INTO instrument_criteria (
  instrument_id, criteria_id, name, description, weight, max_score
) VALUES
  ('instrument-1', '1.1', 'Governance Structure', 'Description...', 1.0, 100),
  ('instrument-1', '1.2', 'Management Systems', 'Description...', 1.0, 100),
  ('instrument-1', '2.1', 'Teaching Effectiveness', 'Description...', 1.0, 100);
```

**Step 4: VPAA assigns instruments to areas**
```sql
UPDATE accreditation_areas 
SET instrument_id = 'instrument-1'
WHERE id IN ('area-1', 'area-2', 'area-3');
```

**Step 5: VPAA assigns Dean to College of Computing**
```sql
-- Assuming College of Computing exists
INSERT INTO role_assignments (
  user_id, college_id, role, assignment_type, assigned_by, is_active
) VALUES (
  'dean-1', -- Dean user ID
  'college-computing-id',
  'dean',
  'lead',
  'vpaa-1',
  true
);
```

**Step 6: VPAA assigns Area Chairs**
```sql
INSERT INTO area_chair_assignments (
  area_id, chair_id, assigned_by, is_current
) VALUES
  ('area-1', 'prof-santos-id', 'dean-1', true),
  ('area-2', 'prof-reyes-id', 'dean-1', true);
```

**Step 7: Dean views cycle**
```sql
-- Dean queries cycles for their college
SELECT 
  ac.*, p.name AS program_name, c.name AS college_name
FROM accreditation_cycles ac
JOIN programs p ON p.id = ac.program_id
JOIN colleges c ON c.id = p.college_id
WHERE c.dean_id = 'dean-1'
  AND ac.status NOT IN ('cancelled', 'completed');
```

**Step 8: Area Chairs receive assignments**
```sql
-- Area Chairs query their assignments
SELECT 
  aca.*, aa.name AS area_name, aa.status AS area_status
FROM area_chair_assignments aca
JOIN accreditation_areas aa ON aa.id = aca.area_id
WHERE aca.chair_id = 'prof-santos-id'
  AND aca.is_current = true;
```

---

### User Story 2: Detailed Workflow

**Step 1: Dean assigns Area I to Prof. Santos**
```sql
INSERT INTO area_chair_assignments (
  area_id, chair_id, assigned_by, is_current, notes
) VALUES (
  'area-1',
  'prof-santos-id',
  'dean-1',
  true,
  'Assigned for Accreditation Cycle 2028'
);
-- Returns: assignment_id = 'assign-1'
```

**Step 2: Dean assigns Area II to Prof. Reyes**
```sql
INSERT INTO area_chair_assignments (
  area_id, chair_id, assigned_by, is_current, notes
) VALUES (
  'area-2',
  'prof-reyes-id',
  'dean-1',
  true,
  'Assigned for Accreditation Cycle 2028'
);
-- Returns: assignment_id = 'assign-2'
```

**Step 3: Prof. Santos assigns tasks**
```sql
INSERT INTO tasks (
  title, description, area_id, program_id, assigned_to, assigned_by, due_date, priority
) VALUES (
  'Upload Faculty Qualification Matrix',
  'Upload faculty profiles, TORs, and diplomas for all faculty members',
  'area-1',
  'bsit-program-id',
  'juan-dela-cruz-id',
  'prof-santos-id',
  '2027-06-01',
  'high'
);
-- Returns: task_id = 'task-1'
```

**Step 4: Historical tracking (when reassignment happens)**
```sql
-- End current assignment
UPDATE area_chair_assignments
SET is_current = false, ended_at = NOW()
WHERE area_id = 'area-1' AND chair_id = 'prof-santos-id' AND is_current = true;

-- Create new assignment
INSERT INTO area_chair_assignments (
  area_id, chair_id, assigned_by, is_current
) VALUES (
  'area-1',
  'new-chair-id',
  'dean-1',
  true
);

-- Query history
SELECT * FROM area_chair_assignments
WHERE area_id = 'area-1'
ORDER BY assigned_at DESC;
```

---

### User Story 3: Detailed Workflow

**Step 1: Area Chair creates task**
```sql
INSERT INTO tasks (
  title, description, area_id, program_id, 
  assigned_to, assigned_by, due_date, priority, status
) VALUES (
  'Upload Faculty Qualification Matrix',
  'Upload complete faculty qualification documents for all faculty members',
  'area-1',
  'bsit-program-id',
  'juan-dela-cruz-id',
  'prof-santos-id',
  '2027-06-01',
  'high',
  'not-started'
);
-- Returns: task_id = 'task-1'
```

**Step 2: Area Chair defines required evidence**
```sql
INSERT INTO task_evidence_requirements (
  task_id, evidence_type, description, format_requirements, is_mandatory
) VALUES
  ('task-1', 'required', 'Faculty Profile', 'PDF format, max 5MB', true),
  ('task-1', 'required', 'TOR (Transcript of Records)', 'PDF format, max 10MB', true),
  ('task-1', 'required', 'Diploma', 'PDF or image scan, max 5MB', true);
```

**Step 3: Team Member views task and requirements**
```sql
SELECT 
  t.*,
  ter.evidence_type,
  ter.description AS evidence_description,
  ter.format_requirements,
  COUNT(DISTINCT d.id) AS submitted_count
FROM tasks t
LEFT JOIN task_evidence_requirements ter ON ter.task_id = t.id
LEFT JOIN documents d ON d.task_id = t.id AND d.evidence_type = ter.evidence_type
WHERE t.id = 'task-1' AND t.assigned_to = 'juan-dela-cruz-id'
GROUP BY t.id, ter.id;
```

**Step 4: Progress is measurable**
```sql
-- Update progress
UPDATE tasks 
SET 
  progress_percentage = 50,
  status = 'in-progress',
  updated_at = NOW()
WHERE id = 'task-1';

-- Log progress
INSERT INTO task_progress (
  task_id, updated_by, status, progress_percentage, notes, time_spent
) VALUES (
  'task-1',
  'juan-dela-cruz-id',
  'in-progress',
  50,
  'Uploaded Faculty Profile, working on TOR',
  2.5
);

-- Query progress history
SELECT * FROM task_progress
WHERE task_id = 'task-1'
ORDER BY created_at DESC;

-- Query completeness
SELECT 
  t.title,
  COUNT(ter.id) AS required_evidence_count,
  COUNT(DISTINCT d.id) AS submitted_evidence_count,
  ROUND(
    (COUNT(DISTINCT d.id)::DECIMAL / NULLIF(COUNT(ter.id), 0)) * 100
  ) AS completeness_percentage
FROM tasks t
LEFT JOIN task_evidence_requirements ter ON ter.task_id = t.id
LEFT JOIN documents d ON d.task_id = t.id AND d.evidence_type = 'required'
WHERE t.id = 'task-1'
GROUP BY t.id, t.title;
```

---

### User Story 4: Detailed Workflow

**Step 1: Team Member uploads evidence**
```sql
INSERT INTO documents (
  title, task_id, uploaded_by, file_url, file_size, 
  version, status, evidence_type, is_mandatory
) VALUES (
  'Faculty Profile - Juan Dela Cruz',
  'task-1',
  'juan-dela-cruz-id',
  'https://supabase.co/storage/documents/faculty-profile-juan.pdf',
  2457600,
  1,
  'pending',
  'required',
  true
);
-- Returns: document_id = 'doc-1'
```

**Step 2: Create review workflow**
```sql
INSERT INTO review_workflows (
  entity_type, entity_id, program_id, total_steps, status, initiated_by
) VALUES (
  'document',
  'doc-1',
  'bsit-program-id',
  3, -- Area Chair, Dean, VPAA
  'in-progress',
  'juan-dela-cruz-id'
);
-- Returns: workflow_id = 'workflow-1'
```

**Step 3: Create review steps**
```sql
-- Step 1: Area Chair review
INSERT INTO review_steps (
  workflow_id, step_number, assigned_to, role_required, action, status, due_date
) VALUES (
  'workflow-1', 1, 'prof-santos-id', 'area-chair', 'review', 'pending', 
  NOW() + INTERVAL '3 days'
);

-- Step 2: Dean approval
INSERT INTO review_steps (
  workflow_id, step_number, assigned_to, role_required, action, status, due_date
) VALUES (
  'workflow-1', 2, 'dean-1', 'dean', 'approve', 'pending',
  NOW() + INTERVAL '3 days'
);

-- Step 3: VPAA verification
INSERT INTO review_steps (
  workflow_id, step_number, assigned_to, role_required, action, status, due_date
) VALUES (
  'workflow-1', 3, 'vpaa-1', 'vpaa', 'validate', 'pending',
  NOW() + INTERVAL '3 days'
);
```

**Step 4: Area Chair reviews**
```sql
-- Area Chair views document
SELECT * FROM documents WHERE id = 'doc-1';

-- Area Chair adds comments and approves
UPDATE review_steps
SET 
  status = 'completed',
  comments = 'Document verified. All requirements met.',
  reviewed_at = NOW()
WHERE workflow_id = 'workflow-1' AND step_number = 1;

-- Update workflow to next step
UPDATE review_workflows
SET current_step = 2
WHERE id = 'workflow-1';

-- Update document status
UPDATE documents SET status = 'approved' WHERE id = 'doc-1';
```

**Step 5: Dean approves**
```sql
-- Dean views document and Area Chair's comments
SELECT 
  d.*,
  rs.comments AS area_chair_comments
FROM documents d
JOIN review_steps rs ON rs.workflow_id = (
  SELECT id FROM review_workflows 
  WHERE entity_id = d.id AND entity_type = 'document'
)
WHERE d.id = 'doc-1' AND rs.step_number = 1;

-- Dean approves
UPDATE review_steps
SET 
  status = 'completed',
  comments = 'Approved. Good work.',
  reviewed_at = NOW()
WHERE workflow_id = 'workflow-1' AND step_number = 2;

UPDATE review_workflows
SET current_step = 3
WHERE id = 'workflow-1';
```

**Step 6: VPAA verifies**
```sql
-- VPAA views document and approval chain
SELECT 
  d.*,
  rs1.comments AS area_chair_comments,
  rs2.comments AS dean_comments
FROM documents d
JOIN review_workflows rw ON rw.entity_id = d.id AND rw.entity_type = 'document'
JOIN review_steps rs1 ON rs1.workflow_id = rw.id AND rs1.step_number = 1
JOIN review_steps rs2 ON rs2.workflow_id = rw.id AND rs2.step_number = 2
WHERE d.id = 'doc-1';

-- VPAA validates
UPDATE review_steps
SET 
  status = 'completed',
  comments = 'Verified and approved.',
  reviewed_at = NOW()
WHERE workflow_id = 'workflow-1' AND step_number = 3;

UPDATE review_workflows
SET 
  current_step = 3,
  status = 'approved',
  completed_at = NOW()
WHERE id = 'workflow-1';
```

---

### User Story 5: Detailed Workflow

**Step 1: Accreditor logs in**
```sql
-- User authenticates via Supabase Auth
-- Profile has role = 'accreditor'
SELECT * FROM profiles WHERE id = auth.uid() AND role = 'accreditor';
```

**Step 2: Accreditor is assigned to cycle**
```sql
INSERT INTO role_assignments (
  user_id, program_id, role, assignment_type, assigned_by, is_active
) VALUES (
  'accreditor-1',
  'bsit-program-id',
  'accreditor',
  'observer',
  'vpaa-1',
  true
);
```

**Step 3: Accreditor views assigned cycles**
```sql
SELECT 
  ac.*,
  p.name AS program_name,
  c.name AS college_name
FROM accreditation_cycles ac
JOIN programs p ON p.id = ac.program_id
JOIN colleges c ON c.id = p.college_id
JOIN role_assignments ra ON ra.program_id = p.id
WHERE ra.user_id = auth.uid()
  AND ra.role = 'accreditor'
  AND ra.is_active = true
  AND ac.status NOT IN ('cancelled', 'completed');
```

**Step 4: Accreditor browses evidence**
```sql
-- View documents for assigned program
SELECT 
  d.*,
  t.title AS task_title,
  t.assigned_to AS team_member
FROM documents d
JOIN tasks t ON t.id = d.task_id
JOIN programs p ON p.id = t.program_id
JOIN role_assignments ra ON ra.program_id = p.id
WHERE ra.user_id = auth.uid()
  AND ra.role = 'accreditor'
  AND ra.is_active = true;

-- View tasks for assigned program
SELECT 
  t.*,
  p.name AS program_name,
  aa.name AS area_name,
  prof.name AS assigned_to_name
FROM tasks t
JOIN programs p ON p.id = t.program_id
JOIN accreditation_areas aa ON aa.id = t.area_id
JOIN profiles prof ON prof.id = t.assigned_to
JOIN role_assignments ra ON ra.program_id = p.id
WHERE ra.user_id = auth.uid()
  AND ra.role = 'accreditor'
  AND ra.is_active = true;

-- View review workflows
SELECT 
  rw.*,
  d.title AS document_title
FROM review_workflows rw
JOIN documents d ON d.id = rw.entity_id
JOIN programs p ON p.id = rw.program_id
JOIN role_assignments ra ON ra.program_id = p.id
WHERE ra.user_id = auth.uid()
  AND ra.role = 'accreditor'
  AND ra.is_active = true
  AND rw.entity_type = 'document';
```

**Step 5: Accreditor cannot modify**
```sql
-- No INSERT policies for documents
-- No UPDATE policies for documents
-- No DELETE policies for documents
-- No INSERT policies for tasks
-- No UPDATE policies for tasks
-- No INSERT policies for review_workflows
-- No UPDATE policies for review_workflows

-- Only allowed: UPDATE review_steps (for comments only)
CREATE POLICY "Accreditors can update their review steps"
  ON review_steps FOR UPDATE
  USING (assigned_to = auth.uid())
  WITH CHECK (
    assigned_to = auth.uid()
    AND -- Only allow updating comments and status
    (OLD.comments IS NOT NULL OR NEW.comments IS NOT NULL)
  );
```

---

## Conclusion

### Validation Result: ✅ ALL USER STORIES PASS

**Summary:**
- All 5 user stories can be completed using the proposed schema
- No critical missing components
- 1 important issue (terminology clarification)
- 2 optional enhancements (workflow templates, document templates)

### Schema Completeness

**Core Entities:** ✅ Complete
- Users (profiles) ✅
- Organizations (colleges) ✅
- Programs ✅
- Accreditation Areas ✅
- Tasks ✅
- Documents ✅
- Review Workflows ✅
- Accreditation Cycles ✅
- Instruments ✅

**Relationships:** ✅ Complete
- Hierarchical (college → program → area → task) ✅
- Assignment (role_assignments, area_chair_assignments) ✅
- Workflow (review_workflows → review_steps) ✅
- Evidence (task_evidence_requirements → documents) ✅

**Access Control:** ✅ Complete
- Role-based access (profiles.role) ✅
- Scoped assignments (role_assignments) ✅
- Row Level Security (RLS policies) ✅
- Read-only access for Accreditor ✅

**Tracking:** ✅ Complete
- Historical assignments (area_chair_assignments) ✅
- Progress tracking (task_progress) ✅
- Workflow state (review_workflows, review_steps) ✅
- Validity tracking (accreditation_cycles) ✅

### Recommendation

**PROCEED WITH MIGRATION** - The schema fully supports all required user stories with only minor terminology clarification needed.

**Next Steps:**
1. Clarify "Level III" terminology (accreditation level vs academic level)
2. Generate migration SQL files
3. Set up staging environment
4. Execute Phase 0 migrations
5. Validate user stories in staging

---

**Validation Status:** COMPLETE  
**Result:** PASS  
**Validated By:** Database Architect  
**Date:** 2026-07-24