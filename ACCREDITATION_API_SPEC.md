# Accreditation Management System - Backend API Specification

## 📋 Overview

This document specifies all backend API endpoints required for the Accreditation Management System. All endpoints require JWT authentication and use REST principles.

## 🔑 Authentication

All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## 📊 Data Models

### Accreditation

```json
{
  "id": "string (UUID)",
  "name": "string",
  "code": "string (unique)",
  "description": "string",
  "status": "draft|submitted|under-review|approved|rejected|renewal",
  "programId": "string (optional)",
  "startDate": "string (ISO 8601)",
  "expiryDate": "string (ISO 8601)",
  "reviewerName": "string (optional)",
  "reviewerEmail": "string (optional, email format)",
  "reviewDate": "string (ISO 8601, optional)",
  "comments": "string (optional)",
  "attachments": ["AccreditationFile[]"],
  "standards": ["AccreditationStandard[]"],
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)",
  "createdBy": "string"
}
```

### AccreditationFile

```json
{
  "id": "string (UUID)",
  "accreditationId": "string (UUID)",
  "fileName": "string",
  "fileSize": "number",
  "fileType": "string (MIME type)",
  "uploadDate": "string (ISO 8601)",
  "uploadedBy": "string",
  "fileUrl": "string (accessible URL or storage path)",
  "category": "evidence|support|clarification|response",
  "description": "string (optional)"
}
```

### AccreditationStandard

```json
{
  "id": "string (UUID)",
  "accreditationId": "string (UUID)",
  "standardNumber": "string",
  "standardName": "string",
  "description": "string",
  "complianceStatus": "compliant|partial|non-compliant|pending",
  "evidence": "string",
  "notes": "string (optional)"
}
```

### AccreditationComment

```json
{
  "id": "string (UUID)",
  "accreditationId": "string (UUID)",
  "authorId": "string (UUID)",
  "author": "string",
  "content": "string",
  "timestamp": "string (ISO 8601)",
  "type": "comment|review|clarification"
}
```

### AccreditationReview

```json
{
  "id": "string (UUID)",
  "accreditationId": "string (UUID)",
  "reviewerId": "string (UUID)",
  "reviewerName": "string",
  "reviewDate": "string (ISO 8601)",
  "rating": "number (1-5)",
  "status": "approved|revision-required|rejected",
  "feedback": "string",
  "recommendations": "string (optional)"
}
```

## 🔌 Endpoints

### 1. List Accreditations

```
GET /accreditations
```

