export type KhataTransactionCategory = 
  | "expense"
  | "income"
  | "inventory"
  | "borrowing";

// The shape that Gemini will return as JSON
export interface AIParsedTransaction {
  category: KhataTransactionCategory;
  
  // Basic properties
  amount: number | null; // e.g. 2000
  date: string | null;   // e.g. "2026-06-16T00:00:00Z" or relative date

  // Specific to Expense / Income
  typeCategory?: string | null; // e.g. "seeds", "fertilizers", "milk", "crop_sales"
  description?: string | null;  // Natural language description
  
  // Specific to Inventory
  itemName?: string | null;     // e.g. "Urea"
  quantity?: number | null;     // e.g. 2
  unit?: "kg" | "liter" | "bag" | "unit" | null;

  // Specific to Borrowing
  borrowingType?: "given" | "taken" | null;
  counterpartyName?: string | null; // e.g. "Ramu"

  // Feedback to user
  confidenceScore: number;      // 0 to 1
  requiresClarification: boolean;
  clarificationMessage?: string; // If something is missing
}
