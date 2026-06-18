const fs = require('fs');

function replaceFile(path, replacements) {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    replacements.forEach(([original, key]) => {
      content = content.split(original).join(key);
    });

    if (!content.includes('const lang =')) {
      content = content.replace('const { apiCall } = useApp();', 'const { apiCall, language } = useApp();\n  const lang = language || "hi";');
    }
    if (!content.includes('import { t }')) {
      content = content.replace('import { useApp }', 'import { useApp } from "@/context/AppContext";\nimport { t } from "@/lib/translations";\nimport type { TranslationKey } from "@/lib/translations";\n//');
    }
    
    fs.writeFileSync(path, content);
    console.log('Updated ' + path);
  }
}

const khataPath = 'g:/kisan-diary-saas-development/src/app/app/khata/page.tsx';
replaceFile(khataPath, [
  ['>अपना पहला खर्च या आमदनी दर्ज करके अपना बहीखाता शुरू करें।<', '>{t(lang, "startKhataPrompt")}<'],
  ['Bal:', '{t(lang, "balancePrefix")}']
]);

const creditPath = 'g:/kisan-diary-saas-development/src/app/app/credit/page.tsx';
replaceFile(creditPath, [
  ['>Initializing Scoring Engine<', '>{t(lang, "initScoring")}<'],
  ['>Govt. Scheme Eligibility<', '>{t(lang, "govtSchemeLabel")}<'],
  ['>Max 850<', '>{t(lang, "maxScore850")}<'],
  ['{tierLabel} Tier', '{tierLabel} {t(lang, "tierLabelStr")}'],
  ['>Base Profile<', '>{t(lang, "baseProfile")}<'],
  ['>Identity verified.<', '>{t(lang, "identityVerified")}<'],
  ['>Khata Activity<', '>{t(lang, "khataActivity")}<'],
  ['>Consistent daily entries.<', '>{t(lang, "consistentEntries")}<'],
  ['>Credit Reliability<', '>{t(lang, "creditReliability")}<'],
  ['Farmers with a Readiness Score above 750 get their <strong className="text-teal-300">subsidy paperwork approved 3x faster</strong>. Keep logging your daily Khata to unlock the best schemes!', '{t(lang, "creditAdvisoryText")}'],
  ['>Based on your Profile Readiness<', '>{t(lang, "basedOnReadiness")}<'],
  ['Unlocks at {scheme.requiredScore} Score', '{t(lang, "unlocksAtScore").replace("{score}", scheme.requiredScore.toString())}'],
  ['>Keep recording to be eligible<', '>{t(lang, "keepRecording")}<'],
  ['>Key Benefit<', '>{t(lang, "keyBenefit")}<']
]);
