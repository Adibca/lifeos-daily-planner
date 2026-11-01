import React, { useState } from 'react';
import { 
  Download, 
  Bell, 
  BellRing, 
  User, 
  Activity, 
  WifiOff, 
  Send,
  Sparkles,
  Cloud,
  CloudOff,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useTask } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { 
  requestNotificationPermission, 
  sendLocalNotification, 
  getNotificationPermission 
} from '../../services/notifications';

// Sync status badge for mobile header
const SyncBadge = ({ syncStatus }) => {
  if (syncStatus === 'syncing') {
    return (
      <span className="flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
        <RefreshCw className="w-2.5 h-2.5 mr-0.5 animate-spin" />
        Sync
      </span>
    );
  }
  if (syncStatus === 'error') {
    return (
      <span className="flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
        <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
        Error
      </span>
    );
  }
  if (syncStatus === 'offline') {
    return (
      <span className="flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
        <WifiOff className="w-2.5 h-2.5 mr-0.5" />
        Offline
      </span>
    );
  }
  if (syncStatus === 'synced') {
    return (
      <span className="flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
        <Cloud className="w-2.5 h-2.5 mr-0.5" />
        Synced
      </span>
    );
  }
  return null; // loading state — no badge
};

export const MobileHeader = ({ onOpenInstall, onOpenAuth }) => {
  const { isOnline, syncStatus, setActiveTab } = useTask();
  const { user } = useAuth();
  const [notificationActive, setNotificationActive] = useState(
    () => getNotificationPermission() === 'granted'
  );

  const handleToggleNotifications = async () => {
    const res = await requestNotificationPermission();
    if (res.granted) {
      setNotificationActive(true);
      sendLocalNotification(
        'LifeOS Alerts Enabled',
        'You will now receive timely push alerts for your daily schedule and habits.'
      );
    } else {
      alert('Notification permissions are required to enable instant schedule alerts.');
    }
  };

  return (
    <header className="lg:hidden sticky top-0 z-30 bg-dark-900/90 backdrop-blur-md border-b border-dark-700/60 px-4 py-3 flex items-center justify-between safe-top">
      {/* Brand & Network Indicator */}
      <div className="flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-700 flex items-center justify-center shadow-glow-brand">
          <Activity className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold text-base text-white tracking-tight">LifeOS</span>
            <SyncBadge syncStatus={syncStatus} />
          </div>
          <p className="text-[10px] text-slate-400">PWA Mobile Suite</p>
        </div>
      </div>

      {/* Action shortcuts */}
      <div className="flex items-center space-x-1.5">
        {/* Ask AI shortcut */}
        <button
          onClick={() => setActiveTab('ai')}
          className="p-2 rounded-xl bg-dark-800 text-indigo-400 border border-dark-700"
          title="AI Assistant"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Telegram Shortcut */}
        <button
          onClick={() => setActiveTab('telegram')}
          className="p-2 rounded-xl bg-dark-800 text-cyan-400 border border-dark-700"
          title="Telegram Bot Sync"
        >
          <Send className="w-4 h-4" />
        </button>

        {/* Push Notification Toggle */}
        <button
          onClick={handleToggleNotifications}
          className={`p-2 rounded-xl border transition ${
            notificationActive 
              ? 'bg-brand-500/10 text-brand-400 border-brand-500/30' 
              : 'bg-dark-800 text-slate-400 border-dark-700'
          }`}
          title="Enable Push Notifications"
        >
          {notificationActive ? (
            <BellRing className="w-4 h-4 text-brand-400" />
          ) : (
            <Bell className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Install App Button */}
        <button
          onClick={onOpenInstall}
          className="px-2.5 py-1.5 rounded-xl bg-brand-500/20 text-brand-300 border border-brand-500/40 text-[11px] font-bold flex items-center space-x-1 active:scale-95 transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>App</span>
        </button>

        {/* Profile Avatar */}
        <button
          onClick={onOpenAuth}
          className="w-8 h-8 rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-center font-bold text-xs text-brand-400"
          title="Account & Sync"
        >
          {user?.email ? user.email.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};

