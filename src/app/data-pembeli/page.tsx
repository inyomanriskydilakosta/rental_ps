'use client';

import { useState } from 'react';
import { Customer } from '@/types';
import { customers } from '@/lib/mockData';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Search, UserPlus, Pencil, Trash2, X, Save, User, Users, UserCheck } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import Pagination from '@/components/Pagination';

export default function DataPembeli() {
  const [data, setData] = useState<Customer[]>(customers);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', memberId: '' });

  const filtered = data.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const { paginated, page, pageSize, totalPages, total, startIndex, setPage, setPageSize } =
    usePagination(filtered, { desktopPageSize: 10, mobilePageSize: 5 });

  const handleAdd = () => {
    setEditItem(null);
    setForm({ name: '', phone: '', memberId: '' });
    setShowModal(true);
  };

  const handleEdit = (c: Customer) => {
    setEditItem(c);
    setForm({ name: c.name, phone: c.phone, memberId: c.memberId || '' });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    setData((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    if (editItem) {
      setData((prev) =>
        prev.map((c) =>
          c.id === editItem.id ? { ...c, ...form, memberId: form.memberId || undefined } : c
        )
      );
    } else {
      const newCustomer: Customer = {
        id: Date.now(),
        name: form.name,
        phone: form.phone,
        memberId: form.memberId || undefined,
        totalSessions: 0,
        totalSpent: 0,
        joinDate: new Date().toISOString().split('T')[0],
      };
      setData((prev) => [...prev, newCustomer]);
    }
    setShowModal(false);
  };

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Data Pembeli</h1>
            <p className="text-sm text-gray-400 mt-0.5">Kelola data pelanggan rental PS</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-3 sm:px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95 shadow-sm shadow-blue-200 flex-shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah Pembeli</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        </div>

        {/* Stats — 1 col mobile, 3 col sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: 'Total Pelanggan', value: data.length, icon: Users, color: 'blue' },
            { label: 'Member Aktif', value: data.filter((c) => c.memberId).length, icon: UserCheck, color: 'emerald' },
            { label: 'Non-Member', value: data.filter((c) => !c.memberId).length, icon: User, color: 'orange' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                stat.color === 'blue' ? 'bg-blue-50' : stat.color === 'emerald' ? 'bg-emerald-50' : 'bg-orange-50'
              }`}>
                <stat.icon className={`w-5 h-5 ${
                  stat.color === 'blue' ? 'text-blue-600' : stat.color === 'emerald' ? 'text-emerald-600' : 'text-orange-500'
                }`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {/* Search */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau nomor HP..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0">{filtered.length} pelanggan</span>
          </div>

          {/* ── Desktop: Table View ─────────────────────────────── */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80">
                  {['No', 'Nama', 'No. HP / Member ID', 'Total Sesi', 'Total Pengeluaran', 'Bergabung', 'Aksi'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map((c, i) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-gray-500">{startIndex + i + 1}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-gray-700">{c.phone}</p>
                      {c.memberId && (
                        <span className="inline-block text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded mt-0.5">
                          {c.memberId}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">{c.totalSessions} sesi</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-800">{formatCurrency(c.totalSpent)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(c.joinDate)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleEdit(c)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile: Card List View ───────────────────────────── */}
          <div className="sm:hidden divide-y divide-gray-50">
            {paginated.map((c, i) => (
              <div key={c.id} className="p-4 hover:bg-gray-50/40 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  {/* Left */}
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="text-xs text-gray-400 font-medium w-5 flex-shrink-0 pt-0.5">
                      {startIndex + i + 1}.
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                        {c.memberId && (
                          <span className="inline-block text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded">
                            {c.memberId}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{c.phone}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                        <span>{c.totalSessions} sesi</span>
                        <span className="font-semibold text-gray-700">{formatCurrency(c.totalSpent)}</span>
                        <span>{formatDate(c.joinDate)}</span>
                      </div>
                    </div>
                  </div>
                  {/* Right: actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => handleEdit(c)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-in fade-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">{editItem ? 'Edit Pembeli' : 'Tambah Pembeli'}</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: 'Nama Lengkap', key: 'name', placeholder: 'Masukkan nama lengkap' },
                { label: 'No. HP', key: 'phone', placeholder: 'Contoh: 0812-3456-7890' },
                { label: 'Member ID (opsional)', key: 'memberId', placeholder: 'Contoh: MBR-007' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
                  <input
                    type="text"
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2.5 px-5 pb-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                Batal
              </button>
              <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-colors">
                <Save className="w-4 h-4" />
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
