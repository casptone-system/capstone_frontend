# Capstone Project - Quick Setup Guide

## 🚀 Getting Started

This is an Ionic Vue application with the design from the archiving_application (React version), but built with Vue.js 3 and ready to connect to your backend.

## 📋 Prerequisites

- Node.js 14+ and npm
- Your backend API server running
- Basic knowledge of Vue.js and Ionic Framework

## ⚙️ Installation Steps

### 1. Install Dependencies
```bash
cd c:\capstone\frontend\capstone_project
npm install
```

### 2. Configure API Endpoint
Create a `.env.local` file in the project root:
```
VUE_APP_API_URL=http://localhost:3000/api
```

Replace `http://localhost:3000/api` with your actual backend API URL.

### 3. Run Development Server
```bash
npm run serve
```

The app will be available at `http://localhost:8080`

## 🔑 API Endpoints Your Backend Needs

### Authentication
```
POST /auth/login
  Body: { email, password }
  Response: { token, user }

POST /auth/forgot-password
  Body: { email }
  Response: { success: true }
```

### Dashboard
```
GET /dashboard/stats
  Response: { totalDocuments, approvedDocuments, pendingDocuments, activePrograms }
```

### Documents
```
GET /documents?status=pending
  Response: [{ id, title, fileName, size, uploadedBy, uploadedDate, status }]

POST /documents/upload
  Body: FormData with file, title, description
  Response: { id, ... }
```

### Reports
```
GET /reports
  Response: [{ id, title, description, generatedDate, generatedBy, type }]

POST /reports/generate
  Response: { id, ... }
```

### Users
```
GET /users
  Response: [{ id, name, email, role }]

PUT /users/profile
  Body: { fullName, email, department }
  Response: { success: true }

POST /users/change-password
  Body: { currentPassword, newPassword }
  Response: { success: true }
```

### Audit Logs
```
GET /audit-logs?status=success
  Response: [{ id, action, user, timestamp, details, status }]
```

### QA Reviews
```
GET /qa-reviews?status=passed
  Response: [{ id, itemTitle, reviewer, reviewDate, status, feedback }]
```

## 🎨 Pages Available

| Route | Description | Components |
|-------|-------------|-----------|
| `/login` | Login page | - |
| `/forgot-password` | Password reset | - |
| `/dashboard` | Main dashboard | StatCard, Charts |
| `/documents` | Document list | DocumentCard, Filters |
| `/upload` | Upload documents | Drag-drop upload |
| `/reports` | Reports management | Report cards |
| `/users` | User management | User table |
| `/audit` | Audit trail | Timeline view |
| `/qa-review` | QA reviews | Review cards |
| `/settings` | User settings | Form inputs |

## 🔐 Authentication

The app uses JWT token-based authentication:

1. **Login**: Submit email/password to backend
2. **Token Storage**: Token stored in localStorage as `authToken`
3. **Auth Header**: Token automatically sent with all API requests
4. **Session**: User info stored in localStorage as `user`

## 🛠️ Project Structure

```
src/
├── views/              # Page components (use API endpoints)
├── components/         # Reusable UI components
├── stores/            # Pinia state management
├── services/api.ts    # Axios instance with auth setup
├── types/index.ts     # TypeScript interfaces
├── router/            # Route configuration
├── assets/            # Styles and images
└── main.ts            # App entry point
```

## 📝 Key Files to Understand

### `src/services/api.ts`
- Configures Axios instance
- Handles API base URL
- Adds auth token to requests
- Intercepts errors

### `src/stores/authStore.ts`
- Manages authentication state
- Stores user info
- Handles login/logout

### `src/views/*.vue`
- Each page component
- Fetches data from API
- Shows loading/error states

## 🎯 Implementation Checklist

- [ ] Backend API endpoints created
- [ ] `.env.local` configured with API URL
- [ ] Run `npm install`
- [ ] Run `npm run serve`
- [ ] Test login with your credentials
- [ ] Verify API calls in browser DevTools
- [ ] Customize components as needed
- [ ] Update API endpoints in services as needed

## 🐛 Troubleshooting

### API Calls Not Working
1. Check backend server is running
2. Verify `.env.local` has correct API URL
3. Check CORS is enabled on backend
4. Open browser DevTools → Network tab to see requests

### Authentication Issues
1. Verify token is returned from login endpoint
2. Check token format (should be JWT)
3. Verify token is being sent in Authorization header
4. Check backend validates token correctly

### Styling Issues
1. Clear browser cache (Ctrl+Shift+Del)
2. Rebuild: `npm run build`
3. Verify Tailwind classes are recognized

## 📚 Resources

- [Ionic Vue Documentation](https://ionicframework.com/docs/vue/overview)
- [Vue 3 Guide](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Pinia Documentation](https://pinia.vuejs.org/)

## 🚢 Production Build

```bash
npm run build
```

This creates a `dist/` folder with optimized files ready for deployment.

## 💡 Next Steps

1. Verify your backend API matches the endpoints
2. Test each page with real data
3. Customize styling as needed
4. Add additional features
5. Deploy to your hosting provider

---

**Note**: This app expects your backend API to be running. Make sure all endpoints are implemented before deploying.
