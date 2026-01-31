'use client';

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import en from '@/locales/en.json';
import fr from '@/locales/fr.json';
import es from '@/locales/es.json';

export type Locale = 'en' | 'fr' | 'es';

const LOCALE_STORAGE_KEY = 'mederp-locale';

const translations: Record<Locale, Record<string, unknown>> = {
  en: en as Record<string, unknown>,
  fr: fr as Record<string, unknown>,
  es: es as Record<string, unknown>,
};

function getNested(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === 'string' ? current : undefined;
}

type I18nContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextType | null>(null);

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
  if (stored && (stored === 'en' || stored === 'fr' || stored === 'es')) return stored;
  const lang = navigator.language?.toLowerCase();
  if (lang?.startsWith('fr')) return 'fr';
  if (lang?.startsWith('es')) return 'es';
  return 'en';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(getInitialLocale());
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
  }, []);

  const t = useCallback(
    (key: string): string => {
      const obj = translations[locale] as Record<string, unknown>;
      const value = getNested(obj, key);
      return value ?? key;
    },
    [locale]
  );

  if (!mounted) return <>{children}</>;

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
