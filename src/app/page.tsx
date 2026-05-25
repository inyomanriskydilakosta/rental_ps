import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { Gamepad2, Clock, CheckCircle2, Receipt } from 'lucide-react';
import StatCard from '@/components/StatCard';
import ActiveSessionsTable from '@/components/ActiveSessionsTable';
import PurchaseForm from '@/components/PurchaseForm';
import PSDataTable from '@/components/PSDataTable';
import { DBActiveSession, DBPlaystationUnit, DBCustomer, ActiveSession, PlaystationUnit, Customer } from '@/types';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [{ data: rawUnits }, { data: rawSessions }, { data: txToday }, { data: rawCustomers }] = await Promise.all([
    supabase.from('playstation_units').select('*').order('id'),
    supabase
      .from('active_sessions')
      .select('*')
      .eq('status', 'BERLANGSUNG')
      .order('created_at', { ascending: false }),
    supabase
      .from('transactions')
      .select('id')
      .eq('date', new Date().toISOString().split('T')[0]),
    supabase.from('customers').select('*').order('name'),
  ]);

  const units: PlaystationUnit[] = (rawUnits as DBPlaystationUnit[] ?? []).map((u) => ({
    id: u.id,
    name: u.name,
    type: u.type,
    status: u.status,
  }));

  const activeSessions: ActiveSession[] = (rawSessions as DBActiveSession[] ?? []).map((s) => ({
    id: s.id,
    customerName: s.customer_name,
    phone: s.phone,
    psUnitId: s.ps_unit_id,
    psType: s.ps_type as ActiveSession['psType'],
    psName: s.ps_name,
    startTime: s.start_time,
    endTime: s.end_time,
    status: s.status as ActiveSession['status'],
  }));

  const customers: Customer[] = (rawCustomers as DBCustomer[] ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    memberId: c.member_id ?? undefined,
    totalSessions: c.total_sessions,
    totalSpent: c.total_spent,
    joinDate: c.join_date,
  }));

  const availableUnits = units.filter((u) => u.status === 'TERSEDIA');

  const stats = {
    totalPS: units.length,
    psInUse: units.filter((u) => u.status === 'DIGUNAKAN').length,
    psAvailable: availableUnits.length,
    totalTransactions: txToday?.length ?? 0,
    activeSessions: activeSessions.length,
  };

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
          value={stats.totalPS}
          subtitle="Unit terdaftar"
          icon={
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Gamepad2 className="w-5 h-5 text-blue-600" />
            </div>
          }
        />
        <StatCard
          title="PS yang Digunakan"
          value={stats.psInUse}
          highlight={`${stats.activeSessions} Sesi aktif`}
          highlightColor="text-orange-500 font-semibold text-xs"
          icon={
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
          }
        />
        <StatCard
          title="PS Tersedia"
          value={stats.psAvailable}
          subtitle="Unit siap digunakan"
          icon={
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          }
        />
        <StatCard
          title="Total Transaksi"
          value={stats.totalTransactions}
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
            <PurchaseForm availableUnits={availableUnits} customers={customers} />
          </div>
        </div>

        {/* PS Data Table */}
        <PSDataTable units={units} />
      </div>
    </div>
  );
}
