import React, { createContext, useContext, useState, useMemo, useEffect, useRef } from 'react';
import { initialTasks, initialHabits, initialScheduleSlots } from '../data/initialData';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuth } from './AuthContext';
import { 
  enqueueMutation, 
  flushOfflineQueue, 
  getOfflineQueue 
} from '../services/offlineQueue';
import { 
  idbGetAll, 
  idbSetAll, 
  idbPut, 
  idbDelete, 
  STORES 
} from '../services/indexedDb';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { user } = useAuth();

  // Core state
  const [tasks, setTasks] = useState(initialTasks);
  const [habits, setHabits] = useState(initialHabits);
  const [scheduleSlots, setScheduleSlots] = useState(initialScheduleSlots);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [taskFilter, setTaskFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);

  // Sync state indicators: 'loading' | 'syncing' | 'synced' | 'offline' | 'error'
  const [syncStatus, setSyncStatus] = useState('loading');
  const [syncError, setSyncError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  const initialLoadDone = useRef(false);

  // 1. Initial Load: Load local cached data from IndexedDB immediately for instant render
  useEffect(() => {
    const loadCachedLocalData = async () => {
      try {
        const [cachedTasks, cachedHabits, cachedSlots, queue] = await Promise.all([
          idbGetAll(STORES.TASKS),
          idbGetAll(STORES.HABITS),
          idbGetAll(STORES.SCHEDULE),
          getOfflineQueue()
        ]);

        if (cachedTasks && cachedTasks.length > 0) setTasks(cachedTasks);
        if (cachedHabits && cachedHabits.length > 0) setHabits(cachedHabits);
        if (cachedSlots && cachedSlots.length > 0) setScheduleSlots(cachedSlots);
        setPendingSyncCount(queue.length);
      } catch (err) {
        console.warn('[LifeOS] Local cache read notice:', err);
      }
    };

    loadCachedLocalData();
  }, []);

  // 2. Fetch remote data, perform safe migration & setup Realtime sync whenever user changes
  useEffect(() => {
    let channel = null;
    let isCancelled = false;

    const syncWithCloud = async () => {
      if (!isSupabaseConfigured() || !supabase || !user) {
        setSyncStatus(navigator.onLine ? 'synced' : 'offline');
        return;
      }

      setSyncStatus('syncing');
      setSyncError(null);

      try {
        // Step A: Fetch remote data isolated by user_id
        const [remoteTasksRes, remoteHabitsRes, remoteSlotsRes] = await Promise.all([
          supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('habits').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
          supabase.from('schedule_slots').select('*').eq('user_id', user.id).order('slot_index', { ascending: true }),
        ]);

        if (remoteTasksRes.error) throw remoteTasksRes.error;
        if (remoteHabitsRes.error) throw remoteHabitsRes.error;
        if (remoteSlotsRes.error) throw remoteSlotsRes.error;

        const remoteTasks = remoteTasksRes.data || [];
        const remoteHabits = remoteHabitsRes.data || [];
        const remoteSlots = remoteSlotsRes.data || [];

        if (isCancelled) return;

        // Step B: Safe Migration - if user has NO remote records (new account or first sync),
        // safely upload current local tasks/habits so user data is never lost!
        if (remoteTasks.length === 0 && tasks.length > 0) {
          console.log('[LifeOS Cloud Sync] First login detected: Migrating local tasks to cloud...');
          const tasksToUpload = tasks.map(t => ({
            id: t.id,
            user_id: user.id,
            title: t.title,
            description: t.description || '',
            category: t.category || 'Deep Work',
            priority: t.priority || 'medium',
            time: t.time || '',
            slot: t.slot || '',
            completed: Boolean(t.completed),
            is_overdue: Boolean(t.isOverdue),
            date: t.date || 'Today',
            updated_at: new Date().toISOString()
          }));
          await supabase.from('tasks').upsert(tasksToUpload, { onConflict: 'id' });
        }

        if (remoteHabits.length === 0 && habits.length > 0) {
          console.log('[LifeOS Cloud Sync] Migrating local habits to cloud...');
          const habitsToUpload = habits.map(h => ({
            id: h.id,
            user_id: user.id,
            name: h.name,
            category: h.category || 'Health',
            streak: h.streak || 0,
            target: h.target || '30 min',
            time_of_day: h.timeOfDay || 'Morning',
            history: h.history || [false, false, false, false, false, false, false],
            completed_today: Boolean(h.completedToday),
            updated_at: new Date().toISOString()
          }));
          await supabase.from('habits').upsert(habitsToUpload, { onConflict: 'id' });
        }

        if (remoteSlots.length === 0 && scheduleSlots.length > 0) {
          console.log('[LifeOS Cloud Sync] Migrating local schedule slots to cloud...');
          const slotsToUpload = scheduleSlots.map((s, idx) => ({
            id: s.id || `slot-${idx}`,
            user_id: user.id,
            time: s.time,
            label: s.label,
            type: s.type || 'task',
            status: s.status || 'upcoming',
            task_id: s.taskId || null,
            is_active: Boolean(s.active),
            slot_index: idx,
            updated_at: new Date().toISOString()
          }));
          await supabase.from('schedule_slots').upsert(slotsToUpload, { onConflict: 'id' });
        }

        // Step C: Flush any offline mutations queued while disconnected
        const flushRes = await flushOfflineQueue(supabase, user.id);
        const queue = await getOfflineQueue();
        setPendingSyncCount(queue.length);

        // Step D: Re-fetch latest consolidated data
        const [finalTasks, finalHabits, finalSlots] = await Promise.all([
          supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('habits').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
          supabase.from('schedule_slots').select('*').eq('user_id', user.id).order('slot_index', { ascending: true })
        ]);

        if (!isCancelled && finalTasks.data && finalTasks.data.length > 0) {
          const formattedTasks = finalTasks.data.map(t => ({
            id: t.id,
            title: t.title,
            description: t.description,
            category: t.category,
            priority: t.priority,
            time: t.time,
            slot: t.slot,
            completed: t.completed,
            isOverdue: t.is_overdue,
            date: t.date,
          }));
          setTasks(formattedTasks);
          await idbSetAll(STORES.TASKS, formattedTasks);
        }

        if (!isCancelled && finalHabits.data && finalHabits.data.length > 0) {
          const formattedHabits = finalHabits.data.map(h => ({
            id: h.id,
            name: h.name,
            category: h.category,
            streak: h.streak,
            target: h.target,
            timeOfDay: h.time_of_day,
            history: h.history,
            completedToday: h.completed_today,
          }));
          setHabits(formattedHabits);
          await idbSetAll(STORES.HABITS, formattedHabits);
        }

        if (!isCancelled && finalSlots.data && finalSlots.data.length > 0) {
          const formattedSlots = finalSlots.data.map((s, idx) => ({
            id: s.id,
            time: s.time,
            label: s.label,
            type: s.type,
            status: s.status,
            taskId: s.task_id,
            active: s.is_active,
            index: s.slot_index ?? idx,
          }));
          setScheduleSlots(formattedSlots);
          await idbSetAll(STORES.SCHEDULE, formattedSlots);
        }

        setSyncStatus('synced');
        setLastSyncTime(new Date());
        initialLoadDone.current = true;
      } catch (err) {
        console.error('[LifeOS Cloud Sync] Sync error:', err);
        setSyncStatus('error');
        setSyncError(err.message || 'Failed connecting to Supabase cloud database.');
      }

      // Step E: Set up Realtime listener for cross-device live synchronization!
      // When a task/habit is added/updated on Phone, Laptop receives websocket event immediately!
      try {
        channel = supabase
          .channel(`lifeos-user-${user.id}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` },
            (payload) => {
              console.log('[LifeOS Realtime] Task change received:', payload.eventType);
              if (payload.eventType === 'INSERT') {
                const newTask = {
                  id: payload.new.id,
                  title: payload.new.title,
                  description: payload.new.description,
                  category: payload.new.category,
                  priority: payload.new.priority,
                  time: payload.new.time,
                  slot: payload.new.slot,
                  completed: payload.new.completed,
                  isOverdue: payload.new.is_overdue,
                  date: payload.new.date,
                };
                setTasks(prev => [newTask, ...prev.filter(t => t.id !== newTask.id)]);
                idbPut(STORES.TASKS, newTask);
              } else if (payload.eventType === 'UPDATE') {
                setTasks(prev =>
                  prev.map(t => {
                    if (t.id === payload.new.id) {
                      const updated = {
                        ...t,
                        title: payload.new.title,
                        description: payload.new.description,
                        category: payload.new.category,
                        priority: payload.new.priority,
                        completed: payload.new.completed,
                        isOverdue: payload.new.is_overdue,
                      };
                      idbPut(STORES.TASKS, updated);
                      return updated;
                    }
                    return t;
                  })
                );
              } else if (payload.eventType === 'DELETE') {
                setTasks(prev => prev.filter(t => t.id !== payload.old.id));
                idbDelete(STORES.TASKS, payload.old.id);
              }
              setLastSyncTime(new Date());
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'habits', filter: `user_id=eq.${user.id}` },
            (payload) => {
              console.log('[LifeOS Realtime] Habit change received:', payload.eventType);
              if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                const updatedHabit = {
                  id: payload.new.id,
                  name: payload.new.name,
                  category: payload.new.category,
                  streak: payload.new.streak,
                  target: payload.new.target,
                  timeOfDay: payload.new.time_of_day,
                  history: payload.new.history,
                  completedToday: payload.new.completed_today,
                };
                setHabits(prev => {
                  const exists = prev.some(h => h.id === updatedHabit.id);
                  if (exists) {
                    return prev.map(h => h.id === updatedHabit.id ? updatedHabit : h);
                  }
                  return [...prev, updatedHabit];
                });
                idbPut(STORES.HABITS, updatedHabit);
              } else if (payload.eventType === 'DELETE') {
                setHabits(prev => prev.filter(h => h.id !== payload.old.id));
                idbDelete(STORES.HABITS, payload.old.id);
              }
              setLastSyncTime(new Date());
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'schedule_slots', filter: `user_id=eq.${user.id}` },
            (payload) => {
              console.log('[LifeOS Realtime] Schedule change received:', payload.eventType);
              if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                const updatedSlot = {
                  id: payload.new.id,
                  time: payload.new.time,
                  label: payload.new.label,
                  type: payload.new.type,
                  status: payload.new.status,
                  taskId: payload.new.task_id,
                  active: payload.new.is_active,
                  index: payload.new.slot_index,
                };
                setScheduleSlots(prev => {
                  const next = [...prev];
                  const idx = payload.new.slot_index;
                  if (idx !== undefined && idx < next.length) {
                    next[idx] = { ...next[idx], ...updatedSlot };
                  }
                  return next;
                });
              }
              setLastSyncTime(new Date());
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('[LifeOS Realtime] Channel subscription warning:', err);
      }
    };

    syncWithCloud();

    return () => {
      isCancelled = true;
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [user]);

  // 3. Online/Offline network monitoring & auto-flush
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      setSyncStatus('syncing');
      if (isSupabaseConfigured() && supabase && user) {
        const res = await flushOfflineQueue(supabase, user.id);
        const queue = await getOfflineQueue();
        setPendingSyncCount(queue.length);
        setSyncStatus('synced');
        setLastSyncTime(new Date());
      } else {
        setSyncStatus('synced');
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
  };

  // Toggle task completion
  const toggleTask = async (taskId) => {
    triggerHaptic();
    let updatedTask = null;

    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const nextCompleted = !task.completed;
          updatedTask = {
            ...task,
            completed: nextCompleted,
            isOverdue: nextCompleted ? false : task.isOverdue
          };
          return updatedTask;
        }
        return task;
      })
    );

    if (updatedTask) {
      await idbPut(STORES.TASKS, updatedTask);

      if (isOnline && isSupabaseConfigured() && supabase && user) {
        setSyncStatus('syncing');
        try {
          const { error } = await supabase
            .from('tasks')
            .update({ 
              completed: updatedTask.completed, 
              is_overdue: updatedTask.isOverdue, 
              updated_at: new Date().toISOString() 
            })
            .eq('id', taskId)
            .eq('user_id', user.id);

          if (error) throw error;
          setSyncStatus('synced');
          setLastSyncTime(new Date());
        } catch {
          await enqueueMutation('TASK_TOGGLE', updatedTask);
          const queue = await getOfflineQueue();
          setPendingSyncCount(queue.length);
          setSyncStatus('offline');
        }
      } else {
        await enqueueMutation('TASK_TOGGLE', updatedTask);
        const queue = await getOfflineQueue();
        setPendingSyncCount(queue.length);
      }
    }
  };

  // Toggle habit today
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
      await idbPut(STORES.HABITS, updatedHabit);

      if (isOnline && isSupabaseConfigured() && supabase && user) {
        setSyncStatus('syncing');
        try {
          const { error } = await supabase
            .from('habits')
            .update({ 
              completed_today: updatedHabit.completedToday, 
              streak: updatedHabit.streak, 
              history: updatedHabit.history,
              updated_at: new Date().toISOString() 
            })
            .eq('id', habitId)
            .eq('user_id', user.id);

          if (error) throw error;
          setSyncStatus('synced');
          setLastSyncTime(new Date());
        } catch {
          await enqueueMutation('HABIT_TOGGLE', updatedHabit);
          const queue = await getOfflineQueue();
          setPendingSyncCount(queue.length);
        }
      } else {
        await enqueueMutation('HABIT_TOGGLE', updatedHabit);
        const queue = await getOfflineQueue();
        setPendingSyncCount(queue.length);
      }
    }
  };

  // Add task
  const addTask = async (newTask) => {
    triggerHaptic();
    const task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      completed: false,
      isOverdue: false,
      date: 'Today',
      ...newTask,
    };

    setTasks(prev => [task, ...prev]);
    await idbPut(STORES.TASKS, task);

    if (isOnline && isSupabaseConfigured() && supabase && user) {
      setSyncStatus('syncing');
      try {
        const payload = {
          id: task.id,
          user_id: user.id,
          title: task.title,
          description: task.description || '',
          category: task.category || 'Deep Work',
          priority: task.priority || 'medium',
          time: task.time || '',
          slot: task.slot || '',
          completed: false,
          is_overdue: false,
          date: task.date || 'Today',
          updated_at: new Date().toISOString(),
        };
        const { error } = await supabase.from('tasks').insert(payload);
        if (error) throw error;
        setSyncStatus('synced');
        setLastSyncTime(new Date());
      } catch {
        await enqueueMutation('TASK_CREATE', task);
        const queue = await getOfflineQueue();
        setPendingSyncCount(queue.length);
      }
    } else {
      await enqueueMutation('TASK_CREATE', task);
      const queue = await getOfflineQueue();
      setPendingSyncCount(queue.length);
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    triggerHaptic();
    setTasks(prev => prev.filter(t => t.id !== taskId));
    await idbDelete(STORES.TASKS, taskId);

    if (isOnline && isSupabaseConfigured() && supabase && user) {
      setSyncStatus('syncing');
      try {
        const { error } = await supabase.from('tasks').delete().eq('id', taskId).eq('user_id', user.id);
        if (error) throw error;
        setSyncStatus('synced');
        setLastSyncTime(new Date());
      } catch {
        await enqueueMutation('TASK_DELETE', { id: taskId });
        const queue = await getOfflineQueue();
        setPendingSyncCount(queue.length);
      }
    } else {
      await enqueueMutation('TASK_DELETE', { id: taskId });
      const queue = await getOfflineQueue();
      setPendingSyncCount(queue.length);
    }
  };

  // Add habit
  const addHabit = async (newHabit) => {
    triggerHaptic();
    const habit = {
      id: `habit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      streak: 0,
      completedToday: false,
      history: [false, false, false, false, false, false, false],
      ...newHabit,
    };

    setHabits(prev => [...prev, habit]);
    await idbPut(STORES.HABITS, habit);

    if (isOnline && isSupabaseConfigured() && supabase && user) {
      setSyncStatus('syncing');
      try {
        const habitPayload = {
          id: habit.id,
          user_id: user.id,
          name: habit.name,
          category: habit.category || 'Health',
          streak: 0,
          target: habit.target || '30 min',
          time_of_day: habit.timeOfDay || 'Morning',
          history: [false, false, false, false, false, false, false],
          completed_today: false,
          updated_at: new Date().toISOString()
        };
        const { error } = await supabase.from('habits').insert(habitPayload);
        if (error) throw error;
        setSyncStatus('synced');
        setLastSyncTime(new Date());
      } catch {
        await enqueueMutation('HABIT_CREATE', habit);
        const queue = await getOfflineQueue();
        setPendingSyncCount(queue.length);
      }
    } else {
      await enqueueMutation('HABIT_CREATE', habit);
      const queue = await getOfflineQueue();
      setPendingSyncCount(queue.length);
    }
  };

  // Update schedule slot
  const updateScheduleSlot = async (slotIndex, updatedData) => {
    triggerHaptic();
    let slotObj = null;

    setScheduleSlots(prev => {
      const next = [...prev];
      next[slotIndex] = { ...next[slotIndex], ...updatedData };
      slotObj = next[slotIndex];
      return next;
    });

    if (slotObj) {
      const slotPayload = {
        id: slotObj.id || `slot-${slotIndex}`,
        index: slotIndex,
        ...slotObj,
      };

      await idbPut(STORES.SCHEDULE, slotPayload);

      if (isOnline && isSupabaseConfigured() && supabase && user) {
        setSyncStatus('syncing');
        try {
          const { error } = await supabase.from('schedule_slots').upsert({
            id: slotPayload.id,
            user_id: user.id,
            time: slotPayload.time,
            label: slotPayload.label,
            type: slotPayload.type || 'task',
            status: slotPayload.status || 'upcoming',
            task_id: slotPayload.taskId || null,
            is_active: Boolean(slotPayload.active),
            slot_index: slotIndex,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });

          if (error) throw error;
          setSyncStatus('synced');
          setLastSyncTime(new Date());
        } catch {
          await enqueueMutation('SCHEDULE_EDIT', slotPayload);
          const queue = await getOfflineQueue();
          setPendingSyncCount(queue.length);
        }
      } else {
        await enqueueMutation('SCHEDULE_EDIT', slotPayload);
        const queue = await getOfflineQueue();
        setPendingSyncCount(queue.length);
      }
    }
  };

  // Manual Cloud Sync trigger
  const triggerSync = async () => {
    if (!isOnline) return;
    setSyncStatus('syncing');
    setSyncError(null);

    try {
      if (isSupabaseConfigured() && supabase && user) {
        await flushOfflineQueue(supabase, user.id);
        const queue = await getOfflineQueue();
        setPendingSyncCount(queue.length);
        setSyncStatus('synced');
        setLastSyncTime(new Date());
      } else {
        setTimeout(() => setSyncStatus('synced'), 400);
      }
    } catch (err) {
      setSyncStatus('error');
      setSyncError(err.message || 'Sync error occurred.');
    }
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
        syncStatus,
        syncError,
        lastSyncTime,
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
