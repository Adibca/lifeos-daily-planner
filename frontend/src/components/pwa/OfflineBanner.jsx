import React from 'react';
import { WifiOff, Wifi, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useTask } from '../../context/TaskContext';

export const OfflineBanner = () => {
  const { isOnline, pendingSyncCount, isSyncing, triggerSync } = useTask();

  if (isOnline && pendingSyncCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <div 
      className={`w-full py-2 px-4 text-xs font-semibold flex items-center justify-between border-b transition-colors ${
        !isOnline
          ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
          : pendingSyncCount > 0
          ? 'bg-brand-950/40 border-brand-500/30 text-brand-300'
          : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
      }`}
    >
      <div className="flex items-center space-x-2">
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" />
            <span>Offline Mode: Changes saved locally & will sync when online.</span>
          </>
        ) : isSyncing ? (
          <>
            <RefreshCw className="w-4 h-4 text-brand-400 animate-spin flex-shrink-0" />
            <span>Syncing pending changes with Supabase...</span>
          </>
        ) : (
          <>
            <Wifi className="w-4 h-4 text-brand-400 flex-shrink-0" />
            <span>{pendingSyncCount} changes saved offline waiting to sync.</span>
          </>
        )}
      </div>

      {isOnline && pendingSyncCount > 0 && (
        <button
          onClick={triggerSync}
          disabled={isSyncing}
          className="ml-2 px-2.5 py-1 rounded-lg bg-brand-500/20 hover:bg-brand-500/30 border border-brand-500/40 text-brand-300 flex items-center space-x-1 transition active:scale-95"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>Sync Now</span>
        </button>
      )}
    </div>
  );
};

