const fs = require('fs');
let code = fs.readFileSync('g:/kisan-diary-saas-development/gen_trans.js', 'utf8');
const additions = `
  gettingMandiPrices: { hi: "मंडी के भाव मिल रहे हैं...", en: "Getting Mandi Prices...", mr: "मंडीचे भाव मिळत आहेत...", pa: "ਮੰਡੀ ਦੇ ਭਾਅ ਮਿਲ ਰਹੇ ਹਨ..." },
  fetchingMandiData: { hi: "आपके स्थानीय बाजारों के लिए लाइव डेटा प्राप्त किया जा रहा है।", en: "Fetching live data for your local markets.", mr: "तुमच्या स्थानिक बाजारांसाठी थेट डेटा मिळवत आहे.", pa: "ਤੁਹਾਡੇ ਸਥਾਨਕ ਬਾਜ਼ਾਰਾਂ ਲਈ ਲਾਈਵ ਡੇਟਾ ਪ੍ਰਾਪਤ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ।" },
  mandiLive: { hi: "मंडी लाइव", en: "Mandi Live", mr: "मंडी लाईव्ह", pa: "ਮੰਡੀ ਲਾਈਵ" },
  yourLocalMarket: { hi: "आपकी स्थानीय मंडी", en: "Your Local Market", mr: "तुमची स्थानिक मंडी", pa: "ਤੁਹਾਡੀ ਸਥਾਨਕ ਮੰਡੀ" },
  searchCropPlaceholder: { hi: "फसल खोजें (जैसे: गेहूं, प्याज)...", en: "Search crop (e.g. Wheat, Onion)...", mr: "पीक शोधा (उदा. गहू, कांदा)...", pa: "ਫ਼ਸਲ ਲੱਭੋ (ਜਿਵੇਂ: ਕਣਕ, ਪਿਆਜ਼)..." },
  mandiAdviceLabel: { hi: "मंडी सलाह", en: "Mandi Advice (मंडी सलाह)", mr: "मंडी सल्ला", pa: "ਮੰਡੀ ਸਲਾਹ" },
  todaysPrices: { hi: "आज के भाव", en: "Today's Prices", mr: "आजचे भाव", pa: "ਅੱਜ ਦੇ ਭਾਅ" },
  rsPerQuintal: { hi: "₹ प्रति क्विंटल", en: "₹ per Quintal", mr: "₹ प्रति क्विंटल", pa: "₹ ਪ੍ਰਤੀ ਕੁਇੰਟਲ" },
  advicePrefix: { hi: "सलाह:", en: "Advice:", mr: "सल्ला:", pa: "ਸਲਾਹ:" },
  sevenDayTrend: { hi: "7 दिन का रुझान", en: "7-Day Trend", mr: "७ दिवसांचा कल", pa: "7 ਦਿਨਾਂ ਦਾ ਰੁਝਾਨ" },
  noCropsFound: { hi: "कोई फसल नहीं मिली", en: "No crops found matching", mr: "कोणतेही पीक आढळले नाही", pa: "ਕੋਈ ਫ਼ਸਲ ਨਹੀਂ ਮਿਲੀ" },
`;
if (!code.includes("gettingMandiPrices")) {
  code = code.replace('  // Quick Action Labels', additions + '  // Quick Action Labels');
  fs.writeFileSync('g:/kisan-diary-saas-development/gen_trans.js', code);
  console.log("Added keys to gen_trans.js");
} else {
  console.log("Keys already added.");
}
