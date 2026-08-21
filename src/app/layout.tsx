import './globals.css';
import React from 'react';
import { AuthProvider } from '@/components/providers/AuthProvider';

const getBaseUrl = (): string => {
  if (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.length > 0) {
    return process.env.NEXTAUTH_URL.startsWith('http')
      ? process.env.NEXTAUTH_URL
      : `https://${process.env.NEXTAUTH_URL}`;
  }
  if (process.env.VERCEL_URL && process.env.VERCEL_URL.length > 0) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
};

export const metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: 'MessManager PRO - Bachelor Mess & Expense Tracker',
  description: 'Local-first bachelor mess and shared living expense tracker with Google Drive cloud sync',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MessManager PRO',
  },
  formatDetection: {
    telephone: true,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#F8FAFC',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.cdnfonts.com" />
      </head>
      <body className="antialiased font-sans selection:bg-emerald-500/20 selection:text-emerald-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
