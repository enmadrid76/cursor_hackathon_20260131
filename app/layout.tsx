import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n';
import { SupabaseProvider } from '@/lib/supabase/provider';

export const metadata: Metadata = {
  title: 'MedERP – Medical ERP MVP',
  description: 'Medical ERP: clinics, doctors, patients, appointments, analytics',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SupabaseProvider>
          <I18nProvider>{children}</I18nProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
