import type { Accreditation, AccreditationFile, AccreditationStandard, AccreditationComment, AccreditationReview } from '@/types'

// Mock file data
export const mockFiles: AccreditationFile[] = [
  {
    id: 'file-1',
    fileName: 'Quality_Manual.pdf',
    fileSize: 2048576,
    fileType: 'application/pdf',
    uploadDate: '2024-06-15',
    uploadedBy: 'Admin User',
    fileUrl: '#',
    category: 'evidence',
    description: 'Main quality manual document'
  },
  {
    id: 'file-2',
    fileName: 'Internal_Audit_Report.xlsx',
    fileSize: 1024000,
    fileType: 'application/vnd.ms-excel',
    uploadDate: '2024-06-20',
    uploadedBy: 'Audit Team',
    fileUrl: '#',
    category: 'evidence',
    description: 'Q2 2024 audit findings'
  },
  {
    id: 'file-3',
    fileName: 'Process_Documentation.docx',
    fileSize: 512000,
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    uploadDate: '2024-06-10',
    uploadedBy: 'Process Owner',
    fileUrl: '#',
    category: 'support',
    description: 'Process flow documentation'
  }
]

// Mock standards data
export const mockStandards: AccreditationStandard[] = [
  {
    id: 'std-1',
    standardNumber: '4.1',
    standardName: 'Understanding the organization and its context',
    description: 'Determine external and internal issues relevant to purpose',
    complianceStatus: 'compliant',
    evidence: 'Documented in quality manual section 4.1',
    notes: 'Annual review completed'
  },
  {
    id: 'std-2',
    standardNumber: '4.2',
    standardName: 'Understanding the needs and expectations of interested parties',
    description: 'Identify interested parties and their needs',
    complianceStatus: 'compliant',
    evidence: 'Stakeholder analysis document on file',
    notes: 'Last updated Q1 2024'
  },
  {
    id: 'std-3',
    standardNumber: '5.1',
    standardName: 'Leadership commitment',
    description: 'Demonstrate leadership commitment to QMS',
    complianceStatus: 'partial',
    evidence: 'Management review minutes show commitment but need more evidence',
    notes: 'Action: Document additional evidence by Q3'
  },
  {
    id: 'std-4',
    standardNumber: '6.1',
    standardName: 'Actions to address risks and opportunities',
    description: 'Plan to address identified risks',
    complianceStatus: 'pending',
    evidence: 'Risk register in progress',
    notes: 'Target completion: July 2024'
  },
  {
    id: 'std-5',
    standardNumber: '7.1',
    standardName: 'Resources',
    description: 'Ensure adequate resources for QMS',
    complianceStatus: 'compliant',
    evidence: 'Budget allocation approved, resources assigned',
    notes: 'All resources allocated and operational'
  }
]

// Mock comments data
export const mockComments: AccreditationComment[] = [
  {
    id: 'comment-1',
    accreditationId: 'acc-1',
    author: 'Jane Smith',
    content: 'Please provide more detailed evidence for section 4.2. The current documentation is incomplete.',
    timestamp: '2024-06-28T14:30:00Z',
    type: 'clarification'
  },
  {
    id: 'comment-2',
    accreditationId: 'acc-1',
    author: 'John Doe',
    content: 'We have updated section 4.2 with additional stakeholder analysis. Please review the attached PDF.',
    timestamp: '2024-06-28T15:45:00Z',
    type: 'clarification',
  },
  {
    id: 'comment-3',
    accreditationId: 'acc-1',
    author: 'Bob Wilson',
    content: 'The risk management process looks solid. Looking forward to the review.',
    timestamp: '2024-06-29T16:45:00Z',
    type: 'comment'
  }
]

// Mock reviews data
export const mockReviews: AccreditationReview[] = [
  {
    id: 'review-1',
    accreditationId: 'acc-1',
    reviewerId: 'user-2',
    reviewerName: 'Jane Smith',
    reviewDate: '2024-06-25T09:00:00Z',
    rating: 4,
    status: 'approved',
    feedback: 'Well-documented system with good implementation. Minor adjustments needed in section 6.1.',
    recommendations: 'Consider adding more detail to risk management procedures'
  }
]

