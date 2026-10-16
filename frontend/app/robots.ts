import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://jobs.torbitrealty.com').replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api/*',
          '/seeker/dashboard/*',
          '/recruiter/dashboard/*',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
