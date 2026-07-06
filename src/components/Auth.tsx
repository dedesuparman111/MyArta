import React, { useState } from 'react';
import { AppUser } from '../types';
import { apiService } from '../lib/supabase';
import { ArrowRight, User, KeyRound, Mail, Eye, EyeOff, ShieldAlert } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (user: AppUser) => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      if (isForgotPassword) {
        if (!email) {
          setError('Email wajib diisi.');
          setIsLoading(false);
          return;
        }
        const res = await apiService.resetPassword(email);
        if (res.success) {
          setInfoMessage(res.message);
          setIsForgotPassword(false);
        } else {
          setError(res.message);
        }
      } else if (isSignUp) {
        if (!email.includes('@')) {
          setError('Harap masukkan alamat email yang valid.');
          setIsLoading(false);
          return;
        }
        const res = await apiService.signUp(username, email, password);
        if (res.success && res.user) {
          if (res.message.includes('Cek email')) {
            setInfoMessage(res.message);
            setIsSignUp(false); // Switch to login waiting for confirmation
          } else {
            onAuthSuccess(res.user);
          }
        } else {
          setError(res.message);
        }
      } else {
        const res = await apiService.signIn(email, password);
        if (res.success && res.user) {
          onAuthSuccess(res.user);
        } else {
          setError(res.message);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-3xl shadow-2xl p-8 relative overflow-hidden transition-all duration-300">
        
        {/* Glow ambient background details */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4">
            <img src="/logo.png" alt="ArtaQu Logo" className="w-full h-full object-contain rounded-2xl shadow-sm" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            ArtaQu Financials
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
            Kelola dan sinkronisasikan catatan keuangan Anda dengan aman.
          </p>
        </div>

        {/* Info or Error Banners */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 dark:bg-red-950/20 text-rose-600 dark:text-red-400 rounded-xl text-xs font-bold border border-rose-100 dark:border-red-900/30 flex items-start gap-2 animate-pulse">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {infoMessage && (
          <div className="mb-5 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold border border-emerald-100 dark:border-emerald-900/30">
            {infoMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contoh: nama@email.com"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm dark:bg-slate-950 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Username (Sign Up only) */}
          {isSignUp && !isForgotPassword && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                Nama Pengguna
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="contoh: Dede Suparman"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm dark:bg-slate-950 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          )}

          {/* Password */}
          {!isForgotPassword && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide flex justify-between">
                <span>Password</span>
                {(!isSignUp) && (
                  <button type="button" onClick={() => { setIsForgotPassword(true); setError(null); setInfoMessage(null); }} className="text-primary hover:underline text-[10px] capitalize">Lupa Password?</button>
                )}
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignUp ? 'Min. 6 Karakter' : 'contoh: rahasia123'}
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-sm dark:bg-slate-950 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-hover hover:to-indigo-700 text-white font-bold py-3 rounded-xl transition-all duration-300 flex justify-center items-center gap-2 mt-6 shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            <span>
              {isLoading ? 'Memproses...' 
               : isForgotPassword ? 'Kirim Link Reset Password'
               : isSignUp ? 'Daftar Akun Baru' 
               : 'Masuk ke Aplikasi'}
            </span>
            {!isLoading && <ArrowRight className="w-4.5 h-4.5" />}
          </button>
        </form>

        {/* Toggles */}
        <div className="mt-6 text-center text-xs flex flex-col gap-2">
            {isForgotPassword ? (
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setError(null);
                  setInfoMessage(null);
                }}
                className="text-primary dark:text-primary font-bold hover:underline cursor-pointer"
              >
                Kembali ke halaman Masuk
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setInfoMessage(null);
                }}
                className="text-primary dark:text-primary font-bold hover:underline cursor-pointer"
              >
                {isSignUp ? 'Sudah memiliki akun? Masuk' : 'Belum memiliki akun? Daftar Baru'}
              </button>
            )}
        </div>

      </div>
    </div>
  );
};
