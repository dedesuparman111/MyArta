const fs = require('fs');
let content = fs.readFileSync('src/lib/supabase.ts', 'utf8');
content = content.replace(/\\\\n/g, '\\n');
fs.writeFileSync('src/lib/supabase.ts', content);
