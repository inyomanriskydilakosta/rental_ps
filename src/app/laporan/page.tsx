'use client';

import { useState } from 'react';
import { Transaction } from '@/types';
import { transactions } from '@/lib/mockData';
import { formatCurrency, formatDate, getPSTypeBadgeColor } from '@/lib/utils';
import {
  Download,
  Search,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import Pagination from '@/components/Pagination';

export default function Laporan() {
  const [data] = useState<Transaction[]>(transactions);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filtered = data.filter((t) => {
    const matchSearch =
      t.customerName.toLowerCase().includes(search.toLowerCase()) ||
      t.psName.toLowerCase().includes(search.toLowerCase());
    const matchDate = !dateFilter || t.date === dateFilter;
    return matchSearch && matchDate;
  });

  const { paginated, page, pageSize, totalPages, total, startIndex, setPage, setPageSize } =
    usePagination(filtered, { desktopPageSize: 10, mobilePageSize: 5 });

  const totalRevenue = filtered.reduce((s, t) => s + t.amount, 0);
  const totalDuration = filtered.reduce((s, t) => s + t.duration, 0);
  const lunas = filtered.filter((t) => t.status === 'LUNAS').length;
  const belumLunas = filtered.filter((t) => t.status === 'BELUM_LUNAS').length;

  const handleExport = () => {
    const rows = [
      ['No', 'Nama', 'HP', 'Jenis PS', 'Unit PS', 'Jam Mulai', 'Jam Selesai', 'Durasi (mnt)', 'Total', 'Status', 'Tanggal'],
      ...filtered.map((t, i) => [
        i + 1, t.customerName, t.phone, t.psType, t.psName,
        t.startTime, t.endTime, t.duration, t.amount, t.status, t.date,
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'laporan_rental_ps.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Laporan</h1>
          <p className="text-sm text-gray-400 mt-0.5">Rekap transaksi rental PlayStation</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-3 sm:px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95 shadow-sm shadow-emerald-200 flex-shrink-0"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export CSV</span>
          <span className="sm:hidden">Export</span>
        </button>
      </div>

      {/* Summary Cards — 2 col mobile, 4 col sm+ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: 'Total Pendapatan',
            value: formatCurrency(totalRevenue),
            icon: DollarSign,
            bg: 'bg-blue-50',
            color: 'text-blue-600',
            sub: `${filtered.length} transaksi`,
          },
          {
            label: 'Total Durasi',
            value: `${Math.floor(totalDuration / 60)}j ${totalDuration % 60}m`,
            icon: Clock,
            bg: 'bg-purple-50',
            color: 'text-purple-600',
            sub: 'Jam bermain',
          },
          {
            label: 'Sudah Lunas',
            value: lunas,
            icon: CheckCircle2,
            bg: 'bg-emerald-50',
            color: 'text-emerald-600',
            sub: 'Transaksi',
          },
          {
            label: 'Belum Lunas',
            value: belumLunas,
            icon: AlertCircle,
            bg: 'bg-red-50',
            color: 'text-red-500',
            sub: 'Perlu konfirmasi',
          },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-2.5 sm:gap-3 mb-2 sm:mb-3">
              <div className={`w-8 h-8 sm:w-9 sm:h-9 ${card.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <card.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${card.color}`} />
              </div>
              <p className="text-xs sm:text-sm text-gray-500 leading-tight">{card.label}</p>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-50">
          <div className="relative flex-1 min-w-0 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau unit PS..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <span className="text-xs text-gray-400 ml-auto flex-shrink-0">{filtered.length} transaksi</span>
        </div>

        {/* ── Desktop: Table View ─────────────────────────────── */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80">
                {['No', 'Nama Pelanggan', 'Unit PS', 'Waktu', 'Durasi', 'Total', 'Status', 'Tanggal'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((t, i) => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm text-gray-500">{startIndex + i + 1}</td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-semibold text-gray-800">{t.customerName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.phone}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-gray-700">{t.psName}</p>
                    <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${getPSTypeBadgeColor(t.psType)}`}>
                      {t.psType}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-700 whitespace-nowrap">{t.startTime} – {t.endTime}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{t.duration} mnt</td>
                  <td className="px-5 py-3.5 text-sm font-bold text-gray-900">{formatCurrency(t.amount)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      t.status === 'LUNAS'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-600 border border-red-200'
                    }`}>
                      {t.status === 'LUNAS'
                        ? <CheckCircle2 className="w-3 h-3" />
                        : <AlertCircle className="w-3 h-3" />}
                      {t.status === 'LUNAS' ? 'Lunas' : 'Belum Lunas'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">{formatDate(t.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Mobile: Card List View ───────────────────────────── */}
        <div className="sm:hidden divide-y divide-gray-50">
          {paginated.map((t, i) => (
            <div key={t.id} className="p-4 hover:bg-gray-50/40 transition-colors">
              {/* Top row: number + name + status */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-start gap-2 min-w-0">
                  <span className="text-xs text-gray-400 font-medium w-5 flex-shrink-0 pt-0.5">{startIndex + i + 1}.</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{t.customerName}</p>
                    <p className="text-xs text-gray-400">{t.phone}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                  t.status === 'LUNAS'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-600 border border-red-200'
                }`}>
                  {t.status === 'LUNAS' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  {t.status === 'LUNAS' ? 'Lunas' : 'Belum'}
                </span>
              </div>
              {/* Bottom row: PS info + time + amount */}
              <div className="flex items-center gap-3 pl-7 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-700">{t.psName}</span>
                  <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${getPSTypeBadgeColor(t.psType)}`}>{t.psType}</span>
                </div>
                <span className="text-xs text-gray-500">{t.startTime}–{t.endTime}</span>
                <span className="text-xs text-gray-500">{t.duration} mnt</span>
                <span className="text-sm font-bold text-gray-900 ml-auto">{formatCurrency(t.amount)}</span>
              </div>
              <p className="text-xs text-gray-400 pl-7 mt-1">{formatDate(t.date)}</p>
            </div>
          ))}
        </div>

        {/* Pagination footer — with total summary */}
        <div className="border-t border-gray-100">
          <div className="flex items-center justify-between px-5 py-2.5 bg-gray-50/50">
            <p className="text-xs text-gray-500">
              Total: <span className="font-bold text-blue-700">{formatCurrency(totalRevenue)}</span>
            </p>
          </div>
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>
    </div>
  );
}
