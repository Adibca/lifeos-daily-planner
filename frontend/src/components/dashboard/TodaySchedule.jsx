import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  ChevronRight,
  Sparkles,
  Edit2
} from 'lucide-react';
import { useTask } from '../../context/TaskContext';

export const TodaySchedule = () => {
  const { scheduleSlots, tasks, toggleTask, setEditingSlot } = useTask();

  const getTypeBadge = (type) => {
    switch (type) {
      case 'routine':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'break':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'task':
      default:
        return 'bg-brand-500/10 text-brand-400 border-brand-500/20';
    }
  };

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-dark-850 border border-dark-700/60 shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-dark-800 text-brand-400 border border-dark-700">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Today's Schedule & Time Slots</h2>
            <p className="text-xs text-slate-400">Tap any time slot to modify or reschedule</p>
          </div>
        </div>

        <span className="text-xs px-2.5 py-1 rounded-full bg-dark-800 text-slate-300 border border-dark-700">
          {scheduleSlots.length} Blocks
        </span>
      </div>

      {/* Time slots timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-3 sm:space-y-4 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-[2px] before:bg-dark-700">
        {scheduleSlots.map((slot, idx) => {
          const linkedTask = slot.taskId ? tasks.find(t => t.id === slot.taskId) : null;
          const isDone = linkedTask ? linkedTask.completed : slot.status === 'completed';

          return (
            <div 
              key={idx}
              className={`relative group rounded-xl p-3 sm:p-4 border transition-all ${
                slot.active 
                  ? 'bg-brand-600/10 border-brand-500/50 shadow-glow-brand ring-1 ring-brand-500/30' 
                  : isDone
                  ? 'bg-dark-900/40 border-dark-700/40 opacity-75'
                  : 'bg-dark-800/60 border-dark-700/60 hover:border-slate-600'
              }`}
            >
              {/* Dot on timeline */}
              <div 
                className={`absolute -left-[30px] sm:-left-[38px] top-4 w-4 h-4 rounded-full border-2 transition flex items-center justify-center ${
                  slot.active 
                    ? 'bg-brand-500 border-brand-300 ring-4 ring-brand-500/20 animate-pulse' 
                    : isDone
                    ? 'bg-emerald-500 border-emerald-400' 
                    : 'bg-dark-850 border-dark-600'
                }`}
              >
                {isDone && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div 
                  onClick={() => setEditingSlot({ ...slot, index: idx })}
                  className="flex items-start sm:items-center space-x-3 cursor-pointer flex-1"
                >
                  <span className="text-xs font-mono font-bold text-slate-400 min-w-[65px] sm:min-w-[70px]">
                    {slot.time}
                  </span>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className={`text-xs sm:text-sm font-semibold ${
                        isDone ? 'line-through text-slate-500' : 'text-slate-100'
                      }`}>
                        {slot.label}
                      </span>
                      {slot.active && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-500 text-white animate-pulse">
                          Current
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-auto pt-1 sm:pt-0">
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${getTypeBadge(slot.type)}`}>
                    {slot.type}
                  </span>

                  {/* Edit button */}
                  <button
                    onClick={() => setEditingSlot({ ...slot, index: idx })}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-dark-700 transition"
                    title="Edit slot"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {linkedTask && (
                    <button
                      onClick={() => toggleTask(linkedTask.id)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                        isDone 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : 'bg-dark-700 border-dark-600 text-slate-300 hover:text-white hover:bg-dark-600'
                      }`}
                    >
                      {isDone ? 'Done ✓' : 'Mark Done'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
