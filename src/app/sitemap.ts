import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://toycathon.pierc.org';

  const staticPages = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/dashboard',
    '/dashboard/profile',
    '/dashboard/teams',
    '/dashboard/teams/create',
    '/dashboard/submission',
    '/admin',
    '/admin/announcements',
    '/admin/categories',
    '/admin/health',
    '/admin/profile',
    '/admin/teams',
    '/admin/users',
    '/privacy-policy',
    '/terms-of-service',
  ];

  const sitemapEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.8,
  }));

  return sitemapEntries;
}
