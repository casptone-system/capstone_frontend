# ADAMS - Accreditation & Compliance Management System
## Modern Professional UI/UX Design Guide
### Minimalist White-and-Blue Aesthetic

---

## System Overview

ADAMS is a comprehensive accreditation and compliance management system designed for academic institutions. The system provides role-based dashboards and workflows for Deans, Program Chairs, and Faculty members to collaborate on accreditation, assessment, and compliance documentation.

**Current Version**: 1.1.0  
**Technology Stack**: Vue 3 + Vue CLI, TypeScript, Pinia, Vue Router, Chart.js, Ionic Vue, Ionicons  
**Design Theme**: Minimalist, sleek, modern white-and-blue aesthetic

---

## Design System

### Color Palette

**Primary Colors - Deep Professional Navy & Royal Blue**
- `--color-primary: #1e40af` - Deep navy blue (primary buttons, headers, active states)
- `--color-primary-light: #3b82f6` - Royal blue (gradients, accents)
- `--color-primary-dark: #1e3a8a` - Indigo navy (hover states)
- `--color-primary-hover: #1d4ed8` - Blue-700 (interactive hover)
- `--color-primary-fg: #ffffff` - White text/icon on primary backgrounds

**Accent Colors**
- `--color-accent: #10b981` - Success green
- `--color-accent-light: #34d399`
- `--color-accent-dark: #059669`

**Status Colors**
- `--color-warning: #f59e0b` - Alert orange
- `--color-danger: #ef4444` - Error red
- `--color-success: #22c55e` - Success green

**Neutral Colors - Soft Slate Gray Scale**
- `--color-white: #ffffff`
- `--color-gray-50` through `--color-gray-900` - 10-step gray scale
- `--color-background: #f8fafc` - Crisp off-white page background
- `--color-surface: #ffffff` - White card/container background
- `--color-surface-alt: #f1f5f9` - Subtle surface variant
- `--color-border: #e2e8f0` - Soft slate gray border
- `--color-text: #0f172a` - Dark slate text (high contrast)
- `--color-text-secondary: #64748b` - Medium slate gray
- `--color-text-muted: #94a3b8` - Light slate gray

### Typography

**Font Family**: Inter (Google Fonts) with system font fallback
```css
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
```

**Font Weights**
- Light (300) - Subtle text
- Regular (400) - Body text
- Medium (500) - Subheadings
- Semibold (600) - Headings
- Bold (700) - Primary headings
- Extrabold (800) - Display headings

**Type Scale**
- `--text-xs: 0.75rem` (12px)
- `--text-sm: 0.875rem` (14px)
- `--text-base: 1rem` (16px)
- `--text-lg: 1.125rem` (18px)
- `--text-xl: 1.25rem` (20px)
- `--text-2xl: 1.5rem` (24px)
- `--text-3xl: 1.875rem` (30px)
- `--text-4xl: 2.25rem` (36px)

**Line Heights**
- `--line-height-tight: 1.25` - Headings
- `--line-height-normal: 1.5` - Body text
- `--line-height-relaxed: 1.625` - Paragraphs

### Spacing System

**Base Unit**: 1rem (16px)

- `--spacing-3xs: 0.125rem` (2px)
- `--spacing-2xs: 0.25rem` (4px)
- `--spacing-xs: 0.5rem` (8px)
- `--spacing-sm: 0.75rem` (12px)
- `--spacing-md: 1rem` (16px)
- `--spacing-lg: 1.5rem` (24px)
- `--spacing-xl: 2rem` (32px)
- `--spacing-2xl: 3rem` (48px)
- `--spacing-3xl: 4rem` (64px)

### Border Radius

Consistent 8px to 12px range for modern, clean appearance:
- `--radius-sm: 0.25rem` (4px)
- `--radius-md: 0.375rem` (6px)
- `--radius-lg: 0.5rem` (8px) - Buttons, inputs, cards
- `--radius-xl: 0.75rem` (12px) - Cards, modals
- `--radius-2xl: 1rem` (16px) - Card containers
- `--radius-3xl: 1.5rem` (24px) - Login card
- `--radius-full: 9999px` - Badges, avatars, circular elements