// Mock accreditations data
export const mockAccreditations: Accreditation[] = [
  {
    id: 'acc-1',
    name: 'ISO 9001:2015 Quality Management',
    code: 'ISO-9001-2024',
    description: 'Quality Management System - Scope: Design, development, manufacturing, and distribution of products.',
    status: 'approved',
    programId: 'prog-1',
    startDate: '2024-01-15',
    expiryDate: '2027-01-15',
    reviewerName: 'Jane Smith',
    reviewerEmail: 'jane.smith@organization.com',
    reviewDate: '2024-06-25',
    comments: 'Overall satisfactory implementation. Annual review required.',
    attachments: mockFiles.slice(0, 2),
    standards: mockStandards.slice(0, 3),
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-06-29T16:45:00Z',
    createdBy: 'Admin User'
  },
  {
    id: 'acc-2',
    name: 'ISO 27001:2022 Information Security',
    code: 'ISO-27001-2024',
    description: 'Information Security Management System - Comprehensive security controls and information protection.',
    status: 'under-review',
    programId: 'prog-1',
    startDate: '2024-02-01',
    expiryDate: '2027-02-01',
    reviewerName: 'Bob Wilson',
    reviewerEmail: 'bob.wilson@organization.com',
    reviewDate: undefined,
    comments: undefined,
    attachments: mockFiles.slice(1, 3),
    standards: mockStandards.slice(2, 4),
    createdAt: '2024-01-15T09:30:00Z',
    updatedAt: '2024-06-28T14:20:00Z',
    createdBy: 'Security Team'
  },
  {
    id: 'acc-3',
    name: 'ISO 14001:2015 Environmental Management',
    code: 'ISO-14001-2024',
    description: 'Environmental Management System - Compliance with environmental regulations and sustainability.',
    status: 'submitted',
    programId: 'prog-2',
    startDate: '2024-03-10',
    expiryDate: '2026-03-10',
    reviewerName: 'Alice Johnson',
    reviewerEmail: 'alice.johnson@organization.com',
    reviewDate: undefined,
    comments: undefined,
    attachments: mockFiles.slice(0, 1),
    standards: mockStandards.slice(0, 2),
    createdAt: '2024-02-20T11:00:00Z',
    updatedAt: '2024-06-27T13:15:00Z',
    createdBy: 'Environmental Officer'
  },
  {
    id: 'acc-4',
    name: 'IATF 16949:2016 Automotive Quality',
    code: 'IATF-16949-2024',
    description: 'Automotive industry quality management system - Supplier quality requirements.',
    status: 'draft',
    programId: 'prog-1',
    startDate: '2024-05-01',
    expiryDate: '2027-05-01',
    reviewerName: undefined,
    reviewerEmail: undefined,
    reviewDate: undefined,
    comments: undefined,
    attachments: [],
    standards: mockStandards.slice(1, 4),
    createdAt: '2024-05-15T10:30:00Z',
    updatedAt: '2024-06-15T15:45:00Z',
    createdBy: 'Quality Manager'
  },
  {
    id: 'acc-5',
    name: 'ISO 45001:2018 Occupational Health & Safety',
    code: 'ISO-45001-2024',
    description: 'Occupational Health and Safety Management System - Worker protection and hazard management.',
    status: 'approved',
    programId: 'prog-2',
    startDate: '2024-04-01',
    expiryDate: '2026-04-01',
    reviewerName: 'David Lee',
    reviewerEmail: 'david.lee@organization.com',
    reviewDate: '2024-06-20',
    comments: 'Excellent implementation with proactive hazard identification.',
    attachments: mockFiles,
    standards: mockStandards,
    createdAt: '2024-03-25T08:15:00Z',
    updatedAt: '2024-06-20T12:00:00Z',
    createdBy: 'Safety Officer'
  }
]

