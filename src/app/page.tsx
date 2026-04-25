import { Gamepad2, Clock, CheckCircle2, Receipt } from 'lucide-react';
import StatCard from '@/components/StatCard';
import ActiveSessionsTable from '@/components/ActiveSessionsTable';
import PurchaseForm from '@/components/PurchaseForm';
import PSDataTable from '@/components/PSDataTable';
import {
  dashboardStats,
  activeSessions,
  playstationUnits,
} from '@/lib/mockData';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Selamat datang kembali, Admin 👋
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Total Ps"
          value={dashboardStats.totalPS}
          subtitle="Unit terdaftar"
          icon={
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Gamepad2 className="w-5 h-5 text-blue-600" />
            </div>
          }
        />
        <StatCard
          title="PS yang Digunakan"
          value={dashboardStats.psInUse}
          highlight={`${dashboardStats.activeSessions} Sesi aktif`}
          highlightColor="text-orange-500 font-semibold text-xs"
          icon={
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
          }
        />
        <StatCard
          title="PS yang Tersedia"
          value={dashboardStats.psAvailable}
          subtitle="Unit siap digunakan"
          icon={
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          }
        />
        <StatCard
          title="Total Transaksi"
          value={dashboardStats.totalTransactions}
          subtitle="Transaksi dilakukan hari ini"
          icon={
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Receipt className="w-5 h-5 text-purple-600" />
            </div>
          }
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-5 gap-5">
        {/* Left: Active Sessions Table */}
        <div className="col-span-3">
          <ActiveSessionsTable sessions={activeSessions} />
        </div>

        {/* Right: Form + PS Data */}
        <div className="col-span-2 space-y-5">
          <PurchaseForm />
          <PSDataTable units={playstationUnits} />
        </div>
      </div>
    </div>
  );
}
