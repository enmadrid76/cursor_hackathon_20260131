# Manual Steps – Medical ERP MVP

This document lists **manual steps** you need to perform to set up hosting, database, and test data. See **PRD.md** for full requirements and **Appendix A** for deployment details.

---

## 1. Supabase (database and auth)

1. **Sign up for Supabase**
   - Go to [https://supabase.com](https://supabase.com).
   - Create an account and log in.

2. **Create a new project**
   - Click **New Project**.
   - Choose your organization (or create one).
   - **Name:** e.g. `mederp-mvp`.
   - **Database password:** Set a strong password and **save it securely** (you will need it for direct DB access).
   - **Region:** Select the region closest to your users.
   - Click **Create new project**.

3. **Wait for the project to be ready**
   - Wait until the dashboard shows status **Active** (usually 1–2 minutes).

4. **Get API and database details**
   - Go to **Project Settings** (gear icon) → **API**.
   - Copy and save:
     - **Project URL**
     - **anon public** key
     - **service_role** key (only if the app uses it; keep secret).
   - Go to **Project Settings** → **Database**.
   - Copy and save **Connection string** (URI) if you need it for migrations or server-side use.

5. **Create database tables**
   - Go to **SQL Editor** in the Supabase dashboard.
   - Run the application schema (tables for clinics, doctors, patients, appointments) as provided by the codebase (e.g. migration SQL or schema file). If the app uses migrations, run them; otherwise run the schema script once.

6. **Enable Email authentication**
   - Go to **Authentication** → **Providers**.
   - Ensure **Email** is enabled (default). Configure email templates if desired.

---

## 2. Vercel (hosting the app)

1. **Sign up for Vercel**
   - Go to [https://vercel.com](https://vercel.com).
   - Sign up (e.g. with GitHub, GitLab, or Bitbucket).

2. **Import your Git repository**
   - In Vercel dashboard, click **Add New** → **Project**.
   - Import your Git repository (connect the provider if needed).
   - Select the repository that contains the Medical ERP app.
   - Vercel should auto-detect Next.js; confirm **Root Directory** and **Build Command** (or leave defaults).
   - Do **not** deploy yet if you still need to add environment variables.

3. **Add environment variables**
   - In the project import screen (or after import: **Project** → **Settings** → **Environment Variables**), add:
     - `NEXT_PUBLIC_SUPABASE_URL` = (Supabase Project URL from step 1.4).
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (Supabase anon public key from step 1.4).
   - Add any other variables your app requires (e.g. `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`) as per PRD Appendix A.
   - Choose **Production** (and **Preview** if you want them in preview deployments).

4. **Deploy**
   - Click **Deploy** (or push to the linked branch; Vercel will deploy automatically).
   - Wait for the build to finish. Note the deployment URL (e.g. `https://your-project.vercel.app`).

5. **Optional: Custom domain**
   - Go to **Project** → **Settings** → **Domains**.
   - Add your domain and follow the DNS instructions provided by Vercel.

---

## 3. Local development

1. **Clone the repository** (if not already) and install dependencies.
   - `npm install` (or `yarn` / `pnpm` as per project).

2. **Create local environment file**
   - Copy `.env.example` to `.env.local` (in the project root).
   - Fill in the same variables as in Vercel:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - Any other required variables (e.g. `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`).

3. **Ensure database schema is applied**
   - Tables (clinics, doctors, patients, appointments, etc.) must exist in your Supabase project. If you have not already run the schema in step 1.5, do it now.

4. **Run the app locally**
   - `npm run dev` (or the command used by the project).
   - Open the app in the browser (e.g. `http://localhost:3000`).

---

## 4. Post-deploy: Test data (via prompts)

Test data is inserted **through prompts**, not a seed script. Use the data in **`docs/test-data-sets.json`** and ask your AI assistant (or follow app UI) to insert:

1. **Clinics, doctors, and patients** from the JSON (shared across all three data sets).
2. **Data set 1 – January 2025:** COVID appointments in Asian countries, all ages, all temperature bands (see PRD Section 10.1 and the `data_set_1_jan_2025_covid_asia` section in the JSON).
3. **Data set 2 – February 2025:** Ebola appointments in African countries, elderly patients, high-temperature cities only (see PRD Section 10.2 and `data_set_2_feb_2025_ebola_africa`).
4. **Data set 3 – March–September 2025:** COVID appointments with worldwide spread and realistic propagation (see PRD Section 10.3 and `data_set_3_mar_sep_2025_covid_worldwide`).

Example prompt: *"Insert the clinics, doctors, patients, and appointments from `docs/test-data-sets.json` into the database so I can demo reporting and analytics."*

---

## 5. Checklist summary

- [ ] Supabase account created; project created and Active.
- [ ] Supabase: Project URL and anon key (and any other keys) saved.
- [ ] Supabase: Database tables created (schema/migrations run).
- [ ] Supabase: Email auth enabled.
- [ ] Vercel account created; Git repo imported.
- [ ] Vercel: Environment variables set (at least `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- [ ] Vercel: First deploy successful; deployment URL works.
- [ ] Local: `.env.local` created and filled; app runs with `npm run dev`.
- [ ] Post-deploy: Test data inserted via prompts (using `docs/test-data-sets.json`).

For full product and deployment details, see **PRD.md** and **PRD.md Appendix A**.
