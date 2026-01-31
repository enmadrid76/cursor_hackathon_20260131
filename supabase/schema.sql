-- MedERP MVP – Supabase Database Schema
-- Run this script in Supabase SQL Editor (Project → SQL Editor → New query)
-- PRD reference: Section 4 (Core entities and data model)

-- Enable UUID extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE appointment_status AS ENUM (
  'scheduled',
  'completed',
  'cancelled',
  'no_show'
);

CREATE TYPE user_role AS ENUM (
  'admin',
  'doctor'
);

-- =============================================================================
-- TABLES (dependency order: clinics → doctors, patients → appointments → profiles)
-- =============================================================================

-- Clinics: name, address, contact, timezone, active flag
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  contact TEXT,
  timezone TEXT DEFAULT 'UTC',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Doctors: name, contact, specialty, linked to one clinic (MVP: one doctor = one clinic)
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  contact TEXT,
  specialty TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_doctors_clinic_id ON doctors(clinic_id);

-- Patients: name, contact, DOB, optional medical ID
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact TEXT,
  date_of_birth DATE,
  medical_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Appointments: start, duration, status, clinic, doctor, patient + per-appointment fields
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE RESTRICT,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  start_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status appointment_status NOT NULL DEFAULT 'scheduled',
  -- Per-appointment fields (PRD §4.1)
  disease_name TEXT,
  virality_rate NUMERIC(3,1) CHECK (virality_rate >= 0 AND virality_rate <= 10),
  patient_age_at_visit INTEGER,
  avg_monthly_city_temp NUMERIC(6,2),
  country TEXT,
  continent TEXT,
  type_or_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_start_at ON appointments(start_at);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Profiles: links Supabase Auth users to role (admin/doctor) and optionally to a doctor record
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'admin',
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT profiles_doctor_role_check CHECK (
    (role = 'doctor' AND doctor_id IS NOT NULL) OR (role = 'admin' AND doctor_id IS NULL)
  )
);

CREATE INDEX idx_profiles_doctor_id ON profiles(doctor_id);

-- =============================================================================
-- UPDATED_AT TRIGGER
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clinics_updated_at
  BEFORE UPDATE ON clinics
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- AUTO-CREATE PROFILE ON AUTH SIGNUP (optional)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'admin')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: run after a new user signs up (you can set first user as admin via dashboard or seed)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Helper: current user's role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: current user's doctor_id (if doctor)
CREATE OR REPLACE FUNCTION public.current_user_doctor_id()
RETURNS UUID AS $$
  SELECT doctor_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Clinics: admins full access; doctors can read their clinic
CREATE POLICY "Admins full access clinics"
  ON clinics FOR ALL
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "Doctors read own clinic"
  ON clinics FOR SELECT
  USING (
    public.current_user_role() = 'doctor'
    AND id IN (SELECT clinic_id FROM doctors WHERE id = public.current_user_doctor_id())
  );

-- Doctors: admins full access; doctors can read self
CREATE POLICY "Admins full access doctors"
  ON doctors FOR ALL
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "Doctors read self"
  ON doctors FOR SELECT
  USING (id = public.current_user_doctor_id());

-- Patients: admins full access; doctors can read patients they have appointments with
CREATE POLICY "Admins full access patients"
  ON patients FOR ALL
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "Doctors read own patients"
  ON patients FOR SELECT
  USING (
    public.current_user_role() = 'doctor'
    AND id IN (SELECT patient_id FROM appointments WHERE doctor_id = public.current_user_doctor_id())
  );

-- Appointments: admins full access; doctors CRUD own appointments
CREATE POLICY "Admins full access appointments"
  ON appointments FOR ALL
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "Doctors manage own appointments"
  ON appointments FOR ALL
  USING (doctor_id = public.current_user_doctor_id())
  WITH CHECK (doctor_id = public.current_user_doctor_id());

-- Profiles: users can read own profile; admins can update (e.g. assign doctor_id/role)
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins update profiles"
  ON profiles FOR UPDATE
  USING (public.current_user_role() = 'admin')
  WITH CHECK (true);

CREATE POLICY "Users insert own profile (signup)"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================================================
-- GRANT USAGE (for anon/authenticated via Supabase)
-- =============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON clinics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON doctors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON patients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON appointments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
