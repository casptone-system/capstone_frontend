# Real Faculty Backend Integration Guide

## Problem Statement

You're seeing **demo faculty** instead of **real faculty from your database**. The Program Chair dashboard shows "No faculty members have been assigned to this program yet" even though faculty exist in the database.

## What Changed

I've updated the application to **try FOUR different backend endpoints** in order to load real faculty:

```
Priority 1: GET /api/program-faculty              ← Preferred endpoint
   ↓ (if fails)
Priority 2: GET /api/programs/{programId}         ← Program details with embedded faculty
   ↓ (if fails)
Priority 3: GET /api/admin/users                  ← All users (filtered by faculty role)
   ↓ (if all fail)
❌ Shows empty faculty list (no demo fallback anymore)
```

---

## How to Debug

### Step 1: Check Browser Console Logs

Open your browser and go to **Program Chair Dashboard → Team & Invitations** or **Faculty Area Assignments**.

Open **DevTools** (F12) and look at the **Console** tab. You'll see messages like:

✅ **SUCCESS - Real Faculty Loaded:**
```
✓ Faculty loaded from /program-faculty: 5
✓ Faculty loaded from /programs/{id}: 3
✓ Faculty loaded from /admin/users: 8
```

⚠️ **WARNING - Trying Fallback:**
```
⚠️ /program-faculty endpoint failed, trying alternative...
⚠️ /programs/{id} endpoint failed, trying /admin/users...
⚠️ /admin/users endpoint failed too
```

❌ **FAILURE - No Faculty Loaded:**
```
❌ Could not load faculty from any backend endpoint
Make sure these endpoints are implemented:
  - GET /api/program-faculty
  - GET /api/programs/{id}
  - GET /api/admin/users
```

---

### Step 2: Test Each Endpoint Directly

Use **Postman** or **curl** to test if each endpoint is working:

#### Test Endpoint 1: Program Faculty
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/program-faculty

# Expected Response:
{
  "data": [
    {
      "id": 1,
      "name": "Dr. Maria Santos",
      "email": "maria@university.edu",
      "role": "Faculty"
    },
    {
      "id": 2,
      "name": "Prof. Juan Dela Cruz",
      "email": "juan@university.edu",
      "role": "Faculty"
    }
  ]
}
```

**Status:**
- ✅ 200 OK + data = Endpoint working
- ❌ 404 Not Found = Endpoint not implemented
- ❌ 500 Internal Server Error = Database/query error
- ❌ 401 Unauthorized = Token invalid

---

#### Test Endpoint 2: Program Details
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/programs/1

# Expected Response includes faculty array:
{
  "data": {
    "id": 1,
    "name": "Computer Science",
    "code": "CS",
    "faculty": [
      {"id": 1, "name": "Dr. Maria Santos", "email": "..."},
      {"id": 2, "name": "Prof. Juan Dela Cruz", "email": "..."}
    ]
    // OR
    "members": [...],
    // OR
    "users": [...]
  }
}
```

**Status:**
- ✅ 200 OK + `faculty`/`members`/`users` array = Endpoint working
- ✅ 200 OK but no faculty array = Program exists but no faculty assigned
- ❌ 404 Not Found = Program doesn't exist
- ❌ 500 Internal Server Error = Database error

---

#### Test Endpoint 3: Admin Users
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/admin/users

# Expected Response:
{
  "data": [
    {
      "id": 1,
      "name": "Dr. Maria Santos",
      "email": "maria@university.edu",
      "role": "Faculty"
    }
  ]
}
```

**Status:**
- ✅ 200 OK = Endpoint working
- ❌ 404 Not Found = Not implemented
- ❌ 403 Forbidden = Insufficient permissions

---

## Solutions by Scenario

### Scenario 1: All Endpoints Return 404

**Problem:** All endpoints missing (nothing implemented in backend)

**Solution:** Pick ONE endpoint and implement it. Recommended: `/api/program-faculty`

**Implementation (Laravel):**
```php
// routes/api.php
Route::get('/program-faculty', [FacultyController::class, 'getMyProgramFaculty']);

