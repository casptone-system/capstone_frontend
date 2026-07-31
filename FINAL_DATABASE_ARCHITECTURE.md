# ADAMS Final Database Architecture
## Consolidated Schema Design for Multi-Role Accreditation System

**Version:** 2.0  
**Date:** 2026-07-24  
**Status:** Final Design - Ready for Migration

---

## 1. FINAL TABLE LIST

### 1.1 Core Tables (Existing - Preserved)

| Table | Purpose | Changes |
|-------|---------|---------|
| `profiles` | User accounts with role-based access | Modify role CHECK constraint |
| `programs` | Academic programs | Add `college_id` foreign key |
| `accreditation_areas` | Accreditation criteria areas | Add `instrument_id` foreign key |
| `documents` | Evidence files and documents | Add `task_id` foreign key |
| `submission_schedules` | Deadline tracking | **DEPRECATE** - Replace with tasks |
| `compliance_scores` | Performance metrics | Keep as-is (denormalized for performance) |
| `notifications` | User notifications | Keep as-is |
| `audit_logs` | System audit trail | Keep as-is |
| `activity_log` | Dashboard activity feed | Keep as-is |

### 1.2 New Tables (Required)

| Table | Purpose | Priority | Normalization |
|-------|---------|----------|---------------|
| `colleges` | Organizational units (Dean scope) | **CRITICAL** | 3NF |
| `role_assignments` | Formal role assignments with metadata | **CRITICAL** | 3NF |
| `area_chair_assignments` | Area Chair appointment history | **CRITICAL** | 3NF |
| `accreditation_instruments` | Standardized evaluation criteria | **CRITICAL** | 3NF |
| `instrument_criteria` | Individual criteria within instruments | **CRITICAL** | 3NF |
| `tasks` | Work items assigned to team members | **CRITICAL** | 3NF |
| `task_progress` | Historical progress tracking | **CRITICAL** | 3NF |
| `review_workflows` | Multi-step approval chains | **CRITICAL** | 3NF |
| `review_steps` | Individual review actions | **CRITICAL** | 3NF |
| `accreditation_cycles` | External accreditation events | **CRITICAL** | 3NF |
| `accreditor_assignments` | External reviewer assignments | **IMPORTANT** | 3NF |
| `quality_checks` | QA verification tasks | **IMPORTANT** | 3NF |
| `institutional_reviews` | VPAA oversight reviews | **IMPORTANT** | 3NF |
| `task_evidence_requirements` | Evidence specifications per task | **IMPORTANT** | 3NF |
| `accreditation_validity_alerts` | Expiration notifications | **IMPORTANT** | 3NF |

### 1.3 Tables Removed from Original Plan

| Table | Reason for Removal | Replacement |
|-------|-------------------|-------------|
| `submission_schedules` | Redundant with `tasks` table | `tasks` with due_date |
| `accreditor_assignments` (original) | Merged into `role_assignments` | `role_assignments` with context |
| `quality_checks` (original) | Merged into `review_steps` | `review_steps` with QA context |

---

## 2. FINAL TABLE DEFINITIONS

### 2.1 colleges (NEW - CRITICAL)

**Purpose:** Organizational units managed by Deans

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

**Rationale:**
- Normalized: 3NF (no repeating groups, no transitive dependencies)
- Dean role requires organizational unit
- Enables college-scoped access control
- Supports hierarchical reporting

---

### 2.2 role_assignments (NEW - CRITICAL)

**Purpose:** Formal role assignments with context and metadata

```sql
CREATE TABLE role_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  area_id UUID REFERENCES accreditation_areas(id) ON DELETE CASCADE,
  college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN (
    'qa', 'vpaa', 'dean', 'area-chair', 'team-member', 'accreditor', 'admin'
  )),
  assignment_type TEXT CHECK (assignment_type IN (
    'area-member', 'task-assignee', 'reviewer', 'observer', 'lead'
  )),
  assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_assignment_scope CHECK (
    (program_id IS NOT NULL AND area_id IS NULL AND college_id IS NULL) OR
    (program_id IS NULL AND area_id IS NOT NULL AND college_id IS NULL) OR
    (program_id IS NULL AND area_id IS NULL AND college_id IS NOT NULL) OR
    (program_id IS NULL AND area_id IS NULL AND college_id IS NULL)
  )
);

-- Indexes
CREATE INDEX idx_role_assignments_user ON role_assignments(user_id);
CREATE INDEX idx_role_assignments_program ON role_assignments(program_id);
CREATE INDEX idx_role_assignments_area ON role_assignments(area_id);
CREATE INDEX idx_role_assignments_college ON role_assignments(college_id);
CREATE INDEX idx_role_assignments_role ON role_assignments(role);
CREATE INDEX idx_role_assignments_active ON role_assignments(is_active) WHERE is_active = true;
```

**Rationale:**
- Replaces `accreditation_areas.assigned_to` array
- Supports scoped assignments (college, program, area)
- Includes assignment metadata (type, expiry)
- Enables RBAC without redundant tables

