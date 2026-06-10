'use client';

import { useState, useTransition, useEffect, useRef, useCallback } from 'react';
import { ActiveSession } from '@/types';
import { getPSTypeBadgeColor } from '@/lib/utils';
import { ChevronRight, Clock, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { usePagination } from '@/hooks/usePagination';
import Pagination from '@/components/Pagination';
import { endSession } from '@/app/login/actions';
import { useRouter } from 'next/navigation';

interface ActiveSessionsTableProps {
  sessions: ActiveSession[];
}

/**
 * Parse "HH:MM" time string → total minutes from midnight.
 */
function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Return remaining seconds until endTime.
 * Negative = already expired.
 */
function getRemainingSeconds(endTime: string): number {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowSeconds = nowMinutes * 60 + now.getSeconds();

  const [endH, endM] = endTime.split(':').map(Number);
  const endSeconds = endH * 3600 + endM * 60;

  let diff = endSeconds - nowSeconds;
  // handle midnight crossing: if endTime < current time by more than 12h, assume it's next day
  if (diff < -12 * 3600) diff += 24 * 3600;
  return diff;
}

/**
 * Format remaining seconds → "MM:SS" or "HH:MM:SS"
 */
function formatCountdown(seconds: number): string {
  if (seconds <= 0) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  if (h > 0) return `${String(h).padStart(2, '0')}:${mm}:${ss}`;
  return `${mm}:${ss}`;
}

/** Toast notification shown when a session auto-completes */
function AutoCompleteToast({ name, psName, onClose }: { name: string; psName: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl border border-emerald-100 p-4 flex items-start gap-3 max-w-sm">
        <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800">Sesi Selesai Otomatis</p>
          <p className="text-xs text-gray-500 mt-0.5">
            <span className="font-semibold text-gray-700">{name}</span> ({psName}) — waktu bermain telah habis.
          </p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Mengalihkan ke halaman laporan…</p>
        </div>
        <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors text-lg leading-none flex-shrink-0">✕</button>
      </div>
    </div>
  );
}

/** Countdown badge per row */
function CountdownBadge({ endTime, expired }: { endTime: string; expired: boolean }) {
  const [seconds, setSeconds] = useState(() => getRemainingSeconds(endTime));

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(getRemainingSeconds(endTime));
    }, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  if (expired || seconds <= 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 animate-pulse">
        <AlertTriangle className="w-2.5 h-2.5" />
        Waktu Habis
      </span>
    );
  }

  const isWarning = seconds <= 300; // ≤ 5 menit
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
        isWarning
          ? 'bg-amber-50 text-amber-600 border-amber-200 animate-pulse'
          : 'bg-gray-50 text-gray-500 border-gray-200'
      }`}
    >
      <Clock className="w-2.5 h-2.5" />
      {formatCountdown(seconds)}
    </span>
  );
}

export default function ActiveSessionsTable({ sessions: initialSessions }: ActiveSessionsTableProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState<ActiveSession[]>(initialSessions);
  const [isPending, startTransition] = useTransition();
  const [endingId, setEndingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ name: string; psName: string } | null>(null);

  // Track which sessions have already been auto-ended (to avoid duplicate calls)
  const autoEndedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    setSessions(initialSessions);
  }, [initialSessions]);

  /** Core end-session logic — shared by manual button & auto-timer */
  const doEndSession = useCallback(
    (id: number, opts?: { auto?: boolean }) => {
      setEndingId(id);
      startTransition(async () => {
        const res = await endSession(id);
        if (res?.error) {
          console.error('[AutoEnd] error:', res.error);
          setEndingId(null);
          autoEndedRef.current.delete(id); // allow retry
          return;
        }
        // Remove from local state
        setSessions((prev) => {
          const session = prev.find((s) => s.id === id);
          if (opts?.auto && session) {
            setToast({ name: session.customerName, psName: session.psName });
          }
          return prev.filter((s) => s.id !== id);
        });
        setEndingId(null);

        if (opts?.auto) {
          // Redirect to laporan after a short delay so the toast is visible
          setTimeout(() => {
            router.push('/laporan');
          }, 1800);
        } else {
          router.refresh();
        }
      });
    },
    [router, startTransition]
  );

  /** Manual button handler */
  const handleEndSession = (id: number) => {
    autoEndedRef.current.add(id); // prevent double-trigger
    doEndSession(id, { auto: false });
  };

  /** Auto-complete watcher: check every second if any session has expired */
  useEffect(() => {
    const check = () => {
      sessions.forEach((session) => {
        if (autoEndedRef.current.has(session.id)) return; // already handled
        const remaining = getRemainingSeconds(session.endTime);
        if (remaining <= 0) {
          autoEndedRef.current.add(session.id);
          doEndSession(session.id, { auto: true });
        }
      });
    };

    // Run immediately, then every second
    check();
    const intervalId = setInterval(check, 1000);
    return () => clearInterval(intervalId);
  }, [sessions, doEndSession]);

  const { paginated, page, pageSize, totalPages, total, startIndex, setPage, setPageSize } =
    usePagination(sessions, { desktopPageSize: 10, mobilePageSize: 5 });

  return (
    <>
      {/* Auto-complete toast */}
      {toast && (
        <AutoCompleteToast
          name={toast.name}
          psName={toast.psName}
          onClose={() => setToast(null)}
        />
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <span className="text-base">🎮</span>
            </div>
            <h2 className="font-bold text-gray-800 text-base">PS Aktif Saat Ini</h2>
          </div>
          <Link
            href="/data-playstation"
            className="text-xs font-semibold text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1"
          >
            Lihat Semua
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* ── Desktop: Table View ─────────────────────────────── */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-10">No</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit PS</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Jam Mulai</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Jam Selesai</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sisa Waktu</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-400">
                    Tidak ada sesi aktif saat ini.
                  </td>
                </tr>
              ) : paginated.map((session, index) => {
                const isEnding = isPending && endingId === session.id;
                return (
                  <tr key={session.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-gray-500">{startIndex + index + 1}</td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-semibold text-gray-800">{session.customerName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{session.phone}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-gray-700">{session.psName}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${getPSTypeBadgeColor(session.psType)}`}>
                        {session.psType}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-700">{session.startTime}</td>
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-700">{session.endTime}</td>
                    <td className="px-4 py-3.5">
                      <CountdownBadge endTime={session.endTime} expired={isEnding} />
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        {session.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleEndSession(session.id)}
                        disabled={isEnding}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors disabled:opacity-60"
                      >
                        {isEnding
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <CheckCircle className="w-3 h-3" />}
                        Selesaikan
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Mobile: Card List View ───────────────────────────── */}
        <div className="sm:hidden divide-y divide-gray-50">
          {paginated.length === 0 ? (
            <p className="p-6 text-center text-sm text-gray-400">Tidak ada sesi aktif.</p>
          ) : paginated.map((session, index) => {
            const isEnding = isPending && endingId === session.id;
            return (
              <div key={session.id} className="p-4 hover:bg-gray-50/40 transition-colors">
                {/* Row top: number + name + status */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs text-gray-400 font-medium w-5 flex-shrink-0">{startIndex + index + 1}.</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{session.customerName}</p>
                      <p className="text-xs text-gray-400">{session.phone}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    {session.status}
                  </span>
                </div>
                {/* Row middle: type + time + countdown */}
                <div className="flex items-center gap-2 pl-7 mb-2 flex-wrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${getPSTypeBadgeColor(session.psType)}`}>
                    {session.psType}
                  </span>
                  <span className="text-xs font-medium text-gray-600">{session.psName}</span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {session.startTime} – {session.endTime}
                  </span>
                  <CountdownBadge endTime={session.endTime} expired={isEnding} />
                </div>
                {/* Row bottom: end button */}
                <div className="pl-7">
                  <button
                    onClick={() => handleEndSession(session.id)}
                    disabled={isEnding}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors disabled:opacity-60"
                  >
                    {isEnding
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <CheckCircle className="w-3 h-3" />}
                    Selesaikan
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Pagination */}
        <div className="px-5 py-3.5 border-t border-gray-50">
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            className="!px-0 !py-0 !border-t-0"
          />
        </div>
      </div>
    </>
  );
}
