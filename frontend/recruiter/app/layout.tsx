import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Torbit Jobs - Recruiter & Employer Portal',
  description: 'Post Jobs, Track Candidate Applications, and Hire Top Verified Talent on Torbit Jobs',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
      { url: 'https://pub-eb6c1f57d56548118a8cce2abc2983f2.r2.dev/Assets/Torbit%20Logo.png' }
    ],
    shortcut: '/favicon.png',
    apple: [
      { url: '/favicon.png' },
      { url: 'https://pub-eb6c1f57d56548118a8cce2abc2983f2.r2.dev/Assets/Torbit%20Logo.png' }
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body className="antialiased bg-[#F8FAFC] text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
