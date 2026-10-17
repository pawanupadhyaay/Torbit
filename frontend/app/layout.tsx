import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://jobs.torbitrealty.com'),
  title: 'Torbit Jobs | Premier Career & Job Portal',
  description: 'Enterprise Job Portal for Top Talent & Verified Hiring Employers.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' }
    ],
    shortcut: '/favicon.png',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#ffffff',
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
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Torbit Jobs" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        {/* Preload High-Priority LCP Hero Background for Mobile & Desktop */}
        <link
          rel="preload"
          as="image"
          href="/hero-bg-mobile.webp"
          type="image/webp"
          media="(max-width: 767px)"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          href="/hero-bg.webp"
          type="image/webp"
          media="(min-width: 768px)"
          fetchPriority="high"
        />
        <link rel="preconnect" href="https://pub-eb6c1f57d56548118a8cce2abc2983f2.r2.dev" />
        {/* Google AdSense - lazyOnload loads after page is fully interactive to maximize mobile performance */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5357796196782631"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
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