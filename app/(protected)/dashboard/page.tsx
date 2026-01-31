import { createClient } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const supabase = await createClient();
  const [
    { count: totalAppointments },
    { count: appointmentsThisMonth },
    { count: totalPatients },
  ] = await Promise.all([
    supabase.from('appointments').select('*', { count: 'exact', head: true }),
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('start_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      .lt('start_at', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString()),
    supabase.from('patients').select('*', { count: 'exact', head: true }),
  ]);

  const { data: byStatus } = await supabase
    .from('appointments')
    .select('status')
    .not('status', 'is', null);
  const statusCounts = (byStatus ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {});

  const { data: byDisease } = await supabase
    .from('appointments')
    .select('disease_name')
    .not('disease_name', 'is', null);
  const diseaseCounts = (byDisease ?? []).reduce<Record<string, number>>((acc, row) => {
    const name = row.disease_name ?? 'Unknown';
    acc[name] = (acc[name] ?? 0) + 1;
    return acc;
  }, {});

  const { data: appointmentsForContinent } = await supabase
    .from('appointments')
    .select('start_at, continent')
    .order('start_at', { ascending: true });

  return (
    <DashboardClient
      totalAppointments={totalAppointments ?? 0}
      appointmentsThisMonth={appointmentsThisMonth ?? 0}
      totalPatients={totalPatients ?? 0}
      statusCounts={statusCounts}
      diseaseCounts={diseaseCounts}
      appointmentsForContinent={appointmentsForContinent ?? []}
    />
  );
}
