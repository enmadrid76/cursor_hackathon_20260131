import { createClient } from '@/lib/supabase/server';
import ReportsClient from './ReportsClient';

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, start_at, disease_name, virality_rate, patient_age_at_visit, avg_monthly_city_temp, country, continent, status')
    .order('start_at', { ascending: false });
  return <ReportsClient initialAppointments={appointments ?? []} />;
}
