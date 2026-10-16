import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://jobs.torbitrealty.com').replace(/\/$/, '');
  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://torbit-job-kdpdj.ondigitalocean.app').replace(/\/$/, '');

  // 1. Core Static Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/companies`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/seeker`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/recruiter`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // 2. Dynamic Job Listings
  let dynamicJobRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${backendUrl}/api/jobs`, {
      next: { revalidate: 3600 }
    });
    if (res.ok) {
      const data = await res.json();
      const jobs = Array.isArray(data) ? data : (data.jobs || []);
      dynamicJobRoutes = jobs.map((job: any) => ({
        url: `${siteUrl}/jobs?jobId=${job.id}`,
        lastModified: job.updatedAt ? new Date(job.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch (err) {
    // Gracefully handle if backend is not reachable at build-time
  }

  // 3. Dynamic Category Pages
  let dynamicCategoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${backendUrl}/api/categories`, {
      next: { revalidate: 86400 }
    });
    if (res.ok) {
      const data = await res.json();
      const categories = Array.isArray(data) ? data : (data.categories || []);
      dynamicCategoryRoutes = categories.map((cat: any) => ({
        url: `${siteUrl}/categories?cat=${encodeURIComponent(cat.slug || cat.name || '')}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch (err) {
    // Gracefully handle if backend is not reachable at build-time
  }

  return [...staticRoutes, ...dynamicJobRoutes, ...dynamicCategoryRoutes];
}
