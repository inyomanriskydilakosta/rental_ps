export type PSType = 'PS5' | 'PS4' | 'PS3' | 'PS2';
export type PSStatus = 'TERSEDIA' | 'DIGUNAKAN';
export type SessionStatus = 'BERLANGSUNG' | 'SELESAI';

export interface PlaystationUnit {
  id: number;
  name: string;
  type: PSType;
  status: PSStatus;
}

export interface ActiveSession {
  id: number;
  customerName: string;
  phone: string;
  psType: PSType;
  startTime: string;
  endTime: string;
  status: SessionStatus;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  memberId?: string;
  totalSessions: number;
  totalSpent: number;
  joinDate: string;
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
  psType: PSType | '';
  startTime: string;
  endTime: string;
}
