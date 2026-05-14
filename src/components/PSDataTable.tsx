'use client';

import { useState, useEffect } from 'react';
import { PlaystationUnit, PSType } from '@/types';
import { getPSTypeBadgeColor } from '@/lib/utils';
import { Plus, Pencil, Trash2, Gamepad2, X, Save } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import Pagination from '@/components/Pagination';

interface PSDataTableProps {
  units: PlaystationUnit[];
}

export default function PSDataTable({ units: initialUnits }: PSDataTableProps) {
  const [units, setUnits] = useState<PlaystationUnit[]>(initialUnits);
  const [showModal, setShowModal] = useState(false);
  const [editUnit, setEditUnit] = useState<PlaystationUnit | null>(null);
  const [form, setForm] = useState({ name: '', type: 'PS5' as PSType });

  useEffect(() => {
    setUnits(initialUnits);
  }, [initialUnits]);

  const { paginated, page, pageSize, totalPages, total, startIndex, setPage, setPageSize } =
    usePagination(units, { desktopPageSize: 10, mobilePageSize: 5 });

  const handleAdd = () => {
    setEditUnit(null);
    setForm({ name: '', type: 'PS5' });
    setShowModal(true);
  };

  const handleEdit = (unit: PlaystationUnit) => {
    setEditUnit(unit);
    setForm({ name: unit.name, type: unit.type });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    setUnits((prev) => prev.filter((u) => u.id !== id));
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editUnit) {
      setUnits((prev) =>
        prev.map((u) => (u.id === editUnit.id ? { ...u, ...form } : u))
      );
    } else {
      const newUnit: PlaystationUnit = {
        id: Date.now(),
        name: form.name,
        type: form.type,
        status: 'TERSEDIA',
      };
      setUnits((prev) => [...prev, newUnit]);
    }
    setShowModal(false);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Gamepad2 className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="font-bold text-gray-800 text-base">Data PS</h2>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-200 active:scale-95 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah PS
          </button>
        </div>

        {/* ── Desktop: Table View ─────────────────────────────── */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-10">No</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Jenis PS</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((unit, index) => (
                <tr key={unit.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 text-sm text-gray-500">{startIndex + index + 1}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">{unit.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${getPSTypeBadgeColor(unit.type)}`}>
                      {unit.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      unit.status === 'TERSEDIA'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${unit.status === 'TERSEDIA' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                      {unit.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEdit(unit)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(unit.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
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

        {/* ── Mobile: Card List View ───────────────────────────── */}
        <div className="sm:hidden divide-y divide-gray-50">
          {paginated.map((unit, index) => (
            <div key={unit.id} className="p-4 hover:bg-gray-50/40 transition-colors">
              <div className="flex items-center justify-between gap-2">
                {/* Left: number + name + badges */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xs text-gray-400 font-medium w-5 flex-shrink-0">
                    {startIndex + index + 1}.
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{unit.name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${getPSTypeBadgeColor(unit.type)}`}>
                        {unit.type}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        unit.status === 'TERSEDIA'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${unit.status === 'TERSEDIA' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                        {unit.status}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Right: action buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(unit)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(unit.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                  >
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">{editUnit ? 'Edit PS' : 'Tambah PS Baru'}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X className="w-4 h-4" />
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
                <select
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as PSType }))}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                >
                  {(['PS5', 'PS4', 'PS3', 'PS2'] as PSType[]).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2.5 px-5 pb-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-colors"
              >
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
