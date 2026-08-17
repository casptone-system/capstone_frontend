# Backend Integration Guide - Database & Notification Flow

## System Overview

This document explains **exactly** how the accreditation system works with database connectivity and real-time notifications.

---

## 🔴 CURRENT STATE: Demo Mode

**Status:** Components work but API is not fully connected
- ✅ All UI components fully functional
- ✅ Assignment operations work locally
- ✅ Notifications send (but may fail gracefully)
- ❌ Data does NOT persist to database
- ❌ Faculty tasks NOT auto-created from assignments
- ❌ Reverse notifications NOT fully tested

---

## 🔄 End-to-End Notification & Task Flow

### SCENARIO: Program Chair Assigns Faculty to Area

#### Frontend Action (Program Chair)
```
Program Chair Dashboard
├─ AreaAssignmentCard OR FacultyAreaAssignmentList
├─ Selects: Faculty + Area + Deadline + Instructions
└─ Clicks: "Assign Faculty"
```

#### What Happens:
```javascript
// Component Code
const assignFaculty = async (areaId) => {
  const response = await api.post(`/accreditation-areas/${areaId}/members`, {
    user_id: facultyId,
    role: 'member',
    deadline: newAssignmentDeadline,      // e.g., "2024-12-31"
    instructions: newAssignmentInstructions // e.g., "Complete annual assessment..."
  })
  
  // Send notification to faculty
  await api.post('/notifications', {
    user_id: facultyId,
    type: 'area_assignment',
    title: 'New Area Assignment: Student Learning Outcomes',
    message: 'You have been assigned to the SLO area...',
  })
}
```

#### Backend API Endpoint (Laravel)

**Required Endpoint:**
```
POST /api/accreditation-areas/{area_id}/members
Headers: 
  Content-Type: application/json
  Authorization: Bearer {token}

Request Body:
{
  "user_id": 15,                              // Faculty ID
  "role": "member",
  "deadline": "2024-12-31",
  "instructions": "Complete annual assessment..."
}

Expected Response:
{
  "success": true,
  "message": "Faculty assigned successfully",
  "data": {
    "assignment_id": 42,
    "area_id": 1,
    "faculty_id": 15,
    "deadline": "2024-12-31",
    "assigned_at": "2024-08-17T10:30:00Z"
  }
}
```

**Laravel Implementation Pseudocode:**
```php
// routes/api.php
Route::post('/accreditation-areas/{area}/members', [AreaController::class, 'assignMember']);

// app/Http/Controllers/AreaController.php
public function assignMember(Request $request, AccreditationArea $area) {
    // 1. Validate input
    $validated = $request->validate([
        'user_id' => 'required|integer|exists:users,id',
        'role' => 'string',
        'deadline' => 'date',
        'instructions' => 'string'
    ]);
    
    // 2. Create assignment in database
    $assignment = $area->members()->create([
        'user_id' => $validated['user_id'],
        'role' => $validated['role'] ?? 'member',
        'deadline' => $validated['deadline'],
        'instructions' => $validated['instructions']
    ]);
    
    // 3. Create task for faculty
    Task::create([
        'user_id' => $validated['user_id'],
        'area_id' => $area->id,
        'title' => 'Complete ' . $area->name,
        'deadline' => $validated['deadline'],
        'status' => 'assigned'
    ]);
    
    // 4. Trigger notification event
    event(new AreaAssignmentCreated($area, User::find($validated['user_id'])));
    
    return response()->json([...], 201);
}
```

#### Database State After Assignment
```sql
-- accreditation_area_members table
INSERT INTO accreditation_area_members 
(area_id, user_id, role, deadline, instructions, created_at, updated_at)
VALUES 
(1, 15, 'member', '2024-12-31', 'Complete annual assessment...', NOW(), NOW());

-- tasks table (auto-created)
INSERT INTO tasks 
(user_id, area_id, title, deadline, status, created_at, updated_at)
VALUES 
(15, 1, 'Complete Student Learning Outcomes', '2024-12-31', 'assigned', NOW(), NOW());

-- notifications table
INSERT INTO notifications 
(user_id, type, title, message, read, created_at, updated_at)
VALUES 
(15, 'area_assignment', 'New Area Assignment: Student Learning Outcomes', 
 'You have been assigned to the SLO area. Please review the task details...', 
 false, NOW(), NOW());
```

---

### SCENARIO: Faculty Receives Notification & Sees Task

#### Frontend Action (Faculty)
```
Faculty Dashboard
├─ Notifications badge shows +1 unread
├─ Click "Tasks" tab
├─ See new task: "Complete Student Learning Outcomes"
└─ Click task to view deadline & instructions
```

