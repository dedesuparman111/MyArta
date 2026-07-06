/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransactionType = 'Pendapatan' | 'Pengeluaran' | 'Piutang' | 'Cicilan';

export interface Transaction {
  id: string;
  created_at?: string;
  user_id?: string;
  date: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  installment_id?: string | null;
}

export interface Installment {
  id: string;
  created_at?: string;
  user_id?: string;
  name: string;
  creditor: string;
  total_amount: number;
  paid_amount: number;
  remaining: number; // calculated field total_amount - paid_amount
  start_date: string;
  due_date?: string | null;
  description: string;
  status: 'Lunas' | 'Berjalan';
}

export interface AppUser {
  id: string;
  username: string;
  email?: string;
}

export interface DashboardData {
  balance: number;
  income: number;
  expense: number;
  debt: number;
  receivable: number;
  installmentOutstanding: number;
  totalAssetValue: number;
}

export interface Asset {
  id: string;
  created_at?: string;
  user_id?: string;
  name: string;
  type: 'Kripto' | 'Saham' | 'Reksadana' | 'Emas' | 'Lainnya';
  platform: string;
  quantity: number;
  average_price: number;
  current_price: number;
}

export interface SavingsGoal {
  id: string;
  created_at?: string;
  user_id?: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string | null;
  description: string;
  status: 'Tercapai' | 'Berjalan';
}
