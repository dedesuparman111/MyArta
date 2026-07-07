import React, { useState } from 'react';
import { AppUser } from '../types';
import { apiService } from '../lib/supabase';
import { ArrowRight, User, KeyRound, Mail, Eye, EyeOff, ShieldAlert, MailCheck } from 'lucide-react';

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
          <div className="mb-5 p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm font-medium border border-emerald-200 dark:border-emerald-800 flex items-start gap-3 shadow-sm animate-fade-in">
            <MailCheck className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold mb-1">{infoMessage.includes('Cek email') ? 'Periksa Kotak Masuk Anda' : 'Berhasil'}</h3>
              <p className="text-emerald-600 dark:text-emerald-400 text-xs leading-relaxed">{infoMessage}</p>
            </div>
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

        {/* Divider */}
        {!isForgotPassword && (
          <div className="relative mt-6 flex items-center justify-center">
            <div className="absolute border-t border-slate-200 dark:border-slate-800 w-full"></div>
            <span className="bg-white dark:bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-400 relative z-10">atau lanjutkan dengan</span>
          </div>
        )}

        {/* Google Auth Button */}
        {!isForgotPassword && (
          <button
            type="button"
            onClick={async () => {
              setError(null);
              setInfoMessage(null);
              const res = await apiService.signInWithGoogle();
              if (!res.success) {
                setError(res.message);
              }
            }}
            className="w-full mt-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-xl transition-all duration-300 flex justify-center items-center gap-3 shadow-sm hover:shadow-md cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M1 1h22v22H1z" fill="none"/>
            </svg>
            <span>Google</span>
          </button>
        )}

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
