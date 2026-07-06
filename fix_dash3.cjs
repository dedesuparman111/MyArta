const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
content = content.replace("installments,\\\\n  transactions,", "installments,\\n  transactions,");
fs.writeFileSync('src/components/Dashboard.tsx', content);
