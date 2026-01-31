# Medical ERP MVP – Product Requirements Document

**Version:** 1.0  
**Last updated:** January 2025

---

## 1. Purpose and audience

- **Purpose:** Single source of truth for scope, features, and constraints so the MVP can be built without scope creep.
- **Audience:** Product owner, developers, and anyone evaluating or joining the project.
- **Deliverable:** This PRD; refine as the product evolves.

---

## 2. Vision and goals

### 2.1 Product name

**MedERP** (or placeholder until final naming).

### 2.2 One-liner

Medical ERP SaaS that tracks doctors, clinics, appointments, and patients, with analytics and reporting.

### 2.3 Goals

- Enable small/medium clinics to manage operations and get basic insights.
- MVP first; iterate based on feedback.
- One organization manages multiple doctors and multiple clinics (single-tenant SaaS).

### 2.4 In scope for MVP (v1)

- Clinics, doctors, patients, appointments (CRUD and list/filter).
- Per-appointment fields: disease name, virality/contagion rate (0–10), patient age at visit, average monthly city temperature, country, continent.
- Temperature display: user preference (°C / °F) in settings or report.
- Auth: Admin and Doctor roles; no patient login.
- Internationalization: English, French, Spanish (dropdown top right; all UI text translatable; default from browser locale).
- Analytics and reporting: dashboard, reports by disease/geography/age/temperature/virality, CSV export.
- Test data: inserted via prompts (see test data sets in this PRD and `docs/test-data-sets.json`).
- Tech: TypeScript; Next.js; Supabase (DB + auth); Vercel (hosting).
- Deployment: Vercel + Supabase; first-time instructions in Appendix A.

### 2.5 Out of scope for MVP (not in v1)

- Billing, invoicing, insurance/claims.
- Full EMR/EHR (clinical notes, diagnoses, prescriptions).
- Integrations (labs, pharmacies, external EHRs).
- Native mobile apps (web-only).
- Patient portal or patient login.
- Multi-organization tenancy (many orgs); MVP is one org, many clinics/doctors.

---

## 3. User personas

| Persona        | Role                                   | Primary needs                                                |
|----------------|----------------------------------------|--------------------------------------------------------------|
| **Clinic admin** | Manages clinics, doctors, schedules, patients | CRUD all entities; run reports; view dashboards              |
| **Doctor**       | Sees own schedule and patients         | View/edit own appointments; view patient list; basic dashboard |
| **Patient**      | (Not in MVP)                           | Defer to Phase 2                                             |

MVP focuses on **Clinic admin** and **Doctor**. No patient login.

---

## 4. Core entities and data model

### 4.1 Entities

- **Clinics:** Name, address, contact, timezone, active flag. One clinic has many doctors and many appointments.
- **Doctors:** Name, contact, specialty, linked to **one clinic** (one doctor = one clinic for MVP). Linked to appointments (and thus patients) via appointments.
- **Patients:** Name, contact, DOB, optional medical ID. Linked to appointments (and thus to doctors/clinics).
- **Appointments:** Start date/time, duration, status (scheduled, completed, cancelled, no-show), clinic, doctor, patient. **Per-appointment fields:** disease name, virality/contagion rate (0–10), patient age at visit, average monthly city temperature (single numeric value; display unit °C/°F by user preference), country, continent. Optional: type/reason, notes.

### 4.2 Relationships

```mermaid
erDiagram
  Clinic ||--o{ Doctor : "has"
  Clinic ||--o{ Appointment : "hosts"
  Doctor ||--o{ Appointment : "performs"
  Patient ||--o{ Appointment : "attends"
  Clinic { string name, address, contact }
  Doctor { string name, specialty }
  Patient { string name, contact, dob }
  Appointment { datetime start, duration, status, disease_name, virality_0_10, patient_age_at_visit, avg_monthly_city_temp, country, continent }
```

### 4.3 Multi-tenancy

**One organization** manages **multiple doctors** and **multiple clinics**. Single tenant from a SaaS perspective. No per-organization isolation or billing in MVP.

---

## 5. Functional requirements (MVP)

### 5.1 Must-have (v1)

