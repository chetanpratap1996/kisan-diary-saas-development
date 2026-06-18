const fs = require('fs');

const trans = [
  { key: 'todaysPrices', hi: 'आज के भाव', en: "Today's Prices", mr: 'आजचे दर', pa: 'ਅੱਜ ਦੇ ਭਾਅ' },
  { key: 'crop_wheat', hi: 'गेहूँ', en: 'Wheat', mr: 'गहू', pa: 'ਕਣਕ' },
  { key: 'crop_rice', hi: 'धान (चावल)', en: 'Rice (Paddy)', mr: 'भात (तांदूळ)', pa: 'ਝੋਨਾ (ਚੌਲ)' },
  { key: 'crop_soyabean', hi: 'सोयाबीन', en: 'Soyabean', mr: 'सोयाबीन', pa: 'ਸੋਇਆਬੀਨ' },
  { key: 'crop_cotton', hi: 'कपास', en: 'Cotton', mr: 'कापूस', pa: 'ਕਪਾਹ' },
  { key: 'crop_maize', hi: 'मक्का', en: 'Maize', mr: 'मका', pa: 'ਮੱਕੀ' },
  { key: 'crop_mustard', hi: 'सरसों', en: 'Mustard', mr: 'मोहरी', pa: 'ਸਰ੍ਹੋਂ' },
  { key: 'crop_gram', hi: 'चना', en: 'Gram', mr: 'हरभरा', pa: 'ਛੋਲੇ' },
  { key: 'crop_onion', hi: 'प्याज़', en: 'Onion', mr: 'कांदा', pa: 'ਪਿਆਜ਼' },
  { key: 'crop_potato', hi: 'आलू', en: 'Potato', mr: 'बटाटा', pa: 'ਆਲੂ' },
  { key: 'crop_tur', hi: 'अरहर (तूर)', en: 'Tur (Arhar)', mr: 'तूर', pa: 'ਅਰਹਰ (ਤੂਰ)' },
  { key: 'rec_sell', hi: 'अभी बेचें', en: 'Sell Now', mr: 'आत्ता विका', pa: 'ਹੁਣ ਵੇਚੋ' },
  { key: 'rec_wait', hi: 'इंतज़ार करें', en: 'Wait', mr: 'वाट पाहा', pa: 'ਉਡੀਕ ਕਰੋ' },
  { key: 'rec_good', hi: 'सही दाम', en: 'Good Price', mr: 'चांगला दर', pa: 'ਸਹੀ ਕੀਮਤ' },
  { key: 'day_SUN', hi: 'रवि', en: 'SUN', mr: 'रवि', pa: 'ਐਤ' },
  { key: 'day_MON', hi: 'सोम', en: 'MON', mr: 'सोम', pa: 'ਸੋਮ' },
  { key: 'day_TUE', hi: 'मंगल', en: 'TUE', mr: 'मंगळ', pa: 'ਮੰਗਲ' },
  { key: 'day_WED', hi: 'बुध', en: 'WED', mr: 'बुध', pa: 'ਬੁੱਧ' },
  { key: 'day_THU', hi: 'गुरु', en: 'THU', mr: 'गुरू', pa: 'ਵੀਰ' },
  { key: 'day_FRI', hi: 'शुक्र', en: 'FRI', mr: 'शुक्र', pa: 'ਸ਼ੁੱਕਰ' },
  { key: 'day_SAT', hi: 'शनि', en: 'SAT', mr: 'शनी', pa: 'ਸ਼ਨਿਚਰ' },
  { key: 'day_TDY', hi: 'आज', en: 'TDY', mr: 'आज', pa: 'ਅੱਜ' },
  { key: 'day_YST', hi: 'कल', en: 'YST', mr: 'काल', pa: 'ਕੱਲ੍ਹ' },
  { key: 'advisory_up', hi: '{crop} के दाम आज ₹{change} बढ़े हैं। मंडी में बेचने का सही समय है।', en: '{crop} prices are up by ₹{change} today. Good time to sell at the Mandi.', mr: 'आज {crop} चे दर ₹{change} नी वाढले आहेत. मंडीत विकण्याची योग्य वेळ आहे.', pa: '{crop} ਦੇ ਭਾਅ ਅੱਜ ₹{change} ਵਧੇ ਹਨ। ਮੰਡੀ ਵਿੱਚ ਵੇਚਣ ਦਾ ਸਹੀ ਸਮਾਂ ਹੈ।' },
  { key: 'advisory_down', hi: '{crop} के दाम ₹{change} गिरे हैं। बेचने से पहले कुछ दिन रुकें।', en: '{crop} prices dropped by ₹{change}. Wait a few days before selling.', mr: '{crop} चे दर ₹{change} नी घसरले आहेत. विकण्यापूर्वी काही दिवस थांबा.', pa: '{crop} ਦੇ ਭਾਅ ₹{change} ਡਿੱਗੇ ਹਨ। ਵੇਚਣ ਤੋਂ ਪਹਿਲਾਂ ਕੁਝ ਦਿਨ ਰੁਕੋ।' },
  { key: 'advisory_stable', hi: 'आज मंडी में भाव स्थिर हैं। कोई बड़ी गिरावट नहीं हुई।', en: 'Market is steady today. No major price drops. Good day for routine Mandi visits.', mr: 'आज मंडीत दर स्थिर आहेत. कोणतीही मोठी घसरण नाही.', pa: 'ਅੱਜ ਮੰਡੀ ਵਿੱਚ ਭਾਅ ਸਥਿਰ ਹਨ। ਕੋਈ ਵੱਡੀ ਗਿਰਾਵਟ ਨਹੀਂ ਹੋਈ।' },
];

let genTrans = fs.readFileSync('g:/kisan-diary-saas-development/gen_trans.js', 'utf8');
let added = '';
trans.forEach(t => {
  if (!genTrans.includes(t.key + ':')) {
    added += `  ${t.key}: { hi: "${t.hi}", en: "${t.en}", mr: "${t.mr}", pa: "${t.pa}" },\n`;
  }
});

if (added) {
  const injectionPoint = 'let output = `export const translations = {\\n`;';
  if (genTrans.includes(injectionPoint)) {
    genTrans = genTrans.replace(injectionPoint, added + '};\n\n' + injectionPoint);
    fs.writeFileSync('g:/kisan-diary-saas-development/gen_trans.js', genTrans);
    console.log('Appended correctly to gen_trans.js');
  } else {
    console.log('Injection point not found in gen_trans.js!');
  }
}
