import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://kisan.naturexpress.in'

  return {
    rules: [
      {
        // Main crawlers
        userAgent: ['Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot'],
        allow: ['/', '/khata-demo', '/voice-demo', '/login', '/app/privacy', '/app/terms'],
        disallow: [
          '/api/',
          '/app/home',
          '/app/khata',
          '/app/market',
          '/app/credit',
          '/app/settings',
          '/app/analytics',
          '/app/summary',
          '/app/farms',
          '/app/kharcha',
          '/admin/',
        ],
        crawlDelay: 2,
      },
      {
        // Block all other bots from sensitive areas
        userAgent: '*',
        allow: ['/', '/khata-demo', '/voice-demo', '/login', '/app/privacy', '/app/terms'],
        disallow: [
          '/api/',
          '/admin/',
          '/app/home',
          '/app/khata',
          '/app/market',
          '/app/credit',
          '/app/settings',
          '/app/analytics',
          '/app/summary',
          '/app/farms',
          '/app/kharcha',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
