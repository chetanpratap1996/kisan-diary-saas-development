import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, Noto_Sans_Devanagari, Noto_Sans_Gurmukhi } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import SmoothScroll from "@/components/SmoothScroll";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { HtmlLangUpdater } from "@/components/HtmlLangUpdater";
import ErrorBoundary from "@/components/ErrorBoundary";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-devanagari",
  display: "swap",
});

const notoSansGurmukhi = Noto_Sans_Gurmukhi({
  subsets: ["gurmukhi"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-gurmukhi",
  display: "swap",
});

const BASE_URL = "https://kisan.naturexpress.in";
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-7L9ZL7DF1M";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#16a34a" },
    { media: "(prefers-color-scheme: dark)", color: "#15803d" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: {
    default: "Kisan Diary - किसान डायरी | Farm Management App for Indian Farmers",
    template: "%s | Kisan Diary",
  },
  description:
    "India's #1 free farm management app. Track expenses, income, harvests & market prices in Hindi, Marathi, Punjabi & English. Trusted by thousands of farmers.",
  keywords: [
    "kisan diary",
    "किसान डायरी",
    "farmer app india",
    "farm management app",
    "kharcha tracker",
    "fasal diary",
    "agriculture app hindi",
    "indian farmers app",
    "kheti management",
    "mandi prices today",
    "crop expense tracker",
    "खेती ऐप",
    "किसान ऐप",
    "farming app marathi",
    "punjabi farming app",
  ],
  authors: [{ name: "Kisan Diary Team", url: BASE_URL }],
  creator: "Naturexpress",
  publisher: "Naturexpress",
  metadataBase: new URL(BASE_URL),

  alternates: {
    canonical: BASE_URL,
    languages: {
      "hi-IN": BASE_URL,
      "en-IN": `${BASE_URL}?lang=en`,
      "mr-IN": `${BASE_URL}?lang=mr`,
      "pa-IN": `${BASE_URL}?lang=pa`,
    },
  },

  openGraph: {
    type: "website",
    locale: "hi_IN",
    alternateLocale: ["en_IN", "mr_IN", "pa_IN"],
    url: BASE_URL,
    title: "Kisan Diary - किसान डायरी | Farm Management App",
    description:
      "India's #1 free farm management app. Track expenses, income, harvests & market prices in your language.",
    siteName: "Kisan Diary",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "Kisan Diary - Farm Management App for Indian Farmers",
        type: "image/jpeg",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Kisan Diary - किसान डायरी | Farm Management App",
    description:
      "India's #1 free farm management app. Track expenses, income & market prices in Hindi, Marathi, Punjabi.",
    images: ["/logo.jpg"],
    creator: "@kisandiary",
    site: "@kisandiary",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },

  manifest: "/manifest.webmanifest",

  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192x192.png", sizes: "192x192" }],
    shortcut: "/icon-192x192.png",
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kisan Diary",
  },

  formatDetection: {
    telephone: false,
  },
};

// JSON-LD Structured Data — Organization
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Kisan Diary",
  url: BASE_URL,
  logo: `${BASE_URL}/logo.jpg`,
  description:
    "India's #1 free farm management app for Indian farmers. Track expenses, income, harvests and market prices.",
  foundingDate: "2024",
  areaServed: "IN",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    availableLanguage: ["Hindi", "English", "Marathi", "Punjabi"],
  },
  sameAs: [],
};

// JSON-LD Structured Data — WebApplication
const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Kisan Diary",
  url: BASE_URL,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
  },
  description:
    "Free farm management app for Indian farmers. Track expenses, income, harvests, and mandi prices.",
  inLanguage: ["hi", "en", "mr", "pa"],
  screenshot: `${BASE_URL}/logo.jpg`,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="hi" className="scroll-smooth">
      <head>
        {/* Preconnect to external origins for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://yshwiferhyavpppbgamf.supabase.co" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
        />
      </head>
      <body
        className={`${inter.variable} ${notoSansDevanagari.variable} ${notoSansGurmukhi.variable} bg-gray-50 text-gray-900 antialiased`}
      >
        {/* PWA install prompt capture — must run before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.deferredPrompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.deferredPrompt = e;
              });
            `,
          }}
        />

        {/* Google Analytics — only loads when GA_ID is configured */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                  send_page_view: true,
                  anonymize_ip: true,
                });
              `}
            </Script>
          </>
        )}

        <ErrorBoundary>
          <ToastProvider>
            <SmoothScroll>
              <AppProvider>
                <HtmlLangUpdater />
                <OfflineBanner />
                {children}
              </AppProvider>
            </SmoothScroll>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
