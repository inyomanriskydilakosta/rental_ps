import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { DBCustomer, Customer } from '@/types';
import DataPembeliClient from '@/components/DataPembeliClient';

export const dynamic = 'force-dynamic';

export default async function DataPembeliPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: raw } = await supabase
    .from('customers')
    .select('*')
    .order('id');

  const customers: Customer[] = (raw as DBCustomer[] ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    memberId: c.member_id ?? undefined,
    totalSessions: c.total_sessions,
    totalSpent: c.total_spent,
    joinDate: c.join_date,
  }));

  return <DataPembeliClient customers={customers} />;
}