---

### 2.3 area_chair_assignments (NEW - CRITICAL)

**Purpose:** Formalize Area Chair appointments with history

```sql
CREATE TABLE area_chair_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  area_id UUID NOT NULL REFERENCES accreditation_areas(id) ON DELETE CASCADE,
  chair_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  is_current BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(area_id, chair_id, assigned_at)
);

-- Indexes
CREATE INDEX idx_area_chair_assignments_area ON area_chair_assignments(area_id);
CREATE INDEX idx_area_chair_assignments_chair ON area_chair_assignments(chair_id);
CREATE INDEX idx_area_chair_assignments_current ON area_chair_assignments(is_current) WHERE is_current = true;
```

**Rationale:**
- Maintains assignment history
- Supports concurrent assignments (historical + current)
- Enables assignment audit trail

---

### 2.4 accreditation_instruments (NEW - CRITICAL)

**Purpose:** Standardized evaluation criteria and rubrics

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
  category TEXT NOT NULL,
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

**Rationale:**
- Enables VPAA to "set accreditation instruments"
- Provides standardization across programs
- Supports QA validation and Accreditor evaluation
- Version control for instrument updates

---

### 2.5 instrument_criteria (NEW - CRITICAL)

**Purpose:** Individual criteria within accreditation instruments

```sql
CREATE TABLE instrument_criteria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instrument_id UUID NOT NULL REFERENCES accreditation_instruments(id) ON DELETE CASCADE,
  criteria_id TEXT NOT NULL, -- e.g., "1.1", "1.2"
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  weight DECIMAL(5,2) NOT NULL DEFAULT 1.0 CHECK (weight > 0),
  max_score INTEGER NOT NULL DEFAULT 100,
  evidence_requirements JSONB DEFAULT '[]', -- [{type, description, format}]
  scoring_guide JSONB DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(instrument_id, criteria_id)
);

-- Indexes
CREATE INDEX idx_instrument_criteria_instrument ON instrument_criteria(instrument_id);
CREATE INDEX idx_instrument_criteria_sort ON instrument_criteria(instrument_id, sort_order);
```

**Rationale:**
- Normalized from `accreditation_instruments.criteria` JSONB
- Enables individual criteria tracking
- Supports evidence requirement mapping
- Allows weighted scoring

---

### 2.6 tasks (NEW - CRITICAL)

**Purpose:** Work items assigned to team members

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  area_id UUID REFERENCES accreditation_areas(id) ON DELETE CASCADE,
  instrument_criteria_id UUID REFERENCES instrument_criteria(id) ON DELETE SET NULL,
  assigned_to UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'not-started' CHECK (status IN (
    'not-started', 'in-progress', 'completed', 'overdue', 'cancelled'
  )),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
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
CREATE INDEX idx_tasks_created ON tasks(created_at DESC);
```

**Rationale:**
- Core workflow entity (Area Chair → Team Member)
- Replaces `submission_schedules` functionality
- Links to instruments for evidence requirements
- Supports progress tracking

---

### 2.7 task_progress (NEW - CRITICAL)

**Purpose:** Historical progress tracking for tasks

```sql
CREATE TABLE task_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  updated_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  notes TEXT,
  time_spent DECIMAL(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_task_progress_task ON task_progress(task_id);
CREATE INDEX idx_task_progress_created ON task_progress(created_at DESC);
```

**Rationale:**
- Tracks progress history
- Enables "track member progress" requirement
- Supports reporting and analytics
- Normalized from tasks table

---

### 2.8 review_workflows (NEW - CRITICAL)

**Purpose:** Multi-step approval chains

```sql
CREATE TABLE review_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('document', 'task', 'area', 'program')),
  entity_id UUID NOT NULL,
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 1,
  total_steps INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'in-progress', 'approved', 'rejected', 'revision-requested'
  )),
  initiated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  initiated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_review_workflows_entity ON review_workflows(entity_type, entity_id);
CREATE INDEX idx_review_workflows_program ON review_workflows(program_id);
CREATE INDEX idx_review_workflows_status ON review_workflows(status);
```

**Rationale:**
- Supports QA → Dean → VPAA approval chains
- Generic entity support (documents, tasks, areas)
- Enables workflow tracking

---

### 2.9 review_steps (NEW - CRITICAL)

**Purpose:** Individual review actions within workflows

```sql
CREATE TABLE review_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES review_workflows(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  role_required TEXT CHECK (role_required IN (
    'qa', 'vpaa', 'dean', 'area-chair', 'team-member', 'accreditor'
  )),
  action TEXT CHECK (action IN (
    'review', 'approve', 'reject', 'request-revision', 'comment', 'validate'
  )),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'completed', 'skipped', 'overdue'
  )),
  comments TEXT,
  reviewed_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(workflow_id, step_number)
);

