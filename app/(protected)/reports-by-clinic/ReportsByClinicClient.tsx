'use client';

import { useState, useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type ClinicRow = { id: string; name: string };
type AppointmentRow = {
  id: string;
  clinic_id: string;
  start_at: string;
  disease_name: string | null;
  status: string;
};

const CHART_COLORS = ['#1e40af', '#3b82f6', '#6b7280', '#9ca3af'];

function dateKey(isoDate: string): string {
  return isoDate.slice(0, 10);
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTime(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export default function ReportsByClinicClient({
  initialClinics,
  initialAppointments,
}: {
  initialClinics: ClinicRow[];
  initialAppointments: AppointmentRow[];
}) {
  const [clinicId, setClinicId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const { t } = useI18n();

  const filtered = useMemo(() => {
    if (!clinicId) return [];
    let list = initialAppointments.filter((a) => a.clinic_id === clinicId);
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      list = list.filter((a) => new Date(a.start_at) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      list = list.filter((a) => new Date(a.start_at) <= to);
    }
    return list;
  }, [initialAppointments, clinicId, dateFrom, dateTo]);

  const totalInRange = filtered.length;

  const byStatus = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((a) => {
      const s = a.status ?? 'Unknown';
      map[s] = (map[s] ?? 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const byDisease = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((a) => {
      const d = a.disease_name ?? 'Unknown';
      map[d] = (map[d] ?? 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const byDay = useMemo(() => {
    const map: Record<string, AppointmentRow[]> = {};
    filtered.forEach((a) => {
      const key = dateKey(a.start_at);
      if (!map[key]) map[key] = [];
      map[key].push(a);
    });
    const keys = Object.keys(map).sort();
    return keys.map((key) => ({ date: key, label: formatDate(key + 'T12:00:00'), appointments: map[key]! }));
  }, [filtered]);

  const selectedClinicName = clinicId ? initialClinics.find((c) => c.id === clinicId)?.name ?? '' : '';

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('reportsByClinic.title')}</h1>

      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 flex flex-wrap gap-4 items-end">
        <div className="min-w-[200px]">
          <label className="block text-sm mb-1">{t('reportsByClinic.selectClinic')}</label>
          <select
            value={clinicId}
            onChange={(e) => setClinicId(e.target.value)}
            className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">—</option>
            {initialClinics.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">{t('reportsByClinic.startDate')}</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">{t('reportsByClinic.endDate')}</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </div>

      {!clinicId ? (
        <p className="text-gray-500 dark:text-gray-400">{t('reportsByClinic.noClinicSelected')}</p>
      ) : (
        <>
          {selectedClinicName && (
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              {t('reportsByClinic.dashboard')}: <strong>{selectedClinicName}</strong>
              {dateFrom || dateTo ? ` (${dateFrom || '…'} – ${dateTo || '…'})` : ''}
            </p>
          )}

          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">{t('reportsByClinic.dashboard')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('reportsByClinic.totalInRange')}</p>
                <p className="text-2xl font-bold">{totalInRange}</p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 md:col-span-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('reportsByClinic.byStatus')}</p>
                {byStatus.length > 0 ? (
                  <div className="flex flex-wrap gap-4">
                    {byStatus.map(({ name, value }) => (
                      <span key={name} className="text-lg">
                        <span className="font-medium">{name}</span>: {value}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">{t('common.noData')}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {byStatus.length > 0 && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                  <h3 className="font-medium mb-3">{t('reportsByClinic.byStatus')}</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={byStatus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill={CHART_COLORS[0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              {byDisease.length > 0 && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                  <h3 className="font-medium mb-3">{t('reportsByClinic.byDisease')}</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={byDisease}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill={CHART_COLORS[1]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">{t('reportsByClinic.dailyReports')}</h2>
            {byDay.length === 0 ? (
              <p className="text-gray-500">{t('common.noData')}</p>
            ) : (
              <div className="space-y-6">
                {byDay.map(({ date, label, appointments }) => (
                  <div key={date} className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                    <h3 className="font-medium mb-3">{label} ({appointments.length})</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border dark:border-gray-700 text-sm">
                        <thead>
                          <tr className="bg-gray-100 dark:bg-gray-700">
                            <th className="p-2 text-left">{t('reportsByClinic.time')}</th>
                            <th className="p-2 text-left">{t('reportsByClinic.disease')}</th>
                            <th className="p-2 text-left">{t('reportsByClinic.status')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointments
                            .sort((a, b) => a.start_at.localeCompare(b.start_at))
                            .map((a) => (
                              <tr key={a.id} className="border-t dark:border-gray-700">
                                <td className="p-2">{formatTime(a.start_at)}</td>
                                <td className="p-2">{a.disease_name ?? '—'}</td>
                                <td className="p-2">{a.status}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
