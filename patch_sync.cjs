const fs = require('fs');
let code = fs.readFileSync('src/lib/supabase.ts', 'utf8');

code = code.replace(
  `  type: 'ADD_TRX' | 'UPDATE_TRX' | 'DELETE_TRX' | 'ADD_INST' | 'UPDATE_INST' | 'DELETE_INST';`,
  `  type: 'ADD_TRX' | 'UPDATE_TRX' | 'DELETE_TRX' | 'ADD_INST' | 'UPDATE_INST' | 'DELETE_INST' | 'ADD_GOAL' | 'UPDATE_GOAL' | 'DELETE_GOAL';`
);

const instDeleteStr = `      } else if (action.type === 'DELETE_INST') {
        const { error } = await supabase.from('installments').delete().eq('id', action.payload);
        if (error) throw error;
      }`;
      
const replacement = `      } else if (action.type === 'DELETE_INST') {
        const { error } = await supabase.from('installments').delete().eq('id', action.payload);
        if (error) throw error;
      } else if (action.type === 'ADD_GOAL') {
        const { error } = await supabase.from('savings_goals').insert([{ ...action.payload, user_id: userId }]);
        if (error && !error.message.includes('duplicate key')) throw error;
      } else if (action.type === 'UPDATE_GOAL') {
        const { error } = await supabase.from('savings_goals').update(action.payload).eq('id', action.payload.id);
        if (error) throw error;
      } else if (action.type === 'DELETE_GOAL') {
        const { error } = await supabase.from('savings_goals').delete().eq('id', action.payload);
        if (error) throw error;
      }`;

code = code.replace(instDeleteStr, replacement);

code = code.replace(/enqueueSyncAction\(\{ type: 'INSERT', table: 'savings_goals', data: newGoal \}\);/g, "enqueueSync({ type: 'ADD_GOAL', payload: newGoal }); processSyncQueue();");
code = code.replace(/enqueueSyncAction\(\{ type: 'UPDATE', table: 'savings_goals', data: goal, id: goal\.id \}\);/g, "enqueueSync({ type: 'UPDATE_GOAL', payload: goal }); processSyncQueue();");
code = code.replace(/enqueueSyncAction\(\{ type: 'DELETE', table: 'savings_goals', id \}\);/g, "enqueueSync({ type: 'DELETE_GOAL', payload: id }); processSyncQueue();");

fs.writeFileSync('src/lib/supabase.ts', code);
