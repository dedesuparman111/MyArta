/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AppUser, Transaction, Installment, DashboardData, SavingsGoal, Asset } from './types';
import { apiService, supabase } from './lib/supabase';
import { Dashboard } from './components/Dashboard';
import { Savings } from './components/Savings';
import { Transactions } from './components/Transactions';
import { Installments } from './components/Installments';
import { Settings } from './components/Settings';
import { Auth } from './components/Auth';
import { Assets } from './components/Assets';
import { Layers, Wallet, CreditCard, Settings as SettingsIcon, LogOut, RefreshCw, CheckCircle, AlertCircle, Terminal, Plus, Home, ArrowRightLeft, User, LayoutGrid, ReceiptText, Settings2, Target, Briefcase } from 'lucide-react';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error';
}

export default function App() {
  // Session & Navigation State
  const [user, setUser] = useState<AppUser | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'transactions' | 'installments' | 'savings' | 'assets' | 'settings'>('dashboard');
  const [showGlobalAdd, setShowGlobalAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  // App Core Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    balance: 0,
    income: 0,
    expense: 0,
    debt: 0,
    receivable: 0,
    installmentOutstanding: 0,
    totalAssetValue: 0,
  });

  // UI Customization State
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [accent, setAccent] = useState<string>('blue');
  const [filterCreditor, setFilterCreditor] = useState<string>('all');

  // Notification Toast State
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Show a beautifully animated non-intrusive toast
  const showToast = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Helper: format numbers to Rupiah
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num || 0);
  };

  // Helper: format standard ISO date string to human-readable
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Dynamic Theme & Accent Application
  const applyThemeAndAccent = (currentTheme: 'light' | 'dark', currentAccent: string) => {
    const root = document.documentElement;
    
    // Theme application
    if (currentTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Accent colors mapping
    const accents: Record<string, { main: string; hover: string; light: string }> = {
      blue: { main: '#2563eb', hover: '#1d4ed8', light: 'rgba(37, 99, 235, 0.08)' },
      orange: { main: '#f97316', hover: '#ea580c', light: 'rgba(249, 115, 22, 0.08)' },
      green: { main: '#10b981', hover: '#059669', light: 'rgba(16, 185, 129, 0.08)' },
      purple: { main: '#8b5cf6', hover: '#7c3aed', light: 'rgba(139, 92, 246, 0.08)' },
      red: { main: '#ef4444', hover: '#dc2626', light: 'rgba(239, 68, 68, 0.08)' },
    };

    const selected = accents[currentAccent] || accents.blue;
    root.style.setProperty('--primary-color', selected.main);
    root.style.setProperty('--primary-hover', selected.hover);
    root.style.setProperty('--primary-light', selected.light);
  };

  // Effect: Initial customization load
  useEffect(() => {
    const savedTheme = localStorage.getItem('ArtaQu_theme') as 'light' | 'dark' || 'light';
    const savedAccent = localStorage.getItem('ArtaQu_accent') || 'blue';
    setTheme(savedTheme);
    setAccent(savedAccent);
    applyThemeAndAccent(savedTheme, savedAccent);
  }, []);

  // Update theme & accent helpers
  const handleSetTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('ArtaQu_theme', newTheme);
    applyThemeAndAccent(newTheme, accent);
  };

  const handleSetAccent = (newAccent: string) => {
    setAccent(newAccent);
    localStorage.setItem('ArtaQu_accent', newAccent);
    applyThemeAndAccent(theme, newAccent);
  };

  // Load all user records from database
  const loadCoreData = async () => {
    try {
      const [trxs, insts, dash, goals, asts] = await Promise.all([
        apiService.getTransactions(),
        apiService.getInstallments(),
        apiService.getDashboardData(),
        apiService.getSavingsGoals(),
        apiService.getAssets(),
      ]);
      setTransactions(trxs);
      setInstallments(insts);
      setDashboardData(dash);
      setSavingsGoals(goals);
      setAssets(asts);
    } catch (e: any) {
      showToast('Koneksi Gagal', e.message || 'Gagal menyinkronkan data keuangan.', 'error');
    }
  };

  // Effect: Auth & Core data initialization
  useEffect(() => {
    const initApp = async () => {
      try {
        const currentUser = await apiService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          await loadCoreData();

          // Handle URL hashes for email verification & password recovery
          const hash = window.location.hash;
          if (hash && hash.includes('type=signup')) {
            showToast('Verifikasi Berhasil', 'Email Anda telah berhasil diverifikasi!', 'success');
            window.history.replaceState(null, '', window.location.pathname);
          } else if (hash && hash.includes('type=recovery')) {
            showToast('Reset Password', 'Silakan ubah password Anda di menu Pengaturan.', 'success');
            setActiveView('settings'); // Navigate directly to settings
            window.history.replaceState(null, '', window.location.pathname);
          }
        }
      } catch (e: any) {
        showToast('Kesalahan Sesi', 'Gagal memulihkan sesi pengguna.', 'error');
      } finally {
        setLoading(false);
      }
    };
    initApp();

    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            const currentUser = await apiService.getCurrentUser();
            if (currentUser && !user) {
              setUser(currentUser);
              await loadCoreData();
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        }
      );
      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Effect: PWA Install Prompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
    }
    setDeferredPrompt(null);
  };

  // Trigger manual page data refresh
  const handleManualRefresh = async () => {
    setLoading(true);
    await loadCoreData();
    setLoading(false);
    showToast('Sinkronisasi', 'Semua data keuangan berhasil diperbarui.', 'success');
  };

  // Auth success callback
  const handleAuthSuccess = async (authenticatedUser: AppUser) => {
    setUser(authenticatedUser);
    showToast('Berhasil Masuk', `Selamat datang kembali, ${authenticatedUser.username}!`, 'success');
    setLoading(true);
    await loadCoreData();
    setLoading(false);
  };

  // Sign out callback
  const handleSignOut = async () => {
    await apiService.signOut();
    setUser(null);
    setTransactions([]);
    setInstallments([]);
    setSavingsGoals([]);
    setDashboardData({
      balance: 0,
      income: 0,
      expense: 0,
      debt: 0,
      receivable: 0,
      installmentOutstanding: 0,
    });
    showToast('Sesi Berakhir', 'Anda telah keluar dari aplikasi.', 'success');
  };

  // Switch view on widget interactions
  const handleFilterCreditor = (creditor: string) => {
    setFilterCreditor(creditor);
    setActiveView('installments');
  };

  // ==========================================
  // CORE DB TRANSACTION OPERATORS
  // ==========================================
  const handleAddTransaction = async (trx: Omit<Transaction, 'id'>) => {
    const res = await apiService.addTransaction(trx);
    if (res.success) {
      showToast('Sukses', res.message || 'Transaksi berhasil ditambahkan.', 'success');
      await loadCoreData();
      return true;
    } else {
      showToast('Gagal', res.message || 'Gagal menambahkan transaksi.', 'error');
      return false;
    }
  };

  const handleEditTransaction = async (trx: Transaction) => {
    const res = await apiService.updateTransaction(trx);
    if (res.success) {
      showToast('Sukses', res.message || 'Transaksi berhasil diperbarui.', 'success');
      await loadCoreData();
      return true;
    } else {
      showToast('Gagal', res.message || 'Gagal memperbarui transaksi.', 'error');
      return false;
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      const res = await apiService.deleteTransaction(id);
      if (res.success) {
        showToast('Sukses', res.message || 'Transaksi berhasil dihapus.', 'success');
        await loadCoreData();
      } else {
        showToast('Gagal', res.message || 'Gagal menghapus transaksi.', 'error');
      }
    }
  };

  // ==========================================
  // CORE DB INSTALLMENT OPERATORS
  // ==========================================
  const handleAddInstallment = async (inst: Omit<Installment, 'id' | 'remaining' | 'paid_amount' | 'status'>) => {
    const res = await apiService.addInstallment(inst);
    if (res.success) {
      showToast('Sukses', res.message || 'Cicilan baru berhasil ditambahkan.', 'success');
      await loadCoreData();
      return true;
    } else {
      showToast('Gagal', res.message || 'Gagal menambahkan cicilan.', 'error');
      return false;
    }
  };

  const handleEditInstallment = async (inst: Installment) => {
    const res = await apiService.updateInstallment(inst);
    if (res.success) {
      showToast('Sukses', res.message || 'Cicilan berhasil diperbarui.', 'success');
      await loadCoreData();
      return true;
    } else {
      showToast('Gagal', res.message || 'Gagal memperbarui cicilan.', 'error');
      return false;
    }
  };

  const handleDeleteInstallment = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus cicilan ini? Riwayat bayar di transaksi tidak akan terhapus.')) {
      const res = await apiService.deleteInstallment(id);
      if (res.success) {
        showToast('Sukses', res.message || 'Cicilan berhasil dihapus.', 'success');
        await loadCoreData();
      } else {
        showToast('Gagal', res.message || 'Gagal menghapus cicilan.', 'error');
      }
    }
  };

  // ==========================================
  // CORE DB SAVINGS OPERATORS
  // ==========================================
  const handleAddSavingsGoal = async (goal: Omit<SavingsGoal, 'id'>) => {
    const res = await apiService.addSavingsGoal(goal);
    if (res.success) {
      await loadCoreData();
      return true;
    } else {
      showToast('Gagal', res.message || 'Gagal menambahkan target tabungan.', 'error');
      return false;
    }
  };

  const handleUpdateSavingsGoal = async (goal: SavingsGoal) => {
    const res = await apiService.updateSavingsGoal(goal);
    if (res.success) {
      await loadCoreData();
      return true;
    } else {
      showToast('Gagal', res.message || 'Gagal memperbarui target tabungan.', 'error');
      return false;
    }
  };

  const handleDeleteSavingsGoal = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus target tabungan ini?')) {
      const res = await apiService.deleteSavingsGoal(id);
      if (res.success) {
        await loadCoreData();
      } else {
        showToast('Gagal', res.message || 'Gagal menghapus target tabungan.', 'error');
      }
    }
    return true; // add return
  };

  const handleAddAsset = async (asset: Omit<Asset, 'id'>) => {
    const res = await apiService.addAsset(asset);
    if (res.success) {
      await loadCoreData();
      return true;
    } else {
      showToast('Gagal', res.message || 'Gagal menambahkan aset.', 'error');
      return false;
    }
  };

  const handleUpdateAsset = async (id: string, updates: Partial<Asset>) => {
    const res = await apiService.updateAsset(id, updates);
    if (res.success) {
      await loadCoreData();
      return true;
    } else {
      showToast('Gagal', res.message || 'Gagal memperbarui aset.', 'error');
      return false;
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus aset ini?')) {
      const res = await apiService.deleteAsset(id);
      if (res.success) {
        await loadCoreData();
      } else {
        showToast('Gagal', res.message || 'Gagal menghapus aset.', 'error');
      }
    }
    return true;
  };

  const handleResetData = async () => {
    try {
      const res = await apiService.resetDatabase();
      if (res.success) {
        await loadCoreData();
        showToast('Reset Selesai', res.message || 'Seluruh data telah diatur ulang ke angka nol.', 'success');
      } else {
        showToast('Gagal', res.message || 'Gagal mereset database.', 'error');
      }
    } catch (err: any) {
      showToast('Gagal', err.message || 'Terjadi kesalahan saat mengosongkan database.', 'error');
    }
  };

  // --- LOADING PLACEHOLDER SCREEN ---
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <RefreshCw className="w-12 h-12 text-primary animate-spin" />
        <p className="mt-4 font-bold text-slate-700 dark:text-slate-300 text-sm tracking-wide">
          Memulihkan sesi keuangan Anda...
        </p>
      </div>
    );
  }

  // --- ACCESS GUARD (Login Screen) ---
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 transition-colors flex flex-col">
        {showInstallPrompt && (
          <div className="max-w-md w-full mx-auto pt-8 px-4">
            <div className="bg-primary-light dark:bg-primary-light border border-primary dark:border-primary rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-primary-hover dark:text-primary">Install ArtaQu</h3>
                <p className="text-xs text-primary dark:text-primary mt-1">Akses lebih cepat & mudah dari layar beranda Anda.</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => setShowInstallPrompt(false)}
                  className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 cursor-pointer"
                >
                  Nanti
                </button>
                <button 
                  onClick={handleInstallClick}
                  className="flex-1 sm:flex-none px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Install
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="flex-1 flex flex-col">
          <Auth onAuthSuccess={handleAuthSuccess} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 transition-colors">
      
      {/* Universal Header (Desktop + Tablet) */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/60 sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo and Name */}
          <div className="flex items-center gap-3 flex-shrink-0 min-w-0">
            <img src="/logo.png" alt="ArtaQu Logo" className="w-10 h-10 object-contain rounded-xl shadow-sm" />
            <span className="font-extrabold text-base text-slate-900 dark:text-slate-100 tracking-tight truncate">
              ArtaQu
            </span>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mr-1 sm:mr-2 font-semibold truncate max-w-[90px] sm:max-w-[200px]">
              Halo, <b className="text-slate-900 dark:text-slate-100">{user.username}</b>
            </span>

            {/* Manual Sync Refresh */}
            <button
              onClick={handleManualRefresh}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title="Segarkan Data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            {/* Logout */}
            <button
              onClick={handleSignOut}
              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-red-950/20 rounded-xl transition cursor-pointer"
              title="Keluar Akun"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Desktop only) */}
        <div className="hidden sm:block border-t border-slate-100 dark:border-slate-800/40">
          <div className="max-w-5xl mx-auto px-4 flex gap-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <Layers className="w-4 h-4" /> },
              { id: 'transactions', label: 'Transaksi', icon: <Wallet className="w-4 h-4" /> },
              { id: 'installments', label: 'Cicilan',  icon: <CreditCard className="w-4 h-4" /> },
              { id: 'savings', label: 'Target',  icon: <Target className="w-4 h-4" /> },
              { id: 'assets', label: 'Aset Digital',  icon: <Briefcase className="w-4 h-4" /> },
              { id: 'settings',     label: 'Pengaturan', icon: <SettingsIcon className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`px-5 py-3 text-xs font-bold tracking-wide uppercase flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeView === tab.id
                    ? 'border-primary text-primary dark:text-primary'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 pb-24 sm:pb-8">
        {showInstallPrompt && (
          <div className="bg-primary-light dark:bg-primary-light border border-primary dark:border-primary rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-primary-hover dark:text-primary">Install ArtaQu</h3>
              <p className="text-xs text-primary dark:text-primary mt-1">Akses lebih cepat & mudah dari layar beranda Anda.</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={() => setShowInstallPrompt(false)}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              >
                Nanti
              </button>
              <button 
                onClick={handleInstallClick}
                className="flex-1 sm:flex-none px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-colors"
              >
                Install
              </button>
            </div>
          </div>
        )}

        {/* Render only the active screen directly for fast performance and absolute stability */}
        <div className="view-container">
          {activeView === 'dashboard' && (
            <Dashboard
              data={dashboardData}
              installments={installments}
              transactions={transactions}
              formatRupiah={formatRupiah}
              onFilterCreditor={handleFilterCreditor}
            />
          )}

          {activeView === 'transactions' && (
            <Transactions
              transactions={transactions}
              installments={installments}
              formatRupiah={formatRupiah}
              formatDate={formatDate}
              onAddTransaction={handleAddTransaction}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              showGlobalAdd={showGlobalAdd}
              onCloseGlobalAdd={() => setShowGlobalAdd(false)}
            />
          )}

          {activeView === 'installments' && (
            <Installments
              installments={installments}
              formatRupiah={formatRupiah}
              formatDate={formatDate}
              onAddInstallment={handleAddInstallment}
              onEditInstallment={handleEditInstallment}
              onDeleteInstallment={handleDeleteInstallment}
              filterCreditor={filterCreditor}
              onSetFilterCreditor={setFilterCreditor}
            />
          )}

          {activeView === 'savings' && (
            <Savings
              savingsGoals={savingsGoals}
              formatRupiah={formatRupiah}
              onAddGoal={handleAddSavingsGoal}
              onUpdateGoal={handleUpdateSavingsGoal}
              onDeleteGoal={handleDeleteSavingsGoal}
            />
          )}

          {activeView === 'assets' && (
            <Assets
              assets={assets}
              formatRupiah={formatRupiah}
              onAddAsset={handleAddAsset}
              onUpdateAsset={handleUpdateAsset}
              onDeleteAsset={handleDeleteAsset}
            />
          )}

          {activeView === 'settings' && (
            <Settings
              theme={theme}
              onSetTheme={handleSetTheme}
              accent={accent}
              onSetAccent={handleSetAccent}
              onResetData={handleResetData}
            />
          )}
        </div>
      </main>


      {/* REACT TOAST SYSTEM */}
      <div className="fixed top-4 right-4 z-[70] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`bg-white dark:bg-slate-900 border-l-4 p-4 flex gap-3 items-start min-w-[280px] max-w-sm rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 animate-fade-in pointer-events-auto ${
              t.type === 'success' ? 'border-emerald-500' : 'border-rose-500'
            }`}
          >
            <div className="text-xl shrink-0 mt-0.5">
              {t.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-500" />
              )}
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
                {t.title}
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-1 font-medium leading-relaxed">
                {t.message}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Navigation Bar */}
      <nav 
        id="mobile-bottom-nav" 
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-100 dark:border-slate-800/80 px-2 shadow-[0_-4px_15px_rgba(0,0,0,0.02)] h-[72px] pb-safe"
      >
        <div className="flex justify-between items-center h-full max-w-md mx-auto relative px-1">
          {/* Dashboard */}
          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
              activeView === 'dashboard' 
                ? 'text-[var(--primary-color)]' 
                : 'text-slate-400 dark:text-slate-500 hover:text-[var(--primary-color)]'
            }`}
          >
            <div className={`transition-all duration-300 ${activeView === 'dashboard' ? '-translate-y-1' : ''}`}>
              <Home className={`w-[24px] h-[24px] mb-1 ${activeView === 'dashboard' ? 'fill-current opacity-20' : ''}`} strokeWidth={activeView === 'dashboard' ? 2.5 : 2} />
            </div>
            <span className={`text-[9px] font-semibold transition-all duration-300 ${activeView === 'dashboard' ? 'opacity-100' : 'opacity-0 translate-y-2 absolute bottom-2'}`}>
              Beranda
            </span>
          </button>

          {/* Transactions */}
          <button
            onClick={() => setActiveView('transactions')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
              activeView === 'transactions' 
                ? 'text-[var(--primary-color)]' 
                : 'text-slate-400 dark:text-slate-500 hover:text-[var(--primary-color)]'
            }`}
          >
            <div className={`transition-all duration-300 ${activeView === 'transactions' ? '-translate-y-1' : ''}`}>
              <ArrowRightLeft className="w-[24px] h-[24px] mb-1" strokeWidth={activeView === 'transactions' ? 2.5 : 2} />
            </div>
            <span className={`text-[9px] font-semibold transition-all duration-300 ${activeView === 'transactions' ? 'opacity-100' : 'opacity-0 translate-y-2 absolute bottom-2'}`}>
              Transaksi
            </span>
          </button>

          {/* Installments */}
          <button
            onClick={() => setActiveView('installments')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
              activeView === 'installments' 
                ? 'text-[var(--primary-color)]' 
                : 'text-slate-400 dark:text-slate-500 hover:text-[var(--primary-color)]'
            }`}
          >
            <div className={`transition-all duration-300 ${activeView === 'installments' ? '-translate-y-1' : ''}`}>
              <CreditCard className={`w-[24px] h-[24px] mb-1 ${activeView === 'installments' ? 'fill-current opacity-20' : ''}`} strokeWidth={activeView === 'installments' ? 2.5 : 2} />
            </div>
            <span className={`text-[9px] font-semibold transition-all duration-300 ${activeView === 'installments' ? 'opacity-100' : 'opacity-0 translate-y-2 absolute bottom-2'}`}>
              Cicilan
            </span>
          </button>

          {/* Target */}
          <button
            onClick={() => setActiveView('savings')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
              activeView === 'savings' 
                ? 'text-[var(--primary-color)]' 
                : 'text-slate-400 dark:text-slate-500 hover:text-[var(--primary-color)]'
            }`}
          >
            <div className={`transition-all duration-300 ${activeView === 'savings' ? '-translate-y-1' : ''}`}>
              <Target className={`w-[24px] h-[24px] mb-1 ${activeView === 'savings' ? 'fill-current opacity-20' : ''}`} strokeWidth={activeView === 'savings' ? 2.5 : 2} />
            </div>
            <span className={`text-[9px] font-semibold transition-all duration-300 ${activeView === 'savings' ? 'opacity-100' : 'opacity-0 translate-y-2 absolute bottom-2'}`}>
              Target
            </span>
          </button>
          
          {/* Aset */}
          <button
            onClick={() => setActiveView('assets')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
              activeView === 'assets' 
                ? 'text-[var(--primary-color)]' 
                : 'text-slate-400 dark:text-slate-500 hover:text-[var(--primary-color)]'
            }`}
          >
            <div className={`transition-all duration-300 ${activeView === 'assets' ? '-translate-y-1' : ''}`}>
              <Briefcase className={`w-[24px] h-[24px] mb-1 ${activeView === 'assets' ? 'fill-current opacity-20' : ''}`} strokeWidth={activeView === 'assets' ? 2.5 : 2} />
            </div>
            <span className={`text-[9px] font-semibold transition-all duration-300 ${activeView === 'assets' ? 'opacity-100' : 'opacity-0 translate-y-2 absolute bottom-2'}`}>
              Aset
            </span>
          </button>

          {/* Settings */}
          <button
            onClick={() => setActiveView('settings')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
              activeView === 'settings' 
                ? 'text-[var(--primary-color)]' 
                : 'text-slate-400 dark:text-slate-500 hover:text-[var(--primary-color)]'
            }`}
          >
            <div className={`transition-all duration-300 ${activeView === 'settings' ? '-translate-y-1' : ''}`}>
              <Settings2 className={`w-[24px] h-[24px] mb-1 ${activeView === 'settings' ? 'fill-current opacity-20' : ''}`} strokeWidth={activeView === 'settings' ? 2.5 : 2} />
            </div>
            <span className={`text-[9px] font-semibold transition-all duration-300 ${activeView === 'settings' ? 'opacity-100' : 'opacity-0 translate-y-2 absolute bottom-2'}`}>
              Setelan
            </span>
          </button>
        </div>

      {/* Moved Absolute FAB on Mobile to right corner */}
      <button
        onClick={() => {
          setActiveView('transactions');
          setShowGlobalAdd(true);
        }}
        className="sm:hidden fixed bottom-[90px] right-4 bg-gradient-to-tr from-primary to-indigo-600 hover:from-primary-hover hover:to-indigo-700 text-white p-4 rounded-full shadow-lg hover:shadow-primary/40 transition-all active:scale-95 z-50 flex items-center justify-center group"
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" strokeWidth={3} />
      </button>
      </nav>
    </div>
  );
}
