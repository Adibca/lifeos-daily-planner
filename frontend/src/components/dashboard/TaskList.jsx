import React from 'react';
import { 
  CheckSquare, 
  Square, 
  AlertTriangle, 
  Clock, 
  Tag, 
  Trash2, 
  Calendar,
  Filter,
  Plus
} from 'lucide-react';
import { useTask } from '../../context/TaskContext';

export const TaskList = () => {
  const { 
    tasks, 
    toggleTask, 
    deleteTask, 
    taskFilter, 
    setTaskFilter, 
    searchQuery,
    setIsQuickAddOpen 
  } = useTask();

  // Filter tasks based on search & filter tabs
  const filteredTasks = tasks.filter(task => {
    // Search query match
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchCat = task.category?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }

    if (taskFilter === 'pending') return !task.completed && !task.isOverdue;
    if (taskFilter === 'completed') return task.completed;
    if (taskFilter === 'overdue') return task.isOverdue && !task.completed;
    return true; // 'all'
  });

  const overdueTasks = filteredTasks.filter(t => t.isOverdue && !t.completed);
  const upcomingTasks = filteredTasks.filter(t => !t.isOverdue || t.completed);

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'low':
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const renderTaskItem = (task) => {
    return (
      <div 
        key={task.id}
        className={`group flex items-start justify-between p-4 rounded-xl border transition-all ${
          task.completed 
            ? 'bg-dark-900/40 border-dark-750 opacity-60' 
            : task.isOverdue 
            ? 'bg-rose-950/10 border-rose-900/40 hover:border-rose-500/40' 
            : 'bg-dark-800/60 border-dark-700/60 hover:border-brand-500/40 hover:bg-dark-800'
        }`}
      >
        <div className="flex items-start space-x-3.5 flex-1 min-w-0">
          {/* Custom Checkbox */}
          <button 
            onClick={() => toggleTask(task.id)}
            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
              task.completed 
                ? 'bg-emerald-500 border-emerald-400 text-dark-900' 
                : task.isOverdue
                ? 'border-rose-500/60 hover:bg-rose-500/20'
                : 'border-slate-500/80 hover:border-brand-400 hover:bg-brand-500/10'
            }`}
            aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
          >
            {task.completed && (
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className={`text-sm font-semibold tracking-tight transition-all ${
                task.completed ? 'line-through text-slate-500' : 'text-slate-100'
              }`}>
                {task.title}
              </span>

              {/* Priority badge */}
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getPriorityStyle(task.priority)}`}>
                {task.priority}
              </span>

              {/* Category */}
              {task.category && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-dark-750 text-slate-400 border border-dark-700">
                  {task.category}
                </span>
              )}
            </div>

            {task.description && (
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Time / Date Tag */}
            <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-500">
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{task.time || task.slot}</span>
              </span>
              <span>•</span>
              <span className={task.isOverdue && !task.completed ? 'text-rose-400 font-semibold' : ''}>
                {task.date}
              </span>
            </div>
          </div>
        </div>

        {/* Delete action */}
        <button
          onClick={() => deleteTask(task.id)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-dark-700 transition ml-2 flex-shrink-0"
          title="Delete task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-dark-850 border border-dark-700/60 shadow-lg space-y-6">
      {/* Header and Filter pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-dark-800 text-brand-400 border border-dark-700">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Tasks & Priorities</h2>
            <p className="text-xs text-slate-400">Track, organize, and check off daily obligations</p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-1 p-1 bg-dark-800 rounded-xl border border-dark-700 self-start sm:self-auto overflow-x-auto max-w-full">
          {[
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Today' },
            { id: 'completed', label: 'Done' },
            { id: 'overdue', label: 'Overdue' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTaskFilter(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                taskFilter === tab.id 
                  ? 'bg-brand-500 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overdue Section (if applicable) */}
      {overdueTasks.length > 0 && taskFilter !== 'completed' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Overdue Backlog ({overdueTasks.length})</span>
            </span>
            <span className="text-[11px] text-slate-500">Requires immediate rescheduling</span>
          </div>

          <div className="space-y-2">
            {overdueTasks.map(renderTaskItem)}
          </div>
        </div>
      )}

      {/* Today / Regular Tasks Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {taskFilter === 'overdue' ? 'Overdue Tasks' : "Today's Agenda & Action Items"}
          </span>
          <button 
            onClick={() => setIsQuickAddOpen(true)}
            className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add task</span>
          </button>
        </div>

        {upcomingTasks.length === 0 && overdueTasks.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-dark-900/30 border border-dashed border-dark-700">
            <p className="text-sm text-slate-400 font-medium">No tasks found matching your filter.</p>
            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-500/20 text-brand-400 border border-brand-500/30 hover:bg-brand-500/30 transition"
            >
              Create New Task
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingTasks.map(renderTaskItem)}
          </div>
        )}
      </div>
    </div>
  );
};

