/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { Transaction, Installment, DashboardData, AppUser, SavingsGoal } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Read configuration from Vite environment variables
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

// Determine if Supabase is genuinely configured
export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.trim() !== '' &&
    supabaseUrl.startsWith('http') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.trim() !== '' &&
    supabaseUrl !== 'https://your-project-id.supabase.co' &&
    supabaseAnonKey !== 'your-supabase-anon-key'
  );
};

// Initialize the Supabase client conditionally to avoid crashing
let supabaseClient = null;
if (isSupabaseConfigured()) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.error('Failed to initialize Supabase client:', e);
  }
}
export const supabase = supabaseClient;

// ==========================================
// LOCAL STORAGE FALLBACK SEED DATA
// ==========================================
const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'trx-1',
    date: '2026-07-01',
    type: 'Pendapatan',
    category: 'Gaji Bulanan',
    amount: 8500000,
    description: 'Transfer Gaji Pokok PT Maju Bersama',
  },
  {
    id: 'trx-2',
    date: '2026-07-01',
    type: 'Pengeluaran',
    category: 'Makanan & Minuman',
    amount: 150000,
    description: 'Makan malam bersama keluarga',
  },
  {
    id: 'trx-3',
    date: '2026-07-02',
    type: 'Piutang',
    category: 'Pinjaman Teman',
    amount: 500000,
    description: 'Pinjaman ke Budi (janji bayar akhir bulan)',
  },
];

const DEFAULT_INSTALLMENTS: Installment[] = [
  {
    id: 'inst-1',
    name: 'Cicilan Laptop Kerja',
    creditor: 'Adira Finance',
    total_amount: 12000000,
    paid_amount: 4000000,
    remaining: 8000000,
    start_date: '2026-01-10',
    due_date: '2026-12-10',
    description: 'Laptop Asus ROG untuk coding dan desain',
    status: 'Berjalan',
  },
  {
    id: 'inst-2',
    name: 'Cicilan Sepeda Motor',
    creditor: 'FIF Group',
    total_amount: 24000000,
    paid_amount: 24000000,
    remaining: 0,
    start_date: '2025-01-05',
    due_date: '2026-01-05',
    description: 'Motor Honda Vario 160cc',
    status: 'Lunas',
  },
];

const DEFAULT_SAVINGS_GOALS: SavingsGoal[] = [];

// Helper to get local data safely
const getLocalData = <T>(key: string, defaultData: T): T => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }
  try {
    return JSON.parse(data) as T;
  } catch {
    return defaultData;
  }
};

const setLocalData = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};


