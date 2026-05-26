import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Synchronizes and updates a customer's total sessions and total expenditure (spent)
 * based on all their entries in the transactions table.
 */
export async function syncCustomerStats(
  supabase: SupabaseClient,
  customerName: string,
  phone: string
) {
  if (!customerName) return;

  // 1. Find the customer record in the database
  let customerQuery = supabase.from('customers').select('*');
  
  const isMemberId = phone?.startsWith('MBR-');
  if (isMemberId) {
    customerQuery = customerQuery.eq('member_id', phone);
  } else if (phone && phone !== '-') {
    customerQuery = customerQuery.eq('phone', phone);
  } else {
    customerQuery = customerQuery.eq('name', customerName);
  }

  const { data: customers } = await customerQuery;
  if (!customers || customers.length === 0) return;

  const customer = customers[0];

  // 2. Fetch all transactions associated with this customer
  let txQuery = supabase.from('transactions').select('amount');
  
  if (customer.member_id) {
    txQuery = txQuery.or(`phone.eq.${customer.member_id},phone.eq.${customer.phone || 'none'},customer_name.eq.${customer.name}`);
  } else if (customer.phone && customer.phone !== '-') {
    txQuery = txQuery.or(`phone.eq.${customer.phone},customer_name.eq.${customer.name}`);
  } else {
    txQuery = txQuery.eq('customer_name', customer.name);
  }

  const { data: txs } = await txQuery;

  const totalSessions = txs ? txs.length : 0;
  const totalSpent = txs ? txs.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0) : 0;

  // 3. Update customer table
  await supabase
    .from('customers')
    .update({
      total_sessions: totalSessions,
      total_spent: totalSpent,
    })
    .eq('id', customer.id);
}
