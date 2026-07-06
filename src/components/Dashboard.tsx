/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { DashboardData, Installment, Transaction } from '../types';
import { Analytics } from './Analytics';
import { TrendingUp, ArrowDownCircle, BellRing, CalendarDays, ArrowUpCircle, CreditCard, ClipboardList, Building2 } from 'lucide-react';

interface DashboardProps {
  data: DashboardData;
  installments: Installment[];
  formatRupiah: (num: number) => string;
  onFilterCreditor: (creditor: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  data,
  installments,
  transactions,
  formatRupiah,
  onFilterCreditor,
}) => {
  // Map creditors and their remaining outstanding amount
  const creditorMap: { [key: string]: number } = {};
  installments.forEach((inst) => {
    if (inst.status !== 'Lunas') {
      const cred = inst.creditor || 'Lainnya';
      creditorMap[cred] = (creditorMap[cred] || 0) + inst.remaining;
    }
  });
  
  const upcomingDueDates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const next7Days = new Date(today);
    next7Days.setDate(today.getDate() + 7);

    return installments
      .filter(inst => {
        if (inst.status === 'Lunas' || !inst.due_date) return false;
        const dueDate = new Date(inst.due_date);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate >= today && dueDate <= next7Days;
      })
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }, [installments]);
  const creditors = Object.keys(creditorMap).sort((a, b) => creditorMap[b] - creditorMap[a]);

  return (
    <div className="space-y-6 animate-fade-in" id="dashboard-view">
      {/* Premium Hero Balance Card */}
      <div 
        className="rounded-3xl p-8 text-white shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-gradient-to-br from-primary to-primary-hover"
      >
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <TrendingUp className="w-48 h-48" />
        </div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full -mb-20 -ml-20"></div>
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <p className="text-white/80 text-[11px] sm:text-xs font-semibold mb-1 tracking-wider uppercase">
            Total Saldo Bersih
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {formatRupiah(data.balance)}
          </h2>
          {data.installmentOutstanding > 0 && (
            <p className="text-white/70 text-[10px] mt-1 font-medium bg-white/10 inline-block px-2 py-0.5 rounded-full border border-white/10">
              Sisa Cicilan Aktif: {formatRupiah(data.installmentOutstanding)}
            </p>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 p-5 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl flex items-center justify-center">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pendapatan
            </span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            {formatRupiah(data.income)}
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 p-5 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
          <div className="flex items-center gap-2 text-red-500 dark:text-red-400 mb-2">
            <div className="w-10 h-10 bg-red-50 dark:bg-red-950/30 rounded-xl flex items-center justify-center">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pengeluaran
            </span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            {formatRupiah(data.expense)}
          </div>
        </div>

        {/* Installments (Active Debt) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 p-5 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
          <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400 mb-2">
            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950/30 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Cicilan Aktif
            </span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            {formatRupiah(data.debt)}
          </div>
        </div>

        {/* Receivables (Piutang) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 p-5 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
          <div className="flex items-center gap-2 text-primary dark:text-primary mb-2">
            <div className="w-10 h-10 bg-primary-light dark:bg-primary-light rounded-xl flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Piutang
            </span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            {formatRupiah(data.receivable)}
          </div>
        </div>

        {/* Digital Assets */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 p-5 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
          <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-400 mb-2">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Aset Digital
            </span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            {formatRupiah(data.totalAssetValue || 0)}
          </div>
        </div>
      </div>

      {/* Creditors Outstanding Balance List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-2xl shadow-sm p-6 transition-all duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
            Sisa Cicilan per Kreditur
          </h3>
          <div className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-3.5 py-1.5 rounded-full border border-red-100 dark:border-red-900/30 shadow-sm">
            Total Sisa Tagihan: {formatRupiah(data.installmentOutstanding)}
          </div>
        </div>
        
        {creditors.length === 0 ? (
          <div className="text-center text-slate-400 dark:text-slate-500 text-sm py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <p className="font-medium">Selamat! Tidak ada tagihan cicilan aktif.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {creditors.map((cred) => (
              <button
                key={cred}
                onClick={() => onFilterCreditor(cred)}
                className="group text-left bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800/60 p-4 rounded-xl cursor-pointer transition-all duration-300 hover:shadow flex flex-col justify-between"
              >
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider truncate w-full group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {cred}
                </span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-2">
                  {formatRupiah(creditorMap[cred])}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="mt-8">
        <Analytics transactions={transactions} formatRupiah={formatRupiah} />
      </div>
    </div>
  );
};