-- Indexes
CREATE INDEX idx_review_steps_workflow ON review_steps(workflow_id);
CREATE INDEX idx_review_steps_assigned ON review_steps(assigned_to);
CREATE INDEX idx_review_steps_status ON review_steps(status);
```

**Rationale:**
- Replaces `quality_checks` (merged into review workflow)
- Supports role-based step assignment
- Enables QA validation steps

---

### 2.10 accreditation_cycles (NEW - CRITICAL)

**Purpose:** External accreditation events and cycles

```sql
CREATE TABLE accreditation_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  accrediting_body TEXT NOT NULL,
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  cycle_type TEXT NOT NULL CHECK (cycle_type IN (
    'initial', 'renewal', 'interim', 'follow-up'
  )),
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN (
    'planning', 'preparation', 'site-visit', 'evaluation', 'completed', 'cancelled'
  )),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  validity_period_years INTEGER CHECK (validity_period_years > 0),
  expiration_date DATE GENERATED ALWAYS AS (
    start_date + (COALESCE(validity_period_years, 5) || ' years')::INTERVAL
  ) STORED,
  renewal_deadline DATE,
  site_visit_date DATE,
  lead_accreditor UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_accreditation_cycles_program ON accreditation_cycles(program_id);
CREATE INDEX idx_accreditation_cycles_status ON accreditation_cycles(status);
CREATE INDEX idx_accreditation_cycles_dates ON accreditation_cycles(start_date, end_date);
CREATE INDEX idx_accreditation_cycles_expiration ON accreditation_cycles(expiration_date);
```

**Rationale:**
- Supports Accreditor role
- Tracks accreditation validity
- Enables renewal planning
- Generated columns for computed fields

---

### 2.11 Modified Existing Tables

#### 2.11.1 profiles (MODIFY)

**Change:** Update role CHECK constraint

```sql
-- Drop old constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add new constraint
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('qa', 'vpaa', 'dean', 'area-chair', 'team-member', 'accreditor', 'admin'));

-- Migrate existing roles
UPDATE profiles SET role = 'area-chair' WHERE role = 'program-chair';
```

**Rationale:**
- Supports 6 new roles
- Maintains backward compatibility

---

#### 2.11.2 programs (MODIFY)

**Change:** Add college affiliation

```sql
ALTER TABLE programs ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES colleges(id) ON DELETE SET NULL;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS level TEXT CHECK (level IN ('undergraduate', 'graduate', 'doctoral'));
ALTER TABLE programs ADD COLUMN IF NOT EXISTS duration_years INTEGER CHECK (duration_years > 0);

CREATE INDEX idx_programs_college ON programs(college_id);
```

**Rationale:**
- Establishes college → program hierarchy
- Enables Dean-scoped access
- Supports college-level reporting

---

#### 2.11.3 accreditation_areas (MODIFY)

**Change:** Add instrument reference

```sql
ALTER TABLE accreditation_areas 
  ADD COLUMN IF NOT EXISTS instrument_id UUID REFERENCES accreditation_instruments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS criteria_weights JSONB DEFAULT '{}';

