/**
 * Native IndexedDB Service for LifeOS Daily Planner
 * Provides persistent offline storage across restarts and mobile PWA sessions
 */

const DB_NAME = 'LifeOS_DB_v2';
const DB_VERSION = 1;

const STORES = {
  TASKS: 'tasks',
  HABITS: 'habits',
  SCHEDULE: 'schedule',
  MUTATIONS: 'mutations',
  META: 'meta',
};

const openDB = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORES.TASKS)) {
        db.createObjectStore(STORES.TASKS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.HABITS)) {
        db.createObjectStore(STORES.HABITS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.SCHEDULE)) {
        db.createObjectStore(STORES.SCHEDULE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.MUTATIONS)) {
        db.createObjectStore(STORES.MUTATIONS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.META)) {
        db.createObjectStore(STORES.META, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const idbGetAll = async (storeName) => {
  try {
    const db = await openDB();
    if (!db) return null;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`[IDB] Error reading from ${storeName}:`, err);
    return null;
  }
};

export const idbSetAll = async (storeName, items) => {
  try {
    const db = await openDB();
    if (!db) return;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.clear();
      items.forEach((item) => store.put(item));
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn(`[IDB] Error writing to ${storeName}:`, err);
  }
};

export const idbPut = async (storeName, item) => {
  try {
    const db = await openDB();
    if (!db) return;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.put(item);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn(`[IDB] Error putting item in ${storeName}:`, err);
  }
};

export const idbDelete = async (storeName, id) => {
  try {
    const db = await openDB();
    if (!db) return;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn(`[IDB] Error deleting item from ${storeName}:`, err);
  }
};

export { STORES };

