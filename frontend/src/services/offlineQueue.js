import { idbGetAll, idbSetAll, STORES } from './indexedDb';

const QUEUE_STORAGE_KEY = 'lifeos_offline_mutations_v2';

export const getOfflineQueue = async () => {
  try {
    const fromIdb = await idbGetAll(STORES.MUTATIONS);
    if (fromIdb && fromIdb.length > 0) return fromIdb;
  } catch (e) {
    // fallback
  }

  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveOfflineQueue = async (queue) => {
  try {
    await idbSetAll(STORES.MUTATIONS, queue);
  } catch (e) {
    // fallback
  }
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('Failed saving offline queue:', e);
  }
};

export const enqueueMutation = async (type, payload) => {
  const queue = await getOfflineQueue();
  // Deduplicate mutations for the same entity id
  const filtered = queue.filter(
    (m) => !(m.payload.id && m.payload.id === payload.id && m.type === type)
  );

  const mutation = {
    id: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type,
    payload,
    timestamp: new Date().toISOString(),
  };

  filtered.push(mutation);
  await saveOfflineQueue(filtered);
  return mutation;
};

export const clearOfflineQueue = async () => {
  await saveOfflineQueue([]);
};

export const flushOfflineQueue = async (supabase, userId) => {
  if (!supabase || !userId) return { success: false, count: 0 };
  const queue = await getOfflineQueue();
  if (queue.length === 0) return { success: true, count: 0 };

  console.log(`[LifeOS Cloud Sync] Flushing ${queue.length} pending mutations...`);
  let flushedCount = 0;

  for (const item of queue) {
    try {
      const { type, payload } = item;

      if (type === 'TASK_UPSERT' || type === 'TASK_TOGGLE' || type === 'TASK_CREATE') {
        const taskPayload = {
          id: payload.id,
          user_id: userId,
          title: payload.title,
          description: payload.description || '',
          category: payload.category || 'Deep Work',
          priority: payload.priority || 'medium',
          time: payload.time || '',
          slot: payload.slot || '',
          completed: Boolean(payload.completed),
          is_overdue: Boolean(payload.is_overdue),
          date: payload.date || 'Today',
          updated_at: new Date().toISOString(),
        };
        const { error } = await supabase.from('tasks').upsert(taskPayload, { onConflict: 'id' });
        if (error) throw error;
      } else if (type === 'TASK_DELETE') {
        const { error } = await supabase.from('tasks').delete().eq('id', payload.id).eq('user_id', userId);
        if (error) throw error;
      } else if (type === 'HABIT_UPSERT' || type === 'HABIT_TOGGLE' || type === 'HABIT_CREATE') {
        const habitPayload = {
          id: payload.id,
          user_id: userId,
          name: payload.name,
          category: payload.category || 'Health',
          streak: payload.streak || 0,
          target: payload.target || '30 min',
          time_of_day: payload.timeOfDay || payload.time_of_day || 'Morning',
          history: payload.history || [false, false, false, false, false, false, false],
          completed_today: Boolean(payload.completedToday ?? payload.completed_today),
          updated_at: new Date().toISOString(),
        };
        const { error } = await supabase.from('habits').upsert(habitPayload, { onConflict: 'id' });
        if (error) throw error;
      } else if (type === 'HABIT_DELETE') {
        const { error } = await supabase.from('habits').delete().eq('id', payload.id).eq('user_id', userId);
        if (error) throw error;
      } else if (type === 'SCHEDULE_EDIT' || type === 'SCHEDULE_UPSERT') {
        const slotPayload = {
          id: payload.id || `slot-${payload.index}`,
          user_id: userId,
          time: payload.time,
          label: payload.label,
          type: payload.type || 'task',
          status: payload.status || 'upcoming',
          task_id: payload.taskId || payload.task_id || null,
          is_active: Boolean(payload.active ?? payload.is_active),
          slot_index: payload.index ?? 0,
          updated_at: new Date().toISOString(),
        };
        const { error } = await supabase.from('schedule_slots').upsert(slotPayload, { onConflict: 'id' });
        if (error) throw error;
      }

      flushedCount++;
    } catch (err) {
      console.warn('[LifeOS Cloud Sync] Sync failed for mutation:', item, err);
      break;
    }
  }

  const remaining = queue.slice(flushedCount);
  await saveOfflineQueue(remaining);

  return { success: true, count: flushedCount, remaining: remaining.length };
};
