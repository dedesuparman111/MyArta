const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/\\\\n/g, '\\n');
content = content.replace(/\\nimport { Savings }/g, '\nimport { Savings }');
content = content.replace(/apiService.getDashboardData\(\),\\n        apiService.getSavingsGoals\(\),/g, 'apiService.getDashboardData(),\n        apiService.getSavingsGoals(),');
content = content.replace(/setDashboardData\(dash\);\\n      setSavingsGoals\(goals\);/g, 'setDashboardData(dash);\n      setSavingsGoals(goals);');
content = content.replace(/setInstallments\(\[\]\);\\n    setSavingsGoals\(\[\]\);/g, 'setInstallments([]);\n    setSavingsGoals([]);');

fs.writeFileSync('src/App.tsx', content);