**Query Parameters:**
```
?status=draft&search=ISO&page=1&limit=10
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status (draft, submitted, etc.) |
| `search` | string | Search by name or code |
| `page` | number | Page number (default: 1) |
| `limit` | number | Records per page (default: 10, max: 100) |

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "acc-123",
      "name": "ISO 9001:2015",
      "code": "ISO-9001-2024",
      "status": "approved",
      "expiryDate": "2027-01-01",
      "attachments": []
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid/missing token
- `403 Forbidden` - Insufficient permissions

---

### 2. Get Single Accreditation

```
GET /accreditations/:id
```

**Response (200 OK):**
```json
{
  "id": "acc-123",
  "name": "ISO 9001:2015 Quality Management",
  "code": "ISO-9001-2024",
  "description": "Quality Management System",
  "status": "approved",
  "startDate": "2024-01-01",
  "expiryDate": "2027-01-01",
  "reviewerName": "John Doe",
  "reviewerEmail": "john@example.com",
  "standards": [
    {
      "id": "std-1",
      "standardNumber": "4.1",
      "standardName": "Understanding the organization",
      "complianceStatus": "compliant",
      "evidence": "Documented in quality manual"
    }
  ],
  "attachments": [
    {
      "id": "file-1",
      "fileName": "evidence.pdf",
      "fileSize": 1024000,
      "category": "evidence",
      "uploadDate": "2024-01-15"
    }
  ]
}
```

**Error Responses:**
- `404 Not Found` - Accreditation not found
- `401 Unauthorized` - Not authenticated

---

### 3. Create Accreditation

```
POST /accreditations
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "ISO 9001:2015",
  "code": "ISO-9001-2024",
  "description": "Quality Management System",
  "status": "draft",
  "startDate": "2024-01-01",
  "expiryDate": "2027-01-01",
  "standards": [
    {
      "standardNumber": "4.1",
      "standardName": "Understanding the organization",
      "description": "Context and stakeholders",
      "complianceStatus": "pending",
      "evidence": "To be documented"
    }
  ]
}
```

**Validation Rules:**
- `name`: Required, max 255 characters
- `code`: Required, unique, max 50 characters
- `description`: Required, max 1000 characters
- `status`: Must be valid status
- `startDate`: ISO 8601 format, required
- `expiryDate`: ISO 8601 format, required, must be after startDate
- `standards`: Array of valid standards

**Response (201 Created):**
```json
{
  "id": "acc-new-123",
  "name": "ISO 9001:2015",
  "code": "ISO-9001-2024",
  "status": "draft",
  "createdAt": "2024-06-30T10:30:00Z",
  "createdBy": "user-123"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid data
- `409 Conflict` - Code already exists
- `401 Unauthorized` - Not authenticated

---

### 4. Update Accreditation

```
PUT /accreditations/:id
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "ISO 9001:2015 (Updated)",
  "status": "submitted",
  "reviewerName": "Jane Smith",
  "reviewerEmail": "jane@example.com"
}
```

**Allowed Fields:**
- `name`
- `description`
- `status`
- `reviewerName`
- `reviewerEmail`
- `comments`

**Response (200 OK):**
```json
{
  "id": "acc-123",
  "name": "ISO 9001:2015 (Updated)",
  "status": "submitted",
  "updatedAt": "2024-06-30T11:00:00Z"
}
```

**Error Responses:**
- `404 Not Found` - Accreditation not found
- `400 Bad Request` - Invalid data
- `403 Forbidden` - Not authorized to edit

---

### 5. Delete Accreditation

```
DELETE /accreditations/:id
```

**Response (204 No Content)**
```
(empty body)
```

**Error Responses:**
- `404 Not Found` - Accreditation not found
- `403 Forbidden` - Not authorized to delete

---

### 6. Upload Files

```
POST /accreditations/upload-files
Content-Type: multipart/form-data
```

**Form Data:**
```
files: File[] (up to 10 files)
categories: string[] (corresponding categories)
accreditationId: string (optional, for updating existing)
```

**File Constraints:**
- Max file size: 50MB per file
- Allowed types: pdf, doc, docx, xls, xlsx, ppt, pptx, zip, jpg, png, gif
- Max 10 files per request

**Response (200 OK):**
```json
{
  "files": [
    {
      "id": "file-123",
      "fileName": "evidence.pdf",
      "fileSize": 1024000,
      "fileType": "application/pdf",
      "category": "evidence",
      "fileUrl": "https://cdn.example.com/files/file-123.pdf",
      "uploadDate": "2024-06-30T10:30:00Z"
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request` - Invalid files
- `413 Payload Too Large` - File too large
- `415 Unsupported Media Type` - File type not allowed

---

### 7. Download File

```
GET /accreditations/files/:id/download
```

**Response (200 OK):**
```
(Binary file content)
```

**Headers:**
```
Content-Type: application/pdf (or appropriate type)
Content-Disposition: attachment; filename="document.pdf"
```

**Error Responses:**
- `404 Not Found` - File not found
- `403 Forbidden` - Not authorized to download

---

### 8. Add Comment

```
POST /accreditations/:id/comments
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "This accreditation looks good. Minor revision needed.",
  "type": "comment"
}
```

**Validation:**
- `content`: Required, max 2000 characters
- `type`: Must be "comment", "review", or "clarification"

**Response (201 Created):**
```json
{
  "id": "comment-123",
  "accreditationId": "acc-123",
  "author": "John Doe",
  "content": "This accreditation looks good...",
  "type": "comment",
  "timestamp": "2024-06-30T10:30:00Z"
}
```

---

### 9. Get Comments

```
GET /accreditations/:id/comments
```

**Query Parameters:**
```
?type=review&page=1&limit=20
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "comment-123",
      "author": "John Doe",
      "content": "This accreditation looks good...",
      "type": "comment",
      "timestamp": "2024-06-30T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5
  }
}
```

---

### 10. Submit for Review

```
POST /accreditations/:id/submit
Content-Type: application/json
```

**Request Body:**
```json
{
  "reviewerEmail": "reviewer@example.com"
}
```

**Validation:**
- `reviewerEmail`: Valid email format required
- Accreditation must not be in "approved" or "rejected" status

**Response (200 OK):**
```json
{
  "id": "acc-123",
  "status": "submitted",
  "updatedAt": "2024-06-30T10:30:00Z"
}
```

**Side Effects:**
- Send email to reviewer
- Update accreditation status to "submitted"
- Log action in audit trail

**Error Responses:**
- `400 Bad Request` - Invalid email
- `409 Conflict` - Invalid current status

---

### 11. Add Review

```
POST /accreditations/:id/reviews
Content-Type: application/json
```

**Request Body:**
```json
{
  "rating": 4,
  "status": "approved",
  "feedback": "Well documented and compliant with all standards.",
  "recommendations": "Consider updating documentation by Q4 2024"
}
```

**Validation:**
- `rating`: 1-5 (integer)
- `status`: "approved", "revision-required", or "rejected"
- `feedback`: Required, max 2000 characters
- `recommendations`: Optional, max 1000 characters

**Response (201 Created):**
```json
{
  "id": "review-123",
  "accreditationId": "acc-123",
  "reviewerName": "Jane Smith",
  "rating": 4,
  "status": "approved",
  "feedback": "Well documented...",
  "reviewDate": "2024-06-30T10:30:00Z"
}
```

**Side Effects:**
- Update accreditation status to "under-review" or corresponding status
- Notify creator of review
- Log in audit trail

---

### 12. Get Reviews

```
GET /accreditations/:id/reviews
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "review-123",
      "reviewerName": "Jane Smith",
      "rating": 4,
      "status": "approved",
      "feedback": "Well documented...",
      "reviewDate": "2024-06-30T10:30:00Z"
    }
  ]
}
```

---

### 13. Export Accreditation

```
GET /accreditations/:id/export/:format
```

**Supported Formats:**
- `pdf` - PDF document
- `xlsx` - Excel spreadsheet
- `docx` - Word document

**Response (200 OK):**
```
(Binary file content with appropriate Content-Type and Content-Disposition)
```

**Supported Exports:**
- PDF: Professional report format with all details
- Excel: Structured data with standards and compliance
- Word: Detailed document with formatting

---

### 14. Get Statistics

```
GET /accreditations/statistics
```

**Response (200 OK):**
```json
{
  "total": 25,
  "byStatus": {
    "draft": 3,
    "submitted": 2,
    "under-review": 1,
    "approved": 18,
    "rejected": 1,
    "renewal": 0
  },
  "expiringSoon": 4,
  "expiringIn30Days": 2,
  "byMonth": {
    "2024-07": 5,
    "2024-08": 3
  }
}
```

---

### 15. Search Accreditations

```
GET /accreditations/search
```

**Query Parameters:**
```
?q=ISO+9001&status=approved&limit=20
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Search query (name, code, description) |
| `status` | string | Optional status filter |
| `limit` | number | Max results (default: 20, max: 100) |

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "acc-123",
      "name": "ISO 9001:2015",
      "code": "ISO-9001-2024",
      "status": "approved",
      "highlight": "Found in <b>name</b>"
    }
  ],
  "total": 5
}
```

---

## 📝 Common Response Formats

### Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  }
}
```

### Pagination Response

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasMore": true
  }
}
```

