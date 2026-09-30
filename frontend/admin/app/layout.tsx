import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Torbit Realty - Admin Master Control Portal',
  description: 'Enterprise Governance, KYC Verifications & Platform Management for Torbit Realty',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="w-full overflow-x-hidden">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className="antialiased bg-[#0B0F19] text-slate-100 min-h-screen w-full max-w-full overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}

