"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Language } from "@/lib/translations";

interface User {
  id: string;
  phone: string;
  username?: string;
  name: string;
  state: string;
  district?: string | null;
  village?: string | null;
  pincode?: string | null;
  pmKisanId?: string | null;
  language: Language;
  isAdmin: boolean;
}

interface Farm {
  id: string;
  name: string;
  sizeAcre: number;
  location: string;
  landType?: string | null;
  irrigationSource?: string | null;
  soilType?: string | null;
  activeSeason?: Season | null;
}

interface Season {
  id: string;
  farmId: string;
  cropName: string;
  startDate: string;
  endDate?: string | null;
  status: string;
}

interface AppContextType {
  user: User | null;
  token: string | null;
  language: Language;
  farms: Farm[];
  activeFarm: Farm | null;
  activeSeason: Season | null;
  isLoading: boolean;
  isOnline: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
  setLanguage: (lang: Language) => void;
  setActiveFarm: (farm: Farm | null) => void;
  setActiveSeason: (season: Season | null) => void;
  refreshFarms: () => Promise<void>;
  apiCall: <T>(url: string, options?: RequestInit, retries?: number) => Promise<T>;
}

const AppContext = createContext<AppContextType | null>(null);

// ─── API call with timeout and retry ─────────────────────────────────────────
const TIMEOUT_MS = 15_000; // 15 seconds
const RETRY_DELAYS = [500, 1500, 3000]; // ms

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

// ─── Duplicate request prevention ────────────────────────────────────────────
const pendingRequests = new Map<string, Promise<unknown>>();

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [language, setLanguageState] = useState<Language>("hi");
  const [farms, setFarms] = useState<Farm[]>([]);
  const [activeFarm, setActiveFarm] = useState<Farm | null>(null);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("kisan_token");
    const savedUser = localStorage.getItem("kisan_user");
    const savedLang = localStorage.getItem("kisan_lang") as Language;

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        // Corrupted data — clear it
        localStorage.removeItem("kisan_token");
        localStorage.removeItem("kisan_user");
      }
    }
    if (savedLang) setLanguageState(savedLang);
    setIsLoading(false);
  }, []);

  // Track online/offline state
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    setIsOnline(navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const apiCall = useCallback(async <T,>(
    url: string,
    options?: RequestInit,
    retries = 2
  ): Promise<T> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options?.headers as Record<string, string>),
    };

    const currentToken = localStorage.getItem("kisan_token");
    if (currentToken) {
      headers["Authorization"] = `Bearer ${currentToken}`;
    }

    const requestOptions = { ...options, headers };

    // Deduplicate identical GET requests
    const isGet = !options?.method || options.method === "GET";
    const dedupeKey = isGet ? url : null;

    if (dedupeKey && pendingRequests.has(dedupeKey)) {
      return pendingRequests.get(dedupeKey) as Promise<T>;
    }

    const execute = async (): Promise<T> => {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const response = await fetchWithTimeout(url, requestOptions, TIMEOUT_MS);
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || `Request failed with status ${response.status}`);
          }

          return data as T;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));

          // Don't retry on client errors (4xx) or aborts
          if (err instanceof Error && err.name === "AbortError") {
            throw new Error("अनुरोध का समय समाप्त हो गया। कृपया दोबारा कोशिश करें।");
          }

          const statusMatch = lastError.message.match(/status (\d+)/);
          if (statusMatch) {
            const status = parseInt(statusMatch[1]);
            if (status >= 400 && status < 500) throw lastError;
          }

          // Wait before retrying
          if (attempt < retries) {
            await new Promise((res) => setTimeout(res, RETRY_DELAYS[attempt] ?? 1000));
          }
        }
      }

      throw lastError ?? new Error("अनुरोध विफल रहा।");
    };

    const promise = execute().finally(() => {
      if (dedupeKey) pendingRequests.delete(dedupeKey);
    });

    if (dedupeKey) pendingRequests.set(dedupeKey, promise);

    return promise;
  }, []);

  const refreshFarms = useCallback(async () => {
    if (!token) return;
    try {
      const result = await apiCall<{ success: boolean; data: Farm[] }>("/api/farms");
      if (result.success) {
        setFarms(result.data);
        if (result.data.length > 0 && !activeFarm) {
          setActiveFarm(result.data[0]);
          if (result.data[0].activeSeason) {
            setActiveSeason(result.data[0].activeSeason);
          }
        }
      }
    } catch (error) {
      // Silently fail — farms will show empty state
      console.error("[AppContext] Failed to refresh farms:", error);
    }
  }, [token, apiCall, activeFarm]);

  useEffect(() => {
    if (token) {
      refreshFarms();
    }
  }, [token, refreshFarms]);

  const login = useCallback((newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    setLanguageState(newUser.language as Language);
    localStorage.setItem("kisan_token", newToken);
    localStorage.setItem("kisan_user", JSON.stringify(newUser));
    localStorage.setItem("kisan_lang", newUser.language);
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...patch };
      localStorage.setItem("kisan_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setFarms([]);
    setActiveFarm(null);
    setActiveSeason(null);
    localStorage.removeItem("kisan_token");
    localStorage.removeItem("kisan_user");
    pendingRequests.clear();
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("kisan_lang", lang);
    // Also update the HTML lang attribute immediately
    document.documentElement.setAttribute("lang", lang);
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        language,
        farms,
        activeFarm,
        activeSeason,
        isLoading,
        isOnline,
        login,
        logout,
        updateUser,
        setLanguage,
        setActiveFarm,
        setActiveSeason,
        refreshFarms,
        apiCall,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
