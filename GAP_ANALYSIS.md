# ADAMS Schema Gap Analysis
## Against Accreditation Workflow Requirements

**Date:** 2026-07-24  
**Purpose:** Identify architectural gaps in the current extension plan against the specified accreditation workflow

---

## Workflow Hierarchy

```
QA (University-wide monitoring)
  ↓
VPAA (Accreditation oversight)
  ↓
Dean (College management)
  ↓
Area Chair (Area management)
  ↓
Team Member (Task execution)
  ↓
Accreditor (External validation)
```

---

## Gap Analysis Matrix

| # | Requirement | Current Support | Gap Status | Priority |
|---|-------------|-----------------|------------|----------|
| 1 | Colleges | ❌ None | MISSING | **CRITICAL** |
| 2 | Programs under colleges | ⚠️ Partial | INCOMPLETE | **CRITICAL** |
| 3 | Accreditation cycles | ✅ Supported | COVERED | - |
| 4 | Accreditation instruments | ❌ None | MISSING | **CRITICAL** |
| 5 | Area Chair assignments | ✅ Supported | COVERED | - |
| 6 | Team Member assignments | ⚠️ Partial | INCOMPLETE | **IMPORTANT** |
| 7 | Task management | ❌ None | MISSING | **CRITICAL** |
| 8 | Task progress tracking | ❌ None | MISSING | **CRITICAL** |
| 9 | Evidence-to-task mapping | ⚠️ Partial | INCOMPLETE | **IMPORTANT** |
| 10 | Accreditation validity tracking | ⚠️ Partial | INCOMPLETE | **IMPORTANT** |

---

## Detailed Gap Analysis

### 1. COLLEGES - CRITICAL

**Current State:**
- No `colleges` table exists
- Programs exist independently without organizational hierarchy
- Dean role exists but no college to manage

**Why Required:**
- Dean is responsible for managing a college
- Accreditation is organized by college
- VPAA needs to monitor accreditation at college level
- Hierarchical reporting (college → programs → areas)

**Recommended Schema:**

```sql
CREATE TABLE colleges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  dean_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'merged')),
  accreditation_status TEXT NOT NULL DEFAULT 'at-risk' CHECK (accreditation_status IN ('compliant', 'at-risk', 'non-compliant')),
  compliance_score INTEGER NOT NULL DEFAULT 0 CHECK (compliance_score >= 0 AND compliance_score <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_colleges_dean ON colleges(dean_id);
CREATE INDEX idx_colleges_status ON colleges(status);
CREATE INDEX idx_colleges_accreditation ON colleges(accreditation_status);
```

**Integration Points:**
- `programs.college_id` - Foreign key to colleges
- `profiles.role` - Dean role scoped to college
- `role_assignments` - Dean assignment to college
- `compliance_scores` - College-level scores

**Migration:**
```sql
-- Add college_id to programs
ALTER TABLE programs ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES colleges(id) ON DELETE SET NULL;
CREATE INDEX idx_programs_college ON programs(college_id);

-- Migrate existing programs to a default college
INSERT INTO colleges (id, name, code, dean_id, created_at)
VALUES ('col-001', 'Default College', 'DEFAULT', NULL, NOW())
ON CONFLICT (id) DO NOTHING;

UPDATE programs SET college_id = 'col-001' WHERE college_id IS NULL;
```

---

### 2. PROGRAMS UNDER COLLEGES - CRITICAL

**Current State:**
- Programs exist but lack college affiliation
- No hierarchical relationship (college → programs)
- Dean cannot be scoped to specific programs

**Why Required:**
- Dean manages a college, not individual programs
- Accreditation reporting needs college-level aggregation
- VPAA monitors colleges, not isolated programs

**Recommended Changes:**

```sql
-- Modify programs table
ALTER TABLE programs ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES colleges(id) ON DELETE SET NULL;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS level TEXT CHECK (level IN ('undergraduate', 'graduate', 'doctoral'));
ALTER TABLE programs ADD COLUMN IF NOT EXISTS duration_years INTEGER CHECK (duration_years > 0);

-- Make college_id required after migration
-- ALTER TABLE programs ALTER COLUMN college_id SET NOT NULL;

-- Update RLS for college-scoped access
CREATE POLICY "Deans can view programs in their college"
  ON programs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM colleges
      WHERE colleges.id = programs.college_id
        AND colleges.dean_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('vpaa', 'admin', 'qa')
    )
  );
```

