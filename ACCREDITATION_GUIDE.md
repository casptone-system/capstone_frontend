# Accreditation Management System - Complete Documentation

## 🎓 Overview

The Accreditation Management System is a professional, feature-rich module integrated into the Capstone Project. It enables institutions to manage accreditation processes, track compliance standards, and maintain detailed audit trails with comprehensive file attachment capabilities.

## 📋 Features

### ✅ Core Features
- **Accreditation Management**: Create, view, edit, and delete accreditation records
- **Multi-Status Workflow**: Draft → Submitted → Under Review → Approved/Rejected → Renewal
- **Compliance Standards Tracking**: Map accreditation standards with compliance status and evidence
- **Professional File Management**: Upload, categorize, and manage accreditation documents
- **Reviewer Assignment**: Assign reviewers and collect their feedback
- **Comments & Collaboration**: Add comments, track changes, and collaborate with team members
- **Advanced Search & Filtering**: Search by name, code, or status with real-time filtering
- **Statistics Dashboard**: View key metrics (total, active, under review, expiring)
- **Expiry Alerts**: Automatically track accreditations expiring within 90 days
- **Export Capabilities**: Export accreditation records (PDF, Excel, Word)

## 🏗️ Architecture

### File Structure

```
src/
├── views/
│   ├── AccreditationList.vue      # Main list view with filtering
│   ├── AccreditationDetail.vue    # Detail view with file browser
│   └── AccreditationForm.vue      # Create/edit form with file upload
├── components/
│   └── FileAttachmentUpload.vue   # Reusable file upload component
├── services/
│   └── api.ts (enhanced)          # Accreditation API methods
├── types/
│   └── index.ts (enhanced)        # Accreditation data models
└── router/
    └── index.js (enhanced)        # Accreditation routes
```

### Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/accreditation` | AccreditationList | Browse all accreditations |
| `/accreditation/new` | AccreditationForm | Create new accreditation |
| `/accreditation/:id` | AccreditationDetail | View accreditation details |
| `/accreditation/:id/edit` | AccreditationForm | Edit existing accreditation |

## 📊 Data Models

### Accreditation

```typescript
interface Accreditation {
  id: string
  name: string                          // e.g., "ISO 9001:2015"
  code: string                          // e.g., "ISO-9001-2024"
  description: string                   // Detailed description
  status: 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected' | 'renewal'
  programId?: string                    // Optional program reference
  startDate: string                     // YYYY-MM-DD
  expiryDate: string                    // YYYY-MM-DD
  reviewerName?: string                 // Assigned reviewer
  reviewerEmail?: string                // Reviewer contact
  reviewDate?: string                   // Date of review
  comments?: string                     // Review comments
  attachments: AccreditationFile[]      // Supporting documents
  standards: AccreditationStandard[]    // Compliance standards
  createdAt: string                     // Creation timestamp
  updatedAt: string                     // Last update timestamp
  createdBy: string                     // Creator name
}
```

### AccreditationFile

```typescript
interface AccreditationFile {
  id: string
  fileName: string
  fileSize: number                      // In bytes
  fileType: string                      // e.g., "application/pdf"
  uploadDate: string
  uploadedBy: string
  fileUrl: string                       // Download URL
  category: 'evidence' | 'support' | 'clarification' | 'response'
  description?: string
}
```

### AccreditationStandard

```typescript
interface AccreditationStandard {
  id: string
  standardNumber: string                // e.g., "4.1"
  standardName: string                  // Standard description
  description: string
  complianceStatus: 'compliant' | 'partial' | 'non-compliant' | 'pending'
  evidence: string                      // How standard is met
  notes?: string                        // Additional notes
}
```

## 🎨 UI Components

### AccreditationList.vue

**Features:**
- Statistics cards (Total, Active, Under Review, Expiring)
- Search functionality
- Status filtering dropdown
- Accreditation cards with quick actions
- Loading states and error handling
- Empty state with call-to-action