### Shadows - Subtle Drop Shadows

- `--shadow-none: none`
- `--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)` - Cards, inputs
- `--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04)` - Elevated cards, hover
- `--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.05)` - Dropdowns, modals
- `--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)` - Tooltips
- `--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.12)` - Full modals

### Transitions - Smooth Effects

- `--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)` - Micro-interactions
- `--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1)` - Standard animations
- `--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1)` - Long-form animations

---

## Component Library

### Core Components

#### 1. **AppButton**
Flexible button component with multiple variants and smooth hover transitions.

**Variants:**
- `primary` - Deep navy blue background with hover elevation
- `secondary` - Light gray with border
- `danger` - Red background
- `success` - Green background
- `outline` - Transparent with blue border

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

**Design Features:**
- Subtle box-shadow on all buttons
- Smooth `transform: translateY(-1px)` on hover
- Focus rings for accessibility
- Icon scaling on hover

#### 2. **AppCard**
Container component for content grouping with three variants.

**Variants:**
- `default` - Subtle border with light shadow
- `elevated` - No border, medium shadow
- `outlined` - Double border, no shadow

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

#### 3. **StatCard**
Displays key metrics with optional trending and badge indicators.

**Props:**
```typescript
interface Props {
  title: string
  value: string | number
  subtitle?: string
  isLoading?: boolean
  badge?: { label: string; variant: 'primary' | 'success' | 'warning' | 'danger' }
  trend?: { value: number; direction: 'up' | 'down' }
}
```

**Design Features:**
- Large, bold value display
- Uppercase title with letter spacing
- Subtle hover lift effect
- Skeleton loading animation

#### 4. **FormInput**
Text input with label, validation, icon support, and error handling.

**Props:**
```typescript
interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  type?: string
  error?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  icon?: string
}
```

**Design Features:**
- Floating label style
- Blue focus ring (3px glow)
- Icon color transition on focus
- Subtle shadow on inputs

#### 5. **AppModal**
Modal dialog with header, body, and footer sections.

**Props:**
```typescript
interface Props {
  modelValue: boolean
  title: string
  size?: 'sm' | 'md' | 'lg'
}
```

**Design Features:**
- Slide-up animation
- Semi-transparent overlay
- Scrollable content
- Body scroll lock when open

#### 6. **AppLayout**
Main layout wrapper for authenticated users.

**Features:**
- Sticky header with logo and navigation
- User profile dropdown with logout
- Notification bell with badge
- Responsive sidebar navigation
- Role-based menu items
- Active route highlighting

---

## Page Templates

### 1. **Login Page** (`/login`)
Clean white card on off-white to light-blue gradient background.

**Features:**
- Email and password inputs with icons
- Remember me checkbox
- Forgot password link
- Demo account quick-fill buttons
- Soft decorative background shapes
- Card hover elevation effect

### 2. **Dashboard** (`/dashboard`)
Role-aware overview dashboard showing key metrics and recent activity.

**Role-Specific Content:**
- **Dean**: Institutional metrics, program oversight, pending approvals
- **Program Chair**: Program-specific compliance, faculty submissions
- **Faculty**: Personal submissions, assigned areas, revision status

**Components:**
- Overview statistics grid (6 stat cards)
- Compliance distribution chart (Chart.js doughnut)
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
- ADAMS logo in deep navy blue
- Horizontal navigation (desktop)
- Notification bell with red badge
- User profile dropdown with avatar gradient
- Quick logout

**Sidebar Features:**
- Navigation links per role
- Active route highlighting with blue background
- Icons from Ionicons
- Grouped sections (Main, Management)
- Sticky positioning

**Main Content:**
- Responsive padding
- Page header with title and description
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
- Reduced horizontal padding

**Tablet:**
- Two-column grid
- Visible sidebar
- Optimized spacing
- Adjusted typography

