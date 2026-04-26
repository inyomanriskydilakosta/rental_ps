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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Selamat datang kembali, Admin 👋</p>
      </div>

      {/* Stat Cards — 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
          title="PS Tersedia"
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
          subtitle="Transaksi hari ini"
          icon={
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Receipt className="w-5 h-5 text-purple-600" />
            </div>
          }
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-4">
        {/* Active Sessions + Purchase Form side-by-side on xl */}
        <div className="flex flex-col xl:flex-row gap-4">
          <div className="flex-1 min-w-0">
            <ActiveSessionsTable sessions={activeSessions} />
          </div>
          <div className="xl:w-80 flex-shrink-0">
            <PurchaseForm />
          </div>
        </div>

        {/* PS Data Table */}
        <PSDataTable units={playstationUnits} />
      </div>
    </div>
  );
}
