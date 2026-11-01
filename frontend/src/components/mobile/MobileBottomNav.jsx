import React from 'react';
import { 
  LayoutDashboard, 
  CalendarClock, 
  Plus, 
  CheckSquare, 
  Flame 
} from 'lucide-react';
import { useTask } from '../../context/TaskContext';

export const MobileBottomNav = () => {
  const { activeTab, setActiveTab, setIsQuickAddOpen, metrics } = useTask();

  const navTabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'schedule', label: 'Schedule', icon: CalendarClock },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: metrics.overdueCount > 0 ? metrics.overdueCount : null },
    { id: 'habits', label: 'Habits', icon: Flame, badge: `${metrics.topStreak}d` },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-dark-900/95 backdrop-blur-lg border-t border-dark-700/70 safe-bottom">
      <div className="flex items-center justify-around h-16 px-2 relative max-w-lg mx-auto">
        {/* Tab 1: Home */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === 'dashboard' ? 'text-brand-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Home</span>
        </button>

        {/* Tab 2: Schedule */}
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === 'schedule' ? 'text-brand-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CalendarClock className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Schedule</span>
        </button>

        {/* Center Floating Action Button (FAB) */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-glow-brand ring-4 ring-dark-900 active:scale-95 transition"
            aria-label="Add Task or Habit"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Tab 3: Tasks */}
        <button
          onClick={() => setActiveTab('tasks')}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === 'tasks' ? 'text-brand-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <CheckSquare className="w-5 h-5 mb-0.5" />
            {metrics.overdueCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-500 text-white animate-pulse">
                {metrics.overdueCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Tasks</span>
        </button>

        {/* Tab 4: Habits */}
        <button
          onClick={() => setActiveTab('habits')}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === 'habits' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Flame className="w-5 h-5 mb-0.5" />
          </div>
          <span className="text-[10px]">Habits</span>
        </button>
      </div>
    </nav>
  );
};

