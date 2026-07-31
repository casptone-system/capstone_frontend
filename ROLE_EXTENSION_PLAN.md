# ADAMS Database Schema Extension Plan
## Supporting Multi-Role Accreditation Workflow

**Version:** 1.0  
**Date:** 2026-07-24  
**Objective:** Extend existing Supabase schema to support 6 roles: QA, VPAA/Director of Instruction, Dean, Area Chair, Team Member, Accreditor

---

## 1. CURRENT SCHEMA ASSESSMENT

### 1.1 Existing Tables

| Table | Purpose | Current Role Support |
|-------|---------|---------------------|
| `profiles` | User accounts with role field | ✅ dean, program-chair, faculty, admin |
| `programs` | Academic programs | ✅ chair assignment |
| `accreditation_areas` | Accreditation criteria areas | ✅ assigned_to (UUID array) |
| `documents` | Uploaded evidence documents | ✅ status tracking |
| `submission_schedules` | Deadline tracking | ✅ basic status |
| `compliance_scores` | Performance metrics | ✅ score/trend |
| `notifications` | User notifications | ✅ user-specific |
| `audit_logs` | System audit trail | ✅ action tracking |
| `activity_log` | Dashboard feed | ✅ activity display |

### 1.2 Current Limitations

**Critical Issues:**
1. **Role Enumeration Restrictive**: `profiles.role` CHECK constraint limits to 4 roles (dean, program-chair, faculty, admin)
2. **No Hierarchical Structure**: Missing organizational hierarchy (VPAA → Dean → Area Chair → Team Member)
3. **Weak Assignment Tracking**: `accreditation_areas.assigned_to` is a simple UUID array with no metadata
4. **No Review Workflow**: Documents lack formal review/approval chain
5. **Missing Role-Specific Entities**: No tables for QA checks, accreditation cycles, or VPAA oversight

**Frontend Alignment:**
- TypeScript types in `src/types/index.ts` mirror current 4-role structure
- Stores use mock data with hardcoded role assumptions
- No role-based view switching logic

---

## 2. MISSING ENTITIES

### 2.1 Required for New Roles

| Missing Entity | Purpose | Supports Role |
|----------------|---------|---------------|
| `role_assignments` | Formal assignment with metadata (who, when, role) | All roles |
| `review_workflows` | Multi-step approval chains | QA, Dean, VPAA |
| `review_steps` | Individual review actions within workflow | QA, Dean, VPAA |
| `accreditation_cycles` | External accreditation events | Accreditor |
| `accreditor_assignments` | External reviewer assignments | Accreditor |
| `quality_checks` | QA verification tasks | QA |
| `institutional_reviews` | VPAA oversight reviews | VPAA |
| `area_chair_assignments` | Formal Area Chair appointments | Area Chair |

### 2.2 Supporting Entities

| Supporting Entity | Purpose |
|-------------------|---------|
| `role_permissions` | Granular permission matrix per role |
| `approval_chains` | Configurable approval hierarchies |

---

## 3. RECOMMENDED NEW TABLES

### 3.1 role_assignments (REQUIRED)

**Purpose:** Replace simple UUID array with formal assignment tracking

```sql
CREATE TABLE role_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  area_id UUID REFERENCES accreditation_areas(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN (
    'qa', 'vpaa', 'dean', 'area-chair', 'team-member', 'accreditor'
  )),
  assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_assignment_scope CHECK (
    (program_id IS NOT NULL AND area_id IS NULL) OR
    (program_id IS NULL AND area_id IS NOT NULL) OR
    (program_id IS NULL AND area_id IS NULL)
  )
);

-- Indexes
CREATE INDEX idx_role_assignments_user ON role_assignments(user_id);
CREATE INDEX idx_role_assignments_program ON role_assignments(program_id);
CREATE INDEX idx_role_assignments_area ON role_assignments(area_id);
CREATE INDEX idx_role_assignments_role ON role_assignments(role);
CREATE INDEX idx_role_assignments_active ON role_assignments(is_active) WHERE is_active = true;
```

**Integration:**
- Replaces `accreditation_areas.assigned_to` array
- Links to `profiles`, `programs`, `accreditation_areas`
- Enables role-based access control (RBAC)

---

### 3.2 review_workflows (REQUIRED)

**Purpose:** Track multi-step review processes for documents and submissions

