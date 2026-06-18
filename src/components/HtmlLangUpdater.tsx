"use client";

import { useEffect } from "react";

/**
 * Updates the <html lang=""> attribute dynamically based on the user's
 * stored language preference. This fixes the hardcoded lang="hi" issue.
 */
const LANGUAGE_MAP: Record<string, string> = {
  hi: "hi",
  en: "en",
  mr: "mr",
  pa: "pa",
  te: "te",
  ta: "ta",
};

export function HtmlLangUpdater() {
  useEffect(() => {
    const updateLang = () => {
      const savedLang = localStorage.getItem("kisan_lang") ?? "hi";
      const lang = LANGUAGE_MAP[savedLang] ?? "hi";
      document.documentElement.setAttribute("lang", lang);
    };

    updateLang();

    // Listen for storage changes (e.g., if user switches language in another tab)
    const handler = (e: StorageEvent) => {
      if (e.key === "kisan_lang") updateLang();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return null;
}
