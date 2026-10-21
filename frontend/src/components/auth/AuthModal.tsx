import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    authModalReason,
    closeAuthModal,
    setAuthModalMode,
    login,
    register,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [clientError, setClientError] = useState<string | null>(null);

  // Password criteria for registration
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  // Reset errors and fields on open / mode switch
  useEffect(() => {
    if (isAuthModalOpen) {
      clearError();
      setClientError(null);
    }
  }, [isAuthModalOpen, authModalMode, clearError]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    clearError();

    if (authModalMode === 'login') {
      if (!email.trim() || !password) {
        setClientError('Please enter both email and password.');
        return;
      }
      try {
        await login({ email: email.trim(), password });
      } catch {
        // Error handled in store
      }
    } else {
      const cleanName = name.trim();
      if (cleanName.length < 2) {
        setClientError('Name must be at least 2 characters long.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setClientError('Please enter a valid email address.');
        return;
      }
      if (!hasMinLength) {
        setClientError('Password must be at least 8 characters long.');
        return;
      }
      if (!hasLetter) {
        setClientError('Password must contain at least one letter.');
        return;
      }
      if (!hasNumber) {
        setClientError('Password must contain at least one number.');
        return;
      }
      if (phone.trim()) {
        const cleanDigits = phone.replace(/[\s\-()+]/g, '');
        if (!/^\d{7,15}$/.test(cleanDigits)) {
          setClientError('Please provide a valid phone number (7 to 15 digits).');
          return;
        }
      }
      try {
        await register({
          name: cleanName,
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
        });
      } catch {
        // Error handled in store
      }
    }
  };

  const handleQuickDemoLogin = async () => {
    try {
      setEmail('rahul.nair@example.com');
      setPassword('password123');
      await login({ email: 'rahul.nair@example.com', password: 'password123' });
    } catch {
      // Error handled in store
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={closeAuthModal}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header Ribbon / Glow */}
        <div className="h-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Title & Reason */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {authModalMode === 'login' ? 'Welcome Back' : 'Create an Account'}
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              {authModalMode === 'login'
                ? 'Sign in to confirm bookings, view live tickets, and sync preferences.'
                : 'Join TripPilot AI to unlock instant booking, seamless payments, and smart travel perks.'}
            </p>
          </div>

          {/* Optional Action Required Notice */}
          {authModalReason && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/60 text-amber-800 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{authModalReason}</p>
            </div>
          )}

          {/* Mode Switch Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setAuthModalMode('login')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                authModalMode === 'login'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthModalMode('register')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                authModalMode === 'register'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Quick Demo Login Preset Button */}
          {authModalMode === 'login' && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 text-indigo-900 hover:from-indigo-100 hover:to-violet-100 hover:border-indigo-200 transition-all text-left group shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Zap className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-indigo-950 flex items-center gap-1">
                      <span>One-Click Demo Login</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-indigo-200/60 text-indigo-800 rounded font-semibold">
                        Rahul Nair
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-700/80 font-mono">rahul.nair@example.com</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200" />
                <span className="shrink-0 px-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  or sign in with password
                </span>
                <div className="flex-grow border-t border-slate-200" />
              </div>
            </div>
          )}

          {/* Error Banner */}
          {(clientError || error) && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <p className="font-medium">{clientError || error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {authModalMode === 'register' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Nair"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="e.g. +91 98450 12345"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 block">Password</label>
                {authModalMode === 'login' && (
                  <span className="text-[11px] text-indigo-600 font-medium cursor-pointer hover:underline">
                    Forgot?
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={authModalMode === 'register' ? 8 : 1}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
                />
              </div>
              {authModalMode === 'register' && (
                <div className="pt-1.5 space-y-1">
                  <div className="flex items-center gap-3 text-[11px] font-medium flex-wrap">
                    <span
                      className={`flex items-center gap-1 transition-colors ${
                        hasMinLength ? 'text-emerald-600 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${hasMinLength ? 'text-emerald-500' : 'text-slate-300'}`}
                      />
                      8+ characters
                    </span>
                    <span
                      className={`flex items-center gap-1 transition-colors ${
                        hasLetter && hasNumber ? 'text-emerald-600 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          hasLetter && hasNumber ? 'text-emerald-500' : 'text-slate-300'
                        }`}
                      />
                      Letters & numbers
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-800 text-white shadow-md shadow-indigo-950/20 hover:shadow-indigo-950/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-200" />
                  <span>Processing...</span>
                </>
              ) : authModalMode === 'login' ? (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-violet-300" />
                  <span>Create Account & Continue</span>
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="text-[11px] text-center text-slate-400">
            By signing in, you agree to TripPilot&apos;s Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};
