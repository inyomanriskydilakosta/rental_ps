'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { PSType, PSStatus } from '@/types';

export async function createPS(formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const type = formData.get('type') as PSType;
  const status = (formData.get('status') as PSStatus) ?? 'TERSEDIA';

  if (!name || !type) return { error: 'Nama dan jenis PS wajib diisi.' };

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('playstation_units')
    .insert({ name, type, status });

  if (error) return { error: error.message };

  revalidatePath('/');
  revalidatePath('/data-playstation');
  return { success: true };
}

export async function updatePS(id: number, formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const type = formData.get('type') as PSType;
  const status = formData.get('status') as PSStatus;

  if (!name || !type || !status) return { error: 'Semua field wajib diisi.' };

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('playstation_units')
    .update({ name, type, status })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/');
  revalidatePath('/data-playstation');
  return { success: true };
}

export async function deletePS(id: number) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('playstation_units')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/');
  revalidatePath('/data-playstation');
  return { success: true };
}
