# ADAMS - Accreditation & Compliance Management System
## Modern Professional UI/UX Design Guide

---

## System Overview

ADAMS is a comprehensive accreditation and compliance management system designed for academic institutions. The system provides role-based dashboards and workflows for Deans, Program Chairs, and Faculty members to collaborate on accreditation, assessment, and compliance documentation.

**Current Version**: 1.0.0  
**Technology Stack**: Vue 3 + Vite, TypeScript, Pinia, Vue Router, Chart.js, Ionic Vue, Ionicons

---

## Design System

### Color Palette

**Primary Colors**
- `--color-primary: #3b82f6` - Main brand blue
- `--color-accent: #10b981` - Success green
- `--color-warning: #f59e0b` - Alert orange
- `--color-danger: #ef4444` - Error red

**Neutral Palette**
- `--color-white: #ffffff`
- `--color-gray-50` through `--color-gray-900` - 10-step gray scale
- `--color-background: #f8fafc` - Page background
- `--color-surface: #ffffff` - Card/container background
- `--color-border: #e5e7eb` - Border color

### Typography

**Font Family**: System fonts (Roboto / Inter alternative)
```css
-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif
```

**Font Weights**
- Regular (400) - Body text
- Medium (500) - Subheadings
- Semibold (600) - Headings
- Bold (700) - Primary headings

**Type Scale**
- `--text-xs: 0.75rem` (12px)
- `--text-sm: 0.875rem` (14px)
- `--text-base: 1rem` (16px)
- `--text-lg: 1.125rem` (18px)
- `--text-xl: 1.25rem` (20px)
- `--text-2xl: 1.5rem` (24px)
- `--text-3xl: 1.875rem` (30px)
- `--text-4xl: 2.25rem` (36px)

### Spacing System

**Base Unit**: 1rem (16px)

- `--spacing-xs: 0.25rem` (4px)
- `--spacing-sm: 0.5rem` (8px)
- `--spacing-md: 1rem` (16px)
- `--spacing-lg: 1.5rem` (24px)
- `--spacing-xl: 2rem` (32px)
- `--spacing-2xl: 3rem` (48px)
- `--spacing-3xl: 4rem` (64px)

### Border Radius

- `--radius-sm: 0.25rem` (4px)
- `--radius-md: 0.375rem` (6px)
- `--radius-lg: 0.5rem` (8px)
- `--radius-xl: 0.75rem` (12px)
- `--radius-2xl: 1rem` (16px)
- `--radius-3xl: 1.5rem` (24px)
- `--radius-full: 9999px` (Fully rounded)

### Shadows

- `--shadow-sm`: Subtle elevation (cards)
- `--shadow-md`: Standard elevation (hover states)
- `--shadow-lg`: Elevated elevation (modals)
- `--shadow-xl`: High elevation (dropdowns)
- `--shadow-2xl`: Maximum elevation (full modals)

### Transitions

- `--transition-fast: 150ms` - Micro-interactions
- `--transition-base: 200ms` - Standard animations
- `--transition-slow: 300ms` - Long-form animations

---

## Component Library

### Core Components

#### 1. **AppCard**
Container component for content grouping with three variants.

**Variants:**
- `default` - Basic card with subtle border
- `elevated` - Card with shadow elevation
- `outlined` - Bordered card

**Props:**
```typescript
interface Props {
  variant?: 'default' | 'elevated' | 'outlined'
  clickable?: boolean
}
```

**Slots:**
- `header` - Card header section
- `default` - Main content
- `footer` - Footer section

**Usage:**
```vue
<app-card variant="elevated">
  <template #header>
    <h3>Title</h3>
  </template>
  Content here
  <template #footer>
    Actions here
  </template>
</app-card>
```

#### 2. **AppButton**
Flexible button component with multiple variants and sizes.

**Variants:**
- `primary` - Blue background (default action)
- `secondary` - Gray background
- `danger` - Red background (destructive)
- `success` - Green background
- `outline` - Bordered with no fill

**Sizes:**
- `sm` - Small (12px text)
- `md` - Medium (14px text, default)
- `lg` - Large (16px text)

**Props:**
```typescript
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  block?: boolean         // Full width
  disabled?: boolean
  loading?: boolean       // Shows spinner
  icon?: string          // Ionicon name
}
```

**Usage:**
```vue
<app-button variant="primary" size="lg" block icon="download-outline">
  Export Report
</app-button>
```

#### 3. **StatCard**
Displays key metrics with optional trending and badge indicators.

