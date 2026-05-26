'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { syncCustomerStats } from '@/utils/customerSync';

export async function updateTransactionStatus(
  id: number,
  status: 'LUNAS' | 'BELUM_LUNAS'
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('transactions')
    .update({ status })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/laporan');
  return { success: true };
}

export async function updateTransaction(
  id: number,
  data: {
    customerName: string;
    phone: string;
    psType: string;
    psName: string;
    startTime: string;
    endTime: string;
    duration: number;
    amount: number;
    date: string;
    status: 'LUNAS' | 'BELUM_LUNAS';
  }
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Fetch old transaction data to sync old customer
  const { data: oldTx } = await supabase
    .from('transactions')
    .select('customer_name, phone')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('transactions')
    .update({
      customer_name: data.customerName,
      phone: data.phone,
      ps_type: data.psType,
      ps_name: data.psName,
      start_time: data.startTime,
      end_time: data.endTime,
      duration: data.duration,
      amount: data.amount,
      date: data.date,
      status: data.status,
    })
    .eq('id', id);

  if (error) return { error: error.message };

  // 2. Sync old customer (in case of name/phone changes)
  if (oldTx) {
    await syncCustomerStats(supabase, oldTx.customer_name, oldTx.phone);
  }
  // 3. Sync new customer (in case details changed)
  await syncCustomerStats(supabase, data.customerName, data.phone);

  revalidatePath('/');
  revalidatePath('/laporan');
  revalidatePath('/data-pembeli');
  return { success: true };
}

export async function deleteTransaction(id: number) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Fetch old transaction data before delete
  const { data: oldTx } = await supabase
    .from('transactions')
    .select('customer_name, phone')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };

  // 2. Sync customer stats
  if (oldTx) {
    await syncCustomerStats(supabase, oldTx.customer_name, oldTx.phone);
  }

  revalidatePath('/');
  revalidatePath('/laporan');
  revalidatePath('/data-pembeli');
  return { success: true };
}

