import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { DBCustomer, DBTransaction, Customer } from '@/types';
import DataPembeliClient from '@/components/DataPembeliClient';

export const dynamic = 'force-dynamic';

export default async function DataPembeliPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch customers
  const { data: rawCustomers } = await supabase
    .from('customers')
    .select('*')
    .order('id');

  // Fetch all transactions to calculate stats on the fly
  const { data: rawTransactions } = await supabase
    .from('transactions')
    .select('customer_name, phone, amount');

  const customers: Customer[] = (rawCustomers as DBCustomer[] ?? []).map((c) => {
    // Filter transactions matching this customer
    const matchTxs = (rawTransactions as DBTransaction[] ?? []).filter((t) => {
      if (c.member_id && t.phone === c.member_id) return true;
      if (c.phone && t.phone === c.phone) return true;
      if (t.customer_name === c.name) return true;
      return false;
    });

    const totalSessions = matchTxs.length;
    const totalSpent = matchTxs.reduce((sum, t) => sum + (t.amount || 0), 0);

    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      memberId: c.member_id ?? undefined,
      totalSessions,
      totalSpent,
      joinDate: c.join_date,
    };
  });

  return <DataPembeliClient customers={customers} />;
}
