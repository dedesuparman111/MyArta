const fs = require('fs');

let content = fs.readFileSync('src/lib/supabase.ts', 'utf8');

const offlineSyncCode = `
// ==========================================
// OFFLINE SYNC MANAGEMENT
// ==========================================
interface SyncAction {
  id: string;
  type: 'ADD_TRX' | 'UPDATE_TRX' | 'DELETE_TRX' | 'ADD_INST' | 'UPDATE_INST' | 'DELETE_INST';
  payload: any;
  timestamp: number;
}
const SYNC_QUEUE_KEY = 'ArtaQu_sync_queue';

const getSyncQueue = (): SyncAction[] => getLocalData<SyncAction[]>(SYNC_QUEUE_KEY, []);
const setSyncQueue = (queue: SyncAction[]) => setLocalData(SYNC_QUEUE_KEY, queue);

export const enqueueSync = (action: Omit<SyncAction, 'id' | 'timestamp'>) => {
  const queue = getSyncQueue();
  queue.push({
    ...action,
    id: uuidv4(),
    timestamp: Date.now(),
  });
  setSyncQueue(queue);
};

export const processSyncQueue = async () => {
  if (!supabase || (typeof navigator !== 'undefined' && !navigator.onLine)) return;
  const queue = getSyncQueue();
  if (queue.length === 0) return;

  const userRes = await supabase.auth.getUser();
  const userId = userRes.data.user?.id;
  if (!userId) return;

  const newQueue: SyncAction[] = [];
  let successCount = 0;

  for (const action of queue) {
    try {
      if (action.type === 'ADD_TRX') {
        const { error } = await supabase.from('transactions').insert([{ ...action.payload, user_id: userId }]);
        if (error && !error.message.includes('duplicate key')) throw error;
      } else if (action.type === 'UPDATE_TRX') {
        const { error } = await supabase.from('transactions').update(action.payload).eq('id', action.payload.id);
        if (error) throw error;
      } else if (action.type === 'DELETE_TRX') {
        const { error } = await supabase.from('transactions').delete().eq('id', action.payload);
        if (error) throw error;
      } else if (action.type === 'ADD_INST') {
        const { error } = await supabase.from('installments').insert([{ ...action.payload, user_id: userId }]);
        if (error && !error.message.includes('duplicate key')) throw error;
      } else if (action.type === 'UPDATE_INST') {
        const { error } = await supabase.from('installments').update(action.payload).eq('id', action.payload.id);
        if (error) throw error;
      } else if (action.type === 'DELETE_INST') {
        const { error } = await supabase.from('installments').delete().eq('id', action.payload);
        if (error) throw error;
      }
      successCount++;
    } catch (err: any) {
      console.error('Sync error:', err);
      newQueue.push(action);
      break; 
    }
  }

  const remaining = queue.slice(successCount + (newQueue.length > 0 ? 1 : 0));
  setSyncQueue([...newQueue, ...remaining]);
};

if (typeof window !== 'undefined') {
  window.addEventListener('online', processSyncQueue);
}

// ==========================================
// UNIFIED DATA SERVICE
// ==========================================
`;

content = content.replace('// ==========================================\n// UNIFIED DATA SERVICE (Supabase + LocalStorage Fallback)\n// ==========================================', offlineSyncCode);

fs.writeFileSync('src/lib/supabase.ts', content);
