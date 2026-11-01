import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  Plus, 
  Bell, 
  BellRing,
  Calendar as CalendarIcon, 
  Sparkles,
  CheckCircle2,
  Download,
  User,
  Cloud,
  CloudCheck,
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

export const Header = ({ onToggleSidebar, onOpenInstall, onOpenAuth }) => {
  const { 
    searchQuery, 
    setSearchQuery, 
    setIsQuickAddOpen, 
    metrics, 
    setActiveTab,
    isOnline,
    syncStatus,
    triggerSync
  } = useTask();

  const { user, isConfigured } = useAuth();

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
    }
  };

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  const renderSyncBadge = () => {
    if (!isOnline || syncStatus === 'offline') {
      return (
        <span 
          onClick={triggerSync}
          className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-pointer"
          title="Offline mode - changes stored locally"
        >
          <CloudOff className="w-3 h-3 mr-1" />
          Offline
        </span>
      );
    }

    if (syncStatus === 'syncing') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20">
          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
          Syncing...
        </span>
      );
    }

    if (syncStatus === 'error') {
      return (
        <span 
          onClick={triggerSync}
          className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 cursor-pointer"
          title="Click to retry cloud sync"
        >
          <AlertTriangle className="w-3 h-3 mr-1" />
          Sync Error
        </span>
      );
    }

    return (
      <span 
        onClick={triggerSync}
        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-pointer"
        title="Realtime Supabase Cloud Sync Active"
      >
        <Cloud className="w-3 h-3 mr-1 text-emerald-400" />
        Cloud Synced
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-30 h-20 bg-dark-900/80 backdrop-blur-md border-b border-dark-700/60 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile Toggle & Page Info */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl bg-dark-800 text-slate-300 hover:text-white hover:bg-dark-700 transition"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-dark-800 border border-dark-700/60 hidden sm:flex items-center justify-center text-slate-400">
            <CalendarIcon className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">Daily Command Center</h1>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {metrics.completedToday}/{metrics.totalToday} Complete
              </span>
              {renderSyncBadge()}
            </div>
            <p className="text-xs text-slate-400">{todayFormatted} • Multi-Device Realtime Sync</p>
          </div>
        </div>
      </div>

      {/* Middle/Right: Search, Notification, Install, Auth & New Task */}
      <div className="flex items-center space-x-2.5 sm:space-x-3.5">
        {/* Search */}
        <div className="relative hidden md:block w-44 lg:w-56">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, routines..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-dark-800/90 border border-dark-700/80 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
          />
        </div>

        {/* AI Plan shortcut */}
        <button
          onClick={() => setActiveTab('ai')}
          className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/25 transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden lg:inline">Ask AI</span>
        </button>

        {/* Push Notification Toggle */}
        <button
          onClick={handleToggleNotifications}
          className={`p-2 rounded-xl border transition ${
            notificationActive 
              ? 'bg-brand-500/10 text-brand-400 border-brand-500/30' 
              : 'bg-dark-800 text-slate-400 border-dark-700'
          }`}
          title={notificationActive ? "Notifications Active" : "Enable Push Notifications"}
        >
          {notificationActive ? (
            <BellRing className="w-4 h-4 text-brand-400" />
          ) : (
            <Bell className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* PWA Install Trigger */}
        <button
          onClick={onOpenInstall}
          className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-dark-800 border border-dark-700 text-slate-300 hover:text-white hover:bg-dark-750 transition"
          title="Install as Progressive Web App"
        >
          <Download className="w-3.5 h-3.5 text-brand-400" />
          <span>Install PWA</span>
        </button>

        {/* Auth / Account Profile */}
        <button
          onClick={onOpenAuth}
          className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-dark-800 border border-dark-700 text-xs font-medium text-slate-300 hover:text-white flex items-center space-x-2 transition"
          title="Supabase Cloud Account & Sync"
        >
          <div className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xs">
            {user?.email ? user.email.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
          </div>
          <span className="hidden md:inline text-xs">
            {user?.email ? user.email.split('@')[0] : 'Sign In'}
          </span>
        </button>

        {/* Quick Add Button */}
        <button
          onClick={() => setIsQuickAddOpen(true)}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-glow-brand transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Task</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
    </header>
  );
};
