"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { Home, BookText, Store, User, CreditCard } from "lucide-react";
import { VoiceKhataFAB } from "@/components/khata/VoiceKhataFAB";
import { cn } from "@/lib/utils";
import { t } from "@/lib/translations";

const navItems = [
  { href: "/app/home",     icon: Home,       labelKey: "home"     as const, fallback: "घर",      ariaLabel: "Home - मुख्य पृष्ठ"     },
  { href: "/app/khata",    icon: BookText,   labelKey: "khata"    as const, fallback: "हिसाब",   ariaLabel: "Khata - हिसाब-किताब"    },
  { href: "/app/market",   icon: Store,      labelKey: "market"   as const, fallback: "मंडी",    ariaLabel: "Market - मंडी भाव"       },
  { href: "/app/credit",   icon: CreditCard, labelKey: "credit"   as const, fallback: "ऋण",     ariaLabel: "Credit - उधार"           },
  { href: "/app/settings", icon: User,       labelKey: "settings" as const, fallback: "प्रोफ़ाइल", ariaLabel: "Settings - प्रोफ़ाइल" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  // Redirect unauthenticated users away from protected pages
  useEffect(() => {
    if (!isLoading && !user) {
      // Guest mode — allow viewing but show login banner
      // Full redirect to login only for highly sensitive pages
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-green-50 flex items-center justify-center"
        role="status"
        aria-label="Loading Kisan Diary"
      >
        <div className="text-center flex flex-col items-center gap-4">
          <Image
            src="/logo.jpg"
            alt="Kisan Diary"
            width={80}
            height={80}
            className="rounded-full animate-pulse shadow-md"
            priority
          />
          <div
            className="w-8 h-8 rounded-full border-2 border-green-600 border-t-transparent animate-spin"
            aria-hidden="true"
          />
          <p className="text-sm text-gray-500 font-medium">लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  const lang = user?.language ?? "hi";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto">

      {/* Guest mode top bar */}
      {!user && (
        <div
          role="banner"
          className="bg-green-600 text-white text-xs flex items-center justify-between px-4 py-2 sticky top-0 z-50 shadow-md"
        >
          <div className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="Kisan Diary" width={24} height={24} className="rounded-full" />
            <span className="font-semibold">{t(lang, "guestModeView")}</span>
          </div>
          <Link
            href="/login"
            className="bg-white text-green-700 font-semibold px-3 py-1 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1 focus:ring-offset-green-600"
            aria-label="Login or create account"
          >
            {t(lang, "loginSignupBtn")}
          </Link>
        </div>
      )}

      {/* Skip to main content (accessibility) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:bg-white focus:text-green-700 focus:px-4 focus:py-2 focus:rounded-xl focus:font-semibold focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Main content */}
      <main id="main-content" className="flex-1 overflow-y-auto pb-20" tabIndex={-1}>
        {children}
      </main>

      <VoiceKhataFAB />

      {/* Bottom Navigation */}
      <nav
        aria-label="Main navigation"
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white/95 backdrop-blur-md border-t border-gray-100 z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex justify-around items-center h-16 px-2" role="list">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                role="listitem"
                aria-label={item.ariaLabel}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 w-full h-full transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1 rounded-lg"
                )}
              >
                {/* Active pill background */}
                {isActive && (
                  <span
                    className="absolute top-2 inset-x-1.5 h-8 rounded-xl bg-green-50 transition-all"
                    aria-hidden="true"
                  />
                )}
                <item.icon
                  className={cn(
                    "relative z-10 w-[22px] h-[22px] transition-all duration-200",
                    isActive ? "text-green-700" : "text-gray-400"
                  )}
                  strokeWidth={isActive ? 2 : 1.5}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    "relative z-10 text-[10px] font-semibold tracking-wide transition-all duration-200",
                    isActive ? "text-green-700" : "text-gray-400"
                  )}
                >
                  {t(lang, item.labelKey) || item.fallback}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