**Integration Points:**
- `colleges` table (parent)
- `accreditation_areas.program_id` (inherits college via program)
- `compliance_scores.program_id` (inherits college via program)
- `role_assignments` (scoped to college)

---

### 3. ACCREDITATION CYCLES - COVERED ✅

**Current State:**
- `accreditation_cycles` table proposed in extension plan
- Supports cycle types, status, dates
- Links to programs

**Assessment:**
- Adequately covers accreditation cycle tracking
- Supports initial, renewal, interim, follow-up cycles
- Includes site visit tracking

**No Changes Required**

---

### 4. ACCREDITATION INSTRUMENTS - CRITICAL

**Current State:**
- No concept of instruments (templates, rubrics, surveys)
- Documents are generic files
- No standardized evaluation criteria

**Why Required:**
- VPAA sets accreditation instruments
- Area Chairs define required evidence based on instruments
- Team Members submit evidence against instrument criteria
- Accreditors evaluate using instruments
- Quality Checks validate against instrument standards

**Recommended Schema:**

```sql
CREATE TABLE accreditation_instruments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  version TEXT NOT NULL DEFAULT '1.0',
  accrediting_body TEXT NOT NULL,
  instrument_type TEXT NOT NULL CHECK (instrument_type IN (
    'rubric', 'survey', 'checklist', 'template', 'guideline'
  )),
  category TEXT NOT NULL, -- e.g., 'Student Outcomes', 'Faculty', 'Curriculum'
  criteria JSONB NOT NULL DEFAULT '[]', -- [{id, name, description, weight}]
  scoring_guide JSONB NOT NULL DEFAULT '{}', -- {score: description}
  minimum_score INTEGER NOT NULL DEFAULT 70 CHECK (minimum_score >= 0 AND minimum_score <= 100),
  is_active BOOLEAN NOT NULL DEFAULT true,
  effective_date DATE NOT NULL,
  expiry_date DATE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_accreditation_instruments_type ON accreditation_instruments(instrument_type);
CREATE INDEX idx_accreditation_instruments_active ON accreditation_instruments(is_active) WHERE is_active = true;
CREATE INDEX idx_accreditation_instruments_body ON accreditation_instruments(accrediting_body);
```

**Integration Points:**
- `accreditation_areas.instrument_id` - Link area to instrument
- `quality_checks.instrument_id` - Validate against instrument criteria
- `documents.instrument_criteria_id` - Link evidence to specific criteria
- `compliance_scores.calculation_method` - Reference instrument scoring

**Enhanced accreditation_areas:**
```sql
ALTER TABLE accreditation_areas 
  ADD COLUMN IF NOT EXISTS instrument_id UUID REFERENCES accreditation_instruments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS criteria_weights JSONB DEFAULT '{}';
```

**Why Critical:**
- Without instruments, there's no standardized way to evaluate evidence
- VPAA cannot "set accreditation instruments" as required
- No way to ensure consistency across programs
- Accreditors need instruments to conduct evaluations

---

### 5. AREA CHAIR ASSIGNMENTS - COVERED ✅

**Current State:**
- `area_chair_assignments` table proposed
- Includes history tracking
- Links areas to chairs

**Assessment:**
- Adequately covers Area Chair assignments
- Supports assignment history
- Enables current assignment tracking

**No Changes Required**

---

### 6. TEAM MEMBER ASSIGNMENTS - IMPORTANT