CREATE INDEX idx_accreditation_areas_instrument ON accreditation_areas(instrument_id);
```

**Rationale:**
- Links areas to standardized instruments
- Enables criteria-based evaluation
- Supports weighted scoring

---

#### 2.11.4 documents (MODIFY)

**Change:** Add task and evidence context

```sql
ALTER TABLE documents 
  ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS instrument_criteria_id UUID REFERENCES instrument_criteria(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS evidence_type TEXT CHECK (evidence_type IN (
    'required', 'supporting', 'supplementary'
  )),
  ADD COLUMN IF NOT EXISTS is_mandatory BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX idx_documents_task ON documents(task_id);
CREATE INDEX idx_documents_evidence_type ON documents(evidence_type);
CREATE INDEX idx_documents_criteria ON documents(instrument_criteria_id);
```

**Rationale:**
- Links evidence to tasks
- Supports evidence categorization
- Enables completeness tracking

---

#### 2.11.5 submission_schedules (DEPRECATE)

**Change:** Mark as deprecated, migrate to tasks

```sql
-- Add deprecation comment
COMMENT ON TABLE submission_schedules IS 'DEPRECATED: Use tasks table instead. Migrate data to tasks.';

-- Migration query (one-time)
INSERT INTO tasks (title, description, program_id, area_id, assigned_to, assigned_by, due_date, status, created_at)
SELECT 
  'Submission: ' || aa.name,
  'Submit accreditation area documentation',
  ss.program_id,
  ss.area_id,
  COALESCE(ac.chair_id, p.chair), -- Default to area chair or program chair
  ac.chair_id,
  ss.due_date,
  CASE ss.status WHEN 'submitted' THEN 'completed' ELSE 'not-started' END,
  ss.created_at
FROM submission_schedules ss
JOIN accreditation_areas aa ON aa.id = ss.area_id
JOIN programs p ON p.id = ss.program_id
LEFT JOIN area_chair_assignments ac ON ac.area_id = aa.id AND ac.is_current = true
ON CONFLICT DO NOTHING;
```

**Rationale:**
- Eliminates redundancy with tasks
- Simplifies schema
- Tasks provide more functionality

---

## 3. FINAL RELATIONSHIPS

### 3.1 Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PROFILES                                    │
│  (id, email, role, institution)                                     │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         │ 1:N
                         ├────────────────────────────────────────┐
                         │                                         │
          ┌──────────────▼──────────────┐          ┌──────────────▼──────────────┐
          │        COLLEGES             │          │    role_assignments         │
          │  (id, name, code, dean_id)  │          │ (user_id, role, scope)      │
          └──────────────┬──────────────┘          └─────────────────────────────┘
                         │ 1:N
          ┌──────────────▼──────────────┐
          │        PROGRAMS             │
          │  (id, name, college_id)     │
          └──────────────┬──────────────┘
                         │ 1:N
          ┌──────────────▼──────────────┐
          │   ACCREDITATION_AREAS       │
          │  (id, name, instrument_id)  │
          └──────────────┬──────────────┘
                         │
                         │ 1:N
          ┌──────────────▼──────────────┐
          │         TASKS               │
          │  (id, title, assigned_to)   │
          └──────────────┬──────────────┘
                         │
                         │ 1:N
          ┌──────────────▼──────────────┐
          │      task_progress          │
          │  (task_id, status, progress)│
          └─────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│              ACCREDITATION_INSTRUMENTS                              │
│  (id, name, version, accrediting_body)                              │
└────────────────────────┬────────────────────────────────────────────┘
                         │ 1:N
          ┌──────────────▼──────────────┐
          │    instrument_criteria      │
          │  (instrument_id, criteria)  │
          └─────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    REVIEW WORKFLOWS                                 │
│  (entity_type, entity_id, status)                                   │
└────────────────────────┬────────────────────────────────────────────┘
                         │ 1:N
          ┌──────────────▼──────────────┐
          │       review_steps          │
          │  (workflow_id, step_number) │
          └─────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│              ACCREDITATION CYCLES                                   │
│  (program_id, cycle_type, expiration_date)                          │
└────────────────────────┬────────────────────────────────────────────┘
                         │ 1:N
          ┌──────────────▼──────────────┐
          │  accreditor_assignments     │
          │  (cycle_id, accreditor_id)  │
          └─────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│           area_chair_assignments                                    │
│  (area_id, chair_id, is_current)                                    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│        task_evidence_requirements                                   │
│  (task_id, criteria_id, evidence_type)                              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│        accreditation_validity_alerts                                │
│  (cycle_id, alert_type, alert_date)                                 │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  EXISTING TABLES (Preserved)                                        │
│  documents, notifications, audit_logs, activity_log,                │
│  compliance_scores, institutional_reviews, quality_checks           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. REDUNDANT TABLES TO REMOVE

### 4.1 submission_schedules (DEPRECATE)

**Reason:** Functionality fully replaced by `tasks` table

**Comparison:**

| Feature | submission_schedules | tasks |
|---------|---------------------|-------|
| Due date tracking | ✅ | ✅ |
| Status tracking | ✅ | ✅ |
| Assignment to user | ❌ | ✅ |
| Priority levels | ❌ | ✅ |
| Progress tracking | ❌ | ✅ |
| Evidence linking | ❌ | ✅ |
| Instrument criteria | ❌ | ✅ |
| Time tracking | ❌ | ✅ |

**Migration:** One-time data migration to `tasks` table (see Section 2.11.5)

**Impact:** 
- ✅ Simplifies schema
- ✅ Reduces redundancy
- ✅ Enhances functionality
- ⚠️ Requires frontend updates

---

### 4.2 quality_checks (MERGE into review_steps)

**Reason:** Functionality overlaps with `review_steps`

**Comparison:**

| Feature | quality_checks | review_steps |
|---------|---------------|--------------|
| Assignment to reviewer | ✅ | ✅ |
| Status tracking | ✅ | ✅ |
| Findings/comments | ✅ | ✅ |
| Workflow integration | ❌ | ✅ |
| Step sequencing | ❌ | ✅ |
| Role-based routing | ❌ | ✅ |

**Migration:**
```sql
-- Add QA-specific action type to review_steps
ALTER TABLE review_steps 
  ADD COLUMN IF NOT EXISTS check_type TEXT CHECK (check_type IN (
    'completeness', 'accuracy', 'compliance', 'consistency', 'timeliness'
  )),
  ADD COLUMN IF NOT EXISTS severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical'));

-- Migrate quality_checks to review_steps
INSERT INTO review_steps (
  workflow_id, step_number, assigned_to, action, status, 
  comments, reviewed_at, due_date, check_type, severity
)
SELECT 
  rw.id,
  ROW_NUMBER() OVER (PARTITION BY qc.document_id ORDER BY qc.created_at),
  qc.checked_by,
  'validate',
  CASE qc.status WHEN 'passed' THEN 'completed' ELSE qc.status END,
  qc.findings,
  qc.checked_at,
  qc.due_date,
  qc.check_type,
  qc.severity
FROM quality_checks qc
JOIN documents d ON d.id = qc.document_id
LEFT JOIN review_workflows rw ON rw.entity_id = d.id AND rw.entity_type = 'document'
ON CONFLICT DO NOTHING;
```

**Impact:**
- ✅ Consolidates review logic
- ✅ Enables workflow integration
- ⚠️ Requires frontend updates

---

### 4.3 accreditor_assignments (MERGE into role_assignments)

**Reason:** Functionality covered by `role_assignments` with cycle scope

**Comparison:**

| Feature | accreditor_assignments | role_assignments |
|---------|----------------------|------------------|
| Assign accreditor to cycle | ✅ | ✅ (with cycle_id) |
| Role within cycle | ✅ | ✅ (assignment_type) |
| Active status | ✅ | ✅ (is_active) |
| Assigned areas | ✅ | ✅ (via program/area scope) |

**Migration:**
```sql
-- Add cycle context to role_assignments
ALTER TABLE role_assignments 
  ADD COLUMN IF NOT EXISTS cycle_id UUID REFERENCES accreditation_cycles(id) ON DELETE CASCADE;

-- Migrate accreditor_assignments
INSERT INTO role_assignments (
  user_id, program_id, role, assignment_type, assigned_at, is_active, cycle_id
)
SELECT 
  aa.accreditor_id,
  c.program_id,
  'accreditor',
  aa.role,
  aa.assigned_at,
  aa.is_active,
  aa.cycle_id
FROM accreditor_assignments aa
JOIN accreditation_cycles c ON c.id = aa.cycle_id
ON CONFLICT DO NOTHING;
```

**Impact:**
- ✅ Reduces table count
- ✅ Centralizes role management
- ⚠️ Requires frontend updates

---

## 5. NORMALIZATION ANALYSIS

### 5.1 Normalization Level: 3NF (Third Normal Form)

**All tables achieve 3NF:**
- ✅ No repeating groups
- ✅ No partial dependencies
- ✅ No transitive dependencies
- ✅ All non-key attributes depend on primary key

### 5.2 Denormalization for Performance

**Intentional denormalization:**

1. **compliance_scores** - Denormalized for dashboard performance
   - Rationale: Expensive to calculate on-the-fly
   - Updated via triggers or scheduled jobs

2. **activity_log** - Denormalized for feed performance
   - Rationale: Read-heavy, write-once
   - No joins required for display

3. **programs.compliance_score** - Cached aggregate
   - Rationale: Derived from compliance_scores
   - Updated via trigger

### 5.3 JSONB Usage

**Appropriate JSONB fields:**

1. **instrument_criteria.evidence_requirements** - Flexible evidence specs
   - Rationale: Variable structure per criteria
   - Queryable with JSONB operators

2. **instrument_criteria.scoring_guide** - Flexible scoring descriptions
   - Rationale: Variable structure per instrument
   - Queryable with JSONB operators

3. **accreditation_areas.criteria_weights** - Dynamic weighting
   - Rationale: Variable per area
   - Queryable with JSONB operators

4. **institutional_reviews.scope** - Flexible review scope
   - Rationale: Variable program/area selection
   - Queryable with JSONB operators

**Avoid JSONB:**
- ❌ Primary relationships (use foreign keys)
- ❌ Frequently queried fields (use columns)
- ❌ Data requiring constraints (use CHECK constraints)

---

## 6. FOREIGN KEY RELATIONSHIPS

### 6.1 Relationship Map

```
profiles (1) ──────< (N) colleges (dean_id)
profiles (1) ──────< (N) programs (created_by)
profiles (1) ──────< (N) accreditation_areas (created_by)
profiles (1) ──────< (N) documents (uploaded_by)
profiles (1) ──────< (N) role_assignments (user_id)
profiles (1) ──────< (N) role_assignments (assigned_by)
profiles (1) ──────< (N) tasks (assigned_to)
profiles (1) ──────< (N) tasks (assigned_by)
profiles (1) ──────< (N) task_progress (updated_by)
profiles (1) ──────< (N) review_workflows (initiated_by)
profiles (1) ──────< (N) review_steps (assigned_to)
profiles (1) ──────< (N) accreditation_cycles (created_by)
profiles (1) ──────< (N) accreditation_cycles (lead_accreditor)
profiles (1) ──────< (N) accreditation_instruments (created_by)
profiles (1) ──────< (N) accreditation_instruments (approved_by)
profiles (1) ──────< (N) institutional_reviews (created_by)
profiles (1) ──────< (N) institutional_reviews (reviewed_by)

colleges (1) ──────< (N) programs (college_id)
colleges (1) ──────< (N) role_assignments (college_id)

programs (1) ──────< (N) accreditation_areas
programs (1) ──────< (N) tasks
programs (1) ──────< (N) review_workflows
programs (1) ──────< (N) compliance_scores
programs (1) ──────< (N) accreditation_cycles

accreditation_areas (1) ──────< (N) tasks
accreditation_areas (1) ──────< (N) documents (via area field)
accreditation_areas (1) ──────< (N) role_assignments
accreditation_areas (1) ──────< (N) area_chair_assignments
accreditation_areas (1) ──────< (N) compliance_scores
accreditation_areas (1) ──────< (N) submission_schedules (deprecated)

accreditation_instruments (1) ──────< (N) instrument_criteria
accreditation_instruments (1) ──────< (N) accreditation_areas (instrument_id)

instrument_criteria (1) ──────< (N) tasks (instrument_criteria_id)
instrument_criteria (1) ──────< (N) documents (instrument_criteria_id)
instrument_criteria (1) ──────< (N) task_evidence_requirements

tasks (1) ──────< (N) task_progress
tasks (1) ──────< (N) documents (task_id)
tasks (1) ──────< (N) task_evidence_requirements

review_workflows (1) ──────< (N) review_steps

accreditation_cycles (1) ──────< (N) role_assignments (cycle_id)
accreditation_cycles (1) ──────< (N) accreditation_validity_alerts
```

### 6.2 Relationship Cardinality

**One-to-Many (1:N):**
- colleges → programs
- programs → accreditation_areas
- programs → tasks
- accreditation_areas → tasks
- tasks → task_progress
- review_workflows → review_steps
- accreditation_instruments → instrument_criteria
- tasks → documents

**Many-to-One (N:1):**
- programs → colleges
- tasks → profiles (assigned_to, assigned_by)
- role_assignments → profiles (user_id)
- documents → profiles (uploaded_by)

**Many-to-Many (M:N) - Via Junction Tables:**
- profiles ↔ colleges (via role_assignments)
- profiles ↔ programs (via role_assignments)
- profiles ↔ accreditation_areas (via role_assignments)
- profiles ↔ accreditation_cycles (via role_assignments)

---

## 7. SCALABILITY CONSIDERATIONS

### 7.1 Indexing Strategy

**Primary Indexes (All Tables):**
- UUID primary keys (clustered index)

**Foreign Key Indexes:**
- All foreign key columns indexed
- Composite indexes for common query patterns

**Query Optimization Indexes:**
```sql
-- Role-based queries
CREATE INDEX idx_role_assignments_user_role ON role_assignments(user_id, role, is_active);

-- Task queries
CREATE INDEX idx_tasks_assigned_status ON tasks(assigned_to, status, due_date);
CREATE INDEX idx_tasks_area_status ON tasks(area_id, status);

-- Workflow queries
CREATE INDEX idx_review_workflows_entity_status ON review_workflows(entity_type, entity_id, status);

-- Accreditation queries
CREATE INDEX idx_accreditation_cycles_program_status ON accreditation_cycles(program_id, status);
CREATE INDEX idx_accreditation_cycles_expiration ON accreditation_cycles(expiration_date) WHERE status NOT IN ('cancelled', 'completed');
```

### 7.2 Partitioning Strategy

**Large Tables (Consider Partitioning):**

1. **audit_logs** - Partition by created_at (monthly)
   ```sql
   CREATE TABLE audit_logs_2026_01 PARTITION OF audit_logs
     FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
   ```

2. **activity_log** - Partition by created_at (monthly)

3. **task_progress** - Partition by created_at (monthly)

**Rationale:**
- These tables are write-heavy
- Historical data rarely accessed
- Improves query performance
- Simplifies archival

### 7.3 Connection Pooling

**Supabase Connection Pooler:**
- Use Supabase's built-in connection pooler
- Configure pool size based on concurrent users
- Monitor connection usage

### 7.4 Caching Strategy

**Application-Level Caching:**
- Cache frequently accessed data:
  - College list
  - Program list
  - Active accreditation instruments
  - User role assignments

**Database-Level Caching:**
- Use materialized views for complex aggregations:
  - `college_progress_summary`
  - `program_progress_summary`
  - `accreditation_validity_dashboard`

---

## 8. DASHBOARD REPORTING REQUIREMENTS

### 8.1 Required Aggregations

**College-Level Metrics:**
```sql
CREATE VIEW college_dashboard_metrics AS
SELECT 
  c.id AS college_id,
  c.name AS college_name,
  COUNT(DISTINCT p.id) AS total_programs,
  COUNT(DISTINCT aa.id) AS total_areas,
  COUNT(DISTINCT t.id) AS total_tasks,
  COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) AS completed_tasks,
  ROUND(AVG(c.compliance_score)) AS avg_compliance_score,
  ROUND(AVG(t.progress_percentage)) AS avg_task_progress