**Props:**
```typescript
interface Props {
  title: string
  value: string | number
  subtitle?: string
  isLoading?: boolean
  badge?: {
    label: string
    variant: 'primary' | 'success' | 'warning' | 'danger'
  }
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
}
```

**Usage:**
```vue
<stat-card
  title="Total Programs"
  value="28"
  subtitle="Active programs"
  :trend="{ value: 12, direction: 'up' }"
  :badge="{ label: '+2 this year', variant: 'success' }"
/>
```

#### 4. **FormInput**
Text input with label, validation, icon support, and error handling.

**Props:**
```typescript
interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  type?: string                    // 'email', 'password', etc.
  error?: string                   // Validation message
  hint?: string                    // Helper text
  required?: boolean
  disabled?: boolean
  icon?: string                    // Ionicon name
}
```

**Usage:**
```vue
<form-input
  v-model="email"
  label="Email Address"
  type="email"
  placeholder="user@institution.edu"
  icon="mail-outline"
  :error="validationError"
  required
/>
```

#### 5. **AppModal**
Modal dialog with header, body, and footer sections.

**Props:**
```typescript
interface Props {
  modelValue: boolean              // v-model for open/close
  title: string                    // Modal title
  size?: 'sm' | 'md' | 'lg'
}
```

**Slots:**
- `default` - Modal body content
- `footer` - Footer actions

**Usage:**
```vue
<app-modal v-model="isOpen" title="Confirm Action">
  <p>Are you sure you want to proceed?</p>
  <template #footer>
    <app-button variant="secondary" @click="isOpen = false">Cancel</app-button>
    <app-button variant="danger">Confirm</app-button>
  </template>
</app-modal>
```

---

## Page Templates

### 1. **Login Page** (`/login`)
Authentication entry point with role-based demo account selection.

**Features:**
- Email and password inputs
- Remember me checkbox
- Forgot password link
- Demo account quick-fill buttons
- Gradient background design
- Form validation

### 2. **Dashboard** (`/dashboard`)
Role-aware overview dashboard showing key metrics and recent activity.

**Role-Specific Content:**
- **Dean**: Institutional metrics, program oversight, pending approvals
- **Program Chair**: Program-specific compliance, faculty submissions
- **Faculty**: Personal submissions, assigned areas, revision status

**Components:**
- Overview statistics grid
- Compliance distribution chart (Chart.js)
- Recent activity timeline
- Quick action buttons

### 3. **Documents** (`/documents`)
Document management and upload interface.

**Features:**
- Document list with filtering
- Search functionality
- Status badges (pending, approved, rejected, revision)
- Upload button
- Document metadata display
- Version tracking

### 4. **Reports** (`/reports`)
Analytics and report generation interface.

**Features:**
- Compliance reports
- Submission trends
- Area performance analysis
- Data export (PDF, Excel, CSV)

---

## Layout Architecture

### AppLayout
Main layout wrapper for authenticated users.

**Components:**
```
┌─────────────────────────────────────┐
│         App Header                   │
│  (Logo, Nav, Notifications, Profile) │
├──────────────┬──────────────────────┤
│              │                       │
│  Sidebar Nav │  Main Content Area    │
│              │                       │
│              │    (router-view)      │
│              │                       │
└──────────────┴──────────────────────┘
```

**Header Features:**
- ADAMS logo
- Horizontal navigation (desktop)
- Notification bell with badge
- User profile dropdown
- Quick logout

**Sidebar Features:**
- Navigation links per role
- Active route highlighting
- Icons from Ionicons
- Grouped sections (Main, Management)
- Sticky positioning

**Main Content:**
- Responsive padding
- Page header with title
- Scrollable content area

---

## State Management (Pinia)

### Store Structure

```
stores/
├── authStore.ts        # User authentication and session
├── dashboardStore.ts   # Dashboard metrics and data
└── documentStore.ts    # Document management
```

### Auth Store

```typescript
interface User {
  id: string
  name: string
  email: string
  role: 'dean' | 'program-chair' | 'faculty'
  institution: string
  avatar?: string
}

// Actions
login(email: string, password: string)
logout()
restoreSession()
```

### Dashboard Store

```typescript
interface DashboardStats {
  totalPrograms: number
  totalAreas: number
  complianceScore: number
  pendingSubmissions: number
  assignmentCompletion: number
  performanceTrend: number
  securityStatus: 'protected' | 'at-risk' | 'warning'
  collaborationActivity: number
}

// Actions
fetchDashboardStats()
updateStats(newStats: Partial<DashboardStats>)
```

