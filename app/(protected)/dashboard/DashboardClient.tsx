'use client';

import { useI18n } from '@/lib/i18n';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function DashboardClient({
  totalAppointments,
  appointmentsThisMonth,
  totalPatients,
  statusCounts,
  diseaseCounts,
}: {
  totalAppointments: number;
  appointmentsThisMonth: number;
  totalPatients: number;
  statusCounts: Record<string, number>;
  diseaseCounts: Record<string, number>;
}) {
  const { t } = useI18n();

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
    </div>
  );
}
