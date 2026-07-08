const fs = require('fs');
let content = fs.readFileSync('src/lib/supabase.ts', 'utf-8');

// The type SyncAction might be defined like:
// type SyncAction = { type: 'ADD_TRX' | ... };

// Replace the entire type declaration
const targetRegex = /type SyncAction = \{ type: '[^}]+ \};/g;

content = content.replace(targetRegex, "type SyncAction = { type: 'ADD_TRX' | 'UPDATE_TRX' | 'DELETE_TRX' | 'ADD_INST' | 'UPDATE_INST' | 'DELETE_INST' | 'ADD_GOAL' | 'UPDATE_GOAL' | 'DELETE_GOAL' | 'ADD_ASSET' | 'UPDATE_ASSET' | 'DELETE_ASSET'; payload: any };");

fs.writeFileSync('src/lib/supabase.ts', content);
console.log("Patched SyncAction type again");
