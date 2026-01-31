export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';
export type UserRole = 'admin' | 'doctor';

export interface Clinic {
  id: string;
  name: string;
  address: string | null;
  contact: string | null;
  timezone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: string;
  clinic_id: string;
  name: string;
  contact: string | null;
  specialty: string | null;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  name: string;
  contact: string | null;
  date_of_birth: string | null;
  medical_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  clinic_id: string;
  doctor_id: string;
  patient_id: string;
  start_at: string;
  duration_minutes: number;
  status: AppointmentStatus;
  disease_name: string | null;
  virality_rate: number | null;
  patient_age_at_visit: number | null;
  avg_monthly_city_temp: number | null;
  country: string | null;
  continent: string | null;
  type_or_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  role: UserRole;
  doctor_id: string | null;
  created_at: string;
  updated_at: string;
}
