'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/provider';
import { useI18n } from '@/lib/i18n';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = useSupabase();
  const router = useRouter();
  const { t } = useI18n();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }
    if (password.length < 6) {
      setError(t('auth.signUpError'));
      return;
    }
    setLoading(true);
    try {
      const { data, error: err } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (err) {
        const msg = err.message || t('auth.signUpError');
        const isInvalidKey = /invalid.*api.*key|api key|jwt/i.test(msg);
        setError(isInvalidKey ? t('auth.invalidApiKey') : msg);
        return;
      }
      const identities = data?.user?.identities;
      if (data?.user && Array.isArray(identities) && identities.length === 0) {
        setError(t('auth.emailAlreadyRegistered'));
        return;
      }
      router.push('/login?signup=1');
      router.refresh();
    } catch (e) {
      setLoading(false);
      const message = e instanceof Error ? e.message : t('auth.signUpError');
      const isNetworkError = message === 'Failed to fetch' || message.includes('NetworkError') || message.includes('Load failed');
      const isInvalidKey = /invalid.*api.*key|api key|jwt/i.test(message);
      setError(isNetworkError ? t('auth.networkError') : isInvalidKey ? t('auth.invalidApiKey') : message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">{t('auth.signup')}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('auth.confirmPassword')}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? t('common.loading') : t('auth.signUp')}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <Link href="/login" className="text-blue-600 hover:underline">
            {t('auth.alreadyHaveAccount')}
          </Link>
        </p>
      </div>
    </div>
  );
}
