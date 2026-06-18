"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Image from "next/image";
import {
  Users,
  Tractor,
  Activity,
  TrendingUp,
  Shield,
  RefreshCw,
  LogOut,
  BarChart3,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";

interface AdminOverview {
  totalUsers: number;
  newToday: number;
  newThisWeek: number;
  dau: number;
  mau: number;
  totalFarms: number;
  totalSeasons: number;
  totalLogs: number;
}

interface AdminStats {
  overview: AdminOverview;
  stateDistribution: { state: string; count: number }[];
  languageDistribution: { language: string; count: number }[];
  userGrowth: { date: string; count: number }[];
}

export default function AdminDashboardPage() {
  const { user, isLoading, logout, apiCall } = useApp();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  // Auth guard — redirect non-admins immediately
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/login");
      } else if (!user.isAdmin) {
        router.replace("/app/home");
      }
    }
  }, [isLoading, user, router]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError("");
    try {
      const result = await apiCall<{ success: boolean; data: AdminStats }>("/api/admin/stats");
      if (result.success) {
        setStats(result.data);
      }
    } catch (err) {
      setStatsError("Stats लोड नहीं हो पाई। कृपया दोबारा कोशिश करें।");
      console.error("[Admin] Failed to load stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    if (user?.isAdmin) {
      fetchStats();
    }
  }, [user, fetchStats]);

  const handleLogout = useCallback(() => {
    logout();
    router.push("/login");
  }, [logout, router]);

  if (isLoading || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center" role="status" aria-label="Loading">
        <div className="w-10 h-10 rounded-full border-2 border-green-500 border-t-transparent animate-spin" aria-hidden="true" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats?.overview.totalUsers ?? 0, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Total Farms", value: stats?.overview.totalFarms ?? 0, icon: Tractor, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "New Users Today", value: stats?.overview.newToday ?? 0, icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "DAU (Active Today)", value: stats?.overview.dau ?? 0, icon: Activity, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Total Seasons", value: stats?.overview.totalSeasons ?? 0, icon: BarChart3, color: "text-rose-400", bg: "bg-rose-500/10" },
    { label: "Total Activity Logs", value: stats?.overview.totalLogs ?? 0, icon: Database, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.jpg" alt="Kisan Diary" width={36} height={36} className="rounded-full" />
            <div>
              <h1 className="text-sm font-bold text-white">Kisan Diary</h1>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Shield className="w-3 h-3" aria-hidden="true" /> Admin Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">
              Welcome, {user.name}
            </span>
            <Button
              onClick={fetchStats}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800 h-8 px-3 text-xs gap-1.5"
              aria-label="Refresh stats"
              disabled={statsLoading}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${statsLoading ? "animate-spin" : ""}`} aria-hidden="true" />
              Refresh
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-900 text-red-400 hover:bg-red-950 h-8 px-3 text-xs gap-1.5"
              aria-label="Logout from admin"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error */}
        {statsError && (
          <div
            role="alert"
            className="mb-6 bg-red-900/30 border border-red-800 rounded-xl p-4 text-red-300 text-sm"
          >
            {statsError}
          </div>
        )}

        {/* Stats Grid */}
        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="text-lg font-bold text-white mb-4">Platform Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
                aria-label={`${card.label}: ${formatNumber(card.value)}`}
              >
                <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`} aria-hidden="true">
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div className="text-2xl font-bold text-white">
                  {statsLoading ? (
                    <div className="w-16 h-7 bg-gray-800 rounded animate-pulse" aria-hidden="true" />
                  ) : (
                    formatNumber(card.value)
                  )}
                </div>
                <div className="text-sm text-gray-400 mt-1">{card.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section aria-labelledby="quick-links-heading">
          <h2 id="quick-links-heading" className="text-lg font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <a
              href="/api/admin/users"
              target="_blank"
              rel="noopener"
              className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-green-800 transition-colors group"
              aria-label="View all users API"
            >
              <Users className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" aria-hidden="true" />
              <div>
                <div className="font-semibold text-white text-sm">View Users</div>
                <div className="text-xs text-gray-400">API: /api/admin/users</div>
              </div>
            </a>
            <a
              href="/api/health"
              target="_blank"
              rel="noopener"
              className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-green-800 transition-colors group"
              aria-label="Check system health"
            >
              <Activity className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" aria-hidden="true" />
              <div>
                <div className="font-semibold text-white text-sm">Health Check</div>
                <div className="text-xs text-gray-400">API: /api/health</div>
              </div>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
