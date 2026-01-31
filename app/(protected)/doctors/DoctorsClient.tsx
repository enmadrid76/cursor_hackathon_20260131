'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/provider';
import { useI18n } from '@/lib/i18n';

type DoctorRow = { id: string; clinic_id: string; name: string; contact: string | null; specialty: string | null; clinics: { name: string } | null };
type ClinicOption = { id: string; name: string };

export default function DoctorsClient({
  initialDoctors,
  clinics,
}: {
  initialDoctors: DoctorRow[];
  clinics: ClinicOption[];
}) {
  const [doctors, setDoctors] = useState(initialDoctors);
  const [editing, setEditing] = useState<DoctorRow | null>(null);
  const [form, setForm] = useState({ name: '', contact: '', specialty: '', clinic_id: clinics[0]?.id ?? '' });
  const supabase = useSupabase();
  const router = useRouter();
  const { t } = useI18n();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, clinic_id: form.clinic_id || undefined };
    if (editing) {
      const { error } = await supabase.from('doctors').update(payload).eq('id', editing.id);
      if (!error) {
        setDoctors((prev) => prev.map((d) => (d.id === editing.id ? { ...d, ...payload, clinics: editing.clinics } : d)));
        setEditing(null);
        setForm({ name: '', contact: '', specialty: '', clinic_id: clinics[0]?.id ?? '' });
        router.refresh();
      }
    } else {
      const { data, error } = await supabase.from('doctors').insert(payload).select('*, clinics(name)').single();
      if (!error && data) {
        setDoctors((prev) => [...prev, data]);
        setForm({ name: '', contact: '', specialty: '', clinic_id: clinics[0]?.id ?? '' });
        router.refresh();
      }
    }
  }

  function startEdit(d: DoctorRow) {
    setEditing(d);
    setForm({
      name: d.name,
      contact: d.contact ?? '',
      specialty: d.specialty ?? '',
      clinic_id: d.clinic_id,
    });
  }

  async function handleDelete(id: string) {
    if (!confirm(t('common.delete') + '?')) return;
    const { error } = await supabase.from('doctors').delete().eq('id', id);
    if (!error) {
      setDoctors((prev) => prev.filter((d) => d.id !== id));
      setEditing(null);
      router.refresh();
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('doctors.title')}</h1>
      <form onSubmit={handleSave} className="mb-6 p-4 bg-white dark:bg-gray-800 rounded border dark:border-gray-700 space-y-3 max-w-md">
        <input
          placeholder={t('doctors.name')}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
          className="w-full px-3 py-2 border rounded dark:bg-gray-700"
        />
        <input
          placeholder={t('doctors.contact')}
          value={form.contact}
          onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
          className="w-full px-3 py-2 border rounded dark:bg-gray-700"
        />
        <input
          placeholder={t('doctors.specialty')}
          value={form.specialty}
          onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
          className="w-full px-3 py-2 border rounded dark:bg-gray-700"
        />
        <select
          value={form.clinic_id}
          onChange={(e) => setForm((f) => ({ ...f, clinic_id: e.target.value }))}
          className="w-full px-3 py-2 border rounded dark:bg-gray-700"
        >
          {clinics.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
            {editing ? t('common.save') : t('common.add')}
          </button>
          {editing && (
            <button type="button" onClick={() => { setEditing(null); setForm({ name: '', contact: '', specialty: '', clinic_id: clinics[0]?.id ?? '' }); }} className="px-4 py-2 border rounded">
              {t('common.cancel')}
            </button>
          )}
        </div>
      </form>
      <div className="overflow-x-auto">
        <table className="w-full border dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="p-2 text-left">{t('doctors.name')}</th>
              <th className="p-2 text-left">{t('doctors.contact')}</th>
              <th className="p-2 text-left">{t('doctors.specialty')}</th>
              <th className="p-2 text-left">{t('doctors.clinic')}</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((d) => (
              <tr key={d.id} className="border-t dark:border-gray-700">
                <td className="p-2">{d.name}</td>
                <td className="p-2">{d.contact ?? '-'}</td>
                <td className="p-2">{d.specialty ?? '-'}</td>
                <td className="p-2">{d.clinics?.name ?? '-'}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => startEdit(d)} className="text-blue-600">{t('common.edit')}</button>
                  <button onClick={() => handleDelete(d.id)} className="text-red-600">{t('common.delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {doctors.length === 0 && <p className="p-4 text-gray-500">{t('common.noData')}</p>}
      </div>
    </div>
  );
}
