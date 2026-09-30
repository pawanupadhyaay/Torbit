import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Torbit Realty - Recruiter & Employer Portal',
  description: 'Post Jobs, Track Candidate Applications, and Hire Top Verified Talent on Torbit Realty',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#F8FAFC] text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