FROM colleges c
LEFT JOIN programs p ON p.college_id = c.id
LEFT JOIN accreditation_areas aa ON aa.program_id = p.id
LEFT JOIN tasks t ON t.area_id = aa.id
GROUP BY c.id, c.name;
```

**Program-Level Metrics:**
```sql
CREATE VIEW program_dashboard_metrics AS
SELECT 
  p.id AS program_id,
  p.name AS program_name,
  p.college_id,
  c.name AS college_name,
  COUNT(DISTINCT aa.id) AS total_areas,
  COUNT(DISTINCT t.id) AS total_tasks,
  COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) AS completed_tasks,
  ROUND(AVG(cs.score)) AS avg_compliance_score,
  ROUND(AVG(t.progress_percentage)) AS avg_task_progress,
  MAX(ac.expiration_date) AS next_accreditation_expiration
FROM programs p
LEFT JOIN colleges c ON c.id = p.college_id
LEFT JOIN accreditation_areas aa ON aa.program_id = p.id
LEFT JOIN tasks t ON t.area_id = aa.id
LEFT JOIN compliance_scores cs ON cs.program_id = p.id
LEFT JOIN accreditation_cycles ac ON ac.program_id = p.id AND ac.status NOT IN ('cancelled', 'completed')
GROUP BY p.id, p.name, p.college_id, c.name;
```

**VPAA Dashboard Metrics:**
```sql
CREATE VIEW vpaa_dashboard_metrics AS
SELECT 
  COUNT(DISTINCT c.id) AS total_colleges,
  COUNT(DISTINCT p.id) AS total_programs,
  COUNT(DISTINCT aa.id) AS total_areas,
  COUNT(DISTINCT t.id) AS total_tasks,
  COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) AS completed_tasks,
  COUNT(DISTINCT CASE WHEN t.status = 'overdue' THEN t.id END) AS overdue_tasks,
  ROUND(AVG(c.compliance_score)) AS avg_college_compliance,
  COUNT(DISTINCT CASE WHEN ac.validity_status = 'expiring' THEN ac.id END) AS expiring_accreditations,
  COUNT(DISTINCT CASE WHEN ac.validity_status = 'expired' THEN ac.id END) AS expired_accreditations
