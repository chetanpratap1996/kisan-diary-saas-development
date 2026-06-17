"use client";

import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid
} from "recharts";
import { ArrowLeft, TrendingUp, TrendingDown, Sprout, MapPin, AlertTriangle, AlertCircle, PieChart } from "lucide-react";

interface FarmAnalytics {
  farm: { id: string; name: string; sizeAcre: number };
  overall: { totalIncome: number; totalExpense: number; netProfit: number; isProfit: boolean };
  seasons: {
    seasonId: string;
    cropName: string;
    startDate: string;
    status: string;
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    profitPerAcre: number;
    biggestSink: { category: string; label: string; amount: number; percentage: number } | null;
  }[];
}

export default function AnalyticsDashboard() {
  const { activeFarm, apiCall } = useApp();
  const router = useRouter();
  const [data, setData] = useState<FarmAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!activeFarm?.id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const result = await apiCall<{ success: boolean; data: FarmAnalytics }>(
        `/api/farms/${activeFarm.id}/analytics`
      );
      if (result.success) {
        setData(result.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [activeFarm?.id, apiCall]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Crunching the numbers...</p>
        </div>
      </div>
    );
  }

  if (!activeFarm || !data) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <PieChart className="w-10 h-10 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Farm Selected</h2>
        <p className="text-gray-500 text-sm mb-6 max-w-xs">Select a farm to view detailed profitability analytics.</p>
        <Button onClick={() => router.push("/app/farms")} className="bg-blue-600 hover:bg-blue-700 h-12 px-6 rounded-xl font-bold">
          Go to Farms
        </Button>
      </div>
    );
  }

  // Prepare chart data
  const chartData = data.seasons.map(s => ({
    name: s.cropName,
    Income: s.totalIncome,
    Expense: s.totalExpense,
    Profit: s.netProfit > 0 ? s.netProfit : 0,
    Loss: s.netProfit < 0 ? Math.abs(s.netProfit) : 0,
  })).reverse(); // Oldest to newest for the chart timeline

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-6 sticky top-0 z-30 shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" /> Profitability
            </h1>
            <p className="text-gray-500 text-xs font-medium flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" /> {data.farm.name} ({data.farm.sizeAcre} Acre)
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 mt-6">
        {/* Enterprise Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gray-900 p-6 shadow-2xl shadow-blue-900/20 mb-8 border border-gray-800">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full blur-[50px] opacity-40"></div>
          
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1 relative z-10">All-Time Farm P&L</p>
          <div className="flex items-end gap-3 mb-6 relative z-10">
            <h2 className="text-4xl font-black text-white tracking-tight">
              {data.overall.netProfit < 0 ? "-" : "+"}{formatCurrency(Math.abs(data.overall.netProfit))}
            </h2>
            <div className={`px-2 py-1 rounded-md text-xs font-bold mb-1.5 ${data.overall.isProfit ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {data.overall.isProfit ? 'Net Profit' : 'Net Loss'}
            </div>
          </div>

          <div className="flex gap-4 relative z-10 border-t border-gray-800 pt-4 mt-2">
            <div className="flex-1">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">Total Revenue</p>
              <p className="text-green-400 font-bold">{formatCurrency(data.overall.totalIncome)}</p>
            </div>
            <div className="w-px bg-gray-800"></div>
            <div className="flex-1">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-0.5">Total Cost</p>
              <p className="text-red-400 font-bold">{formatCurrency(data.overall.totalExpense)}</p>
            </div>
          </div>
        </div>

        {/* Comparative Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-8">
            <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-600" /> Revenue vs Cost by Crop
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                    formatter={(value: any) => formatCurrency(Number(value) || 0)}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="Income" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="Expense" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Breakdown by Cycle */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 px-1">
            <Sprout className="w-4 h-4 text-green-600" /> Cycle Performance (Per Acre)
          </h3>
          
          <div className="space-y-4">
            {data.seasons.map((season) => (
              <div key={season.seasonId} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 relative overflow-hidden group hover:border-blue-200 transition-colors">
                {/* Crop Status Badge */}
                <div className="absolute top-5 right-5">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${season.status === 'active' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                    {season.status}
                  </span>
                </div>

                <div className="mb-4 pr-16">
                  <h4 className="text-lg font-black text-gray-900">{season.cropName}</h4>
                  <p className="text-gray-400 text-xs font-medium">{formatDate(season.startDate)}</p>
                </div>

                {/* Per Acre Metrics */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profit Margin</span>
                    <span className={`text-sm font-black ${season.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'} flex items-center gap-1`}>
                      {season.netProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {formatCurrency(Math.abs(season.netProfit))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600/80 uppercase tracking-wider">P&L Per Acre</span>
                    <span className="text-base font-black text-blue-700 bg-blue-100/50 px-2 py-0.5 rounded-lg border border-blue-200/50">
                      {season.profitPerAcre >= 0 ? "+" : "-"}{formatCurrency(Math.abs(season.profitPerAcre))} / Ac
                    </span>
                  </div>
                </div>

                {/* Cost Sink Alert */}
                {season.biggestSink && season.biggestSink.percentage > 0 && (
                  <div className={`rounded-xl p-3 flex items-start gap-3 border ${season.biggestSink.percentage > 30 ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${season.biggestSink.percentage > 30 ? 'bg-white text-red-500 shadow-sm' : 'bg-white text-amber-500 shadow-sm'}`}>
                      <AlertTriangle className="w-4 h-4" strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-wider mb-0.5 ${season.biggestSink.percentage > 30 ? 'text-red-800' : 'text-amber-800'}`}>
                        Major Cost Sink
                      </p>
                      <p className={`text-sm font-semibold leading-tight ${season.biggestSink.percentage > 30 ? 'text-red-900' : 'text-amber-900'}`}>
                        <span className="font-bold">{season.biggestSink.label}</span> is eating up <span className="font-black text-lg">{season.biggestSink.percentage}%</span> of your expenses this cycle ({formatCurrency(season.biggestSink.amount)}).
                      </p>
                    </div>
                  </div>
                )}
                
              </div>
            ))}

            {data.seasons.length === 0 && (
               <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                   <AlertCircle className="w-8 h-8 text-gray-400" />
                 </div>
                 <h4 className="text-gray-900 font-bold mb-1">No Data Available</h4>
                 <p className="text-gray-500 text-sm">Add seasons and log expenses to see profitability analytics.</p>
               </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
