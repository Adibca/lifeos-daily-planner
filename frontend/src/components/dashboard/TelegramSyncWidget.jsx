import React, { useState } from 'react';
import { Send, CheckCircle2, Bell, Smartphone, RefreshCw, Key } from 'lucide-react';
import { useTask } from '../../context/TaskContext';

export const TelegramSyncWidget = () => {
  const { metrics, tasks } = useTask();
  const [testSent, setTestSent] = useState(false);

  const telegramCommands = [
    { cmd: '/today', desc: "Fetch today's schedule, pending tasks and overdue count" },
    { cmd: '/add [task]', desc: 'Natural language task creation parsed by OpenAI' },
    { cmd: '/done [id]', desc: 'Check off a task directly from Telegram chat' },
    { cmd: '/habits', desc: 'Display daily streak status and toggle routines' },
    { cmd: '/remind', desc: 'Configure scheduled reminder frequency (APScheduler)' },
  ];

  const handleSendTestAlert = () => {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3500);
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-dark-850 border border-dark-700/60 shadow-lg space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Telegram Bot & APScheduler Engine</h2>
            <p className="text-xs text-slate-400">Two-way synchronization between your mobile chat and LifeOS dashboard</p>
          </div>
        </div>

        <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
          @LifeOSPlannerBot
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Commands Guide */}
        <div className="p-4 rounded-xl bg-dark-800/60 border border-dark-700 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Supported Bot Commands
          </h4>
          <div className="space-y-2">
            {telegramCommands.map((c, i) => (
              <div key={i} className="flex items-start justify-between text-xs">
                <code className="text-cyan-400 bg-dark-900 px-2 py-0.5 rounded font-mono font-bold">
                  {c.cmd}
                </code>
                <span className="text-slate-400 text-right ml-2">{c.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Telegram Chat Simulation */}
        <div className="p-4 rounded-xl bg-dark-900/60 border border-dark-750 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-dark-700">
              <span className="flex items-center space-x-1.5 text-cyan-400 font-semibold">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Simulated Telegram Notification</span>
              </span>
              <span className="text-[10px]">Just Now</span>
            </div>

            <div className="mt-3 p-3 rounded-lg bg-dark-800 border border-dark-700/80 text-xs space-y-1.5 font-sans">
              <p className="font-bold text-slate-200">🔔 LifeOS Reminder: 02:00 PM Slot</p>
              <p className="text-slate-400">Time for: <strong className="text-white">Design Telegram Bot notification payload</strong></p>
              <p className="text-[11px] text-slate-500 pt-1">
                Progress: {metrics.completedToday}/{metrics.totalToday} completed • Overdue: {metrics.overdueCount}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSendTestAlert}
              disabled={testSent}
              className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 transition flex items-center justify-center space-x-1.5"
            >
              {testSent ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Test Notification Dispatched!</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5" />
                  <span>Simulate Triggering Push Notification</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

