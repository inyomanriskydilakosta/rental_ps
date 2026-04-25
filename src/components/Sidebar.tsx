'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Gamepad2,
  FileText,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Data Pembeli', href: '/data-pembeli', icon: Users },
  { label: 'Data Playstation', href: '/data-playstation', icon: Gamepad2 },
  { label: 'Laporan', href: '/laporan', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-52 bg-gradient-to-b from-[#0f2d6b] to-[#0a1f4e] flex flex-col z-30 shadow-2xl">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">PS CAPT</p>
            <p className="text-blue-200 text-[9px] leading-tight font-medium">RENTAL PS AMAN DAN CEPAT</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5">
        <p className="text-blue-300/60 text-[9px] font-semibold uppercase tracking-widest px-2 mb-3">
          Main Menu
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-white/15 text-white shadow-lg shadow-black/20 border border-white/20'
                      : 'text-blue-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-blue-300'
                    }`}
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 bg-blue-300 rounded-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-blue-300/40 text-[9px] text-center">© 2024 PS CAPT v1.0</p>
      </div>
    </aside>
  );
}
