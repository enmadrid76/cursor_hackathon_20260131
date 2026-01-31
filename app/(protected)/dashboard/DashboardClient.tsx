'use client';

import { useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#1e40af', '#3b82f6', '#6b7280', '#9ca3af', '#60a5fa', '#93c5fd', '#d1d5db'];

function formatMonth(isoDate: string): string {
  const d = new Date(isoDate);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

function monthKey(isoDate: string): string {
  const d = new Date(isoDate);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

type AppointmentForContinent = { start_at: string; continent: string | null };

export default function DashboardClient({
  totalAppointments,
  appointmentsThisMonth,
  totalPatients,
  statusCounts,
  diseaseCounts,
  appointmentsForContinent,
}: {
  totalAppointments: number;
  appointmentsThisMonth: number;
  totalPatients: number;
  statusCounts: Record<string, number>;
  diseaseCounts: Record<string, number>;
  appointmentsForContinent: AppointmentForContinent[];
}) {
  const { t } = useI18n();

  const byContinentByMonth = useMemo(() => {
    const monthOrder: string[] = [];
    const monthSet = new Set<string>();
    appointmentsForContinent.forEach((a) => {
      const key = monthKey(a.start_at);
      if (!monthSet.has(key)) {
        monthSet.add(key);
        monthOrder.push(key);
      }
    });
    monthOrder.sort();
    const continents = new Set<string>();
    appointmentsForContinent.forEach((a) => continents.add(a.continent ?? 'Unknown'));
    const continentList = Array.from(continents).sort();
    const byMonth: Record<string, Record<string, number>> = {};
    monthOrder.forEach((key) => {
      byMonth[key] = { month: formatMonth(key + '-01') };
      continentList.forEach((c) => { byMonth[key][c] = 0; });
    });
    appointmentsForContinent.forEach((a) => {
      const key = monthKey(a.start_at);
      const name = a.continent ?? 'Unknown';
      if (byMonth[key] && byMonth[key][name] !== undefined) byMonth[key][name] += 1;
    });
    return monthOrder.map((key) => byMonth[key]);
  }, [appointmentsForContinent]);

  const continentKeys = useMemo(() => {
    const set = new Set<string>();
    appointmentsForContinent.forEach((a) => set.add(a.continent ?? 'Unknown'));
    return Array.from(set).sort();
  }, [appointmentsForContinent]);

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name: t(`appointments.status_${name}` as 'appointments.status_scheduled'),
    value,
  }));

  const diseaseData = Object.entries(diseaseCounts).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('dashboard.title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.totalAppointments')}</p>
          <p className="text-2xl font-bold">{totalAppointments}</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.appointmentsThisMonth')}</p>
          <p className="text-2xl font-bold">{appointmentsThisMonth}</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.totalPatients')}</p>
          <p className="text-2xl font-bold">{totalPatients}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">{t('dashboard.byStatus')}</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">{t('common.noData')}</p>
          )}
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">{t('dashboard.byDisease')}</h2>
          {diseaseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={diseaseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">{t('common.noData')}</p>
          )}
        </div>
      </div>
      <div className="mt-8">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">{t('dashboard.byContinentByMonth')}</h2>
          {byContinentByMonth.length > 0 && continentKeys.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byContinentByMonth} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                {continentKeys.map((key, i) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={COLORS[i % COLORS.length]}
                    name={key}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">{t('common.noData')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
