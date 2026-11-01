import React from 'react';
import { 
  CheckCircle2, 
  Flame, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import { useTask } from '../../context/TaskContext';

export const ProgressSummary = () => {
  const { metrics, setActiveTab, setTaskFilter } = useTask();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Daily Progress Bar Card */}
      <div className="p-5 rounded-2xl bg-dark-850 border border-dark-700/60 shadow-lg relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Daily Progress
          </span>
          <span className="text-xs font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
            {metrics.progressPercent}%
          </span>
        </div>

        <div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {metrics.completedToday}
            </span>
            <span className="text-sm font-medium text-slate-400">
              / {metrics.totalToday} tasks
            </span>
          </div>

          {/* Linear Progress bar */}
          <div className="w-full bg-dark-700/80 rounded-full h-2.5 mt-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-brand-500 to-emerald-400 h-2.5 rounded-full transition-all duration-500 ease-out shadow-glow-emerald"
              style={{ width: `${Math.min(metrics.progressPercent, 100)}%` }}
            />
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mt-3 flex items-center">
          <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-400" />
          {metrics.remainingToday === 0 && metrics.totalToday > 0 ? (
            <span className="text-emerald-400 font-medium">All tasks finished for today! 🎉</span>
          ) : (
            <span>{metrics.remainingToday} tasks remaining today</span>
          )}
        </p>
      </div>

      {/* 2. Habit Streaks Card */}
      <div 
        onClick={() => setActiveTab('habits')}
        className="p-5 rounded-2xl bg-dark-850 border border-dark-700/60 shadow-lg flex flex-col justify-between hover:border-amber-500/40 transition cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Habit Streaks
          </span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition">
            <Flame className="w-4 h-4 fill-amber-500/30" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-amber-400 tracking-tight">
              {metrics.topStreak}
            </span>
            <span className="text-sm font-medium text-slate-400">days record 🔥</span>
          </div>
          <p className="text-xs text-slate-300 mt-1 font-medium">
            {metrics.habitsDoneToday} of {metrics.totalHabits} routines done today
          </p>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2">
          <span>{metrics.habitPercent}% daily habit adherence</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition" />
        </div>
      </div>

      {/* 3. Overdue Alert Card */}
      <div 
        onClick={() => {
          setActiveTab('tasks');
          setTaskFilter('overdue');
        }}
        className={`p-5 rounded-2xl bg-dark-850 border shadow-lg flex flex-col justify-between transition cursor-pointer group ${
          metrics.overdueCount > 0 
            ? 'border-rose-500/40 bg-rose-500/[0.03] hover:border-rose-500/60' 
            : 'border-dark-700/60 hover:border-slate-600'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Overdue Tasks
          </span>
          <div className={`p-1.5 rounded-lg border ${
            metrics.overdueCount > 0 
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse' 
              : 'bg-dark-750 text-slate-400 border-dark-700'
          }`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-3xl font-extrabold tracking-tight ${
              metrics.overdueCount > 0 ? 'text-rose-400' : 'text-slate-300'
            }`}>
              {metrics.overdueCount}
            </span>
            <span className="text-sm font-medium text-slate-400">action items</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {metrics.overdueCount > 0 
              ? 'Needs rescheduling or closure' 
              : 'No overdue items backlog'}
          </p>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2">
          <span className={metrics.overdueCount > 0 ? 'text-rose-400 font-medium' : ''}>
            {metrics.overdueCount > 0 ? 'Click to inspect backlog' : 'All caught up'}
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400 transition" />
        </div>
      </div>

      {/* 4. Telegram Notification Engine */}
      <div 
        onClick={() => setActiveTab('telegram')}
        className="p-5 rounded-2xl bg-dark-850 border border-dark-700/60 shadow-lg flex flex-col justify-between hover:border-cyan-500/40 transition cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Telegram Bot
          </span>
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white tracking-tight">Active</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Sync On
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            APScheduler periodic cron alerts enabled
          </p>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2">
          <span>Next alert: 02:00 PM</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
        </div>
      </div>
    </div>
  );
};

