'use client';

import { useState, useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type AppointmentRow = {
  id: string;
  start_at: string;
  disease_name: string | null;
  virality_rate: number | null;
  patient_age_at_visit: number | null;
  avg_monthly_city_temp: number | null;
  country: string | null;
  continent: string | null;
  status: string;
};

export default function ReportsClient({ initialAppointments }: { initialAppointments: AppointmentRow[] }) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const { t } = useI18n();

  const filtered = useMemo(() => {
    let list = initialAppointments;
    if (dateFrom) {
      const from = new Date(dateFrom);
      list = list.filter((a) => new Date(a.start_at) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter((a) => new Date(a.start_at) <= to);
    }
    return list;
  }, [initialAppointments, dateFrom, dateTo]);

  const byDisease = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((a) => {
      const name = a.disease_name ?? 'Unknown';
      map[name] = (map[name] ?? 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const byContinent = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((a) => {
      const name = a.continent ?? 'Unknown';
      map[name] = (map[name] ?? 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const byCountry = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((a) => {
      const name = a.country ?? 'Unknown';
      map[name] = (map[name] ?? 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  function exportCsv() {
    const headers = ['start_at', 'disease_name', 'virality_rate', 'patient_age_at_visit', 'avg_monthly_city_temp', 'country', 'continent', 'status'];
    const rows = filtered.map((a) =>
      [a.start_at, a.disease_name ?? '', a.virality_rate ?? '', a.patient_age_at_visit ?? '', a.avg_monthly_city_temp ?? '', a.country ?? '', a.continent ?? '', a.status].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mederp-report-${dateFrom || 'all'}-${dateTo || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('reports.title')}</h1>
      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm mb-1">{t('reports.dateRange')} (from)</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 border rounded dark:bg-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 border rounded dark:bg-gray-700"
          />
        </div>
        <button onClick={exportCsv} className="px-4 py-2 bg-blue-600 text-white rounded">
          {t('reports.exportCsv')}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">{t('reports.byDisease')}</h2>
          {byDisease.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byDisease}>
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
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">{t('reports.byGeography')} (continent)</h2>
          {byContinent.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byContinent}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">{t('common.noData')}</p>
          )}
        </div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">{t('reports.byGeography')} (country)</h2>
        {byCountry.length > 0 ? (
          <table className="w-full border dark:border-gray-700">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="p-2 text-left">Country</th>
                <th className="p-2 text-left">Count</th>
              </tr>
            </thead>
            <tbody>
              {byCountry.map(({ name, value }) => (
                <tr key={name} className="border-t dark:border-gray-700">
                  <td className="p-2">{name}</td>
                  <td className="p-2">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">{t('common.noData')}</p>
        )}
      </div>
    </div>
  );
}
