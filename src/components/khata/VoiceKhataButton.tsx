"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, AlertCircle } from "lucide-react";
import { useVoice } from "@/hooks/useVoice";
import { TransactionConfirmModal } from "./TransactionConfirmModal";
import { AIParsedTransaction } from "@/types/khata";

export function VoiceKhataButton() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [parsedData, setParsedData] = useState<AIParsedTransaction | null>(null);
  const [language, setLanguage] = useState("hi-IN");

  const {
    isListening,
    transcript,
    error,
    errorMessage,
    start,
    stop,
    reset,
  } = useVoice({
    lang: language,
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
        
        if (!res.ok) throw new Error("Failed to parse");
        
        const data = await res.json();
        setParsedData(data);
      } catch (err) {
        console.error("Parse error:", err);
        // Handle error gracefully in UI if needed
        setModalOpen(false);
      } finally {
        setIsProcessing(false);
      }
    },
  });

  const handleConfirm = (data: AIParsedTransaction) => {
    console.log("Saving to DB:", data);
    // Here we would call another API to save the transaction to the database
    setModalOpen(false);
    reset();
  };

  const handleClose = () => {
    setModalOpen(false);
    reset();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto space-y-6">
      
      {/* Language Selector */}
      <div className="bg-zinc-100 dark:bg-zinc-900 rounded-full p-1 flex shadow-inner">
        {[
          { code: "hi-IN", label: "हिंदी" },
          { code: "mr-IN", label: "मराठी" },
          { code: "pa-IN", label: "ਪੰਜਾਬੀ" },
          { code: "en-IN", label: "English" },
        ].map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
              language === lang.code 
                ? "bg-white dark:bg-zinc-800 text-green-600 dark:text-green-400 shadow-sm" 
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Main Mic Button */}
      <div className="relative flex justify-center items-center h-40">
        <AnimatePresence>
          {isListening && (
            <>
              {/* Ripple effects */}
              <motion.div
                className="absolute inset-0 rounded-full bg-green-500/20"
                initial={{ scale: 0.8, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-green-500/30"
                initial={{ scale: 0.8, opacity: 1 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5, ease: "easeOut" }}
              />
            </>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isListening ? stop : start}
          className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-colors duration-300 ${
            isListening 
              ? "bg-red-500 hover:bg-red-600 shadow-red-500/50" 
              : "bg-green-500 hover:bg-green-600 shadow-green-500/50"
          }`}
        >
          {isListening ? (
            <MicOff className="w-10 h-10 text-white" />
          ) : (
            <Mic className="w-10 h-10 text-white" />
          )}
        </motion.button>
      </div>

      {/* Status & Transcript */}
      <div className="text-center space-y-2 h-20">
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-center gap-2 text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/20 py-2 px-4 rounded-full"
            >
              <AlertCircle className="w-4 h-4" />
              {errorMessage}
            </motion.div>
          ) : isListening ? (
            <motion.div
              key="listening"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-green-600 dark:text-green-400 font-semibold animate-pulse">
                Listening...
              </p>
              <p className="text-xl font-medium text-zinc-800 dark:text-zinc-200 mt-2">
                "{transcript || "Speak now..."}"
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                Tap the mic to add an entry
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <TransactionConfirmModal 
        isOpen={modalOpen} 
        onClose={handleClose} 
        onConfirm={handleConfirm}
        transaction={parsedData}
        isProcessing={isProcessing}
      />
    </div>
  );
}
