import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Layout from '@/components/Layout';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return <Layout>{children}</Layout>;
}
