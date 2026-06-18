const fs = require('fs');

// Add keys to translations
let trans = fs.readFileSync('g:/kisan-diary-saas-development/gen_trans.js', 'utf8');
const additions = `
  // Missing Credit
  tierNeedsWork: { hi: "सुधार की जरूरत", en: "Needs Work", mr: "सुधारणेची गरज", pa: "ਸੁਧਾਰ ਦੀ ਲੋੜ" },
  tierFair: { hi: "ठीक", en: "Fair", mr: "ठीक", pa: "ਠੀਕ" },
  tierGood: { hi: "अच्छा", en: "Good", mr: "चांगले", pa: "ਚੰਗਾ" },
  tierExcellent: { hi: "उत्कृष्ट", en: "Excellent", mr: "उत्कृष्ट", pa: "ਬਹੁਤ ਵਧੀਆ" },
  profileReadiness: { hi: "प्रोफ़ाइल तैयारी", en: "Profile Readiness", mr: "प्रोफाइल तयारी", pa: "ਪ੍ਰੋਫਾਈਲ ਤਿਆਰੀ" },
  assessmentEngine: { hi: "मूल्यांकन इंजन", en: "Assessment Engine", mr: "मूल्यांकन इंजिन", pa: "ਮੁਲਾਂਕਣ ਇੰਜਣ" },
  outstandingRecords: { hi: "शानदार रिकॉर्ड। आपकी सभी सरकारी सब्सिडी जल्दी पास होंगी।", en: "Outstanding records. You are fast-tracked for all major government subsidies.", mr: "उत्कृष्ट रेकॉर्ड. तुम्हाला सर्व प्रमुख सरकारी सबसिडी लवकर मिळतील.", pa: "ਸ਼ਾਨਦਾਰ ਰਿਕਾਰਡ। ਤੁਹਾਡੀਆਂ ਸਾਰੀਆਂ ਸਰਕਾਰੀ ਸਬਸਿਡੀਆਂ ਜਲਦੀ ਪਾਸ ਹੋਣਗੀਆਂ।" },
  maintainKhata: { hi: "अपना स्कोर बढ़ाने और प्रीमियम सब्सिडी खोलने के लिए नियमित रूप से खाता बनाए रखें।", en: "Maintain your Khata regularly to boost your score and unlock premium subsidies.", mr: "तुमचा स्कोअर वाढवण्यासाठी आणि प्रीमियम सबसिडी अनलॉक करण्यासाठी नियमितपणे खाते अद्ययावत ठेवा.", pa: "ਆਪਣਾ ਸਕੋਰ ਵਧਾਉਣ ਅਤੇ ਪ੍ਰੀਮੀਅਮ ਸਬਸਿਡੀ ਖੋਲ੍ਹਣ ਲਈ ਨਿਯਮਿਤ ਤੌਰ 'ਤੇ ਖਾਤਾ ਬਣਾਈ ਰੱਖੋ।" },
  scoreDrivers: { hi: "स्कोर के कारण", en: "Score Drivers", mr: "स्कोअरची कारणे", pa: "ਸਕੋਰ ਦੇ ਕਾਰਨ" },
  settlingLoans: { hi: "समय पर लोन चुकाना सरकारी संस्थाओं को वित्तीय अनुशासन दिखाता है।", en: "Settling loans on time proves financial discipline to govt. bodies.", mr: "वेळेवर कर्ज फेडणे सरकारी संस्थांना आर्थिक शिस्त दाखवते.", pa: "ਸਮੇਂ ਸਿਰ ਕਰਜ਼ਾ ਮੋੜਨਾ ਸਰਕਾਰੀ ਸੰਸਥਾਵਾਂ ਨੂੰ ਵਿੱਤੀ ਅਨੁਸ਼ਾਸਨ ਦਿਖਾਉਂਦਾ ਹੈ।" },
  didYouKnow: { hi: "क्या आपको पता है?", en: "Did you know?", mr: "तुम्हाला माहीत आहे का?", pa: "ਕੀ ਤੁਹਾਨੂੰ ਪਤਾ ਹੈ?" },
  governmentBenefits: { hi: "सरकारी लाभ", en: "Government Benefits", mr: "सरकारी लाभ", pa: "ਸਰਕਾਰੀ ਲਾਭ" },
  checkEligibility: { hi: "पात्रता जांचें और आवेदन करें", en: "Check Eligibility & Apply", mr: "पात्रता तपासा आणि अर्ज करा", pa: "ਯੋਗਤਾ ਦੀ ਜਾਂਚ ਕਰੋ ਅਤੇ ਅਪਲਾਈ ਕਰੋ" },
  lockedStatus: { hi: "बंद है", en: "Locked", mr: "लॉक केलेले", pa: "ਬੰਦ ਹੈ" },
`;
if (!trans.includes("tierNeedsWork")) {
  trans = trans.replace('  // Quick Action Labels', additions + '  // Quick Action Labels');
  fs.writeFileSync('g:/kisan-diary-saas-development/gen_trans.js', trans);
}

// Now replace in credit/page.tsx
let credit = fs.readFileSync('g:/kisan-diary-saas-development/src/app/app/credit/page.tsx', 'utf8');

credit = credit.replace('let tierLabel = "Needs Work";', 'let tierLabel = t(lang, "tierNeedsWork");');
credit = credit.replace('tierLabel = "Fair";', 'tierLabel = t(lang, "tierFair");');
credit = credit.replace('tierLabel = "Good";', 'tierLabel = t(lang, "tierGood");');
credit = credit.replace('tierLabel = "Excellent";', 'tierLabel = t(lang, "tierExcellent");');

// Use exact string replacements for HTML content
credit = credit.replace('>Profile Readiness<', '>{t(lang, "profileReadiness")}<');
credit = credit.replace('Assessment Engine', '{t(lang, "assessmentEngine")}');
credit = credit.replace('"Outstanding records. You are fast-tracked for all major government subsidies."', '{t(lang, "outstandingRecords")}');
credit = credit.replace('"Maintain your Khata regularly to boost your score and unlock premium subsidies."', '{t(lang, "maintainKhata")}');
credit = credit.replace('> Score Drivers', '> {t(lang, "scoreDrivers")}');
credit = credit.replace('Settling loans on time proves financial discipline to govt. bodies.', '{t(lang, "settlingLoans")}');
credit = credit.replace('>Did you know?<', '>{t(lang, "didYouKnow")}<');
credit = credit.replace('> Government Benefits', '> {t(lang, "governmentBenefits")}');
credit = credit.replace('? "Check Eligibility & Apply" : "Locked"', '? t(lang, "checkEligibility") : t(lang, "lockedStatus")');
credit = credit.replace('{isUnlocked ? "Check Eligibility & Apply" : "Locked"}', '{isUnlocked ? t(lang, "checkEligibility") : t(lang, "lockedStatus")}'); // fallback

fs.writeFileSync('g:/kisan-diary-saas-development/src/app/app/credit/page.tsx', credit);
console.log('Credit page fixed');
