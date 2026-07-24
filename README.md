# capstone_project

## Project setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- A Supabase account (https://supabase.com)

### Installation

1. Clone the repository
```bash
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

4. Configure Supabase credentials
   - Open `.env` file
   - Replace the placeholder values with your actual Supabase project credentials:
     - `VUE_APP_SUPABASE_URL`: Your Supabase project URL
     - `VUE_APP_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - You can find these values in your Supabase project settings (Project Settings > API)

5. Set up the database (optional)
   - If you need to set up the database schema, run the migration files in the `supabase/migrations/` directory in order:
     - `001_schema.sql`
     - `002_seed_data.sql`
     - `003_rls_policies.sql`
     - `004_update_signup_trigger.sql`

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
- If your Supabase credentials are exposed, rotate them immediately in your Supabase project settings
