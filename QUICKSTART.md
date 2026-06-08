# Quick Start Guide - ADAMS Modern UI

## 30-Second Setup

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run serve

# 3. Open in browser
# http://localhost:8080
```

## Demo Login

**Quick Access**: Click any of the demo role buttons on login page

```
Dean:          dean@university.edu / demo
Program Chair: chair@university.edu / demo
Faculty:       faculty@university.edu / demo
```

---

## What You Get

### 🎨 Design System
- Professional color palette (blue, green, orange, red)
- Complete spacing system (xs, sm, md, lg, xl, 2xl, 3xl)
- Rounded cards, soft shadows, smooth transitions
- Mobile-first responsive design

### 🧩 Components
- `AppCard` - Containers with variants
- `AppButton` - Buttons with states
- `StatCard` - Metric displays
- `FormInput` - Form fields with validation
- `AppModal` - Dialog boxes
- `AppLayout` - Main layout with navigation

### 📊 Pages
- **Dashboard** - Metrics, charts, activity feed
- **Documents** - Document list, search, filters
- **Reports** - Analytics and exports
- **Login** - Modern authentication

### 🎯 State Management (Pinia)
- Authentication store
- Dashboard metrics store
- Document management store

---

## First Time Running

### Step 1: Install & Run
```bash
npm install
npm run serve
```

### Step 2: Login
1. Go to http://localhost:8080
2. Click a demo button or enter credentials
3. Explore the dashboard

### Step 3: Try Each Page
- **Dashboard**: View metrics and charts
- **Documents**: See document list interface
- **Reports**: See report options
- **Profile**: Click profile dropdown (top right)

---

## File Navigation

### To Modify Colors
`src/assets/styles.css` - Edit CSS variables at the top

### To Add Pages
1. Create `src/views/MyPage.vue`
2. Add route in `src/router/index.js`
3. Add menu item in `AppLayout.vue`

### To Modify Components
`src/components/` - Edit any component file

### To Change Data
`src/stores/` - Edit Pinia store files

---

## Key Concepts

### 1. Pinia Stores
```typescript
// Use in any component
const authStore = useAuthStore()
const dashboardStore = useDashboardStore()
```

### 2. TypeScript Components
```vue
<script setup lang="ts">
// TypeScript is enabled by default
const email = ref<string>('')
</script>
```

### 3. CSS Variables
```css
/* All components use these variables */
var(--color-primary)
var(--spacing-lg)
var(--radius-2xl)
```

### 4. Design Tokens
Use these across your code for consistency:
```html
<!-- Spacing -->
padding: var(--spacing-lg)

<!-- Colors -->
color: var(--color-primary)

<!-- Border -->
border-radius: var(--radius-lg)
```

---

## Common Tasks

### Add a New Button
```vue
<app-button variant="primary" size="lg">
  Click Me
</app-button>
```

### Add a Card
```vue
<app-card variant="elevated">
  <template #header>
    <h3>Title</h3>
  </template>
  Card content here
</app-card>
```

### Add a Form Input
```vue
<form-input
  v-model="email"
  label="Email"
  type="email"
  icon="mail-outline"
  placeholder="user@institution.edu"
  required
/>
```

### Show a Modal
```vue
<app-modal v-model="isOpen" title="Confirm">
  <p>Are you sure?</p>
  <template #footer>
    <app-button @click="isOpen = false">Cancel</app-button>
    <app-button variant="danger">Confirm</app-button>
  </template>
</app-modal>
```

---

## Responsive Breakpoints

```css
/* Mobile: default styles */
/* All components are responsive by default */

/* Tablet: 640px+ */
@media (min-width: 640px) { }

/* Desktop: 1024px+ */
@media (min-width: 1024px) { }
```

---

## Icons (Ionicons)

Use any Ionicons name with outline style:
```vue
<ion-icon name="document-outline"></ion-icon>
<ion-icon name="person-outline"></ion-icon>
<ion-icon name="settings-outline"></ion-icon>
<ion-icon name="logout-outline"></ion-icon>
```

Search: https://ionicons.com

---

## Development Tips

### Hot Reload
Changes are automatically refreshed in browser

### TypeScript Checking
```bash
npm run lint
```

### Build for Production
```bash
npm run build
# Output in dist/ folder
```

### Debug
Open browser DevTools:
- Console for logs
- Vue Devtools extension (optional)
- Network tab for API calls

---

## Common Issues

### Port 8080 Already in Use
```bash
npm run serve -- --port 3000
```

### Dependencies Not Installing
```bash
rm -rf node_modules package-lock.json
npm install
```

### Module Not Found
Make sure imports use correct paths:
```typescript
// ✅ Correct
import Component from '@/components/AppCard.vue'

// ❌ Wrong
import Component from './components/AppCard.vue'
```

---

## Documentation

- **Design System**: Read `DESIGN_SYSTEM.md` for complete design docs
- **Implementation**: Read `IMPLEMENTATION_SUMMARY.md` for what's new
- **Full Guide**: Read `README_MODERN.md` for detailed guide

---

## Next: Backend Integration

When ready to connect to backend:

1. **Update Auth Store** - Replace demo login with API call
2. **Update Dashboard Store** - Fetch real metrics from API
3. **Update Document Store** - Connect to document API
4. **Configure Routes** - Update API endpoints

---

## Project Structure at a Glance

```
src/
├── assets/styles.css          ← Global design system
├── components/                ← Reusable components
├── stores/                    ← Pinia state management
├── types/                     ← TypeScript definitions
├── views/                     ← Page components
├── router/index.js            ← Route configuration
├── App.vue                    ← Root component
└── main.js                    ← Entry point
```

---

## Success Checklist

After setup, you should be able to:

- [ ] Run `npm install` and `npm run serve` without errors
- [ ] See login page at http://localhost:8080
- [ ] Login with demo account
- [ ] See dashboard with metrics
- [ ] Navigate between pages (Documents, Reports)
- [ ] Responsive on mobile (resize browser)
- [ ] Logout and return to login
- [ ] See active route highlighted in sidebar

---

## You're Ready! 🚀

You now have a modern, professional, production-ready UI framework.

### Next Steps:
1. Customize colors in `styles.css`
2. Add your institution's logo
3. Connect to backend APIs
4. Deploy to production

---

**Need Help?**
- Check component examples in `src/views/`
- Read `DESIGN_SYSTEM.md` for detailed guidance
- Review component files for usage patterns
- Search Ionicons at https://ionicons.com for icon names

**Happy coding!** ✨