```sql
CREATE TABLE review_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('document', 'submission', 'area')),
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

**Integration:**
- Links to `documents`, `submission_schedules`, `accreditation_areas`
- Enables QA → Dean → VPAA approval chains

---

### 3.3 review_steps (REQUIRED)

**Purpose:** Individual review actions within a workflow

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
    'review', 'approve', 'reject', 'request-revision', 'comment'
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

**Integration:**
- Child of `review_workflows`
- References `profiles` for assignee
- Enables role-based step assignment

---

### 3.4 accreditation_cycles (REQUIRED for Accreditor)

**Purpose:** Track external accreditation events and cycles

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
```

**Integration:**
- Links to `programs` and `profiles` (lead_accreditor)
- Groups `accreditation_areas` and `submission_schedules`

---

### 3.5 accreditor_assignments (REQUIRED for Accreditor)

**Purpose:** Assign external reviewers to accreditation cycles

```sql
CREATE TABLE accreditor_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_id UUID NOT NULL REFERENCES accreditation_cycles(id) ON DELETE CASCADE,
  accreditor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN (
    'lead-accreditor', 'team-member', 'observer', 'secretary'
  )),
  assigned_areas UUID[] DEFAULT '{}',
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(cycle_id, accreditor_id)
);

-- Indexes
CREATE INDEX idx_accreditor_assignments_cycle ON accreditor_assignments(cycle_id);
CREATE INDEX idx_accreditor_assignments_accreditor ON accreditor_assignments(accreditor_id);
CREATE INDEX idx_accreditor_assignments_active ON accreditor_assignments(is_active) WHERE is_active = true;
```

**Integration:**
- Links `accreditation_cycles` to `profiles` (accreditors)
- References `accreditation_areas` via array

---

### 3.6 quality_checks (REQUIRED for QA)

**Purpose:** Track QA verification tasks and findings

```sql
CREATE TABLE quality_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  area_id UUID REFERENCES accreditation_areas(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  check_type TEXT NOT NULL CHECK (check_type IN (
    'completeness', 'accuracy', 'compliance', 'consistency', 'timeliness'
  )),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'in-progress', 'passed', 'failed', 'needs-revision'
  )),
  findings TEXT,
  recommendations TEXT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  checked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  checked_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_quality_checks_program ON quality_checks(program_id);
CREATE INDEX idx_quality_checks_area ON quality_checks(area_id);
CREATE INDEX idx_quality_checks_document ON quality_checks(document_id);
CREATE INDEX idx_quality_checks_status ON quality_checks(status);
CREATE INDEX idx_quality_checks_checked_by ON quality_checks(checked_by);
```

**Integration:**
- Links to `programs`, `accreditation_areas`, `documents`
- References `profiles` for QA reviewer

---

### 3.7 institutional_reviews (REQUIRED for VPAA)

**Purpose:** VPAA oversight and institutional-level reviews

```sql
CREATE TABLE institutional_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  review_type TEXT NOT NULL CHECK (review_type IN (
    'program-review', 'compliance-audit', 'strategic-plan', 'resource-allocation'
  )),
  scope TEXT NOT NULL, -- JSONB: { programs: [], areas: [] }
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'in-progress', 'under-review', 'approved', 'published'
  )),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN (
    'low', 'medium', 'high', 'urgent'
  )),
  findings JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_institutional_reviews_type ON institutional_reviews(review_type);
CREATE INDEX idx_institutional_reviews_status ON institutional_reviews(status);
CREATE INDEX idx_institutional_reviews_created_by ON institutional_reviews(created_by);
```

**Integration:**
- References `profiles` for reviewer and creator
- Scope uses JSONB for flexible program/area selection

---

### 3.8 area_chair_assignments (RECOMMENDED)

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

**Integration:**
- Links `accreditation_areas` to `profiles`
- Maintains assignment history

---

## 4. MODIFICATIONS TO EXISTING TABLES

### 4.1 profiles.role (MODIFY)

**Current:**
```sql
role TEXT NOT NULL DEFAULT 'faculty' CHECK (role IN ('dean', 'program-chair', 'faculty', 'admin'))
```

**Recommended:**
```sql
role TEXT NOT NULL DEFAULT 'team-member' CHECK (role IN (
  'qa', 'vpaa', 'dean', 'area-chair', 'team-member', 'accreditor', 'admin'
))
```

