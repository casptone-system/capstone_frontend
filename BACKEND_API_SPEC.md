# Backend API Specification

This document outlines all the API endpoints that the Capstone Project (Ionic Vue) expects from the backend server.

## 🌐 Base Configuration

All endpoints are prefixed with the value of `VUE_APP_API_URL` from `.env.local`.

**Example**: If `VUE_APP_API_URL=http://localhost:3000/api`, then login endpoint is:
```
http://localhost:3000/api/auth/login
```

## 🔐 Authentication Endpoints

### 1. Login
**Endpoint**: `POST /auth/login`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (Success):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "dean"
  }
}
```

**Response** (Error):
```json
{
  "message": "Invalid email or password",
  "code": 401
}
```

**Used by**: `LoginPage.vue`

---

### 2. Forgot Password
**Endpoint**: `POST /auth/forgot-password`

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response** (Success):
```json
{
  "message": "Reset link sent to email",
  "success": true
}
```

**Response** (Error):
```json
{
  "message": "Email not found",
  "code": 404
}
```

**Used by**: `ForgotPassword.vue`

---

## 📊 Dashboard Endpoints

### 1. Dashboard Stats
**Endpoint**: `GET /dashboard/stats`

**Headers**:
```
Authorization: Bearer [token]
```

**Response**:
```json
{
  "totalDocuments": 1234,
  "approvedDocuments": 987,
  "pendingDocuments": 247,
  "activePrograms": 15,
  "recentActivity": [
    {
      "id": "activity_1",
      "type": "document_uploaded",
      "description": "New document uploaded",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Used by**: `Dashboard.vue`

---

## 📄 Document Endpoints

### 1. Get All Documents
**Endpoint**: `GET /documents?status=pending`

**Query Parameters**:
- `status`: optional - filter by status (approved, pending, rejected, archived)

**Response**:
```json
[
  {
    "id": "doc_001",
    "title": "Q1 Report 2024",
    "fileName": "q1_report.pdf",
    "fileSize": 2048576,
    "uploadedBy": "Jane Smith",
    "uploadedDate": "2024-01-15T09:30:00Z",
    "status": "approved",
    "description": "Q1 financial report"
  },
  {
    "id": "doc_002",
    "title": "Budget Summary",
    "fileName": "budget_summary.xlsx",
    "fileSize": 1024000,
    "uploadedBy": "John Doe",
    "uploadedDate": "2024-01-14T14:20:00Z",
    "status": "pending",
    "description": "2024 Budget Summary"
  }
]
```

**Used by**: `Documents.vue`

---

### 2. Upload Document
**Endpoint**: `POST /documents/upload`

**Headers**:
```
Authorization: Bearer [token]
Content-Type: multipart/form-data
```

**Form Data**:
```
file: [binary file data]
title: "Document Title"
description: "Document description"
```

**Response** (Success):
```json
{
  "id": "doc_003",
  "title": "Document Title",
  "fileName": "original_filename.pdf",
  "fileSize": 1024000,
  "status": "pending",
  "message": "Document uploaded successfully"
}
```

**Response** (Error):
```json
{
  "message": "File size exceeds limit",
  "code": 413
}
```

**Used by**: `Upload.vue`

---

### 3. Get Document Details
**Endpoint**: `GET /documents/:id`

**Response**:
```json
{
  "id": "doc_001",
  "title": "Q1 Report 2024",
  "fileName": "q1_report.pdf",
  "fileSize": 2048576,
  "uploadedBy": "Jane Smith",
  "uploadedDate": "2024-01-15T09:30:00Z",
  "status": "approved",
  "description": "Q1 financial report",
  "downloadUrl": "https://storage.example.com/documents/q1_report.pdf"
}
```

---

## 📊 Report Endpoints

### 1. Get All Reports
**Endpoint**: `GET /reports`

**Response**:
```json
[
  {
    "id": "report_001",
    "title": "Monthly Report",
    "description": "Monthly performance report",
    "generatedDate": "2024-01-15T10:00:00Z",
    "generatedBy": "Admin",
    "type": "monthly",
    "downloadUrl": "https://storage.example.com/reports/monthly_report.pdf"
  }
]
```

**Used by**: `Reports.vue`

---

### 2. Generate Report
**Endpoint**: `POST /reports/generate`

**Request**:
```json
{
  "type": "monthly",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

**Response**:
```json
{
  "id": "report_002",
  "title": "Generated Report",
  "status": "generating",
  "estimatedTime": 30,
  "message": "Report generation started"
}
```

---

## 👥 User Endpoints

### 1. Get All Users
**Endpoint**: `GET /users`

**Response**:
```json
[
  {
    "id": "user_001",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "dean",
    "department": "Engineering",
    "status": "active"
  },
  {
    "id": "user_002",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "faculty",
    "department": "Science",
    "status": "active"
  }
]
```

**Used by**: `Users.vue`

---

### 2. Create User
**Endpoint**: `POST /users`

**Request**:
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "role": "faculty",
  "department": "Arts"
}
```

**Response**:
```json
{
  "id": "user_003",
  "name": "New User",
  "email": "newuser@example.com",
  "role": "faculty",
  "message": "User created successfully"
}
```

---

### 3. Update Profile
**Endpoint**: `PUT /users/profile`

**Request**:
```json
{
  "name": "Jane Smith Updated",
  "department": "Engineering",
  "phone": "+1-555-0100"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "user_001",
    "name": "Jane Smith Updated",
    "email": "jane@example.com"
  }
}
```

**Used by**: `Settings.vue`

---

### 4. Change Password
**Endpoint**: `POST /users/change-password`

**Request**:
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Response** (Error):
```json
{
  "message": "Current password is incorrect",
  "code": 401
}
```

**Used by**: `Settings.vue`

---

### 5. Update Preferences
**Endpoint**: `PUT /users/preferences`

**Request**:
```json
{
  "emailNotifications": true,
  "theme": "light",
  "language": "en"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Preferences updated"
}
```

**Used by**: `Settings.vue`

---

### 6. Delete User
**Endpoint**: `DELETE /users/:id`

**Response**:
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Used by**: `Users.vue`

---

## 📋 Audit Endpoints

### 1. Get Audit Logs
**Endpoint**: `GET /audit-logs?status=success`

**Query Parameters**:
- `status`: optional - filter by status (success, failed)

**Response**:
```json
[
  {
    "id": "audit_001",
    "action": "Document uploaded",
    "user": "Jane Smith",
    "timestamp": "2024-01-15T10:30:00Z",
    "details": "File: q1_report.pdf",
    "status": "success"
  },
  {
    "id": "audit_002",
    "action": "Document deleted",
    "user": "John Doe",
    "timestamp": "2024-01-15T09:15:00Z",
    "details": "File ID: doc_045",
    "status": "success"
  },
  {
    "id": "audit_003",
    "action": "Failed login attempt",
    "user": "unknown",
    "timestamp": "2024-01-15T08:00:00Z",
    "details": "Invalid credentials from 192.168.1.100",
    "status": "failed"
  }
]
```

**Used by**: `Audit.vue`

---

## ✅ QA Review Endpoints

### 1. Get QA Reviews
**Endpoint**: `GET /qa-reviews?status=passed`

**Query Parameters**:
- `status`: optional - filter by status (passed, failed, pending)

**Response**:
```json
[
  {
    "id": "qa_001",
    "itemTitle": "Q1 Financial Report",
    "reviewer": "Sarah Wilson",
    "reviewDate": "2024-01-15T14:30:00Z",
    "status": "passed",
    "feedback": "Report meets all requirements. Approved for archival."
  },
  {
    "id": "qa_002",
    "itemTitle": "Budget Summary 2024",
    "reviewer": "Tom Harris",
    "reviewDate": "2024-01-14T11:00:00Z",
    "status": "pending",
    "feedback": "Awaiting final review"
  },
  {
    "id": "qa_003",
    "itemTitle": "Department Report",
    "reviewer": "Mike Johnson",
    "reviewDate": "2024-01-13T09:30:00Z",
    "status": "failed",
    "feedback": "Missing required signatures. Please resubmit."
  }
]
```

**Used by**: `QA.vue`

---

### 2. Create QA Review
**Endpoint**: `POST /qa-reviews`

**Request**:
```json
{
  "documentId": "doc_001",
  "feedback": "Approved for archival",
  "status": "passed"
}
```

**Response**:
```json
{
  "id": "qa_004",
  "documentId": "doc_001",
  "status": "passed",
  "message": "QA review created successfully"
}
```

---

### 3. Update QA Review
**Endpoint**: `PUT /qa-reviews/:id`

**Request**:
```json
{
  "feedback": "Updated feedback",
  "status": "passed"
}
```

**Response**:
```json
{
  "success": true,
  "message": "QA review updated"
}
```

---

## 🔄 Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "error": true,
  "message": "Error description",
  "code": 400,
  "details": "Additional error details"
}
```

---

## 🔒 Authentication

All endpoints except `/auth/login` and `/auth/forgot-password` require:

**Header**:
```
Authorization: Bearer [JWT_TOKEN]
```

**Token Format**: JWT (JSON Web Token)

**Token Storage**: Stored in `localStorage` as `authToken`

---

## ⚠️ Error Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Request processed successfully |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Invalid or missing authentication |
| 403 | Forbidden | User lacks permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 413 | Payload Too Large | File size exceeds limit |
| 500 | Server Error | Internal server error |

---

## 🧪 Testing with cURL

### Login Example
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Get Documents Example
```bash
curl -X GET http://localhost:3000/api/documents \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Upload Document Example
```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -H "Authorization: Bearer [token]" \
  -F "file=@document.pdf" \
  -F "title=My Document" \
  -F "description=Document description"
```

---

## 📝 Implementation Checklist

- [ ] Authentication endpoints implemented
- [ ] Dashboard stats endpoint
- [ ] Document CRUD operations
- [ ] File upload handling
- [ ] Report generation
- [ ] User management
- [ ] Audit logging
- [ ] QA review system
- [ ] JWT token validation
- [ ] CORS configured for frontend URL
- [ ] Error handling and proper status codes
- [ ] Rate limiting (optional but recommended)

---

## 🚀 Deployment Notes

1. Update `VUE_APP_API_URL` in `.env.local` for each environment
2. Ensure backend server is running before starting the frontend
3. Configure CORS to allow requests from frontend origin
4. Use HTTPS in production
5. Implement token refresh mechanism for better security

---

This specification provides everything needed to build a backend that integrates seamlessly with the Capstone Project frontend.
