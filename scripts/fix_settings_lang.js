const fs = require('fs');

const file = 'g:/kisan-diary-saas-development/src/app/app/settings/page.tsx';
let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

const inject = (funcName) => {
  const idx = lines.findIndex(l => l.includes('function ' + funcName + '() {'));
  if (idx !== -1) {
    // Check if we already injected it
    if (!lines[idx + 1].includes('const lang =')) {
      lines.splice(idx + 1, 0, '  const { language } = useApp();', '  const lang = language || "hi";');
    }
  }
};

['KisanScoreWidget', 'NotificationsSection', 'LanguageUnitsSection', 'SecuritySection', 'HelpSection'].forEach(inject);

fs.writeFileSync(file, lines.join('\n'));
console.log('Fixed lang in components perfectly');
