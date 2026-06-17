"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/translations";
import { 
  ShieldCheck, 
  Sprout, 
  Tractor, 
  CreditCard, 
  Info, 
  TrendingUp, 
  ChevronRight, 
  Lock, 
  Unlock,
  CheckCircle2,
  ArrowRight,
  Sun,
  FileCheck2,
  Lightbulb,
  Landmark,
  BadgeCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreditPage() {
  const { apiCall, activeFarm, language } = useApp();
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [animatedScore, setAnimatedScore] = useState(0);

  const lang = language || "hi";

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const url = activeFarm?.id ? `/api/user/insights?farmId=${activeFarm.id}` : `/api/user/insights`;
        const result = await apiCall<{ success: boolean; data: any }>(url);
        if (result.success) {
          setInsights(result.data);
          // Animate score from 0 to actual score over 1.5s
          const targetScore = result.data.trustScore || 0;
          let current = 0;
          const step = targetScore / 50;
          const timer = setInterval(() => {
            current += step;
            if (current >= targetScore) {
              setAnimatedScore(targetScore);
              clearInterval(timer);
            } else {
              setAnimatedScore(Math.floor(current));
            }
          }, 30);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInsights();
  }, [activeFarm?.id, apiCall]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020804] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
        <ShieldCheck className="w-16 h-16 text-emerald-500 animate-pulse drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10" />
        <p className="mt-6 text-emerald-400/80 font-medium tracking-widest uppercase text-sm z-10 animate-pulse">{t(lang, "initScoring")}</p>
      </div>
    );
  }

  const getIcon = (name: string) => {
    switch (name) {
      case "Sun": return <Sun className="w-7 h-7" />;
      case "Sprout": return <Sprout className="w-7 h-7" />;
      case "Tractor": return <Tractor className="w-7 h-7" />;
      case "CreditCard": return <CreditCard className="w-7 h-7" />;
      default: return <Landmark className="w-7 h-7" />;
    }
  };

  const maxScore = 850;
  const percentage = (animatedScore / maxScore) * 100;
  
  // Custom Gauge setup
  const radius = 90;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  // Make it a 270 degree arc instead of full circle
  const dashArray = `${circumference * 0.75} ${circumference * 0.25}`;
  const strokeDashoffset = circumference * 0.75 - (percentage / 100) * (circumference * 0.75);

  let scoreColor = "text-rose-500";
  let strokeColor = "#f43f5e";
  let tierLabel = t(lang, "tierNeedsWork");
  let tierGradient = "from-rose-500/20 to-transparent";
  
  if (animatedScore >= 500) {
    scoreColor = "text-amber-400";
    strokeColor = "#fbbf24";
    tierLabel = t(lang, "tierFair");
    tierGradient = "from-amber-500/20 to-transparent";
  }
  if (animatedScore >= 650) {
    scoreColor = "text-emerald-400";
    strokeColor = "#34d399";
    tierLabel = t(lang, "tierGood");
    tierGradient = "from-emerald-500/20 to-transparent";
  }
  if (animatedScore >= 750) {
    scoreColor = "text-teal-400";
    strokeColor = "#2dd4bf";
    tierLabel = t(lang, "tierExcellent");
    tierGradient = "from-teal-500/20 to-transparent";
  }

  return (
    <div className="min-h-screen bg-[#040a06] text-white pb-24 overflow-x-hidden selection:bg-emerald-500/30">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[40%] rounded-full bg-emerald-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[50%] rounded-full bg-teal-600/5 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-12 pb-6 px-6 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-30 rounded-full" />
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center relative shadow-lg shadow-emerald-500/20 border border-white/10">
              <ShieldCheck className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">{t(lang, "profileReadiness")}</h1>
            <p className="text-emerald-400/80 text-xs font-bold uppercase tracking-widest mt-0.5">{t(lang, "govtSchemeLabel")}</p>
          </div>
        </div>
      </div>

      {/* Premium Score Gauge Section */}
      <div className="px-5 py-8 relative z-10">
        <div className="bg-gradient-to-b from-white/[0.03] to-transparent border border-white/10 rounded-[2.5rem] p-8 pb-10 shadow-2xl relative flex flex-col items-center">
          <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-b ${tierGradient} opacity-50 pointer-events-none rounded-t-[2.5rem]`} />
          
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-8 z-10 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-emerald-400" /> {t(lang, "assessmentEngine")}
          </h2>
          
          <div className="relative w-64 h-52 flex justify-center z-10 mt-2">
            {/* Background Track Arc */}
            <svg className="absolute w-full h-full transform -rotate-[225deg]" viewBox="0 0 200 200">
              <circle
                cx="100" cy="100" r={radius}
                stroke="rgba(255,255,255,0.03)"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={dashArray}
                strokeLinecap="round"
              />
              {/* Progress Arc */}
              <circle
                cx="100" cy="100" r={radius}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={dashArray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-700 ease-out"
                style={{ filter: `drop-shadow(0 0 12px ${strokeColor}60)` }}
              />
            </svg>
            
            {/* Inner Score Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
              <div className="relative">
                <span className={`text-6xl font-black tracking-tighter ${scoreColor} drop-shadow-xl relative z-10`}>
                  {animatedScore}
                </span>
                <div className={`absolute inset-0 ${scoreColor} blur-2xl opacity-20 z-0`}></div>
              </div>
              <span className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-[0.3em]">{t(lang, "maxScore850")}</span>
            </div>
          </div>
          
          <div className="z-10 text-center -mt-4">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-4 backdrop-blur-md ${animatedScore >= 750 ? 'bg-teal-500/10 border-teal-500/30 text-teal-300' : animatedScore >= 650 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : animatedScore >= 500 ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'} shadow-lg`}>
              <BadgeCheck className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">{tierLabel} {t(lang, "tierLabelStr")}</span>
            </div>
            
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">
              {animatedScore >= 750 
                ? t(lang, "outstandingRecords")
                : t(lang, "maintainKhata")}
            </p>
          </div>
        </div>
      </div>

      {/* Psychology-Driven Score Breakdown */}
      {insights?.scoreBreakdown && (
        <div className="px-5 mb-10 relative z-10">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.15em] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> {t(lang, "scoreDrivers")}
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5 rounded-3xl p-5 hover:bg-white/[0.06] transition-colors relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-colors" />
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{t(lang, "baseProfile")}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">+{insights.scoreBreakdown.base}</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">{t(lang, "identityVerified")}</p>
            </div>
            
            <div className="bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5 rounded-3xl p-5 hover:bg-white/[0.06] transition-colors relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-colors" />
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{t(lang, "khataActivity")}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-400">+{insights.scoreBreakdown.expense + insights.scoreBreakdown.income}</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">{t(lang, "consistentEntries")}</p>
            </div>
            
            <div className="bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5 rounded-3xl p-5 col-span-2 flex items-center justify-between relative overflow-hidden group">
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors" />
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{t(lang, "creditReliability")}</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-black ${insights.scoreBreakdown.borrowing >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                    {insights.scoreBreakdown.borrowing > 0 ? '+' : ''}{insights.scoreBreakdown.borrowing}
                  </span>
                </div>
              </div>
              <div className="bg-black/40 rounded-xl p-3 border border-white/5 max-w-[140px]">
                <p className="text-[10px] text-gray-300 leading-snug">
                  {t(lang, "settlingLoans")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Smart Insights Toast */}
      <div className="px-5 mb-10 relative z-10">
        <div className="bg-gradient-to-r from-teal-900/40 to-emerald-900/20 border border-teal-500/20 rounded-2xl p-5 flex gap-4 items-start shadow-lg shadow-teal-900/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-teal-400 to-emerald-500" />
          <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0 border border-teal-500/30">
            <Lightbulb className="w-5 h-5 text-teal-300" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-teal-100 mb-1">{t(lang, "didYouKnow")}</h4>
            <p className="text-xs text-teal-200/80 leading-relaxed">
              {t(lang, "creditAdvisoryText")}
            </p>
          </div>
        </div>
      </div>

      {/* Govt Schemes Hub */}
      <div className="px-5 mb-8 relative z-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-[0.15em] flex items-center gap-2 mb-1">
              <Landmark className="w-4 h-4 text-amber-400" /> {t(lang, "governmentBenefits")}
            </h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{t(lang, "basedOnReadiness")}</p>
          </div>
        </div>

        <div className="space-y-5">
          {insights?.governmentSchemes?.map((scheme: any, index: number) => {
            const isUnlocked = animatedScore >= scheme.requiredScore;
            return (
              <div 
                key={scheme.id} 
                className={`relative rounded-[2rem] p-[1px] overflow-hidden group transition-all duration-500 ${isUnlocked ? 'shadow-[0_0_30px_rgba(45,212,191,0.1)] hover:shadow-[0_0_40px_rgba(45,212,191,0.2)] hover:-translate-y-1' : ''}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient Border Illusion */}
                <div className={`absolute inset-0 bg-gradient-to-br ${isUnlocked ? 'from-teal-400 via-emerald-600 to-[#040a06]' : 'from-white/10 to-transparent'} z-0`} />
                
                {/* Inner Content Card */}
                <div className={`relative bg-[#07100b] h-full w-full rounded-[2rem] p-6 z-10 overflow-hidden ${!isUnlocked ? 'opacity-90' : ''}`}>
                  
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-30 flex flex-col items-center justify-center">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-3 border border-white/10 shadow-2xl backdrop-blur-md">
                        <Lock className="w-6 h-6 text-gray-400 drop-shadow-md" />
                      </div>
                      <p className="text-white font-black text-sm tracking-wider">{t(lang, "unlocksAtScore").replace("{score}", scheme.requiredScore.toString())}</p>
                      <p className="text-xs text-gray-400 mt-1 font-medium">{t(lang, "keepRecording")}</p>
                    </div>
                  )}
                  
                  {isUnlocked && (
                    <div className="absolute top-0 right-0 p-4 z-20">
                      <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center border border-teal-500/30 shadow-lg shadow-teal-500/20">
                        <Unlock className="w-3.5 h-3.5 text-teal-400" />
                      </div>
                    </div>
                  )}

                  <div className="relative z-10">
                    <div className="flex items-start gap-5 mb-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner shrink-0 relative ${isUnlocked ? 'bg-gradient-to-br from-teal-400 to-emerald-600 text-white' : 'bg-gray-800 text-gray-500'}`}>
                        {isUnlocked && <div className="absolute inset-0 bg-white/20 rounded-2xl blur-md"></div>}
                        <div className="relative z-10">{getIcon(scheme.icon)}</div>
                      </div>
                      <div className="pr-8">
                        <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1.5">{scheme.provider}</p>
                        <h4 className={`font-black text-xl leading-tight mb-2 ${isUnlocked ? 'text-white' : 'text-gray-300'}`}>{scheme.title}</h4>
                        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{scheme.desc}</p>
                      </div>
                    </div>

                    <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 mb-5">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{t(lang, "keyBenefit")}</p>
                      <p className={`font-black text-lg ${isUnlocked ? 'text-teal-400' : 'text-gray-400'} drop-shadow-sm`}>{scheme.amount}</p>
                    </div>

                    <Button 
                      disabled={!isUnlocked}
                      className={`w-full rounded-2xl h-14 font-black text-sm flex items-center justify-center gap-3 transition-all ${isUnlocked ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white shadow-xl shadow-teal-500/20 border-t border-white/20' : 'bg-gray-800/50 text-gray-500 border border-gray-700'}`}
                    >
                      {isUnlocked ? t(lang, "checkEligibility") : t(lang, "lockedStatus")}
                      {isUnlocked && <ArrowRight className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
    </div>
  );
}
