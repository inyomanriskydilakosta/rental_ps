'use client';

import { useState } from 'react';
import { ActiveSession } from '@/types';
import { getPSTypeBadgeColor } from '@/lib/utils';
import { RefreshCw, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { usePagination } from '@/hooks/usePagination';
import Pagination from '@/components/Pagination';

interface ActiveSessionsTableProps {
  sessions: ActiveSession[];
}

export default function ActiveSessionsTable({ sessions }: ActiveSessionsTableProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { paginated, page, pageSize, totalPages, total, startIndex, setPage, setPageSize } =
    usePagination(sessions, { desktopPageSize: 10, mobilePageSize: 5 });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
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
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Jenis PS</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Jam Mulai</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Jam Selesai</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.map((session, index) => (
              <tr key={session.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3.5 text-sm text-gray-500">{startIndex + index + 1}</td>
                <td className="px-4 py-3.5">
                  <p className="text-sm font-semibold text-gray-800">{session.customerName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{session.phone}</p>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${getPSTypeBadgeColor(session.psType)}`}>
                    {session.psType}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-sm font-medium text-gray-700">{session.startTime}</td>
                <td className="px-4 py-3.5 text-sm font-medium text-gray-700">{session.endTime}</td>
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    {session.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile: Card List View ───────────────────────────── */}
      <div className="sm:hidden divide-y divide-gray-50">
        {paginated.map((session, index) => (
          <div key={session.id} className="p-4 hover:bg-gray-50/40 transition-colors">
            {/* Row top: number + name + status */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-gray-400 font-medium w-5 flex-shrink-0">
                  {startIndex + index + 1}.
                </span>
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
            {/* Row bottom: type + time */}
            <div className="flex items-center gap-3 pl-7">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${getPSTypeBadgeColor(session.psType)}`}>
                {session.psType}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {session.startTime} – {session.endTime}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer: Refresh + Pagination */}
      <div className="px-5 py-3.5 border-t border-gray-50 flex flex-col sm:flex-row sm:items-center gap-3">
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all duration-200 active:scale-95 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Update status PS
        </button>

        {/* Pagination inline */}
        <div className="sm:ml-auto">
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
    </div>
  );
}
