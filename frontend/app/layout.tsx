import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Torbit Jobs | Premier Career & Job Portal',
  description: 'Enterprise Job Portal for Top Talent & Verified Hiring Employers.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/icon.png', type: 'image/png' }
    ],
    shortcut: '/favicon.png',
    apple: [
      { url: '/favicon.png' },
      { url: '/apple-icon.png' }
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var token = localStorage.getItem('token') || localStorage.getItem('adminToken');
                  var userStr = localStorage.getItem('user') || localStorage.getItem('adminUser');
                  if (token && userStr) {
                    document.documentElement.classList.add('user-is-authenticated');
                    var u = JSON.parse(userStr);
                    var role = (u.role || '').toUpperCase();
                    if (role === 'ADMIN' || localStorage.getItem('adminToken')) {
                      document.documentElement.setAttribute('data-auth-role', 'ADMIN');
                    } else if (role === 'RECRUITER' || role === 'COMPANY') {
                      document.documentElement.setAttribute('data-auth-role', 'RECRUITER');
                    } else {
                      document.documentElement.setAttribute('data-auth-role', 'JOB_SEEKER');
                    }
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">{children}</body>
    </html>
  );
}