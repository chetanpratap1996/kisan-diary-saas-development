import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-devanagari",
});

export const viewport: Viewport = {
  themeColor: "#16a34a",
};

export const metadata: Metadata = {
  title: "Kisan Diary - किसान डायरी | Farm Activity Logger",
  description: "Free farm activity logging app for Indian farmers. Track expenses, harvests, and activities.",
  keywords: "kisan diary, farmer app, farm management, kharcha tracker, fasal diary",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="hi">
      <body className={`${inter.variable} ${notoSansDevanagari.variable} bg-gray-50 text-gray-900 antialiased`}>
        <script dangerouslySetInnerHTML={{ __html: `
          window.deferredPrompt = null;
          window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            window.deferredPrompt = e;
          });
        `}} />
        <SmoothScroll>
          <AppProvider>
            {children}
          </AppProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
