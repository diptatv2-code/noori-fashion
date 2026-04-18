import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://noori.diptait.com.bd').trim();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/account', '/checkout', '/cart', '/wishlist'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
