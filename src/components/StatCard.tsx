import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: ReactNode;
  highlight?: string;
  highlightColor?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  highlight,
  highlightColor,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-start gap-3 mb-3">
        {icon}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900 leading-none mb-1">{value}</p>
        {highlight ? (
          <p className={`text-xs font-semibold ${highlightColor}`}>{highlight}</p>
        ) : (
          <p className="text-xs text-gray-400">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