**Migration:**
```sql
-- Step 1: Drop old constraint
ALTER TABLE profiles DROP CONSTRAINT profiles_role_check;

-- Step 2: Add new constraint
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('qa', 'vpaa', 'dean', 'area-chair', 'team-member', 'accreditor', 'admin'));

-- Step 3: Update existing roles
UPDATE profiles SET role = 'area-chair' WHERE role = 'program-chair';
```

---

### 4.2 accreditation_areas.assigned_to (DEPRECATE)

**Current:** UUID array with no metadata

**Recommended:** Keep for backward compatibility, but populate from `role_assignments`

**Migration:**
```sql
-- Keep column but mark as deprecated in comments
COMMENT ON COLUMN accreditation_areas.assigned_to IS 'DEPRECATED: Use role_assignments table instead';

-- Populate from role_assignments (one-time migration)
UPDATE accreditation_areas aa
SET assigned_to = (
  SELECT array_agg(DISTINCT ra.user_id)
  FROM role_assignments ra
  WHERE ra.area_id = aa.id AND ra.is_active = true
);
```

---

### 4.3 programs.chair (MODIFY)

**Current:** Single UUID reference

**Recommended:** Keep for quick access, but maintain history in `area_chair_assignments`

**Migration:**
```sql
-- Add comment
COMMENT ON COLUMN programs.chair IS 'Current program chair (denormalized for performance). See area_chair_assignments for history.';
```

---

### 4.4 documents (ENHANCE)

**Add fields:**
```sql
ALTER TABLE documents ADD COLUMN IF NOT EXISTS workflow_id UUID REFERENCES review_workflows(id) ON DELETE SET NULL;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS current_reviewer UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS review_status TEXT CHECK (review_status IN (
  'not-started', 'under-review', 'approved', 'rejected', 'revision-requested'
));
CREATE INDEX idx_documents_workflow ON documents(workflow_id);
CREATE INDEX idx_documents_reviewer ON documents(current_reviewer);
```

---

### 4.5 submission_schedules (ENHANCE)

**Add fields:**
```sql
ALTER TABLE submission_schedules ADD COLUMN IF NOT EXISTS workflow_id UUID REFERENCES review_workflows(id) ON DELETE SET NULL;
ALTER TABLE submission_schedules ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE submission_schedules ADD COLUMN IF NOT EXISTS review_comments TEXT;
```

---

## 5. TABLE RELATIONSHIP DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                        PROFILES                                 │
│  (id, email, role, institution)                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ 1:N
                     ├────────────────────────────────────────────┐
                     │                                            │
          ┌──────────▼──────────┐                    ┌────────────▼──────────┐
          │   PROGRAMS          │                    │  role_assignments     │
          │  (id, name, code)   │                    │  (user_id, role,      │
          └──────────┬──────────┘                    │   program_id, area_id)│
                     │                               └───────────────────────┘
                     │ 1:N
          ┌──────────▼──────────┐
          │ ACCREDITATION_AREAS │
          │  (id, name, code)   │
          └──────────┬──────────┘
                     │
                     │ 1:N
          ┌──────────▼──────────┐
          │  DOCUMENTS          │
          │  (id, title, status)│
          └──────────┬──────────┘
                     │
                     │ 1:N
          ┌──────────▼──────────┐
          │ SUBMISSION_SCHEDULES│
          │  (id, due_date)     │
          └─────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    REVIEW WORKFLOWS                              │
│  (entity_type, entity_id, status)                                │
└───────────────────────┬──────────────────────────────────────────┘
                        │ 1:N
                ┌───────▼────────┐
                │  review_steps  │
                │  (step_number, │
                │   assigned_to) │
                └────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│              ACCREDITATION CYCLES (Accreditor)                   │
│  (program_id, cycle_type, status)                                │
└───────────────────────┬──────────────────────────────────────────┘
                        │ 1:N
                ┌───────▼────────────┐
                │accreditor_assignments│
                │(accreditor_id, role)│
                └─────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│              QUALITY CHECKS (QA)                                 │
│  (program_id, area_id, document_id, check_type)                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│           INSTITUTIONAL REVIEWS (VPAA)                           │
│  (review_type, scope, status)                                    │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│              AREA CHAIR ASSIGNMENTS                              │
│  (area_id, chair_id, is_current)                                 │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6. MIGRATION ROADMAP

