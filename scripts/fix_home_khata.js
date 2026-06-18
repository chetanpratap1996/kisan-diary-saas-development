const fs = require('fs');

// 1. New Dictionary Keys
const trans = [
  { key: 'guestModeView', hi: 'किसान डायरी — बिना लॉगिन के देखें', en: 'Kisan Diary — View as Guest', mr: 'किसान डायरी — लॉगिन न करता पहा', pa: 'ਕਿਸਾਨ ਡਾਇਰੀ — ਬਿਨਾਂ ਲੌਗਇਨ ਦੇਖੋ' },
  { key: 'loginSignupBtn', hi: '🔑 लॉगिन / साइन अप', en: '🔑 Login / Sign Up', mr: '🔑 लॉगिन / साइन अप', pa: '🔑 ਲੌਗਇਨ / ਸਾਈਨ ਅੱਪ' },
  { key: 'noRecordsYet', hi: 'अभी तक कोई रिकॉर्ड नहीं', en: 'No records yet', mr: 'अद्याप कोणतीही नोंद नाही', pa: 'ਅਜੇ ਕੋਈ ਰਿਕਾਰਡ ਨਹੀਂ' },
  { key: 'aiAssistantBadge', hi: 'AI सहायक', en: 'AI Assistant', mr: 'AI सहाय्यक', pa: 'AI ਸਹਾਇਕ' },
  { key: 'quote1', hi: 'जो किसान मेहनत करे, धरती उसे सोना दे।', en: 'The farmer who works hard, the earth gives him gold.', mr: 'जो शेतकरी मेहनत करतो, त्याला जमीन सोने देते.', pa: 'ਜੋ ਕਿਸਾਨ ਮਿਹਨਤ ਕਰਦਾ ਹੈ, ਧਰਤੀ ਉਸਨੂੰ ਸੋਨਾ ਦਿੰਦੀ ਹੈ।' },
  { key: 'quote2', hi: 'बीज छोटा होता है, पर सोच बड़ी रखो।', en: 'The seed is small, but keep your thinking big.', mr: 'बीज लहान असते, पण विचार मोठे ठेवा.', pa: 'ਬੀਜ ਛੋਟਾ ਹੁੰਦਾ ਹੈ, ਪਰ ਸੋਚ ਵੱਡੀ ਰੱਖੋ।' },
  { key: 'quote3', hi: 'हर बूंद पानी कीमती है, हर दाना अनमोल।', en: 'Every drop of water is precious, every grain is priceless.', mr: 'पाण्याचा प्रत्येक थेंब मौल्यवान आहे, प्रत्येक दाणा अनमोल आहे.', pa: 'ਪਾਣੀ ਦੀ ਹਰ ਬੂੰਦ ਕੀਮਤੀ ਹੈ, ਹਰ ਦਾਣਾ ਅਨਮੋਲ ਹੈ।' },
  { key: 'quote4', hi: 'खेत की मिट्टी से जुड़े रहो, वो कभी धोखा नहीं देती।', en: 'Stay connected to the soil of the field, it never betrays.', mr: 'शेताच्या मातीशी जोडलेले राहा, ती कधीही फसवणूक करत नाही.', pa: 'ਖੇਤ ਦੀ ਮਿੱਟੀ ਨਾਲ ਜੁੜੇ ਰਹੋ, ਉਹ ਕਦੇ ਧੋਖਾ ਨਹੀਂ ਦਿੰਦੀ।' },
  { key: 'quote5', hi: 'सुबह का काम शाम को फल देता है।', en: 'Morning work bears fruit in the evening.', mr: 'सकाळचे काम संध्याकाळी फळ देते.', pa: 'ਸਵੇਰ ਦਾ ਕੰਮ ਸ਼ਾਮ ਨੂੰ ਫਲ ਦਿੰਦਾ ਹੈ।' },
  { key: 'quote6', hi: 'किसान की मेहनत ही देश की ताकत है।', en: "The farmer's hard work is the country's strength.", mr: 'शेतकऱ्याची मेहनत हीच देशाची ताकद आहे.', pa: 'ਕਿਸਾਨ ਦੀ ਮਿਹਨਤ ਹੀ ਦੇਸ਼ ਦੀ ਤਾਕਤ ਹੈ।' },
  { key: 'todaysQuote', hi: 'आज का सुविचार', en: 'Thought of the Day', mr: 'आजचा सुविचार', pa: 'ਅੱਜ ਦਾ ਵਿਚਾਰ' },
  { key: 'home', hi: 'घर', en: 'Home', mr: 'मुख्यपृष्ठ', pa: 'ਘਰ' },
  { key: 'market', hi: 'मंडी', en: 'Market', mr: 'बाजार', pa: 'ਮੰਡੀ' },
  { key: 'credit', hi: 'क्रेडिट', en: 'Credit', mr: 'क्रेडिट', pa: 'ਕ੍ਰੈਡਿਟ' }
];

// Read gen_trans.js
let genTrans = fs.readFileSync('g:/kisan-diary-saas-development/gen_trans.js', 'utf8');

