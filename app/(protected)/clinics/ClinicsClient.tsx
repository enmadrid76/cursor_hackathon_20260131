'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/provider';
import { useI18n } from '@/lib/i18n';
import type { Clinic } from '@/types/database';

export default function ClinicsClient({ initialClinics }: { initialClinics: Clinic[] }) {
  const [clinics, setClinics] = useState(initialClinics);
  const [editing, setEditing] = useState<Clinic | null>(null);
  const [form, setForm] = useState({ name: '', address: '', contact: '', timezone: 'UTC', is_active: true });
  const supabase = useSupabase();
  const router = useRouter();
  const { t } = useI18n();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      const { error } = await supabase.from('clinics').update(form).eq('id', editing.id);
      if (!error) {
        setClinics((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...form } : c)));
        setEditing(null);
        setForm({ name: '', address: '', contact: '', timezone: 'UTC', is_active: true });
        router.refresh();
      }
    } else {
      const { data, error } = await supabase.from('clinics').insert(form).select().single();
      if (!error && data) {
        setClinics((prev) => [...prev, data]);
        setForm({ name: '', address: '', contact: '', timezone: 'UTC', is_active: true });
        router.refresh();
      }
    }
  }

  function startEdit(c: Clinic) {
    setEditing(c);
    setForm({
      name: c.name,
      address: c.address ?? '',
      contact: c.contact ?? '',
      timezone: c.timezone,
      is_active: c.is_active,
    });
  }

  async function handleDelete(id: string) {
    if (!confirm(t('common.delete') + '?')) return;
    const { error } = await supabase.from('clinics').delete().eq('id', id);
    if (!error) {
      setClinics((prev) => prev.filter((c) => c.id !== id));
      setEditing(null);
      router.refresh();
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('clinics.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your clinic locations</p>
      </div>
      <form onSubmit={handleSave} className="mb-8 card p-6 space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('clinics.name')}</label>
          <input
            placeholder={t('clinics.name')}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('clinics.address')}</label>
          <input
            placeholder={t('clinics.address')}
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('clinics.contact')}</label>
          <input
            placeholder={t('clinics.contact')}
            value={form.contact}
            onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('clinics.timezone')}</label>
          <input
            placeholder={t('clinics.timezone')}
            value={form.timezone}
            onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
            className="input-field"
          />
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          {t('clinics.active')}
        </label>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary">
            {editing ? t('common.save') : t('common.add')}
          </button>
          {editing && (
            <button type="button" onClick={() => { setEditing(null); setForm({ name: '', address: '', contact: '', timezone: 'UTC', is_active: true }); }} className="btn-secondary">
              {t('common.cancel')}
            </button>
          )}
        </div>
      </form>
      <div className="table-container">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{t('clinics.name')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{t('clinics.address')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{t('clinics.contact')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{t('clinics.timezone')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{t('clinics.active')}</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {clinics.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{c.name}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.address ?? '-'}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.contact ?? '-'}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.timezone}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${c.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'}`}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => startEdit(c)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium mr-3">{t('common.edit')}</button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium">{t('common.delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clinics.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="mt-2 text-gray-500 dark:text-gray-400">{t('common.noData')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
