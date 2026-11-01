import React, { useState } from 'react';
import { X, Lock, Mail, User, CheckCircle2, Shield, AlertCircle, LogOut, Cloud, CloudOff, RefreshCw, Database } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTask } from '../../context/TaskContext';

export const AuthModal = () => {
  const { 
    user, 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    signInWithEmail, 
    signUpWithEmail, 
    signOut, 
    isConfigured,
    authError 
  } = useAuth();

  const { syncStatus, lastSyncTime, pendingSyncCount, triggerSync } = useTask();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        if (password.length < 6) {
          setLocalError('Password must be at least 6 characters.');
          return;
        }
        await signUpWithEmail(email, password, fullName);
        setSuccessMsg(isConfigured 
          ? '✅ Account created! Your data will sync automatically across all your devices.'
          : '✅ Profile created in local mode.');
      } else {
        await signInWithEmail(email, password);
        setSuccessMsg('✅ Signed in. Your data is now syncing across all your devices!');
      }
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setSuccessMsg('');
      }, 1500);
    } catch (err) {
      setLocalError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatLastSync = (date) => {
    if (!date) return 'Not yet synced';
    const diff = Math.round((Date.now() - date.getTime()) / 1000);
    if (diff < 10) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
    return `${Math.round(diff / 3600)}h ago`;
  };

  const getSyncStatusDisplay = () => {
    switch (syncStatus) {
      case 'syncing':
        return { icon: <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" />, text: 'Syncing...', cls: 'text-brand-400 border-brand-500/30 bg-brand-500/10' };
      case 'synced':
        return { icon: <Cloud className="w-3 h-3 mr-1.5" />, text: `Synced ${formatLastSync(lastSyncTime)}`, cls: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' };
      case 'error':
        return { icon: <AlertCircle className="w-3 h-3 mr-1.5" />, text: 'Sync Error', cls: 'text-rose-400 border-rose-500/30 bg-rose-500/10' };
      case 'offline':
        return { icon: <CloudOff className="w-3 h-3 mr-1.5" />, text: 'Offline Mode', cls: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
      default:
        return { icon: <Database className="w-3 h-3 mr-1.5" />, text: 'Local Mode', cls: 'text-slate-400 border-dark-700 bg-dark-800' };
    }
  };

  const syncDisplay = getSyncStatusDisplay();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-dark-850 border border-dark-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-dark-700/60 flex items-center justify-between bg-dark-900/40">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base">
              {user ? 'Account & Cloud Sync' : isSignUp ? 'Create LifeOS Account' : 'Sign In to LifeOS'}
            </h3>
          </div>
          <button onClick={() => setIsAuthModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-dark-750 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Supabase config & sync status */}
          <div className="flex items-center justify-between p-3 rounded-xl border bg-dark-800 border-dark-700/80">
            <span className="flex items-center text-xs">
              <span className={`w-2 h-2 rounded-full mr-2 ${isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
              <span className="text-slate-300">{isConfigured ? 'Supabase Cloud Connected' : 'Local / Demo Mode'}</span>
            </span>
            {user && (
              <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${syncDisplay.cls}`}>
                {syncDisplay.icon}
                {syncDisplay.text}
              </span>
            )}
          </div>

          {!isConfigured && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300">
              <p className="font-semibold mb-1">⚠️ Supabase Not Configured</p>
              <p>Data is currently stored only on this device. To sync across devices, add your Supabase keys to the environment variables.</p>
            </div>
          )}

          {user ? (
            <div className="space-y-4">
              {/* Account info card */}
              <div className="p-4 rounded-xl bg-dark-800 border border-dark-700/80 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-600/30 border border-brand-500/40 flex items-center justify-center font-bold text-brand-400 text-sm flex-shrink-0">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {user.user_metadata?.full_name || user.email?.split('@')[0] || 'LifeOS User'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>

                {/* Sync stats */}
                <div className="pt-2 border-t border-dark-700/60 space-y-1.5 text-[11px] text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                      Multi-device session persistence
                    </span>
                    <span className="text-emerald-400 font-semibold">Active</span>
                  </div>
                  {pendingSyncCount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-brand-400" />
                        Pending offline changes
                      </span>
                      <span className="text-brand-400 font-semibold">{pendingSyncCount} queued</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Manual sync button */}
              {pendingSyncCount > 0 && (
                <button
                  onClick={() => { triggerSync(); }}
                  className="w-full py-2 px-4 rounded-xl text-xs font-bold bg-brand-500/15 hover:bg-brand-500/25 text-brand-300 border border-brand-500/30 flex items-center justify-center space-x-2 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Push {pendingSyncCount} Offline Changes to Cloud Now</span>
                </button>
              )}

              <button
                onClick={signOut}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center space-x-2 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out & Clear Session</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Aditya Sharma"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aditya@example.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                {isSignUp && <p className="text-[10px] text-slate-500 mt-1">Minimum 6 characters required.</p>}
              </div>

              {(localError || authError) && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{localError || authError}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white shadow-glow-brand transition active:scale-95"
              >
                {isSubmitting ? 'Connecting to Supabase...' : isSignUp ? 'Create Account & Enable Cloud Sync' : 'Sign In & Sync Data'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setLocalError(''); }}
                  className="text-xs text-brand-400 hover:underline"
                >
                  {isSignUp ? 'Already have an account? Sign In' : "New to LifeOS? Sign Up"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
