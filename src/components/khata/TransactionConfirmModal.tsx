"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AIParsedTransaction } from "@/types/khata";
import { CheckCircle2, X, AlertTriangle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: AIParsedTransaction) => void;
  transaction: AIParsedTransaction | null;
  isProcessing?: boolean;
}

export function TransactionConfirmModal({ isOpen, onClose, onConfirm, transaction, isProcessing }: Props) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800"
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {isProcessing ? (
            <div className="p-8 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <motion.div 
                  className="absolute inset-0 rounded-full border-4 border-green-500/30"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <div className="w-16 h-16 rounded-full border-4 border-t-green-500 border-zinc-200 dark:border-zinc-800 animate-spin" />
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 font-medium animate-pulse">
                AI is understanding...
              </p>
            </div>
          ) : transaction ? (
            <>
              <div className="p-6 pb-0 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="text-green-500" />
                    Transaction Parsed
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1">Review the details before saving.</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 space-y-3 border border-zinc-100 dark:border-zinc-800">
                  <div className="flex justify-between items-center pb-3 border-b border-zinc-200 dark:border-zinc-700">
                    <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Category</span>
                    <span className="capitalize font-semibold text-zinc-900 dark:text-white">{transaction.category}</span>
                  </div>
                  
                  {transaction.amount !== null && (
                    <div className="flex justify-between items-center pb-3 border-b border-zinc-200 dark:border-zinc-700">
                      <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Amount</span>
                      <span className="font-bold text-green-600 dark:text-green-400 text-lg">₹{transaction.amount}</span>
                    </div>
                  )}

                  {transaction.typeCategory && (
                    <div className="flex justify-between items-center pb-3 border-b border-zinc-200 dark:border-zinc-700">
                      <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Type</span>
                      <span className="capitalize font-semibold text-zinc-900 dark:text-white">{transaction.typeCategory.replace('_', ' ')}</span>
                    </div>
                  )}

                  {transaction.itemName && (
                    <div className="flex justify-between items-center pb-3 border-b border-zinc-200 dark:border-zinc-700">
                      <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Item</span>
                      <span className="font-semibold text-zinc-900 dark:text-white">{transaction.itemName}</span>
                    </div>
                  )}

                  {transaction.quantity !== null && (
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Quantity</span>
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        {transaction.quantity} {transaction.unit || ""}
                      </span>
                    </div>
                  )}
                </div>

                {transaction.requiresClarification && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-3 rounded-xl text-sm border border-yellow-200 dark:border-yellow-800/50 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    {transaction.clarificationMessage || "Please fill in the missing details manually."}
                  </div>
                )}
              </div>

              <div className="p-4 pt-0 flex gap-3">
                <button 
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  Edit manually
                </button>
                <button 
                  onClick={() => onConfirm(transaction)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 transition transform active:scale-95"
                >
                  Save to Ledger
                </button>
              </div>
            </>
          ) : null}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
