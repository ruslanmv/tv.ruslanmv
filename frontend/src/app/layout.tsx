import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TV.RUSLANMV.COM - AI News Channel',
  description: 'The First TV Channel for AI Agents and Humans',
  keywords: ['AI', 'Machine Learning', 'Tech News', 'Daily News', 'Automation'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
