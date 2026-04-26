'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserCircle2, ChevronDown, Bell, Menu } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/' },
  { label: 'Data Pembeli', href: '/data-pembeli' },
  { label: 'Data Playstation', href: '/data-playstation' },
  { label: 'Laporan', href: '/laporan' },
];

interface TopbarProps {
  onMenuToggle?: () => void;
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
  const pathname = usePathname();

  // Resolve active page label for mobile breadcrumb
  const activeLabel =
    navItems.find((item) => item.href === pathname)?.label ?? 'Dashboard';

  return (
    <header className="fixed top-0 left-0 lg:left-52 right-0 h-16 bg-white border-b border-gray-100 z-20 shadow-sm">
      <div className="flex items-center h-full px-4 sm:px-6 gap-3">

        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          aria-label="Toggle menu"
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600 transition-colors flex-shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile: current page name; Desktop: nav links */}
        <div className="flex items-center flex-1 min-w-0">
          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative ${
                    isActive
                      ? 'text-blue-700 font-semibold'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile: active page title */}
          <span className="lg:hidden text-sm font-semibold text-gray-800 truncate">
            {activeLabel}
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Notification bell */}
          <button
            aria-label="Notifikasi"
            className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>

          {/* Divider — hidden on very small screens */}
          <div className="hidden sm:block w-px h-8 bg-gray-200" />

          {/* Admin Profile */}
          <button className="flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors group">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
              <UserCircle2 className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-gray-800 leading-tight">Admin</p>
              <p className="text-[10px] text-gray-400 leading-tight">Petugas Rental</p>
            </div>
            <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors ml-0.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