// app/Http/Controllers/FacultyController.php
public function getMyProgramFaculty(Request $request) {
    $user = Auth::user();
    $programId = $user->program_id;
    
    $faculty = User::where('program_id', $programId)
        ->where('role', 'faculty')
        ->get(['id', 'name', 'email', 'role', 'profile_photo']);
    
    return response()->json(['data' => $faculty]);
}
```

**Expected Result:** Faculty list appears in Program Chair dashboard

---

### Scenario 2: `/program-faculty` Works But Returns Empty

**Problem:** Endpoint exists but no faculty found

**Root Causes:**
1. No faculty assigned to the program
2. Faculty don't have correct `program_id` value
3. Faculty are marked with different role value

**How to Check in Database:**
```sql
-- Check if faculty exist in database
SELECT id, name, email, role, program_id FROM users WHERE role = 'faculty';

-- Check your program's faculty
SELECT id, name, email, role FROM users WHERE program_id = 1 AND role = 'faculty';

-- Check what program_id your current user has
SELECT id, name, email, program_id FROM users WHERE id = YOUR_ID;
```

**Solution:**
1. Assign faculty to your program:
   ```sql
   UPDATE users SET program_id = 1 WHERE id = 2 AND role = 'faculty';
   ```
2. Or modify endpoint to return all faculty regardless of program:
   ```php
   $faculty = User::where('role', 'faculty')->get([...]);
   ```

---

### Scenario 3: `/program-faculty` Works But Faculty Names Are Wrong

**Problem:** Endpoint returns data but wrong fields (first_name/last_name vs full name)

**Solution:** Update the mapping in the component.

In `ProgramChairDashboard.vue`, line ~760, update the mapping:

**Before:**
```javascript
const mappedFaculty = facultyData.map((person: any) => ({
  id: person.id || person.user_id,
  name: person.name || person.full_name || 'Unknown Faculty',  // ← checks these fields
  email: person.email || 'no-email@university.edu',
}))
```

**After (if your DB uses first_name/last_name):**
```javascript
const mappedFaculty = facultyData.map((person: any) => ({
  id: person.id || person.user_id,
  name: person.name || `${person.first_name} ${person.last_name}` || person.full_name || 'Unknown',
  email: person.email || 'no-email@university.edu',
}))
```

---

### Scenario 4: Faculty Load But Assignments Don't Show

**Problem:** Faculty list appears but no area assignments visible

**Root Cause:** Assignment data structure mismatch

**How to Check:**
1. Look at console for assignment loading message
2. Check if `/accreditation-areas/assignments` endpoint exists
3. Verify response format

**Expected Response:**
```json
{
  "data": [
    {
      "faculty_id": 1,
      "area_id": 2,
      "deadline": "2024-12-31",
      "instructions": "Complete assessment..."
    }
  ]
}
```

---

## Complete Endpoint Checklist

### Required for Faculty List Display
- [ ] `GET /api/program-faculty` → Returns faculty list
  - Alternative 1: `GET /api/programs/{id}` → Returns program with `faculty`/`members`/`users`
  - Alternative 2: `GET /api/admin/users` → Returns all users filtered by role

### Required for Area Assignments Display
- [ ] `GET /accreditation-areas` → List of accreditation areas
- [ ] `GET /accreditation-areas/{id}/members` → Faculty assigned to area
- [ ] `GET /accreditation-areas/assignments` → All faculty-area assignments

### Required for Assignment Functionality
- [ ] `POST /accreditation-areas/{id}/members` → Assign faculty to area
- [ ] `DELETE /accreditation-areas/{id}/members/{faculty_id}` → Remove assignment

### Required for Notifications
- [ ] `POST /api/notifications` → Send notification when faculty assigned

### Required for Task Display (Faculty Dashboard)
- [ ] `GET /api/tasks` → Get assigned tasks for current user

### Required for Document Management
- [ ] `POST /api/area-documents` → Faculty submits document
- [ ] `GET /api/area-documents` → Get submitted documents
- [ ] `POST /api/area-documents/{id}/approve` → Review document

---

## Quick Fix: Enable Real Faculty Now

If you have faculty in your database, do this RIGHT NOW:

### 1. Check Your Database
```sql
SELECT COUNT(*) FROM users WHERE role = 'faculty';
```

If count > 0, faculty exist. Proceed to step 2.

### 2. Implement Quickest Endpoint
```php
// routes/api.php
Route::middleware('auth:sanctum')->get('/program-faculty', function (Request $request) {
    $user = Auth::user();
    return response()->json([
        'data' => User::where('program_id', $user->program_id)
                      ->where('role', 'faculty')
                      ->get(['id', 'name', 'email', 'role', 'profile_photo'])
    ]);
});
```

### 3. Refresh Browser
Clear cache (Ctrl+Shift+Delete) and reload dashboard.

### 4. Check Console
Should see: `✓ Faculty loaded from /program-faculty: X`

---

## Detailed Logging in Console

When you open Program Chair dashboard, you should see something like:

```
✓ Program details loaded: Computer Science
✓ Faculty loaded from backend: 5 members
✓ Areas loaded from backend: 4 areas
✓ Assignments loaded: 12 records
ℹ️ Program and faculty loaded successfully
```

**If you see this:** ✅ Everything working!

**If you see warnings:** ⚠️ Some endpoints not implemented, trying fallbacks

**If you see errors:** ❌ Backend needs implementation

---

## Testing Workflow

### Test 1: Faculty List Appears
1. Go to Program Chair Dashboard
2. Click "Team & Invitations"
3. Scroll down to "User Management" section
4. Should see faculty members (NOT "No faculty members assigned")

### Test 2: Faculty Area Assignments
1. Go to Program Chair Dashboard
2. Click "Faculty Area Assignments"
3. Should see faculty in expandable cards
4. Click to expand and see assigned areas

### Test 3: Assign Faculty
1. Expand faculty card
2. Select an area from dropdown
3. Click "Assign"
4. Check database: `accreditation_area_members` table should have new row

### Test 4: Faculty See Tasks
1. Login as faculty
2. Go to Faculty Dashboard
3. Click "Tasks" tab
4. Should see "Complete [Area Name]" task
5. Task should have deadline from assignment

---

## Summary of Changes Made

### Frontend Updates
✅ ProgramChairDashboard now tries:
1. Load program details from `/programs/{id}`
2. Load faculty from `/program-faculty` (NEW - best option)
3. Fall back to program response if available
4. Show error messages if all fail

✅ FacultyAreaAssignmentList now tries:
1. Load faculty from `/program-faculty`
2. Fall back to `/programs/{id}`
3. Fall back to `/admin/users`
4. Show which endpoints failed in console

✅ Better console logging with:
- ✓ checkmarks for successes
- ⚠️ warnings for fallbacks
- ❌ errors for failures

### No Demo Data Anymore
❌ Removed hardcoded demo faculty
✅ Will show empty list until real backend connected
✅ Console shows exactly what needs to be implemented

---

## Next Steps

1. **Check Console Logs** - See which endpoint to implement
2. **Implement Missing Endpoint** - Use code samples above
3. **Test in Postman** - Verify endpoint returns correct data
4. **Refresh Browser** - See real faculty appear
5. **Test Full Workflow** - Assign faculty → see task appear → submit document

**Estimated Time:** 15-30 minutes to implement one endpoint

---

## Support Debugging

If faculty still don't appear after implementing endpoints:

1. **Check Backend Logs:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

2. **Check Browser Console:** F12 → Console tab → Look for error messages

3. **Test Token:** Paste token in https://jwt.io to verify claims

4. **Check Database Directly:**
   ```sql
   SELECT * FROM users WHERE id = YOUR_ID;
   SELECT * FROM users WHERE role = 'faculty' LIMIT 5;
   ```

5. **Enable Query Logging** in Laravel:
   ```php
   DB::listen(function ($query) {
       Log::debug($query->sql);
   });
   ```

If you get stuck, check the console output - the application will tell you exactly which endpoint failed!
