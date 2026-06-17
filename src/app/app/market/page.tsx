"use client";

import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/translations";
import type { TranslationKey } from "@/lib/translations";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import { 
  TrendingUp, TrendingDown, Store, MapPin, Search, BellRing, Info, CalendarDays
} from "lucide-react";

interface Commodity {
  id: string;
  name: string;
  image: string;
  currentPrice: number;
  change: number;
  changePercentage: number;
  recommendation: string;
  trend: { date: string; price: number; label: string }[];
}

interface MarketData {
  advisory: {
    type: 'up' | 'down' | 'stable';
    cropId: string;
    change: number;
  };
  commodities: Commodity[];
}

export default function MarketDashboard() {
  const { apiCall, language } = useApp();
  const lang = language || "hi";
  const [data, setData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMarketData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await apiCall<{ success: boolean; data: MarketData }>("/api/market");
      if (result.success) {
        setData(result.data);
      }
    } catch (e) {
      console.error("Failed to fetch market data", e);
    } finally {
      setIsLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-50"></div>
          <div className="relative flex items-center justify-center w-full h-full bg-white rounded-full shadow-lg border border-green-100">
            <Store className="w-10 h-10 text-green-700" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">{t(lang, "gettingMandiPrices")}</h2>
        <p className="text-stone-500 font-medium text-center">{t(lang, "fetchingMandiData")}</p>
      </div>
    );
  }

  if (!data) return null;

  const filteredCommodities = data.commodities.filter(c => {
    const translatedName = t(lang, `crop_${c.id}` as TranslationKey) || c.name;
    return translatedName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const advCropName = data.advisory.cropId ? t(lang, `crop_${data.advisory.cropId}` as TranslationKey) : '';
  const advisoryTemplate = t(lang, `advisory_${data.advisory.type}` as TranslationKey) || "";
  const advisoryMessage = advisoryTemplate
    .replace('{crop}', advCropName)
    .replace('{change}', data.advisory.change.toString());

  return (
    <div className="min-h-screen bg-stone-50 pb-24 font-sans selection:bg-green-100">
      {/* Header */}
      <div className="px-5 pt-12 pb-5 sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/60 shadow-sm transition-all">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-stone-900 flex items-center gap-2">
              {t(lang, "mandiLive")}
              <span className="relative flex h-3 w-3 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-600"></span>
              </span>
            </h1>
            <p className="text-stone-600 text-sm font-medium flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-green-700" /> {t(lang, "yourLocalMarket")}
            </p>
          </div>
          <button className="w-11 h-11 bg-white rounded-full flex items-center justify-center border border-stone-200 shadow-sm relative hover:bg-stone-50">
            <BellRing className="w-5 h-5 text-stone-700" />
          </button>
        </div>
      </div>

      <div className="px-5 mt-6 space-y-6">
        
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-stone-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-12 pr-4 py-4 bg-white border border-stone-200 rounded-2xl text-[16px] font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 shadow-sm"
            placeholder={t(lang, "searchCropPlaceholder")}
          />
        </div>

        {/* Mandi Advice Hero (Simplified) */}
        <div className={`relative overflow-hidden rounded-2xl p-6 border ${
            data.advisory.type === 'up' ? 'bg-green-50 border-green-200' : 
            data.advisory.type === 'down' ? 'bg-red-50 border-red-200' : 
            'bg-blue-50 border-blue-200'
          }`}>
          
          <div className="relative z-10">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wide mb-3 ${
               data.advisory.type === 'up' ? 'bg-green-200 text-green-800' : 
               data.advisory.type === 'down' ? 'bg-red-200 text-red-800' : 
               'bg-blue-200 text-blue-800'
            }`}>
              <Info className="w-3.5 h-3.5" /> {t(lang, "mandiAdviceLabel")}
            </div>
            <h3 className="text-stone-900 font-bold text-lg leading-snug">
              {advisoryMessage}
            </h3>
          </div>
        </div>

        {/* Commodities List */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-lg font-extrabold text-stone-900">
              {t(lang, "todaysPrices" as TranslationKey)}
            </h3>
            <span className="text-[11px] text-stone-500 font-bold uppercase bg-stone-200 px-2.5 py-1 rounded-md">{t(lang, "rsPerQuintal")}</span>
          </div>

          <div className="space-y-5">
            {filteredCommodities.map((commodity) => {
              const isPositive = commodity.change >= 0;
              const recommendationColor = 
                commodity.recommendation === 'sell' ? 'bg-green-100 text-green-800 border-green-300' :
                commodity.recommendation === 'wait' ? 'bg-red-100 text-red-800 border-red-300' :
                'bg-blue-100 text-blue-800 border-blue-300';
                
              const translatedCropName = t(lang, `crop_${commodity.id}` as TranslationKey) || commodity.name;
              const translatedRec = t(lang, `rec_${commodity.recommendation}` as TranslationKey);

              return (
                <div key={commodity.id} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                  
                  {/* Top Section: Crop Info & Current Price */}
                  <div className="p-4 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-4">
                      {/* Real Photo Icon */}
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-stone-100 shadow-sm relative bg-stone-50 shrink-0">
                        <Image 
                          src={commodity.image} 
                          alt={translatedCropName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-stone-900 text-lg">{translatedCropName}</h4>
                        <div className="mt-1">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${recommendationColor}`}>
                            {t(lang, "advicePrefix")} {translatedRec}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-black text-stone-900">{formatCurrency(commodity.currentPrice)}</p>
                      <div className={`flex items-center justify-end gap-1 text-sm font-bold mt-0.5 ${isPositive ? 'text-green-700' : 'text-red-600'}`}>
                        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        ₹{Math.abs(commodity.change)}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Section: Compact 7-Day History */}
                  <div className="bg-stone-50/50 border-t border-stone-100 px-4 pt-3 pb-4">
                    <p className="text-[10px] font-extrabold text-stone-400 flex items-center gap-1.5 mb-3 uppercase tracking-wider">
                      <CalendarDays className="w-3 h-3" /> {t(lang, "sevenDayTrend")}
                    </p>
                    
                    <div className="flex justify-between items-end h-14">
                      {(() => {
                        const prices = commodity.trend.map(t => t.price);
                        const minP = Math.min(...prices);
                        const maxP = Math.max(...prices);
                        const range = (maxP - minP) || 1;
                        
                        return commodity.trend.map((tItem, i) => {
                          const isLast = i === commodity.trend.length - 1;
                          const heightPct = ((tItem.price - minP) / range) * 100;
                          
                          return (
                            <div key={i} className="flex flex-col items-center justify-end h-full gap-1 flex-1 group">
                              <span className={`text-[9px] font-black leading-none mb-0.5 ${isLast ? 'text-green-600' : 'text-stone-400 group-hover:text-stone-600'}`}>
                                {tItem.price}
                              </span>
                              <div className="w-full px-1">
                                <div 
                                  className={`w-full rounded-t-sm mx-auto max-w-[24px] transition-all duration-700 ${isLast ? 'bg-green-500' : 'bg-stone-200 group-hover:bg-stone-300'}`}
                                  style={{ height: `${Math.max(4, heightPct * 0.28)}px` }}
                                ></div>
                              </div>
                              <span className={`text-[9px] font-bold uppercase mt-0.5 ${isLast ? 'text-stone-800' : 'text-stone-400'}`}>
                                {t(lang, `day_${tItem.label}` as TranslationKey) || tItem.label}
                              </span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                </div>
              );
            })}

            {filteredCommodities.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
                <p className="text-stone-500 font-bold">{t(lang, "noCropsFound")} "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
