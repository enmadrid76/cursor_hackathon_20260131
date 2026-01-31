import { createClient } from '@/lib/supabase/server';
import PatientsClient from './PatientsClient';

export default async function PatientsPage() {
  const supabase = await createClient();
  const { data: patients } = await supabase.from('patients').select('*').order('name');
  return <PatientsClient initialPatients={patients ?? []} />;
}
