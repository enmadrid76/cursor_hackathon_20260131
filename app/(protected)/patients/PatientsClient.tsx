'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/provider';
import { useI18n } from '@/lib/i18n';
import type { Patient } from '@/types/database';

export default function PatientsClient({ initialPatients }: { initialPatients: Patient[] }) {
  const [patients, setPatients] = useState(initialPatients);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [form, setForm] = useState({ name: '', contact: '', date_of_birth: '', medical_id: '' });
  const supabase = useSupabase();
  const router = useRouter();
  const { t } = useI18n();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      contact: form.contact || null,
      date_of_birth: form.date_of_birth || null,
      medical_id: form.medical_id || null,
    };
    if (editing) {
      const { error } = await supabase.from('patients').update(payload).eq('id', editing.id);
      if (!error) {
        setPatients((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...payload } : p)));
        setEditing(null);
        setForm({ name: '', contact: '', date_of_birth: '', medical_id: '' });
        router.refresh();
      }
    } else {
      const { data, error } = await supabase.from('patients').insert(payload).select().single();
      if (!error && data) {
        setPatients((prev) => [...prev, data]);
        setForm({ name: '', contact: '', date_of_birth: '', medical_id: '' });
        router.refresh();
      }
    }
  }

  function startEdit(p: Patient) {
    setEditing(p);
    setForm({
      name: p.name,
      contact: p.contact ?? '',
      date_of_birth: p.date_of_birth ?? '',
      medical_id: p.medical_id ?? '',
    });
  }

  async function handleDelete(id: string) {
    if (!confirm(t('common.delete') + '?')) return;
    const { error } = await supabase.from('patients').delete().eq('id', id);
    if (!error) {
      setPatients((prev) => prev.filter((p) => p.id !== id));
      setEditing(null);
      router.refresh();
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('patients.title')}</h1>
      <form onSubmit={handleSave} className="mb-6 p-4 bg-white dark:bg-gray-800 rounded border dark:border-gray-700 space-y-3 max-w-md">
        <input
          placeholder={t('patients.name')}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
          className="w-full px-3 py-2 border rounded dark:bg-gray-700"
        />
        <input
          placeholder={t('patients.contact')}
          value={form.contact}
          onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
          className="w-full px-3 py-2 border rounded dark:bg-gray-700"
        />
        <input
          type="date"
          placeholder={t('patients.dateOfBirth')}
          value={form.date_of_birth}
          onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))}
          className="w-full px-3 py-2 border rounded dark:bg-gray-700"
        />
        <input
          placeholder={t('patients.medicalId')}
          value={form.medical_id}
          onChange={(e) => setForm((f) => ({ ...f, medical_id: e.target.value }))}
          className="w-full px-3 py-2 border rounded dark:bg-gray-700"
        />
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
            {editing ? t('common.save') : t('common.add')}
          </button>
          {editing && (
            <button type="button" onClick={() => { setEditing(null); setForm({ name: '', contact: '', date_of_birth: '', medical_id: '' }); }} className="px-4 py-2 border rounded">
              {t('common.cancel')}
            </button>
          )}
        </div>
      </form>
      <div className="overflow-x-auto">
        <table className="w-full border dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="p-2 text-left">{t('patients.name')}</th>
              <th className="p-2 text-left">{t('patients.contact')}</th>
              <th className="p-2 text-left">{t('patients.dateOfBirth')}</th>
              <th className="p-2 text-left">{t('patients.medicalId')}</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id} className="border-t dark:border-gray-700">
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.contact ?? '-'}</td>
                <td className="p-2">{p.date_of_birth ?? '-'}</td>
                <td className="p-2">{p.medical_id ?? '-'}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => startEdit(p)} className="text-blue-600">{t('common.edit')}</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600">{t('common.delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {patients.length === 0 && <p className="p-4 text-gray-500">{t('common.noData')}</p>}
      </div>
    </div>
  );
}
