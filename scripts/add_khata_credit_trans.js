const fs = require('fs');
let code = fs.readFileSync('g:/kisan-diary-saas-development/gen_trans.js', 'utf8');
const additions = `
  // Khata & Credit
  startKhataPrompt: { hi: "अपना पहला खर्च या आमदनी दर्ज करके अपना बहीखाता शुरू करें।", en: "Start your Khata by recording your first income or expense.", mr: "तुमचा पहिला खर्च किंवा उत्पन्न नोंदवून खाते सुरू करा.", pa: "ਆਪਣਾ ਪਹਿਲਾ ਖਰਚਾ ਜਾਂ ਕਮਾਈ ਦਰਜ ਕਰਕੇ ਆਪਣਾ ਖਾਤਾ ਸ਼ੁਰੂ ਕਰੋ।" },
  balancePrefix: { hi: "शेष:", en: "Bal:", mr: "शिल्लक:", pa: "ਬਾਕੀ:" },
  initScoring: { hi: "स्कोरिंग इंजन लोड हो रहा है", en: "Initializing Scoring Engine", mr: "स्कोरिंग इंजिन लोड होत आहे", pa: "ਸਕੋਰਿੰਗ ਇੰਜਣ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ" },
  govtSchemeLabel: { hi: "सरकारी योजना पात्रता", en: "Govt. Scheme Eligibility", mr: "सरकारी योजना पात्रता", pa: "ਸਰਕਾਰੀ ਯੋਜਨਾ ਯੋਗਤਾ" },
  maxScore850: { hi: "अधिकतम 850", en: "Max 850", mr: "कमाल 850", pa: "ਵੱਧ ਤੋਂ ਵੱਧ 850" },
  tierLabelStr: { hi: "स्तर", en: "Tier", mr: "स्तर", pa: "ਪੱਧਰ" },
  baseProfile: { hi: "मूल प्रोफाइल", en: "Base Profile", mr: "मूळ प्रोफाइल", pa: "ਮੂਲ ਪ੍ਰੋਫਾਈਲ" },
  identityVerified: { hi: "पहचान सत्यापित।", en: "Identity verified.", mr: "ओळख सत्यापित.", pa: "ਪਛਾਣ ਤਸਦੀਕ।" },
  khataActivity: { hi: "खाता गतिविधि", en: "Khata Activity", mr: "खाते कृती", pa: "ਖਾਤਾ ਗਤੀਵਿਧੀ" },
  consistentEntries: { hi: "लगातार दैनिक प्रविष्टियाँ।", en: "Consistent daily entries.", mr: "सातत्यपूर्ण दररोजच्या नोंदी.", pa: "ਲਗਾਤਾਰ ਰੋਜ਼ਾਨਾ ਐਂਟਰੀਆਂ।" },
  creditReliability: { hi: "ऋण विश्वसनीयता", en: "Credit Reliability", mr: "कर्ज विश्वासार्हता", pa: "ਕਰਜ਼ਾ ਭਰੋਸੇਯੋਗਤਾ" },
  creditAdvisoryText: { hi: "750 से ऊपर स्कोर वाले किसानों की सब्सिडी जल्दी पास होती है। और योजनाएं खोलने के लिए रोज़ का हिसाब रखें!", en: "Farmers with a Readiness Score above 750 get their subsidy paperwork approved 3x faster. Keep logging your daily Khata to unlock the best schemes!", mr: "750 पेक्षा जास्त स्कोअर असलेल्या शेतकऱ्यांची सबसिडी लवकर मंजूर होते. आणखी योजना उघडण्यासाठी रोजचा हिशेब ठेवा!", pa: "750 ਤੋਂ ਉੱਪਰ ਸਕੋਰ ਵਾਲੇ ਕਿਸਾਨਾਂ ਦੀ ਸਬਸਿਡੀ ਜਲਦੀ ਪਾਸ ਹੁੰਦੀ ਹੈ। ਹੋਰ ਯੋਜਨਾਵਾਂ ਖੋਲ੍ਹਣ ਲਈ ਰੋਜ਼ ਦਾ ਹਿਸਾਬ ਰੱਖੋ!" },
  basedOnReadiness: { hi: "आपके प्रोफाइल के आधार पर", en: "Based on your Profile Readiness", mr: "तुमच्या प्रोफाईलवर आधारित", pa: "ਤੁਹਾਡੀ ਪ੍ਰੋਫਾਈਲ ਦੇ ਅਧਾਰ ਤੇ" },
  unlocksAtScore: { hi: "{score} स्कोर पर खुलेगा", en: "Unlocks at {score} Score", mr: "{score} स्कोअरवर उघडेल", pa: "{score} ਸਕੋਰ 'ਤੇ ਖੁੱਲ੍ਹੇਗਾ" },
  keepRecording: { hi: "पात्र बनने के लिए हिसाब रखें", en: "Keep recording to be eligible", mr: "पात्र होण्यासाठी हिशेब ठेवा", pa: "ਯੋਗ ਬਣਨ ਲਈ ਹਿਸਾਬ ਰੱਖੋ" },
  keyBenefit: { hi: "मुख्य लाभ", en: "Key Benefit", mr: "मुख्य लाभ", pa: "ਮੁੱਖ ਲਾਭ" },
`;
if (!code.includes("startKhataPrompt")) {
  code = code.replace('  // Quick Action Labels', additions + '  // Quick Action Labels');
  fs.writeFileSync('g:/kisan-diary-saas-development/gen_trans.js', code);
  console.log("Added khata/credit keys to gen_trans.js");
} else {
  console.log("Khata/Credit keys already added.");
}