### Phase 1: Foundation (Week 1-2)
**Objective:** Enable new roles and basic assignment tracking

**Migrations:**
1. `005_update_roles.sql` - Update role CHECK constraint
2. `006_create_role_assignments.sql` - Create role_assignments table
3. `007_create_area_chair_assignments.sql` - Create area_chair_assignments table
4. `008_migrate_assignments.sql` - Migrate existing assigned_to data

**Steps:**
```sql
-- 005_update_roles.sql
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('qa', 'vpaa', 'dean', 'area-chair', 'team-member', 'accreditor', 'admin'));
UPDATE profiles SET role = 'area-chair' WHERE role = 'program-chair';

-- 006_create_role_assignments.sql
-- [Create role_assignments table as defined above]

-- 007_create_area_chair_assignments.sql
-- [Create area_chair_assignments table as defined above]

-- 008_migrate_assignments.sql
-- Migrate program chairs
INSERT INTO area_chair_assignments (area_id, chair_id, assigned_at, is_current)
SELECT 
  (SELECT id FROM accreditation_areas WHERE program_id = p.id LIMIT 1),
  p.chair,
  p.created_at,
  true
FROM programs p
WHERE p.chair IS NOT NULL
ON CONFLICT DO NOTHING;

-- Migrate area assignments
INSERT INTO role_assignments (user_id, area_id, role, assigned_at, is_active)
SELECT 
  unnest(a.assigned_to),
  a.id,
  'area-chair',
  a.created_at,
  true
FROM accreditation_areas a
WHERE array_length(a.assigned_to, 1) > 0
ON CONFLICT DO NOTHING;
```

**Testing:**
- Verify role updates
- Test role_assignments queries
- Validate backward compatibility

---

### Phase 2: Review Workflows (Week 3-4)
**Objective:** Implement multi-step approval workflows

**Migrations:**
1. `009_enhance_documents.sql` - Add workflow fields to documents
2. `010_enhance_submissions.sql` - Add workflow fields to submissions
3. `011_create_review_workflows.sql` - Create review_workflows table
4. `012_create_review_steps.sql` - Create review_steps table

**Steps:**
```sql
-- 009_enhance_documents.sql
ALTER TABLE documents 
  ADD COLUMN IF NOT EXISTS workflow_id UUID REFERENCES review_workflows(id),
  ADD COLUMN IF NOT EXISTS current_reviewer UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS review_status TEXT;

-- 010_enhance_submissions.sql
ALTER TABLE submission_schedules 
  ADD COLUMN IF NOT EXISTS workflow_id UUID REFERENCES review_workflows(id),
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS review_comments TEXT;

-- 011_create_review_workflows.sql
-- [Create review_workflows table as defined above]

-- 012_create_review_steps.sql
-- [Create review_steps table as defined above]
```

**Testing:**
- Create test workflows
- Test step progression
- Validate role-based step assignment

---

### Phase 3: Role-Specific Features (Week 5-6)
**Objective:** Add tables for QA, VPAA, and Accreditor

**Migrations:**
1. `013_create_accreditation_cycles.sql` - For Accreditor
2. `014_create_accreditor_assignments.sql` - For Accreditor
3. `015_create_quality_checks.sql` - For QA
4. `016_create_institutional_reviews.sql` - For VPAA

**Steps:**
```sql
-- 013_create_accreditation_cycles.sql
-- [Create accreditation_cycles table as defined above]

-- 014_create_accreditor_assignments.sql
-- [Create accreditor_assignments table as defined above]

-- 015_create_quality_checks.sql
-- [Create quality_checks table as defined above]

-- 016_create_institutional_reviews.sql
-- [Create institutional_reviews table as defined above]
```

**Testing:**
- Test accreditation cycle creation
- Test QA check workflows
- Test VPAA review creation

---

### Phase 4: RLS Policies (Week 7)
**Objective:** Update security policies for new roles

**Migration:**
1. `017_update_rls_policies.sql` - Comprehensive RLS updates

