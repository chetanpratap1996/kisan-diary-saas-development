const fs = require('fs');

const path = 'g:/kisan-diary-saas-development/src/app/app/settings/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacements = [
  ['placeholder="जैसे: घर वाला खेत"', 'placeholder={t(lang, "egFarmName")}'],
  ['>क्षेत्रफल ({unitLabel}) *<', '>{t(lang, "areaUnitStar").replace("{unitLabel}", unitLabel)}<'],
  ['placeholder="जैसे: 5"', 'placeholder={t(lang, "eg5Acre")}'],
  ['>गाँव / जिला *<', '>{t(lang, "villageDistrictStar")}<'],
  ['placeholder="बोलें या टाइप करें..."', 'placeholder={t(lang, "speakOrType")}'],
  ['>अतिरिक्त जानकारी (वैकल्पिक)<', '>{t(lang, "additionalInfoOptional")}<'],
  ['>भूमि का प्रकार<', '>{t(lang, "landType")}<'],
  ['placeholder="चुनें..."', 'placeholder={t(lang, "selectOption")}'],
  ['>सिंचाई का स्रोत<', '>{t(lang, "irrigationSource")}<'],
  ['>मिट्टी का प्रकार<', '>{t(lang, "soilType")}<'],
  ['>खेत का नाम<', '>{t(lang, "farmNameLabel")}<'],
  ['>क्षेत्रफल ({unitLabel})<', '>{t(lang, "areaUnit").replace("{unitLabel}", unitLabel)}<'],
  ['>गाँव / जिला<', '>{t(lang, "villageDistrict")}<'],
  ['में नई फसल', '{t(lang, "newSeasonIn")}'],
  ['>फसल का नाम *<', '>{t(lang, "cropNameStar")}<'],
  ['placeholder="फसल का नाम बोलें या लिखें..."', 'placeholder={t(lang, "speakOrTypeCrop")}'],
  ['>बुवाई की तारीख *<', '>{t(lang, "sowingDateStar")}<'],
  ['और उससे जुड़ा सारा डेटा (फसलें, खर्चे, आमदनी) हमेशा के लिए मिट जाएगा।', '{t(lang, "deleteFarmWarning")}'],
  ['>हाँ, हटाएं<', '>{t(lang, "yesDelete")}<'],
  ['की फसल को पूर्ण मार्क करेंगे। बाद में नई फसल शुरू कर सकते हैं।', '{t(lang, "completeSeasonWarning")}'],
  ['>हाँ, पूरी करें<', '>{t(lang, "yesComplete")}<'],
  ['>किसान ट्रस्ट स्कोर<', '>{t(lang, "kisanTrustScore")}<'],
  ['>भाषा / Language<', '>{t(lang, "languageSettings")}<'],
  ['>ऐप की भाषा बदलें<', '>{t(lang, "changeAppLanguage")}<'],
  ['>ज़मीन की इकाई / Land Unit<', '>{t(lang, "landUnitSettings")}<'],
  ['>एकड़, बीघा या हेक्टेयर चुनें<', '>{t(lang, "chooseAcreBigha")}<'],
  ['>PIN बदलें<', '>{t(lang, "changePin")}<'],
  ['>अपना लॉगिन PIN अपडेट करें<', '>{t(lang, "updateLoginPin")}<'],
  ['>डेटा सुरक्षा<', '>{t(lang, "dataSecurity")}<'],
  ['>4–6 अंकों का नया PIN सेट करें<', '>{t(lang, "setNewPinInstruction")}<'],
  ['>PIN सफलतापूर्वक बदल गया!<', '>{t(lang, "pinChangedSuccess")}<'],
  ['>मौजूदा PIN<', '>{t(lang, "currentPinLabel")}<'],
  ['placeholder="मौजूदा PIN डालें"', 'placeholder={t(lang, "currentPinPlaceholder")}'],
  ['>नया PIN<', '>{t(lang, "newPinLabel")}<'],
  ['placeholder="4–6 अंकों का PIN"', 'placeholder={t(lang, "newPinPlaceholder")}'],
  ['>PIN दोबारा लिखें<', '>{t(lang, "confirmPinLabel")}<'],
  ['placeholder="नया PIN फिर लिखें"', 'placeholder={t(lang, "confirmPinPlaceholder")}'],
  ['>सेटिंग्स देखने के लिए लॉगिन करें।<', '>{t(lang, "loginToViewSettings")}<'],
  ['>खाता और प्राथमिकताएं<', '>{t(lang, "accountAndPreferences")}<'],
  ['>किसान स्कोर (Kisan Score)<', '>{t(lang, "kisanScoreSection")}<'],
  ['>मेरे खेत (My Farms)<', '>{t(lang, "myFarmsSection")}<'],
  ['>सूचनाएं (Notifications)<', '>{t(lang, "notificationsSection")}<'],
  ['>भाषा और इकाई (Language & Units)<', '>{t(lang, "languageAndUnitSection")}<'],
  ['>खाता सुरक्षा (Security)<', '>{t(lang, "securitySection")}<'],
  ['>सहायता (Help & Info)<', '>{t(lang, "helpSection")}<'],
  ['>संस्करण 1.0.0 · Enterprise Edition<', '>{t(lang, "appVersion")}<']
];

replacements.forEach(([original, key]) => {
  content = content.split(original).join(key);
});

// Since it's a component, we need to ensure `t` and `lang` are available
if (!content.includes('const lang =')) {
  content = content.replace('const { user', 'const { language, user');
  content = content.replace('const SettingsPage = () => {', 'const SettingsPage = () => {\n  const { language } = useApp();\n  const lang = language || "hi";');
}
if (!content.includes('import { t }')) {
  content = content.replace('import { useApp }', 'import { useApp } from "@/context/AppContext";\nimport { t } from "@/lib/translations";\nimport type { TranslationKey } from "@/lib/translations";\n//');
}

fs.writeFileSync(path, content);
console.log('Updated settings/page.tsx');