### Document Store

```typescript
interface Document {
  id: string
  title: string
  area: string
  program: string
  uploadedBy: string
  uploadedAt: string
  fileSize: string
  version: number
  status: 'pending' | 'approved' | 'rejected' | 'revision'
}

// Actions
applyFilters(filters: DocumentFilter)
searchDocuments(query: string)
uploadDocument(file: File, metadata: any)
```

---

## Responsive Design

### Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Layout Adjustments

**Mobile:**
- Single-column layout
- Sidebar hidden (mobile menu)
- Expanded touch targets (48px minimum)
- Stacked navigation
- Full-width cards

**Tablet:**
- Two-column grid
- Visible sidebar
- Optimized spacing
- Adjusted typography

**Desktop:**
- Full multi-column layouts
- Sticky sidebar navigation
- Maximum content width
- Hover states and interactions

---

## Accessibility (WCAG 2.1 AA)

### Color Contrast
- All text meets 4.5:1 contrast ratio (normal text)
- Buttons and interactive elements meet 3:1 contrast ratio

### Semantic HTML
- Proper heading hierarchy (h1, h2, h3...)
- Semantic form labels
- ARIA labels for icons
- Role attributes for custom components

### Keyboard Navigation
- All interactive elements focusable
- Logical tab order
- Visible focus indicators
- Escape key closes modals

### Screen Reader Support
- Image alt text
- Form input labels
- Button labels for icon-only buttons
- Live regions for dynamic content

---

## Icon System (Ionicons)

All icons use Ionicons v7 convention: `{name}-outline`

**Common Icons:**
- Navigation: `grid-outline`, `document-text-outline`, `bar-chart-outline`
- Actions: `download-outline`, `upload-outline`, `trash-outline`
- Status: `checkmark-circle-outline`, `alert-circle-outline`
- User: `person-outline`, `people-outline`, `log-out-outline`
- Settings: `settings-outline`, `lock-closed-outline`

---

## Future Enhancements

1. **Dark Mode** - Complete dark theme with CSS variable overrides
2. **Advanced Charts** - More Chart.js visualization types
3. **Real-time Collaboration** - WebSocket integration for live updates
4. **Mobile App** - Capacitor deployment for iOS/Android
5. **Advanced Analytics** - Custom report builder
6. **Integration APIs** - SIS sync, external data sources
7. **Notification System** - Email and in-app notifications
8. **Audit Trail** - Complete activity logging

---

## Development Guidelines

### Component Creation Checklist

- [ ] TypeScript interfaces for props/emits
- [ ] Semantic HTML structure
- [ ] WCAG 2.1 AA compliance
- [ ] Responsive design (mobile-first)
- [ ] Hover/focus states
- [ ] Loading states (if async)
- [ ] Error handling
- [ ] Documentation comments
- [ ] Storybook stories (future)

### Code Style

- Use Composition API over Options API
- TypeScript for all new code
- Consistent naming conventions
- DRY principle for component logic
- Reusable utility functions
- Descriptive variable names

---

## Getting Started

### Installation

```bash
npm install
```

### Development Server

```bash
npm run serve
```

### Build for Production

```bash
npm run build
```

### Type Check

```bash
npm run type-check
```

---

## File Structure

```
src/
├── assets/
│   └── styles.css              # Global design system
├── components/
│   ├── AppLayout.vue           # Main layout wrapper
│   ├── AppCard.vue             # Card component
│   ├── AppButton.vue           # Button component
│   ├── AppModal.vue            # Modal component
│   ├── FormInput.vue           # Input component
│   └── StatCard.vue            # Statistic card
├── stores/
│   ├── authStore.ts            # Auth state
│   ├── dashboardStore.ts       # Dashboard state
│   └── documentStore.ts        # Document state
├── types/
│   └── index.ts                # TypeScript interfaces
├── views/
│   ├── Dashboard.vue           # Dashboard page
│   ├── Documents.vue           # Documents page
│   ├── Reports.vue             # Reports page
│   ├── login/
│   │   └── LoginPage.vue       # Login page
│   └── Dean/                   # Legacy Dean dashboard
├── router/
│   └── index.js                # Route configuration
├── App.vue                     # Root component
└── main.js                     # App entry point
```

---

**Last Updated**: June 4, 2026  
**Status**: Production Ready v1.0.0
