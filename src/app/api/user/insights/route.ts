import { NextRequest, NextResponse } from "next/server";
import { db, hasDatabase } from "@/db";
import { inventory, incomes, expenses, borrowings, farms, seasons } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/utils";
import { eq, lte, desc, and } from "drizzle-orm";
import { getCoordinates, getWeatherForecast } from "@/lib/weather";
import { addDays, format, differenceInDays } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    if (!hasDatabase || !db) {
      // Return mock data for local fallback
      return NextResponse.json(successResponse({
        trustScore: 780,
        trustScoreLabel: "Excellent",
        scoreBreakdown: {
          base: 300,
          income: 150,
          expense: 150,
          borrowing: 180
        },
        governmentSchemes: [
          { id: "S1", title: "PM-KUSUM (Solar Pumps)", amount: "Up to 60% Subsidy", requiredScore: 400, provider: "Ministry of New and Renewable Energy", icon: "Sun", desc: "Subsidized solar pumps to ensure reliable irrigation." },
          { id: "S2", title: "Sub-Mission on Agricultural Mechanization (SMAM)", amount: "Up to 80% Subsidy", requiredScore: 650, provider: "Ministry of Agriculture", icon: "Tractor", desc: "Subsidy for purchasing modern agricultural machinery." },
          { id: "S3", title: "Kisan Credit Card (KCC) Subvention", amount: "4% Interest Rate p.a.", requiredScore: 750, provider: "Govt. of India Partner Banks", icon: "CreditCard", desc: "Short-term credit limits with highly subsidized interest rates." }
        ],
        inventoryAlerts: [],
        advisory: "It might rain tomorrow. Delay spraying pesticides.",
        smartSchedules: []
      }));
    }

    const { searchParams } = new URL(request.url);
    const farmId = searchParams.get("farmId");

    // 1. Inventory Alerts (items with quantity < 5)
    let inventoryAlerts: any[] = [];
    if (farmId) {
      const lowStock = await db
        .select()
        .from(inventory)
        .where(eq(inventory.farmId, farmId))
        .orderBy(inventory.quantity);
        
      inventoryAlerts = lowStock.filter(item => item.quantity <= 5).map(item => ({
        id: item.id,
        itemName: item.itemName,
        quantity: item.quantity,
        unit: item.unit,
        message: `${item.itemName} stock is low (${item.quantity} ${item.unit}). Time to restock.`
      }));
    }

    // 2. Trust Score (Fintech Gateway logic based on consistent recording)
    const userBorrowings = await db.select().from(borrowings).where(eq(borrowings.userId, user.id));
    const userFarms = await db.select({ id: farms.id }).from(farms).where(eq(farms.userId, user.id));
    const farmIds = userFarms.map(f => f.id);
    
    let userExpenses: any[] = [];
    let userIncomes: any[] = [];
    
    if (farmIds.length > 0) {
      for (const fId of farmIds) {
        const fExpenses = await db.select().from(expenses).where(eq(expenses.farmId, fId));
        userExpenses = [...userExpenses, ...fExpenses];
        
        const fIncomes = await db.select().from(incomes).where(eq(incomes.farmId, fId));
        userIncomes = [...userIncomes, ...fIncomes];
      }
    }
    
    let baseScore = 300;
    
    const incomePoints = Math.min(150, userIncomes.length * 5); // max 150 points for recording income
    const expensePoints = Math.min(150, userExpenses.length * 2); // max 150 points for recording expenses
    
    const settledLoans = userBorrowings.filter(b => b.status === "settled").length;
    const pendingLoans = userBorrowings.filter(b => b.status === "pending").length;
    
    const borrowingPoints = (settledLoans * 50) - (pendingLoans * 10);
    
    baseScore += incomePoints + expensePoints + borrowingPoints;
    const trustScore = Math.max(300, Math.min(850, baseScore));
    
    let trustScoreLabel = "Fair";
    if (trustScore > 750) trustScoreLabel = "Excellent";
    else if (trustScore > 650) trustScoreLabel = "Good";

    const scoreBreakdown = {
      base: 300,
      income: incomePoints,
      expense: expensePoints,
      borrowing: borrowingPoints
    };

    // Government Schemes
    const governmentSchemes = [
      { id: "S1", title: "PM-KUSUM (Solar Pumps)", amount: "Up to 60% Subsidy", requiredScore: 400, provider: "Ministry of New and Renewable Energy", icon: "Sun", desc: "Subsidized solar pumps to ensure reliable irrigation." },
      { id: "S2", title: "Sub-Mission on Agricultural Mechanization (SMAM)", amount: "Up to 80% Subsidy", requiredScore: 650, provider: "Ministry of Agriculture", icon: "Tractor", desc: "Subsidy for purchasing modern agricultural machinery." },
      { id: "S3", title: "Kisan Credit Card (KCC) Subvention", amount: "4% Interest Rate p.a.", requiredScore: 750, provider: "Govt. of India Partner Banks", icon: "CreditCard", desc: "Short-term credit limits with highly subsidized interest rates." }
    ];

    // 3. Smart Schedule & Weather Advisory
    let advisory = "🌤️ Clear weather expected. Good time for farming activities.";
    let smartSchedules: any[] = [];
    let weatherAlert = null;
    let locationString = user.state;

    // Determine location
    if (farmId) {
      const farm = await db.select().from(farms).where(eq(farms.id, farmId)).limit(1);
      if (farm.length > 0 && farm[0].location) {
        locationString = farm[0].location;
      }
    }

    // Fetch Weather Data
    const coords = await getCoordinates(locationString);
    let weatherData = null;
    if (coords) {
      weatherData = await getWeatherForecast(coords.lat, coords.lon);
    }

    if (weatherData && weatherData.precipitation_probability_max && weatherData.precipitation_probability_max.length > 0) {
      const tomorrowRainProb = weatherData.precipitation_probability_max[1];
      if (tomorrowRainProb > 60) {
        advisory = "🌧️ High chance of rain tomorrow. Delay irrigation and pesticide spraying.";
        weatherAlert = "rain";
      } else if (weatherData.temperature_2m_max[0] > 38) {
        advisory = "🔥 Extreme heat warning. Irrigate crops in the evening.";
        weatherAlert = "heat";
      }
    }

    // Generate schedules if there is an active season
    if (farmId) {
      const activeSeasons = await db
        .select()
        .from(seasons)
        .where(and(eq(seasons.farmId, farmId), eq(seasons.status, "active")))
        .limit(1);

      if (activeSeasons.length > 0) {
        const season = activeSeasons[0];
        const sowingDate = new Date(season.startDate);
        const today = new Date();

        // Baseline activities for typical crops
        const plannedActivities = [
          { type: "irrigation", title: "1st Irrigation", daysAfterSowing: 21 },
          { type: "spray", title: "Pesticide Spray", daysAfterSowing: 30 },
          { type: "irrigation", title: "2nd Irrigation", daysAfterSowing: 45 },
          { type: "fertilizer", title: "Top Dressing (Urea)", daysAfterSowing: 50 },
        ];

        for (const act of plannedActivities) {
          const originalDate = addDays(sowingDate, act.daysAfterSowing);
          
          // Only show upcoming activities or recently missed
          const daysDiff = differenceInDays(originalDate, today);
          if (daysDiff >= -5 && daysDiff <= 30) {
            let recommendedDate = originalDate;
            let reason = null;
            let status = "pending";

            // Weather Adjustment Logic
            if (weatherData && daysDiff >= 0 && daysDiff < 14) {
              const forecastIndex = daysDiff;
              const rainProb = weatherData.precipitation_probability_max[forecastIndex];
              const rainfall = weatherData.precipitation_sum[forecastIndex];

              if ((act.type === "spray" || act.type === "irrigation") && rainProb > 50 && rainfall > 2) {
                // Find next clear day
                let nextClearDayOffset = 1;
                while (forecastIndex + nextClearDayOffset < 14) {
                  if (weatherData.precipitation_sum[forecastIndex + nextClearDayOffset] < 1) break;
                  nextClearDayOffset++;
                }
                
                if (nextClearDayOffset < 14 - forecastIndex) {
                  recommendedDate = addDays(originalDate, nextClearDayOffset);
                  reason = `Delayed by ${nextClearDayOffset} days due to expected rain (${rainfall}mm) 🌧️`;
                  status = "delayed";
                }
              }
            }

            smartSchedules.push({
              activityType: act.type,
              title: act.title,
              originalDate: format(originalDate, 'yyyy-MM-dd'),
              recommendedDate: format(recommendedDate, 'yyyy-MM-dd'),
              reason,
              status,
              daysRemaining: differenceInDays(recommendedDate, today)
            });
          }
        }
      }
    }

    return NextResponse.json(successResponse({
      trustScore,
      trustScoreLabel,
      scoreBreakdown,
      governmentSchemes,
      inventoryAlerts,
      advisory,
      weatherAlert,
      smartSchedules,
      location: locationString
    }));
  } catch (error) {
    console.error("Get insights error:", error);
    return NextResponse.json(errorResponse("Failed to load insights"), { status: 500 });
  }
}
