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