FROM colleges c
LEFT JOIN programs p ON p.college_id = c.id
LEFT JOIN accreditation_areas aa ON aa.program_id = p.id
LEFT JOIN tasks t ON t.area_id = aa.id
LEFT JOIN compliance_scores cs ON cs.college_id = c.id
LEFT JOIN accreditation_cycles ac ON ac.program_id = p.id;
```

**QA Dashboard Metrics:**
```sql
CREATE VIEW qa_dashboard_metrics AS
SELECT 
  COUNT(DISTINCT t.id) AS total_tasks,
  COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) AS completed_tasks,
  COUNT(DISTINCT CASE WHEN t.status = 'overdue' THEN t.id END) AS overdue_tasks,
  COUNT(DISTINCT d.id) AS total_documents,
  COUNT(DISTINCT CASE WHEN d.status = 'approved' THEN d.id END) AS approved_documents,
  COUNT(DISTINCT CASE WHEN d.status = 'rejected' THEN d.id END) AS rejected_documents,
  COUNT(DISTINCT CASE WHEN d.status = 'revision' THEN d.id END) AS revision_requested,
  ROUND(AVG(t.progress_percentage)) AS avg_task_progress
FROM tasks t
LEFT JOIN documents d ON d.task_id = t.id;
```

### 8.2 Materialized Views (Performance)

**For complex aggregations:**
```sql
CREATE MATERIALIZED VIEW college_progress_summary AS
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

