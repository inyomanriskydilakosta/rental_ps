'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

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

  revalidatePath('/');
  revalidatePath('/laporan');
  return { success: true };
}

export async function deleteTransaction(id: number) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/');
  revalidatePath('/laporan');
  return { success: true };
}

