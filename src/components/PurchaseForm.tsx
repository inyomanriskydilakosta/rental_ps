'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { PlaystationUnit, PSType, Customer } from '@/types';
import { UserPlus, Save, Clock, Loader2 } from 'lucide-react';
import { createSession } from '@/app/login/actions';
import { useRouter } from 'next/navigation';

interface Props {
  availableUnits: PlaystationUnit[];
  customers?: Customer[];
}

function getDurationPrice(psType: string, durationMinutes: number): number {
  const packages: Record<string, { hours: number; price: number }[]> = {
    PS5: [
      { hours: 5, price: 65000 },
      { hours: 3, price: 40000 },
      { hours: 1, price: 15000 },
      { hours: 0.5, price: 7500 },
    ],
    PS4: [
      { hours: 5, price: 45000 },
      { hours: 3, price: 27000 },
      { hours: 1, price: 10000 },
      { hours: 0.5, price: 5000 },
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
  const psPackages = packages[normalizedType] || packages['PS4'];

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

export default function PurchaseForm({ availableUnits, customers = [] }: Props) {
  const router = useRouter();
  const [selectedUnit, setSelectedUnit] = useState<PlaystationUnit | null>(null);
  const [form, setForm] = useState({ customerName: '', phone: '' });
  const [duration, setDuration] = useState('60'); // default to 60 minutes (1 Jam)
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const suggestions = customers
    .filter((c) => c.name.toLowerCase().includes(form.customerName.toLowerCase()))
    .slice(0, 5);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectCustomer = (c: Customer) => {
    setForm((prev) => ({
      ...prev,
      customerName: c.name,
      phone: c.memberId || c.phone,
    }));
    setShowSuggestions(false);
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

    // Auto-calculate start time and end time based on current time + duration
    const now = new Date();
    const startHour = String(now.getHours()).padStart(2, '0');
    const startMinute = String(now.getMinutes()).padStart(2, '0');
    const calculatedStartTime = `${startHour}:${startMinute}`;

    const durationMinutes = Number(duration);
    const end = new Date(now.getTime() + durationMinutes * 60 * 1000);
    const endHour = String(end.getHours()).padStart(2, '0');
    const endMinute = String(end.getMinutes()).padStart(2, '0');
    const calculatedEndTime = `${endHour}:${endMinute}`;

    const fd = new FormData();
    fd.set('customerName', form.customerName);
    fd.set('phone', form.phone);
    fd.set('psUnitId', String(selectedUnit.id));
    fd.set('psType', selectedUnit.type);
    fd.set('psName', selectedUnit.name);
    fd.set('startTime', calculatedStartTime);
    fd.set('endTime', calculatedEndTime);

    startTransition(async () => {
      const res = await createSession(fd);
      if (res?.error) { setError(res.error); return; }
      setSaved(true);
      setForm({ customerName: '', phone: '' });
      setDuration('60');
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
          <div className="relative" ref={suggestionsRef}>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama Pelanggan</label>
            <input
              type="text"
              name="customerName"
              value={form.customerName}
              onChange={(e) => {
                handleChange(e);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Masukan nama pelanggan"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-300"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto mt-1.5 divide-y divide-gray-50">
                {suggestions.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCustomer(c)}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50/50 transition-colors flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-gray-800 truncate">{c.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 truncate">{c.phone}</p>
                    </div>
                    {c.memberId && (
                      <span className="text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded-md flex-shrink-0">
                        {c.memberId}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">No Tlp / Id Member</label>
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

        {/* Durasi Bermain */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Durasi Bermain</label>
          <div className="relative">
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white text-gray-700 font-medium"
            >
              {[
                { label: '1 Jam', value: '60' },
                { label: '2 Jam', value: '120' },
                { label: '3 Jam', value: '180' },
                { label: '4 Jam', value: '240' },
                { label: '5 Jam', value: '300' },
              ].map((opt) => {
                const price = selectedUnit ? getDurationPrice(selectedUnit.type, Number(opt.value)) : null;
                const priceLabel = price !== null ? ` - Rp ${price.toLocaleString('id-ID')}` : '';
                return (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}{priceLabel}
                  </option>
                );
              })}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 disabled:opacity-70 ${saved
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
