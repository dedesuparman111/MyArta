const fs = require('fs');
let content = fs.readFileSync('src/lib/supabase.ts', 'utf-8');

const targetStr = "type SyncAction = { type: 'ADD_TRX' | 'UPDATE_TRX' | 'DELETE_TRX' | 'ADD_INST' | 'UPDATE_INST' | 'DELETE_INST' | 'ADD_GOAL' | 'UPDATE_GOAL' | 'DELETE_GOAL'; payload: any };";
const replaceStr = "type SyncAction = { type: 'ADD_TRX' | 'UPDATE_TRX' | 'DELETE_TRX' | 'ADD_INST' | 'UPDATE_INST' | 'DELETE_INST' | 'ADD_GOAL' | 'UPDATE_GOAL' | 'DELETE_GOAL' | 'ADD_ASSET' | 'UPDATE_ASSET' | 'DELETE_ASSET'; payload: any };";

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync('src/lib/supabase.ts', content);
  console.log("Patched SyncAction");
} else {
  // It might be formatted differently
  content = content.replace(/type SyncAction = \{ type: 'ADD_TRX'.*?; payload: any \};/, replaceStr);
  fs.writeFileSync('src/lib/supabase.ts', content);
  console.log("Patched SyncAction fallback");
}
