const fs = require('fs');

const marketPath = 'g:/kisan-diary-saas-development/src/app/app/market/page.tsx';
let marketContent = fs.readFileSync(marketPath, 'utf8');

const replacements = [
  ['>Getting Mandi Prices...<', '>{t(lang, "gettingMandiPrices")}<'],
  ['>Fetching live data for your local markets.<', '>{t(lang, "fetchingMandiData")}<'],
  ['Mandi Live', '{t(lang, "mandiLive")}'],
  ['> Your Local Market', '> {t(lang, "yourLocalMarket")}'],
  ['placeholder="Search crop (e.g. Wheat, Onion)..."', 'placeholder={t(lang, "searchCropPlaceholder")}'],
  ['Mandi Advice (मंडी सलाह)', '{t(lang, "mandiAdviceLabel")}'],
  [">Today's Prices<", '>{t(lang, "todaysPrices")}<'],
  ['>₹ per Quintal<', '>{t(lang, "rsPerQuintal")}<'],
  ['Advice:', '{t(lang, "advicePrefix")}'],
  ['7-Day Trend', '{t(lang, "sevenDayTrend")}'],
  ['No crops found matching', '{t(lang, "noCropsFound")}']
];

replacements.forEach(([original, key]) => {
  marketContent = marketContent.split(original).join(key);
});

// Since it's a component, we need to ensure `t` and `lang` are available
if (!marketContent.includes('const lang =')) {
  marketContent = marketContent.replace('const { apiCall } = useApp();', 'const { apiCall, language } = useApp();\n  const lang = language || "hi";');
}
if (!marketContent.includes('import { t }')) {
  marketContent = marketContent.replace('import { useApp } from "@/context/AppContext";', 'import { useApp } from "@/context/AppContext";\nimport { t } from "@/lib/translations";\nimport type { TranslationKey } from "@/lib/translations";');
}

fs.writeFileSync(marketPath, marketContent);
console.log('Updated market/page.tsx');