**Key Props/Data:**
- `accreditations[]` - List of accreditation records
- `searchQuery` - Search filter
- `statusFilter` - Status filter value
- `stats` - Statistics object

### AccreditationDetail.vue

**Features:**
- Complete accreditation information display
- Colored status badges
- Standards compliance grid
- File browser with download capability
- Review information section
- Edit and delete buttons
- Responsive layout

**Sections:**
1. Header with name, code, and status
2. Key dates and creator info
3. Review information (if available)
4. Compliance standards display
5. Attached files with download links
6. Action buttons

### AccreditationForm.vue

**Features:**
- Multi-section form layout
- Drag-and-drop file upload
- File categorization interface
- Dynamic standards addition/removal
- Review assignment fields
- Form validation
- Success/error messages

**Sections:**
1. Basic Information
   - Name, Code, Description
   - Start/Expiry Dates
   - Status

2. File Attachments
   - Drag-drop upload area
   - File categorization
   - File list display
   - Progress indicator

3. Compliance Standards
   - Dynamic standard fields
   - Compliance status selection
   - Evidence documentation
   - Add/remove standards

4. Reviewer Information
   - Reviewer name/email
   - Comments field

### FileAttachmentUpload.vue (Reusable)

**Props:**
```typescript
interface Props {
  uploadedFiles?: AccreditationFile[]
  maxSize?: number               // Default: 50MB
  acceptedFormats?: string       // Default: common office/doc formats
}
```

**Events:**
- `filesSelected` - User selected files
- `fileRemoved` - User removed a file
- `uploadedFileRemoved` - User removed an uploaded file

**Features:**
- Drag-and-drop file upload
- File size validation
- File type validation
- Progress indicator
- Error handling
- Responsive design

## 🔌 API Integration

### Backend Endpoints Required

```
GET    /accreditations                           # List all
GET    /accreditations/:id                       # Get single
POST   /accreditations                           # Create
PUT    /accreditations/:id                       # Update
DELETE /accreditations/:id                       # Delete

POST   /accreditations/upload-files              # Upload files
GET    /accreditations/files/:id/download        # Download file

POST   /accreditations/:id/comments              # Add comment
GET    /accreditations/:id/comments              # Get comments

POST   /accreditations/:id/submit                # Submit for review
POST   /accreditations/:id/reviews               # Add review
GET    /accreditations/:id/reviews               # Get reviews

GET    /accreditations/:id/export/:format        # Export (pdf/xlsx/docx)
GET    /accreditations/statistics                # Get stats
GET    /accreditations/search                    # Search accreditations
```

### Example Request/Response

**Create Accreditation**
```bash
POST /accreditations
Content-Type: application/json

{
  "name": "ISO 9001:2015 Quality Management",
  "code": "ISO-9001-2024",
  "description": "Quality Management System Certification",
  "status": "draft",
  "startDate": "2024-01-01",
  "expiryDate": "2027-01-01",
  "standards": [
    {
      "standardNumber": "4.1",
      "standardName": "Understanding the organization and its context",
      "complianceStatus": "compliant",
      "evidence": "Documented in our quality manual"
    }
  ]
}
```

## 🚀 Usage Guide

### 1. Create New Accreditation

1. Click "New Accreditation" button
2. Fill in basic information:
   - Name (required)
   - Code (required, e.g., "ISO-9001-2024")
   - Description (required)
   - Status (select from dropdown)
   - Start and Expiry dates

3. Upload supporting documents:
   - Drag files or click "Browse Files"
   - Select file category (Evidence, Support, Clarification, Response)
   - Files are validated for size and type

4. Add compliance standards:
   - Click "Add Standard"
   - Enter standard number and name
   - Describe compliance status and evidence
   - Add multiple standards as needed

5. Optional: Add reviewer information
   - Reviewer name and email
   - Comments

6. Click "Save Accreditation"

### 2. View Accreditation Details

