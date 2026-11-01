const QUEUE_STORAGE_KEY = 'lifeos_offline_mutations_v1';

export const getOfflineQueue = () => {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed reading offline queue:', e);
    return [];
  }
};

export const saveOfflineQueue = (queue) => {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('Failed saving offline queue:', e);
  }
};

export const enqueueMutation = (type, payload) => {
  const queue = getOfflineQueue();
  const mutation = {
    id: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type,
    payload,
    timestamp: new Date().toISOString(),
  };
  queue.push(mutation);
  saveOfflineQueue(queue);
  return mutation;
};

export const clearOfflineQueue = () => {
  localStorage.removeItem(QUEUE_STORAGE_KEY);
};

export const flushOfflineQueue = async (supabase, userId) => {
  if (!supabase || !userId) return { success: false, count: 0 };
  const queue = getOfflineQueue();
  if (queue.length === 0) return { success: true, count: 0 };

  console.log(`[LifeOS Offline Sync] Flushing ${queue.length} pending mutations to Supabase...`);
  let flushedCount = 0;

  for (const item of queue) {
    try {
      const { type, payload } = item;

      if (type === 'TASK_TOGGLE') {
        await supabase
          .from('tasks')
          .update({ completed: payload.completed, is_overdue: payload.is_overdue, updated_at: new Date().toISOString() })
          .eq('id', payload.id);
      } else if (type === 'TASK_CREATE') {
        await supabase
          .from('tasks')
          .insert({ ...payload, user_id: userId });
      } else if (type === 'TASK_DELETE') {
        await supabase
          .from('tasks')
          .delete()
          .eq('id', payload.id);
      } else if (type === 'HABIT_TOGGLE') {
        await supabase
          .from('habits')
          .update({ 
            completed_today: payload.completedToday, 
            streak: payload.streak, 
            history: payload.history, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', payload.id);
      } else if (type === 'SCHEDULE_EDIT') {
        await supabase
          .from('schedule_slots')
          .upsert({ ...payload, user_id: userId, updated_at: new Date().toISOString() });
      }

      flushedCount++;
    } catch (err) {
      console.warn('[LifeOS Offline Sync] Failed syncing mutation:', item, err);
      // Keep remaining in queue if critical network error
      break;
    }
  }

  // Remove processed items
  const remaining = queue.slice(flushedCount);
  saveOfflineQueue(remaining);

  return { success: true, count: flushedCount, remaining: remaining.length };
};

