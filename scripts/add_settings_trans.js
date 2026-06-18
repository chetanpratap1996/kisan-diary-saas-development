const fs = require('fs');
let code = fs.readFileSync('g:/kisan-diary-saas-development/gen_trans.js', 'utf8');
const additions = `
  // Settings & Farms
  egFarmName: { hi: "जैसे: घर वाला खेत", en: "e.g. Home Farm", mr: "उदा. घराजवळील शेत", pa: "ਜਿਵੇਂ: ਘਰ ਵਾਲਾ ਖੇਤ" },
  areaUnitStar: { hi: "क्षेत्रफल ({unitLabel}) *", en: "Area ({unitLabel}) *", mr: "क्षेत्रफळ ({unitLabel}) *", pa: "ਖੇਤਰਫਲ ({unitLabel}) *" },
  eg5Acre: { hi: "जैसे: 5", en: "e.g. 5", mr: "उदा. ५", pa: "ਜਿਵੇਂ: 5" },
  villageDistrictStar: { hi: "गाँव / जिला *", en: "Village / District *", mr: "गाव / जिल्हा *", pa: "ਪਿੰਡ / ਜ਼ਿਲਾ *" },
  speakOrType: { hi: "बोलें या टाइप करें...", en: "Speak or type...", mr: "बोला किंवा टाईप करा...", pa: "ਬੋਲੋ ਜਾਂ ਟਾਈਪ ਕਰੋ..." },
  additionalInfoOptional: { hi: "अतिरिक्त जानकारी (वैकल्पिक)", en: "Additional Info (Optional)", mr: "अतिरिक्त माहिती (वैकल्पिक)", pa: "ਵਾਧੂ ਜਾਣਕਾਰੀ (ਵਿਕਲਪਿਕ)" },
  landType: { hi: "भूमि का प्रकार", en: "Land Type", mr: "जमिनीचा प्रकार", pa: "ਜ਼ਮੀਨ ਦੀ ਕਿਸਮ" },
  selectOption: { hi: "चुनें...", en: "Select...", mr: "निवडा...", pa: "ਚੁਣੋ..." },
  irrigationSource: { hi: "सिंचाई का स्रोत", en: "Irrigation Source", mr: "सिंचनाचे स्त्रोत", pa: "ਸਿੰਚਾਈ ਦਾ ਸਰੋਤ" },
  soilType: { hi: "मिट्टी का प्रकार", en: "Soil Type", mr: "मातीचा प्रकार", pa: "ਮਿੱਟੀ ਦੀ ਕਿਸਮ" },
  farmNameLabel: { hi: "खेत का नाम", en: "Farm Name", mr: "शेताचे नाव", pa: "ਖੇਤ ਦਾ ਨਾਮ" },
  areaUnit: { hi: "क्षेत्रफल ({unitLabel})", en: "Area ({unitLabel})", mr: "क्षेत्रफळ ({unitLabel})", pa: "ਖੇਤਰਫਲ ({unitLabel})" },
  villageDistrict: { hi: "गाँव / जिला", en: "Village / District", mr: "गाव / जिल्हा", pa: "ਪਿੰਡ / ਜ਼ਿਲਾ" },
  newSeasonIn: { hi: "में नई फसल", en: "New season in", mr: "मध्ये नवीन हंगाम", pa: "ਵਿੱਚ ਨਵੀਂ ਫ਼ਸਲ" },
  cropNameStar: { hi: "फसल का नाम *", en: "Crop Name *", mr: "पिकाचे नाव *", pa: "ਫ਼ਸਲ ਦਾ ਨਾਮ *" },
  speakOrTypeCrop: { hi: "फसल का नाम बोलें या लिखें...", en: "Speak or type crop name...", mr: "पिकाचे नाव बोला किंवा लिहा...", pa: "ਫ਼ਸਲ ਦਾ ਨਾਮ ਬੋਲੋ ਜਾਂ ਲਿਖੋ..." },
  sowingDateStar: { hi: "बुवाई की तारीख *", en: "Sowing Date *", mr: "पेरणीची तारीख *", pa: "ਬਿਜਾਈ ਦੀ ਤਾਰੀਖ *" },
  deleteFarmWarning: { hi: "और उससे जुड़ा सारा डेटा (फसलें, खर्चे, आमदनी) हमेशा के लिए मिट जाएगा।", en: "and all its associated data (seasons, expenses, income) will be permanently deleted.", mr: "आणि त्यासंबंधित सर्व डेटा (हंगाम, खर्च, उत्पन्न) कायमचे हटवले जातील.", pa: "ਅਤੇ ਇਸ ਨਾਲ ਜੁੜਿਆ ਸਾਰਾ ਡੇਟਾ (ਫ਼ਸਲਾਂ, ਖਰਚੇ, ਕਮਾਈ) ਹਮੇਸ਼ਾ ਲਈ ਮਿਟ ਜਾਵੇਗਾ।" },
  yesDelete: { hi: "हाँ, हटाएं", en: "Yes, Delete", mr: "होय, हटवा", pa: "ਹਾਂ, ਮਿਟਾਓ" },
  completeSeasonWarning: { hi: "की फसल को पूर्ण मार्क करेंगे। बाद में नई फसल शुरू कर सकते हैं।", en: "season will be marked complete. You can start a new season later.", mr: "हंगाम पूर्ण म्हणून चिन्हांकित केले जाईल. तुम्ही नंतर नवीन हंगाम सुरू करू शकता.", pa: "ਦੀ ਫ਼ਸਲ ਨੂੰ ਪੂਰਾ ਮਾਰਕ ਕਰੇਗਾ। ਬਾਅਦ ਵਿੱਚ ਨਵੀਂ ਫ਼ਸਲ ਸ਼ੁਰੂ ਕਰ ਸਕਦੇ ਹੋ।" },
  yesComplete: { hi: "हाँ, पूरी करें", en: "Yes, Complete", mr: "होय, पूर्ण करा", pa: "ਹਾਂ, ਪੂਰਾ ਕਰੋ" },
  kisanTrustScore: { hi: "किसान ट्रस्ट स्कोर", en: "Kisan Trust Score", mr: "किसान ट्रस्ट स्कोर", pa: "ਕਿਸਾਨ ਟਰੱਸਟ ਸਕੋਰ" },
  languageSettings: { hi: "भाषा / Language", en: "Language", mr: "भाषा", pa: "ਭਾਸ਼ਾ" },
  changeAppLanguage: { hi: "ऐप की भाषा बदलें", en: "Change app language", mr: "अॅपची भाषा बदला", pa: "ਐਪ ਦੀ ਭਾਸ਼ਾ ਬਦਲੋ" },
  landUnitSettings: { hi: "ज़मीन की इकाई / Land Unit", en: "Land Unit", mr: "जमिनीचे एकक", pa: "ਜ਼ਮੀਨ ਦੀ ਇਕਾਈ" },
  chooseAcreBigha: { hi: "एकड़, बीघा या हेक्टेयर चुनें", en: "Choose Acre, Bigha or Hectare", mr: "एकर, बिघा किंवा हेक्टर निवडा", pa: "ਏਕੜ, ਬਿੱਘਾ ਜਾਂ ਹੈਕਟੇਅਰ ਚੁਣੋ" },
  changePin: { hi: "PIN बदलें", en: "Change PIN", mr: "PIN बदला", pa: "PIN ਬਦਲੋ" },
  updateLoginPin: { hi: "अपना लॉगिन PIN अपडेट करें", en: "Update your login PIN", mr: "तुमचा लॉगिन PIN अपडेट करा", pa: "ਆਪਣਾ ਲੌਗਿਨ PIN ਅਪਡੇਟ ਕਰੋ" },
  dataSecurity: { hi: "डेटा सुरक्षा", en: "Data Security", mr: "डेटा सुरक्षा", pa: "ਡੇਟਾ ਸੁਰੱਖਿਆ" },
  setNewPinInstruction: { hi: "4–6 अंकों का नया PIN सेट करें", en: "Set a new 4-6 digit PIN", mr: "४-६ अंकी नवीन PIN सेट करा", pa: "4-6 ਅੰਕਾਂ ਦਾ ਨਵਾਂ PIN ਸੈੱਟ ਕਰੋ" },
  pinChangedSuccess: { hi: "PIN सफलतापूर्वक बदल गया!", en: "PIN successfully changed!", mr: "PIN यशस्वीरित्या बदलला!", pa: "PIN ਸਫਲਤਾਪੂਰਵਕ ਬਦਲ ਗਿਆ!" },
  currentPinLabel: { hi: "मौजूदा PIN", en: "Current PIN", mr: "सध्याचा PIN", pa: "ਮੌਜੂਦਾ PIN" },
  currentPinPlaceholder: { hi: "मौजूदा PIN डालें", en: "Enter current PIN", mr: "सध्याचा PIN टाका", pa: "ਮੌਜੂਦਾ PIN ਦਾਖਲ ਕਰੋ" },
  newPinLabel: { hi: "नया PIN", en: "New PIN", mr: "नवीन PIN", pa: "ਨਵਾਂ PIN" },
  newPinPlaceholder: { hi: "4–6 अंकों का PIN", en: "4-6 digit PIN", mr: "४-६ अंकी PIN", pa: "4-6 ਅੰਕਾਂ ਦਾ PIN" },
  confirmPinLabel: { hi: "PIN दोबारा लिखें", en: "Confirm PIN", mr: "PIN पुन्हा लिहा", pa: "PIN ਦੁਬਾਰਾ ਲਿਖੋ" },
  confirmPinPlaceholder: { hi: "नया PIN फिर लिखें", en: "Re-enter new PIN", mr: "नवीन PIN पुन्हा लिहा", pa: "ਨਵਾਂ PIN ਫਿਰ ਲਿਖੋ" },
  loginToViewSettings: { hi: "सेटिंग्स देखने के लिए लॉगिन करें।", en: "Login to view settings.", mr: "सेटिंग्ज पाहण्यासाठी लॉगिन करा.", pa: "ਸੈਟਿੰਗਾਂ ਦੇਖਣ ਲਈ ਲੌਗਿਨ ਕਰੋ।" },
  accountAndPreferences: { hi: "खाता और प्राथमिकताएं", en: "Account and Preferences", mr: "खाते आणि प्राधान्ये", pa: "ਖਾਤਾ ਅਤੇ ਤਰਜੀਹਾਂ" },
  kisanScoreSection: { hi: "किसान स्कोर (Kisan Score)", en: "Kisan Score", mr: "किसान स्कोर", pa: "ਕਿਸਾਨ ਸਕੋਰ" },
  myFarmsSection: { hi: "मेरे खेत (My Farms)", en: "My Farms", mr: "माझे शेत", pa: "ਮੇਰੇ ਖੇਤ" },
  notificationsSection: { hi: "सूचनाएं (Notifications)", en: "Notifications", mr: "सूचना", pa: "ਸੂਚਨਾਵਾਂ" },
  languageAndUnitSection: { hi: "भाषा और इकाई (Language & Units)", en: "Language & Units", mr: "भाषा आणि एकके", pa: "ਭਾਸ਼ਾ ਅਤੇ ਇਕਾਈ" },
  securitySection: { hi: "खाता सुरक्षा (Security)", en: "Security", mr: "सुरक्षा", pa: "ਸੁਰੱਖਿਆ" },
  helpSection: { hi: "सहायता (Help & Info)", en: "Help & Info", mr: "मदत आणि माहिती", pa: "ਮਦਦ ਅਤੇ ਜਾਣਕਾਰੀ" },
  appVersion: { hi: "संस्करण 1.0.0 · Enterprise Edition", en: "Version 1.0.0 · Enterprise Edition", mr: "आवृत्ती १.०.० · एंटरप्राइज संस्करण", pa: "ਸੰਸਕਰਣ 1.0.0 · ਐਂਟਰਪ੍ਰਾਈਜ਼ ਐਡੀਸ਼ਨ" },
`;
if (!code.includes("egFarmName")) {
  code = code.replace('  // Quick Action Labels', additions + '  // Quick Action Labels');
  fs.writeFileSync('g:/kisan-diary-saas-development/gen_trans.js', code);
  console.log("Added settings keys to gen_trans.js");
} else {
  console.log("Settings keys already added.");
}