// Mock API service for development/testing
export const mockAccreditationAPI = {
  list: async (params?: any) => {
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
    
    let filtered = [...mockAccreditations]
    
    if (params?.status) {
      filtered = filtered.filter(acc => acc.status === params.status)
    }
    
    if (params?.search) {
      const query = params.search.toLowerCase()
      filtered = filtered.filter(acc =>
        acc.name.toLowerCase().includes(query) ||
        acc.code.toLowerCase().includes(query)
      )
    }
    
    return {
      status: 200,
      data: filtered,
      pagination: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / (params?.limit || 10))
      }
    }
  },

  get: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const accreditation = mockAccreditations.find(acc => acc.id === id)
    if (!accreditation) {
      throw { response: { status: 404, data: { error: 'Not found' } } }
    }
    return { status: 200, data: accreditation }
  },

  create: async (data: Partial<Accreditation>) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newAccreditation: Accreditation = {
      id: `acc-${Date.now()}`,
      name: data.name || 'New Accreditation',
      code: data.code || 'NEW-CODE',
      description: data.description || '',
      status: data.status || 'draft',
      programId: data.programId,
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      expiryDate: data.expiryDate || '',
      attachments: data.attachments || [],
      standards: data.standards || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Current User'
    }
    mockAccreditations.push(newAccreditation)
    return { status: 201, data: newAccreditation }
  },

  update: async (id: string, data: Partial<Accreditation>) => {
    await new Promise(resolve => setTimeout(resolve, 400))
    const index = mockAccreditations.findIndex(acc => acc.id === id)
    if (index === -1) {
      throw { response: { status: 404, data: { error: 'Not found' } } }
    }
    mockAccreditations[index] = {
      ...mockAccreditations[index],
      ...data,
      updatedAt: new Date().toISOString()
    }
    return { status: 200, data: mockAccreditations[index] }
  },

  delete: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const index = mockAccreditations.findIndex(acc => acc.id === id)
    if (index === -1) {
      throw { response: { status: 404, data: { error: 'Not found' } } }
    }
    mockAccreditations.splice(index, 1)
    return { status: 204, data: null }
  },

  uploadFiles: async (formData: FormData) => {
    await new Promise(resolve => setTimeout(resolve, 800))
    const files: AccreditationFile[] = []
    const fileList = formData.getAll('files') as File[]
    const categories = formData.getAll('categories') as string[]
    
    fileList.forEach((file, index) => {
      files.push({
        id: `file-${Date.now()}-${index}`,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadDate: new Date().toISOString().split('T')[0],
        uploadedBy: 'Current User',
        fileUrl: '#',
        category: (categories[index] || 'evidence') as any,
        description: ''
      })
    })
    
    return { status: 200, data: { files } }
  },

  downloadFile: async (fileId: string) => {
    void fileId
    await new Promise(resolve => setTimeout(resolve, 300))
    return { status: 200, data: new Blob() }
  },

  addComment: async (accreditationId: string, content: string, type: string) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const comment: AccreditationComment = {
      id: `comment-${Date.now()}`,
      accreditationId,
      author: 'Current User',
      content,
      timestamp: new Date().toISOString(),
      type: type as any
    }
    mockComments.push(comment)
    return { status: 201, data: comment }
  },

  getComments: async (accreditationId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return { status: 200, data: mockComments.filter(c => c.accreditationId === accreditationId) }
  },

  submitForReview: async (id: string, reviewerEmail: string) => {
    void reviewerEmail
    await new Promise(resolve => setTimeout(resolve, 400))
    const index = mockAccreditations.findIndex(acc => acc.id === id)
    if (index === -1) {
      throw { response: { status: 404, data: { error: 'Not found' } } }
    }
    mockAccreditations[index].status = 'submitted'
    return { status: 200, data: mockAccreditations[index] }
  },

  addReview: async (id: string, review: Partial<AccreditationReview>) => {
    await new Promise(resolve => setTimeout(resolve, 400))
    const newReview: AccreditationReview = {
      id: `review-${Date.now()}`,
      accreditationId: id,
      reviewerId: 'user-current',
      reviewerName: 'Current Reviewer',
      reviewDate: new Date().toISOString(),
      rating: review.rating || 5,
      status: review.status || 'approved',
      feedback: review.feedback || '',
      recommendations: review.recommendations
    }
    mockReviews.push(newReview)
    const index = mockAccreditations.findIndex(acc => acc.id === id)
    if (index !== -1) {
      mockAccreditations[index].status = 'approved'
    }
    return { status: 201, data: newReview }
  },

  getReviews: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return { status: 200, data: mockReviews.filter(r => r.accreditationId === id) }
  },

  export: async (fileId: string, format: string) => {
    void fileId
    void format
    await new Promise(resolve => setTimeout(resolve, 800))
    return { status: 200, data: new Blob() }
  },

  getStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const total = mockAccreditations.length
    const active = mockAccreditations.filter(a => a.status === 'approved').length
    const underReview = mockAccreditations.filter(a => a.status === 'under-review').length
    const expiringSoon = mockAccreditations.filter(a => {
      const expiry = new Date(a.expiryDate)
      const ninetyDaysFromNow = new Date()
      ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90)
      return expiry <= ninetyDaysFromNow && expiry > new Date()
    }).length

    return {
      status: 200,
      data: {
        total,
        byStatus: {
          draft: mockAccreditations.filter(a => a.status === 'draft').length,
          submitted: mockAccreditations.filter(a => a.status === 'submitted').length,
          'under-review': underReview,
          approved: active,
          rejected: mockAccreditations.filter(a => a.status === 'rejected').length,
          renewal: mockAccreditations.filter(a => a.status === 'renewal').length
        },
        expiringSoon,
        expiringIn30Days: mockAccreditations.filter(a => {
          const expiry = new Date(a.expiryDate)
          const thirtyDaysFromNow = new Date()
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
          return expiry <= thirtyDaysFromNow && expiry > new Date()
        }).length,
        byMonth: {}
      }
    }
  },

  search: async (query: string) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const q = query.toLowerCase()
    const results = mockAccreditations.filter(acc =>
      acc.name.toLowerCase().includes(q) ||
      acc.code.toLowerCase().includes(q) ||
      acc.description.toLowerCase().includes(q)
    )
    return { status: 200, data: results.slice(0, 20) }
  }
}
