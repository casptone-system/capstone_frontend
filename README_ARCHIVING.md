# Capstone Project - Ionic Vue Document Archiving App

This is a modern document archiving and management application built with **Ionic Vue** and **Tailwind CSS**. It mirrors the design of the archiving_application (React version) but is built with Vue.js 3 and ready to integrate with your backend API.

## Features

✅ **Fully Functional Ionic Vue Integration**
- Mobile-first responsive design
- Native mobile feel with Ionic components
- Optimized for touch and desktop

✅ **Document Management**
- Browse documents with filtering by status
- Upload documents with drag-and-drop
- View document details and metadata

✅ **Dashboard Analytics**
- Real-time statistics
- Performance metrics
- Quick action shortcuts

✅ **User Management**
- User directory and management
- Role-based access control

✅ **Audit & Compliance**
- Complete audit trail logging
- QA review tracking
- Status monitoring

✅ **Reports**
- Generate custom reports
- Download functionality
- Report management

✅ **Settings & Preferences**
- User profile management
- Password change
- Notification preferences

## Tech Stack

- **Framework**: Vue.js 3 with TypeScript
- **UI Framework**: Ionic Vue 7
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **Styling**: Tailwind CSS 3
- **Build Tool**: Vue CLI
- **HTTP Client**: Axios
- **Icons**: Ionicons

## Project Structure

```
src/
├── views/                  # Page components
│   ├── LoginPage.vue
│   ├── ForgotPassword.vue
│   ├── Dashboard.vue
│   ├── Documents.vue
│   ├── Upload.vue
│   ├── Reports.vue
│   ├── Users.vue
│   ├── Audit.vue
│   ├── QA.vue
│   └── Settings.vue
├── components/            # Reusable components
│   ├── Layout.vue
│   ├── SideMenu.vue
│   ├── StatCard.vue
│   ├── DocumentCard.vue
│   └── ProgramCard.vue
├── stores/                # Pinia state management
│   └── authStore.ts
├── services/              # API services
│   └── api.ts
├── types/                 # TypeScript interfaces
│   └── index.ts
├── router/               # Route configuration
│   └── index.js
├── assets/               # Styles and static files
│   ├── styles.css
│   └── tailwind.css
└── main.ts              # App entry point
```

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure your API endpoint**:
   Create a `.env.local` file in the root directory:
   ```
   VUE_APP_API_URL=http://localhost:3000/api
   ```

3. **Run development server**:
   ```bash
   npm run serve
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## API Integration

The app is designed to work with your backend API. Key endpoints to implement:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/forgot-password` - Password reset
- `GET /auth/user` - Current user info

### Dashboard
- `GET /dashboard/stats` - Dashboard statistics

### Documents
- `GET /documents` - List documents
- `POST /documents/upload` - Upload document
- `GET /documents/:id` - Document details

### Reports
- `GET /reports` - List reports
- `POST /reports/generate` - Generate new report

### Users
- `GET /users` - List users
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `PUT /users/profile` - Update profile
- `POST /users/change-password` - Change password
- `PUT /users/preferences` - Update preferences

### Audit
- `GET /audit-logs` - Get audit logs

### QA Reviews
- `GET /qa-reviews` - List QA reviews
- `POST /qa-reviews` - Create QA review
- `PUT /qa-reviews/:id` - Update QA review

## Authentication Flow

The app uses token-based authentication:

1. User logs in with email/password
2. Backend returns JWT token
3. Token is stored in localStorage
4. Token is sent with every API request via Authorization header
5. On logout, token is cleared

## State Management

Authentication state is managed with Pinia. User information is persisted in localStorage for session continuity.

## Styling

- Uses **Tailwind CSS** for utility-first styling
- Custom Ionic components with Tailwind classes
- Responsive grid layouts
- Dark-mode ready

## Component Structure

### Layout
The app uses a side menu for navigation with Ionic's menu component. Main content area displays page-specific content.

### Pages
Each page:
- Fetches data from your API
- Shows loading states
- Displays error messages
- Supports real-time filtering

### Components
Reusable components include:
- **StatCard**: Display metrics
- **DocumentCard**: Show document info
- **ProgramCard**: Display program details
- **Layout**: Main page layout with header/footer
- **SideMenu**: Navigation menu

## Configuration

### API Service
Edit `src/services/api.ts` to configure:
- Base API URL
- Default headers
- Interceptors for auth tokens

### Environment Variables
Create `.env.local`:
```
VUE_APP_API_URL=http://your-backend-api.com/api
VUE_APP_ENVIRONMENT=development
```

## Development Tips

1. **Hot Module Replacement**: Changes to .vue files hot-reload automatically
2. **TypeScript Support**: Full type checking with TypeScript
3. **Component Development**: Use the Vue DevTools extension
4. **API Testing**: Use Postman or similar to test endpoints

## Security Notes

- Tokens are stored in localStorage (consider using httpOnly cookies)
- CORS must be configured on backend
- Always validate user permissions on backend
- Use HTTPS in production

## Deployment

1. Build the app:
   ```bash
   npm run build
   ```

2. The `dist/` folder contains production files
3. Deploy to your hosting service (Netlify, Vercel, AWS, etc.)
4. Configure environment variables for production API

## Mobile Build (Optional)

To build as a mobile app with Capacitor:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add ios
npx cap add android
npx cap open ios   # or 'android'
```

## Troubleshooting

### API Calls Not Working
- Check backend is running
- Verify API URL in `.env.local`
- Check CORS configuration
- Use browser DevTools Network tab

### Styling Issues
- Clear browser cache
- Run `npm run build` fresh
- Check Tailwind configuration

### Authentication Issues
- Verify token in localStorage
- Check auth headers in API requests
- Verify backend token validation

## Future Enhancements

- Real-time notifications
- Advanced search and filtering
- Export to PDF/Excel
- Dark mode toggle
- Multi-language support
- Progressive Web App (PWA) features
- Mobile app builds with Capacitor

## Support & Documentation

- [Ionic Vue Docs](https://ionicframework.com/docs/vue/overview)
- [Vue 3 Docs](https://vuejs.org/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Pinia Docs](https://pinia.vuejs.org/)

## License

This project is part of a capstone project.
