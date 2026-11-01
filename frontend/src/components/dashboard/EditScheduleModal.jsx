import React, { useState, useEffect } from 'react';
import { X, Clock, Edit3, Check } from 'lucide-react';
import { useTask } from '../../context/TaskContext';

export const EditScheduleModal = () => {
  const { editingSlot, setEditingSlot, updateScheduleSlot } = useTask();

  const [label, setLabel] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('task');
  const [status, setStatus] = useState('upcoming');

  useEffect(() => {
    if (editingSlot) {
      setLabel(editingSlot.label || '');
      setTime(editingSlot.time || '');
      setType(editingSlot.type || 'task');
      setStatus(editingSlot.status || 'upcoming');
    }
  }, [editingSlot]);

  if (!editingSlot) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!label.trim()) return;

    updateScheduleSlot(editingSlot.index, {
      label,
      time,
      type,
      status,
      active: status === 'active',
    });
    setEditingSlot(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-dark-850 border border-dark-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-dark-700/60 flex items-center justify-between bg-dark-900/40">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base">Edit Schedule Slot</h3>
          </div>
          <button
            onClick={() => setEditingSlot(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-dark-750 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Activity / Slot Title *
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Time Block
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="02:00 PM"
                className="w-full px-3 py-2 text-xs bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Slot Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-dark-800 border border-dark-700 rounded-xl text-white focus:outline-none focus:border-brand-500"
              >
                <option value="task">Focus Task</option>
                <option value="routine">Routine</option>
                <option value="break">Break / Meals</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Current Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'upcoming', label: 'Upcoming' },
                { id: 'active', label: 'Active Now' },
                { id: 'completed', label: 'Completed' },
              ].map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStatus(s.id)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition ${
                    status === s.id
                      ? 'bg-brand-500/20 border-brand-500/50 text-brand-300'
                      : 'bg-dark-800 border-dark-700 text-slate-400'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-dark-700/60">
            <button
              type="button"
              onClick={() => setEditingSlot(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-brand-500 hover:bg-brand-600 text-white shadow-glow-brand transition active:scale-95"
            >
              Save Slot Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