// Insert keys into baseKeys
let added = '';
trans.forEach(t => {
  if (!genTrans.includes(t.key + ':')) {
    added += `  ${t.key}: { hi: "${t.hi}", en: "${t.en}", mr: "${t.mr}", pa: "${t.pa}" },\n`;
  }
});

if (added) {
  // Find where baseKeys ends
  const endMarker = '  crop_wheat: {';
  if (genTrans.includes(endMarker)) {
    genTrans = genTrans.replace(endMarker, added + endMarker);
    fs.writeFileSync('g:/kisan-diary-saas-development/gen_trans.js', genTrans);
    console.log('Appended keys to gen_trans.js');
  }
}

// 2. Fix layout.tsx
let layoutFile = fs.readFileSync('g:/kisan-diary-saas-development/src/app/app/layout.tsx', 'utf8');
layoutFile = layoutFile.replace('किसान डायरी — बिना लॉगिन के देखें', '{t(lang, "guestModeView")}');
layoutFile = layoutFile.replace('🔑 लॉगिन / साइन अप', '{t(lang, "loginSignupBtn")}');
layoutFile = layoutFile.replace('labelKey: "market"   as any', 'labelKey: "market"   as const');
layoutFile = layoutFile.replace('labelKey: "credit"   as any', 'labelKey: "credit"   as const');
fs.writeFileSync('g:/kisan-diary-saas-development/src/app/app/layout.tsx', layoutFile);

// 3. Fix khata/page.tsx
let khataFile = fs.readFileSync('g:/kisan-diary-saas-development/src/app/app/khata/page.tsx', 'utf8');
khataFile = khataFile.replace('अभी तक कोई रिकॉर्ड नहीं', '{t(lang, "noRecordsYet" as TranslationKey)}');
khataFile = khataFile.replace('<div className="bg-white p-2 rounded-xl shadow-sm"><Minus className="w-5 h-5 text-rose-600" strokeWidth={3} /></div> खर्च', '<div className="bg-white p-2 rounded-xl shadow-sm"><Minus className="w-5 h-5 text-rose-600" strokeWidth={3} /></div> {t(lang, "expenseLabel" as TranslationKey)}');
khataFile = khataFile.replace('<div className="bg-emerald-500 p-2 rounded-xl border border-emerald-400"><Plus className="w-5 h-5 text-white" strokeWidth={3} /></div> आमदनी', '<div className="bg-emerald-500 p-2 rounded-xl border border-emerald-400"><Plus className="w-5 h-5 text-white" strokeWidth={3} /></div> {t(lang, "incomeLabel" as TranslationKey)}');
fs.writeFileSync('g:/kisan-diary-saas-development/src/app/app/khata/page.tsx', khataFile);

// 4. Fix home/page.tsx
let homeFile = fs.readFileSync('g:/kisan-diary-saas-development/src/app/app/home/page.tsx', 'utf8');
homeFile = homeFile.replace('AI Assistant', '{t(lang, "aiAssistantBadge" as TranslationKey)}');

// Update WISDOM_QUOTES
homeFile = homeFile.replace(
  /const WISDOM_QUOTES = \[\s*[^\]]*\s*\];/m,
  `const WISDOM_QUOTES: TranslationKey[] = ["quote1", "quote2", "quote3", "quote4", "quote5", "quote6"];`
);
// In the render: {WISDOM_QUOTES[quoteIdx]} needs to be translated
homeFile = homeFile.replace('{WISDOM_QUOTES[quoteIdx]}', '{t(lang, WISDOM_QUOTES[quoteIdx])}');
// And "आज का सुविचार"
homeFile = homeFile.replace('आज का सुविचार', '{t(lang, "todaysQuote" as TranslationKey)}');

// NEARBY_CROPS
homeFile = homeFile.replace(
  `{ NEARBY_CROPS.map((crop, i) => (
                <div key={i} className="flex-shrink-0 flex items-center gap-1.5 border-r border-gray-100 pr-5 last:border-0">
                  <span className="text-base">{crop.emoji}</span>
                  <div>
                    <p className="text-gray-500 text-[10px] font-semibold whitespace-nowrap">{crop.name}</p>`,
  `{ NEARBY_CROPS.map((crop, i) => {
                  const cropId = crop.name === "गेहूं" ? "wheat" : crop.name === "सरसों" ? "mustard" : crop.name === "सोयाबीन" ? "soyabean" : crop.name === "मक्का" ? "maize" : crop.name === "प्याज" ? "onion" : "potato";
                  return (
                <div key={i} className="flex-shrink-0 flex items-center gap-1.5 border-r border-gray-100 pr-5 last:border-0">
                  <span className="text-base">{crop.emoji}</span>
                  <div>
                    <p className="text-gray-500 text-[10px] font-semibold whitespace-nowrap">{t(lang, \`crop_\${cropId}\` as TranslationKey)}</p>`
);

// close the bracket for map
homeFile = homeFile.replace(
`                  </span>
                </div>
              ))}`,
`                  </span>
                </div>
              );
              })}`
);


fs.writeFileSync('g:/kisan-diary-saas-development/src/app/app/home/page.tsx', homeFile);
console.log('Files patched successfully');
