"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, AlertCircle } from "lucide-react";
import { useVoice } from "@/hooks/useVoice";
import { useApp } from "@/context/AppContext";
import { TransactionConfirmModal } from "./TransactionConfirmModal";
import { AIParsedTransaction } from "@/types/khata";

export function VoiceKhataFAB() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [parsedData, setParsedData] = useState<AIParsedTransaction | null>(null);
  
  const { user } = useApp();
  const getSpeechLang = (lang: string) => {
    switch (lang) {
      case "en": return "en-IN";
      case "pa": return "pa-IN";
      case "mr": return "mr-IN";
      default: return "hi-IN";
    }
  };

  const {
    isListening,
    transcript,
    error,
    errorMessage,
    start,
    stop,
    reset,
  } = useVoice({
    lang: getSpeechLang(user?.language || "hi"),
    enableBeep: true,
    onResult: async (text) => {
      if (!text.trim()) return;
      
      setIsProcessing(true);
      setModalOpen(true);
      
      try {
        const res = await fetch("/api/ai/parse-transaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to parse transaction due to API error");
        }
        
        const data = await res.json();
        setParsedData(data);
      } catch (err: any) {
        console.error("Parse error:", err);
        setModalOpen(false);
        alert(`AI Parsing Error: ${err.message || "High demand or service unavailable. Please try again later."}`);
      } finally {
        setIsProcessing(false);
      }
    },
  });

  const handleConfirm = (data: AIParsedTransaction) => {
    console.log("Saving to DB from FAB:", data);
    setModalOpen(false);
    reset();
  };

  const handleClose = () => {
    setModalOpen(false);
    reset();
  };

  return (
    <>
      <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end">
        <AnimatePresence>
          {(isListening || error) && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="mb-4 bg-white shadow-xl rounded-2xl p-4 border border-gray-100 max-w-[200px]"
            >
              {error ? (
                <div className="flex flex-col gap-2 text-red-500 text-xs font-medium">
                  <div className="flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Error</div>
                  <p>{errorMessage}</p>
                </div>
              ) : (
                <div>
                  <p className="text-green-600 font-bold text-xs uppercase tracking-wider mb-1 animate-pulse">
                    सुन रहे हैं...
                  </p>
                  <p className="text-sm font-medium text-gray-800 italic">
                    "{transcript || "बोलना शुरू करें..."}"
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          <AnimatePresence>
            {!isListening && (
              <motion.div
                className="absolute inset-0 rounded-full bg-green-500/20"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            {isListening && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full bg-red-500/30"
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                />
              </>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isListening ? stop : start}
            className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-gray-400/30 transition-colors duration-300 ${
              isListening 
                ? "bg-red-500 hover:bg-red-600 text-white" 
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {isListening ? (
              <MicOff className="w-7 h-7" />
            ) : (
              <Mic className="w-7 h-7" />
            )}
          </motion.button>
        </div>
      </div>

      <TransactionConfirmModal 
        isOpen={modalOpen} 
        onClose={handleClose} 
        onConfirm={handleConfirm}
        transaction={parsedData}
        isProcessing={isProcessing}
      />
    </>
  );
}
