import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@/lib/i18n';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'HR Salary Sender — Automated WhatsApp Payroll System',
  description: 'Enterprise WhatsApp Payroll Statement Automation System for Weekly and Monthly payroll statements.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={inter.variable}>
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased flex flex-col selection:bg-brand-600 selection:text-white">
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