**Key Policies:**
```sql
-- QA can view all documents and quality checks
CREATE POLICY "QA can view all documents"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('qa', 'admin')
    )
  );

-- VPAA can view all programs and institutional reviews
CREATE POLICY "VPAA can view all programs"
  ON programs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('vpaa', 'admin')
    )
  );

-- Accreditor can view assigned cycles
CREATE POLICY "Accreditors can view assigned cycles"
  ON accreditation_cycles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM accreditor_assignments
      WHERE cycle_id = accreditation_cycles.id
        AND accreditor_id = auth.uid()
        AND is_active = true
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin')
    )
  );

-- Role-based review step access
CREATE POLICY "Users can view assigned review steps"
  ON review_steps FOR SELECT
  USING (
    assigned_to = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin')
    )
  );
```

---

### Phase 5: Frontend Integration (Week 8-10)
**Objective:** Update TypeScript types and stores

**Tasks:**
1. Update `src/types/index.ts` with new interfaces
2. Update stores to use new tables
3. Implement role-based routing
4. Create role-specific dashboard views

**Type Updates:**
```typescript
export type UserRole = 'qa' | 'vpaa' | 'dean' | 'area-chair' | 'team-member' | 'accreditor' | 'admin'

export interface RoleAssignment {
  id: string
  userId: string
  programId?: string
  areaId?: string
  role: UserRole
  assignedBy: string
  assignedAt: string
  expiresAt?: string
  isActive: boolean
}

export interface ReviewWorkflow {
  id: string
  entityType: 'document' | 'submission' | 'area'
  entityId: string
  programId: string
  currentStep: number
  totalSteps: number
  status: 'pending' | 'in-progress' | 'approved' | 'rejected' | 'revision-requested'
  initiatedBy: string
  steps: ReviewStep[]
}

export interface ReviewStep {
  id: string
  workflowId: string
  stepNumber: number
  assignedTo: string
  roleRequired?: UserRole
  action: 'review' | 'approve' | 'reject' | 'request-revision' | 'comment'
  status: 'pending' | 'completed' | 'skipped' | 'overdue'
  comments?: string
  reviewedAt?: string
  dueDate: string
}

export interface AccreditationCycle {
  id: string
  name: string
  accreditingBody: string
  programId: string
  cycleType: 'initial' | 'renewal' | 'interim' | 'follow-up'
  status: 'planning' | 'preparation' | 'site-visit' | 'evaluation' | 'completed' | 'cancelled'
  startDate: string
  endDate: string
  siteVisitDate?: string
  leadAccreditor: string
}

export interface QualityCheck {
  id: string
  programId: string
  areaId?: string
  documentId?: string
  checkType: 'completeness' | 'accuracy' | 'compliance' | 'consistency' | 'timeliness'
  status: 'pending' | 'in-progress' | 'passed' | 'failed' | 'needs-revision'
  findings?: string
  recommendations?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
  checkedBy?: string
  checkedAt?: string
  dueDate: string
}

export interface InstitutionalReview {
  id: string
  title: string
  reviewType: 'program-review' | 'compliance-audit' | 'strategic-plan' | 'resource-allocation'
  scope: { programs: string[]; areas: string[] }
  status: 'draft' | 'in-progress' | 'under-review' | 'approved' | 'published'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  findings: any[]
  recommendations: any[]
  reviewedBy?: string
  reviewedAt?: string
  createdBy: string
}
```

---

## 7. RISK ANALYSIS

### 7.1 High Risk

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Data migration failure** | High | Medium | - Backup database before migration<br>- Run migrations in staging first<br>- Implement rollback scripts |
| **RLS policy conflicts** | High | Medium | - Test each policy individually<br>- Use least-privilege principle<br>- Document policy interactions |
| **Performance degradation** | High | Medium | - Add indexes before data migration<br>- Monitor query performance<br>- Use connection pooling |

### 7.2 Medium Risk

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Frontend breaking changes** | Medium | High | - Maintain backward compatibility<br>- Use feature flags<br>- Incremental rollout |
| **Role assignment conflicts** | Medium | Medium | - Implement unique constraints<br>- Add validation logic<br>- Clear assignment rules |
| **Workflow state inconsistencies** | Medium | Low | - Use database transactions<br>- Implement state machines<br>- Add audit logging |

### 7.3 Low Risk

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Seed data incompatibility** | Low | Low | - Update seed data after schema changes<br>- Use ON CONFLICT DO NOTHING |
| **TypeScript type mismatches** | Low | Medium | - Update types before implementation<br>- Use strict TypeScript mode<br>- Run type checks in CI/CD |

