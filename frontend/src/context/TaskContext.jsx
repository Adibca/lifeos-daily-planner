import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { initialTasks, initialHabits, initialScheduleSlots } from '../data/initialData';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuth } from './AuthContext';
import { 
  enqueueMutation, 
  flushOfflineQueue, 
  getOfflineQueue 
} from '../services/offlineQueue';

const TaskContext = createContext();

const LOCAL_STORAGE_KEY_TASKS = 'lifeos_tasks_cache_v1';
const LOCAL_STORAGE_KEY_HABITS = 'lifeos_habits_cache_v1';
const LOCAL_STORAGE_KEY_SLOTS = 'lifeos_slots_cache_v1';

export const TaskProvider = ({ children }) => {
  const { user } = useAuth();
  
  // Initialize state with cache or initial sample data
  const [tasks, setTasks] = useState(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY_TASKS);
      return cached ? JSON.parse(cached) : initialTasks;
    } catch {
      return initialTasks;
    }
  });

  const [habits, setHabits] = useState(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY_HABITS);
      return cached ? JSON.parse(cached) : initialHabits;
    } catch {
      return initialHabits;
    }
  });

  const [scheduleSlots, setScheduleSlots] = useState(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY_SLOTS);
      return cached ? JSON.parse(cached) : initialScheduleSlots;
    } catch {
      return initialScheduleSlots;
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [taskFilter, setTaskFilter] = useState('all'); // all | pending | completed | overdue
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null); // for mobile schedule editing

  // Offline & Sync states
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(() => getOfflineQueue().length);
  const [isSyncing, setIsSyncing] = useState(false);

  // Monitor network status
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      if (isSupabaseConfigured() && user) {
        setIsSyncing(true);
        await flushOfflineQueue(supabase, user.id);
        setPendingSyncCount(getOfflineQueue().length);
        setIsSyncing(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  // Save to local cache whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_TASKS, JSON.stringify(tasks));
      localStorage.setItem(LOCAL_STORAGE_KEY_HABITS, JSON.stringify(habits));
      localStorage.setItem(LOCAL_STORAGE_KEY_SLOTS, JSON.stringify(scheduleSlots));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [tasks, habits, scheduleSlots]);

  // Haptic feedback for touch devices
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch (e) {
        // ignore
      }
    }
  };

  // Toggle task completion
  const toggleTask = async (taskId) => {
    triggerHaptic();
    let updatedTask = null;

    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const updated = !task.completed;
          updatedTask = {
            ...task,
            completed: updated,
            isOverdue: updated ? false : task.isOverdue
          };
          return updatedTask;
        }
        return task;
      })
    );

    // Sync to Supabase or queue offline
    if (updatedTask) {
      if (isOnline && isSupabaseConfigured() && supabase && user) {
        try {
          await supabase
            .from('tasks')
            .update({ completed: updatedTask.completed, is_overdue: updatedTask.isOverdue, updated_at: new Date().toISOString() })
            .eq('id', taskId);
        } catch (err) {
          enqueueMutation('TASK_TOGGLE', updatedTask);
          setPendingSyncCount(getOfflineQueue().length);
        }
      } else {
        enqueueMutation('TASK_TOGGLE', updatedTask);
        setPendingSyncCount(getOfflineQueue().length);
      }
    }
  };

  // Toggle habit for today
  const toggleHabit = async (habitId) => {
    triggerHaptic();
    let updatedHabit = null;

    setHabits(prev =>
      prev.map(habit => {
        if (habit.id === habitId) {
          const nextState = !habit.completedToday;
          const newStreak = nextState ? habit.streak + 1 : Math.max(0, habit.streak - 1);
          const newHistory = [...habit.history];
          newHistory[newHistory.length - 1] = nextState;
          updatedHabit = {
            ...habit,
            completedToday: nextState,
            streak: newStreak,
            history: newHistory,
          };
          return updatedHabit;
        }
        return habit;
      })
    );

    if (updatedHabit) {
      if (isOnline && isSupabaseConfigured() && supabase && user) {
        try {
          await supabase
            .from('habits')
            .update({ 
              completed_today: updatedHabit.completedToday, 
              streak: updatedHabit.streak, 
              history: updatedHabit.history,
              updated_at: new Date().toISOString() 
            })
            .eq('id', habitId);
        } catch (e) {
          enqueueMutation('HABIT_TOGGLE', updatedHabit);
          setPendingSyncCount(getOfflineQueue().length);
        }
      } else {
        enqueueMutation('HABIT_TOGGLE', updatedHabit);
        setPendingSyncCount(getOfflineQueue().length);
      }
    }
  };

  // Add new task
  const addTask = async (newTask) => {
    triggerHaptic();
    const task = {
      id: `t-${Date.now()}`,
      completed: false,
      isOverdue: false,
      date: 'Today',
      ...newTask,
    };
    setTasks(prev => [task, ...prev]);

    if (isOnline && isSupabaseConfigured() && supabase && user) {
      try {
        await supabase.from('tasks').insert({ ...task, user_id: user.id });
      } catch {
        enqueueMutation('TASK_CREATE', task);
        setPendingSyncCount(getOfflineQueue().length);
      }
    } else {
      enqueueMutation('TASK_CREATE', task);
      setPendingSyncCount(getOfflineQueue().length);
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    triggerHaptic();
    setTasks(prev => prev.filter(t => t.id !== taskId));

    if (isOnline && isSupabaseConfigured() && supabase && user) {
      try {
        await supabase.from('tasks').delete().eq('id', taskId);
      } catch {
        enqueueMutation('TASK_DELETE', { id: taskId });
        setPendingSyncCount(getOfflineQueue().length);
      }
    } else {
      enqueueMutation('TASK_DELETE', { id: taskId });
      setPendingSyncCount(getOfflineQueue().length);
    }
  };

  // Add new habit
  const addHabit = (newHabit) => {
    triggerHaptic();
    const habit = {
      id: `h-${Date.now()}`,
      streak: 0,
      completedToday: false,
      history: [false, false, false, false, false, false, false],
      ...newHabit,
    };
    setHabits(prev => [...prev, habit]);
  };

  // Edit / Update Schedule Slot (Mobile & Desktop)
  const updateScheduleSlot = (slotIndex, updatedData) => {
    triggerHaptic();
    setScheduleSlots(prev => {
      const next = [...prev];
      next[slotIndex] = { ...next[slotIndex], ...updatedData };
      return next;
    });

    enqueueMutation('SCHEDULE_EDIT', { ...scheduleSlots[slotIndex], ...updatedData, index: slotIndex });
    setPendingSyncCount(getOfflineQueue().length);
  };

  // Manual Trigger to sync pending changes
  const triggerSync = async () => {
    if (!isOnline) return;
    setIsSyncing(true);
    if (isSupabaseConfigured() && supabase && user) {
      await flushOfflineQueue(supabase, user.id);
    }
    setPendingSyncCount(getOfflineQueue().length);
    setTimeout(() => setIsSyncing(false), 500);
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const todayTasks = tasks.filter(t => !t.isOverdue);
    const completedTasks = todayTasks.filter(t => t.completed);
    const overdueTasks = tasks.filter(t => t.isOverdue && !t.completed);
    const progressPercent = todayTasks.length > 0 
      ? Math.round((completedTasks.length / todayTasks.length) * 100) 
      : 0;

    const habitsDoneToday = habits.filter(h => h.completedToday).length;
    const habitPercent = habits.length > 0 
      ? Math.round((habitsDoneToday / habits.length) * 100) 
      : 0;

    const topStreak = Math.max(...habits.map(h => h.streak), 0);

    return {
      totalToday: todayTasks.length,
      completedToday: completedTasks.length,
      remainingToday: todayTasks.length - completedTasks.length,
      overdueCount: overdueTasks.length,
      progressPercent,
      habitsDoneToday,
      totalHabits: habits.length,
      habitPercent,
      topStreak,
    };
  }, [tasks, habits]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        habits,
        scheduleSlots,
        activeTab,
        setActiveTab,
        taskFilter,
        setTaskFilter,
        searchQuery,
        setSearchQuery,
        isQuickAddOpen,
        setIsQuickAddOpen,
        editingSlot,
        setEditingSlot,
        toggleTask,
        toggleHabit,
        addTask,
        deleteTask,
        addHabit,
        updateScheduleSlot,
        triggerSync,
        metrics,
        isOnline,
        pendingSyncCount,
        isSyncing,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};