**Current State:**
- `role_assignments` can assign team members
- But no task-specific assignment tracking
- No assignment context (what they're assigned to do)

**Why Required:**
- Area Chair "assigns tasks" to Team Members
- Need to track who is assigned to what task
- Need assignment metadata (deadline, priority, status)

**Recommended Solution:**

**Option A: Enhance role_assignments (Preferred)**
```sql
-- Add task context to role_assignments
ALTER TABLE role_assignments 
  ADD COLUMN IF NOT EXISTS assignment_type TEXT CHECK (assignment_type IN (
    'area-member', 'task-assignee', 'reviewer', 'observer'
  )),
  ADD COLUMN IF NOT EXISTS task_description TEXT,
  ADD COLUMN IF NOT EXISTS task_priority TEXT CHECK (task_priority IN ('low', 'medium', 'high', 'urgent')),
  ADD COLUMN IF NOT EXISTS task_deadline TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS task_status TEXT CHECK (task_status IN (
    'not-started', 'in-progress', 'completed', 'overdue'
  ));

CREATE INDEX idx_role_assignments_type ON role_assignments(assignment_type);
CREATE INDEX idx_role_assignments_task_status ON role_assignments(task_status);
```

**Option B: Create tasks table (More robust)**
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  area_id UUID REFERENCES accreditation_areas(id) ON DELETE CASCADE,
  instrument_criteria_id UUID, -- Reference to specific criteria in instrument
  assigned_to UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'not-started' CHECK (status IN (
    'not-started', 'in-progress', 'completed', 'overdue', 'cancelled'
  )),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_area ON tasks(area_id);
CREATE INDEX idx_tasks_program ON tasks(program_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

**Recommendation:** Use Option B (tasks table) for better task management capabilities.

---

### 7. TASK MANAGEMENT - CRITICAL

**Current State:**
- No task entity exists
- Documents and submission_schedules are not tasks
- No way to track individual work items

**Why Required:**
- Area Chair "assigns tasks" to Team Members
- Team Members "complete assigned tasks"
- Need to track task lifecycle (created → assigned → in-progress → completed)
- Need task metadata (priority, deadline, status, progress)

**Recommended Schema:**

```sql
-- See Option B in Gap #6 above

-- Enhanced with progress tracking
CREATE TABLE task_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  updated_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  notes TEXT,
  time_spent DECIMAL(5,2), -- hours
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_task_progress_task ON task_progress(task_id);
CREATE INDEX idx_task_progress_created ON task_progress(created_at DESC);
```

**Integration Points:**
- `accreditation_areas` - Tasks belong to areas
- `documents` - Evidence linked to tasks
- `notifications` - Task assignment alerts
- `activity_log` - Task completion activities

**Why Critical:**
- Core workflow requirement: Area Chair assigns tasks, Team Member completes them
- No existing table supports this workflow
- Essential for tracking accreditation progress

---

### 8. TASK PROGRESS TRACKING - CRITICAL

**Current State:**
- No progress tracking mechanism
- Documents have status but no progress percentage
- No historical progress data

**Why Required:**
- Area Chair needs to "track member progress"
- VPAA needs to monitor completion rates
- QA needs to identify bottlenecks
- Reporting requires progress metrics

**Recommended Schema:**

```sql
-- task_progress table (see Gap #7)

-- Enhanced tasks table with progress fields
ALTER TABLE tasks 
  ADD COLUMN IF NOT EXISTS progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  ADD COLUMN IF NOT EXISTS last_progress_update TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS blockers TEXT[] DEFAULT '{}';

-- Area-level progress aggregation view
CREATE VIEW area_progress_summary AS
SELECT 
  a.id AS area_id,
  a.name AS area_name,
  a.program_id,
  COUNT(t.id) AS total_tasks,
  COUNT(CASE WHEN t.status = 'completed' THEN 1 END) AS completed_tasks,
  COUNT(CASE WHEN t.status = 'in-progress' THEN 1 END) AS in_progress_tasks,
  COUNT(CASE WHEN t.status = 'not-started' THEN 1 END) AS not_started_tasks,
  COUNT(CASE WHEN t.status = 'overdue' THEN 1 END) AS overdue_tasks,
  ROUND(
    AVG(CASE WHEN t.status = 'completed' THEN 100.0 ELSE t.progress_percentage END)
  ) AS average_progress
FROM accreditation_areas a
LEFT JOIN tasks t ON t.area_id = a.id
GROUP BY a.id, a.name, a.program_id;

-- Program-level progress aggregation
CREATE VIEW program_progress_summary AS
SELECT 
  p.id AS program_id,
  p.name AS program_name,
  p.college_id,
  COUNT(t.id) AS total_tasks,
  COUNT(CASE WHEN t.status = 'completed' THEN 1 END) AS completed_tasks,
  ROUND(AVG(t.progress_percentage)) AS average_progress
FROM programs p
LEFT JOIN tasks t ON t.program_id = p.id
GROUP BY p.id, p.name, p.college_id;

-- College-level progress aggregation
CREATE VIEW college_progress_summary AS
SELECT 
  c.id AS college_id,
  c.name AS college_name,
  COUNT(t.id) AS total_tasks,
  COUNT(CASE WHEN t.status = 'completed' THEN 1 END) AS completed_tasks,
  ROUND(AVG(t.progress_percentage)) AS average_progress
FROM colleges c
LEFT JOIN programs p ON p.college_id = c.id
LEFT JOIN tasks t ON t.program_id = p.id
GROUP BY c.id, c.name;
```

**Integration Points:**
- `tasks` table (source data)
- `task_progress` table (historical tracking)
- Aggregation views for reporting
- `compliance_scores` (can be derived from task completion)

**Why Critical:**
- Core requirement: "Track member progress"
- No existing mechanism for progress tracking
- Essential for accreditation monitoring

---

### 9. EVIDENCE-TO-TASK MAPPING - IMPORTANT

**Current State:**
- Documents exist independently
- No link between documents and tasks
- No way to verify evidence completeness against requirements

**Why Required:**
- Team Members "upload evidence" for assigned tasks
- Area Chairs "define required evidence"
- QA validates evidence completeness
- Accreditors review evidence against criteria

**Recommended Schema:**

```sql
-- Enhance documents table
ALTER TABLE documents 
  ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS instrument_criteria_id UUID, -- JSON path to criteria
  ADD COLUMN IF NOT EXISTS evidence_type TEXT CHECK (evidence_type IN (
    'required', 'supporting', 'supplementary'
  )),
  ADD COLUMN IF NOT EXISTS is_mandatory BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX idx_documents_task ON documents(task_id);
CREATE INDEX idx_documents_evidence_type ON documents(evidence_type);

-- Task evidence requirements (what's needed)
CREATE TABLE task_evidence_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  instrument_criteria_id UUID NOT NULL, -- Reference to instrument criteria
  evidence_type TEXT NOT NULL CHECK (evidence_type IN (
    'required', 'supporting', 'supplementary'
  )),
  description TEXT NOT NULL,
  format_requirements TEXT, -- e.g., "PDF, max 10MB"
  is_mandatory BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(task_id, instrument_criteria_id)
);

CREATE INDEX idx_task_evidence_requirements_task ON task_evidence_requirements(task_id);

-- Evidence completeness tracking
CREATE VIEW task_evidence_completeness AS
SELECT 
  t.id AS task_id,
  t.title AS task_title,
  COUNT(ter.id) AS required_evidence_count,
  COUNT(DISTINCT d.id) FILTER (WHERE d.evidence_type = 'required') AS submitted_required_count,
  COUNT(DISTINCT d.id) FILTER (WHERE d.evidence_type = 'supporting') AS submitted_supporting_count,
  ROUND(
    (COUNT(DISTINCT d.id) FILTER (WHERE d.evidence_type = 'required')::DECIMAL / 
     NULLIF(COUNT(ter.id), 0)) * 100
  ) AS completeness_percentage
FROM tasks t
LEFT JOIN task_evidence_requirements ter ON ter.task_id = t.id
LEFT JOIN documents d ON d.task_id = t.id AND d.evidence_type = 'required'
GROUP BY t.id, t.title;
```

**Integration Points:**
- `tasks` table (parent)
- `documents` table (evidence files)
- `accreditation_instruments` (criteria source)
- `quality_checks` (completeness validation)

**Why Important:**
- Required for systematic evidence collection
- Enables QA to verify completeness
- Supports Accreditor evaluation
- Not critical if using ad-hoc document upload, but important for structured workflow

---

### 10. ACCREDITATION VALIDITY TRACKING - IMPORTANT

**Current State:**
- `accreditation_cycles` has start/end dates
- No validity period tracking
- No expiration warnings
- No renewal workflow

**Why Required:**
- VPAA needs to "monitor accreditation validity"
- Need to know when accreditation expires
- Need renewal planning
- Need validity status (valid, expiring, expired)

**Recommended Schema:**

```sql
-- Enhance accreditation_cycles
ALTER TABLE accreditation_cycles 
  ADD COLUMN IF NOT EXISTS validity_period_years INTEGER CHECK (validity_period_years > 0),
  ADD COLUMN IF NOT EXISTS expiration_date DATE GENERATED ALWAYS AS (
    start_date + (validity_period_years || ' years')::INTERVAL
  ) STORED,
  ADD COLUMN IF NOT EXISTS renewal_deadline DATE,
  ADD COLUMN IF NOT EXISTS validity_status TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN expiration_date < CURRENT_DATE THEN 'expired'
      WHEN renewal_deadline < CURRENT_DATE THEN 'expiring'
      ELSE 'valid'
    END
  ) STORED;

-- Accreditation validity alerts
CREATE TABLE accreditation_validity_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_id UUID NOT NULL REFERENCES accreditation_cycles(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'expiring-soon', 'expired', 'renewal-upcoming', 'renewal-overdue'
  )),
  alert_date DATE NOT NULL,
  message TEXT NOT NULL,
  is_sent BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_validity_alerts_cycle ON accreditation_validity_alerts(cycle_id);
CREATE INDEX idx_validity_alerts_date ON accreditation_alerts(alert_date);
CREATE INDEX idx_validity_alerts_sent ON accreditation_alerts(is_sent) WHERE is_sent = false;

-- Validity dashboard view
CREATE VIEW accreditation_validity_dashboard AS
SELECT 
  c.id AS cycle_id,
  c.name AS cycle_name,
  p.name AS program_name,
  p.college_id,
  col.name AS college_name,
  c.start_date,
  c.expiration_date,
  c.renewal_deadline,
  c.validity_status,
  EXTRACT(DAYS FROM (c.expiration_date - CURRENT_DATE)) AS days_until_expiration
FROM accreditation_cycles c
JOIN programs p ON p.id = c.program_id
LEFT JOIN colleges col ON col.id = p.college_id
WHERE c.status NOT IN ('cancelled', 'completed');
```

**Integration Points:**
- `accreditation_cycles` (enhanced with validity fields)
- `notifications` (expiration alerts)
- `compliance_scores` (validity affects compliance)
- `institutional_reviews` (VPAA oversight of expiring accreditations)

**Why Important:**
- Core VPAA responsibility: "monitor accreditation validity"
- Critical for maintaining accreditation status
- Enables proactive renewal planning
- Not critical for basic functionality but essential for compliance

---

## Summary of Missing Entities

### CRITICAL (Must Have)

| # | Entity | Reason | Impact if Missing |
|---|--------|--------|-------------------|
| 1 | `colleges` | Dean manages college, hierarchical structure | No organizational hierarchy, Dean role meaningless |
| 2 | Programs → College relationship | Dean scoped to college | Cannot implement college-level access control |
| 3 | `accreditation_instruments` | VPAA sets instruments, standardization | No standardized evaluation criteria |
| 4 | `tasks` | Area Chair assigns tasks, Team Member completes | Core workflow broken |
| 5 | `task_progress` | Track member progress | No visibility into completion status |

### IMPORTANT (Should Have)

| # | Entity | Reason | Impact if Missing |
|---|--------|--------|-------------------|
| 6 | Task assignment metadata | Team Member assignment context | Weak assignment tracking |
| 7 | Evidence-to-task mapping | Systematic evidence collection | Ad-hoc document management |
| 8 | Accreditation validity tracking | Monitor validity, expiration | No proactive renewal management |

### OPTIONAL (Nice to Have)

| # | Entity | Reason | Impact if Missing |
|---|--------|--------|-------------------|
| 9 | Task dependencies | Complex task relationships | Simple workflows only |
| 10 | Instrument templates | Reusable instrument creation | Manual instrument creation |
| 11 | Bulk task operations | Mass task assignment | Slower workflow |

---

## Revised Extension Plan Requirements

### Additional Tables Required

**CRITICAL:**
1. `colleges` - Organizational units
2. `accreditation_instruments` - Standardized evaluation criteria
3. `tasks` - Work items assigned to team members
4. `task_progress` - Progress tracking history

**IMPORTANT:**
5. `task_evidence_requirements` - Evidence specifications per task
6. `accreditation_validity_alerts` - Expiration notifications

### Additional Table Modifications

**CRITICAL:**
1. `programs` - Add `college_id` foreign key
2. `accreditation_areas` - Add `instrument_id` foreign key
3. `documents` - Add `task_id` foreign key, `evidence_type`

**IMPORTANT:**
4. `accreditation_cycles` - Add validity tracking fields
5. `role_assignments` - Add task context fields (or use tasks table)

### Additional Views Required

1. `area_progress_summary` - Area-level task completion
2. `program_progress_summary` - Program-level task completion
3. `college_progress_summary` - College-level task completion
4. `task_evidence_completeness` - Evidence submission status
5. `accreditation_validity_dashboard` - Validity status overview

---

## Workflow Support Assessment

### QA Workflow
**Current Coverage:** 60%
**Missing:**
- College-level quality checks
- Instrument-based validation
- Task completion quality metrics

### VPAA Workflow
**Current Coverage:** 50%
**Missing:**
- College management
- Accreditation instruments
- Validity monitoring
- Institutional reviews (covered)

### Dean Workflow
**Current Coverage:** 40%
**Missing:**
- College entity
- College-scoped access
- Program management under college

### Area Chair Workflow
**Current Coverage:** 70%
**Missing:**
- Task creation and assignment
- Evidence requirement definition
- Progress tracking

### Team Member Workflow
**Current Coverage:** 50%
**Missing:**
- Task entity
- Task assignment context
- Progress updates

### Accreditor Workflow
**Current Coverage:** 80%
**Missing:**
- Instrument-based evaluation
- Evidence completeness view

---

## Recommendations

### Immediate Actions (Phase 0)

Before proceeding with the current migration plan, add:

1. **Create `colleges` table** - Foundation for hierarchy
2. **Add `college_id` to `programs`** - Establish relationship
3. **Create `accreditation_instruments` table** - Enable standardization
4. **Create `tasks` table** - Core workflow entity
5. **Create `task_progress` table** - Progress tracking

### Revised Migration Order

```
Phase 0: Foundation (NEW)
  - 005_create_colleges.sql
  - 006_add_college_to_programs.sql
  - 007_create_accreditation_instruments.sql
  - 008_create_tasks.sql
  - 009_create_task_progress.sql

Phase 1: Original Phase 1 (shifted to Phase 2)
  - Update roles
  - Create role_assignments
  - Create area_chair_assignments

Phase 2: Original Phase 2 (shifted to Phase 3)
  - Review workflows

Phase 3: Role-Specific (shifted to Phase 4)
  - QA, VPAA, Accreditor tables

Phase 4: Security (shifted to Phase 5)
  - RLS updates

Phase 5: Frontend (shifted to Phase 6)
  - TypeScript updates
```

### Priority Rationale

**Why Colleges First:**
- Dean role is college-based
- All other entities (programs, areas) belong to colleges
- Cannot implement role-based access without college scope

**Why Tasks Before Workflows:**
- Tasks are the core work unit
- Review workflows operate on tasks
- Cannot track progress without tasks

**Why Instruments Before Quality Checks:**
- Quality checks validate against instruments
- Cannot implement QA without standards
- Instruments define "what good looks like"

---

## Conclusion

The current extension plan covers role management and review workflows but has **critical gaps** in:

1. **Organizational hierarchy** (colleges)
2. **Standardization** (accreditation instruments)
3. **Task management** (core workflow)
4. **Progress tracking** (monitoring)

**Recommendation:** Revise the extension plan to include these 4 critical entities before proceeding with migrations. The current plan is 50% complete for the specified workflow requirements.

**Next Steps:**
1. Update ROLE_EXTENSION_PLAN.md with gap analysis
2. Add Phase 0 for critical missing entities
3. Proceed with migration generation after plan approval