#### What Happens on Page Load:
```javascript
// FacultyDashboard.vue - onMounted
onMounted(async () => {
  await loadTasks()
  await loadNotifications()
})

// Load tasks from backend
const loadTasks = async () => {
  const response = await getTasks()
  // Response should include:
  // [
  //   {
  //     id: 1,
  //     title: 'Complete Student Learning Outcomes',
  //     area_id: 1,
  //     area_name: 'Student Learning Outcomes',
  //     deadline: '2024-12-31',
  //     instructions: 'Complete annual assessment...',
  //     status: 'assigned'
  //   }
  // ]
}
```

#### Backend Endpoint (Faculty Task Retrieval)
```
GET /api/tasks
Headers: 
  Authorization: Bearer {token}

Expected Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 15,
      "area_id": 1,
      "area_name": "Student Learning Outcomes",
      "title": "Complete Student Learning Outcomes",
      "description": null,
      "deadline": "2024-12-31",
      "instructions": "Complete annual assessment including data collection, analysis, and recommendations.",
      "status": "assigned",
      "created_at": "2024-08-17T10:30:00Z",
      "updated_at": "2024-08-17T10:30:00Z"
    }
  ]
}
```

---

### SCENARIO: Faculty Submits Document

#### Frontend Action (Faculty)
```
Faculty Dashboard
├─ Click "Upload" or "Documents" tab
├─ See accreditation areas they're assigned to
├─ Click "Submit Document" for area
├─ Form appears:
│  ├─ Document Title: "VMAO Alignment Matrix 2024"
│  ├─ Accreditation Area: "Student Learning Outcomes" (pre-filled)
│  ├─ Academic Year: "2024-2025"
│  ├─ Description: "Alignment of program outcomes with institutional goals..."
│  └─ File: [Choose File] → VMAO_Matrix.pdf
├─ Click "Submit Document"
└─ Success! Document submitted for review
```

#### What Happens:
```javascript
// AreaDocumentSubmission.vue
const submitDocument = async () => {
  const formData = new FormData()
  formData.append('faculty_id', currentFacultyId)
  formData.append('area_id', areaId)
  formData.append('title', documentTitle)
  formData.append('type', documentType)
  formData.append('academic_year', academicYear)
  formData.append('description', description)
  formData.append('file', fileObject)
  
  const response = await api.post('/area-documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  
  // After successful submission, send notification to Program Chair
  await api.post('/notifications', {
    user_id: programChairId,
    type: 'document_submitted',
    title: 'New Document Submitted',
    message: `Dr. Maria Santos submitted "VMAO Alignment Matrix 2024" for SLO area`,
  })
}
```

#### Backend Endpoint (Document Submission)
```
POST /api/area-documents
Headers:
  Content-Type: multipart/form-data
  Authorization: Bearer {token}

Form Data:
{
  "faculty_id": 15,
  "area_id": 1,
  "title": "VMAO Alignment Matrix 2024",
  "type": "document",
  "academic_year": "2024-2025",
  "description": "Alignment of program outcomes with institutional goals...",
  "file": <binary file data>
}

Expected Response:
{
  "success": true,
  "data": {
    "id": 123,
    "faculty_id": 15,
    "area_id": 1,
    "title": "VMAO Alignment Matrix 2024",
    "file_name": "VMAO_Matrix.pdf",
    "file_path": "/storage/documents/area_1/VMAO_Matrix_123.pdf",
    "status": "pending",
    "created_at": "2024-08-17T11:45:00Z"
  }
}
```

#### Database State After Submission
```sql
-- area_documents table
INSERT INTO area_documents 
(faculty_id, area_id, title, type, academic_year, description, 
 file_name, file_path, status, created_at, updated_at)
VALUES 
(15, 1, 'VMAO Alignment Matrix 2024', 'document', '2024-2025',
 'Alignment of program outcomes with institutional goals...',
 'VMAO_Matrix.pdf', '/storage/documents/area_1/VMAO_Matrix_123.pdf',
 'pending', NOW(), NOW());

-- notifications table (to Program Chair)
INSERT INTO notifications 
(user_id, type, title, message, read, related_entity_type, related_entity_id, created_at)
VALUES 
(1, 'document_submitted', 'New Document Submitted',
 'Dr. Maria Santos submitted "VMAO Alignment Matrix 2024" for SLO area',
 false, 'area_document', 123, NOW());
```

---

### SCENARIO: Program Chair Reviews & Approves Document

