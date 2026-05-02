import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { DBTransaction, Transaction } from '@/types';
import LaporanClient from '@/components/LaporanClient';

export const dynamic = 'force-dynamic';

export default async function LaporanPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: raw } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });

  const transactions: Transaction[] = (raw as DBTransaction[] ?? []).map((t) => ({
    id: t.id,
    customerName: t.customer_name,
    phone: t.phone,
    psType: t.ps_type as Transaction['psType'],
    psName: t.ps_name,
    startTime: t.start_time,
    endTime: t.end_time,
    duration: t.duration,
    amount: t.amount,
    date: t.date,
    status: t.status as Transaction['status'],
  }));

  return <LaporanClient transactions={transactions} />;
}
