import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'HR Salary Sender - Automated WhatsApp Salary Statements',
  description: 'Upload an Excel file and send personalized salary notifications via WhatsApp Cloud API.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased flex flex-col selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
