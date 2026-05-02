export type PSType = 'PS5' | 'PS4' | 'PS3' | 'PS2';
export type PSStatus = 'TERSEDIA' | 'DIGUNAKAN';
export type SessionStatus = 'BERLANGSUNG' | 'SELESAI';

// ── App-level interfaces (camelCase) ──────────────────────────────────────────

export interface PlaystationUnit {
  id: number;
  name: string;
  type: PSType;
  status: PSStatus;
  created_at?: string;
}

export interface ActiveSession {
  id: number;
  customerName: string;
  phone: string;
  psUnitId?: number | null;
  psType: PSType;
  psName: string;
  startTime: string;
  endTime: string;
  status: SessionStatus;
  created_at?: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  memberId?: string;
  totalSessions: number;
  totalSpent: number;
  joinDate: string;
  created_at?: string;
}

export interface Transaction {
  id: number;
  customerName: string;
  phone: string;
  psType: PSType;
  psName: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  amount: number;
  date: string;
  status: 'LUNAS' | 'BELUM_LUNAS';
  created_at?: string;
}

export interface DashboardStats {
  totalPS: number;
  psInUse: number;
  psAvailable: number;
  totalTransactions: number;
  activeSessions: number;
}

export interface PurchaseFormData {
  customerName: string;
  phone: string;
  psUnitId: string; // selected unit id
  psType: PSType | '';
  psName: string;
  startTime: string;
  endTime: string;
}

// ── DB row types (snake_case — matches Supabase columns exactly) ───────────────

export interface DBPlaystationUnit {
  id: number;
  name: string;
  type: PSType;
  status: PSStatus;
  created_at: string;
}

export interface DBActiveSession {
  id: number;
  customer_name: string;
  phone: string;
  ps_unit_id: number | null;
  ps_type: string;
  ps_name: string;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
}

export interface DBCustomer {
  id: number;
  name: string;
  phone: string;
  member_id: string | null;
  total_sessions: number;
  total_spent: number;
  join_date: string;
  created_at: string;
}

export interface DBTransaction {
  id: number;
  customer_name: string;
  phone: string;
  ps_type: string;
  ps_name: string;
  start_time: string;
  end_time: string;
  duration: number;
  amount: number;
  date: string;
  status: string;
  created_at: string;
}
