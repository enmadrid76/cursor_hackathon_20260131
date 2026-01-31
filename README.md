# MedERP – Medical ERP MVP

Medical ERP SaaS: track doctors, clinics, appointments, patients, with analytics and reporting.

- **Stack:** TypeScript, Next.js 14, Supabase (PostgreSQL + Auth), Vercel
- **Features:** Clinics, Doctors, Patients, Appointments (with disease, virality, age, temperature, country, continent), Dashboard, Reports (by disease, geography, CSV export), i18n (English, French, Spanish)
- **Docs:** [PRD.md](./PRD.md) (product requirements), [manualsteps.md](./manualsteps.md) (manual setup steps)

## Quick start

1. **Clone and install**
   ```bash
   git clone https://github.com/enmadrid76/cursor_hackathon_20260131.git
   cd cursor_hackathon_20260131
   npm install
   ```

2. **Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Run the schema: copy [supabase/schema.sql](./supabase/schema.sql) into Supabase SQL Editor and run it
   - Enable Email auth in Authentication → Providers
   - Copy Project URL and anon key from Project Settings → API

3. **Environment**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000). Sign up via Supabase (first user gets admin role via trigger).

## Deploy (Vercel)

1. Push to GitHub and import the repo in [vercel.com](https://vercel.com)
2. Add env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy

See [manualsteps.md](./manualsteps.md) and [PRD.md](./PRD.md) Appendix A for full deployment steps.

## Push to GitHub

From the project root (after `npm install`):

```bash
# If .git already exists but is broken, remove it first: rm -rf .git  (or on Windows: rmdir /s .git)
git init
git remote add origin https://github.com/enmadrid76/cursor_hackathon_20260131.git
git add .
git commit -m "MedERP MVP: Next.js, Supabase, i18n, CRUD, dashboard, reports"
git branch -M main
git push -u origin main
```

If the GitHub repo already has content (e.g. README), use `git pull origin main --allow-unrelated-histories` before pushing, or force push: `git push -u origin main --force` (only if you intend to overwrite the remote).

## Test data

Use [docs/test-data-sets.json](./docs/test-data-sets.json) and insert records via prompts or your preferred seed method. See PRD Section 10.
