const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
content = content.replace("installments,\\n  transactions,", "installments,\\n  transactions,");
// Just do it the hard way:
const strWithLiteralBackslashN = "installments," + String.fromCharCode(92) + "n  transactions,";
const strWithRealNewline = "installments,\\n  transactions,";
content = content.replace(strWithLiteralBackslashN, strWithRealNewline);
fs.writeFileSync('src/components/Dashboard.tsx', content);
