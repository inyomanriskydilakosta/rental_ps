'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { calculateDuration } from '@/lib/utils';
import { syncCustomerStats } from '@/utils/customerSync';

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
 * Rental price calculation by PS type.
 * Supports packages (1h, 3h, 5h) and half-hour fallback.
 */
function calculateRentalPrice(psType: string, durationMinutes: number): number {
  const packages: Record<string, { hours: number; price: number }[]> = {
    PS5: [
      { hours: 5, price: 65000 },
      { hours: 3, price: 40000 },
      { hours: 1, price: 15000 },
      { hours: 0.5, price: 7500 }, // fallback per 30 mins
    ],
    PS4: [
      { hours: 5, price: 45000 },
      { hours: 3, price: 27000 },
      { hours: 1, price: 10000 },
      { hours: 0.5, price: 5000 }, // fallback per 30 mins
    ],
    PS3: [
      { hours: 1, price: 10000 },
      { hours: 0.5, price: 5000 },
    ],
    PS2: [
      { hours: 1, price: 6000 },
      { hours: 0.5, price: 3000 },
    ],
  };

  const normalizedType = psType.replace(/\s+/g, '').toUpperCase();
  const psPackages = packages[normalizedType] || packages['PS4']; // fallback to PS4

  let remainingBlocks = Math.ceil(durationMinutes / 30);
  let totalPrice = 0;

  for (const pkg of psPackages) {
    const pkgBlocks = pkg.hours * 2;
    if (remainingBlocks >= pkgBlocks) {
      const count = Math.floor(remainingBlocks / pkgBlocks);
      totalPrice += count * pkg.price;
      remainingBlocks -= count * pkgBlocks;
    }
  }

  return totalPrice;
}

/**
 * Create a new rental session and mark the PS unit as DIGUNAKAN.
 */
export async function createSession(formData: FormData) {
  const customerName = (formData.get('customerName') as string)?.trim();
  const phone = (formData.get('phone') as string)?.trim() || '-';
  const psUnitId = Number(formData.get('psUnitId'));
  const psType = formData.get('psType') as string;
  const psName = (formData.get('psName') as string)?.trim();
  const startTime = formData.get('startTime') as string;
  const endTime = formData.get('endTime') as string;

  if (!customerName || !psUnitId || !psType || !psName || !startTime || !endTime) {
    return { error: 'Semua field wajib diisi kecuali nomor HP.' };
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
  const amount = calculateRentalPrice(session.ps_type, duration);
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

  // Recalculate and sync customer stats
  await syncCustomerStats(supabase, session.customer_name, session.phone);

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
