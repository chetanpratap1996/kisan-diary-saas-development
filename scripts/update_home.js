const fs = require('fs');

const target = 'g:/kisan-diary-saas-development/src/app/app/home/page.tsx';
let content = fs.readFileSync(target, 'utf8');

const replacements = [
  // Crops
  [/lang === "en" \? "Sowing"      : "बुवाई"/g, 't(lang, "phaseSowing")'],
  [/lang === "en" \? "Sprouting"   : "अंकुरण"/g, 't(lang, "phaseSprouting")'],
  [/lang === "en" \? "Growing"     : "बढ़वार"/g, 't(lang, "phaseGrowing")'],
  [/lang === "en" \? "Flowering"   : "फूल आना"/g, 't(lang, "phaseFlowering")'],
  [/lang === "en" \? "Ripening"    : "पकाव"/g, 't(lang, "phaseRipening")'],
  [/lang === "en" \? "Harvest Ready" : "कटाई"/g, 't(lang, "phaseHarvestReady")'],
  // Advisories
  [/lang === "en" \? "Check soil moisture\. Ensure even germination\." : "मिट्टी की नमी जांचें। समान अंकुरण सुनिश्चित करें।"/g, 't(lang, "advSowing")'],
  [/lang === "en" \? "First watering due\. Apply basal fertilizer\." : "पहली सिंचाई का समय। जड़ खाद डालें।"/g, 't(lang, "advSprouting")'],
  [/lang === "en" \? "Weeding recommended\. Monitor for pests\." : "निराई-गुड़ाई करें। कीड़े-मकोड़ों पर नज़र रखें।"/g, 't(lang, "advGrowing")'],
  [/lang === "en" \? "Flowering stage — reduce irrigation\. No sprays\." : "फूल आने की अवस्था — सिंचाई कम करें। दवाई न डालें।"/g, 't(lang, "advFlowering")'],
  [/lang === "en" \? "Stop irrigation 2 weeks before harvest\." : "कटाई से 2 हफ्ते पहले सिंचाई बंद करें।"/g, 't(lang, "advRipening")'],
  [/lang === "en" \? "Crop is ready for harvest\. Contact your trader\." : "फसल कटाई के लिए तैयार है। व्यापारी से संपर्क करें।"/g, 't(lang, "advHarvestReady")'],
  // Others
  [/lang === "en" \? "Farmer" : "किसान"/g, 't(lang, "farmer")'],
  [/lang === "en" \? "en-IN" : "hi-IN"/g, 'lang === "en" ? "en-IN" : (lang === "mr" ? "mr-IN" : (lang === "pa" ? "pa-IN" : "hi-IN"))'],
  [/lang === "en" \? "day streak" : "दिन"/g, 't(lang, "dayStreak")'],
  [/lang === "en" \? "days" : "दिन"/g, 't(lang, "days")'],
  [/lang === "en" \? "Income" : "आमदनी"/g, 't(lang, "incomeLabel")'],
  [/lang === "en" \? "Expense" : "खर्च"/g, 't(lang, "expenseLabel")'],
  [/lang === "en" \? "Net" : "बचत"/g, 't(lang, "net")'],
  [/lang === "en" \? "Today's Advisory" : "आज का सुझाव"/g, 't(lang, "todaysAdvisory")'],
  [/lang === "en" \? "MANDI" : "मंडी"/g, 't(lang, "mandi")'],
  [/lang === "en" \? "Quick Log" : "जल्दी लिखें"/g, 't(lang, "quickLog")'],
  // Actions
  [/lang === "en" \? action\.label_en : action\.label_hi/g, 't(lang, action.translationKey as TranslationKey)'],
  [/lang === "en" \? a\.label_en : a\.label_hi/g, 't(lang, a.translationKey as TranslationKey)'],
  [/lang === "en" \? action\?\.label_en : action\?\.label_hi/g, 't(lang, action?.translationKey as TranslationKey)'],
  // Farms CTA
  [/lang === "en" \? "No Farms Yet" : "अभी कोई खेत नहीं"/g, 't(lang, "noFarmsYet")'],
  [/lang === "en" \? "Add your first farm to start tracking your crops, expenses, and harvests\." : "अपना पहला खेत जोड़ें और खेती का हिसाब शुरू करें।"/g, 't(lang, "addFirstFarm")'],
  // Voice
  [/lang === "en" \? "Voice Record" : "बोल कर लिखें"/g, 't(lang, "voiceRecord")'],
  [/lang === "en" \? "Press the green mic and speak\." : "हरे बटन को दबाएं और बोलें।"/g, 't(lang, "voiceMicPrompt")'],
  [/lang === "en" \? "Try saying" : "बोल कर देखें"/g, 't(lang, "voiceTrySaying")'],
  [/lang === "en" \? "I spent ₹500 on fertilizer" : "मैंने 500 रुपये खाद पर खर्च किए"/g, 't(lang, "voiceExample")'],
  // Timeline/Activity
  [/lang === "en" \? "View Crop Profitability \(P&L\)" : "फसल की कमाई देखें \\(P&L\\)"/g, 't(lang, "viewProfitability")'],
  [/lang === "en" \? "Live Update" : "लाइव अपडेट"/g, 't(lang, "liveUpdate")'],
  [/lang === "en" \? "Upcoming Activities" : "आगामी कार्य"/g, 't(lang, "upcomingActivities")'],
  [/lang === "en" \? "Today" : "आज"/g, 't(lang, "today")'],
  [/lang === "en" \? \`Late \$\{Math\.abs\(schedule\.daysRemaining\)\}d\` : \`\$\{Math\.abs\(schedule\.daysRemaining\)\} दिन देर\`/g, '`${Math.abs(schedule.daysRemaining)} ${t(lang, "lateDays")}`'],
  [/lang === "en" \? \`In \$\{schedule\.daysRemaining\} days\` : \`\$\{schedule\.daysRemaining\} दिन में\`/g, '`${schedule.daysRemaining} ${t(lang, "inDays")}`'],
  [/lang === "en" \? "Mark Done" : "पूरा किया"/g, 't(lang, "markDone")'],
  [/lang === "en" \? "Low Inventory" : "स्टॉक कम"/g, 't(lang, "lowInventory")'],
  [/isOther \? "अज्ञात गतिविधि" : \(lang === "en" \? action\?\.label_en : action\?\.label_hi\)/g, 'isOther ? t(lang, "unknownActivity") : t(lang, action?.translationKey as TranslationKey)'],
  [/lang === "en" \? "workers" : "मजदूर"/g, 't(lang, "workersCount")'],
  [/lang === "en" \? "Farmer's Wisdom" : "किसान की बात"/g, 't(lang, "farmersWisdom")'],
  // Modals
  [/lang === "en" \? "Amount \(₹\)" : "रकम \(₹\)"/g, 't(lang, "amountRs")'],
  [/lang === "en" \? "Optional" : "वैकल्पिक"/g, 't(lang, "optional")'],
  [/lang === "en" \? "e\.g\. 500" : "जैसे 500"/g, 't(lang, "eg500")'],
  [/lang === "en" \? "e\.g\. 5" : "जैसे 5"/g, 't(lang, "eg5")'],
  [/lang === "en" \? "Optional note\.\.\." : "नोट \(वैकल्पिक\)"/g, 't(lang, "optionalNote")']
];

let replacedContent = content;
replacements.forEach(([regex, replacement]) => {
  replacedContent = replacedContent.replace(regex, replacement);
});

// Write it back
fs.writeFileSync(target, replacedContent);
console.log("Updated home page.");
