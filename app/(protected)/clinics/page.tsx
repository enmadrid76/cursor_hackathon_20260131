import { createClient } from '@/lib/supabase/server';
import ClinicsClient from './ClinicsClient';

export default async function ClinicsPage() {
  const supabase = await createClient();
  const { data: clinics } = await supabase.from('clinics').select('*').order('name');
  return <ClinicsClient initialClinics={clinics ?? []} />;
}
