import React from 'react';
import { 
  LayoutDashboard, 
  CalendarClock, 
  CheckSquare, 
  Flame, 
  Send, 
  Sparkles, 
  Settings, 
  Layers,
  Activity,
  Bot
} from 'lucide-react';
import { useTask } from '../../context/TaskContext';

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const { activeTab, setActiveTab, metrics } = useTask();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'schedule', label: "Today's Schedule", icon: CalendarClock, badge: 'Active' },
    { 
      id: 'tasks', 
      label: 'Tasks & Backlog', 
      icon: CheckSquare, 
      badge: metrics.overdueCount > 0 ? `${metrics.overdueCount} overdue` : null,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
    },
    { id: 'habits', label: 'Habits & Streaks', icon: Flame, badge: `${metrics.topStreak}d 🔥` },
    { id: 'telegram', label: 'Telegram Bot Sync', icon: Send, badge: 'Live' },
    { id: 'ai', label: 'AI Daily Assistant', icon: Sparkles, badge: 'GPT-4o' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-dark-850 border-r border-dark-700/60 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-dark-700/60 bg-dark-900/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-700 flex items-center justify-center shadow-glow-brand">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-white tracking-tight">LifeOS</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Daily Productivity Suite</p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-500">
            Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-brand-600/15 text-white border border-brand-500/30 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    item.badgeColor || 'bg-dark-700 text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-6 px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-500">
            System Integrations
          </div>

          <div className="px-3 py-3 rounded-xl bg-dark-800/80 border border-dark-700/60 space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-2 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>FastAPI + SQLite</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">Ready</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-2 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>Telegram Bot</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-medium">Polling</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-2 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                <span>OpenAI Engine</span>
              </span>
              <span className="text-[10px] text-indigo-400 font-medium">GPT-4o</span>
            </div>
          </div>
        </div>

        {/* Footer profile & quick stats */}
        <div className="p-4 border-t border-dark-700/60 bg-dark-900/40">
          <div className="flex items-center justify-between p-2 rounded-xl bg-dark-800/60 border border-dark-750">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-dark-700 border border-dark-600 flex items-center justify-center font-bold text-xs text-brand-400">
                AD
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">Aditya (Personal)</p>
                <p className="text-[10px] text-emerald-400">● {metrics.progressPercent}% Target Hit</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('ai')}
              title="Open AI Prompt"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-dark-700 transition"
            >
              <Bot className="w-4 h-4 text-brand-400" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

