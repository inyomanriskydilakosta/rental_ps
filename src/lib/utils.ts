import { PSType } from '@/types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function getPSTypeColor(type: PSType): string {
  const colors: Record<PSType, string> = {
    PS5: 'bg-blue-500 text-white',
    PS4: 'bg-green-500 text-white',
    PS3: 'bg-purple-500 text-white',
    PS2: 'bg-gray-500 text-white',
  };
  return colors[type] || 'bg-gray-500 text-white';
}

export function getPSTypeBadgeColor(type: PSType): string {
  const colors: Record<PSType, string> = {
    PS5: 'bg-blue-100 text-blue-700 border border-blue-200',
    PS4: 'bg-green-100 text-green-700 border border-green-200',
    PS3: 'bg-purple-100 text-purple-700 border border-purple-200',
    PS2: 'bg-gray-100 text-gray-700 border border-gray-200',
  };
  return colors[type] || 'bg-gray-100 text-gray-700';
}

export function calculateDuration(start: string, end: string): number {
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);
  return (endHour * 60 + endMin) - (startHour * 60 + startMin);
}

export function getCurrentTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}
