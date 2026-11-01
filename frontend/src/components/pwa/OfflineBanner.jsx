import React from 'react';
import { WifiOff, Wifi, RefreshCw, CheckCircle2, AlertCircle, Cloud, CloudOff } from 'lucide-react';
import { useTask } from '../../context/TaskContext';

export const OfflineBanner = () => {
  const { isOnline, pendingSyncCount, syncStatus, syncError, triggerSync } = useTask();

  // If everything is online, synced, and no pending changes or errors, hide the banner
  if (isOnline && pendingSyncCount === 0 && (syncStatus === 'synced' || !syncStatus)) {
    return null;
  }

  return (
    <div 
      className={`w-full py-2 px-4 text-xs font-semibold flex items-center justify-between border-b transition-colors ${
        !isOnline
          ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
          : syncStatus === 'error'
          ? 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          : syncStatus === 'syncing' || pendingSyncCount > 0
          ? 'bg-brand-950/40 border-brand-500/30 text-brand-300'
          : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
      }`}
    >
      <div className="flex items-center space-x-2">
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" />
            <span>Offline Mode: Changes saved safely in IndexedDB and will auto-sync on reconnect.</span>
          </>
        ) : syncStatus === 'error' ? (
          <>
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>Sync Alert: {syncError || 'Unable to reach Supabase. Changes queued in local storage.'}</span>
          </>
        ) : syncStatus === 'syncing' ? (
          <>
            <RefreshCw className="w-4 h-4 text-brand-400 animate-spin flex-shrink-0" />
            <span>Syncing tasks & habits with Supabase across your devices...</span>
          </>
        ) : pendingSyncCount > 0 ? (
          <>
            <Cloud className="w-4 h-4 text-brand-400 flex-shrink-0" />
            <span>{pendingSyncCount} changes saved locally, ready to sync with cloud.</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>All tasks & schedules synchronized with Supabase!</span>
          </>
        )}
      </div>

      {isOnline && (pendingSyncCount > 0 || syncStatus === 'error') && (
        <button
          onClick={triggerSync}
          disabled={syncStatus === 'syncing'}
          className="ml-2 px-2.5 py-1 rounded-lg bg-brand-500/20 hover:bg-brand-500/30 border border-brand-500/40 text-brand-300 flex items-center space-x-1 transition active:scale-95"
        >
          <RefreshCw className={`w-3 h-3 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
          <span>Sync Now</span>
        </button>
      )}
    </div>
  );
};
