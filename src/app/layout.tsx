import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import LayoutShell from '@/components/LayoutShell';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'PS CAPT - Rental PS Aman dan Cepat',
  description: 'Sistem manajemen rental PlayStation - PS CAPT. Kelola sesi rental, data pelanggan, dan laporan transaksi dengan mudah.',
  keywords: ['rental ps', 'playstation rental', 'ps capt', 'manajemen rental'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="bg-gray-50 font-sans antialiased">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