### 7.4 Rollback Strategy

**Database Rollback:**
```sql
-- Create rollback scripts for each migration
-- Example: 005_update_roles_rollback.sql
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('dean', 'program-chair', 'faculty', 'admin'));
UPDATE profiles SET role = 'program-chair' WHERE role = 'area-chair';

-- Drop new tables if needed
DROP TABLE IF EXISTS role_assignments CASCADE;
DROP TABLE IF EXISTS review_workflows CASCADE;
DROP TABLE IF EXISTS review_steps CASCADE;
-- ... etc
```

**Application Rollback:**
- Use feature flags to disable new features
- Maintain old API endpoints during transition
- Keep old TypeScript types in version control

---

## 8. IMPLEMENTATION CHECKLIST

### Pre-Migration
- [ ] Backup production database
- [ ] Set up staging environment
- [ ] Review migration scripts with team
- [ ] Create rollback scripts
- [ ] Notify users of maintenance window

### Phase 1: Foundation
- [ ] Run migration 005 (update roles)
- [ ] Run migration 006 (role_assignments)
- [ ] Run migration 007 (area_chair_assignments)
- [ ] Run migration 008 (migrate data)
- [ ] Test role-based queries
- [ ] Update TypeScript types
- [ ] Update auth store

### Phase 2: Review Workflows
- [ ] Run migration 009 (enhance documents)
- [ ] Run migration 010 (enhance submissions)
- [ ] Run migration 011 (review_workflows)
- [ ] Run migration 012 (review_steps)
- [ ] Test workflow creation
- [ ] Test step progression
- [ ] Update document store

### Phase 3: Role-Specific Features
- [ ] Run migration 013 (accreditation_cycles)
- [ ] Run migration 014 (accreditor_assignments)
- [ ] Run migration 015 (quality_checks)
- [ ] Run migration 016 (institutional_reviews)
- [ ] Test accreditation cycle workflows
- [ ] Test QA check creation
- [ ] Test VPAA review creation

### Phase 4: Security
- [ ] Run migration 017 (update RLS)
- [ ] Test role-based access
- [ ] Test cross-role visibility
- [ ] Audit policy coverage

### Phase 5: Frontend
- [ ] Update all TypeScript types
- [ ] Update all stores
- [ ] Implement role-based routing
- [ ] Create role-specific dashboards
- [ ] Update notification system
- [ ] Test all user roles

### Post-Migration
- [ ] Monitor database performance
- [ ] Review error logs
- [ ] Gather user feedback
- [ ] Document new workflows
- [ ] Train users on new roles

---

## 9. ROLE WORKFLOW COMPATIBILITY

### 9.1 QA Role Workflow

**Responsibilities:**
- Review documents for completeness and accuracy
- Create quality checks
- Request revisions
- Approve compliant submissions

**Database Interactions:**
- `quality_checks` (CRUD)
- `review_workflows` (initiate, view)
- `review_steps` (complete reviews)
- `documents` (view, comment)
- `notifications` (receive review assignments)

**Access Pattern:**
```
QA → quality_checks (create, read, update)
QA → review_workflows (initiate for documents)
QA → review_steps (complete assigned reviews)
QA → documents (read all, comment)
QA → programs (read all)
QA → accreditation_areas (read all)
```

---

### 9.2 VPAA / Director of Instruction Workflow

**Responsibilities:**
- Oversee all programs
- Create institutional reviews
- Approve high-level submissions
- View compliance across programs
- Allocate resources

**Database Interactions:**
- `institutional_reviews` (CRUD)
- `review_workflows` (final approval)
- `review_steps` (complete final reviews)
- `programs` (read all, update compliance scores)
- `compliance_scores` (view, update)
- `notifications` (receive escalation alerts)

**Access Pattern:**
```
VPAA → institutional_reviews (CRUD)
VPAA → review_workflows (final approval)
VPAA → programs (read all, update)
VPAA → compliance_scores (read all, update)
VPAA → accreditation_cycles (read all)
VPAA → notifications (receive escalations)
```

---

### 9.3 Dean Workflow

**Responsibilities:**
- Manage programs
- Review area submissions
- Assign area chairs
- Approve documents
- View program compliance

