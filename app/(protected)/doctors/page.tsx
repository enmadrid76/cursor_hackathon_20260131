import { createClient } from '@/lib/supabase/server';
import DoctorsClient from './DoctorsClient';

export default async function DoctorsPage() {
  const supabase = await createClient();
  const { data: doctors } = await supabase.from('doctors').select('*, clinics(name)').order('name');
  const { data: clinics } = await supabase.from('clinics').select('id, name').order('name');
  return (
    <DoctorsClient
      initialDoctors={doctors ?? []}
      clinics={clinics ?? []}
    />
  );
}