-- Refresh strategy
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW college_progress_summary;
  REFRESH MATERIALIZED VIEW program_progress_summary;
  REFRESH MATERIALIZED VIEW area_progress_summary;
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh (via pg_cron or application)
-- SELECT cron.schedule('refresh-views', '0 * * * *', 'SELECT refresh_materialized_views()');
```

---

## 9. SUPABASE COMPATIBILITY

### 9.1 Supabase-Specific Features

**✅ Compatible Features:**

1. **UUID Primary Keys** - Native support
2. **TIMESTAMPTZ** - Native support
3. **JSONB** - Native support with indexing
4. **Generated Columns** - Supported (PostgreSQL 12+)
5. **CHECK Constraints** - Native support
6. **Foreign Keys** - Native support
7. **RLS (Row Level Security)** - Core Supabase feature
8. **Realtime** - Can subscribe to table changes

### 9.2 Supabase Limitations

**⚠️ Considerations:**

1. **Partitioning** - Supported but requires manual setup
2. **Materialized Views** - Supported but no auto-refresh (use pg_cron extension)
3. **Connection Pooling** - Use Supabase's pooler (port 6543)
4. **Full-Text Search** - Use `tsvector` columns if needed
5. **Custom Functions** - Use SECURITY DEFINER for elevated privileges

### 9.3 Supabase Best Practices

**Recommended Configuration:**

1. **Enable Realtime:**
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
   ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
   ALTER PUBLICATION supabase_realtime ADD TABLE review_workflows;
   ```

2. **Storage Buckets:**
   - `documents` - Document files
   - `evidence` - Evidence attachments
   - Set up RLS on storage objects

3. **Edge Functions:**
   - Use for complex business logic
   - Keep database triggers simple

4. **Auth Integration:**
   - Use `auth.uid()` in RLS policies
   - Sync profiles with auth.users

---

