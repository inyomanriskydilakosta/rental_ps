'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { calculateDuration } from '@/lib/utils';

// ── Auth ───────────────────────────────────────────────────────────────────────

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect('/');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  await supabase.auth.signOut();
  redirect('/login');
}

// ── Session management ─────────────────────────────────────────────────────────

/**
 * Price per 30 minutes (in IDR) by PS type.
 */
const PRICE_PER_30_MIN: Record<string, number> = {
  PS5: 10000,
  PS4: 7500,
  PS3: 5000,
  PS2: 3000,
};

/**
 * Create a new rental session and mark the PS unit as DIGUNAKAN.
 */
export async function createSession(formData: FormData) {
  const customerName = (formData.get('customerName') as string)?.trim();
  const phone = (formData.get('phone') as string)?.trim();
  const psUnitId = Number(formData.get('psUnitId'));
  const psType = formData.get('psType') as string;
  const psName = (formData.get('psName') as string)?.trim();
  const startTime = formData.get('startTime') as string;
  const endTime = formData.get('endTime') as string;

  if (!customerName || !phone || !psUnitId || !psType || !psName || !startTime || !endTime) {
    return { error: 'Semua field wajib diisi.' };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Insert active session
  const { error: sessionError } = await supabase.from('active_sessions').insert({
    customer_name: customerName,
    phone,
    ps_unit_id: psUnitId,
    ps_type: psType,
    ps_name: psName,
    start_time: startTime,
    end_time: endTime,
    status: 'BERLANGSUNG',
  });

  if (sessionError) return { error: sessionError.message };

  // Mark PS unit as DIGUNAKAN
  const { error: unitError } = await supabase
    .from('playstation_units')
    .update({ status: 'DIGUNAKAN' })
    .eq('id', psUnitId);

  if (unitError) return { error: unitError.message };

  revalidatePath('/');
  return { success: true };
}

/**
 * End a session: mark session SELESAI, insert transaction, mark PS TERSEDIA.
 */
export async function endSession(sessionId: number) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch session data
  const { data: session, error: fetchError } = await supabase
    .from('active_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (fetchError || !session) return { error: 'Sesi tidak ditemukan.' };

  const duration = calculateDuration(session.start_time, session.end_time);
  const pricePerHalf = PRICE_PER_30_MIN[session.ps_type] ?? 5000;
  const amount = Math.ceil(duration / 30) * pricePerHalf;
  const today = new Date().toISOString().split('T')[0];

  // Insert transaction
  const { error: txError } = await supabase.from('transactions').insert({
    customer_name: session.customer_name,
    phone: session.phone,
    ps_type: session.ps_type,
    ps_name: session.ps_name,
    start_time: session.start_time,
    end_time: session.end_time,
    duration,
    amount,
    date: today,
    status: 'LUNAS',
  });

  if (txError) return { error: txError.message };

  // Mark session SELESAI
  const { error: sessionUpdateError } = await supabase
    .from('active_sessions')
    .update({ status: 'SELESAI' })
    .eq('id', sessionId);

  if (sessionUpdateError) return { error: sessionUpdateError.message };

  // Mark PS unit TERSEDIA
  if (session.ps_unit_id) {
    await supabase
      .from('playstation_units')
      .update({ status: 'TERSEDIA' })
      .eq('id', session.ps_unit_id);
  }

  revalidatePath('/');
  revalidatePath('/laporan');
  return { success: true };
}