- **Clinics:** Create, read, update, delete (CRUD). List and filter.
- **Doctors:** CRUD; assign each doctor to one clinic; list/filter by clinic and specialty.
- **Patients:** CRUD; list/filter; link to appointments.
- **Appointments:** CRUD; list by date/doctor/clinic/patient; basic calendar or list view. Capture and display: disease name, virality/contagion rate (0–10), patient age at visit, average monthly city temperature, country, continent. Status workflow: scheduled → completed / cancelled / no-show.
- **Auth:** Login (email/password or magic link). Roles: Admin, Doctor. No patient login.
- **Internationalization (i18n):** Web interface supports **English**, **French**, and **Spanish**. Language **dropdown at the top right** lists these three; selecting one switches the UI. **All text** (labels, buttons, messages, nav, reports, dashboard, errors) must be available in all three languages via translation keys and locale files (e.g. `en.json`, `fr.json`, `es.json`) or an i18n library (e.g. next-intl, react-i18next). Default language: detect browser locale; use English, French, or Spanish if supported, else fallback to English. Persist selection (e.g. localStorage or cookie).
- **Analytics and reporting:**
  - **Dashboard:** Key metrics (e.g. appointments per day/week, per doctor, per clinic; completion vs no-show/cancel rate; new patients).
  - **Reports:** At least 2–3 concrete reports (e.g. Appointments by doctor (date range), Appointments by clinic (date range), Patient list with last appointment). Plus demo reports: by disease, geography, age band, temperature band, virality (see Section 10).
  - **Export:** CSV (or Excel) for reports.

### 5.2 Nice-to-have (only if trivial)

- Simple search (global or per entity).
- Pagination and basic filters on list views.

### 5.3 Explicitly out of scope for MVP

- Billing, invoicing, insurance/claims.
- Full EMR/EHR (clinical notes, diagnoses, prescriptions).
- Integrations (labs, pharmacies, EHRs).
- Native mobile apps.
- Patient portal.

---

## 6. Non-functional requirements

- **Delivery:** SaaS, browser-based; responsive (works on tablets).
- **Security:** HTTPS; hashed passwords; role-based access; no PHI in URLs or client-side storage in plain text. Follow best practices for PHI (full HIPAA compliance may be a later phase).
- **Performance:** Pages load in &lt; 3s; lists support at least hundreds of rows (pagination or virtual scroll).
- **Tech stack:** **TypeScript.** Next.js for the web app; Supabase JS client for database and auth.
- **Hosting:** **Vercel** (frontend + serverless API) + **Supabase** (PostgreSQL database, auth, optional storage).
- **i18n approach:** Translation files (e.g. `locales/en.json`, `locales/fr.json`, `locales/es.json`) or Next.js-compatible i18n library. Default language from browser locale (en/fr/es or fallback to English). Language selector: dropdown top-right; options "English", "Français", "Español". All UI copy, validation messages, and report/dashboard labels go through the i18n layer.
- **Temperature unit:** User preference; user can switch °C / °F in settings or report. Store one numeric value; display according to preference.

---

## 7. Analytics and reporting (detail)

- **Data source:** Same database as transactional data (no separate data warehouse for MVP).
- **Metrics:** Appointments (count by day/week/month; by doctor; by clinic; by status); patients (new in period; total active; optional: no appointment in X days).
- **UI:** One Dashboard page (charts + summary cards); one Reports page (dropdown of report types, date range, Export CSV).
- **Charts:** Simple only (bar/line for trends, pie for status mix). Use a lightweight library (e.g. Chart.js, Recharts).
- **Demo reports (Section 10):** By disease, geography (country/continent), age band, temperature band, virality; dashboard visuals that show COVID (Jan, Mar–Sep) and Ebola (Feb) trends.

---

## 8. Success criteria for MVP

- Clinic admin can manage clinics, doctors, patients, and appointments.
- Doctor can log in and see their schedule and complete/cancel appointments.
- Dashboard shows at least 3–5 meaningful metrics.
- At least 2 reports are available and exportable (CSV).
- App is usable on desktop and tablet browsers.
- Language dropdown (top right) offers English, French, and Spanish; all UI text is available in all three languages.
- Temperature can be displayed in °C or °F per user preference.

---

## 9. Tech stack and hosting (decided)

- **Stack:** TypeScript. Next.js (web app); Supabase JS client (database and auth).
- **Hosting:** Vercel (frontend + serverless API) + Supabase (PostgreSQL, auth, optional storage).
- **Multi-tenancy:** One org, multiple doctors, multiple clinics.
- **Patient login:** No patient login for MVP.

---

## 10. Test data and demo reports (post-build)

After the application is built, insert test records to demonstrate reporting and analytics. Test data is inserted **through prompts** (user prompts to generate/insert records); no seed script required.

