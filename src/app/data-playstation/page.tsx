'use client';

import { useState } from 'react';
import { PlaystationUnit, PSType } from '@/types';
import { playstationUnits } from '@/lib/mockData';
import { getPSTypeBadgeColor } from '@/lib/utils';
import { Gamepad2, Plus, Pencil, Trash2, Search, X, Save } from 'lucide-react';

const psTypes: PSType[] = ['PS5', 'PS4', 'PS3', 'PS2'];

export default function DataPlaystation() {
  const [units, setUnits] = useState<PlaystationUnit[]>(playstationUnits);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<PSType | 'ALL'>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editUnit, setEditUnit] = useState<PlaystationUnit | null>(null);
  const [form, setForm] = useState({ name: '', type: 'PS5' as PSType, status: 'TERSEDIA' as 'TERSEDIA' | 'DIGUNAKAN' });

  const filtered = units.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'ALL' || u.type === filterType;
    return matchSearch && matchType;
  });

  const handleAdd = () => {
    setEditUnit(null);
    setForm({ name: '', type: 'PS5', status: 'TERSEDIA' });
    setShowModal(true);
  };

  const handleEdit = (u: PlaystationUnit) => {
    setEditUnit(u);
    setForm({ name: u.name, type: u.type, status: u.status });
    setShowModal(true);
  };

  const handleDelete = (id: number) => setUnits((prev) => prev.filter((u) => u.id !== id));

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editUnit) {
      setUnits((prev) => prev.map((u) => (u.id === editUnit.id ? { ...u, ...form } : u)));
    } else {
      setUnits((prev) => [...prev, { id: Date.now(), ...form }]);
    }
    setShowModal(false);
  };

  const countByStatus = (status: 'TERSEDIA' | 'DIGUNAKAN') => units.filter((u) => u.status === status).length;
  const countByType = (type: PSType) => units.filter((u) => u.type === type).length;

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Playstation</h1>
            <p className="text-sm text-gray-400 mt-0.5">Kelola unit PlayStation yang tersedia</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95 shadow-sm shadow-blue-200"
          >
            <Plus className="w-4 h-4" />
            Tambah PS
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-500">Status Unit</p>
              <Gamepad2 className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex gap-4">
              <div>
                <p className="text-2xl font-bold text-emerald-600">{countByStatus('TERSEDIA')}</p>
                <p className="text-xs text-gray-400 mt-0.5">Tersedia</p>
              </div>
              <div className="w-px bg-gray-100" />
              <div>
                <p className="text-2xl font-bold text-amber-500">{countByStatus('DIGUNAKAN')}</p>
                <p className="text-xs text-gray-400 mt-0.5">Digunakan</p>
              </div>
              <div className="w-px bg-gray-100" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{units.length}</p>
                <p className="text-xs text-gray-400 mt-0.5">Total</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-3">Per Jenis</p>
            <div className="flex gap-4">
              {psTypes.map((type) => (
                <div key={type}>
                  <p className="text-2xl font-bold text-gray-800">{countByType(type)}</p>
                  <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${getPSTypeBadgeColor(type)}`}>{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {/* Filters */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama PS..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="flex gap-1.5">
              {(['ALL', ...psTypes] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterType === t
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t === 'ALL' ? 'Semua' : t}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80">
                  {['No', 'Nama', 'Jenis PS', 'Status', 'Aksi'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((unit, i) => (
                  <tr key={unit.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-gray-500">{i + 1}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Gamepad2 className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{unit.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${getPSTypeBadgeColor(unit.type)}`}>
                        {unit.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        unit.status === 'TERSEDIA'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${unit.status === 'TERSEDIA' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                        {unit.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleEdit(unit)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(unit.id)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-in fade-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">{editUnit ? 'Edit PS' : 'Tambah PS Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama PS</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Contoh: PS5-06"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Jenis PS</label>
                <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as PSType }))} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none">
                  {psTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                <div className="flex gap-2">
                  {(['TERSEDIA', 'DIGUNAKAN'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, status: s }))}
                      className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${
                        form.status === s ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2.5 px-5 pb-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Batal</button>
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