#### Frontend Action (Program Chair)
```
Program Chair Dashboard
├─ Click "Area Documents" section
├─ See pending documents
├─ Click document: "VMAO Alignment Matrix 2024"
│  ├─ Faculty: Dr. Maria Santos
│  ├─ Area: Student Learning Outcomes
│  ├─ Submitted: Aug 17, 2024 11:45 AM
│  ├─ Status: Pending Review
│  ├─ [Preview] [Download] buttons
│  └─ Action buttons:
│     ├─ [✓ Approve] 
│     ├─ [⟲ Request Revision] (with feedback modal)
│     └─ [✕ Reject] (with reason)
├─ Click "Approve" or fills feedback & clicks "Request Revision"
└─ Action submitted
```

#### What Happens:
```javascript
// AreaDocumentsReview.vue or DocumentReviewCard.vue
const approveDocument = async (documentId) => {
  const response = await api.post(`/area-documents/${documentId}/approve`, {
    feedback: null // No feedback needed for approval
  })
  
  // Send notification to faculty
  await api.post('/notifications', {
    user_id: facultyId,
    type: 'document_approved',
    title: 'Document Approved',
    message: 'Your submission "VMAO Alignment Matrix 2024" has been approved.',
  })
}

// OR for revision request
const requestRevision = async (documentId, feedback) => {
  const response = await api.post(`/area-documents/${documentId}/request-revision`, {
    feedback: feedback // e.g., "Please update the alignment matrix..."
  })
  
  // Send notification to faculty
  await api.post('/notifications', {
    user_id: facultyId,
    type: 'document_revision_requested',
    title: 'Revision Requested',
    message: feedback,
  })
}
```

#### Backend Endpoints (Document Review)
```
POST /api/area-documents/{document_id}/approve
Headers:
  Authorization: Bearer {token}

Body: { "feedback": null }

Expected Response:
{
  "success": true,
  "data": {
    "id": 123,
    "status": "approved",
    "reviewed_by": 1,
    "reviewed_at": "2024-08-17T12:00:00Z"
  }
}

---

POST /api/area-documents/{document_id}/request-revision
Headers:
  Authorization: Bearer {token}

Body: { "feedback": "Please update the alignment matrix with more detail..." }

Expected Response:
{
  "success": true,
  "data": {
    "id": 123,
    "status": "revision_requested",
    "feedback": "Please update the alignment matrix...",
    "reviewed_by": 1,
    "reviewed_at": "2024-08-17T12:00:00Z"
  }
}
```

#### Database State After Approval
```sql
-- area_documents table - UPDATED
UPDATE area_documents 
SET status = 'approved',
    reviewed_by = 1,
    reviewed_at = NOW(),
    updated_at = NOW()
WHERE id = 123;

-- notifications table - TO FACULTY
INSERT INTO notifications 
(user_id, type, title, message, read, related_entity_type, related_entity_id, created_at)
VALUES 
(15, 'document_approved', 'Document Approved',
 'Your submission "VMAO Alignment Matrix 2024" has been approved.',
 false, 'area_document', 123, NOW());

-- Update task status (optional, if tracking document submission as task)
UPDATE tasks 
SET status = 'submitted'
WHERE area_id = 1 AND user_id = 15;
```

#### Faculty Receives Reverse Notification
```
Faculty Dashboard
├─ Notifications badge shows +1 new
├─ See notification: "Document Approved"
├─ Click notification → View document details
└─ Document status shows "Approved" with checkmark
```

---

## 📋 Checklist: Required Backend Endpoints

### Priority 1: Core Assignment Flow
- [ ] `POST /api/accreditation-areas/{area_id}/members` - Assign faculty to area
- [ ] `GET /api/accreditation-areas/{area_id}/members` - Get assigned faculty for area
- [ ] `DELETE /api/accreditation-areas/{area_id}/members/{faculty_id}` - Remove assignment
- [ ] `GET /api/tasks` - Load tasks for logged-in user
- [ ] `POST /api/notifications` - Send notification to user
- [ ] `GET /api/notifications` - Get notifications for user

### Priority 2: Document Submission Flow
- [ ] `POST /api/area-documents` - Submit document
- [ ] `GET /api/area-documents` - Get submitted documents (filtered by filters)
- [ ] `GET /api/area-documents/{id}` - Get document details
- [ ] `DELETE /api/area-documents/{id}` - Delete document (if pending)
- [ ] `POST /api/area-documents/{id}/download` - Download document

