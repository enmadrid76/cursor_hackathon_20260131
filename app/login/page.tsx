'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/provider';
import { useI18n } from '@/lib/i18n';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = useSupabase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();

  useEffect(() => {
    if (searchParams.get('signup') === '1') {
      setInfo(t('auth.signupSuccess'));
    }
  }, [searchParams, t]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (err) {
        const msg = err.message;
        const isNetworkError = msg === 'Failed to fetch' || msg.includes('NetworkError') || msg.includes('Load failed');
        const isInvalidKey = /invalid.*api.*key|api key|jwt/i.test(msg);
        const isInvalidCredentials = /invalid.*(login )?credentials?|invalid email or password/i.test(msg);
        setError(
          isNetworkError
            ? t('auth.networkError')
            : isInvalidKey
              ? t('auth.invalidApiKey')
              : isInvalidCredentials
                ? t('auth.confirmEmailFirst')
                : t('auth.error')
        );
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch (e) {
      setLoading(false);
      const message = e instanceof Error ? e.message : t('auth.error');
      const isNetworkError = message === 'Failed to fetch' || message.includes('NetworkError') || message.includes('Load failed');
      const isInvalidKey = /invalid.*api.*key|api key|jwt/i.test(message);
      const isInvalidCredentials = /invalid.*(login )?credentials?|invalid email or password/i.test(message);
      setError(
        isNetworkError
          ? t('auth.networkError')
          : isInvalidKey
            ? t('auth.invalidApiKey')
            : isInvalidCredentials
              ? t('auth.confirmEmailFirst')
              : message
      );
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">MedERP</h1>
          <p className="text-gray-600 dark:text-gray-400">Medical practice management</p>
        </div>
        <div className="card p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">{t('auth.login')}</h2>
          {info && (
            <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
              <p className="text-blue-800 dark:text-blue-200 text-sm font-medium">{info}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('auth.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('auth.password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? t('common.loading') : t('auth.signIn')}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <Link href="/signup" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
              {t('auth.noAccount')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
