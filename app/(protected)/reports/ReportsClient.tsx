'use client';

import { useState, useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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

const CHART_COLORS = [
  '#1e40af', '#3b82f6', '#60a5fa', '#93c5fd',
  '#374151', '#6b7280', '#9ca3af', '#d1d5db',
];

function formatMonth(isoDate: string): string {
  const d = new Date(isoDate);
  const y = d.getFullYear();
  const m = d.getMonth();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[m]} ${y}`;
}

function monthKey(isoDate: string): string {
  const d = new Date(isoDate);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

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

  const byDiseaseByMonth = useMemo(() => {
    const monthOrder: string[] = [];
    const monthSet = new Set<string>();
    filtered.forEach((a) => {
      const key = monthKey(a.start_at);
      if (!monthSet.has(key)) {
        monthSet.add(key);
        monthOrder.push(key);
      }
    });
    monthOrder.sort();
    const diseases = new Set<string>();
    filtered.forEach((a) => diseases.add(a.disease_name ?? 'Unknown'));
    const diseaseList = Array.from(diseases).sort();
    type MonthRow = { month: string } & Record<string, number>;
    const byMonth: Record<string, MonthRow> = {};
    monthOrder.forEach((key) => {
      byMonth[key] = { month: formatMonth(key + '-01') };
      diseaseList.forEach((d) => { byMonth[key][d] = 0; });
    });
    filtered.forEach((a) => {
      const key = monthKey(a.start_at);
      const name = a.disease_name ?? 'Unknown';
      if (byMonth[key] && byMonth[key][name] !== undefined) byMonth[key][name] += 1;
    });
    return monthOrder.map((key) => byMonth[key]);
  }, [filtered]);

  const byContinentByMonth = useMemo(() => {
    const monthOrder: string[] = [];
    const monthSet = new Set<string>();
    filtered.forEach((a) => {
      const key = monthKey(a.start_at);
      if (!monthSet.has(key)) {
        monthSet.add(key);
        monthOrder.push(key);
      }
    });
    monthOrder.sort();
    const continents = new Set<string>();
    filtered.forEach((a) => continents.add(a.continent ?? 'Unknown'));
    const continentList = Array.from(continents).sort();
    type MonthRow = { month: string } & Record<string, number>;
    const byMonth: Record<string, MonthRow> = {};
    monthOrder.forEach((key) => {
      byMonth[key] = { month: formatMonth(key + '-01') };
      continentList.forEach((c) => { byMonth[key][c] = 0; });
    });
    filtered.forEach((a) => {
      const key = monthKey(a.start_at);
      const name = a.continent ?? 'Unknown';
      if (byMonth[key] && byMonth[key][name] !== undefined) byMonth[key][name] += 1;
    });
    return monthOrder.map((key) => byMonth[key]);
  }, [filtered]);

  const diseaseKeys = useMemo(() => {
    const set = new Set<string>();
    filtered.forEach((a) => set.add(a.disease_name ?? 'Unknown'));
    return Array.from(set).sort();
  }, [filtered]);

  const continentKeys = useMemo(() => {
    const set = new Set<string>();
    filtered.forEach((a) => set.add(a.continent ?? 'Unknown'));
    return Array.from(set).sort();
  }, [filtered]);

  const TOP_COUNTRY_COUNT = 5;

  const { byCountryByMonth, countryKeys: countryChartKeys } = useMemo(() => {
    const monthOrder: string[] = [];
    const monthSet = new Set<string>();
    filtered.forEach((a) => {
      const key = monthKey(a.start_at);
      if (!monthSet.has(key)) {
        monthSet.add(key);
        monthOrder.push(key);
      }
    });
    monthOrder.sort();
    const countryTotals: Record<string, number> = {};
    filtered.forEach((a) => {
      const name = a.country ?? 'Unknown';
      countryTotals[name] = (countryTotals[name] ?? 0) + 1;
    });
    const sortedCountries = Object.entries(countryTotals)
      .sort(([, a], [, b]) => b - a)
      .map(([c]) => c);
    const top5 = sortedCountries.slice(0, TOP_COUNTRY_COUNT);
    const otherLabel = 'Other';
    const countryKeys = [...top5, otherLabel];
    type MonthRow = { month: string } & Record<string, number>;
    const byMonth: Record<string, MonthRow> = {};
    monthOrder.forEach((key) => {
      byMonth[key] = { month: formatMonth(key + '-01') };
      countryKeys.forEach((c) => { byMonth[key][c] = 0; });
    });
    filtered.forEach((a) => {
      const key = monthKey(a.start_at);
      const name = a.country ?? 'Unknown';
      const barKey = top5.includes(name) ? name : otherLabel;
      if (byMonth[key] && byMonth[key][barKey] !== undefined) byMonth[key][barKey] += 1;
    });
    const data = monthOrder.map((key) => byMonth[key]);
    return { byCountryByMonth: data, countryKeys };
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

  function renderStackedBars(keys: string[], stackId: string) {
    return keys.map((key, i) => (
      <Bar key={key} dataKey={key} stackId={stackId} fill={CHART_COLORS[i % CHART_COLORS.length]} name={key} />
    ));
  }

  function renderGroupedBars(keys: string[], otherLabel?: string) {
    return keys.map((key, i) => (
      <Bar
        key={key}
        dataKey={key}
        fill={CHART_COLORS[i % CHART_COLORS.length]}
        name={key === 'Other' && otherLabel != null ? otherLabel : key}
      />
    ));
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
      <div className="grid grid-cols-1 gap-8 mb-8">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">{t('reports.byDiseaseByMonth')}</h2>
          {byDiseaseByMonth.length > 0 && diseaseKeys.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byDiseaseByMonth} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                {renderStackedBars(diseaseKeys, 'disease')}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">{t('common.noData')}</p>
          )}
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">{t('reports.byContinentByMonth')}</h2>
          {byContinentByMonth.length > 0 && continentKeys.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byContinentByMonth} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                {renderGroupedBars(continentKeys)}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">{t('common.noData')}</p>
          )}
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">{t('reports.byCountryByMonth')}</h2>
          {byCountryByMonth.length > 0 && countryChartKeys.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={byCountryByMonth}
                margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                barGap={0}
                barCategoryGap="15%"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                {renderGroupedBars(countryChartKeys, t('reports.other'))}
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