### Priority 3: Document Review Flow
- [ ] `POST /api/area-documents/{id}/approve` - Approve document
- [ ] `POST /api/area-documents/{id}/reject` - Reject document
- [ ] `POST /api/area-documents/{id}/request-revision` - Request revision
- [ ] `GET /api/area-documents/{id}/feedback` - Get review feedback

### Priority 4: Additional Features
- [ ] `GET /api/programs/{id}/area-assignments` - Get all assignments for program
- [ ] `GET /api/area-assignments/history` - Get assignment audit log
- [ ] `GET /api/accreditation-cycles` - Get accreditation cycles
- [ ] `POST /api/accreditation-cycles` - Create new cycle

---

## 🧪 Testing the Integration

### Test 1: Database Connection Verification
```bash
# Check if endpoints respond
curl -H "Authorization: Bearer {token}" \
  http://localhost:8000/api/accreditation-areas

# Should return:
# { "data": [...areas...] }

# If returns 404 or 500, endpoint not implemented yet
```

### Test 2: Assign Faculty & Check Notifications
```javascript
// Frontend console
1. Open Program Chair Dashboard
2. Click "Faculty Area Assignments"
3. Select faculty and area
4. Click "Assign"
5. Check browser console for: "✓ Assignment created"
6. Check if notification appears (or check database notifications table)
7. Refresh Faculty Dashboard
8. Faculty should see new task in "Tasks" tab
```

### Test 3: Submit Document & Check Reverse Notification
```javascript
// Frontend console
1. Login as Faculty
2. Click "Upload" section
3. Submit document for assigned area
4. Check browser console for: "✓ Document submitted"
5. Login as Program Chair
6. Check "Area Documents" section
7. Program Chair should see new document
8. Click "Approve" or "Request Revision"
9. Switch back to Faculty view
10. Faculty should see notification
```

---

## 📊 Demo Mode vs. Real Mode

### DEMO MODE (No Backend)
```
✅ Everything works locally
✅ No errors in console (only warnings)
✅ Data is NOT persisted
✅ Notifications show in console logs
✅ Perfect for UI/UX testing

Commands to use:
- npm run serve
- Test all workflows in browser
- Data resets on page refresh
```

### REAL MODE (With Backend Connected)
```
✅ Everything works AND persists
✅ Real notifications to users
✅ Database contains all data
✅ Data visible across sessions
✅ Multi-user workflows work

Requirements:
1. Implement all endpoints above
2. Create database tables
3. Configure Laravel authentication
4. Update CORS/CSRF if needed
5. Run migrations: php artisan migrate
```

### HYBRID MODE (Partial Backend)
```
✅ Some endpoints work, others fail gracefully
✅ Useful for incremental development
✅ Console logs show which endpoints fail
✅ UI continues to function
⚠️ Some features won't persist

Example:
- POST /area-documents works (saves to DB)
- GET /area-documents fails (shows demo data)
- Notifications work partially
```

---

## 🔧 Troubleshooting

### Issue: "Notification sent but faculty didn't receive it"
**Solution:** Check notifications table in database
```sql
SELECT * FROM notifications WHERE user_id = 15 ORDER BY created_at DESC;
-- Should show recent notification
-- If not, POST /notifications endpoint not working
```

### Issue: "Assignment created but faculty doesn't see task"
**Solution:** Check tasks table and loadTasks endpoint
```sql
SELECT * FROM tasks WHERE user_id = 15;
-- Should show assigned task
-- Check /api/tasks endpoint response
```

### Issue: "Console shows ✓ but nothing in database"
**Solution:** Endpoints exist but not saving to database
1. Check Laravel controller logs: `storage/logs/laravel.log`
2. Verify database connection in `.env`
3. Run migrations: `php artisan migrate`
4. Check if user exists: `SELECT * FROM users WHERE id = 15;`

### Issue: "Getting CORS/401 errors"
**Solution:** Check authentication
1. Verify token is valid: `echo $token | base64 --decode`
2. Check if user is authenticated: `authStore.user` in browser console
3. Verify Authorization header: `Bearer {token}` (space important!)

---

## 📝 Summary

**Current State:** Demo mode fully working, backend not connected

**To Enable Real Database Integration:**
1. Implement the 13 required endpoints (see checklist)
2. Create database tables (schemas provided)
3. Set up Laravel event listeners for notifications
4. Test each workflow end-to-end
5. Monitor console logs for any API failures

**Timeline:** 
- Phase 1 (Priority 1): 2-3 hours
- Phase 2 (Priority 2): 2-3 hours  
- Phase 3 (Priority 3): 1-2 hours
- Phase 4 (Priority 4): 1 hour

All frontend code is ready. Backend implementation is straightforward following the endpoints above.
