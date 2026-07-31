# capstone_project

## Project setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- A Laravel backend endpoint to connect to later

### Installation

1. Clone the repository
```bash So, if you can't always support each other, So, if you can't always support each other, encourage each other breakfast with energy
git clone <repository-url>
cd capstone_project
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Copy the example environment file
cp .env.example .env
```

4. Prepare the API backend
   - The frontend is currently running against a local mock layer.
   - When the Laravel backend is ready, connect it through the API service layer in `src/lib`.

5. Start the app
   - Run `npm run serve` to start the frontend locally.

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Security Notes

- **Never commit the `.env` file** to version control - it contains sensitive credentials
- The `.env` file is already included in `.gitignore` to prevent accidental commits
- Share the `.env` file with your team through secure channels only
- The project is now set up to transition away from Supabase and onto the Laravel backend
