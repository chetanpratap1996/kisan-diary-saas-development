"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { t, TranslationKey } from "@/lib/translations";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AddExpenseModal } from "@/components/modals/AddExpenseModal";
import { AddIncomeModal } from "@/components/modals/AddIncomeModal";
import { TrendingDown, TrendingUp, Plus, Minus, Sprout, BookOpen, ArrowDownCircle, ArrowUpCircle, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LedgerEntry {
  id: string;
  type: "income" | "expense";
  amount: number;
  title: string;
  category?: string;
  unit?: string;
  date: string;
  sourceId: string;
}

interface ProcessedLedgerEntry extends LedgerEntry {
  runningBalance: number;
}

export default function KhataPage() {
  const { user, activeSeason, apiCall, language } = useApp();
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);

  const lang = language || "hi";

  const fetchLedger = useCallback(async () => {
    if (!activeSeason?.id) {
       setIsLoading(false);
       return;
    }
    try {
      const res = await apiCall<{ success: boolean; data: LedgerEntry[] }>(`/api/seasons/${activeSeason.id}/ledger`);
      if (res.success) {
        setEntries(res.data);
      }
      
      const reportRes = await apiCall<{ success: boolean; data: any }>(`/api/seasons/${activeSeason.id}/report`);
      if (reportRes.success && reportRes.data.summary) {
         setTotalIncome(reportRes.data.summary.totalIncome || 0);
         setTotalExpense(reportRes.data.summary.totalExpense || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [activeSeason?.id, apiCall]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  const processedEntries = useMemo(() => {
    // Sort oldest first to calculate running balance
    const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let currentBalance = 0;
    const processed: ProcessedLedgerEntry[] = sorted.map(entry => {
      if (entry.type === 'income') {
        currentBalance += entry.amount;
      } else {
        currentBalance -= entry.amount;
      }
      return { ...entry, runningBalance: currentBalance };
    });
    // Reverse back to newest first
    return processed.reverse();
  }, [entries]);

  const groupedEntries = useMemo(() => {
    const groups: Record<string, ProcessedLedgerEntry[]> = {};
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    processedEntries.forEach(entry => {
      const entryDate = new Date(entry.date);
      const dateStr = entryDate.toISOString().split('T')[0];
      
      let groupName = "Older";
      if (dateStr === today) {
        groupName = "Today";
      } else if (dateStr === yesterday) {
        groupName = "Yesterday";
      } else if (entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear) {
        groupName = "This Month";
      }

      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(entry);
    });

    return groups;
  }, [processedEntries]);

  const netBalance = totalIncome - totalExpense;

  if (isLoading) {
     return <div className="p-8 text-center text-gray-500">{t(lang, "loading" as TranslationKey)}</div>;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-40 font-sans selection:bg-green-100 selection:text-green-900">
      {/* Top Header & Summary Card */}
      <div className="relative bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#10b981] px-5 pt-8 pb-14 rounded-b-[2.5rem] shadow-lg overflow-hidden">
         {/* Decorative shapes for premium feel */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
         <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

         <div className="relative z-10 flex items-center gap-3 mb-6">
           <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner">
             <BookOpen className="w-5 h-5 text-white" strokeWidth={2.5} />
           </div>
           <h1 className="text-white text-3xl font-black tracking-tight drop-shadow-md">
             {t(lang, "khata" as TranslationKey) || "Khata"}
           </h1>
         </div>
         
         <div className="relative z-10 bg-white rounded-[2rem] p-6 shadow-2xl shadow-green-900/10 border border-white/80">
            <div className="text-center mb-6">
               <div className="inline-flex items-center px-4 py-1.5 mb-3 rounded-full bg-slate-50 border border-slate-100 shadow-sm">
                 <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{t(lang, "netBalance" as TranslationKey) || "Net Balance"}</p>
               </div>
               <h2 className={`text-5xl font-black tracking-tighter ${netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance)}
               </h2>
            </div>
            
            <div className="flex justify-between gap-4 pt-5 mt-2 border-t border-slate-100/80">
               <div className="text-center flex-1 bg-emerald-50/80 rounded-[1.5rem] p-4 border border-emerald-100/60 shadow-sm">
                  <p className="text-emerald-700/80 text-[11px] font-extrabold uppercase tracking-wider mb-2">{t(lang, "totalIncome" as TranslationKey)}</p>
                  <p className="text-emerald-700 font-black text-2xl flex items-center justify-center gap-1.5">
                     <TrendingUp className="w-5 h-5 text-emerald-500" strokeWidth={3} /> {formatCurrency(totalIncome)}
                  </p>
               </div>
               <div className="text-center flex-1 bg-rose-50/80 rounded-[1.5rem] p-4 border border-rose-100/60 shadow-sm">
                  <p className="text-rose-700/80 text-[11px] font-extrabold uppercase tracking-wider mb-2">{t(lang, "totalExpense" as TranslationKey)}</p>
                  <p className="text-rose-700 font-black text-2xl flex items-center justify-center gap-1.5">
                     <TrendingDown className="w-5 h-5 text-rose-500" strokeWidth={3} /> {formatCurrency(totalExpense)}
                  </p>
               </div>
            </div>
         </div>
      </div>

      {/* Transaction Feed */}
      <div className="px-5 mt-4 relative z-10">
         {processedEntries.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-10 text-center shadow-lg shadow-slate-200/40 border border-slate-100 mt-6 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-green-500 opacity-80"></div>
               <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <Sprout className="w-10 h-10 text-emerald-500" strokeWidth={1.5} />
               </div>
               <h3 className="text-xl font-bold text-slate-800 mb-2">अभी तक कोई रिकॉर्ड नहीं</h3>
               <p className="text-slate-500 font-medium leading-relaxed mb-8">अपना पहला खर्च या आमदनी दर्ज करके अपना बहीखाता शुरू करें।</p>
               <div className="flex justify-center gap-4">
                  <div className="bg-rose-50 p-3 rounded-2xl animate-bounce shadow-sm">
                     <ArrowDownCircle className="w-7 h-7 text-rose-500" strokeWidth={2} />
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-2xl animate-bounce shadow-sm" style={{ animationDelay: '0.1s' }}>
                     <ArrowUpCircle className="w-7 h-7 text-emerald-500" strokeWidth={2} />
                  </div>
               </div>
            </div>
         ) : (
            <div className="space-y-6">
               {Object.entries(groupedEntries).map(([group, groupEntries]) => (
                 <div key={group} className="relative">
                    <div className="sticky top-0 z-20 pt-4 pb-3 bg-[#f8fafc]/95 backdrop-blur-md">
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-2">{group}</h3>
                    </div>
                    <div className="space-y-3 mt-1">
                       {groupEntries.map(entry => (
                          <div key={entry.id} className="bg-white p-4 rounded-[1.5rem] shadow-sm hover:shadow-md border border-slate-100 flex items-center justify-between active:scale-[0.98] transition-all cursor-default group">
                             <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 transition-transform group-hover:scale-105 ${entry.type === 'income' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                    {entry.type === 'income' 
                                      ? <ArrowUpCircle className="w-7 h-7" strokeWidth={2} /> 
                                      : <ArrowDownCircle className="w-7 h-7" strokeWidth={2} />
                                    }
                                </div>
                                <div>
                                   <p className="font-bold text-slate-800 text-[16px] leading-tight mb-1.5">
                                      {t(lang, entry.title as TranslationKey) || entry.title}
                                   </p>
                                   <div className="flex items-center gap-2">
                                     <span className={`inline-block w-2 h-2 rounded-full ${entry.type === 'income' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.6)]'}`} />
                                     <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                                        {formatDate(entry.date)} {entry.category || entry.unit ? `• ${entry.category || entry.unit}` : ''}
                                     </p>
                                   </div>
                                </div>
                             </div>
                             <div className="text-right flex flex-col items-end">
                                <p className={`font-black text-xl tracking-tight ${entry.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                   {entry.type === 'income' ? '+' : '-'}{formatCurrency(entry.amount)}
                                </p>
                                <div className="mt-1 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                      Bal: <span className="text-slate-700">{formatCurrency(entry.runningBalance)}</span>
                                   </p>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
               ))}
            </div>
         )}
      </div>

      {/* Sticky Bottom Action Bar - Adjusted bottom margin to clear the bottom nav */}
      <div className="fixed bottom-[5.5rem] left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-lg z-30 pointer-events-none">
         <div className="bg-white/90 backdrop-blur-xl p-2.5 rounded-[2rem] shadow-[0_10px_40px_rgb(0,0,0,0.15)] border border-slate-200 pointer-events-auto flex gap-3">
            <Button 
              onClick={() => setShowExpenseModal(true)}
              className="flex-1 h-16 rounded-[1.5rem] bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold shadow-sm active:scale-[0.98] transition-all border border-rose-200 gap-2 text-[15px]"
            >
               <div className="bg-white p-2 rounded-xl shadow-sm"><Minus className="w-5 h-5 text-rose-600" strokeWidth={3} /></div> खर्च
            </Button>
            <Button 
              onClick={() => setShowIncomeModal(true)}
              className="flex-1 h-16 rounded-[1.5rem] bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-all gap-2 border border-emerald-500 text-[15px]"
            >
               <div className="bg-emerald-500 p-2 rounded-xl border border-emerald-400"><Plus className="w-5 h-5 text-white" strokeWidth={3} /></div> आमदनी
            </Button>
         </div>
      </div>

      <AddExpenseModal open={showExpenseModal} onOpenChange={setShowExpenseModal} onSuccess={fetchLedger} />
      <AddIncomeModal open={showIncomeModal} onOpenChange={setShowIncomeModal} onSuccess={fetchLedger} />
    </div>
  );
}