**Desktop:**
- Full multi-column layouts
- Sticky sidebar navigation
- Maximum content width (1280px container)
- Hover states and interactions

---

## Accessibility (WCAG 2.1 AA)

### Color Contrast
- All text meets 4.5:1 contrast ratio (normal text)
- Buttons and interactive elements meet 3:1 contrast ratio
- Dark slate text (#0f172a) on white background

### Semantic HTML
- Proper heading hierarchy (h1, h2, h3...)
- Semantic form labels
- ARIA labels for icons
- Role attributes for custom components

### Keyboard Navigation
- All interactive elements focusable
- Logical tab order
- Visible focus indicators (2px solid blue outline)
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

## Global Utility Classes

The design system includes a comprehensive set of utility classes:

**Layout:**
- `.container` - Max-width 1280px centered
- `.grid`, `.grid-cols-2/3/4` - Grid layouts
- `.flex`, `.flex-col`, `.flex-between`, `.flex-center`
- `.items-center`, `.justify-between`, `.justify-center`

**Spacing:**
- `.gap-xs/sm/md/lg/xl` - Gap utilities
- `.p-xs/sm/md/lg/xl` - Padding utilities
- `.px-md`, `.py-md` - Directional padding
- `.m-xs/sm/md/lg/xl` - Margin utilities
- `.mt-*`, `.mb-*` - Directional margins

**Typography:**
- `.text-xs/sm/base/lg/xl` - Font sizes
- `.font-medium/semibold/bold` - Font weights
- `h1/h2/h3/h4` - Heading styles

**Backgrounds:**
- `.bg-primary`, `.bg-primary-light`, `.bg-surface`, `.bg-surface-alt`, `.bg-accent`

**Borders:**
- `.border`, `.border-t`, `.border-b`
- `.rounded-sm/md/lg/xl/2xl/full`

**Shadows:**
- `.shadow-sm`, `.shadow-md`, `.shadow-lg`

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

- Use Composition API with `<script setup>`
- TypeScript for all new code
- Consistent naming conventions
- DRY principle for component logic
- Reusable utility functions
- Descriptive variable names
- CSS variables for all design tokens

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
npx tsc --noEmit
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

**Last Updated**: July 22, 2026  
**Version**: 1.1.0  
**Status**: Production Ready

---

## Design Changes Summary (v1.1.0)

### Color Palette Updates
- **Primary**: Changed from `#3b82f6` (blue-500) to `#1e40af` (deep navy blue-800)
- **Background**: `#f8fafc` (off-white) with soft blue gradient accents
- **Text**: `#0f172a` (dark slate) for high contrast readability
- **Borders**: `#e2e8f0` (soft slate gray) for subtle separation

### Typography Updates
- **Font**: Added Inter (Google Fonts) as primary font family
- **Font weights**: Added Light (300) and Extrabold (800)
- **Line heights**: Added tight (1.25), normal (1.5), relaxed (1.625)

### Spacing Updates
- **Increased whitespace**: Added `--spacing-3xs` (2px) and `--spacing-sm` (12px)
- **Mobile spacing**: Reduced padding on mobile for better fit

### Component Updates
- **AppButton**: Added box-shadow, focus rings, icon hover scaling
- **AppCard**: Refined shadow values, consistent border-radius
- **StatCard**: Increased padding to `var(--spacing-xl)`, added hover lift
- **FormInput**: Fixed label color (was white, now dark slate), added icon focus transition
- **AppModal**: Added size variants (sm, md, lg), max-width constraints
- **AppLayout**: Updated active nav state to use deep navy blue background
- **LoginPage**: Complete redesign - clean white card on off-white/blue gradient background, removed dark theme

### Login Page Redesign
- **Background**: Soft off-white to light-blue gradient (was dark navy/teal)
- **Card**: Clean white with subtle shadow (was deep navy)
- **Decorative elements**: Soft blue gradient shapes (was white circles)
- **Text**: Dark slate for readability (was white)
- **Buttons**: Blue accent for demo account selection (was green)
