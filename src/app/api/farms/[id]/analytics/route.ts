import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { expenses, harvests, seasons, farms, incomes } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";
import { eq, desc } from "drizzle-orm";

const EXPENSE_LABELS: Record<string, string> = {
  seeds: "🌱 बीज (Seeds)",
  fertilizers: "🧪 खाद (Fertilizer)",
  pesticides: "💊 दवाई (Pesticide)",
  diesel: "⛽ डीज़ल (Diesel)",
  labor: "👷 मजदूर (Labor)",
  tractor_rent: "🚜 ट्रैक्टर (Tractor)",
  irrigation_cost: "💧 सिंचाई (Irrigation)",
  machinary: "⚙️ मशीनरी (Machinery)",
  other: "📦 अन्य (Other)",
  // Legacy labels
  beej: "🌱 बीज",
  khad: "🧪 खाद",
  dawai: "💊 दवाई",
  majdoor: "👷 मजदूर",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    const { id: farmId } = await params;

    // Verify farm ownership
    const farmResult = await db
      .select()
      .from(farms)
      .where(eq(farms.id, farmId))
      .limit(1);

    if (!farmResult.length || farmResult[0].userId !== user.id) {
      return NextResponse.json(errorResponse("Farm not found"), { status: 404 });
    }

    const farm = farmResult[0];

    // Fetch all seasons for the farm
    const allSeasons = await db
      .select()
      .from(seasons)
      .where(eq(seasons.farmId, farmId))
      .orderBy(desc(seasons.startDate));

    // Fetch all financial data for the farm
    const allExpenses = await db.select().from(expenses).where(eq(expenses.farmId, farmId));
    const allIncomes = await db.select().from(incomes).where(eq(incomes.farmId, farmId));
    
    // We also need to fetch harvests for legacy income tracking, but harvests are tied to seasonId
    // Let's get all harvests for all seasons of this farm
    const seasonIds = allSeasons.map(s => s.id);
    let allHarvests: typeof harvests.$inferSelect[] = [];
    if (seasonIds.length > 0) {
      // Fetch harvests in a loop or handle it below, since drizzle 'inArray' might be complex if seasonIds is empty
      const harvestPromises = seasonIds.map(sid => db.select().from(harvests).where(eq(harvests.seasonId, sid)));
      const harvestsResults = await Promise.all(harvestPromises);
      allHarvests = harvestsResults.flat();
    }

    const seasonAnalytics = [];
    let overallIncome = 0;
    let overallExpense = 0;

    for (const season of allSeasons) {
      // Filter data for this specific season
      const seasonExpenses = allExpenses.filter(e => e.seasonId === season.id);
      const seasonIncomes = allIncomes.filter(i => i.seasonId === season.id);
      const seasonHarvests = allHarvests.filter(h => h.seasonId === season.id);

      const totalSeasonExpense = seasonExpenses.reduce((sum, e) => sum + e.amount, 0);
      const totalSeasonIncome = 
        seasonIncomes.reduce((sum, i) => sum + i.amount, 0) + 
        seasonHarvests.reduce((sum, h) => sum + h.totalIncome, 0);

      overallExpense += totalSeasonExpense;
      overallIncome += totalSeasonIncome;

      const netProfit = totalSeasonIncome - totalSeasonExpense;
      const profitPerAcre = farm.sizeAcre > 0 ? (netProfit / farm.sizeAcre) : 0;

      // Find biggest cost sink
      const expenseByCategory = seasonExpenses.reduce((acc, exp) => {
        const cat = exp.category;
        if (!acc[cat]) acc[cat] = 0;
        acc[cat] += exp.amount;
        return acc;
      }, {} as Record<string, number>);

      let biggestSinkCategory = null;
      let biggestSinkAmount = 0;
      let biggestSinkPercentage = 0;

      for (const [cat, amt] of Object.entries(expenseByCategory)) {
        if (amt > biggestSinkAmount) {
          biggestSinkAmount = amt;
          biggestSinkCategory = cat;
        }
      }

      if (totalSeasonExpense > 0 && biggestSinkAmount > 0 && biggestSinkCategory) {
        biggestSinkPercentage = Math.round((biggestSinkAmount / totalSeasonExpense) * 100);
      }

      seasonAnalytics.push({
        seasonId: season.id,
        cropName: season.cropName,
        startDate: season.startDate,
        endDate: season.endDate,
        status: season.status,
        totalIncome: totalSeasonIncome,
        totalExpense: totalSeasonExpense,
        netProfit,
        profitPerAcre,
        biggestSink: biggestSinkCategory ? {
          category: biggestSinkCategory,
          label: EXPENSE_LABELS[biggestSinkCategory] || biggestSinkCategory,
          amount: biggestSinkAmount,
          percentage: biggestSinkPercentage,
        } : null
      });
    }

    const overallNetProfit = overallIncome - overallExpense;
    
    return NextResponse.json(
      successResponse({
        farm: {
          id: farm.id,
          name: farm.name,
          sizeAcre: farm.sizeAcre,
        },
        overall: {
          totalIncome: overallIncome,
          totalExpense: overallExpense,
          netProfit: overallNetProfit,
          isProfit: overallNetProfit >= 0,
        },
        seasons: seasonAnalytics,
      })
    );
  } catch (error) {
    console.error("Get farm analytics error:", error);
    return NextResponse.json(errorResponse("Failed to generate analytics"), { status: 500 });
  }
}
