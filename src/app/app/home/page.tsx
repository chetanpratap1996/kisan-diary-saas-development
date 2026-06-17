"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatDate, formatCurrency, daysDiff } from "@/lib/utils";
import { t } from "@/lib/translations";
import type { TranslationKey } from "@/lib/translations";
import {
  Plus, Droplets, Leaf, Users, Package, MapPin, Clock, Activity,
  CheckCircle2, ChevronRight, Sprout, HandCoins, BookText, Pencil,
  ShieldCheck, AlertCircle, PieChart, TrendingUp, TrendingDown,
  Flame, Star, Wind, Mic, ArrowUpRight, Wheat, ChevronLeft,
  BarChart3, CloudRain, Sun, Cloud, Thermometer, RefreshCw,
  Zap, ClipboardList, CalendarDays, DollarSign, StickyNote, HardHat, Check
} from "lucide-react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ActivityLog {
  id: string;
  activityType: string;
  date: string;
  note?: string;
  workers?: number;
}
interface SeasonSummary {
  totalLogs: number;
  totalExpense: number;
  totalIncome: number;
  netProfitLoss: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

// Realistic mandi prices (₹/quintal) — static mock, will be replaced with API later
const MANDI_PRICES: Record<string, { price: number; change: number; unit: string }> = {
  default:   { price: 2180, change: +45,  unit: "क्विंटल" },
  चावल:     { price: 2183, change: +32,  unit: "क्विंटल" },
  rice:      { price: 2183, change: +32,  unit: "क्विंटल" },
  गेहूं:    { price: 2275, change: -18,  unit: "क्विंटल" },
  wheat:     { price: 2275, change: -18,  unit: "क्विंटल" },
  मक्का:    { price: 1890, change: +22,  unit: "क्विंटल" },
  maize:     { price: 1890, change: +22,  unit: "क्विंटल" },
  सोयाबीन:  { price: 4420, change: +110, unit: "क्विंटल" },
  सरसों:    { price: 5380, change: -65,  unit: "क्विंटल" },
  कपास:     { price: 6750, change: +180, unit: "क्विंटल" },
  cotton:    { price: 6750, change: +180, unit: "क्विंटल" },
  प्याज:    { price: 1250, change: +90,  unit: "क्विंटल" },
  onion:     { price: 1250, change: +90,  unit: "क्विंटल" },
  आलू:      { price: 1080, change: -40,  unit: "क्विंटल" },
  potato:    { price: 1080, change: -40,  unit: "क्विंटल" },
  गन्ना:    { price: 370,  change: +5,   unit: "क्विंटल" },
  sugarcane: { price: 370,  change: +5,   unit: "क्विंटल" },
};

const NEARBY_CROPS = [
  { name: "गेहूं",    emoji: "🌾", price: 2275, change: -18  },
  { name: "सरसों",   emoji: "🌻", price: 5380, change: -65  },
  { name: "सोयाबीन", emoji: "🫘", price: 4420, change: +110 },
  { name: "मक्का",   emoji: "🌽", price: 1890, change: +22  },
  { name: "प्याज",   emoji: "🧅", price: 1250, change: +90  },
  { name: "आलू",    emoji: "🥔", price: 1080, change: -40  },
];

const WISDOM_QUOTES: TranslationKey[] = ["quote1", "quote2", "quote3", "quote4", "quote5", "quote6"];

// Crop emojis based on crop name keywords
function getCropEmoji(cropName: string): string {
  const n = cropName.toLowerCase();
  if (n.includes("चावल") || n.includes("rice") || n.includes("धान")) return "🌾";
  if (n.includes("गेहूं") || n.includes("wheat")) return "🌾";
  if (n.includes("मक्का") || n.includes("maize") || n.includes("corn")) return "🌽";
  if (n.includes("कपास") || n.includes("cotton")) return "🪴";
  if (n.includes("सरसों") || n.includes("mustard")) return "🌻";
  if (n.includes("गन्ना") || n.includes("sugarcane")) return "🎋";
  if (n.includes("सोयाबीन") || n.includes("soy")) return "🫘";
  if (n.includes("प्याज") || n.includes("onion")) return "🧅";
  if (n.includes("आलू") || n.includes("potato")) return "🥔";
  if (n.includes("टमाटर") || n.includes("tomato")) return "🍅";
  return "🌱";
}

// Time-of-day logic: returns one of 4 states
function getTimeState(hour: number): "raat" | "subah" | "dopahar" | "sham" {
  if (hour >= 4 && hour < 12) return "subah";
  if (hour >= 12 && hour < 17) return "dopahar";
  if (hour >= 17 && hour < 21) return "sham";
  return "raat";
}

function getGreeting(timeState: "raat" | "subah" | "dopahar" | "sham", lang: string): string {
  const greetings: Record<string, Record<string, string>> = {
    raat:    { hi: "शुभ रात्रि", en: "Good Night",      mr: "शुभ रात्री",   pa: "ਸ਼ੁਭ ਰਾਤ" },
    subah:   { hi: "सुप्रभात",  en: "Good Morning",     mr: "सुप्रभात",     pa: "ਸ਼ੁਭ ਸਵੇਰ" },
    dopahar: { hi: "नमस्ते",    en: "Good Afternoon",   mr: "नमस्कार",      pa: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ" },
    sham:    { hi: "शुभ संध्या",en: "Good Evening",     mr: "शुभ संध्या",   pa: "ਸ਼ੁਭ ਸ਼ਾਮ" },
  };
  return greetings[timeState][lang] || greetings[timeState]["hi"];
}

// Header gradient based on time state
function getHeaderGradient(timeState: "raat" | "subah" | "dopahar" | "sham"): string {
  switch (timeState) {
    case "subah":   return "from-[#1a5c35] via-[#1d6b3a] to-[#1a5c35]";   // morning green
    case "dopahar": return "from-[#0d4a28] via-[#115e34] to-[#0d4a28]";   // midday deep green
    case "sham":    return "from-[#2d2060] via-[#1e4d30] to-[#0d3320]";   // dusk purple-green
    case "raat":    return "from-[#0a1628] via-[#0d2e1c] to-[#0a1628]";   // night deep dark
    default:        return "from-[#064e3b] to-[#047857]";
  }
}

function getTimeIcon(timeState: "raat" | "subah" | "dopahar" | "sham"): string {
  switch (timeState) {
    case "subah":   return "🌅";
    case "dopahar": return "☀️";
    case "sham":    return "🌇";
    case "raat":    return "🌙";
  }
}

// Crop growth phase label based on days
function getCropPhase(days: number, lang: string): { label: string; emoji: string; pct: number } {
  if (days <= 7)   return { label: t(lang, "phaseSowing"),    emoji: "🌱", pct: 5  };
  if (days <= 25)  return { label: t(lang, "phaseSprouting"),   emoji: "🪴", pct: 25 };
  if (days <= 60)  return { label: t(lang, "phaseGrowing"),   emoji: "🌿", pct: 50 };
  if (days <= 90)  return { label: t(lang, "phaseFlowering"), emoji: "🌸", pct: 70 };
  if (days <= 120) return { label: t(lang, "phaseRipening"),     emoji: "🌾", pct: 87 };
  return             { label: t(lang, "phaseHarvestReady"),    emoji: "🪬", pct: 100 };
}

// Dynamic advisory based on crop phase
function getDynamicAdvisory(days: number, lang: string): string {
  if (days <= 7)   return t(lang, "advSowing");
  if (days <= 25)  return t(lang, "advSprouting");
  if (days <= 60)  return t(lang, "advGrowing");
  if (days <= 90)  return t(lang, "advFlowering");
  if (days <= 120) return t(lang, "advRipening");
  return t(lang, "advHarvestReady");
}

// Quick actions with SEMANTIC color system
const QUICK_ACTIONS = [
  {
    type: "khata",
    translationKey: "khata",
    emoji: "📒",
    icon: BookText,
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconColor: "text-amber-700",
    badgeBg: "bg-amber-100",
    shadow: "shadow-amber-100",
    href: "/app/khata",
    label_hi: "खाता",
    label_en: "Ledger",
  },
  {
    type: "paani",
    translationKey: "water",
    emoji: "💧",
    icon: Droplets,
    bg: "bg-sky-50",
    border: "border-sky-200",
    iconColor: "text-sky-600",
    badgeBg: "bg-sky-100",
    shadow: "shadow-sky-100",
    label_hi: "पानी दिया",
    label_en: "Water",
  },
  {
    type: "dawai",
    translationKey: "pesticide",
    emoji: "🌿",
    icon: Leaf,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    iconColor: "text-emerald-700",
    badgeBg: "bg-emerald-100",
    shadow: "shadow-emerald-100",
    label_hi: "दवाई",
    label_en: "Pesticide",
  },
  {
    type: "majdoor",
    translationKey: "workers",
    emoji: "👷",
    icon: Users,
    bg: "bg-orange-50",
    border: "border-orange-200",
    iconColor: "text-orange-600",
    badgeBg: "bg-orange-100",
    shadow: "shadow-orange-100",
    label_hi: "मजदूर",
    label_en: "Workers",
  },
  {
    type: "bhandar",
    translationKey: "inventory",
    emoji: "📦",
    icon: Package,
    bg: "bg-violet-50",
    border: "border-violet-200",
    iconColor: "text-violet-600",
    badgeBg: "bg-violet-100",
    shadow: "shadow-violet-100",
    href: "/app/inventory",
    label_hi: "भंडार",
    label_en: "Inventory",
  },
  {
    type: "udhaar",
    translationKey: "borrowings",
    emoji: "🤝",
    icon: HandCoins,
    bg: "bg-rose-50",
    border: "border-rose-200",
    iconColor: "text-rose-600",
    badgeBg: "bg-rose-100",
    shadow: "shadow-rose-100",
    href: "/app/borrowings",
    label_hi: "उधार",
    label_en: "Borrowings",
  },
];

const getActionBarColor = (type: string) => {
  const c: Record<string, string> = {
    paani: "bg-sky-400", dawai: "bg-emerald-500",
    majdoor: "bg-orange-400", bhandar: "bg-violet-500",
    udhaar: "bg-rose-400", khata: "bg-amber-400",
  };
  return c[type] || "bg-gray-400";
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { user, activeSeason, activeFarm, apiCall, language, farms } = useApp();
  const router = useRouter();

  const [todayLogs, setTodayLogs]         = useState<ActivityLog[]>([]);
  const [seasonSummary, setSeasonSummary] = useState<SeasonSummary | null>(null);
  const [showLogModal, setShowLogModal]   = useState(false);
  const [selectedAction, setSelectedAction] = useState("");
  const [logNote, setLogNote]             = useState("");
  const [logWorkers, setLogWorkers]       = useState("");
  const [logAmount, setLogAmount]         = useState("");
  const [logDate, setLogDate]             = useState(new Date().toISOString().split("T")[0]);
  const [isLogging, setIsLogging]         = useState(false);
  const [logError, setLogError]           = useState("");
  const [editingLogId, setEditingLogId]   = useState<string | null>(null);
  const [insights, setInsights]           = useState<any>(null);
  const [quoteIdx, setQuoteIdx]           = useState(0);
  const [mandiVisible, setMandiVisible]   = useState(true);
  const [streakDays, setStreakDays]       = useState(0);
  const [mounted, setMounted]             = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);

  const lang = language || "hi";

  // Current time state (recalculate every minute)
  const [timeState, setTimeState] = useState<"raat" | "subah" | "dopahar" | "sham">(
    getTimeState(new Date().getHours())
  );

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTimeState(getTimeState(new Date().getHours()));
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Rotate wisdom quote every 7s
  useEffect(() => {
    const t = setInterval(() => {
      setQuoteIdx((i) => (i + 1) % WISDOM_QUOTES.length);
    }, 7000);
    return () => clearInterval(t);
  }, []);

  // ── Data fetching ───────────────────────────────────────────────────────────
  const fetchTodayLogs = useCallback(async () => {
    if (!activeSeason?.id) return;
    try {
      const result = await apiCall<{ success: boolean; data: ActivityLog[] }>(
        `/api/seasons/${activeSeason.id}/logs`
      );
      if (result.success) {
        const today = new Date().toDateString();
        const todayData = result.data.filter((l) => new Date(l.date).toDateString() === today);
        setTodayLogs(todayData);
        // Calculate streak from data
        const sortedDates = [...new Set(result.data.map((l) =>
          new Date(l.date).toDateString()
        ))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        let streak = 0;
        let cursor = new Date();
        for (const d of sortedDates) {
          if (new Date(d).toDateString() === cursor.toDateString()) {
            streak++;
            cursor.setDate(cursor.getDate() - 1);
          } else break;
        }
        setStreakDays(streak);
      }
    } catch (e) { console.error(e); }
  }, [activeSeason?.id, apiCall]);

  const fetchSeasonSummary = useCallback(async () => {
    if (!activeSeason?.id) return;
    try {
      const result = await apiCall<{ success: boolean; data: { summary: SeasonSummary } }>(
        `/api/seasons/${activeSeason.id}/report`
      );
      if (result.success) setSeasonSummary(result.data.summary);
    } catch (e) { console.error(e); }
  }, [activeSeason?.id, apiCall]);

  const fetchInsights = useCallback(async () => {
    try {
      const url = activeFarm?.id ? `/api/user/insights?farmId=${activeFarm.id}` : `/api/user/insights`;
      const result = await apiCall<{ success: boolean; data: any }>(url);
      if (result.success) setInsights(result.data);
    } catch (e) { console.error(e); }
  }, [activeFarm?.id, apiCall]);

  useEffect(() => {
    fetchTodayLogs();
    fetchSeasonSummary();
    fetchInsights();
  }, [fetchTodayLogs, fetchSeasonSummary, fetchInsights]);

  // ── Modal helpers ───────────────────────────────────────────────────────────
  const openLogModal = (actionType: string) => {
    setEditingLogId(null); setSelectedAction(actionType);
    setLogNote(""); setLogWorkers(""); setLogAmount("");
    setLogDate(new Date().toISOString().split("T")[0]);
    setLogError(""); setShowLogModal(true);
  };
  const openEditModal = (log: ActivityLog) => {
    setEditingLogId(log.id); setSelectedAction(log.activityType);
    setLogNote(log.note || ""); setLogWorkers(log.workers ? String(log.workers) : "");
    setLogAmount(""); setLogDate(new Date(log.date).toISOString().split("T")[0]);
    setLogError(""); setShowLogModal(true);
  };

  const handleSaveLog = async () => {
    if (!activeSeason?.id) { setLogError(t(lang, "noActiveSeason" as TranslationKey)); return; }
    setIsLogging(true); setLogError("");
    try {
      if (editingLogId) {
        await apiCall(`/api/seasons/${activeSeason.id}/logs/${editingLogId}`, {
          method: "PUT",
          body: JSON.stringify({ activityType: selectedAction, date: logDate, note: logNote || undefined, workers: logWorkers ? parseInt(logWorkers) : undefined }),
        });
      } else {
        await apiCall(`/api/seasons/${activeSeason.id}/logs`, {
          method: "POST",
          body: JSON.stringify({ activityType: selectedAction, date: logDate, note: logNote || undefined, workers: logWorkers ? parseInt(logWorkers) : undefined, amount: logAmount ? parseFloat(logAmount) : undefined }),
        });
      }
      setShowLogModal(false);
      await fetchTodayLogs();
    } catch (e) { setLogError(t(lang, "error" as TranslationKey)); console.error(e); }
    finally { setIsLogging(false); }
  };

  const confirmCategory = async (logId: string, type: string) => {
    if (!activeSeason?.id) return;
    try {
      await apiCall(`/api/seasons/${activeSeason.id}/logs/${logId}`, { method: "PUT", body: JSON.stringify({ activityType: type }) });
      await fetchTodayLogs();
    } catch (e) { console.error(e); }
  };

  // ── Derived display values ──────────────────────────────────────────────────
  const greeting  = getGreeting(timeState, lang);
  const timeIcon  = getTimeIcon(timeState);
  const headerGrad = getHeaderGradient(timeState);
  const daysActive = activeSeason ? daysDiff(activeSeason.startDate) : 0;
  const cropPhase  = activeSeason ? getCropPhase(daysActive, lang) : null;
  const userName   = user?.name || (t(lang, "farmer"));
  const userState  = user?.state || "India";
  const cropEmoji  = activeSeason ? getCropEmoji(activeSeason.cropName) : "🌱";

  // Mandi price for active crop
  const activeCropKey = activeSeason?.cropName?.toLowerCase() || "";
  const mandiData = MANDI_PRICES[activeSeason?.cropName || ""] || MANDI_PRICES[activeCropKey] || MANDI_PRICES.default;

  // Income/expense bar widths
  const totalFinancial = (seasonSummary?.totalIncome || 0) + (seasonSummary?.totalExpense || 0);
  const incomeWidth = totalFinancial > 0 ? ((seasonSummary?.totalIncome || 0) / totalFinancial) * 100 : 0;
  const expenseWidth = totalFinancial > 0 ? ((seasonSummary?.totalExpense || 0) / totalFinancial) * 100 : 0;

  // Today's status colour
  const statusColor = todayLogs.length === 0 ? "gray" : todayLogs.length <= 2 ? "amber" : "green";

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#f4f6f8] pb-6">

      {/* ═══════════════════════════════════════════════════════════════════════
          1. HERO HEADER — time-aware gradient
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className={`relative bg-gradient-to-br ${headerGrad} px-5 pt-14 pb-14 overflow-hidden`}>

        {/* Ambient glow blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white opacity-[0.04] blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-green-400 opacity-[0.08] blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        {/* Decorative grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        {/* Top row: date + avatar */}
        <div className="relative z-10 flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-1.5 text-green-200/80 text-xs font-semibold mb-1 tracking-wide">
              <span className="text-sm">{timeIcon}</span>
              <span>
                {new Date().toLocaleDateString(lang === "en" ? "en-IN" : (lang === "mr" ? "mr-IN" : (lang === "pa" ? "pa-IN" : "hi-IN")), {
                  weekday: "long", day: "numeric", month: "long"
                })}
              </span>
            </div>
            <h1 className="text-white text-[28px] font-black leading-tight">
              {greeting}, <span className="text-green-300">{userName.split(" ")[0]}</span>!
            </h1>
            <div className="flex items-center gap-1.5 mt-1.5">
              <MapPin className="w-3 h-3 text-green-300/70" />
              <span className="text-green-200/70 text-xs font-medium">{userState}</span>
              {streakDays >= 3 && (
                <span className="ml-2 flex items-center gap-1 bg-orange-500/25 border border-orange-400/30 text-orange-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                  <Flame className="w-3 h-3" />
                  {streakDays} {t(lang, "dayStreak")}
                </span>
              )}
            </div>
          </div>

          {/* Avatar */}
          <button
            onClick={() => router.push("/app/settings")}
            className="relative mt-1 flex-shrink-0"
          >
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-green-300/50 to-white/20 blur-sm" />
            <div className="relative w-[52px] h-[52px] rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-lg border-2 border-white/20">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 text-base">{cropEmoji}</span>
          </button>
        </div>

        {/* ── Active Season Card ─────────────────────────────────────────── */}
        {activeSeason ? (
          <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-4 shadow-2xl">

            {/* Season header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/25 border border-green-400/25 text-green-100 text-[10px] font-black uppercase tracking-widest mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                  {t(lang, "activeSeasonLabel" as TranslationKey)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{cropEmoji}</span>
                  <h2 className="text-white text-2xl font-black tracking-tight">{activeSeason.cropName}</h2>
                </div>
                {cropPhase && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-sm">{cropPhase.emoji}</span>
                    <span className="text-green-200/80 text-xs font-medium">{cropPhase.label}</span>
                    <span className="text-green-400/60 text-xs">• Day {daysActive}</span>
                  </div>
                )}
              </div>

              {/* Circular progress */}
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg viewBox="0 0 56 56" className="w-16 h-16 -rotate-90">
                  <circle cx="28" cy="28" r="22" stroke="rgba(255,255,255,0.12)" strokeWidth="4" fill="none" />
                  <circle
                    cx="28" cy="28" r="22"
                    stroke="url(#progressGrad)"
                    strokeWidth="4" fill="none"
                    strokeDasharray={138.2}
                    strokeDashoffset={138.2 - ((cropPhase?.pct || 0) / 100) * 138.2}
                    className="transition-all duration-1000"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#6ee7b7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-white font-black text-base leading-none">{daysActive}</span>
                  <span className="text-white/60 text-[8px] font-bold uppercase">{t(lang, "days")}</span>
                </div>
              </div>
            </div>

            {/* Finance bar */}
            {seasonSummary && (
              <div className="mb-3 bg-black/20 rounded-xl p-3 border border-white/10">
                <div className="flex justify-between text-[11px] font-bold text-white/80 mb-2">
                  <span>
                    <span className="text-green-300 mr-1">↑</span>
                    {t(lang, "incomeLabel")}: <span className="text-white">{formatCurrency(seasonSummary.totalIncome || 0)}</span>
                  </span>
                  <span>
                    <span className="text-red-300 mr-1">↓</span>
                    {t(lang, "expenseLabel")}: <span className="text-white">{formatCurrency(seasonSummary.totalExpense || 0)}</span>
                  </span>
                </div>
                <div className="flex h-2 rounded-full overflow-hidden bg-white/10 gap-0.5">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-400 rounded-l-full transition-all duration-1000" style={{ width: `${incomeWidth}%` }} />
                  <div className="bg-gradient-to-r from-red-400 to-rose-400 rounded-r-full transition-all duration-1000" style={{ width: `${expenseWidth}%` }} />
                </div>
                <div className={`mt-2 text-[11px] font-black ${(seasonSummary.netProfitLoss || 0) >= 0 ? "text-green-300" : "text-red-300"}`}>
                  {(seasonSummary.netProfitLoss || 0) >= 0 ? "✓ " : "⚠ "}
                  {t(lang, "net")}: {formatCurrency(seasonSummary.netProfitLoss || 0)}
                </div>
              </div>
            )}

            {/* Dynamic today advisory */}
            <div className="bg-white/15 border border-white/15 rounded-xl p-3 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/30 border border-blue-400/30 flex items-center justify-center flex-shrink-0">
                <span className="text-sm">💡</span>
              </div>
              <div>
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-0.5">{t(lang, "todaysAdvisory")}</p>
                <p className="text-white text-sm font-semibold leading-snug">{getDynamicAdvisory(daysActive, lang)}</p>
              </div>
            </div>

            {/* Farm name row */}
            {activeFarm && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center gap-1.5 text-green-200/70 text-xs font-medium">
                  <MapPin className="w-3.5 h-3.5 text-green-300" />
                  <span className="font-bold text-green-100">{activeFarm.name}</span>
                </div>
                <span className="text-[11px] bg-white/15 border border-white/10 px-2 py-0.5 rounded-full text-white/80 font-semibold">
                  {activeFarm.sizeAcre} {t(lang, "acre" as TranslationKey)}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-dashed border-white/25 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-white/15 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/20">
              <Sprout className="w-8 h-8 text-green-200" />
            </div>
            <p className="text-green-100 font-semibold mb-4 text-base">{t(lang, "noActiveSeason" as TranslationKey)}</p>
            <Button
              onClick={() => router.push("/app/settings")}
              className="bg-white text-green-700 hover:bg-green-50 font-bold rounded-xl px-6 h-11 shadow-lg border-0"
            >
              <Plus className="w-4 h-4 mr-2" /> {t(lang, "addSeason" as TranslationKey)}
            </Button>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          2. MANDI PRICE TICKER
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-green-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-2.5 flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            <span className="whitespace-nowrap">{t(lang, "mandi")}</span>
          </div>
          <div className="overflow-hidden flex-1">
            <div className="flex gap-5 px-3 py-2 overflow-x-auto scrollbar-hide" ref={tickerRef}>
              {/* Active crop first */}
              {activeSeason && (
                <div className="flex-shrink-0 flex items-center gap-1.5 border-r border-gray-100 pr-5">
                  <span className="text-base">{cropEmoji}</span>
                  <div>
                    <p className="text-gray-700 text-[10px] font-black whitespace-nowrap">{activeSeason.cropName}</p>
                    <p className="text-gray-900 text-xs font-black">₹{mandiData.price.toLocaleString('en-IN')}</p>
                  </div>
                  <span className={`text-[10px] font-black flex items-center gap-0.5 ${mandiData.change >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {mandiData.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {mandiData.change >= 0 ? "+" : ""}{mandiData.change}
                  </span>
                </div>
              )}
              {NEARBY_CROPS.map((crop, i) => (
                <div key={i} className="flex-shrink-0 flex items-center gap-1.5 border-r border-gray-100 pr-5 last:border-0">
                  <span className="text-base">{crop.emoji}</span>
                  <div>
                    <p className="text-gray-500 text-[10px] font-semibold whitespace-nowrap">{crop.name}</p>
                    <p className="text-gray-800 text-xs font-black">₹{crop.price.toLocaleString('en-IN')}</p>
                  </div>
                  <span className={`text-[10px] font-black flex items-center gap-0.5 ${crop.change >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {crop.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {crop.change >= 0 ? "+" : ""}{Math.abs(crop.change)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => router.push("/app/market")}
            className="flex-shrink-0 bg-gray-50 border-l border-gray-100 px-3 py-2.5 text-green-600 hover:bg-green-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          3. TODAY'S STATUS — pulled up over header
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="px-4 mt-4">
        <div
          className={`relative bg-white rounded-2xl shadow-sm border overflow-hidden flex items-center gap-4 p-4 transition-all duration-300 ${
            statusColor === "green" ? "border-green-100" :
            statusColor === "amber" ? "border-amber-100" :
            "border-gray-100"
          }`}
        >
          {/* Left accent bar */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${
            statusColor === "green" ? "bg-green-500" :
            statusColor === "amber" ? "bg-amber-400" :
            "bg-gray-200"
          }`} />

          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ml-1 ${
            statusColor === "green" ? "bg-gradient-to-br from-green-100 to-green-200" :
            statusColor === "amber" ? "bg-gradient-to-br from-amber-100 to-amber-200" :
            "bg-gradient-to-br from-gray-50 to-gray-100"
          }`}>
            {todayLogs.length > 0
              ? <CheckCircle2 className={`w-6 h-6 ${statusColor === "green" ? "text-green-600" : "text-amber-500"}`} />
              : <Activity className="w-6 h-6 text-gray-400" />
            }
          </div>

          <div className="flex-1 min-w-0">
            <p className={`text-[10px] font-black uppercase tracking-wider mb-0.5 ${
              statusColor === "green" ? "text-green-600" :
              statusColor === "amber" ? "text-amber-600" :
              "text-gray-400"
            }`}>{t(lang, "todayWork" as TranslationKey)}</p>
            <p className="text-gray-900 font-extrabold text-lg leading-tight">
              {todayLogs.length > 0
                ? `${todayLogs.length} ${t(lang, "completedTasks" as TranslationKey)}`
                : t(lang, "nothingYet" as TranslationKey)
              }
            </p>
          </div>

          {todayLogs.length > 0 && (
            <div className="flex -space-x-2.5 flex-shrink-0">
              {todayLogs.slice(0, 3).map((log, i) => {
                const act = QUICK_ACTIONS.find((a) => a.type === log.activityType);
                const Icon = act?.icon || Activity;
                return (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${act?.bg || "bg-gray-100"} ${act?.iconColor || "text-gray-500"}`}
                    style={{ zIndex: 10 - i }}
                  >
                    <Icon className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                );
              })}
              {todayLogs.length > 3 && (
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[9px] font-black text-gray-600 shadow-sm z-0">
                  +{todayLogs.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          4. QUICK ACTIONS
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-gray-800 font-black text-base flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" strokeWidth={2} fill="currentColor" />
            {t(lang, "quickLog")}
          </h2>
        </div>

        {/* Top 2 — large wide cards */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {QUICK_ACTIONS.slice(0, 2).map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.type}
                onClick={() => action.href ? router.push(action.href) : openLogModal(action.type)}
                className={`group relative flex flex-col items-center justify-center gap-2.5 h-24 rounded-2xl border-2 ${action.bg} ${action.border} shadow-sm ${action.shadow} hover:shadow-md active:scale-95 transition-all duration-200 overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                <div className={`w-10 h-10 rounded-xl ${action.badgeBg} flex items-center justify-center ${action.iconColor} shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <span className={`text-sm font-black ${action.iconColor} relative z-10`}>
                  {t(lang, action.translationKey as TranslationKey)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom 4 — square icon grid */}
        <div className="grid grid-cols-4 gap-3">
          {QUICK_ACTIONS.slice(2).map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.type}
                onClick={() => action.href ? router.push(action.href) : openLogModal(action.type)}
                className="group flex flex-col items-center gap-2"
              >
                <div className={`w-full aspect-square rounded-[1.25rem] border-2 ${action.bg} ${action.border} ${action.iconColor} flex items-center justify-center shadow-sm ${action.shadow} hover:shadow-md active:scale-95 transition-all duration-200 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.25rem]" />
                  <Icon className="w-6 h-6 relative z-10 group-hover:scale-110 transition-transform duration-200" strokeWidth={2.5} />
                </div>
                <span className={`text-[11px] font-black text-center leading-tight ${action.iconColor}`}>
                  {t(lang, action.translationKey as TranslationKey)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* No farms CTA */}
      {farms.length === 0 && (
        <div className="mx-4 mt-6">
          <div className="bg-white border border-dashed border-green-200 rounded-2xl p-7 flex flex-col items-center text-center shadow-sm">
            <div className="text-4xl mb-3">🌾</div>
            <h3 className="font-black text-gray-900 mb-1.5 text-lg">
              {t(lang, "noFarmsYet")}
            </h3>
            <p className="text-gray-500 text-sm mb-5 max-w-xs leading-relaxed">
              {t(lang, "addFirstFarm")}
            </p>
            <Button
              onClick={() => router.push("/app/settings")}
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 h-11 font-bold shadow-lg shadow-green-600/20 border-0"
            >
              <Plus className="w-4 h-4 mr-2" /> {t(lang, "addFarm" as TranslationKey)}
            </Button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          5. VOICE AI SECTION
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="px-4 mt-6">
        <div className="relative bg-gradient-to-br from-[#0a2012] via-[#0d2e1a] to-[#071209] rounded-3xl p-6 border border-green-900/40 shadow-2xl overflow-hidden">
          {/* Ambient blobs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-48 h-48 bg-green-600/10 rounded-full blur-[60px] -translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] translate-x-1/3 translate-y-1/3" />
          </div>

          <div className="relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/15 border border-green-500/25 text-green-400 text-[10px] font-black tracking-widest uppercase mb-4">
              <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              {t(lang, "aiAssistantBadge" as TranslationKey)}
            </div>

            <div className="flex items-start gap-4">
              {/* Mic button with ripple */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" style={{ animationDuration: "2s" }} />
                <div className="absolute inset-1 rounded-full bg-green-500/15 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.5s" }} />
                <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-900/50 border border-green-400/30">
                  <Mic className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-white font-black text-xl leading-tight mb-1">
                  {t(lang, "voiceRecord")}
                </h3>
                <p className="text-green-100/50 text-xs mb-3">{t(lang, "voiceMicPrompt")}</p>
                <div className="bg-white/8 border border-white/12 rounded-xl px-4 py-3 backdrop-blur-sm">
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider mb-1">💡 {t(lang, "voiceTrySaying")}</p>
                  <p className="text-white font-bold text-sm">"{t(lang, "voiceExample")}"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          6. AI ADVISORY — Smart Cards
          ═══════════════════════════════════════════════════════════════════════ */}
      {insights && (
        <div className="px-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-gray-900 font-black text-base flex items-center gap-1.5">
              <span className="text-lg">✨</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">AI Advisory</span>
            </h2>
            {insights.location && (
              <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-100 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {insights.location}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3">

            {/* P&L Button */}
            <button
              onClick={() => router.push("/app/analytics")}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl h-14 flex items-center justify-between px-5 font-bold shadow-lg shadow-blue-500/25 group transition-all active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <PieChart className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm">{t(lang, "viewProfitability")}</span>
              </div>
              <ArrowUpRight className="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </button>

            {/* Weather Advisory Card */}
            <div className={`relative overflow-hidden rounded-2xl p-4 border shadow-sm ${
              insights.weatherAlert === "rain"
                ? "bg-gradient-to-br from-blue-800 to-slate-800 border-blue-700/40"
                : insights.weatherAlert === "heat"
                ? "bg-gradient-to-br from-orange-500 to-red-600 border-red-500/40"
                : "bg-gradient-to-br from-emerald-600 to-teal-700 border-emerald-500/40"
            }`}>
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
              <div className="relative z-10 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/25 flex-shrink-0 shadow-inner">
                  {insights.weatherAlert === "rain"
                    ? <CloudRain className="w-5 h-5 text-white" />
                    : insights.weatherAlert === "heat"
                    ? <Sun className="w-5 h-5 text-white" />
                    : <Cloud className="w-5 h-5 text-white" />
                  }
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 border border-white/15 text-white text-[9px] font-black uppercase tracking-widest mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    {t(lang, "liveUpdate")}
                  </div>
                  <h3 className="text-white font-bold text-sm leading-snug">{insights.advisory}</h3>
                </div>
              </div>
            </div>

            {/* Smart Activities — Horizontal scroll */}
            {insights.smartSchedules && insights.smartSchedules.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-gray-800 font-black text-sm mb-3 flex items-center gap-2">
                  <span className="text-base">📅</span>
                  {t(lang, "upcomingActivities")}
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                  {insights.smartSchedules.map((schedule: any, idx: number) => (
                    <div
                      key={idx}
                      className={`flex-shrink-0 w-44 rounded-2xl border p-3 shadow-sm ${
                        schedule.status === "delayed"
                          ? "bg-amber-50 border-amber-200"
                          : "bg-green-50 border-green-200"
                      }`}
                    >
                      <div className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md inline-block mb-2 ${
                        schedule.status === "delayed"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        {schedule.daysRemaining === 0
                          ? (t(lang, "today"))
                          : schedule.daysRemaining < 0
                          ? (`${Math.abs(schedule.daysRemaining)} ${t(lang, "lateDays")}`)
                          : (`${schedule.daysRemaining} ${t(lang, "inDays")}`)}
                      </div>
                      <h4 className="font-black text-gray-900 text-sm mb-1 leading-tight">{schedule.title}</h4>
                      <p className={`text-[10px] font-bold flex items-center gap-1 mb-3 ${schedule.status === "delayed" ? "text-amber-700" : "text-green-700"}`}>
                        <Clock className="w-3 h-3" /> {formatDate(schedule.recommendedDate)}
                      </p>
                      <Button
                        onClick={() => openLogModal(schedule.activityType)}
                        variant="outline"
                        size="sm"
                        className={`w-full h-8 rounded-xl text-xs font-black border transition-all ${
                          schedule.status === "delayed"
                            ? "border-amber-200 text-amber-700 hover:bg-amber-100"
                            : "border-green-200 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        ✓ {t(lang, "markDone")}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inventory Alerts */}
            {insights.inventoryAlerts?.length > 0 && insights.inventoryAlerts.map((alert: any, i: number) => (
              <div key={alert.id || `alert-${i}`} className="bg-red-50 rounded-2xl p-4 border border-red-100 flex gap-3 items-start shadow-sm">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-red-200 flex-shrink-0 shadow-sm">
                  <Package className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-red-600 text-[10px] font-black uppercase tracking-wider mb-0.5">{t(lang, "lowInventory")}</p>
                  <p className="text-red-900 text-sm font-semibold leading-tight">{alert.message}</p>
                </div>
              </div>
            ))}

            {/* Trust Score Card */}
            <div
              onClick={() => router.push("/app/credit")}
              className="bg-white rounded-2xl p-4 border border-gray-100 cursor-pointer hover:border-green-200 hover:shadow-md transition-all group relative overflow-hidden shadow-sm"
            >
              {/* Score gauge bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
                <div
                  className="h-full bg-gradient-to-r from-red-400 via-amber-400 to-green-500 transition-all duration-1000"
                  style={{ width: `${((insights.trustScore || 0) / 850) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11">
                    <svg viewBox="0 0 40 40" className="w-11 h-11 -rotate-90">
                      <circle cx="20" cy="20" r="16" stroke="#f0fdf4" strokeWidth="4" fill="none" />
                      <circle
                        cx="20" cy="20" r="16"
                        stroke="url(#scoreGrad)"
                        strokeWidth="4" fill="none"
                        strokeDasharray="100.5"
                        strokeDashoffset={100.5 - ((insights.trustScore || 0) / 850) * 100.5}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#22c55e" />
                          <stop offset="100%" stopColor="#16a34a" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-green-600 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-900 font-black text-sm flex items-center gap-1.5">
                      Kisan Trust Score
                      <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase tracking-wider">NEW</span>
                    </p>
                    <div className="flex items-end gap-1.5 mt-0.5">
                      <span className="text-xl font-black text-green-600 leading-none">{insights.trustScore || "—"}</span>
                      <span className="text-xs font-bold text-gray-400 mb-0.5">/ 850</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-green-500 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          7. TODAY'S ACTIVITY LOG
          ═══════════════════════════════════════════════════════════════════════ */}
      {todayLogs.length > 0 && (
        <div className="px-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-gray-900 font-black text-base flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
              {t(lang, "recentActivity" as TranslationKey).replace("📋 ", "")}
            </h2>
            <button className="text-green-600 text-xs font-black uppercase tracking-wider hover:text-green-700 flex items-center gap-0.5">
              {t(lang, "viewAll" as TranslationKey)} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2.5">
            {todayLogs.map((log) => {
              const isOther = log.activityType === "other" || !QUICK_ACTIONS.find((a) => a.type === log.activityType);
              const action = QUICK_ACTIONS.find((a) => a.type === log.activityType);
              const Icon = action?.icon || AlertCircle;
              return (
                <div
                  key={log.id}
                  className={`group bg-white rounded-2xl p-4 border shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden flex items-start gap-3 ${
                    isOther ? "border-amber-200" : "border-gray-100 hover:border-green-100 cursor-pointer"
                  }`}
                  onClick={!isOther ? () => openEditModal(log) : undefined}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${isOther ? "bg-amber-400" : getActionBarColor(log.activityType)}`} />

                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ml-1 ${
                    isOther ? "bg-amber-100 text-amber-600" : `${action?.bg} ${action?.iconColor}`
                  }`}>
                    <Icon className="w-5 h-5" strokeWidth={2.5} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-black text-gray-800 text-sm">
                        {isOther ? "अज्ञात गतिविधि" : (t(lang, action?.translationKey as TranslationKey))}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <p className="text-gray-400 text-[10px] font-medium">{formatDate(log.date)}</p>
                        {!isOther && (
                          <button className="p-1 text-gray-300 hover:text-green-600 transition-colors">
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    {log.note && <p className="text-gray-500 text-xs line-clamp-1">{log.note}</p>}
                    {isOther && (
                      <div className="mt-2">
                        <p className="text-[10px] font-black text-amber-700 mb-1.5 uppercase tracking-wide">यह क्या था?</p>
                        <div className="flex flex-wrap gap-1.5">
                          {QUICK_ACTIONS.filter((a) => ["paani", "dawai", "majdoor"].includes(a.type)).map((a) => (
                            <button
                              key={a.type}
                              onClick={(e) => { e.stopPropagation(); confirmCategory(log.id, a.type); }}
                              className={`text-[10px] font-black border px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors ${a.bg} ${a.border} ${a.iconColor} hover:opacity-80`}
                            >
                              <a.icon className="w-3 h-3" /> {t(lang, a.translationKey as TranslationKey)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {log.workers && !isOther && (
                      <div className="mt-1.5 inline-flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-0.5 rounded-md text-[10px] font-bold">
                        <Users className="w-3 h-3" /> {log.workers} {t(lang, "workersCount")}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          8. MOTIVATIONAL FOOTER
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="mx-4 mt-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, #16a34a 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
          <p className="text-[10px] text-green-500 font-black uppercase tracking-widest mb-2 relative z-10 flex items-center justify-center gap-1.5">
            <Leaf className="w-3.5 h-3.5" strokeWidth={2} />
            {t(lang, "farmersWisdom")}
          </p>
          <p className="text-green-800 font-semibold text-sm leading-relaxed relative z-10 transition-all duration-500">
            "{t(lang, WISDOM_QUOTES[quoteIdx])}"
          </p>
          {/* Dot indicators */}
          <div className="flex justify-center gap-1.5 mt-3">
            {WISDOM_QUOTES.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i === quoteIdx ? "w-4 h-1.5 bg-green-500" : "w-1.5 h-1.5 bg-green-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          LOG ACTIVITY MODAL
          ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={showLogModal} onOpenChange={setShowLogModal}>
        <DialogContent className="max-w-md mx-auto rounded-[2rem] p-0 overflow-hidden border-0 shadow-2xl">
          {(() => {
            const action = QUICK_ACTIONS.find((a) => a.type === selectedAction);
            const Icon = action?.icon || Activity;
            return (
              <>
                <div className={`px-6 pt-8 pb-6 ${action?.bg || "bg-gray-50"}`}>
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-18 h-18 w-16 h-16 ${action?.badgeBg || "bg-gray-100"} rounded-2xl flex items-center justify-center shadow-sm mb-4 ${action?.iconColor || "text-gray-600"}`}>
                      <Icon className="w-8 h-8" strokeWidth={2.5} />
                    </div>
                    <DialogTitle className="text-2xl font-black text-gray-800">
                      {editingLogId ? t(lang, "edit" as TranslationKey) : t(lang, "addLog" as TranslationKey)}
                    </DialogTitle>
                    <p className={`text-sm mt-1 font-semibold ${action?.iconColor || "text-gray-500"}`}>
                      {action ? (t(lang, action.translationKey as TranslationKey)) : ""}
                    </p>
                  </div>
                </div>

                <div className="p-6 space-y-4 bg-white">
                  <div>
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" strokeWidth={2} /> {t(lang, "date" as TranslationKey)}
                  </label>
                    <Input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)}
                      className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:ring-green-500 focus:border-green-500 text-gray-800 font-medium" />
                  </div>

                  {!editingLogId && (
                    <div>
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 flex justify-between items-center">
                        <span className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5" strokeWidth={2} />
                          {t(lang, "amountRs")}
                        </span>
                        <span className="text-gray-300 normal-case font-normal text-[10px]">{t(lang, "optional")}</span>
                      </label>
                      <Input type="number" placeholder={t(lang, "eg500")} value={logAmount}
                        onChange={(e) => setLogAmount(e.target.value)} min="0"
                        className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:ring-green-500 focus:border-green-500 text-gray-800 font-medium" />
                    </div>
                  )}

                  {selectedAction === "majdoor" && (
                    <div>
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <HardHat className="w-3.5 h-3.5" strokeWidth={1.5} /> {t(lang, "workerCount" as TranslationKey)}
                      </label>
                      <Input type="number" placeholder={t(lang, "eg5")} value={logWorkers}
                        onChange={(e) => setLogWorkers(e.target.value)} min="1"
                        className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:ring-orange-500 focus:border-orange-500 text-gray-800 font-medium" />
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <StickyNote className="w-3.5 h-3.5" strokeWidth={1.5} /> {t(lang, "note" as TranslationKey)}
                  </label>
                    <Input placeholder={t(lang, "optionalNote")} value={logNote}
                      onChange={(e) => setLogNote(e.target.value)}
                      className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:ring-green-500 focus:border-green-500 text-gray-800 font-medium" />
                  </div>

                  {logError && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {logError}
                    </div>
                  )}

                  <Button
                    className={`w-full h-14 rounded-xl text-white font-black text-base shadow-lg transition-all active:scale-98 ${
                      action?.type === "majdoor" ? "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20" :
                      action?.type === "paani" ? "bg-sky-500 hover:bg-sky-600 shadow-sky-500/20" :
                      "bg-green-600 hover:bg-green-700 shadow-green-600/20"
                    }`}
                    onClick={handleSaveLog}
                    isLoading={isLogging}
                  >
                    <Check className="w-4 h-4 mr-1.5" strokeWidth={3} /> {t(lang, "save" as TranslationKey)}
                  </Button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

    </div>
  );
}