// ==========================================
// OFFLINE SYNC MANAGEMENT
// ==========================================
interface SyncAction {
  id: string;
  type: 'ADD_TRX' | 'UPDATE_TRX' | 'DELETE_TRX' | 'ADD_INST' | 'UPDATE_INST' | 'DELETE_INST' | 'ADD_GOAL' | 'UPDATE_GOAL' | 'DELETE_GOAL';
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
        const { remaining, ...instPayload } = action.payload;
        const { error } = await supabase.from('installments').insert([{ ...instPayload, user_id: userId }]);
        if (error && !error.message.includes('duplicate key')) throw error;
      } else if (action.type === 'UPDATE_INST') {
        const { remaining, ...instPayload } = action.payload;
        const { error } = await supabase.from('installments').update(instPayload).eq('id', instPayload.id);
        if (error) throw error;
      } else if (action.type === 'DELETE_INST') {
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

export const apiService = {
  // --- AUTHENTICATION ---
  async getCurrentUser(): Promise<AppUser | null> {
    if (supabase) {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        if (session) {
          const { data: { user }, error } = await supabase.auth.getUser();
          if (error) throw error;
          if (user) {
            return {
              id: user.id,
              username: user.email?.split('@')[0] || 'User',
              email: user.email,
            };
          }
        }
      } catch (e: any) {
        if (e.message !== 'Auth session missing!') {
          console.error('Error getting Supabase user:', e);
        }
      }
    }

    // Fallback Session
    const localUser = localStorage.getItem('ArtaQu_user');
    if (localUser) {
      try {
        return JSON.parse(localUser);
      } catch {
        return null;
      }
    }
    return null;
  },

  async signIn(email: string, password?: string): Promise<{ success: boolean; user: AppUser | null; message: string }> {
    if (email.trim() === 'admin' && password === 'admin123') {
      const mockUser: AppUser = { id: 'usr-admin', username: 'Admin' };
      localStorage.setItem('ArtaQu_user', JSON.stringify(mockUser));
      return { success: true, user: mockUser, message: 'Berhasil masuk (Demo Mode).' };
    }

    if (supabase && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });
        if (error) throw error;
        if (data.user) {
          const appUser: AppUser = {
            id: data.user.id,
            username: data.user.user_metadata?.username || data.user.email?.split('@')[0] || 'User',
            email: data.user.email,
          };
          localStorage.setItem('ArtaQu_user', JSON.stringify(appUser));
          return { success: true, user: appUser, message: 'Berhasil masuk.' };
        }
      } catch (e: any) {
        if (e.message.includes('Invalid login credentials')) {
          return { success: false, user: null, message: 'Email atau Password salah.' };
        }
        if (e.message.includes('Email not confirmed')) {
          return { success: false, user: null, message: 'Silakan cek email Anda dan konfirmasi pendaftaran terlebih dahulu.' };
        }
        return { success: false, user: null, message: e.message || 'Gagal masuk.' };
      }
    }

    return { success: false, user: null, message: 'Email atau Password salah! (Gunakan admin/admin123 untuk Demo)' };
  },

  async signUp(username: string, email: string, password?: string): Promise<{ success: boolean; user: AppUser | null; message: string }> {
    if (supabase && password) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: { username },
          },
        });
        if (error) throw error;
        if (data.user) {
          const appUser: AppUser = {
            id: data.user.id,
            username: username,
            email: data.user.email,
          };
          
          if (data.session) {
             localStorage.setItem('ArtaQu_user', JSON.stringify(appUser));
             return { success: true, user: appUser, message: 'Pendaftaran berhasil!' };
          } else {
             return { success: true, user: appUser, message: 'Pendaftaran berhasil! Cek email Anda untuk konfirmasi pendaftaran.' };
          }
        }
      } catch (e: any) {
        return { success: false, user: null, message: e.message || 'Gagal mendaftar.' };
      }
    }

    return { success: false, user: null, message: 'Pendaftaran hanya tersedia apabila Supabase sudah terkonfigurasi.' };
  },

  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    if (supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        return { success: true, message: 'Link reset password telah dikirim ke email Anda.' };
      } catch (e: any) {
        return { success: false, message: e.message || 'Gagal mengirim link reset password.' };
      }
    }
    return { success: false, message: 'Fitur reset password hanya tersedia apabila Supabase sudah terkonfigurasi.' };
  },

  async signOut(): Promise<void> {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('ArtaQu_user');
  },

  // --- TRANSACTIONS ---
  async getTransactions(): Promise<Transaction[]> {
    if (supabase && (typeof navigator === 'undefined' || navigator.onLine)) {
      try {
        await processSyncQueue();
        const queue = getSyncQueue();
        if (queue.length === 0) {
          const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });
          if (error) throw error;
          setLocalData('ArtaQu_trxs', data as Transaction[]);
          return data as Transaction[];
        }
      } catch (e) {
        console.error('Error fetching transactions from Supabase:', e);
      }
    }

    const trxs = getLocalData<Transaction[]>('ArtaQu_trxs', DEFAULT_TRANSACTIONS);
    return [...trxs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async addTransaction(trx: Omit<Transaction, 'id'>): Promise<{ success: boolean; data: Transaction | null; message: string }> {
    const uuidId = uuidv4();
    const newTrx: Transaction = { ...trx, id: uuidId, installment_id: trx.installment_id || null };
    
    const trxs = getLocalData<Transaction[]>('ArtaQu_trxs', DEFAULT_TRANSACTIONS);
    trxs.push(newTrx);
    setLocalData('ArtaQu_trxs', trxs);
    
    if (trx.type === 'Cicilan' && trx.installment_id) {
       await this.adjustInstallmentPayment(trx.installment_id, trx.amount);
    }

    enqueueSync({ type: 'ADD_TRX', payload: newTrx });
    processSyncQueue();
    
    return { success: true, data: newTrx, message: 'Transaksi berhasil disimpan.' };
  },

  async updateTransaction(trx: Transaction): Promise<{ success: boolean; data: Transaction | null; message: string }> {
    const trxs = getLocalData<Transaction[]>('ArtaQu_trxs', DEFAULT_TRANSACTIONS);
    const index = trxs.findIndex(t => t.id === trx.id);
    if (index !== -1) {
      const oldTrx = trxs[index];
      trxs[index] = trx;
      setLocalData('ArtaQu_trxs', trxs);

      if (oldTrx && trx.type === 'Cicilan' && trx.installment_id) {
        const diff = trx.amount - oldTrx.amount;
        if (diff !== 0) {
          await this.adjustInstallmentPayment(trx.installment_id, diff);
        }
      }
    }

    enqueueSync({ type: 'UPDATE_TRX', payload: trx });
    processSyncQueue();
    
    return { success: true, data: trx, message: 'Transaksi berhasil diperbarui.' };
  },

  async deleteTransaction(id: string): Promise<{ success: boolean; message: string }> {
    const trxs = getLocalData<Transaction[]>('ArtaQu_trxs', DEFAULT_TRANSACTIONS);
    const index = trxs.findIndex(t => t.id === id);
    if (index !== -1) {
      const trx = trxs[index];
      trxs.splice(index, 1);
      setLocalData('ArtaQu_trxs', trxs);

      if (trx && trx.type === 'Cicilan' && trx.installment_id) {
        await this.adjustInstallmentPayment(trx.installment_id, -trx.amount);
      }
    }

    enqueueSync({ type: 'DELETE_TRX', payload: id });
    processSyncQueue();
    
    return { success: true, message: 'Transaksi berhasil dihapus.' };
  },

  // --- INSTALLMENTS ---
  async getInstallments(): Promise<Installment[]> {
    if (supabase && (typeof navigator === 'undefined' || navigator.onLine)) {
      try {
        await processSyncQueue();
        const queue = getSyncQueue();
        if (queue.length === 0) {
          const { data, error } = await supabase
            .from('installments')
            .select('*')
            .order('start_date', { ascending: false });
          if (error) throw error;
          
          const formattedData = (data as Installment[]).map(inst => ({
            ...inst,
            remaining: Math.max(0, inst.total_amount - inst.paid_amount),
          }));
          setLocalData('ArtaQu_insts', formattedData);
          return formattedData;
        }
      } catch (e) {
        console.error('Error fetching installments from Supabase:', e);
      }
    }

    const insts = getLocalData<Installment[]>('ArtaQu_insts', DEFAULT_INSTALLMENTS);
    return insts.map(inst => ({
      ...inst,
      remaining: Math.max(0, inst.total_amount - inst.paid_amount),
    })).sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  },

  async addInstallment(inst: Omit<Installment, 'id' | 'remaining' | 'paid_amount' | 'status'>): Promise<{ success: boolean; data: Installment | null; message: string }> {
    const localId = uuidv4();
    const newInst: Installment = {
      ...inst,
      id: localId,
      paid_amount: 0,
      remaining: inst.total_amount,
      status: 'Berjalan',
    };

    const insts = getLocalData<Installment[]>('ArtaQu_insts', DEFAULT_INSTALLMENTS);
    insts.push(newInst);
    setLocalData('ArtaQu_insts', insts);

    enqueueSync({ type: 'ADD_INST', payload: newInst });
    processSyncQueue();

    return { success: true, data: newInst, message: 'Cicilan berhasil disimpan.' };
  },

  async updateInstallment(inst: Installment): Promise<{ success: boolean; data: Installment | null; message: string }> {
    const status = inst.paid_amount >= inst.total_amount ? 'Lunas' : 'Berjalan';
    const updatedInst = {
      ...inst,
      status: status as 'Lunas' | 'Berjalan',
      remaining: Math.max(0, inst.total_amount - inst.paid_amount),
    };

    const insts = getLocalData<Installment[]>('ArtaQu_insts', DEFAULT_INSTALLMENTS);
    const index = insts.findIndex(i => i.id === inst.id);
    if (index !== -1) {
      insts[index] = updatedInst;
      setLocalData('ArtaQu_insts', insts);
    }

    enqueueSync({ type: 'UPDATE_INST', payload: updatedInst });
    processSyncQueue();

    return { success: true, data: updatedInst, message: 'Cicilan berhasil diperbarui.' };
  },

  async deleteInstallment(id: string): Promise<{ success: boolean; message: string }> {
    const insts = getLocalData<Installment[]>('ArtaQu_insts', DEFAULT_INSTALLMENTS);
    const index = insts.findIndex(i => i.id === id);
    if (index !== -1) {
      insts.splice(index, 1);
      setLocalData('ArtaQu_insts', insts);
    }

    enqueueSync({ type: 'DELETE_INST', payload: id });
    processSyncQueue();

    return { success: true, message: 'Cicilan berhasil dihapus.' };
  },

  // --- BUSINESS LOGIC HELPER: ADJUUST INSTALLMENT PAYMENT ---
  async adjustInstallmentPayment(installmentId: string, amount: number): Promise<void> {
    const insts = getLocalData<Installment[]>('ArtaQu_insts', DEFAULT_INSTALLMENTS);
    const index = insts.findIndex(i => i.id === installmentId);
    if (index !== -1) {
      const inst = insts[index];
      const newPaidAmount = Math.max(0, inst.paid_amount + amount);
      const updatedInst = {
        ...inst,
        paid_amount: newPaidAmount,
        remaining: Math.max(0, inst.total_amount - newPaidAmount),
        status: (newPaidAmount >= inst.total_amount ? 'Lunas' : 'Berjalan') as 'Lunas' | 'Berjalan',
      };
      insts[index] = updatedInst;
      setLocalData('ArtaQu_insts', insts);

      enqueueSync({ type: 'UPDATE_INST', payload: updatedInst });
      processSyncQueue();
    }
  },

  // --- DASHBOARD CALCULATION ---
  async getSavingsGoals(): Promise<SavingsGoal[]> {
    if (supabase && (typeof navigator === 'undefined' || navigator.onLine)) {
      try {
        await processSyncQueue();
        const queue = getSyncQueue();
        if (queue.length === 0) {
          const { data, error } = await supabase
            .from('savings_goals')
            .select('*')
            .order('created_at', { ascending: false });
          if (error) throw error;
          setLocalData('ArtaQu_savings', data as SavingsGoal[]);
          return data as SavingsGoal[];
        }
      } catch (e) {
        console.error('Error fetching savings goals:', e);
      }
    }
    return getLocalData<SavingsGoal[]>('ArtaQu_savings', DEFAULT_SAVINGS_GOALS);
  },

  async addSavingsGoal(goal: Omit<SavingsGoal, 'id'>): Promise<{ success: boolean; data?: SavingsGoal; message?: string }> {
    const newId = uuidv4();
    const user = await this.getCurrentUser();
    const newGoal: SavingsGoal = { ...goal, id: newId, user_id: user?.id, created_at: new Date().toISOString() };

    if (supabase && (typeof navigator === 'undefined' || navigator.onLine)) {
      try {
        const { data, error } = await supabase.from('savings_goals').insert([newGoal]).select();
        if (error) throw error;
        
        const localGoals = getLocalData<SavingsGoal[]>('ArtaQu_savings', DEFAULT_SAVINGS_GOALS);
        setLocalData('ArtaQu_savings', [data[0] as SavingsGoal, ...localGoals]);
        
        return { success: true, data: data[0] as SavingsGoal };
      } catch (e: any) {
        enqueueSync({ type: 'ADD_GOAL', payload: newGoal }); processSyncQueue();
      }
    } else {
      enqueueSync({ type: 'ADD_GOAL', payload: newGoal }); processSyncQueue();
    }

    const localGoals = getLocalData<SavingsGoal[]>('ArtaQu_savings', DEFAULT_SAVINGS_GOALS);
    setLocalData('ArtaQu_savings', [newGoal, ...localGoals]);
    return { success: true, data: newGoal, message: 'Disimpan offline.' };
  },

  async updateSavingsGoal(goal: SavingsGoal): Promise<{ success: boolean; message?: string }> {
    if (supabase && (typeof navigator === 'undefined' || navigator.onLine)) {
      try {
        const { error } = await supabase.from('savings_goals').update(goal).eq('id', goal.id);
        if (error) throw error;
      } catch (e: any) {
        enqueueSync({ type: 'UPDATE_GOAL', payload: goal }); processSyncQueue();
      }
    } else {
      enqueueSync({ type: 'UPDATE_GOAL', payload: goal }); processSyncQueue();
    }

    const localGoals = getLocalData<SavingsGoal[]>('ArtaQu_savings', DEFAULT_SAVINGS_GOALS);
    setLocalData('ArtaQu_savings', localGoals.map(g => g.id === goal.id ? goal : g));
    return { success: true };
  },

  async deleteSavingsGoal(id: string): Promise<{ success: boolean; message?: string }> {
    if (supabase && (typeof navigator === 'undefined' || navigator.onLine)) {
      try {
        const { error } = await supabase.from('savings_goals').delete().eq('id', id);
        if (error) throw error;
      } catch (e: any) {
        enqueueSync({ type: 'DELETE_GOAL', payload: id }); processSyncQueue();
      }
    } else {
      enqueueSync({ type: 'DELETE_GOAL', payload: id }); processSyncQueue();
    }

    const localGoals = getLocalData<SavingsGoal[]>('ArtaQu_savings', DEFAULT_SAVINGS_GOALS);
    setLocalData('ArtaQu_savings', localGoals.filter(g => g.id !== id));
    return { success: true };
  },

  async getDashboardData(): Promise<DashboardData> {
    const trxs = await this.getTransactions();
    const insts = await this.getInstallments();

    let income = 0;
    let expense = 0;
    let receivable = 0; // Piutang yang masih belum lunas / aktif
    let paidInstallments = 0;
    let installmentOutstanding = 0; // Sisa cicilan yang belum dibayar

    trxs.forEach(t => {
      if (t.type === 'Pendapatan') {
        income += t.amount;
      } else if (t.type === 'Pengeluaran') {
        expense += t.amount;
      } else if (t.type === 'Piutang') {
        receivable += t.amount;
      } else if (t.type === 'Cicilan') {
        paidInstallments += t.amount;
      }
    });

    insts.forEach(i => {
      if (i.status === 'Berjalan') {
        installmentOutstanding += i.remaining;
      }
    });

    // Net balance = Income - Expense - Paid Installments
    const balance = income - expense - paidInstallments;

    return {
      balance,
      income,
      expense,
      debt: installmentOutstanding, // Total Cicilan Aktif
      receivable,
      installmentOutstanding,
    };
  },

  // --- DATABASE RESET ---
  async resetDatabase(): Promise<{ success: boolean; message: string }> {
    if (supabase) {
      try {
        const user = await this.getCurrentUser();
        if (!user) throw new Error('Pengguna tidak ditemukan.');
        
        const { error: error1 } = await supabase.from('transactions').delete().eq('user_id', user.id);
        const { error: error2 } = await supabase.from('installments').delete().eq('user_id', user.id);
        const { error: error3 } = await supabase.from('savings_goals').delete().eq('user_id', user.id);
        
        if (error1) throw error1;
        if (error2) throw error2;
        
        localStorage.removeItem('ArtaQu_trxs');
        localStorage.removeItem('ArtaQu_insts');
        localStorage.removeItem('ArtaQu_savings');
        
        return { success: true, message: 'Seluruh data Anda di Supabase berhasil di-reset.' };
      } catch (e: any) {
        return { success: false, message: e.message || 'Gagal me-reset database.' };
      }
    }

    // Fallback
    localStorage.removeItem('ArtaQu_trxs');
    localStorage.removeItem('ArtaQu_insts');
    return { success: true, message: 'Penyimpanan lokal berhasil dikosongkan.' };
  },
};