1. Navigate to Accreditation list
2. Click on any accreditation card
3. View all information including:
   - Accreditation details
   - Reviewer information
   - Compliance standards
   - Attached files

4. Download files using download button

### 3. Edit Accreditation

1. Go to detail view
2. Click "Edit" button
3. Modify fields as needed
4. Add/remove standards or files
5. Save changes

### 4. Filter & Search

**Search:**
- Type in search box to filter by name or code
- Results update in real-time

**Filter by Status:**
- Select status from dropdown
- Options: All, Draft, Submitted, Under Review, Approved, Rejected, Renewal

## 📈 Statistics

The dashboard shows real-time metrics:

| Metric | Description |
|--------|-------------|
| **Total Accreditations** | All accreditations in system |
| **Active** | Accreditations with "approved" status |
| **Under Review** | Accreditations in review process |
| **Expiring Soon** | Accreditations expiring within 90 days |

## 🔐 Security & Permissions

- **Authentication Required**: All accreditation routes require authentication
- **Role-Based**: Admin users can manage all accreditations
- **Token-Based**: JWT tokens sent with all requests
- **CORS Enabled**: Backend must allow cross-origin requests

## 📱 Responsive Design

- **Mobile** (< 640px): Single column layout, stacked controls
- **Tablet** (640-1024px): Two-column layout
- **Desktop** (> 1024px): Multi-column, optimized spacing

## 🎯 Best Practices

### File Management
- Keep files organized by category
- Use descriptive file names
- Compress large files before upload
- Remove outdated documents

### Compliance Tracking
- Update standards status regularly
- Document evidence thoroughly
- Add notes for complex standards
- Keep reviewer feedback accessible

### Workflow
- Start with "Draft" status
- Assign reviewers before submission
- Respond to review feedback promptly
- Schedule renewal reminders before expiry

## 🔧 Configuration

### Environment Variables
```
VUE_APP_API_URL=http://localhost:3000/api
VUE_APP_MAX_FILE_SIZE=50
VUE_APP_ACCREDITATION_EXPIRY_WARNING=90
```

### Customization

**File Upload Constraints** (in FileAttachmentUpload.vue):
```typescript
maxSize: 50,                    // MB
acceptedFormats: '.pdf,.doc,.docx,...'
```

**Status Colors** (in components):
```typescript
const colors = {
  draft: 'medium',
  submitted: 'primary',
  'under-review': 'warning',
  approved: 'success',
  rejected: 'danger',
  renewal: 'secondary',
}
```

## 📚 Development Notes

### Adding New Status
1. Update `Accreditation` interface in `types/index.ts`
2. Add status option in form dropdowns
3. Add status color mapping in components
4. Update backend validation

### Adding New File Categories
1. Update `AccreditationFile` interface
2. Add option in file categorization dropdown
3. Update API validation

### Customizing Export Formats
1. Update `/accreditations/:id/export/:format` endpoint
2. Add format button in detail view
3. Handle different MIME types

## 🐛 Troubleshooting

### Files Not Uploading
- Check file size (max 50MB by default)
- Verify file type is supported
- Check browser console for errors
- Ensure backend is running

### Dates Showing Incorrectly
- Verify date format is YYYY-MM-DD
- Check browser timezone settings
- Use consistent date parsing

### Accreditations Not Loading
- Clear browser cache
- Check API URL in .env.local
- Verify authentication token
- Check browser console for errors

## 📊 Performance Tips

- Limit files per accreditation to < 10
- Archive old accreditations regularly
- Use pagination for large lists
- Compress PDF files before upload
- Consider CDN for file downloads

## 🚀 Future Enhancements

- Email notifications for expiring accreditations
- Accreditation renewal templates
- Automated compliance checking
- Integration with external auditors
- Bulk import/export
- Version history tracking
- Advanced reporting & analytics
- Mobile app with offline support

---

**Version**: 1.0.0  
**Last Updated**: 2024-06-30  
**Status**: Production Ready
