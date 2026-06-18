import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://kisan.naturexpress.in'
  const now = new Date()

  return [
    // Landing page — highest priority
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    // Demo pages — high value for SEO (public, crawlable)
    {
      url: `${baseUrl}/khata-demo`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/voice-demo`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    // Login — important for discovery
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    // Legal pages — needed for trust & compliance
    {
      url: `${baseUrl}/app/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/app/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
