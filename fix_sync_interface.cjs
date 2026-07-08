const fs = require('fs');
let content = fs.readFileSync('src/lib/supabase.ts', 'utf-8');

content = content.replace(
  "type: 'ADD_TRX' | 'UPDATE_TRX' | 'DELETE_TRX' | 'ADD_INST' | 'UPDATE_INST' | 'DELETE_INST' | 'ADD_GOAL' | 'UPDATE_GOAL' | 'DELETE_GOAL';",
  "type: 'ADD_TRX' | 'UPDATE_TRX' | 'DELETE_TRX' | 'ADD_INST' | 'UPDATE_INST' | 'DELETE_INST' | 'ADD_GOAL' | 'UPDATE_GOAL' | 'DELETE_GOAL' | 'ADD_ASSET' | 'UPDATE_ASSET' | 'DELETE_ASSET';"
);

fs.writeFileSync('src/lib/supabase.ts', content);
console.log("Patched SyncAction interface");
