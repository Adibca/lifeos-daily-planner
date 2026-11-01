import React from 'react';
import { 
  Flame, 
  Check, 
  Plus, 
  RotateCcw, 
  Award,
  Zap
} from 'lucide-react';
import { useTask } from '../../context/TaskContext';

export const HabitTracker = () => {
  const { habits, toggleHabit, metrics } = useTask();
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-dark-850 border border-dark-700/60 shadow-lg space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-dark-800 text-amber-400 border border-dark-700">
            <Flame className="w-4 h-4 fill-amber-500/20" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Recurring Routines & Habit Streaks</h2>
            <p className="text-xs text-slate-400">Consistency compounds over time. Keep the flame alive.</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="hidden sm:inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
            <Award className="w-3.5 h-3.5" />
            <span>Best: {metrics.topStreak} Days</span>
          </span>
        </div>
      </div>

      {/* Habit items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {habits.map((habit) => (
          <div 
            key={habit.id}
            className={`p-4 rounded-xl border transition-all ${
              habit.completedToday 
                ? 'bg-amber-950/10 border-amber-500/30 shadow-sm' 
                : 'bg-dark-800/60 border-dark-700/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-white">{habit.name}</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-dark-750 text-slate-400 border border-dark-700">
                    {habit.category}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Target: {habit.target} • {habit.timeOfDay}
                  </span>
                </div>
              </div>

              {/* Streak pill */}
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-dark-800 border border-amber-500/30 text-amber-400 text-xs font-bold shadow-inner">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{habit.streak}d</span>
              </div>
            </div>

            {/* 7-day tracker & action */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-dark-700/60">
              {/* Day history dots */}
              <div className="flex items-center space-x-1.5">
                {habit.history.map((done, idx) => (
                  <div key={idx} className="flex flex-col items-center space-y-1">
                    <span className="text-[9px] font-bold text-slate-500">{daysOfWeek[idx]}</span>
                    <div 
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] transition ${
                        done 
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold' 
                          : 'bg-dark-750 text-slate-600 border border-dark-700'
                      }`}
                    >
                      {done ? '✓' : ''}
                    </div>
                  </div>
                ))}
              </div>

              {/* Check today button */}
              <button
                onClick={() => toggleHabit(habit.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 ${
                  habit.completedToday
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-dark-700 text-slate-200 border border-dark-600 hover:bg-dark-600'
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${habit.completedToday ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{habit.completedToday ? 'Completed' : 'Check In'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

