import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kisan Diary - किसान डायरी',
    short_name: 'Kisan Diary',
    description: 'India\'s #1 free farm management app. Track expenses, income, harvests & market prices in Hindi, Marathi, Punjabi & English.',
    start_url: '/app/home',
    scope: '/',
    display: 'standalone',
    background_color: '#f0fdf4',
    theme_color: '#16a34a',
    orientation: 'portrait-primary',
    lang: 'hi',
    dir: 'ltr',
    categories: ['productivity', 'finance', 'agriculture'],
    prefer_related_applications: false,

    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],

    shortcuts: [
      {
        name: 'खर्चा जोड़ें',
        short_name: 'Add Expense',
        description: 'Quickly add a farm expense',
        url: '/app/kharcha',
        icons: [{ src: '/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'मंडी भाव',
        short_name: 'Market Prices',
        description: 'Check today\'s mandi prices',
        url: '/app/market',
        icons: [{ src: '/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'हिसाब-किताब',
        short_name: 'Khata',
        description: 'View your khata ledger',
        url: '/app/khata',
        icons: [{ src: '/icon-192x192.png', sizes: '192x192' }],
      },
    ],

    screenshots: [
      {
        src: '/logo.jpg',
        sizes: '800x600',
        type: 'image/jpeg',
        label: 'Kisan Diary Home Screen',
      },
    ],
  }
}
