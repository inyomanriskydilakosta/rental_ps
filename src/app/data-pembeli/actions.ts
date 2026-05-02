'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

export async function createCustomer(formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const phone = (formData.get('phone') as string)?.trim();
  const memberId = (formData.get('memberId') as string)?.trim() || null;

  if (!name || !phone) return { error: 'Nama dan nomor HP wajib diisi.' };

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from('customers').insert({
    name,
    phone,
    member_id: memberId,
    total_sessions: 0,
    total_spent: 0,
    join_date: new Date().toISOString().split('T')[0],
  });

  if (error) return { error: error.message };

  revalidatePath('/data-pembeli');
  return { success: true };
}

export async function updateCustomer(id: number, formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const phone = (formData.get('phone') as string)?.trim();
  const memberId = (formData.get('memberId') as string)?.trim() || null;

  if (!name || !phone) return { error: 'Nama dan nomor HP wajib diisi.' };

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('customers')
    .update({ name, phone, member_id: memberId })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/data-pembeli');
  return { success: true };
}

export async function deleteCustomer(id: number) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from('customers').delete().eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/data-pembeli');
  return { success: true };
}
