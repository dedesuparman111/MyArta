/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings as SettingsIcon, Sun, Moon, Palette, Database, Trash2, ShieldCheck, HelpCircle, Terminal } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface SettingsProps {
  theme: 'light' | 'dark';
  onSetTheme: (theme: 'light' | 'dark') => void;
  accent: string;
  onSetAccent: (accent: string) => void;
  onResetData: () => Promise<void>;
}

export const Settings: React.FC<SettingsProps> = ({
  theme,
  onSetTheme,
  accent,
  onSetAccent,
  onResetData,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const colors = [
    { name: 'blue', value: '#2563eb', label: 'Classic Blue' },
    { name: 'orange', value: '#f97316', label: 'Neon Orange' },
    { name: 'green', value: '#10b981', label: 'Emerald Green' },
    { name: 'purple', value: '#8b5cf6', label: 'Royal Purple' },
    { name: 'red', value: '#ef4444', label: 'Crimson Red' },
  ];

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '399339') {
      setPinError(false);
      await onResetData();
      setResetSuccess(true);
      setPinInput('');
      setShowResetConfirm(false);
      setTimeout(() => setResetSuccess(false), 4000);
    } else {
      setPinError(true);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      {/* Settings Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-slate-500" />
          <span>Pengaturan</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Atur tampilan dan kelola data akun Anda</p>
      </div>

      {/* Theme Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 p-6 rounded-2xl shadow-sm">
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-500" />
          <span>Tema Aplikasi</span>
        </h3>
        <div className="flex gap-4">
          <button
            onClick={() => onSetTheme('light')}
            className={`flex-1 py-3 px-4 rounded-xl border font-bold flex justify-center items-center gap-2 transition-all cursor-pointer ${
              theme === 'light'
                ? 'border-primary bg-primary-light/40 text-primary dark:text-primary'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Terang</span>
          </button>
          <button
            onClick={() => onSetTheme('dark')}
            className={`flex-1 py-3 px-4 rounded-xl border font-bold flex justify-center items-center gap-2 transition-all cursor-pointer ${
              theme === 'dark'
                ? 'border-primary bg-primary-light text-primary dark:text-primary'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Moon className="w-4 h-4 text-indigo-500" />
            <span>Gelap</span>
          </button>
        </div>
      </div>

      {/* Accent Colors Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 p-6 rounded-2xl shadow-sm">
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4 text-indigo-500" />
          <span>Warna Aksen</span>
        </h3>
        <div className="flex flex-wrap gap-4 items-center">
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() => onSetAccent(color.name)}
              style={{ backgroundColor: color.value }}
              className={`w-11 h-11 rounded-full cursor-pointer transition-all duration-300 relative hover:scale-110 shadow flex items-center justify-center border-4 ${
                accent === color.name
                  ? 'border-slate-900 dark:border-white scale-105'
                  : 'border-transparent'
              }`}
              title={color.label}
            >
              {accent === color.name && (
                <div className="w-2.5 h-2.5 rounded-full bg-white dark:bg-slate-900" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Danger Zone / Reset Database */}
      <div className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-red-950/30 p-6 rounded-2xl shadow-sm">
        <h3 className="font-bold text-sm text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          <span>Zona Bahaya</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed font-medium">
          Tindakan di bawah ini akan menghapus seluruh database Anda. Semua data transaksi dan data cicilan akan diatur ulang secara permanen.
        </p>

        {resetSuccess && (
          <div className="mb-4 p-3 rounded-xl border border-emerald-100 bg-emerald-50 dark:bg-emerald-950/10 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            ✓ Seluruh data berhasil diatur ulang ke angka nol!
          </div>
        )}

        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 rounded-xl font-bold text-xs transition cursor-pointer"
          >
            Hapus Semua Data
          </button>
        ) : (
          <form onSubmit={handleVerifyAndReset} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
            <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-normal">
              ⚠️ Konfirmasi Hapus Data: Silakan masukkan PIN Keamanan Anda untuk melanjutkan.
            </p>
            
            <div className="max-w-xs">
              <input
                type="password"
                required
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="PIN 6-Digit"
                className="w-full text-center tracking-widest text-lg font-extrabold p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 dark:text-slate-100 outline-none focus:border-red-500"
              />
              {pinError && (
                <p className="text-[10px] text-red-500 font-semibold mt-1">
                  ❌ PIN salah! Silakan periksa PIN legacy Anda (Bantuan: 399339).
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Ya, Reset Sekarang
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(false);
                  setPinInput('');
                  setPinError(false);
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