**Database Interactions:**
- `programs` (CRUD)
- `accreditation_areas` (CRUD for assigned programs)
- `role_assignments` (assign area chairs)
- `review_workflows` (initiate, approve)
- `review_steps` (complete reviews)
- `documents` (approve, reject)
- `notifications` (receive submission alerts)

**Access Pattern:**
```
Dean → programs (CRUD for assigned programs)
Dean → accreditation_areas (CRUD for program areas)
Dean → role_assignments (assign area chairs, team members)
Dean → review_workflows (initiate, approve)
Dean → documents (approve, reject)
Dean → submission_schedules (view, update)
```

---

### 9.4 Area Chair Workflow

**Responsibilities:**
- Manage accreditation areas
- Assign team members
- Review area submissions
- Ensure area compliance

**Database Interactions:**
- `accreditation_areas` (update for assigned areas)
- `role_assignments` (assign team members)
- `documents` (upload, update for assigned areas)
- `submission_schedules` (update for assigned areas)
- `review_workflows` (initiate for areas)
- `notifications` (receive area alerts)

**Access Pattern:**
```
Area Chair → accreditation_areas (update assigned areas)
Area Chair → role_assignments (assign team members)
Area Chair → documents (CRUD for assigned areas)
Area Chair → submission_schedules (update for assigned areas)
Area Chair → review_workflows (initiate)
Area Chair → team_members (view assignments)
```

---

### 9.5 Team Member Workflow

**Responsibilities:**
- Upload documents
- Update submission status
- Complete assigned tasks
- Respond to review comments

**Database Interactions:**
- `documents` (create, update own)
- `submission_schedules` (update own submissions)
- `review_steps` (view assigned reviews)
- `notifications` (receive task assignments)

**Access Pattern:**
```
Team Member → documents (create, update own)
Team Member → submission_schedules (update own)
Team Member → review_steps (view assigned)
Team Member → notifications (receive assignments)
Team Member → accreditation_areas (view assigned)
```

---

### 9.6 Accreditor Workflow

**Responsibilities:**
- Review accreditation cycles
- Evaluate submitted documents
- Provide findings and recommendations
- Conduct site visits

**Database Interactions:**
- `accreditation_cycles` (view assigned)
- `accreditor_assignments` (view own assignments)
- `documents` (view, comment on assigned programs)
- `review_steps` (complete evaluations)
- `quality_checks` (view, create findings)

**Access Pattern:**
```
Accreditor → accreditation_cycles (view assigned)
Accreditor → accreditor_assignments (view own)
Accreditor → documents (view assigned programs)
Accreditor → review_steps (complete evaluations)
Accreditor → quality_checks (view, create)
Accreditor → notifications (receive cycle updates)
```

---

## 10. FUTURE CONSIDERATIONS

### 10.1 Not Implemented (Out of Scope)

1. **Multi-institution support**: Current schema assumes single institution
2. **Document versioning**: Simple version field exists, no full version history
3. **Comment threads**: No threaded comments on documents
4. **External integrations**: No API for external systems
5. **Advanced analytics**: No data warehouse or reporting schema
6. **Mobile app support**: No push notification infrastructure

### 10.2 Potential Enhancements

1. **Document templates**: Standardized document structures
2. **Automated compliance checks**: Rule-based validation
3. **Notification preferences**: User-configurable alerts
4. **Bulk operations**: Mass document upload/approval
5. **Export/import**: CSV, PDF report generation
6. **API layer**: REST/GraphQL API for external access

---

## 11. CONCLUSION

This extension plan provides a comprehensive roadmap for supporting 6 distinct roles in the ADAMS accreditation system while preserving existing functionality. The phased approach minimizes risk and allows for incremental validation.

**Key Principles:**
1. **Preserve existing data**: All current tables remain intact
2. **Minimal disruption**: Backward-compatible migrations
3. **Role-based access**: Granular RBAC via role_assignments
4. **Workflow support**: Flexible review_workflows for approval chains
5. **Auditability**: Comprehensive audit trail via existing audit_logs

**Next Steps:**
1. Review this plan with stakeholders
2. Approve migration timeline
3. Set up staging environment
4. Begin Phase 1 implementation
5. Schedule user acceptance testing

---

**Document Owner:** Database Architect  
**Reviewers:** Development Team, QA Team, Stakeholders  
**Approval Required:** VPAA, IT Director