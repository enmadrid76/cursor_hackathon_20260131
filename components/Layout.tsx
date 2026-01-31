'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/supabase/provider';
import { useI18n } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useSupabase();
  const { t, locale, setLocale } = useI18n();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const nav = [
    { href: '/dashboard', label: t('nav.dashboard') },
    { href: '/clinics', label: t('nav.clinics') },
    { href: '/doctors', label: t('nav.doctors') },
    { href: '/patients', label: t('nav.patients') },
    { href: '/appointments', label: t('nav.appointments') },
    { href: '/reports', label: t('nav.reports') },
    { href: '/reports-by-clinic', label: t('nav.reportsByClinic') },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b dark:border-gray-700 flex items-center justify-between px-4 py-3">
        <nav className="flex gap-4">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={pathname === href ? 'font-semibold text-blue-600' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600'}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
            aria-label="Language"
          >
            <option value="en">{t('language.en')}</option>
            <option value="fr">{t('language.fr')}</option>
            <option value="es">{t('language.es')}</option>
          </select>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-red-600"
          >
            {t('nav.logout')}
          </button>
        </div>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