## 🔐 HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| `200` | OK | Successful GET, PUT |
| `201` | Created | Successful POST |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Validation error |
| `401` | Unauthorized | Missing/invalid token |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource not found |
| `409` | Conflict | Unique constraint violation |
| `413` | Payload Too Large | File size exceeded |
| `415` | Unsupported Media Type | Invalid file type |
| `500` | Internal Server Error | Server error |

## 🔄 Workflow Status Transitions

```
draft
  ↓
submitted
  ↓
under-review
  ├→ approved (stays approved)
  ├→ rejected (can retry, goes back to submitted)
  └→ revision-required (goes back to draft)

approved
  ↓
renewal (when approaching expiry)
  ↓
approved (after renewal review)
```

## 📧 Email Notifications

**Events triggering emails:**
- Accreditation submitted for review → Send to reviewer
- Review completed → Send to creator
- Accreditation expiring in 30 days → Send to creator
- Accreditation rejected → Send to creator with feedback

## 🔍 Audit Trail

Log all changes with:
- User ID
- Action type
- Timestamp
- Old values (for updates)
- New values (for updates)
- IP address (optional)

## 🧪 Example cURL Commands

**Create Accreditation:**
```bash
curl -X POST http://localhost:3000/api/accreditations \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ISO 9001",
    "code": "ISO-9001-2024",
    "description": "Quality Management",
    "status": "draft",
    "startDate": "2024-01-01",
    "expiryDate": "2027-01-01"
  }'
```

**Upload Files:**
```bash
curl -X POST http://localhost:3000/api/accreditations/upload-files \
  -H "Authorization: Bearer your-token" \
  -F "files=@evidence.pdf" \
  -F "categories=evidence"
```

**Get Accreditations:**
```bash
curl -X GET "http://localhost:3000/api/accreditations?status=approved&limit=10" \
  -H "Authorization: Bearer your-token"
```

---

**Version**: 1.0.0  
**Last Updated**: 2024-06-30  
**Status**: Ready for Implementation
