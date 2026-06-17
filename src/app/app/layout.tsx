"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { Home, BookText, Store, User, CreditCard } from "lucide-react";
import { VoiceKhataFAB } from "@/components/khata/VoiceKhataFAB";
import { cn } from "@/lib/utils";
import { t } from "@/lib/translations";

const navItems = [
  { href: "/app/home",     icon: Home,      labelKey: "home"     as const, fallback: "घर"    },
  { href: "/app/khata",    icon: BookText,  labelKey: "khata"    as const, fallback: "हिसाब"  },
  { href: "/app/market",   icon: Store,     labelKey: "market"   as const,   fallback: "मंडी"   },
  { href: "/app/credit",   icon: CreditCard,labelKey: "credit"   as const,   fallback: "ऋण"    },
  { href: "/app/settings", icon: User,      labelKey: "settings" as const, fallback: "प्रोफ़ाइल" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useApp();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center flex flex-col items-center">
          <Image src="/logo.jpg" alt="Kisan Diary" width={80} height={80} className="rounded-full mb-4 animate-pulse" />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  const lang = user?.language ?? "hi";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto">

      {/* Top bar: show Login button when not logged in */}
      {!user && (
        <div className="bg-green-600 text-white text-xs flex items-center justify-between px-4 py-2 sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="Kisan Diary" width={24} height={24} className="rounded-full" />
            <span className="font-semibold">{t(lang, "guestModeView")}</span>
          </div>
          <Link
            href="/login"
            className="bg-white text-green-700 font-semibold px-3 py-1 rounded-full text-xs"
          >
            {t(lang, "loginSignupBtn")}
          </Link>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      <VoiceKhataFAB />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white/95 backdrop-blur-md border-t border-gray-100 z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center gap-0.5 w-full h-full transition-all duration-200"
              >
                {/* Active pill background */}
                {isActive && (
                  <span className="absolute top-2 inset-x-1.5 h-8 rounded-xl bg-green-50 transition-all" />
                )}
                <item.icon
                  className={cn(
                    "relative z-10 w-[22px] h-[22px] transition-all duration-200",
                    isActive ? "text-green-700" : "text-gray-400"
                  )}
                  strokeWidth={isActive ? 2 : 1.5}
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
