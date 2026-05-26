'use client';

import { useState, useTransition, useEffect } from 'react';
import { Transaction, PSType } from '@/types';
import { formatCurrency, formatDate, getPSTypeBadgeColor, calculateDuration, getWeekRange } from '@/lib/utils';
import { Download, Search, Clock, DollarSign, CheckCircle2, AlertCircle, Calendar, Loader2, Pencil, Trash2, X, Save } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import Pagination from '@/components/Pagination';
import { updateTransactionStatus, updateTransaction, deleteTransaction } from '@/app/laporan/actions';

interface Props { transactions: Transaction[]; }

// Client-side PS hourly rental price estimation logic
function estimateRentalPrice(psType: string, durationMinutes: number): number {
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

export default function LaporanClient({ transactions: initialData }: Props) {
  const [data, setData] = useState<Transaction[]>(initialData);
  const [search, setSearch] = useState('');

  // Filter States
  const [filterType, setFilterType] = useState<'ALL' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'>('ALL');

  // Initialize with local dates
  const getLocalDateString = (d: Date = new Date()) => {
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10);
  };

  const getLocalMonthString = (d: Date = new Date()) => {
    return getLocalDateString(d).substring(0, 7);
  };

  const getLocalYearString = (d: Date = new Date()) => {
    return getLocalDateString(d).substring(0, 4);
  };

  const [dailyDate, setDailyDate] = useState(getLocalDateString());
  const [weeklyDate, setWeeklyDate] = useState(getLocalDateString());
  const [monthlyMonth, setMonthlyMonth] = useState(getLocalMonthString());
  const [yearlyYear, setYearlyYear] = useState(getLocalYearString());

  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);


  // Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState({
    customerName: '',
    phone: '',
    psType: 'PS5' as PSType,
    psName: '',
    startTime: '',
    endTime: '',
    duration: 0,
    amount: 0,
    date: '',
    status: 'LUNAS' as 'LUNAS' | 'BELUM_LUNAS',
  });
  const [editError, setEditError] = useState('');

  // Export States
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportPeriodType, setExportPeriodType] = useState<'ALL' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'FILTERED'>('ALL');
  const [exportDailyDate, setExportDailyDate] = useState(getLocalDateString());
  const [exportWeeklyDate, setExportWeeklyDate] = useState(getLocalDateString());
  const [exportMonthlyMonth, setExportMonthlyMonth] = useState(getLocalMonthString());
  const [exportYearlyYear, setExportYearlyYear] = useState(getLocalYearString());

  const openExportModal = () => {
    setExportPeriodType(filterType === 'ALL' ? 'ALL' : filterType);
    setExportDailyDate(dailyDate);
    setExportWeeklyDate(weeklyDate);
    setExportMonthlyMonth(monthlyMonth);
    setExportYearlyYear(yearlyYear);
    setShowExportModal(true);
  };

  const getExportCount = () => {
    if (exportPeriodType === 'ALL') return data.length;
    if (exportPeriodType === 'FILTERED') return filtered.length;
    if (exportPeriodType === 'DAILY') return data.filter((t) => t.date === exportDailyDate).length;
    if (exportPeriodType === 'WEEKLY') {
      const { start, end } = getWeekRange(exportWeeklyDate);
      return data.filter((t) => t.date >= start && t.date <= end).length;
    }
    if (exportPeriodType === 'MONTHLY') return data.filter((t) => t.date.substring(0, 7) === exportMonthlyMonth).length;
    if (exportPeriodType === 'YEARLY') return data.filter((t) => t.date.substring(0, 4) === exportYearlyYear).length;
    return 0;
  };


  const filtered = data.filter((t) => {
    const matchSearch =
      t.customerName.toLowerCase().includes(search.toLowerCase()) ||
      t.psName.toLowerCase().includes(search.toLowerCase()) ||
      (t.phone && t.phone.toLowerCase().includes(search.toLowerCase()));

    let matchPeriod = true;
    if (filterType === 'DAILY') {
      matchPeriod = t.date === dailyDate;
    } else if (filterType === 'WEEKLY') {
      const { start, end } = getWeekRange(weeklyDate);
      matchPeriod = t.date >= start && t.date <= end;
    } else if (filterType === 'MONTHLY') {
      matchPeriod = t.date.substring(0, 7) === monthlyMonth;
    } else if (filterType === 'YEARLY') {
      matchPeriod = t.date.substring(0, 4) === yearlyYear;
    }

    return matchSearch && matchPeriod;
  });

  // Unique years option from all transactions for the select dropdown
  const availableYears = Array.from(new Set(
    data.map(t => t.date ? t.date.substring(0, 4) : new Date().getFullYear().toString())
  )).sort((a, b) => b.localeCompare(a));

  const currentYear = new Date().getFullYear().toString();
  if (!availableYears.includes(currentYear)) {
    availableYears.unshift(currentYear);
  }

  const { paginated, page, pageSize, totalPages, total, startIndex, setPage, setPageSize } =
    usePagination(filtered, { desktopPageSize: 10, mobilePageSize: 5 });

  const totalRevenue = filtered.reduce((s, t) => s + t.amount, 0);
  const totalDuration = filtered.reduce((s, t) => s + t.duration, 0);
  const lunas = filtered.filter((t) => t.status === 'LUNAS').length;
  const belumLunas = filtered.filter((t) => t.status === 'BELUM_LUNAS').length;

  const handleToggleStatus = (t: Transaction) => {
    const newStatus = t.status === 'LUNAS' ? 'BELUM_LUNAS' : 'LUNAS';
    setUpdatingId(t.id);
    startTransition(async () => {
      const res = await updateTransactionStatus(t.id, newStatus);
      if (res?.error) { alert(res.error); setUpdatingId(null); return; }
      setData((prev) => prev.map((tx) => tx.id === t.id ? { ...tx, status: newStatus } : tx));
      setUpdatingId(null);
    });
  };

  // Auto calculation hook for the edit modal
  useEffect(() => {
    if (!showEditModal) return;
    if (editForm.startTime && editForm.endTime) {
      const calculatedDur = calculateDuration(editForm.startTime, editForm.endTime);
      if (calculatedDur > 0) {
        const estAmount = estimateRentalPrice(editForm.psType, calculatedDur);
        setEditForm((prev) => ({
          ...prev,
          duration: calculatedDur,
          amount: estAmount,
        }));
      }
    }
  }, [editForm.startTime, editForm.endTime, editForm.psType, showEditModal]);

  const openEdit = (t: Transaction) => {
    setEditTx(t);
    setEditForm({
      customerName: t.customerName,
      phone: t.phone,
      psType: t.psType,
      psName: t.psName,
      startTime: t.startTime,
      endTime: t.endTime,
      duration: t.duration,
      amount: t.amount,
      date: t.date,
      status: t.status,
    });
    setEditError('');
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editTx) return;
    if (!editForm.customerName.trim()) { setEditError('Nama pelanggan wajib diisi.'); return; }
    if (!editForm.psName.trim()) { setEditError('Unit PS wajib diisi.'); return; }
    if (!editForm.startTime || !editForm.endTime) { setEditError('Waktu mulai dan selesai wajib diisi.'); return; }
    if (editForm.startTime >= editForm.endTime) { setEditError('Waktu selesai harus setelah waktu mulai.'); return; }
    if (!editForm.date) { setEditError('Tanggal wajib diisi.'); return; }

    setEditError('');
    startTransition(async () => {
      const res = await updateTransaction(editTx.id, editForm);
      if (res?.error) { setEditError(res.error); return; }
      setData((prev) => prev.map((t) => t.id === editTx.id ? { ...t, ...editForm } : t));
      setShowEditModal(false);
      setEditTx(null);
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.')) return;
    startTransition(async () => {
      const res = await deleteTransaction(id);
      if (res?.error) { alert(res.error); return; }
      setData((prev) => prev.filter((t) => t.id !== id));
    });
  };

  const handleExportCSV = () => {
    let exportData: Transaction[] = [];
    let filename = 'laporan_rental_ps';

    if (exportPeriodType === 'ALL') {
      exportData = data;
      filename += '_semua';
    } else if (exportPeriodType === 'FILTERED') {
      exportData = filtered;
      filename += '_filtered';
    } else if (exportPeriodType === 'DAILY') {
      exportData = data.filter((t) => t.date === exportDailyDate);
      filename += `_harian_${exportDailyDate}`;
    } else if (exportPeriodType === 'WEEKLY') {
      const { start, end } = getWeekRange(exportWeeklyDate);
      exportData = data.filter((t) => t.date >= start && t.date <= end);
      filename += `_mingguan_${start}_to_${end}`;
    } else if (exportPeriodType === 'MONTHLY') {
      exportData = data.filter((t) => t.date.substring(0, 7) === exportMonthlyMonth);
      filename += `_bulanan_${exportMonthlyMonth}`;
    } else if (exportPeriodType === 'YEARLY') {
      exportData = data.filter((t) => t.date.substring(0, 4) === exportYearlyYear);
      filename += `_tahunan_${exportYearlyYear}`;
    }

    if (exportData.length === 0) {
      alert('Tidak ada transaksi pada periode yang dipilih untuk diekspor.');
      return;
    }

    const rows = [
      ['No', 'Nama Pelanggan', 'No HP', 'Jenis PS', 'Unit PS', 'Waktu Mulai', 'Waktu Selesai', 'Durasi (jam)', 'Total Biaya', 'Status Pembayaran', 'Tanggal'],
      ...exportData.map((t, i) => [
        i + 1,
        t.customerName,
        t.phone || '-',
        t.psType,
        t.psName,
        t.startTime,
        t.endTime,
        (t.duration / 60).toFixed(2),
        t.amount,
        t.status === 'LUNAS' ? 'Lunas' : 'Belum Lunas',
        t.date
      ]),
    ];

    const csvContent = '\uFEFF' + rows.map((r) => r.map(val => {
      const stringVal = String(val);
      if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    }).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };


  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Laporan</h1>
            <p className="text-sm text-gray-400 mt-0.5">Rekap transaksi rental PlayStation</p>
          </div>
          <button onClick={openExportModal} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-3 sm:px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95 shadow-sm shadow-emerald-200 flex-shrink-0">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Total Pendapatan', value: formatCurrency(totalRevenue), icon: DollarSign, bg: 'bg-blue-50', color: 'text-blue-600', sub: `${filtered.length} transaksi` },
            { label: 'Total Durasi', value: `${Math.floor(totalDuration / 60)}j ${totalDuration % 60}m`, icon: Clock, bg: 'bg-purple-50', color: 'text-purple-600', sub: 'Jam bermain' },
            { label: 'Sudah Lunas', value: lunas, icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600', sub: 'Transaksi' },
            { label: 'Belum Lunas', value: belumLunas, icon: AlertCircle, bg: 'bg-red-50', color: 'text-red-500', sub: 'Perlu konfirmasi' },
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
          {/* Filter Periode & Search */}
          <div className="px-5 py-4 border-b border-gray-50 space-y-4">
            {/* Tipe Filter Pill Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-gray-50 p-1 rounded-xl w-fit border border-gray-100/80">
              {[
                { id: 'ALL', label: 'Semua' },
                { id: 'DAILY', label: 'Harian' },
                { id: 'WEEKLY', label: 'Mingguan' },
                { id: 'MONTHLY', label: 'Bulanan' },
                { id: 'YEARLY', label: 'Tahunan' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id as any)}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 active:scale-95 ${filterType === tab.id
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Input Kontrol */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-0 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama, unit PS, atau nomor HP..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                />
              </div>

              {/* Dynamic Picker Inputs */}
              {filterType === 'DAILY' && (
                <div className="relative flex items-center">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={dailyDate}
                    onChange={(e) => setDailyDate(e.target.value)}
                    className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white font-medium text-gray-700"
                  />
                </div>
              )}

              {filterType === 'WEEKLY' && (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex items-center">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={weeklyDate}
                      onChange={(e) => setWeeklyDate(e.target.value)}
                      className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white font-medium text-gray-700"
                    />
                  </div>
                  {weeklyDate && (
                    <div className="text-xs font-semibold text-blue-700 bg-blue-50/80 px-3 py-2 rounded-xl border border-blue-100">
                      Rentang: {formatDate(getWeekRange(weeklyDate).start)} – {formatDate(getWeekRange(weeklyDate).end)}
                    </div>
                  )}
                </div>
              )}

              {filterType === 'MONTHLY' && (
                <div className="relative flex items-center">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="month"
                    value={monthlyMonth}
                    onChange={(e) => setMonthlyMonth(e.target.value)}
                    className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white font-medium text-gray-700"
                  />
                </div>
              )}

              {filterType === 'YEARLY' && (
                <div className="relative flex items-center">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={yearlyYear}
                    onChange={(e) => setYearlyYear(e.target.value)}
                    className="pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white font-medium text-gray-700 appearance-none min-w-[100px]"
                  >
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              )}

              <span className="text-xs text-gray-400 ml-auto flex-shrink-0 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
                {filtered.length} transaksi
              </span>
            </div>
          </div>


          {/* Desktop */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-gray-50/80">{['No', 'Nama Pelanggan', 'Unit PS', 'Waktu', 'Durasi', 'Total', 'Status', 'Tanggal', 'Aksi'].map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.length === 0 ? (
                  <tr><td colSpan={9} className="px-5 py-10 text-center text-sm text-gray-400">Belum ada transaksi.</td></tr>
                ) : paginated.map((t, i) => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-gray-500">{startIndex + i + 1}</td>
                    <td className="px-5 py-3.5"><p className="text-sm font-semibold text-gray-800">{t.customerName}</p><p className="text-xs text-gray-400 mt-0.5">{t.phone}</p></td>
                    <td className="px-5 py-3.5"><p className="text-sm font-medium text-gray-700">{t.psName}</p><span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${getPSTypeBadgeColor(t.psType)}`}>{t.psType}</span></td>
                    <td className="px-5 py-3.5 text-sm text-gray-700 whitespace-nowrap">{t.startTime} – {t.endTime}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{(t.duration / 60)} Jam</td>
                    <td className="px-5 py-3.5 text-sm font-bold text-gray-900">{formatCurrency(t.amount)}</td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleToggleStatus(t)}
                        disabled={isPending && updatingId === t.id}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all hover:opacity-80 ${t.status === 'LUNAS' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}
                      >
                        {isPending && updatingId === t.id ? <Loader2 className="w-3 h-3 animate-spin" /> : t.status === 'LUNAS' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {t.status === 'LUNAS' ? 'Lunas' : 'Belum Lunas'}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">{formatDate(t.date)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(t)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          disabled={isPending}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="sm:hidden divide-y divide-gray-50">
            {paginated.length === 0 ? <p className="p-6 text-center text-sm text-gray-400">Belum ada transaksi.</p>
              : paginated.map((t, i) => (
                <div key={t.id} className="p-4 hover:bg-gray-50/40 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <span className="text-xs text-gray-400 font-medium w-5 flex-shrink-0 pt-0.5">{startIndex + i + 1}.</span>
                      <div className="min-w-0"><p className="text-sm font-semibold text-gray-800 truncate">{t.customerName}</p><p className="text-xs text-gray-400">{t.phone}</p></div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleToggleStatus(t)}
                        disabled={isPending && updatingId === t.id}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border transition-all hover:opacity-80 ${t.status === 'LUNAS' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}
                      >
                        {isPending && updatingId === t.id ? <Loader2 className="w-3 h-3 animate-spin" /> : t.status === 'LUNAS' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {t.status === 'LUNAS' ? 'Lunas' : 'Belum'}
                      </button>
                      <button onClick={() => openEdit(t)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(t.id)} disabled={isPending} className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors disabled:opacity-50"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pl-7 flex-wrap">
                    <div className="flex items-center gap-1.5"><span className="text-xs font-medium text-gray-700">{t.psName}</span><span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${getPSTypeBadgeColor(t.psType)}`}>{t.psType}</span></div>
                    <span className="text-xs text-gray-500">{t.startTime}–{t.endTime}</span>
                    <span className="text-xs text-gray-500">{(t.duration / 60)} Jam</span>
                    <span className="text-sm font-bold text-gray-900 ml-auto">{formatCurrency(t.amount)}</span>
                  </div>
                  <p className="text-xs text-gray-400 pl-7 mt-1">{formatDate(t.date)}</p>
                </div>
              ))}
          </div>

          <div className="border-t border-gray-100">
            <div className="flex items-center justify-between px-5 py-2.5 bg-gray-50/50">
              <p className="text-xs text-gray-500">Total: <span className="font-bold text-blue-700">{formatCurrency(totalRevenue)}</span></p>
            </div>
            <Pagination page={page} pageSize={pageSize} total={total} totalPages={totalPages} onPageChange={setPage} onPageSizeChange={setPageSize} />
          </div>
        </div>
      </div>

      {/* Edit Transaction Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="font-bold text-gray-800">Edit Laporan Transaksi</h3>
              <button onClick={() => setShowEditModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              {editError && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100">{editError}</p>}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama Pelanggan</label>
                  <input type="text" value={editForm.customerName} onChange={(e) => setEditForm((p) => ({ ...p, customerName: e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">No. HP / ID Member</label>
                  <input type="text" value={editForm.phone} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Jenis PS</label>
                  <div className="relative">
                    <select value={editForm.psType} onChange={(e) => setEditForm((p) => ({ ...p, psType: e.target.value as PSType }))} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none bg-white">
                      {['PS5', 'PS4', 'PS3', 'PS2'].map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Unit PS</label>
                  <input type="text" value={editForm.psName} onChange={(e) => setEditForm((p) => ({ ...p, psName: e.target.value }))} placeholder="Contoh: PS5-01" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Waktu Mulai</label>
                  <input type="time" value={editForm.startTime} onChange={(e) => setEditForm((p) => ({ ...p, startTime: e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Waktu Selesai</label>
                  <input type="time" value={editForm.endTime} onChange={(e) => setEditForm((p) => ({ ...p, endTime: e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tanggal</label>
                  <input type="date" value={editForm.date} onChange={(e) => setEditForm((p) => ({ ...p, date: e.target.value }))} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                  <div className="relative">
                    <select value={editForm.status} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as 'LUNAS' | 'BELUM_LUNAS' }))} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none bg-white">
                      <option value="LUNAS">Lunas</option>
                      <option value="BELUM_LUNAS">Belum Lunas</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Durasi (Jam)</label>
                  <input type="number" step="any" value={editForm.duration / 60} onChange={(e) => setEditForm((p) => ({ ...p, duration: Number(e.target.value) * 60 }))} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 font-semibold text-gray-700" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Total Biaya (Rp)</label>
                  <input type="number" value={editForm.amount} onChange={(e) => setEditForm((p) => ({ ...p, amount: Number(e.target.value) }))} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-900 focus:bg-white" />
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 italic leading-normal">
                * Durasi dan Total Biaya otomatis terhitung jika Waktu Mulai/Selesai/Jenis PS diubah, tapi Anda tetap dapat menyesuaikannya secara manual.
              </p>
            </div>

            <div className="flex gap-2.5 px-5 pb-5 pt-3 border-t border-gray-100">
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Batal</button>
              <button onClick={handleSaveEdit} disabled={isPending} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-70">
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isPending ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Period Selection Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Download className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base leading-tight">Export Laporan CSV</h3>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">Pilih rentang waktu data yang diekspor</p>
                </div>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Export Period Type */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Pilih Tipe Periode
                </label>
                <div className="relative">
                  <select
                    value={exportPeriodType}
                    onChange={(e) => setExportPeriodType(e.target.value as any)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none bg-white font-medium text-gray-700"
                  >
                    <option value="ALL">Semua Transaksi</option>
                    <option value="DAILY">Harian</option>
                    <option value="WEEKLY">Mingguan</option>
                    <option value="MONTHLY">Bulanan</option>
                    <option value="YEARLY">Tahunan</option>
                    <option value="FILTERED">Sesuai Filter Tabel Saat Ini</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Dynamic Pickers based on Period Type */}
              {exportPeriodType === 'DAILY' && (
                <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                  <label className="block text-xs font-semibold text-gray-600">Pilih Tanggal</label>
                  <div className="relative flex items-center">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={exportDailyDate}
                      onChange={(e) => setExportDailyDate(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white font-medium text-gray-700"
                    />
                  </div>
                </div>
              )}

              {exportPeriodType === 'WEEKLY' && (
                <div className="space-y-2 animate-in slide-in-from-top-1 duration-200">
                  <label className="block text-xs font-semibold text-gray-600">Pilih Minggu</label>
                  <div className="relative flex items-center">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={exportWeeklyDate}
                      onChange={(e) => setExportWeeklyDate(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white font-medium text-gray-700"
                    />
                  </div>
                  {exportWeeklyDate && (
                    <div className="text-xs font-semibold text-blue-700 bg-blue-50/80 px-3 py-2.5 rounded-xl border border-blue-100">
                      Rentang Ekspor: {formatDate(getWeekRange(exportWeeklyDate).start)} – {formatDate(getWeekRange(exportWeeklyDate).end)}
                    </div>
                  )}
                </div>
              )}

              {exportPeriodType === 'MONTHLY' && (
                <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                  <label className="block text-xs font-semibold text-gray-600">Pilih Bulan</label>
                  <div className="relative flex items-center">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="month"
                      value={exportMonthlyMonth}
                      onChange={(e) => setExportMonthlyMonth(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white font-medium text-gray-700"
                    />
                  </div>
                </div>
              )}

              {exportPeriodType === 'YEARLY' && (
                <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                  <label className="block text-xs font-semibold text-gray-600">Pilih Tahun</label>
                  <div className="relative flex items-center">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={exportYearlyYear}
                      onChange={(e) => setExportYearlyYear(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white font-medium text-gray-700 appearance-none"
                    >
                      {availableYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Count Indicator */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-500">Jumlah transaksi terdeteksi:</span>
                <span className="font-bold text-gray-900 bg-white border border-gray-200/80 px-2.5 py-1 rounded-lg">
                  {getExportCount()} transaksi
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-2.5 px-5 pb-5 pt-3 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors bg-white active:scale-95"
              >
                Batal
              </button>
              <button
                onClick={handleExportCSV}
                disabled={getExportCount() === 0}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all active:scale-95 shadow-sm shadow-emerald-200 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Download className="w-4 h-4" />
                Unduh CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

