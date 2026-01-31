import { createClient } from '@/lib/supabase/server';
import ReportsByClinicClient from './ReportsByClinicClient';

export default async function ReportsByClinicPage() {
  const supabase = await createClient();
  const [clinicsRes, appointmentsRes] = await Promise.all([
    supabase.from('clinics').select('id, name').order('name'),
    supabase
      .from('appointments')
      .select('id, clinic_id, start_at, disease_name, status')
      .order('start_at', { ascending: false }),
  ]);
  return (
    <ReportsByClinicClient
      initialClinics={clinicsRes.data ?? []}
      initialAppointments={appointmentsRes.data ?? []}
    />
  );
}
