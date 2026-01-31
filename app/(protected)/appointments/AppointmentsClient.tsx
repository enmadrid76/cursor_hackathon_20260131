'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/provider';
import { useI18n } from '@/lib/i18n';

type AppointmentRow = {
  id: string;
  clinic_id: string;
  doctor_id: string;
  patient_id: string;
  start_at: string;
  duration_minutes: number;
  status: string;
  disease_name: string | null;
  virality_rate: number | null;
  patient_age_at_visit: number | null;
  avg_monthly_city_temp: number | null;
  country: string | null;
  continent: string | null;
  notes: string | null;
  clinics: { name: string } | null;
  doctors: { name: string } | null;
  patients: { name: string } | null;
};
type ClinicOption = { id: string; name: string };
type DoctorOption = { id: string; name: string; clinic_id: string };
type PatientOption = { id: string; name: string };

const STATUSES = ['scheduled', 'completed', 'cancelled', 'no_show'] as const;

export default function AppointmentsClient({
  initialAppointments,
  clinics,
  doctors,
  patients,
}: {
  initialAppointments: AppointmentRow[];
  clinics: ClinicOption[];
  doctors: DoctorOption[];
  patients: PatientOption[];
}) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [editing, setEditing] = useState<AppointmentRow | null>(null);
  const [form, setForm] = useState({
    clinic_id: clinics[0]?.id ?? '',
    doctor_id: doctors[0]?.id ?? '',
    patient_id: patients[0]?.id ?? '',
    start_at: new Date().toISOString().slice(0, 16),
    duration_minutes: 30,
    status: 'scheduled' as const,
    disease_name: '',
    virality_rate: '' as number | '',
    patient_age_at_visit: '' as number | '',
    avg_monthly_city_temp: '' as number | '',
    country: '',
    continent: '',
    notes: '',
  });
  const supabase = useSupabase();
  const router = useRouter();
  const { t } = useI18n();

  const doctorsForClinic = form.clinic_id
    ? doctors.filter((d) => d.clinic_id === form.clinic_id)
    : doctors;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      clinic_id: form.clinic_id,
      doctor_id: form.doctor_id,
      patient_id: form.patient_id,
      start_at: new Date(form.start_at).toISOString(),
      duration_minutes: form.duration_minutes,
      status: form.status,
      disease_name: form.disease_name || null,
      virality_rate: form.virality_rate === '' ? null : Number(form.virality_rate),
      patient_age_at_visit: form.patient_age_at_visit === '' ? null : Number(form.patient_age_at_visit),
      avg_monthly_city_temp: form.avg_monthly_city_temp === '' ? null : Number(form.avg_monthly_city_temp),
      country: form.country || null,
      continent: form.continent || null,
      notes: form.notes || null,
    };
    if (editing) {
      const { error } = await supabase.from('appointments').update(payload).eq('id', editing.id);
      if (!error) {
        setAppointments((prev) => prev.map((a) => (a.id === editing.id ? { ...a, ...payload } : a)));
        setEditing(null);
        resetForm();
        router.refresh();
      }
    } else {
      const { data, error } = await supabase.from('appointments').insert(payload).select('*, clinics(name), doctors(name), patients(name)').single();
      if (!error && data) {
        setAppointments((prev) => [data, ...prev]);
        resetForm();
        router.refresh();
      }
    }
  }

  function resetForm() {
    setForm({
      clinic_id: clinics[0]?.id ?? '',
      doctor_id: doctors[0]?.id ?? '',
      patient_id: patients[0]?.id ?? '',
      start_at: new Date().toISOString().slice(0, 16),
      duration_minutes: 30,
      status: 'scheduled',
      disease_name: '',
      virality_rate: '',
      patient_age_at_visit: '',
      avg_monthly_city_temp: '',
      country: '',
      continent: '',
      notes: '',
    });
  }

  function startEdit(a: AppointmentRow) {
    setEditing(a);
    setForm({
      clinic_id: (a as { clinic_id?: string }).clinic_id ?? clinics[0]?.id ?? '',
      doctor_id: (a as { doctor_id?: string }).doctor_id ?? doctors[0]?.id ?? '',
      patient_id: (a as { patient_id?: string }).patient_id ?? patients[0]?.id ?? '',
      start_at: a.start_at.slice(0, 16),
      duration_minutes: a.duration_minutes,
      status: a.status as typeof form.status,
      disease_name: a.disease_name ?? '',
      virality_rate: a.virality_rate ?? '',
      patient_age_at_visit: a.patient_age_at_visit ?? '',
      avg_monthly_city_temp: a.avg_monthly_city_temp ?? '',
      country: a.country ?? '',
      continent: a.continent ?? '',
      notes: a.notes ?? '',
    });
  }

  async function handleDelete(id: string) {
    if (!confirm(t('common.delete') + '?')) return;
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (!error) {
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      setEditing(null);
      router.refresh();
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('appointments.title')}</h1>
      <form onSubmit={handleSave} className="mb-6 p-4 bg-white dark:bg-gray-800 rounded border dark:border-gray-700 space-y-3 max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-3">
        <select
          value={form.clinic_id}
          onChange={(e) => setForm((f) => ({ ...f, clinic_id: e.target.value, doctor_id: doctors.find((d) => d.clinic_id === e.target.value)?.id ?? '' }))}
          required
          className="w-full px-3 py-2 border rounded dark:bg-gray-700"
        >
          {clinics.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={form.doctor_id}
          onChange={(e) => setForm((f) => ({ ...f, doctor_id: e.target.value }))}
          required
          className="w-full px-3 py-2 border rounded dark:bg-gray-700"
        >
          {doctorsForClinic.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <select
          value={form.patient_id}
          onChange={(e) => setForm((f) => ({ ...f, patient_id: e.target.value }))}
          required
          className="w-full px-3 py-2 border rounded dark:bg-gray-700"
        >
          {patients.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <input
          type="datetime-local"
          value={form.start_at}
          onChange={(e) => setForm((f) => ({ ...f, start_at: e.target.value }))}
          required
          className="w-full px-3 py-2 border rounded dark:bg-gray-700"
        />
        <input
          type="number"
          placeholder={t('appointments.duration')}
          value={form.duration_minutes}
          onChange={(e) => setForm((f) => ({ ...f, duration_minutes: Number(e.target.value) || 30 }))}
          min={1}
          className="w-full px-3 py-2 border rounded dark:bg-gray-700"
        />
        <select
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as typeof form.status }))}
          className="w-full px-3 py-2 border rounded dark:bg-gray-700"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{t(`appointments.status_${s}` as 'appointments.status_scheduled')}</option>
          ))}
        </select>
        <input
          placeholder={t('appointments.diseaseName')}
          value={form.disease_name}
          onChange={(e) => setForm((f) => ({ ...f, disease_name: e.target.value }))}
          className="w-full px-3 py-2 border rounded dark:bg-gray-700"
        />
        <input
          type="number"
          min={0}
          max={10}
          step={0.1}
          placeholder={t('appointments.viralityRate')}
          value={form.virality_rate}
          onChange={(e) => setForm((f) => ({ ...f, virality_rate: e.target.value === '' ? '' : Number(e.target.value) }))}
          className="w-full px-3 py-2 border rounded dark:bg-gray-700"
        />
        <input
          type="number"
          min={0}
          placeholder={t('appointments.patientAgeAtVisit')}
          value={form.patient_age_at_visit}
          onChange={(e) => setForm((f) => ({ ...f, patient_age_at_visit: e.target.value === '' ? '' : Number(e.target.value) }))}
          className="w-full px-3 py-2 border rounded dark:bg-gray-700"
        />
        <input
          type="number"
          step={0.1}
          placeholder={t('appointments.avgMonthlyCityTemp')}
          value={form.avg_monthly_city_temp}
          onChange={(e) => setForm((f) => ({ ...f, avg_monthly_city_temp: e.target.value === '' ? '' : Number(e.target.value) }))}
          className="w-full px-3 py-2 border rounded dark:bg-gray-700"
        />
        <input
          placeholder={t('appointments.country')}
          value={form.country}
          onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
          className="w-full px-3 py-2 border rounded dark:bg-gray-700"
        />
        <input
          placeholder={t('appointments.continent')}
          value={form.continent}
          onChange={(e) => setForm((f) => ({ ...f, continent: e.target.value }))}
          className="w-full px-3 py-2 border rounded dark:bg-gray-700"
        />
        <div className="md:col-span-2">
          <input
            placeholder={t('appointments.notes')}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className="w-full px-3 py-2 border rounded dark:bg-gray-700"
          />
        </div>
        <div className="flex gap-2 md:col-span-2">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
            {editing ? t('common.save') : t('common.add')}
          </button>
          {editing && (
            <button type="button" onClick={() => { setEditing(null); resetForm(); }} className="px-4 py-2 border rounded">
              {t('common.cancel')}
            </button>
          )}
        </div>
      </form>
      <div className="overflow-x-auto">
        <table className="w-full border dark:border-gray-700 text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="p-2 text-left">{t('appointments.start')}</th>
              <th className="p-2 text-left">{t('appointments.doctor')}</th>
              <th className="p-2 text-left">{t('appointments.patient')}</th>
              <th className="p-2 text-left">{t('appointments.diseaseName')}</th>
              <th className="p-2 text-left">{t('appointments.status')}</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id} className="border-t dark:border-gray-700">
                <td className="p-2">{new Date(a.start_at).toLocaleString()}</td>
                <td className="p-2">{a.doctors?.name ?? '-'}</td>
                <td className="p-2">{a.patients?.name ?? '-'}</td>
                <td className="p-2">{a.disease_name ?? '-'}</td>
                <td className="p-2">{t(`appointments.status_${a.status}` as 'appointments.status_scheduled')}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => startEdit(a)} className="text-blue-600">{t('common.edit')}</button>
                  <button onClick={() => handleDelete(a.id)} className="text-red-600">{t('common.delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {appointments.length === 0 && <p className="p-4 text-gray-500">{t('common.noData')}</p>}
      </div>
    </div>
  );
}
