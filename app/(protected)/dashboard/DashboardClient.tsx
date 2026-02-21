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
    type MonthRow = { month: string; [key: string]: string | number };
    const byMonth: Record<string, MonthRow> = {};
    monthOrder.forEach((key) => {
      byMonth[key] = { month: formatMonth(key + '-01') };
      continentList.forEach((c) => { byMonth[key][c] = 0; });
    });
    appointmentsForContinent.forEach((a) => {
      const key = monthKey(a.start_at);
      const name = a.continent ?? 'Unknown';
      if (byMonth[key] && typeof byMonth[key][name] === 'number') {
        (byMonth[key][name] as number) += 1;
      }
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('dashboard.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400">Overview of your medical practice</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{t('dashboard.totalAppointments')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalAppointments}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="card p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{t('dashboard.appointmentsThisMonth')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{appointmentsThisMonth}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="card p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{t('dashboard.totalPatients')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalPatients}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.byStatus')}</h2>
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
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.byDisease')}</h2>
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
      <div className="mt-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.byContinentByMonth')}</h2>
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
