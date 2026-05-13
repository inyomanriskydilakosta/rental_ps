'use client';

import { useState, useTransition } from 'react';
import { PlaystationUnit, PSType } from '@/types';
import { UserPlus, Save, Clock, Loader2 } from 'lucide-react';
import { createSession } from '@/app/login/actions';
import { useRouter } from 'next/navigation';

interface Props {
  availableUnits: PlaystationUnit[];
}

export default function PurchaseForm({ availableUnits }: Props) {
  const router = useRouter();
  const [selectedUnit, setSelectedUnit] = useState<PlaystationUnit | null>(null);
  const [form, setForm] = useState({ customerName: '', phone: '', startTime: '', endTime: '' });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const unit = availableUnits.find((u) => u.id === Number(e.target.value)) ?? null;
    setSelectedUnit(unit);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.customerName.trim()) {
      setError('Nama pelanggan wajib diisi.');
      return;
    }
    if (!selectedUnit) {
      setError('Pilih unit PS terlebih dahulu.');
      return;
    }
    if (!form.startTime || !form.endTime) {
      setError('Waktu mulai dan selesai wajib diisi.');
      return;
    }
    if (form.startTime >= form.endTime) {
      setError('Waktu selesai harus setelah waktu mulai.');
      return;
    }

    const fd = new FormData();
    fd.set('customerName', form.customerName);
    fd.set('phone', form.phone);
    fd.set('psUnitId', String(selectedUnit.id));
    fd.set('psType', selectedUnit.type);
    fd.set('psName', selectedUnit.name);
    fd.set('startTime', form.startTime);
    fd.set('endTime', form.endTime);

    startTransition(async () => {
      const res = await createSession(fd);
      if (res?.error) { setError(res.error); return; }
      setSaved(true);
      setForm({ customerName: '', phone: '', startTime: '', endTime: '' });
      setSelectedUnit(null);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    });
  };

  // Group available units by type for the select
  const psTypes = ['PS5', 'PS4', 'PS3', 'PS2'] as PSType[];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-50">
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
          <UserPlus className="w-4 h-4 text-blue-600" />
        </div>
        <h2 className="font-bold text-gray-800 text-base">Input Data Pembelian</h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">{error}</p>
        )}

        {/* Row 1: Name + Phone */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama Pelanggan</label>
            <input
              type="text"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              placeholder="Masukan nama pelanggan"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">No Tlp / Id Member (Opsional)</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Contoh: 0899-9987-7789"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Unit PS selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Unit Playstation</label>
          <div className="relative">
            <select
              value={selectedUnit?.id ?? ''}
              onChange={handleUnitChange}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white text-gray-700"
            >
              <option value="">Pilih unit PS tersedia</option>
              {psTypes.map((type) => {
                const ofType = availableUnits.filter((u) => u.type === type);
                if (ofType.length === 0) return null;
                return (
                  <optgroup key={type} label={type}>
                    {ofType.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {selectedUnit && (
            <p className="text-xs text-blue-600 mt-1.5 font-medium">
              ✓ {selectedUnit.name} ({selectedUnit.type}) dipilih
            </p>
          )}
          {availableUnits.length === 0 && (
            <p className="text-xs text-amber-600 mt-1.5">Semua unit PS sedang digunakan.</p>
          )}
        </div>

        {/* Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Waktu Mulai</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Waktu Selesai</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 disabled:opacity-70 ${
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-blue-700 hover:bg-blue-800 text-white shadow-lg shadow-blue-200'
          }`}
        >
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Menyimpan...</>
          ) : saved ? (
            <><Save className="w-4 h-4" />Sesi Dibuat!</>
          ) : (
            <><Save className="w-4 h-4" />Mulai Sesi</>
          )}
        </button>
      </form>
    </div>
  );
}
