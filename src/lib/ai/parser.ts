import { GoogleGenAI, Type, Schema } from '@google/genai';
import { AIParsedTransaction } from '@/types/khata';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    category: {
      type: Type.STRING,
      enum: ["expense", "income", "inventory", "borrowing"],
      description: "The category of the transaction.",
    },
    amount: {
      type: Type.NUMBER,
      description: "The total amount of money involved in the transaction. Null if not applicable (e.g., just adding inventory).",
    },
    typeCategory: {
      type: Type.STRING,
      enum: [
        // expense categories
        "seeds", "fertilizers", "pesticides", "diesel", "labor", "tractor_rent", "irrigation_cost", "machinary", 
        // income categories
        "crop_sales", "subsidy", "milk", "animal_husbandry", 
        "other"
      ],
      description: "The specific sub-category mapping to the database enums.",
    },
    description: {
      type: Type.STRING,
      description: "A brief description of what happened in English, translated or summarized from the user input.",
    },
    itemName: {
      type: Type.STRING,
      description: "For inventory, the name of the item (e.g. Urea, DAP).",
    },
    quantity: {
      type: Type.NUMBER,
      description: "The quantity of items or yield.",
    },
    unit: {
      type: Type.STRING,
      enum: ["kg", "liter", "bag", "unit", "quintal", "ton"],
      description: "The unit of measurement.",
    },
    borrowingType: {
      type: Type.STRING,
      enum: ["given", "taken"],
      description: "If it's a loan/borrowing, whether money was given or taken.",
    },
    counterpartyName: {
      type: Type.STRING,
      description: "The name of the person involved in the transaction, especially for borrowings or sales.",
    },
    confidenceScore: {
      type: Type.NUMBER,
      description: "A score from 0 to 1 indicating how confident you are in the parsing.",
    },
    requiresClarification: {
      type: Type.BOOLEAN,
      description: "True if crucial information is missing (e.g. amount or item).",
    },
    clarificationMessage: {
      type: Type.STRING,
      description: "Message asking the user for missing details, in the same language they spoke.",
    }
  },
  required: ["category", "confidenceScore", "requiresClarification"],
};

export async function parseTransactionWithAI(text: string): Promise<AIParsedTransaction> {
  const prompt = `You are an AI assistant for 'Kisan Diary', an agricultural operating system for Indian farmers. 
Your job is to parse natural language voice transcripts (which could be in Hindi, English, Marathi, Punjabi, etc.) into structured JSON data.

The user will describe a farming transaction or activity. Map it to one of our core pillars:
1. 'expense' (costs incurred)
2. 'income' (money earned from sales)
3. 'inventory' (items added to stock without a specific price mentioned, or general inventory updates)
4. 'borrowing' (taking or giving a loan/udhaar to someone)

Extract the amount, category, item names, quantities, and units.
Examples:
- "मैंने आज 2000 रुपये में 50 लीटर दूध बेचा" -> Income, amount: 2000, category: milk, quantity: 50, unit: liter
- "रामू से 5000 उधार लिए" -> Borrowing, borrowingType: taken, counterpartyName: Ramu, amount: 5000
- "2 बोरी यूरिया खरीदा 800 में" -> Expense, amount: 800, typeCategory: fertilizers, itemName: Urea, quantity: 2, unit: bag

If important information is missing, set requiresClarification to true and provide a clarificationMessage.

User Input: "${text}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1, // Keep it deterministic
      }
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(response.text) as AIParsedTransaction;
  } catch (error) {
    console.error("Error parsing transaction:", error);
    throw error;
  }
}
