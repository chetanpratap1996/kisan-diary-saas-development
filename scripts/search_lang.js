const fs = require('fs');
const path = require('path');
const targetDir = 'g:/kisan-diary-saas-development/src/app/app';

function searchLang(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            searchLang(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');
            lines.forEach((line, i) => {
                if (line.includes('lang ===')) {
                    console.log(fullPath + ':' + (i + 1) + ': ' + line.trim());
                }
            });
        }
    });
}
searchLang(targetDir);
