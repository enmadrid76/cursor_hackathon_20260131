import { createClient } from '@/lib/supabase/server';
import AppointmentsClient from './AppointmentsClient';

export default async function AppointmentsPage() {
  const supabase = await createClient();
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, clinics(name), doctors(name), patients(name)')
    .order('start_at', { ascending: false });
  const { data: clinics } = await supabase.from('clinics').select('id, name').order('name');
  const { data: doctors } = await supabase.from('doctors').select('id, name, clinic_id').order('name');
  const { data: patients } = await supabase.from('patients').select('id, name').order('name');
  return (
    <AppointmentsClient
      initialAppointments={appointments ?? []}
      clinics={clinics ?? []}
      doctors={doctors ?? []}
      patients={patients ?? []}
    />
  );
}
