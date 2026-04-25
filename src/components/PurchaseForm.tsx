'use client';

import { useState } from 'react';
import { PurchaseFormData, PSType } from '@/types';
import { UserPlus, Save, Clock } from 'lucide-react';

const psTypes: PSType[] = ['PS5', 'PS4', 'PS3', 'PS2'];

export default function PurchaseForm() {
  const [form, setForm] = useState<PurchaseFormData>({
    customerName: '',
    phone: '',
    psType: '',
    startTime: '',
    endTime: '',
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setForm({ customerName: '', phone: '', psType: '', startTime: '', endTime: '' });
    }, 2000);
  };

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
        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Nama Pelanggan
            </label>
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
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              No Tlp/ Id Member
            </label>
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

        {/* PS Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Jenis Playstation
          </label>
          <div className="relative">
            <select
              name="psType"
              value={form.psType}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white text-gray-700"
            >
              <option value="" className="text-gray-300">Pilih jenis playstation</option>
              {psTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
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

        {/* Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Waktu Mulai
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                placeholder="Pilih waktu mulai"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Waktu Selesai
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                placeholder="Pilih waktu selesai"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 ${
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-blue-700 hover:bg-blue-800 text-white shadow-lg shadow-blue-200'
          }`}
        >
          <Save className="w-4 h-4" />
          {saved ? 'Tersimpan!' : 'Simpan'}
        </button>
      </form>
    </div>
  );
}