### 10.1 Test data set 1 – January 2025: COVID

- **Disease:** COVID.
- **Contagion:** High virality/contagion rate (e.g. 7–10).
- **Age:** All ages (spread across young, middle, elderly).
- **Geography:** Asian countries (e.g. China, Japan, India, South Korea); continent = Asia.
- **Temperature:** All bands (low, medium, high avg monthly city temps).

### 10.2 Test data set 2 – February 2025: Ebola

- **Disease:** Ebola.
- **Contagion:** High (e.g. 7–10).
- **Age:** Elderly (patient age at visit 60+).
- **Geography:** African countries (e.g. DRC, Guinea, Liberia, Nigeria); continent = Africa.
- **Temperature:** High-temperature cities only.

### 10.3 Test data set 3 – March 2025 to September 2025: COVID worldwide

- **Disease:** COVID.
- **Contagion:** High (same as data set 1).
- **Geography:** Worldwide spread with realistic propagation (e.g. March heavy in Asia, April–May Europe/Americas, June–September all continents with varying volume).
- **Age:** All ages.
- **Temperature:** All temperatures.

Pre-built test data is available in **`docs/test-data-sets.json`** (clinics, doctors, patients, and appointments for all three sets). Use it via prompts to insert records into the app.

### 10.4 Reports and analytics to create (to show these trends)

- By disease (count/trend; filter by date range).
- By geography (country and continent; time series, e.g. monthly).
- By age (distribution; bands e.g. 0–18, 19–40, 41–60, 61+).
- By temperature (bands low/medium/high).
- By virality (distribution or filter 0–10).
- Dashboard: summary cards and charts (e.g. cases by month and continent, by disease, by age or temperature band).
- Export: all of the above as CSV for date range and filters.

---

## Appendix A: Deployment (Vercel + Supabase)

First-time users: follow the order below. See also **manualsteps.md** for a concise list of manual steps.

### A.1 Order of operations

1. Create Supabase project and get connection details.
2. Create database tables (run schema or migrations).
3. Enable Email auth in Supabase.
4. Create Vercel account and import Git repository.
5. Add environment variables in Vercel (from Supabase).
6. Deploy. Optional: add custom domain.

### A.2 Supabase (database and auth)

1. **Sign up:** Create an account at [supabase.com](https://supabase.com) and log in.
2. **Create a project:** New Project → choose organization → set project name (e.g. `mederp-mvp`) → set a **database password** (store it securely) → select region closest to users → Create.
3. **Wait for provisioning:** Database is ready when the dashboard shows status **Active**.
4. **Get connection details:**
   - **Project Settings → API:** copy **Project URL** and **anon (public) key**.
   - **Project Settings → Database:** copy **Connection string** (URI) for server-side use if needed.
5. **Create tables:** Use **SQL Editor** in Supabase to run the application schema (or apply migrations). Schema should define tables for: clinics, doctors, patients, appointments (with columns per Section 4).
6. **Auth:** In **Authentication → Providers**, enable **Email**. The app will use Supabase Auth for login.

### A.3 Vercel (hosting the app)

1. **Sign up:** Create an account at [vercel.com](https://vercel.com) (e.g. via GitHub/GitLab/Bitbucket).
2. **Import project:** Connect your Git repository. Select the repo → Vercel auto-detects Next.js → confirm root directory and build command.
3. **Environment variables:** In **Project → Settings → Environment Variables**, add every variable the app needs (see table below). Apply to Production (and Preview if desired).
4. **Deploy:** Push to the linked branch (e.g. main) or trigger Deploy from the dashboard. First deploy runs the build; subsequent pushes auto-deploy.
5. **Custom domain (optional):** In **Project → Settings → Domains**, add your domain and follow DNS instructions.

### A.4 Required environment variables

| Variable | Description | Where to get it |
|---------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous (public) key | Supabase → Project Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | (If used) Server-side only; full access | Supabase → Project Settings → API → service_role |
| `DATABASE_URL` | (If used for migrations) Postgres connection string | Supabase → Project Settings → Database → Connection string (URI) |

### A.5 Local development

- Copy `.env.example` to `.env.local` (or `.env`) and fill in the same variables as above (at least `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- Run the app locally (e.g. `npm run dev`). Ensure the database schema has been applied in Supabase before using app features.

---

## Document history

| Version | Date | Changes |
|--------|------|---------|
| 1.0 | January 2025 | Initial PRD from plan. |
