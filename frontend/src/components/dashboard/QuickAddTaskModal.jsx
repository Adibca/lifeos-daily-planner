import React, { useState } from 'react';
import { X, Plus, Calendar, Clock, Tag, Flag } from 'lucide-react';
import { useTask } from '../../context/TaskContext';

export const QuickAddTaskModal = () => {
  const { isQuickAddOpen, setIsQuickAddOpen, addTask, addHabit } = useTask();
  const [entryType, setEntryType] = useState('task'); // 'task' | 'habit'

  // Task fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Engineering');
  const [priority, setPriority] = useState('medium');
  const [time, setTime] = useState('02:00 PM');

  // Habit fields
  const [habitName, setHabitName] = useState('');
  const [habitCategory, setHabitCategory] = useState('Health');
  const [target, setTarget] = useState('30 min');
  const [timeOfDay, setTimeOfDay] = useState('Morning');

  if (!isQuickAddOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (entryType === 'task') {
      if (!title.trim()) return;
      addTask({
        title,
        description,
        category,
        priority,
        time,
        slot: time,
      });
      setTitle('');
      setDescription('');
    } else {
      if (!habitName.trim()) return;
      addHabit({
        name: habitName,
        category: habitCategory,
        target,
        timeOfDay,
      });
      setHabitName('');
    }
    setIsQuickAddOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div 
        className="w-full max-w-lg bg-dark-850 border border-dark-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-dark-700/60 flex items-center justify-between bg-dark-900/40">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base">Quick Entry</h3>
          </div>
          <button
            onClick={() => setIsQuickAddOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-dark-750 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type selector tab */}
        <div className="px-6 pt-4 flex space-x-2">
          <button
            type="button"
            onClick={() => setEntryType('task')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition ${
              entryType === 'task'
                ? 'bg-brand-500/15 border-brand-500/40 text-brand-400'
                : 'bg-dark-800 border-dark-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            Daily Action Task
          </button>
          <button
            type="button"
            onClick={() => setEntryType('habit')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition ${
              entryType === 'habit'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                : 'bg-dark-800 border-dark-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            Recurring Habit / Routine
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {entryType === 'task' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Implement Telegram webhook listener"
                  className="w-full px-3.5 py-2 text-sm bg-dark-800 border border-dark-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Description / Context
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional checklist notes, links, or criteria..."
                  className="w-full px-3.5 py-2 text-xs bg-dark-800 border border-dark-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-dark-800 border border-dark-700 rounded-xl text-slate-200 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Deep Work">Deep Work</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Health">Health</option>
                    <option value="Finance">Finance</option>
                    <option value="Personal">Personal</option>
                    <option value="Routine">Routine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-dark-800 border border-dark-700 rounded-xl text-slate-200 focus:outline-none focus:border-brand-500"
                  >
                    <option value="high">High (Urgent)</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Scheduled Time / Slot
                </label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 03:30 PM or 15:30 - 16:30"
                  className="w-full px-3.5 py-2 text-xs bg-dark-800 border border-dark-700 rounded-xl text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Habit Name *
                </label>
                <input
                  type="text"
                  required
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  placeholder="e.g. Read 20 pages of nonfiction"
                  className="w-full px-3.5 py-2 text-sm bg-dark-800 border border-dark-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={habitCategory}
                    onChange={(e) => setHabitCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-dark-800 border border-dark-700 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Health">Health</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Focus">Focus</option>
                    <option value="Mindset">Mindset</option>
                    <option value="Learning">Learning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Time of Day
                  </label>
                  <select
                    value={timeOfDay}
                    onChange={(e) => setTimeOfDay(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-dark-800 border border-dark-700 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Metric
                </label>
                <input
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="e.g. 20 pages, 45 min, 2 liters"
                  className="w-full px-3.5 py-2 text-xs bg-dark-800 border border-dark-700 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-dark-700/60">
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-brand-500 hover:bg-brand-600 text-white shadow-glow-brand transition active:scale-95"
            >
              Save {entryType === 'task' ? 'Task' : 'Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