## 10. RECOMMENDED MIGRATION ORDER

### Phase 0: Foundation (Week 1-2)

**Objective:** Establish organizational hierarchy and core workflow entities

**Migrations:**
1. `005_create_colleges.sql` - Create colleges table
2. `006_add_college_to_programs.sql` - Add college_id to programs
3. `007_create_accreditation_instruments.sql` - Create instruments
4. `008_create_instrument_criteria.sql` - Create criteria
5. `009_create_tasks.sql` - Create tasks table
6. `010_create_task_progress.sql` - Create progress tracking

**Rationale:**
- Colleges first (Dean role depends on it)
- Instruments before QA (QA validates against instruments)
- Tasks before workflows (workflows operate on tasks)

---

### Phase 1: Role Management (Week 3)

**Objective:** Enable new roles and assignment tracking

**Migrations:**
1. `011_update_roles.sql` - Update role CHECK constraint
2. `012_create_role_assignments.sql` - Create role_assignments
3. `013_create_area_chair_assignments.sql` - Create area_chair_assignments
4. `014_migrate_assignments.sql` - Migrate existing data

**Rationale:**
- Roles must be updated before creating assignments
- Migrate existing data to new structure

---

### Phase 2: Review Workflows (Week 4-5)

**Objective:** Implement multi-step approval workflows

**Migrations:**
1. `015_enhance_documents.sql` - Add task_id, evidence_type
2. `016_create_review_workflows.sql` - Create workflows
3. `017_create_review_steps.sql` - Create steps
4. `018_deprecate_submission_schedules.sql` - Migrate to tasks

**Rationale:**
- Enhance existing tables before creating workflows
- Deprecate redundant tables

---

### Phase 3: Accreditation Cycles (Week 6)

**Objective:** Support Accreditor role

**Migrations:**
1. `019_create_accreditation_cycles.sql` - Create cycles
2. `020_enhance_cycles_validity.sql` - Add validity tracking
3. `021_create_validity_alerts.sql` - Create alerts

**Rationale:**
- Cycles before accreditor assignments
- Validity tracking after cycles

---

### Phase 4: Role-Specific Features (Week 7)

**Objective:** Add VPAA and QA features

**Migrations:**
1. `022_create_institutional_reviews.sql` - VPAA reviews
2. `023_create_task_evidence_requirements.sql` - Evidence specs
3. `024_create_aggregation_views.sql` - Dashboard views

**Rationale:**
- Institutional reviews for VPAA
- Evidence requirements for QA
- Views last (depend on all tables)

---

### Phase 5: Security (Week 8)

**Objective:** Update RLS policies for new roles

**Migrations:**
1. `025_update_rls_policies.sql` - Comprehensive RLS updates

**Rationale:**
- Security last (after all tables exist)
- Test all access patterns

---

### Phase 6: Frontend Integration (Week 9-10)

**Objective:** Update TypeScript types and stores

**Tasks:**
1. Update `src/types/index.ts`
2. Update all stores
3. Implement role-based routing
4. Create role-specific dashboards

**Rationale:**
- Frontend last (after database stable)

---

## 11. SUMMARY

### Final Table Count

**Total Tables: 20**

**Existing (7):**
1. profiles
2. programs
3. accreditation_areas
4. documents
5. compliance_scores
6. notifications
7. audit_logs
8. activity_log

**New (12):**
1. colleges
2. role_assignments
3. area_chair_assignments
4. accreditation_instruments
5. instrument_criteria
6. tasks
7. task_progress
8. review_workflows
9. review_steps
10. accreditation_cycles
11. institutional_reviews
12. task_evidence_requirements
13. accreditation_validity_alerts

**Deprecated (1):**
1. submission_schedules (migrate to tasks)

**Removed from Original Plan (3):**
1. quality_checks (merged into review_steps)
2. accreditor_assignments (merged into role_assignments)
3. compliance_scores (kept, not removed)

### Key Design Decisions

1. **Tasks replace submission_schedules** - More flexible, more features
2. **Review steps replace quality_checks** - Unified review workflow
3. **Role assignments replace accreditor_assignments** - Centralized role management
4. **Instrument criteria normalized** - Better queryability
5. **Generated columns for validity** - Automatic computation
6. **Materialized views for reporting** - Performance optimization

### Architecture Strengths

✅ **Normalized to 3NF** - No data redundancy
✅ **Scalable** - Indexed, partitionable, cacheable
✅ **Flexible** - JSONB for variable data
✅ **Performant** - Denormalized where appropriate
✅ **Secure** - RLS-ready design
✅ **Maintainable** - Clear relationships, no circular dependencies
✅ **Supabase-compatible** - Uses native features

### Next Steps

1. Review final architecture with stakeholders
2. Approve migration order
3. Generate migration SQL files
4. Set up staging environment
5. Execute Phase 0 migrations
6. Begin frontend integration

---

**Document Status:** FINAL  
**Ready for Migration:** YES  
**Approval Required:** VPAA, IT Director, Database Administrator